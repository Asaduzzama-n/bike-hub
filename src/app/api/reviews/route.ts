import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { Collections, ValidationSchemas } from '@/lib/models/admin';
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

// Validate review data
function validateReviewData(data: any, isUpdate = false) {
  const errors: string[] = [];
  const schema = ValidationSchemas.createReview;

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
      
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`${field} must not exceed ${rules.maxLength} characters`);
      }
      
      if (rules.min && value < rules.min) {
        errors.push(`${field} must be at least ${rules.min}`);
      }
      
      if (rules.max && value > rules.max) {
        errors.push(`${field} must not exceed ${rules.max}`);
      }
    }
  });

  return errors;
}

// GET - Fetch all reviews with filtering and pagination
export async function GET(request: NextRequest) {
  // Verify admin authentication
  const adminAuth = await verifyAdmin(request);
  if (!adminAuth.success) {
    return NextResponse.json(
      { success: false, error: adminAuth.error },
      { status: adminAuth.status }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const bikeId = searchParams.get('bikeId') || '';
    const rating = searchParams.get('rating');
    const status = searchParams.get('status') || '';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const includeBikeDetails = searchParams.get('includeBikeDetails') === 'true';
    const includeCustomerDetails = searchParams.get('includeCustomerDetails') === 'true';

    const { db } = await connectToDatabase();
    const reviewsCollection = db.collection(Collections.REVIEWS);

    // Build filter query
    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { 'customerInfo.name': { $regex: search, $options: 'i' } },
        { 'customerInfo.email': { $regex: search, $options: 'i' } },
        { comment: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } }
      ];
    }

    if (bikeId && ObjectId.isValid(bikeId)) {
      filter.bikeId = new ObjectId(bikeId);
    }

    if (rating) {
      filter.rating = parseInt(rating);
    }

    if (status) {
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Count total documents
    const total = await reviewsCollection.countDocuments(filter);

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

    // Include customer purchase details if requested
    if (includeCustomerDetails) {
      pipeline.push({
        $lookup: {
          from: Collections.SELL_RECORDS,
          localField: 'bikeId',
          foreignField: 'bikeId',
          as: 'purchaseInfo'
        }
      });
      pipeline.push({
        $addFields: {
          purchaseInfo: { $arrayElemAt: ['$purchaseInfo', 0] }
        }
      });
    }

    const reviews = await reviewsCollection.aggregate(pipeline).toArray();

    // Calculate metrics
    const metrics = await reviewsCollection.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]).toArray();

    const metricsData = metrics[0] || {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: []
    };

    // Calculate rating distribution
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    metricsData.ratingDistribution.forEach((rating: number) => {
      ratingCounts[rating as keyof typeof ratingCounts]++;
    });

    // Status breakdown
    const statusBreakdown = await reviewsCollection.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        metrics: {
          totalReviews: metricsData.totalReviews,
          averageRating: Math.round(metricsData.averageRating * 100) / 100,
          ratingDistribution: ratingCounts,
          statusBreakdown
        }
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// PUT - Update reviews in bulk (Admin only)
export async function PUT(request: NextRequest) {
  // Verify admin authentication
  const adminAuth = await verifyAdmin(request);
  if (!adminAuth.success) {
    return NextResponse.json(
      { success: false, error: adminAuth.error },
      { status: adminAuth.status }
    );
  }

  try {
    const body = await request.json();
    // Implementation for bulk update would go here
    return NextResponse.json({
      success: true,
      message: 'Reviews updated successfully'
    });
  } catch (error) {
    console.error('Error updating reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update reviews' },
      { status: 500 }
    );
  }
}

// DELETE - Delete reviews (Admin only)
export async function DELETE(request: NextRequest) {
  // Verify admin authentication
  const adminAuth = await verifyAdmin(request);
  if (!adminAuth.success) {
    return NextResponse.json(
      { success: false, error: adminAuth.error },
      { status: adminAuth.status }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    // Implementation for delete would go here
    return NextResponse.json({
      success: true,
      message: 'Reviews deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete reviews' },
      { status: 500 }
    );
  }
}

// POST - Create new review
export async function POST(request: NextRequest) {
  // Verify admin authentication
  const adminAuth = await verifyAdmin(request);
  if (!adminAuth.success) {
    return NextResponse.json(
      { success: false, error: adminAuth.error },
      { status: adminAuth.status }
    );
  }

  try {
    const body = await request.json();
    const {
      bikeId,
      customerInfo,
      rating,
      title,
      comment,
      images,
      isVerifiedPurchase,
      adminNotes
    } = body;

    // Validate input data
    const validationErrors = validateReviewData(body);
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
    const reviewsCollection = db.collection(Collections.REVIEWS);
    const bikesCollection = db.collection(Collections.BIKES);
    const sellRecordsCollection = db.collection(Collections.SELL_RECORDS);

    // Verify bike exists
    const bike = await bikesCollection.findOne({ _id: new ObjectId(bikeId) });
    if (!bike) {
      return NextResponse.json(
        { success: false, error: 'Bike not found' },
        { status: 404 }
      );
    }

    // Check if customer actually purchased this bike (for verified purchase)
    let verifiedPurchase = false;
    if (isVerifiedPurchase && customerInfo.email) {
      const purchaseRecord = await sellRecordsCollection.findOne({
        bikeId: new ObjectId(bikeId),
        'buyerInfo.email': customerInfo.email
      });
      verifiedPurchase = !!purchaseRecord;
    }

    // Check for duplicate reviews from same customer for same bike
    const existingReview = await reviewsCollection.findOne({
      bikeId: new ObjectId(bikeId),
      'customerInfo.email': customerInfo.email
    });

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: 'Customer has already reviewed this bike' },
        { status: 400 }
      );
    }

    const newReview = {
      bikeId: new ObjectId(bikeId),
      customerInfo: {
        name: customerInfo.name.trim(),
        email: customerInfo.email.trim().toLowerCase(),
        phone: customerInfo.phone?.trim() || ''
      },
      rating: parseInt(rating),
      title: title?.trim() || '',
      comment: comment.trim(),
      images: images || [],
      isVerifiedPurchase: verifiedPurchase,
      status: 'pending', // pending, approved, rejected
      adminNotes: adminNotes?.trim() || '',
      helpful: 0,
      notHelpful: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await reviewsCollection.insertOne(newReview);

    // Update bike's average rating
    const bikeReviews = await reviewsCollection.find({
      bikeId: new ObjectId(bikeId),
      status: 'approved'
    }).toArray();

    if (bikeReviews.length > 0) {
      const averageRating = bikeReviews.reduce((sum, review) => sum + review.rating, 0) / bikeReviews.length;
      await bikesCollection.updateOne(
        { _id: new ObjectId(bikeId) },
        {
          $set: {
            averageRating: Math.round(averageRating * 100) / 100,
            reviewCount: bikeReviews.length,
            updatedAt: new Date()
          }
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Review created successfully',
      data: {
        reviewId: result.insertedId,
        isVerifiedPurchase: verifiedPurchase,
        status: 'pending'
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create review' },
      { status: 500 }
    );
  }
}