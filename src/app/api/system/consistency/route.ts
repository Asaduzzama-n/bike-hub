import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { CrossCollectionHandler } from '@/lib/utils/cross-collection-handler';
import { consistencyMiddleware, errorHandler } from '@/lib/middleware/transaction-middleware';
import { Collections } from '@/lib/constants';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { ObjectId } from 'mongodb';

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

// GET - Check data consistency across collections (Admin only)
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminAuth = await verifyAdmin(request);
    if (!adminAuth.success) {
      return NextResponse.json(
        { success: false, error: adminAuth.error },
        { status: adminAuth.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const checkType = searchParams.get('type') || 'all';
    const includeDetails = searchParams.get('includeDetails') === 'true';

    const { db } = await connectToDatabase();
    
    return await CrossCollectionHandler.withTransaction(db, async ({ session, db: transactionDb }) => {
      const crossCollectionHandler = new CrossCollectionHandler(transactionDb, session);
      
      const result = await consistencyMiddleware.validateAndFixConsistency({
        db: transactionDb,
        crossCollectionHandler,
        autoFix: false
      });
      
      // Additional consistency checks based on type
      const additionalChecks: any = {};
      
      if (checkType === 'all' || checkType === 'bikes') {
        additionalChecks.bikeConsistency = await checkBikeConsistency(transactionDb);
      }
      
      if (checkType === 'all' || checkType === 'partners') {
        additionalChecks.partnerConsistency = await checkPartnerConsistency(transactionDb);
      }
      
      if (checkType === 'all' || checkType === 'finance') {
        additionalChecks.financeConsistency = await checkFinanceConsistency(transactionDb);
      }
      
      if (checkType === 'all' || checkType === 'users') {
        additionalChecks.userConsistency = await checkUserConsistency(transactionDb);
      }
      
      return NextResponse.json({
        success: true,
        data: {
          ...result,
          additionalChecks,
          summary: {
            totalInconsistencies: result.inconsistencies.length + 
              Object.values(additionalChecks).reduce((sum: number, check: any) => 
                sum + (check.inconsistencies?.length || 0), 0),
            checkType,
            checkedAt: new Date(),
            checkedBy: admin.email
          }
        }
      });
    });
  } catch (error) {
    console.error('Error checking consistency:', error);
    return NextResponse.json(
      errorHandler.handleTransactionError(error),
      { status: 500 }
    );
  }
}

// POST - Fix data consistency issues (Admin only)
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminAuth = await verifyAdmin(request);
    if (!adminAuth.success) {
      return NextResponse.json(
        { success: false, error: adminAuth.error },
        { status: adminAuth.status }
      );
    }

    const body = await request.json();
    const { 
      autoFix = false, 
      fixType = 'all',
      specificInconsistencies = [],
      dryRun = false
    } = body;

    const { db } = await connectToDatabase();
    
    return await CrossCollectionHandler.withTransaction(db, async ({ session, db: transactionDb }) => {
      const crossCollectionHandler = new CrossCollectionHandler(transactionDb, session);
      
      let fixResults: any = {
        fixed: [],
        failed: [],
        skipped: []
      };
      
      if (specificInconsistencies.length > 0) {
        // Fix specific inconsistencies
        for (const inconsistency of specificInconsistencies) {
          try {
            if (!dryRun) {
              await fixSpecificInconsistency(transactionDb, crossCollectionHandler, inconsistency);
            }
            fixResults.fixed.push(inconsistency);
          } catch (error) {
            fixResults.failed.push({ inconsistency, error: error.message });
          }
        }
      } else {
        // Auto-fix all inconsistencies
        const result = await consistencyMiddleware.validateAndFixConsistency({
          db: transactionDb,
          crossCollectionHandler,
          autoFix: !dryRun
        });
        
        fixResults = {
          fixed: result.fixed || [],
          failed: [],
          skipped: result.inconsistencies.filter(inc => 
            !result.fixed?.some(fixed => fixed.bikeId === inc.bikeId && fixed.type === inc.type)
          )
        };
        
        // Fix additional inconsistencies based on type
        if (fixType === 'all' || fixType === 'bikes') {
          const bikeFixResults = await fixBikeInconsistencies(transactionDb, crossCollectionHandler, dryRun);
          fixResults.fixed.push(...bikeFixResults.fixed);
          fixResults.failed.push(...bikeFixResults.failed);
        }
        
        if (fixType === 'all' || fixType === 'partners') {
          const partnerFixResults = await fixPartnerInconsistencies(transactionDb, crossCollectionHandler, dryRun);
          fixResults.fixed.push(...partnerFixResults.fixed);
          fixResults.failed.push(...partnerFixResults.failed);
        }
        
        if (fixType === 'all' || fixType === 'finance') {
          const financeFixResults = await fixFinanceInconsistencies(transactionDb, crossCollectionHandler, dryRun);
          fixResults.fixed.push(...financeFixResults.fixed);
          fixResults.failed.push(...financeFixResults.failed);
        }
      }
      
      return NextResponse.json({
        success: true,
        data: {
          ...fixResults,
          summary: {
            totalFixed: fixResults.fixed.length,
            totalFailed: fixResults.failed.length,
            totalSkipped: fixResults.skipped.length,
            dryRun,
            fixedAt: new Date(),
            fixedBy: admin.email
          }
        },
        message: dryRun 
          ? `Dry run completed: ${fixResults.fixed.length} issues would be fixed`
          : `Fixed ${fixResults.fixed.length} consistency issues`
      });
    });
  } catch (error) {
    console.error('Error fixing consistency:', error);
    return NextResponse.json(
      errorHandler.handleTransactionError(error),
      { status: 500 }
    );
  }
}

// Helper functions for specific consistency checks
async function checkBikeConsistency(db: any) {
  const bikesCollection = db.collection(Collections.BIKES);
  const sellRecordsCollection = db.collection(Collections.SELL_RECORDS);
  const reviewsCollection = db.collection(Collections.REVIEWS);
  
  const inconsistencies: any[] = [];
  
  // Check bikes with invalid partner investment totals
  const bikesWithInvestments = await bikesCollection.find({
    partnerInvestments: { $exists: true, $ne: [] }
  }).toArray();
  
  for (const bike of bikesWithInvestments) {
    const calculatedTotal = bike.partnerInvestments.reduce(
      (sum: number, inv: any) => sum + (inv.investmentAmount || 0), 0
    );
    
    if (Math.abs(calculatedTotal - (bike.totalPartnerInvestment || 0)) > 0.01) {
      inconsistencies.push({
        type: 'bike_investment_total_mismatch',
        bikeId: bike._id,
        expected: calculatedTotal,
        actual: bike.totalPartnerInvestment,
        issue: 'Partner investment total mismatch'
      });
    }
  }
  
  // Check sold bikes without sell records
  const soldBikesWithoutRecords = await bikesCollection.aggregate([
    { $match: { status: 'sold' } },
    {
      $lookup: {
        from: Collections.SELL_RECORDS,
        localField: '_id',
        foreignField: 'bikeId',
        as: 'sellRecords'
      }
    },
    {
      $match: {
        $or: [
          { sellRecords: { $size: 0 } },
          { 'sellRecords.status': 'cancelled' }
        ]
      }
    }
  ]).toArray();
  
  inconsistencies.push(...soldBikesWithoutRecords.map(bike => ({
    type: 'sold_bike_without_record',
    bikeId: bike._id,
    issue: 'Bike marked as sold but no active sell record found'
  })));
  
  return { inconsistencies, total: inconsistencies.length };
}

async function checkPartnerConsistency(db: any) {
  const partnersCollection = db.collection(Collections.PARTNERS);
  const bikesCollection = db.collection(Collections.BIKES);
  
  const inconsistencies: any[] = [];
  
  // Check partner investment totals
  const partners = await partnersCollection.find({
    investments: { $exists: true, $ne: [] }
  }).toArray();
  
  for (const partner of partners) {
    const calculatedTotal = partner.investments.reduce(
      (sum: number, inv: any) => sum + (inv.investmentAmount || 0), 0
    );
    
    if (Math.abs(calculatedTotal - (partner.totalInvestment || 0)) > 0.01) {
      inconsistencies.push({
        type: 'partner_investment_total_mismatch',
        partnerId: partner._id,
        expected: calculatedTotal,
        actual: partner.totalInvestment,
        issue: 'Partner total investment mismatch'
      });
    }
    
    // Check if bikes referenced in investments exist
    for (const investment of partner.investments) {
      const bike = await bikesCollection.findOne({ _id: investment.bikeId });
      if (!bike) {
        inconsistencies.push({
          type: 'partner_investment_orphaned',
          partnerId: partner._id,
          bikeId: investment.bikeId,
          issue: 'Partner investment references non-existent bike'
        });
      }
    }
  }
  
  return { inconsistencies, total: inconsistencies.length };
}

async function checkFinanceConsistency(db: any) {
  const financeCollection = db.collection(Collections.FINANCE || 'finance');
  const sellRecordsCollection = db.collection(Collections.SELL_RECORDS);
  const partnersCollection = db.collection(Collections.PARTNERS);
  
  const inconsistencies: any[] = [];
  
  // Check for finance records without corresponding sell records
  const financeRecords = await financeCollection.find({
    type: 'sale',
    sellRecordId: { $exists: true }
  }).toArray();
  
  for (const record of financeRecords) {
    const sellRecord = await sellRecordsCollection.findOne({ _id: record.sellRecordId });
    if (!sellRecord) {
      inconsistencies.push({
        type: 'finance_orphaned_sell_record',
        financeRecordId: record._id,
        sellRecordId: record.sellRecordId,
        issue: 'Finance record references non-existent sell record'
      });
    }
  }
  
  return { inconsistencies, total: inconsistencies.length };
}

async function checkUserConsistency(db: any) {
  const usersCollection = db.collection(Collections.USERS || 'users');
  const sellRecordsCollection = db.collection(Collections.SELL_RECORDS);
  const reviewsCollection = db.collection(Collections.REVIEWS);
  
  const inconsistencies: any[] = [];
  
  // Check user purchase history consistency
  const usersWithHistory = await usersCollection.find({
    purchaseHistory: { $exists: true, $ne: [] }
  }).toArray();
  
  for (const user of usersWithHistory) {
    for (const purchase of user.purchaseHistory) {
      const sellRecord = await sellRecordsCollection.findOne({ _id: purchase.sellRecordId });
      if (!sellRecord) {
        inconsistencies.push({
          type: 'user_purchase_history_orphaned',
          userId: user._id,
          sellRecordId: purchase.sellRecordId,
          issue: 'User purchase history references non-existent sell record'
        });
      }
    }
  }
  
  return { inconsistencies, total: inconsistencies.length };
}

// Helper functions for fixing specific inconsistencies
async function fixSpecificInconsistency(
  db: any, 
  crossCollectionHandler: CrossCollectionHandler, 
  inconsistency: any
) {
  switch (inconsistency.type) {
    case 'review_aggregation_mismatch':
      await crossCollectionHandler.updateReviewAggregation({
        bikeId: inconsistency.bikeId,
        action: 'update'
      });
      break;
      
    case 'bike_sell_record_mismatch':
    case 'sold_bike_without_record':
      await crossCollectionHandler.updateBikeStatus({
        bikeId: inconsistency.bikeId,
        newStatus: 'available'
      });
      break;
      
    case 'bike_investment_total_mismatch':
      await fixBikeInvestmentTotal(db, inconsistency.bikeId);
      break;
      
    case 'partner_investment_total_mismatch':
      await fixPartnerInvestmentTotal(db, inconsistency.partnerId);
      break;
      
    default:
      throw new Error(`Unknown inconsistency type: ${inconsistency.type}`);
  }
}

async function fixBikeInconsistencies(db: any, crossCollectionHandler: CrossCollectionHandler, dryRun: boolean) {
  const results = { fixed: [], failed: [] };
  
  const bikeConsistency = await checkBikeConsistency(db);
  
  for (const inconsistency of bikeConsistency.inconsistencies) {
    try {
      if (!dryRun) {
        await fixSpecificInconsistency(db, crossCollectionHandler, inconsistency);
      }
      results.fixed.push(inconsistency);
    } catch (error) {
      results.failed.push({ inconsistency, error: error.message });
    }
  }
  
  return results;
}

async function fixPartnerInconsistencies(db: any, crossCollectionHandler: CrossCollectionHandler, dryRun: boolean) {
  const results = { fixed: [], failed: [] };
  
  const partnerConsistency = await checkPartnerConsistency(db);
  
  for (const inconsistency of partnerConsistency.inconsistencies) {
    try {
      if (!dryRun) {
        await fixSpecificInconsistency(db, crossCollectionHandler, inconsistency);
      }
      results.fixed.push(inconsistency);
    } catch (error) {
      results.failed.push({ inconsistency, error: error.message });
    }
  }
  
  return results;
}

async function fixFinanceInconsistencies(db: any, crossCollectionHandler: CrossCollectionHandler, dryRun: boolean) {
  const results = { fixed: [], failed: [] };
  
  const financeConsistency = await checkFinanceConsistency(db);
  
  for (const inconsistency of financeConsistency.inconsistencies) {
    try {
      if (!dryRun && inconsistency.type === 'finance_orphaned_sell_record') {
        // Remove orphaned finance records
        await db.collection(Collections.FINANCE || 'finance').deleteOne({
          _id: inconsistency.financeRecordId
        });
      }
      results.fixed.push(inconsistency);
    } catch (error) {
      results.failed.push({ inconsistency, error: error.message });
    }
  }
  
  return results;
}

async function fixBikeInvestmentTotal(db: any, bikeId: ObjectId) {
  const bikesCollection = db.collection(Collections.BIKES);
  
  const bike = await bikesCollection.findOne({ _id: bikeId });
  if (bike && bike.partnerInvestments) {
    const calculatedTotal = bike.partnerInvestments.reduce(
      (sum: number, inv: any) => sum + (inv.investmentAmount || 0), 0
    );
    
    await bikesCollection.updateOne(
      { _id: bikeId },
      {
        $set: {
          totalPartnerInvestment: calculatedTotal,
          updatedAt: new Date()
        }
      }
    );
  }
}

async function fixPartnerInvestmentTotal(db: any, partnerId: ObjectId) {
  const partnersCollection = db.collection(Collections.PARTNERS);
  
  const partner = await partnersCollection.findOne({ _id: partnerId });
  if (partner && partner.investments) {
    const calculatedTotal = partner.investments.reduce(
      (sum: number, inv: any) => sum + (inv.investmentAmount || 0), 0
    );
    
    await partnersCollection.updateOne(
      { _id: partnerId },
      {
        $set: {
          totalInvestment: calculatedTotal,
          updatedAt: new Date()
        }
      }
    );
  }
}