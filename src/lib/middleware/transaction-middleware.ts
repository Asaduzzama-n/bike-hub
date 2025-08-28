import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { CrossCollectionHandler } from '@/lib/utils/cross-collection-handler';
import { ObjectId } from 'mongodb';
import { Collections } from '../models';


// Transaction wrapper for API endpoints
export async function withTransaction<T>(
  handler: (context: {
    db: any;
    crossCollectionHandler: CrossCollectionHandler;
    request: NextRequest;
  }) => Promise<T>
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    try {
      const { db } = await connectToDatabase();
      
      return await CrossCollectionHandler.withTransaction(db, async ({ session, db: transactionDb }) => {
        const crossCollectionHandler = new CrossCollectionHandler(transactionDb, session);
        
        const result = await handler({
          db: transactionDb,
          crossCollectionHandler,
          request
        });
        
        return NextResponse.json(result);
      });
    } catch (error) {
      console.error('Transaction error:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: error instanceof Error ? error.message : 'Transaction failed' 
        },
        { status: 500 }
      );
    }
  };
}

// Middleware for handling bike sale operations
export const bikeSaleMiddleware = {
  // Process bike sale with all dependencies
  processBikeSale: async ({
    db,
    crossCollectionHandler,
    bikeId,
    customerId,
    sellRecordData,
    adminEmail
  }: {
    db: any;
    crossCollectionHandler: CrossCollectionHandler;
    bikeId: ObjectId;
    customerId: ObjectId;
    sellRecordData: any;
    adminEmail: string;
  }) => {
    const bikesCollection = db.collection(Collections.BIKES);
    const partnersCollection = db.collection(Collections.PARTNERS);
    
    // 1. Validate bike availability
    const bike = await bikesCollection.findOne({ _id: bikeId });
    if (!bike) {
      throw new Error('Bike not found');
    }
    
    if (bike.status !== 'available') {
      throw new Error(`Bike is not available for sale. Current status: ${bike.status}`);
    }
    
    // 2. Calculate profit and partner distributions
    const totalProfit = sellRecordData.sellingPrice - bike.purchasePrice - (bike.repairCosts || 0);
    
    let partnerProfitDistribution: any[] = [];
    if (bike.partnerInvestments && bike.partnerInvestments.length > 0) {
      // Calculate partner profit shares
      for (const investment of bike.partnerInvestments) {
        const partner = await partnersCollection.findOne({ _id: investment.partnerId });
        if (partner) {
          const profitShare = (totalProfit * (partner.profitSharePercentage || 20)) / 100;
          partnerProfitDistribution.push({
            partnerId: investment.partnerId,
            profitAmount: profitShare
          });
        }
      }
    }
    
    // 3. Execute bike sale transaction
    const sellRecordId = await crossCollectionHandler.handleBikeSale({
      bikeId,
      customerId,
      sellingPrice: sellRecordData.sellingPrice,
      sellRecordData: {
        ...sellRecordData,
        profit: totalProfit,
        partnerProfitDistribution,
        createdBy: adminEmail
      },
      partnerProfitDistribution
    });
    
    return {
      success: true,
      sellRecordId,
      profit: totalProfit,
      partnerProfitDistribution
    };
  },
  
  // Cancel bike sale with all dependencies
  cancelBikeSale: async ({
    crossCollectionHandler,
    sellRecordId,
    cancelReason,
    adminEmail
  }: {
    crossCollectionHandler: CrossCollectionHandler;
    sellRecordId: ObjectId;
    cancelReason: string;
    adminEmail: string;
  }) => {
    await crossCollectionHandler.cancelSellRecord(sellRecordId, cancelReason);
    
    return {
      success: true,
      message: 'Bike sale cancelled successfully'
    };
  }
};

// Middleware for handling review operations
export const reviewMiddleware = {
  // Add review with rating aggregation
  addReview: async ({
    db,
    crossCollectionHandler,
    reviewData,
    customerId
  }: {
    db: any;
    crossCollectionHandler: CrossCollectionHandler;
    reviewData: any;
    customerId: ObjectId;
  }) => {
    const reviewsCollection = db.collection(Collections.REVIEWS);
    const sellRecordsCollection = db.collection(Collections.SELL_RECORDS);
    
    // 1. Validate customer has purchased the bike
    const purchaseRecord = await sellRecordsCollection.findOne({
      bikeId: reviewData.bikeId,
      customerId,
      status: { $ne: 'cancelled' }
    });
    
    if (!purchaseRecord) {
      throw new Error('You can only review bikes you have purchased');
    }
    
    // 2. Check for duplicate review
    const existingReview = await reviewsCollection.findOne({
      bikeId: reviewData.bikeId,
      customerId
    });
    
    if (existingReview) {
      throw new Error('You have already reviewed this bike');
    }
    
    // 3. Create review
    const review = await reviewsCollection.insertOne({
      ...reviewData,
      customerId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // 4. Update bike rating aggregation
    await crossCollectionHandler.updateReviewAggregation({
      bikeId: reviewData.bikeId,
      newRating: reviewData.rating,
      action: 'add'
    });
    
    return {
      success: true,
      reviewId: review.insertedId
    };
  },
  
  // Update review with rating aggregation
  updateReview: async ({
    db,
    crossCollectionHandler,
    reviewId,
    updateData
  }: {
    db: any;
    crossCollectionHandler: CrossCollectionHandler;
    reviewId: ObjectId;
    updateData: any;
  }) => {
    const reviewsCollection = db.collection(Collections.REVIEWS);
    
    // 1. Get existing review
    const existingReview = await reviewsCollection.findOne({ _id: reviewId });
    if (!existingReview) {
      throw new Error('Review not found');
    }
    
    // 2. Update review
    await reviewsCollection.updateOne(
      { _id: reviewId },
      {
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      }
    );
    
    // 3. Update bike rating aggregation if rating changed
    if (updateData.rating && updateData.rating !== existingReview.rating) {
      await crossCollectionHandler.updateReviewAggregation({
        bikeId: existingReview.bikeId,
        action: 'update'
      });
    }
    
    return {
      success: true,
      message: 'Review updated successfully'
    };
  },
  
  // Delete review with rating aggregation
  deleteReview: async ({
    db,
    crossCollectionHandler,
    reviewId
  }: {
    db: any;
    crossCollectionHandler: CrossCollectionHandler;
    reviewId: ObjectId;
  }) => {
    const reviewsCollection = db.collection(Collections.REVIEWS);
    
    // 1. Get existing review
    const existingReview = await reviewsCollection.findOne({ _id: reviewId });
    if (!existingReview) {
      throw new Error('Review not found');
    }
    
    // 2. Delete review
    await reviewsCollection.deleteOne({ _id: reviewId });
    
    // 3. Update bike rating aggregation
    await crossCollectionHandler.updateReviewAggregation({
      bikeId: existingReview.bikeId,
      newRating: existingReview.rating,
      action: 'remove'
    });
    
    return {
      success: true,
      message: 'Review deleted successfully'
    };
  }
};

// Middleware for handling partner operations
export const partnerMiddleware = {
  // Add partner investment
  addPartnerInvestment: async ({
    crossCollectionHandler,
    partnerId,
    bikeId,
    investmentAmount
  }: {
    crossCollectionHandler: CrossCollectionHandler;
    partnerId: ObjectId;
    bikeId: ObjectId;
    investmentAmount: number;
  }) => {
    await crossCollectionHandler.updatePartnerInvestment({
      partnerId,
      bikeId,
      investmentAmount,
      profitShare: 0,
      action: 'add'
    });
    
    return {
      success: true,
      message: 'Partner investment added successfully'
    };
  },
  
  // Remove partner investment
  removePartnerInvestment: async ({
    crossCollectionHandler,
    partnerId,
    bikeId
  }: {
    crossCollectionHandler: CrossCollectionHandler;
    partnerId: ObjectId;
    bikeId: ObjectId;
  }) => {
    await crossCollectionHandler.updatePartnerInvestment({
      partnerId,
      bikeId,
      investmentAmount: 0,
      profitShare: 0,
      action: 'remove'
    });
    
    return {
      success: true,
      message: 'Partner investment removed successfully'
    };
  },
  
  // Process partner payout
  processPartnerPayout: async ({
    crossCollectionHandler,
    partnerId,
    payoutAmount,
    payoutMethod,
    bikeIds
  }: {
    crossCollectionHandler: CrossCollectionHandler;
    partnerId: ObjectId;
    payoutAmount: number;
    payoutMethod: string;
    bikeIds?: ObjectId[];
  }) => {
    await crossCollectionHandler.processPartnerPayout({
      partnerId,
      payoutAmount,
      payoutMethod,
      bikeIds
    });
    
    return {
      success: true,
      message: 'Partner payout processed successfully'
    };
  }
};

// Middleware for handling bike operations
export const bikeMiddleware = {
  // Update bike status with dependencies
  updateBikeStatus: async ({
    crossCollectionHandler,
    bikeId,
    newStatus,
    sellRecordId,
    customerId
  }: {
    crossCollectionHandler: CrossCollectionHandler;
    bikeId: ObjectId;
    newStatus: 'available' | 'sold' | 'reserved' | 'maintenance';
    sellRecordId?: ObjectId;
    customerId?: ObjectId;
  }) => {
    await crossCollectionHandler.updateBikeStatus({
      bikeId,
      newStatus,
      sellRecordId,
      customerId
    });
    
    return {
      success: true,
      message: `Bike status updated to ${newStatus} successfully`
    };
  },
  
  // Delete bike with dependency checks
  deleteBike: async ({
    db,
    bikeId
  }: {
    db: any;
    bikeId: ObjectId;
  }) => {
    const bikesCollection = db.collection(Collections.BIKES);
    const sellRecordsCollection = db.collection(Collections.SELL_RECORDS);
    const reviewsCollection = db.collection(Collections.REVIEWS);
    const partnersCollection = db.collection(Collections.PARTNERS);
    
    // 1. Check for existing sell records
    const sellRecords = await sellRecordsCollection.find({
      bikeId,
      status: { $ne: 'cancelled' }
    }).toArray();
    
    if (sellRecords.length > 0) {
      throw new Error('Cannot delete bike with existing sell records');
    }
    
    // 2. Check for partner investments
    const partnerInvestments = await partnersCollection.find({
      'investments.bikeId': bikeId
    }).toArray();
    
    if (partnerInvestments.length > 0) {
      throw new Error('Cannot delete bike with active partner investments');
    }
    
    // 3. Delete associated reviews
    await reviewsCollection.deleteMany({ bikeId });
    
    // 4. Delete the bike
    await bikesCollection.deleteOne({ _id: bikeId });
    
    return {
      success: true,
      message: 'Bike deleted successfully'
    };
  }
};

// Data consistency validation middleware
export const consistencyMiddleware = {
  // Validate and fix data consistency
  validateAndFixConsistency: async ({
    db,
    crossCollectionHandler,
    autoFix = false
  }: {
    db: any;
    crossCollectionHandler: CrossCollectionHandler;
    autoFix?: boolean;
  }) => {
    const inconsistencies = await crossCollectionHandler.validateDataConsistency();
    
    if (autoFix && inconsistencies.length > 0) {
      const fixed: any[] = [];
      
      for (const inconsistency of inconsistencies) {
        try {
          switch (inconsistency.type) {
            case 'review_aggregation_mismatch':
              await crossCollectionHandler.updateReviewAggregation({
                bikeId: inconsistency.bikeId,
                action: 'update'
              });
              fixed.push(inconsistency);
              break;
              
            case 'bike_sell_record_mismatch':
              await crossCollectionHandler.updateBikeStatus({
                bikeId: inconsistency.bikeId,
                newStatus: 'available'
              });
              fixed.push(inconsistency);
              break;
          }
        } catch (error) {
          console.error(`Failed to fix inconsistency:`, inconsistency, error);
        }
      }
      
      return {
        success: true,
        inconsistencies,
        fixed,
        message: `Found ${inconsistencies.length} inconsistencies, fixed ${fixed.length}`
      };
    }
    
    return {
      success: true,
      inconsistencies,
      message: `Found ${inconsistencies.length} inconsistencies`
    };
  }
};

// Error handling utilities
export const errorHandler = {
  handleTransactionError: (error: any) => {
    console.error('Transaction error:', error);
    
    if (error.message.includes('duplicate key')) {
      return {
        success: false,
        error: 'Duplicate entry detected',
        code: 'DUPLICATE_ENTRY'
      };
    }
    
    if (error.message.includes('not found')) {
      return {
        success: false,
        error: 'Resource not found',
        code: 'NOT_FOUND'
      };
    }
    
    if (error.message.includes('validation')) {
      return {
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR'
      };
    }
    
    return {
      success: false,
      error: error.message || 'Transaction failed',
      code: 'TRANSACTION_ERROR'
    };
  }
};