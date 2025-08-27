import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { Collections, ModelHelpers } from '@/lib/models/admin';
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

// GET - Public route to fetch single bike by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid bike ID' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const bikesCollection = db.collection(Collections.BIKES);

    // Simple aggregation for public access (no sensitive data)
    const pipeline = [
      { $match: { _id: new ObjectId(id) } },
      {
        $lookup: {
          from: Collections.REVIEWS,
          localField: '_id',
          foreignField: 'bikeId',
          as: 'reviews'
        }
      },
      {
        $addFields: {
          averageRating: {
            $cond: {
              if: { $gt: [{ $size: '$reviews' }, 0] },
              then: { $avg: '$reviews.rating' },
              else: 0
            }
          },
          totalReviews: { $size: '$reviews' }
        }
      },
      {
        $project: {
          brand: 1,
          model: 1,
          year: 1,
          cc: 1,
          mileage: 1,
          sellPrice: 1,
          description: 1,
          images: 1,
          condition: 1,
          freeWash: 1,
          status: 1,
          averageRating: 1,
          totalReviews: 1,
          reviews: {
            $map: {
              input: '$reviews',
              as: 'review',
              in: {
                rating: '$$review.rating',
                comment: '$$review.comment',
                createdAt: '$$review.createdAt'
              }
            }
          },
          createdAt: 1
        }
      }
    ];

    const result = await bikesCollection.aggregate(pipeline).toArray();
    const bike = result[0];

    if (!bike) {
      return NextResponse.json(
        { success: false, error: 'Bike not found' },
        { status: 404 }
      );
    }

    const enrichedBike = bike;

    return NextResponse.json({
      success: true,
      data: enrichedBike
    });
  } catch (error) {
    console.error('Error fetching bike:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bike' },
      { status: 500 }
    );
  }
}

// PUT - Update specific bike
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminAuth = await verifyAdmin(request);
    if (!adminAuth.success) {
      return NextResponse.json(
        { success: false, error: adminAuth.error },
        { status: adminAuth.status }
      );
    }
    const admin = adminAuth.admin;

    const { id } = params;
    const body = await request.json();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid bike ID' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const bikesCollection = db.collection(Collections.BIKES);
    const partnersCollection = db.collection(Collections.PARTNERS);

    // Get existing bike
    const existingBike = await bikesCollection.findOne({ _id: new ObjectId(id) });
    if (!existingBike) {
      return NextResponse.json(
        { success: false, error: 'Bike not found' },
        { status: 404 }
      );
    }

    // Prevent updating sold bikes unless changing status
    if (existingBike.status === 'sold' && body.status !== 'sold') {
      return NextResponse.json(
        { success: false, error: 'Cannot modify sold bike details' },
        { status: 400 }
      );
    }

    // Handle partner investment changes
    if (body.partnerInvestments) {
      // Remove old investments
      if (existingBike.partnerInvestments) {
        for (const oldInvestment of existingBike.partnerInvestments) {
          await partnersCollection.updateOne(
            { _id: oldInvestment.partnerId },
            {
              $inc: {
                totalInvestment: -oldInvestment.amount,
                activeInvestments: -oldInvestment.amount
              },
              $pull: {
                investments: { bikeId: new ObjectId(id) }
              },
              $set: { updatedAt: new Date() }
            }
          );
        }
      }

      // Add new investments
      const newInvestments = body.partnerInvestments.map((inv: any) => ({
        partnerId: new ObjectId(inv.partnerId),
        amount: parseFloat(inv.amount),
        percentage: parseFloat(inv.percentage)
      }));

      for (const investment of newInvestments) {
        await partnersCollection.updateOne(
          { _id: investment.partnerId },
          {
            $inc: {
              totalInvestment: investment.amount,
              activeInvestments: investment.amount
            },
            $push: {
              investments: {
                bikeId: new ObjectId(id),
                amount: investment.amount,
                percentage: investment.percentage,
                investmentDate: new Date(),
                status: 'active'
              }
            },
            $set: { updatedAt: new Date() }
          }
        );
      }

      body.partnerInvestments = newInvestments;
    }

    // Recalculate profit if prices or repairs changed
    if (body.buyPrice || body.sellPrice || body.repairs) {
      const buyPrice = body.buyPrice || existingBike.buyPrice;
      const sellPrice = body.sellPrice || existingBike.sellPrice;
      const repairs = body.repairs || existingBike.repairs || [];
      
      body.profit = ModelHelpers.calculateBikeProfit({ buyPrice, sellPrice, repairs });
    }

    // Process repairs if provided
    if (body.repairs) {
      body.repairs = body.repairs.map((repair: any) => ({
        ...repair,
        date: new Date(repair.date || Date.now())
      }));
    }

    body.updatedAt = new Date();
    body.updatedBy = admin.email;

    const result = await bikesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: body }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Bike not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Bike updated successfully',
      data: {
        bikeId: id,
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('Error updating bike:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update bike' },
      { status: 500 }
    );
  }
}

// DELETE - Delete specific bike
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminAuth = await verifyAdmin(request);
    if (!adminAuth.success) {
      return NextResponse.json(
        { success: false, error: adminAuth.error },
        { status: adminAuth.status }
      );
    }
    const admin = adminAuth.admin;

    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid bike ID' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const bikesCollection = db.collection(Collections.BIKES);
    const partnersCollection = db.collection(Collections.PARTNERS);
    const sellRecordsCollection = db.collection(Collections.SELL_RECORDS);
    const reviewsCollection = db.collection(Collections.REVIEWS);

    // Get bike details before deletion
    const bike = await bikesCollection.findOne({ _id: new ObjectId(id) });
    if (!bike) {
      return NextResponse.json(
        { success: false, error: 'Bike not found' },
        { status: 404 }
      );
    }

    // Prevent deletion of sold bikes
    if (bike.status === 'sold') {
      return NextResponse.json(
        { success: false, error: 'Cannot delete sold bikes. Archive instead.' },
        { status: 400 }
      );
    }

    // Check for existing sell records
    const sellRecords = await sellRecordsCollection.countDocuments({ bikeId: new ObjectId(id) });
    if (sellRecords > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete bike with existing sell records' },
        { status: 400 }
      );
    }

    // Remove partner investments
    if (bike.partnerInvestments && bike.partnerInvestments.length > 0) {
      for (const investment of bike.partnerInvestments) {
        await partnersCollection.updateOne(
          { _id: investment.partnerId },
          {
            $inc: {
              totalInvestment: -investment.amount,
              activeInvestments: -investment.amount
            },
            $pull: {
              investments: { bikeId: new ObjectId(id) }
            },
            $set: { updatedAt: new Date() }
          }
        );
      }
    }

    // Delete associated reviews
    await reviewsCollection.deleteMany({ bikeId: new ObjectId(id) });

    // Delete the bike
    const result = await bikesCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Bike not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Bike and associated data deleted successfully',
      data: {
        bikeId: id,
        deletedCount: result.deletedCount
      }
    });
  } catch (error) {
    console.error('Error deleting bike:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete bike' },
      { status: 500 }
    );
  }
}

// PATCH - Update bike status (for quick status changes)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminAuth = await verifyAdmin(request);
    if (!adminAuth.success) {
      return NextResponse.json(
        { success: false, error: adminAuth.error },
        { status: adminAuth.status }
      );
    }
    const admin = adminAuth.admin;

    const { id } = params;
    const body = await request.json();
    const { status, reason } = body;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid bike ID' },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      );
    }

    const validStatuses = ['available', 'reserved', 'sold', 'maintenance', 'archived'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Status must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const bikesCollection = db.collection(Collections.BIKES);

    const updateData: any = {
      status,
      updatedAt: new Date(),
      updatedBy: admin.email
    };

    if (reason) {
      updateData.statusReason = reason;
    }

    if (status === 'sold') {
      updateData.soldDate = new Date();
    }

    const result = await bikesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Bike not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Bike status updated to ${status}`,
      data: {
        bikeId: id,
        status,
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('Error updating bike status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update bike status' },
      { status: 500 }
    );
  }
}