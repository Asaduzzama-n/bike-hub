import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Review from '@/lib/models/Review';
import { withValidation } from '@/lib/middleware';
import { getReviewSchema } from '@/lib/validations/review';

// GET /api/reviews - Get all active reviews (public)
export const GET = withValidation(
  getReviewSchema,
  async (request: NextRequest, validatedData: any) => {
    try {
      await connectToDatabase();
      
      const { page = 1, limit = 10, rating } = validatedData.query || {};
      const skip = (page - 1) * limit;
      
      // Build filter for active reviews only
      const filter: any = { isActive: true };
      
      if (rating !== undefined) {
        filter.rating = rating;
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
  }
);