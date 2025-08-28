import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Review from '@/lib/models/Review';
import { withValidation } from '@/lib/middleware';
import { withAdminAuth, AdminAuthRequest } from '@/lib/middleware/adminAuth';
import { updateReviewSchema, getSingleReviewSchema } from '@/lib/validations/review';
import { ObjectId } from 'mongodb';

// GET /api/admin/reviews/[id] - Get single review
export const GET = withAdminAuth(
  withValidation(
    getSingleReviewSchema,
    async (request: AdminAuthRequest, validatedData: any, { params }: { params: { id: string } }) => {
  try {
    await connectToDatabase();
    const reviewId = params.id;
    
    if (!ObjectId.isValid(reviewId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid review ID' },
        { status: 400 }
      );
    }
    
    const review = await Review.findById(reviewId).lean();
    
    if (!review) {
      return NextResponse.json(
        { success: false, message: 'Review not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Error fetching review:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch review' },
      { status: 500 }
    );
  }
  }
));

// PUT /api/admin/reviews/[id] - Update review with validation
export const PUT = withAdminAuth(
  withValidation(
    updateReviewSchema,
    async (request: AdminAuthRequest, validatedData: any, { params }: { params: { id: string } }) => {
  try {
    await connectToDatabase();
    const reviewId = params.id;
    const updateData = validatedData.body;
    
    if (!ObjectId.isValid(reviewId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid review ID' },
        { status: 400 }
      );
    }
    
    // Update the updatedAt field
    updateData.updatedAt = new Date();
    
    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedReview) {
      return NextResponse.json(
        { success: false, message: 'Review not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Review updated successfully',
      data: updatedReview
    });
  } catch (error) {
    console.error('Error updating review:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, message: 'Validation error', error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Failed to update review' },
      { status: 500 }
    );
  }
  }
));

// DELETE /api/admin/reviews/[id] - Delete review
export const DELETE = withAdminAuth(
  withValidation(
    getSingleReviewSchema,
    async (request: AdminAuthRequest, validatedData: any, { params }: { params: { id: string } }) => {
  try {
    await connectToDatabase();
    const reviewId = params.id;
    
    if (!ObjectId.isValid(reviewId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid review ID' },
        { status: 400 }
      );
    }
    
    const deletedReview = await Review.findByIdAndDelete(reviewId);
    
    if (!deletedReview) {
      return NextResponse.json(
        { success: false, message: 'Review not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete review' },
      { status: 500 }
    );
  }
  }
));
