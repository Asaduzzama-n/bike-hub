import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { Collections, ValidationSchemas, ModelHelpers } from '@/lib/models/admin';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// Admin verification function
async function verifyAdmin(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('adminToken')?.value || cookieStore.get('admin_token')?.value;

    if (!token) {
      return { success: false, error: 'Admin authentication required', status: 401 };
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');
    const { payload } = await jwtVerify(token, secret);
    
    if (payload.role !== 'admin') {
      return { success: false, error: 'Admin access required', status: 403 };
    }

    return { success: true, admin: payload };
  } catch (error) {
    return { success: false, error: 'Invalid admin token', status: 401 };
  }
}

// Validate sell record data
function validateSellRecordData(data: any, isUpdate = false) {
  const errors: string[] = [];
  const schema = ValidationSchemas.createSellRecord;

  Object.entries(schema).forEach(([field, rules]) => {
    const value = data[field];
    
    if (rules.required && !isUpdate && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      return;
    }

    if (value !== undefined && value !== null && value !== '') {
      if (rules.type === 'number' && (isNaN(value) || typeof value !== 'number')) {
        errors.push(`${field} must be a valid number`);
      }
      
      if (rules.type === 'string' && typeof value !== 'string') {
        errors.push(`${field} must be a string`);
      }
      
      if (rules.minLength && value.length < rules.minLength) {
        errors.push(`${field} must be at least ${rules.minLength} characters`);
      }
      
      if (rules.min && value < rules.min) {
        errors.push(`${field} must be at least ${rules.min}`);
      }
      
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
      }
    }
  });

  return errors;
}

// GET - Fetch all sell records with filtering and pagination (Admin only)
export async function GET(request: NextRequest) {
  try {
    const adminAuth = await verifyAdmin(request);
    if (!adminAuth.success) {
      return NextResponse.json(
        { success: false, error: adminAuth.error },
        { status: adminAuth.status }
      );
    }
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const paymentMethod = searchParams.get('paymentMethod') || '';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const minProfit = searchParams.get('minProfit');
    const maxProfit = searchParams.get('maxProfit');
    const sortBy = searchParams.get('sortBy') || 'saleDate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const includeBikeDetails = searchParams.get('includeBikeDetails') === 'true';
    const hasDueAmount = searchParams.get('hasDueAmount');

    const { db } = await connectToDatabase();
    const sellRecordsCollection = db.collection(Collections.SELL_RECORDS);

    // Build filter query
    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { 'buyerInfo.name': { $regex: search, $options: 'i' } },
        { 'buyerInfo.phone': { $regex: search, $options: 'i' } },
        { 'buyerInfo.email': { $regex: search, $options: 'i' } },
        { 'bikeDetails.brand': { $regex: search, $options: 'i' } },
        { 'bikeDetails.model': { $regex: search, $options: 'i' } }
      ];
    }

    if (paymentMethod) {
      filter.paymentMethod = paymentMethod;
    }

    if (startDate || endDate) {
      filter.saleDate = {};
      if (startDate) filter.saleDate.$gte = new Date(startDate);
      if (endDate) filter.saleDate.$lte = new Date(endDate);
    }

    if (minProfit || maxProfit) {
      filter.profit = {};
      if (minProfit) filter.profit.$gte = parseFloat(minProfit);
      if (maxProfit) filter.profit.$lte = parseFloat(maxProfit);
    }

    if (hasDueAmount === 'true') {
      filter.dueAmount = { $gt: 0 };
    } else if (hasDueAmount === 'false') {
      filter.$or = [
        { dueAmount: { $exists: false } },
        { dueAmount: 0 }
      ];
    }

    // Count total documents
    const total = await sellRecordsCollection.countDocuments(filter);

    // Build aggregation pipeline
    const pipeline: any[] = [
      { $match: filter },
      { $sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit }
    ];

    // Include bike details if requested
    if (includeBikeDetails) {
      pipeline.push({
        $lookup: {
          from: Collections.BIKES,
          localField: 'bikeId',
          foreignField: '_id',
          as: 'bikeInfo'
        }
      });
      pipeline.push({
        $addFields: {
          bikeInfo: { $arrayElemAt: ['$bikeInfo', 0] }
        }
      });
    }

    const sellRecords = await sellRecordsCollection.aggregate(pipeline).toArray();

    // Calculate metrics
    const metrics = await sellRecordsCollection.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$sellingPrice' },
          totalProfit: { $sum: '$profit' },
          totalDueAmount: { $sum: { $ifNull: ['$dueAmount', 0] } },
          averageProfit: { $avg: '$profit' },
          averageSalePrice: { $avg: '$sellingPrice' }
        }
      }
    ]).toArray();

    const metricsData = metrics[0] || {
      totalSales: 0,
      totalRevenue: 0,
      totalProfit: 0,
      totalDueAmount: 0,
      averageProfit: 0,
      averageSalePrice: 0
    };

    // Payment method breakdown
    const paymentBreakdown = await sellRecordsCollection.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalAmount: { $sum: '$sellingPrice' }
        }
      }
    ]).toArray();

    return NextResponse.json({
      success: true,
      data: {
        sellRecords,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        metrics: {
          ...metricsData,
          paymentBreakdown
        }
      }
    });
  } catch (error) {
    console.error('Error fetching sell records:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sell records' },
      { status: 500 }
    );
  }
}

// POST - Create new sell record (Admin only)
export async function POST(request: NextRequest) {
  try {
    const adminAuth = await verifyAdmin(request);
    if (!adminAuth.success) {
      return NextResponse.json(
        { success: false, error: adminAuth.error },
        { status: adminAuth.status }
      );
    }

    const body = await request.json();
    const {
      bikeId,
      sellingPrice,
      buyerInfo,
      paymentMethod,
      dueAmount,
      dueReason,
      saleDate,
      notes
    } = body;

    // Validate input data
    const validationErrors = validateSellRecordData(body);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(bikeId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid bike ID' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const sellRecordsCollection = db.collection(Collections.SELL_RECORDS);
    const bikesCollection = db.collection(Collections.BIKES);
    const partnersCollection = db.collection(Collections.PARTNERS);

    // Start transaction for data consistency
    const session = db.client.startSession();
    
    try {
      await session.withTransaction(async () => {
        // Get bike details
        const bike = await bikesCollection.findOne(
          { _id: new ObjectId(bikeId) },
          { session }
        );

        if (!bike) {
          throw new Error('Bike not found');
        }

        if (bike.status === 'sold') {
          throw new Error('Bike is already sold');
        }

        // Check if sell record already exists for this bike
        const existingSellRecord = await sellRecordsCollection.findOne(
          { bikeId: new ObjectId(bikeId) },
          { session }
        );

        if (existingSellRecord) {
          throw new Error('Sell record already exists for this bike');
        }

        // Calculate profit
        const totalRepairCosts = (bike.repairs || []).reduce((sum: number, repair: any) => sum + (repair.cost || 0), 0);
        const profit = sellingPrice - bike.buyPrice - totalRepairCosts;

        // Create sell record
        const newSellRecord = {
          bikeId: new ObjectId(bikeId),
          bikeDetails: {
            brand: bike.brand,
            model: bike.model,
            year: bike.year,
            cc: bike.cc,
            buyPrice: bike.buyPrice,
            totalRepairCosts
          },
          sellingPrice: parseFloat(sellingPrice),
          profit,
          buyerInfo: {
            name: buyerInfo.name.trim(),
            phone: buyerInfo.phone.trim(),
            email: buyerInfo.email?.trim() || '',
            address: buyerInfo.address?.trim() || ''
          },
          paymentMethod,
          dueAmount: parseFloat(dueAmount || 0),
          dueReason: dueReason?.trim() || '',
          saleDate: new Date(saleDate || Date.now()),
          notes: notes?.trim() || '',
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: adminAuth.admin.email
        };

        const sellResult = await sellRecordsCollection.insertOne(newSellRecord, { session });

        // Update bike status to sold
        await bikesCollection.updateOne(
          { _id: new ObjectId(bikeId) },
          {
            $set: {
              status: 'sold',
              soldDate: new Date(saleDate || Date.now()),
              soldPrice: parseFloat(sellingPrice),
              updatedAt: new Date(),
              updatedBy: adminAuth.admin.email
            }
          },
          { session }
        );

        // Update partner investments with profit distribution
        if (bike.partnerInvestments && bike.partnerInvestments.length > 0) {
          for (const investment of bike.partnerInvestments) {
            const partnerProfit = (profit * investment.percentage) / 100;
            
            await partnersCollection.updateOne(
              { _id: investment.partnerId },
              {
                $inc: {
                  totalProfit: partnerProfit,
                  activeInvestments: -investment.amount
                },
                $set: {
                  'investments.$[elem].status': 'completed',
                  'investments.$[elem].completedDate': new Date(),
                  'investments.$[elem].profit': partnerProfit,
                  updatedAt: new Date()
                }
              },
              {
                arrayFilters: [{ 'elem.bikeId': new ObjectId(bikeId) }],
                session
              }
            );
          }
        }

        return {
          sellRecordId: sellResult.insertedId,
          profit,
          bikeId
        };
      });

      return NextResponse.json({
        success: true,
        message: 'Sell record created successfully',
        data: {
          sellRecordId: session.id,
          profit,
          bikeStatus: 'sold'
        }
      }, { status: 201 });
    } finally {
      await session.endSession();
    }
  } catch (error) {
    console.error('Error creating sell record:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create sell record' },
      { status: 500 }
    );
  }
}

// PUT - Update sell record (Admin only)
export async function PUT(request: NextRequest) {
  try {
    const adminAuth = await verifyAdmin(request);
    if (!adminAuth.success) {
      return NextResponse.json(
        { success: false, error: adminAuth.error },
        { status: adminAuth.status }
      );
    }

    const body = await request.json();
    const { sellRecordId, ...updateData } = body;

    if (!sellRecordId) {
      return NextResponse.json(
        { success: false, error: 'Sell record ID is required' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(sellRecordId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid sell record ID' },
        { status: 400 }
      );
    }

    // Validate update data
    const validationErrors = validateSellRecordData(updateData, true);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const sellRecordsCollection = db.collection(Collections.SELL_RECORDS);
    const bikesCollection = db.collection(Collections.BIKES);
    const partnersCollection = db.collection(Collections.PARTNERS);

    // Get existing sell record
    const existingSellRecord = await sellRecordsCollection.findOne({ _id: new ObjectId(sellRecordId) });
    if (!existingSellRecord) {
      return NextResponse.json(
        { success: false, error: 'Sell record not found' },
        { status: 404 }
      );
    }

    const session = db.client.startSession();
    
    try {
      await session.withTransaction(async () => {
        // If selling price changed, recalculate profit and update partner profits
        if (updateData.sellingPrice && updateData.sellingPrice !== existingSellRecord.sellingPrice) {
          const bike = await bikesCollection.findOne(
            { _id: existingSellRecord.bikeId },
            { session }
          );

          if (bike) {
            const totalRepairCosts = (bike.repairs || []).reduce((sum: number, repair: any) => sum + (repair.cost || 0), 0);
            const newProfit = updateData.sellingPrice - bike.buyPrice - totalRepairCosts;
            const oldProfit = existingSellRecord.profit;
            const profitDifference = newProfit - oldProfit;

            updateData.profit = newProfit;

            // Update bike sold price
            await bikesCollection.updateOne(
              { _id: existingSellRecord.bikeId },
              {
                $set: {
                  soldPrice: parseFloat(updateData.sellingPrice),
                  updatedAt: new Date(),
                  updatedBy: adminAuth.admin.email
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

        updateData.updatedAt = new Date();
        updateData.updatedBy = adminAuth.admin.email;

        // Update sell record
        await sellRecordsCollection.updateOne(
          { _id: new ObjectId(sellRecordId) },
          { $set: updateData },
          { session }
        );
      });

      return NextResponse.json({
        success: true,
        message: 'Sell record updated successfully',
        data: {
          sellRecordId
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

// DELETE - Delete sell record (and revert bike status) (Admin only)
export async function DELETE(request: NextRequest) {
  try {
    const adminAuth = await verifyAdmin(request);
    if (!adminAuth.success) {
      return NextResponse.json(
        { success: false, error: adminAuth.error },
        { status: adminAuth.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const sellRecordId = searchParams.get('id');

    if (!sellRecordId) {
      return NextResponse.json(
        { success: false, error: 'Sell record ID is required' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(sellRecordId)) {
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
    const sellRecord = await sellRecordsCollection.findOne({ _id: new ObjectId(sellRecordId) });
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
                updatedBy: adminAuth.payload.email
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
          { _id: new ObjectId(sellRecordId) },
          { session }
        );
      });

      return NextResponse.json({
        success: true,
        message: 'Sell record deleted and bike status reverted successfully',
        data: {
          sellRecordId,
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