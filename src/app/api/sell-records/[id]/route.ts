import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { Collections } from '@/lib/models/admin';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// Verify admin authentication
async function verifyAdmin(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('adminToken')?.value;

    if (!token) {
      return null;
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}

// GET - Fetch single sell record by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid sell record ID' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const sellRecordsCollection = db.collection(Collections.SELL_RECORDS);

    // Use aggregation to include bike and partner details
    const pipeline = [
      { $match: { _id: new ObjectId(id) } },
      {
        $lookup: {
          from: Collections.BIKES,
          localField: 'bikeId',
          foreignField: '_id',
          as: 'bikeInfo'
        }
      },
      {
        $lookup: {
          from: Collections.PARTNERS,
          localField: 'bikeInfo.partnerInvestments.partnerId',
          foreignField: '_id',
          as: 'partnerDetails'
        }
      },
      {
        $addFields: {
          bikeInfo: { $arrayElemAt: ['$bikeInfo', 0] }
        }
      }
    ];

    const result = await sellRecordsCollection.aggregate(pipeline).toArray();
    const sellRecord = result[0];

    if (!sellRecord) {
      return NextResponse.json(
        { success: false, error: 'Sell record not found' },
        { status: 404 }
      );
    }

    // Calculate additional metrics
    const profitMargin = sellRecord.sellingPrice > 0 
      ? ((sellRecord.profit / sellRecord.sellingPrice) * 100).toFixed(2)
      : 0;
    
    const daysSinceSale = sellRecord.saleDate 
      ? Math.floor((Date.now() - new Date(sellRecord.saleDate).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    const enrichedSellRecord = {
      ...sellRecord,
      metrics: {
        profitMargin: parseFloat(profitMargin),
        daysSinceSale,
        isPaid: !sellRecord.dueAmount || sellRecord.dueAmount === 0,
        totalCost: sellRecord.bikeDetails?.buyPrice + (sellRecord.bikeDetails?.totalRepairCosts || 0)
      }
    };

    return NextResponse.json({
      success: true,
      data: enrichedSellRecord
    });
  } catch (error) {
    console.error('Error fetching sell record:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sell record' },
      { status: 500 }
    );
  }
}

// PUT - Update specific sell record
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid sell record ID' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const sellRecordsCollection = db.collection(Collections.SELL_RECORDS);
    const bikesCollection = db.collection(Collections.BIKES);
    const partnersCollection = db.collection(Collections.PARTNERS);

    // Get existing sell record
    const existingSellRecord = await sellRecordsCollection.findOne({ _id: new ObjectId(id) });
    if (!existingSellRecord) {
      return NextResponse.json(
        { success: false, error: 'Sell record not found' },
        { status: 404 }
      );
    }

    const session = db.client.startSession();
    
    try {
      await session.withTransaction(async () => {
        // If selling price changed, recalculate profit and update related data
        if (body.sellingPrice && body.sellingPrice !== existingSellRecord.sellingPrice) {
          const bike = await bikesCollection.findOne(
            { _id: existingSellRecord.bikeId },
            { session }
          );

          if (bike) {
            const totalRepairCosts = (bike.repairs || []).reduce((sum: number, repair: any) => sum + (repair.cost || 0), 0);
            const newProfit = body.sellingPrice - bike.buyPrice - totalRepairCosts;
            const oldProfit = existingSellRecord.profit;
            const profitDifference = newProfit - oldProfit;

            body.profit = newProfit;

            // Update bike sold price
            await bikesCollection.updateOne(
              { _id: existingSellRecord.bikeId },
              {
                $set: {
                  soldPrice: parseFloat(body.sellingPrice),
                  updatedAt: new Date(),
                  updatedBy: admin.email
                }
              },
              { session }
            );

            // Update partner profits if there are partner investments
            if (bike.partnerInvestments && bike.partnerInvestments.length > 0) {
              for (const investment of bike.partnerInvestments) {
                const partnerProfitDifference = (profitDifference * investment.percentage) / 100;
                
                await partnersCollection.updateOne(
                  { _id: investment.partnerId },
                  {
                    $inc: {
                      totalProfit: partnerProfitDifference
                    },
                    $set: {
                      'investments.$[elem].profit': (newProfit * investment.percentage) / 100,
                      updatedAt: new Date()
                    }
                  },
                  {
                    arrayFilters: [{ 'elem.bikeId': existingSellRecord.bikeId }],
                    session
                  }
                );
              }
            }
          }
        }

        // Update buyer info if provided
        if (body.buyerInfo) {
          body.buyerInfo = {
            name: body.buyerInfo.name?.trim() || existingSellRecord.buyerInfo.name,
            phone: body.buyerInfo.phone?.trim() || existingSellRecord.buyerInfo.phone,
            email: body.buyerInfo.email?.trim() || existingSellRecord.buyerInfo.email || '',
            address: body.buyerInfo.address?.trim() || existingSellRecord.buyerInfo.address || ''
          };
        }

        body.updatedAt = new Date();
        body.updatedBy = admin.email;

        // Update sell record
        await sellRecordsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: body },
          { session }
        );
      });

      return NextResponse.json({
        success: true,
        message: 'Sell record updated successfully',
        data: {
          sellRecordId: id
        }
      });
    } finally {
      await session.endSession();
    }
  } catch (error) {
    console.error('Error updating sell record:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update sell record' },
      { status: 500 }
    );
  }
}

// DELETE - Delete specific sell record
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid sell record ID' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const sellRecordsCollection = db.collection(Collections.SELL_RECORDS);
    const bikesCollection = db.collection(Collections.BIKES);
    const partnersCollection = db.collection(Collections.PARTNERS);

    // Get sell record details before deletion
    const sellRecord = await sellRecordsCollection.findOne({ _id: new ObjectId(id) });
    if (!sellRecord) {
      return NextResponse.json(
        { success: false, error: 'Sell record not found' },
        { status: 404 }
      );
    }

    const session = db.client.startSession();
    
    try {
      await session.withTransaction(async () => {
        // Get bike details
        const bike = await bikesCollection.findOne(
          { _id: sellRecord.bikeId },
          { session }
        );

        if (bike) {
          // Revert bike status to available
          await bikesCollection.updateOne(
            { _id: sellRecord.bikeId },
            {
              $set: {
                status: 'available',
                updatedAt: new Date(),
                updatedBy: admin.email
              },
              $unset: {
                soldDate: '',
                soldPrice: ''
              }
            },
            { session }
          );

          // Revert partner investments
          if (bike.partnerInvestments && bike.partnerInvestments.length > 0) {
            for (const investment of bike.partnerInvestments) {
              const partnerProfit = (sellRecord.profit * investment.percentage) / 100;
              
              await partnersCollection.updateOne(
                { _id: investment.partnerId },
                {
                  $inc: {
                    totalProfit: -partnerProfit,
                    activeInvestments: investment.amount
                  },
                  $set: {
                    'investments.$[elem].status': 'active',
                    updatedAt: new Date()
                  },
                  $unset: {
                    'investments.$[elem].completedDate': '',
                    'investments.$[elem].profit': ''
                  }
                },
                {
                  arrayFilters: [{ 'elem.bikeId': sellRecord.bikeId }],
                  session
                }
              );
            }
          }
        }

        // Delete sell record
        await sellRecordsCollection.deleteOne(
          { _id: new ObjectId(id) },
          { session }
        );
      });

      return NextResponse.json({
        success: true,
        message: 'Sell record deleted and bike status reverted successfully',
        data: {
          sellRecordId: id,
          bikeId: sellRecord.bikeId,
          bikeStatus: 'available'
        }
      });
    } finally {
      await session.endSession();
    }
  } catch (error) {
    console.error('Error deleting sell record:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete sell record' },
      { status: 500 }
    );
  }
}

// PATCH - Update payment status or due amount
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { action, amount, reason } = body;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid sell record ID' },
        { status: 400 }
      );
    }

    if (!action || !['pay_due', 'update_due', 'mark_paid'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Valid action is required (pay_due, update_due, mark_paid)' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const sellRecordsCollection = db.collection(Collections.SELL_RECORDS);

    // Get existing sell record
    const existingSellRecord = await sellRecordsCollection.findOne({ _id: new ObjectId(id) });
    if (!existingSellRecord) {
      return NextResponse.json(
        { success: false, error: 'Sell record not found' },
        { status: 404 }
      );
    }

    let updateData: any = {
      updatedAt: new Date(),
      updatedBy: admin.email
    };

    switch (action) {
      case 'pay_due':
        if (!amount || amount <= 0) {
          return NextResponse.json(
            { success: false, error: 'Valid payment amount is required' },
            { status: 400 }
          );
        }
        
        const newDueAmount = Math.max(0, (existingSellRecord.dueAmount || 0) - amount);
        updateData.dueAmount = newDueAmount;
        
        if (newDueAmount === 0) {
          updateData.dueReason = '';
          updateData.paidDate = new Date();
        }
        
        // Add payment record
        updateData.$push = {
          paymentHistory: {
            amount: parseFloat(amount),
            date: new Date(),
            reason: reason || 'Due payment',
            processedBy: admin.email
          }
        };
        break;

      case 'update_due':
        if (amount === undefined || amount < 0) {
          return NextResponse.json(
            { success: false, error: 'Valid due amount is required' },
            { status: 400 }
          );
        }
        
        updateData.dueAmount = parseFloat(amount);
        updateData.dueReason = reason || existingSellRecord.dueReason || '';
        
        if (amount === 0) {
          updateData.dueReason = '';
          updateData.paidDate = new Date();
        }
        break;

      case 'mark_paid':
        updateData.dueAmount = 0;
        updateData.dueReason = '';
        updateData.paidDate = new Date();
        break;
    }

    const result = await sellRecordsCollection.updateOne(
      { _id: new ObjectId(id) },
      action === 'pay_due' ? updateData : { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Sell record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Payment status updated successfully`,
      data: {
        sellRecordId: id,
        action,
        newDueAmount: updateData.dueAmount,
        isPaid: updateData.dueAmount === 0
      }
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update payment status' },
      { status: 500 }
    );
  }
}