import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Review from '@/lib/models/Review';
import { withValidation } from '@/lib/middleware';
import { withAdminAuth, AdminAuthRequest } from '@/lib/middleware/adminAuth';
import { createReviewSchema, getReviewSchema } from '@/lib/validations/review';

// GET /api/admin/reviews - Get all reviews with pagination and filtering
export const GET = withAdminAuth(
  withValidation(getReviewSchema, async (
    request: AdminAuthRequest,
    validatedData: any
  ) => {
  try {
    await connectToDatabase();
    
    const { page = 1, limit = 10, isActive, search, rating } = validatedData.query;
    const skip = (page - 1) * limit;
    
    // Build filter - if not admin, only show approved reviews
    const filter: any = {};
    
    if (!request.admin) {
      filter.status = 'approved';
    } else if (isActive !== undefined) {
      filter.isActive = isActive;
    }
    
    if (rating !== undefined) {
      filter.rating = rating;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get reviews with pagination
    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(filter)
    ]);
    
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
  
}));

// POST /api/admin/reviews - Create new review
export const POST = withAdminAuth(
  withValidation(createReviewSchema, async (
    request: AdminAuthRequest,
    validatedData: any
  ) => {
  try {
    await connectToDatabase();
    const reviewData = validatedData.body;

    // Create new review
    const newReview = new Review(reviewData);
    await newReview.save();
    
    return NextResponse.json({
      success: true,
      message: 'Review created successfully',
      data: newReview
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, message: 'Validation error', error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Failed to create review' },
      { status: 500 }
    );
  }
  }),
  { optional: true }
);