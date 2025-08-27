import { Db, MongoClient, ClientSession, ObjectId } from 'mongodb';
import { Collections } from '@/lib/constants';

// Note: This utility is designed for admin-only operations
// All operations assume proper admin authentication has been verified

// Interface for transaction context
interface TransactionContext {
  session: ClientSession;
  db: Db;
}

// Interface for bike status update
interface BikeStatusUpdate {
  bikeId: ObjectId;
  newStatus: 'available' | 'sold' | 'reserved' | 'maintenance';
  sellRecordId?: ObjectId;
  customerId?: ObjectId;
}

// Interface for partner investment update
interface PartnerInvestmentUpdate {
  partnerId: ObjectId;
  bikeId: ObjectId;
  investmentAmount: number;
  profitShare: number;
  action: 'add' | 'update' | 'remove';
}

// Interface for review aggregation update
interface ReviewAggregationUpdate {
  bikeId: ObjectId;
  newRating?: number;
  action: 'add' | 'update' | 'remove';
}

// Cross-collection dependency handler class
export class CrossCollectionHandler {
  private db: Db;
  private session?: ClientSession;

  constructor(db: Db, session?: ClientSession) {
    this.db = db;
    this.session = session;
  }

  // Execute operations within a transaction
  static async withTransaction<T>(
    db: Db,
    operations: (context: TransactionContext) => Promise<T>
  ): Promise<T> {
    const client = db.client as MongoClient;
    const session = client.startSession();

    try {
      let result: T;
      
      await session.withTransaction(async () => {
        const context: TransactionContext = { session, db };
        result = await operations(context);
      });

      return result!;
    } finally {
      await session.endSession();
    }
  }

  // Handle bike sale transaction
  async handleBikeSale({
    bikeId,
    customerId,
    sellingPrice,
    sellRecordData,
    partnerProfitDistribution
  }: {
    bikeId: ObjectId;
    customerId: ObjectId;
    sellingPrice: number;
    sellRecordData: any;
    partnerProfitDistribution?: Array<{
      partnerId: ObjectId;
      profitAmount: number;
    }>;
  }) {
    const bikesCollection = this.db.collection(Collections.BIKES);
    const sellRecordsCollection = this.db.collection(Collections.SELL_RECORDS);
    const partnersCollection = this.db.collection(Collections.PARTNERS);
    // 1. Update bike status to sold
    await bikesCollection.updateOne(
      { _id: bikeId },
      {
        $set: {
          status: 'sold',
          soldDate: new Date(),
          soldPrice: sellingPrice,
          customerId,
          updatedAt: new Date()
        }
      },
      { session: this.session }
    );

    // 2. Create sell record
    const sellRecord = await sellRecordsCollection.insertOne(
      {
        ...sellRecordData,
        bikeId,
        customerId,
        sellingPrice,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      { session: this.session }
    );

    // 3. Update partner investments with profit distribution
    if (partnerProfitDistribution && partnerProfitDistribution.length > 0) {
      for (const distribution of partnerProfitDistribution) {
        await this.updatePartnerInvestment({
          partnerId: distribution.partnerId,
          bikeId,
          investmentAmount: 0, // No new investment
          profitShare: distribution.profitAmount,
          action: 'update'
        });
      }
    }

    // Note: User purchase history is not tracked in admin-only system

    return sellRecord.insertedId;
  }

  // Handle bike status update
  async updateBikeStatus({ bikeId, newStatus, sellRecordId, customerId }: BikeStatusUpdate) {
    const bikesCollection = this.db.collection(Collections.BIKES);
    const sellRecordsCollection = this.db.collection(Collections.SELL_RECORDS);
    const partnersCollection = this.db.collection(Collections.PARTNERS);

    const updateData: any = {
      status: newStatus,
      updatedAt: new Date()
    };

    // Handle status-specific updates
    switch (newStatus) {
      case 'sold':
        if (sellRecordId) {
          updateData.sellRecordId = sellRecordId;
        }
        if (customerId) {
          updateData.customerId = customerId;
          updateData.soldDate = new Date();
        }
        break;

      case 'available':
        // Clear sold-related fields when reverting to available
        updateData.$unset = {
          sellRecordId: '',
          customerId: '',
          soldDate: '',
          soldPrice: ''
        };
        break;

      case 'maintenance':
        updateData.maintenanceStartDate = new Date();
        break;
    }

    await bikesCollection.updateOne(
      { _id: bikeId },
      updateData.$unset ? { $set: updateData, $unset: updateData.$unset } : { $set: updateData },
      { session: this.session }
    );

    // Update related sell records if status changed from sold
    if (newStatus === 'available') {
      await sellRecordsCollection.updateMany(
        { bikeId, status: { $ne: 'cancelled' } },
        {
          $set: {
            status: 'cancelled',
            cancelledAt: new Date(),
            cancelReason: 'Bike status reverted to available',
            updatedAt: new Date()
          }
        },
        { session: this.session }
      );
    }
  }

  // Handle partner investment updates
  async updatePartnerInvestment({
    partnerId,
    bikeId,
    investmentAmount,
    profitShare,
    action
  }: PartnerInvestmentUpdate) {
    const partnersCollection = this.db.collection(Collections.PARTNERS);
    const bikesCollection = this.db.collection(Collections.BIKES);

    switch (action) {
      case 'add':
        // Add new investment to partner
        await partnersCollection.updateOne(
          { _id: partnerId },
          {
            $push: {
              investments: {
                bikeId,
                investmentAmount,
                investmentDate: new Date(),
                status: 'active',
                profitEarned: 0
              }
            },
            $inc: {
              totalInvestment: investmentAmount,
              activeInvestments: 1
            },
            $set: { updatedAt: new Date() }
          },
          { session: this.session }
        );

        // Add partner to bike's partner list
        await bikesCollection.updateOne(
          { _id: bikeId },
          {
            $push: {
              partnerInvestments: {
                partnerId,
                investmentAmount,
                profitShare: 0,
                investmentDate: new Date()
              }
            },
            $inc: { totalPartnerInvestment: investmentAmount },
            $set: { updatedAt: new Date() }
          },
          { session: this.session }
        );
        break;

      case 'update':
        // Update existing investment with profit
        await partnersCollection.updateOne(
          {
            _id: partnerId,
            'investments.bikeId': bikeId
          },
          {
            $inc: {
              'investments.$.profitEarned': profitShare,
              totalProfitEarned: profitShare
            },
            $set: {
              'investments.$.lastProfitDate': new Date(),
              updatedAt: new Date()
            }
          },
          { session: this.session }
        );

        // Update bike's partner investment record
        await bikesCollection.updateOne(
          {
            _id: bikeId,
            'partnerInvestments.partnerId': partnerId
          },
          {
            $inc: { 'partnerInvestments.$.profitShare': profitShare },
            $set: {
              'partnerInvestments.$.lastProfitDate': new Date(),
              updatedAt: new Date()
            }
          },
          { session: this.session }
        );
        break;

      case 'remove':
        // Remove investment from partner
        const partnerInvestment = await partnersCollection.findOne(
          {
            _id: partnerId,
            'investments.bikeId': bikeId
          },
          {
            projection: { 'investments.$': 1 },
            session: this.session
          }
        );

        if (partnerInvestment?.investments?.[0]) {
          const investment = partnerInvestment.investments[0];
          
          await partnersCollection.updateOne(
            { _id: partnerId },
            {
              $pull: { investments: { bikeId } },
              $inc: {
                totalInvestment: -investment.investmentAmount,
                activeInvestments: -1
              },
              $set: { updatedAt: new Date() }
            },
            { session: this.session }
          );
        }

        // Remove partner from bike's investment list
        const bikeInvestment = await bikesCollection.findOne(
          {
            _id: bikeId,
            'partnerInvestments.partnerId': partnerId
          },
          {
            projection: { 'partnerInvestments.$': 1 },
            session: this.session
          }
        );

        if (bikeInvestment?.partnerInvestments?.[0]) {
          const investment = bikeInvestment.partnerInvestments[0];
          
          await bikesCollection.updateOne(
            { _id: bikeId },
            {
              $pull: { partnerInvestments: { partnerId } },
              $inc: { totalPartnerInvestment: -investment.investmentAmount },
              $set: { updatedAt: new Date() }
            },
            { session: this.session }
          );
        }
        break;
    }
  }

  // Handle review aggregation updates
  async updateReviewAggregation({ bikeId, newRating, action }: ReviewAggregationUpdate) {
    const bikesCollection = this.db.collection(Collections.BIKES);
    const reviewsCollection = this.db.collection(Collections.REVIEWS);

    // Get current bike data
    const bike = await bikesCollection.findOne(
      { _id: bikeId },
      { session: this.session }
    );

    if (!bike) {
      throw new Error('Bike not found');
    }

    let newAverageRating: number;
    let newTotalReviews: number;

    switch (action) {
      case 'add':
        if (!newRating) throw new Error('Rating is required for add action');
        
        const currentTotal = (bike.averageRating || 0) * (bike.totalReviews || 0);
        newTotalReviews = (bike.totalReviews || 0) + 1;
        newAverageRating = (currentTotal + newRating) / newTotalReviews;
        break;

      case 'remove':
        if (!newRating) throw new Error('Rating is required for remove action');
        
        if ((bike.totalReviews || 0) <= 1) {
          newTotalReviews = 0;
          newAverageRating = 0;
        } else {
          const currentTotal = (bike.averageRating || 0) * (bike.totalReviews || 0);
          newTotalReviews = (bike.totalReviews || 0) - 1;
          newAverageRating = (currentTotal - newRating) / newTotalReviews;
        }
        break;

      case 'update':
        // Recalculate from all reviews
        const reviews = await reviewsCollection.find(
          { bikeId },
          { session: this.session }
        ).toArray();
        
        newTotalReviews = reviews.length;
        newAverageRating = newTotalReviews > 0 
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / newTotalReviews
          : 0;
        break;

      default:
        throw new Error('Invalid action for review aggregation');
    }

    // Update bike with new aggregated data
    await bikesCollection.updateOne(
      { _id: bikeId },
      {
        $set: {
          averageRating: Math.round(newAverageRating * 100) / 100, // Round to 2 decimal places
          totalReviews: newTotalReviews,
          updatedAt: new Date()
        }
      },
      { session: this.session }
    );
  }

  // Handle sell record cancellation
  async cancelSellRecord(sellRecordId: ObjectId, cancelReason: string) {
    const sellRecordsCollection = this.db.collection(Collections.SELL_RECORDS);
    const bikesCollection = this.db.collection(Collections.BIKES);
    const partnersCollection = this.db.collection(Collections.PARTNERS);

    // Get sell record details
    const sellRecord = await sellRecordsCollection.findOne(
      { _id: sellRecordId },
      { session: this.session }
    );

    if (!sellRecord) {
      throw new Error('Sell record not found');
    }

    // 1. Update sell record status
    await sellRecordsCollection.updateOne(
      { _id: sellRecordId },
      {
        $set: {
          status: 'cancelled',
          cancelledAt: new Date(),
          cancelReason,
          updatedAt: new Date()
        }
      },
      { session: this.session }
    );

    // 2. Revert bike status to available
    await this.updateBikeStatus({
      bikeId: sellRecord.bikeId,
      newStatus: 'available'
    });

    // 3. Revert partner profit distributions if any
    if (sellRecord.partnerProfitDistribution) {
      for (const distribution of sellRecord.partnerProfitDistribution) {
        await partnersCollection.updateOne(
          {
            _id: distribution.partnerId,
            'investments.bikeId': sellRecord.bikeId
          },
          {
            $inc: {
              'investments.$.profitEarned': -distribution.profitAmount,
              totalProfitEarned: -distribution.profitAmount
            },
            $set: { updatedAt: new Date() }
          },
          { session: this.session }
        );
      }
    }

    // Note: User purchase history updates not needed in admin-only system
  }

  // Handle partner payout processing
  async processPartnerPayout({
    partnerId,
    payoutAmount,
    payoutMethod,
    bikeIds
  }: {
    partnerId: ObjectId;
    payoutAmount: number;
    payoutMethod: string;
    bikeIds?: ObjectId[];
  }) {
    const partnersCollection = this.db.collection(Collections.PARTNERS);
    const financeCollection = this.db.collection(Collections.FINANCE || 'finance');

    // 1. Create finance record for payout
    await financeCollection.insertOne(
      {
        type: 'partner_payout',
        partnerId,
        amount: payoutAmount,
        payoutMethod,
        bikeIds: bikeIds || [],
        status: 'processed',
        processedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      { session: this.session }
    );

    // 2. Update partner's payout history and available balance
    await partnersCollection.updateOne(
      { _id: partnerId },
      {
        $push: {
          payoutHistory: {
            amount: payoutAmount,
            payoutMethod,
            processedAt: new Date(),
            bikeIds: bikeIds || []
          }
        },
        $inc: {
          totalPayoutsReceived: payoutAmount,
          availableBalance: -payoutAmount
        },
        $set: {
          lastPayoutDate: new Date(),
          updatedAt: new Date()
        }
      },
      { session: this.session }
    );

    // 3. Update specific bike investments if bikeIds provided
    if (bikeIds && bikeIds.length > 0) {
      for (const bikeId of bikeIds) {
        await partnersCollection.updateOne(
          {
            _id: partnerId,
            'investments.bikeId': bikeId
          },
          {
            $set: {
              'investments.$.lastPayoutDate': new Date(),
              'investments.$.status': 'paid_out'
            }
          },
          { session: this.session }
        );
      }
    }
  }

  // Validate data consistency across collections
  async validateDataConsistency() {
    const bikesCollection = this.db.collection(Collections.BIKES);
    const sellRecordsCollection = this.db.collection(Collections.SELL_RECORDS);
    const reviewsCollection = this.db.collection(Collections.REVIEWS);
    const partnersCollection = this.db.collection(Collections.PARTNERS);

    const inconsistencies: any[] = [];

    // Check bike-sell record consistency
    const soldBikes = await bikesCollection.find(
      { status: 'sold' },
      { session: this.session }
    ).toArray();

    for (const bike of soldBikes) {
      const sellRecord = await sellRecordsCollection.findOne(
        { bikeId: bike._id, status: { $ne: 'cancelled' } },
        { session: this.session }
      );

      if (!sellRecord) {
        inconsistencies.push({
          type: 'bike_sell_record_mismatch',
          bikeId: bike._id,
          issue: 'Bike marked as sold but no active sell record found'
        });
      }
    }

    // Check review aggregation consistency
    const bikesWithReviews = await reviewsCollection.aggregate([
      {
        $group: {
          _id: '$bikeId',
          actualCount: { $sum: 1 },
          actualAverage: { $avg: '$rating' }
        }
      }
    ], { session: this.session }).toArray();

    for (const reviewData of bikesWithReviews) {
      const bike = await bikesCollection.findOne(
        { _id: reviewData._id },
        { session: this.session }
      );

      if (bike) {
        const expectedCount = reviewData.actualCount;
        const expectedAverage = Math.round(reviewData.actualAverage * 100) / 100;

        if (bike.totalReviews !== expectedCount || 
            Math.abs((bike.averageRating || 0) - expectedAverage) > 0.01) {
          inconsistencies.push({
            type: 'review_aggregation_mismatch',
            bikeId: bike._id,
            issue: 'Review count or average rating mismatch',
            expected: { count: expectedCount, average: expectedAverage },
            actual: { count: bike.totalReviews, average: bike.averageRating }
          });
        }
      }
    }

    return inconsistencies;
  }
}

// Utility functions for common cross-collection operations
export const CrossCollectionUtils = {
  // Calculate partner profit distribution
  calculatePartnerProfitDistribution: (
    totalProfit: number,
    partnerInvestments: Array<{ partnerId: ObjectId; investmentAmount: number; profitSharePercentage: number }>
  ) => {
    return partnerInvestments.map(investment => ({
      partnerId: investment.partnerId,
      profitAmount: (totalProfit * investment.profitSharePercentage) / 100
    }));
  },

  // Calculate bike profit
  calculateBikeProfit: (
    sellingPrice: number,
    purchasePrice: number,
    repairCosts: number = 0,
    otherExpenses: number = 0
  ) => {
    return sellingPrice - purchasePrice - repairCosts - otherExpenses;
  },

  // Validate bike availability for sale
  validateBikeAvailability: async (
    db: Db,
    bikeId: ObjectId,
    session?: ClientSession
  ) => {
    const bikesCollection = db.collection(Collections.BIKES);
    const bike = await bikesCollection.findOne(
      { _id: bikeId },
      { session }
    );

    if (!bike) {
      throw new Error('Bike not found');
    }

    if (bike.status !== 'available') {
      throw new Error(`Bike is not available for sale. Current status: ${bike.status}`);
    }

    return bike;
  }
};