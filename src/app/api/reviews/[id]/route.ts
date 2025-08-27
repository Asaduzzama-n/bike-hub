import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { Collections, ValidationSchemas } from '@/lib/models/admin';
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

// GET - Fetch specific review with aggregated details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid review ID' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const reviewsCollection = db.collection(Collections.REVIEWS);

    // Aggregate review with bike and customer details
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
          from: Collections.SELL_RECORDS,
          localField: 'bikeId',
          foreignField: 'bikeId',
          as: 'purchaseInfo'
        }
      },
      {
        $addFields: {
          bikeInfo: { $arrayElemAt: ['$bikeInfo', 0] },
          purchaseInfo: {
            $filter: {
              input: '$purchaseInfo',
              cond: { $eq: ['$$this.buyerInfo.email', '$customerInfo.email'] }
            }
          }
        }
      },
      {
        $addFields: {
          purchaseInfo: { $arrayElemAt: ['$purchaseInfo', 0] }
        }
      }
    ];

    const reviews = await reviewsCollection.aggregate(pipeline).toArray();
    const review = reviews[0];

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    // Calculate additional metrics
    const metrics = {
      isVerifiedPurchase: !!review.purchaseInfo,
      purchaseDate: review.purchaseInfo?.saleDate || null,
      daysSincePurchase: review.purchaseInfo 
        ? Math.floor((new Date().getTime() - new Date(review.purchaseInfo.saleDate).getTime()) / (1000 * 60 * 60 * 24))
        : null,
      helpfulnessRatio: review.helpful + review.notHelpful > 0 
        ? Math.round((review.helpful / (review.helpful + review.notHelpful)) * 100)
        : 0
    };

    return NextResponse.json({
      success: true,
      data: {
        ...review,
        metrics
      }
    });
  } catch (error) {
    console.error('Error fetching review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch review' },
      { status: 500 }
    );
  }
}

// PUT - Update review (admin only)
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
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid review ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      rating,
      title,
      comment,
      images,
      status,
      adminNotes,
      moderationReason
    } = body;

    // Validate input data
    const validationErrors = validateReviewData(body, true);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const reviewsCollection = db.collection(Collections.REVIEWS);
    const bikesCollection = db.collection(Collections.BIKES);

    // Check if review exists
    const existingReview = await reviewsCollection.findOne({ _id: new ObjectId(id) });
    if (!existingReview) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    };

    if (rating !== undefined) updateData.rating = parseInt(rating);
    if (title !== undefined) updateData.title = title.trim();
    if (comment !== undefined) updateData.comment = comment.trim();
    if (images !== undefined) updateData.images = images;
    if (status !== undefined) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes.trim();
    if (moderationReason !== undefined) updateData.moderationReason = moderationReason.trim();

    // Add moderation history if status is changing
    if (status && status !== existingReview.status) {
      updateData.moderationHistory = [
        ...(existingReview.moderationHistory || []),
        {
          previousStatus: existingReview.status,
          newStatus: status,
          moderatedBy: admin.email,
          moderatedAt: new Date(),
          reason: moderationReason || ''
        }
      ];
    }

    // Update the review
    await reviewsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    // Recalculate bike's average rating if rating changed or status changed
    if (rating !== undefined || (status && ['approved', 'rejected'].includes(status))) {
      const bikeReviews = await reviewsCollection.find({
        bikeId: existingReview.bikeId,
        status: 'approved'
      }).toArray();

      if (bikeReviews.length > 0) {
        const averageRating = bikeReviews.reduce((sum, review) => sum + review.rating, 0) / bikeReviews.length;
        await bikesCollection.updateOne(
          { _id: existingReview.bikeId },
          {
            $set: {
              averageRating: Math.round(averageRating * 100) / 100,
              reviewCount: bikeReviews.length,
              updatedAt: new Date()
            }
          }
        );
      } else {
        // No approved reviews, reset rating
        await bikesCollection.updateOne(
          { _id: existingReview.bikeId },
          {
            $set: {
              averageRating: 0,
              reviewCount: 0,
              updatedAt: new Date()
            }
          }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Review updated successfully',
      data: {
        reviewId: id,
        updatedFields: Object.keys(updateData).filter(key => key !== 'updatedAt')
      }
    });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update review' },
      { status: 500 }
    );
  }
}

// DELETE - Delete review (admin only)
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
        { success: false, error: 'Invalid review ID' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const reviewsCollection = db.collection(Collections.REVIEWS);
    const bikesCollection = db.collection(Collections.BIKES);

    // Check if review exists
    const existingReview = await reviewsCollection.findOne({ _id: new ObjectId(id) });
    if (!existingReview) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    // Delete the review
    await reviewsCollection.deleteOne({ _id: new ObjectId(id) });

    // Recalculate bike's average rating
    const bikeReviews = await reviewsCollection.find({
      bikeId: existingReview.bikeId,
      status: 'approved'
    }).toArray();

    if (bikeReviews.length > 0) {
      const averageRating = bikeReviews.reduce((sum, review) => sum + review.rating, 0) / bikeReviews.length;
      await bikesCollection.updateOne(
        { _id: existingReview.bikeId },
        {
          $set: {
            averageRating: Math.round(averageRating * 100) / 100,
            reviewCount: bikeReviews.length,
            updatedAt: new Date()
          }
        }
      );
    } else {
      // No reviews left, reset rating
      await bikesCollection.updateOne(
        { _id: existingReview.bikeId },
        {
          $set: {
            averageRating: 0,
            reviewCount: 0,
            updatedAt: new Date()
          }
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully',
      data: {
        deletedReviewId: id,
        bikeId: existingReview.bikeId
      }
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}

// PATCH - Update review helpfulness or moderate status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid review ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action, value } = body;

    if (!action || !['helpful', 'not_helpful', 'moderate'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be helpful, not_helpful, or moderate' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const reviewsCollection = db.collection(Collections.REVIEWS);

    // Check if review exists
    const existingReview = await reviewsCollection.findOne({ _id: new ObjectId(id) });
    if (!existingReview) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    let updateData: any = {
      updatedAt: new Date()
    };

    switch (action) {
      case 'helpful':
        updateData.helpful = (existingReview.helpful || 0) + 1;
        break;
      case 'not_helpful':
        updateData.notHelpful = (existingReview.notHelpful || 0) + 1;
        break;
      case 'moderate':
        // For moderation, require admin authentication
        const admin = await verifyAdmin(request);
        if (!admin) {
          return NextResponse.json(
            { success: false, error: 'Unauthorized' },
            { status: 401 }
          );
        }
        
        if (!value || !['approved', 'rejected', 'pending'].includes(value)) {
          return NextResponse.json(
            { success: false, error: 'Invalid status value' },
            { status: 400 }
          );
        }
        
        updateData.status = value;
        updateData.moderationHistory = [
          ...(existingReview.moderationHistory || []),
          {
            previousStatus: existingReview.status,
            newStatus: value,
            moderatedBy: admin.email,
            moderatedAt: new Date()
          }
        ];
        break;
    }

    // Update the review
    await reviewsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    // If status was moderated, update bike rating
    if (action === 'moderate') {
      const bikesCollection = db.collection(Collections.BIKES);
      const bikeReviews = await reviewsCollection.find({
        bikeId: existingReview.bikeId,
        status: 'approved'
      }).toArray();

      if (bikeReviews.length > 0) {
        const averageRating = bikeReviews.reduce((sum, review) => sum + review.rating, 0) / bikeReviews.length;
        await bikesCollection.updateOne(
          { _id: existingReview.bikeId },
          {
            $set: {
              averageRating: Math.round(averageRating * 100) / 100,
              reviewCount: bikeReviews.length,
              updatedAt: new Date()
            }
          }
        );
      } else {
        await bikesCollection.updateOne(
          { _id: existingReview.bikeId },
          {
            $set: {
              averageRating: 0,
              reviewCount: 0,
              updatedAt: new Date()
            }
          }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Review ${action} updated successfully`,
      data: {
        reviewId: id,
        action,
        newValue: action === 'moderate' ? value : updateData[action === 'helpful' ? 'helpful' : 'notHelpful']
      }
    });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update review' },
      { status: 500 }
    );
  }
}