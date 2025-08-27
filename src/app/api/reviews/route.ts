import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Review, { IReview } from '@/lib/models/Review';

// GET - Fetch all active reviews
export async function GET() {
  try {
    await connectToDatabase();
    const reviews = await Review.find({ isActive: true }).sort({ createdAt: -1 });
    console.log('Fetched reviews:', reviews);
    return NextResponse.json({ success: true, data: reviews || [] });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST - Create a new review
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    const { name, rating, description, image } = body;
    
    // Validation
    if (!name || !rating || !description || !image) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }
    
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }
    
    const review = new Review({
      name,
      rating,
      description,
      image
    });
    
    await review.save();
    
    return NextResponse.json(
      { success: true, data: review },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create review' },
      { status: 500 }
    );
  }
}