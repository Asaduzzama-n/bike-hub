import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { Collections } from '@/lib/models/admin';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// Admin verification function
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

// GET - Admin route to fetch all bikes with detailed calculations
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const brand = searchParams.get('brand') || '';
    const condition = searchParams.get('condition') || '';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const { db } = await connectToDatabase();
    const bikesCollection = db.collection(Collections.BIKES);

    // Build filter query
    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      filter.status = status;
    }

    if (brand) {
      filter.brand = { $regex: brand, $options: 'i' };
    }

    if (condition) {
      filter.condition = condition;
    }

    if (minPrice || maxPrice) {
      filter.sellPrice = {};
      if (minPrice) filter.sellPrice.$gte = parseFloat(minPrice);
      if (maxPrice) filter.sellPrice.$lte = parseFloat(maxPrice);
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    // Aggregation pipeline with detailed calculations
    const pipeline = [
      { $match: filter },
      {
        $lookup: {
          from: Collections.PARTNERS,
          localField: 'partnerInvestments.partnerId',
          foreignField: '_id',
          as: 'partnerDetails'
        }
      },
      {
        $lookup: {
          from: Collections.SELL_RECORDS,
          localField: '_id',
          foreignField: 'bikeId',
          as: 'sellRecords'
        }
      },
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
          // Calculate total investment
          totalInvestment: {
            $add: [
              '$buyPrice',
              { $sum: '$partnerInvestments.amount' },
              { $sum: '$repairs.cost' }
            ]
          },
          // Calculate potential profit
          potentialProfit: {
            $subtract: [
              '$sellPrice',
              {
                $add: [
                  '$buyPrice',
                  { $sum: '$partnerInvestments.amount' },
                  { $sum: '$repairs.cost' }
                ]
              }
            ]
          },
          // Calculate actual profit (if sold)
          actualProfit: {
            $cond: {
              if: { $eq: ['$status', 'sold'] },
              then: {
                $subtract: [
                  { $arrayElemAt: ['$sellRecords.finalPrice', 0] },
                  {
                    $add: [
                      '$buyPrice',
                      { $sum: '$partnerInvestments.amount' },
                      { $sum: '$repairs.cost' }
                    ]
                  }
                ]
              },
              else: null
            }
          },
          // Calculate average rating
          averageRating: {
            $cond: {
              if: { $gt: [{ $size: '$reviews' }, 0] },
              then: { $avg: '$reviews.rating' },
              else: 0
            }
          },
          // Calculate total reviews
          totalReviews: { $size: '$reviews' },
          // Calculate days in inventory
          daysInInventory: {
            $divide: [
              {
                $subtract: [
                  {
                    $cond: {
                      if: { $eq: ['$status', 'sold'] },
                      then: { $arrayElemAt: ['$sellRecords.saleDate', 0] },
                      else: new Date()
                    }
                  },
                  '$createdAt'
                ]
              },
              86400000 // milliseconds in a day
            ]
          }
        }
      },
      { $sort: sort },
      { $skip: skip },
      { $limit: limit }
    ];

    const bikes = await bikesCollection.aggregate(pipeline).toArray();
    const totalCount = await bikesCollection.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: {
        bikes,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNext: page * limit < totalCount,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching admin bikes:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}