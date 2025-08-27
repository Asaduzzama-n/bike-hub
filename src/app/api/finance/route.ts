import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Collections } from '@/lib/constants';
import { ObjectId } from 'mongodb';
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

// GET - Financial dashboard and reports
export async function GET(request: NextRequest) {
  try {
    const adminAuth = await verifyAdmin(request);
    if (!adminAuth.success) {
      return NextResponse.json(
        { success: false, error: adminAuth.error },
        { status: adminAuth.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'dashboard';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const period = searchParams.get('period') || 'month'; // day, week, month, quarter, year
    const partnerId = searchParams.get('partnerId');
    const includeProjections = searchParams.get('includeProjections') === 'true';

    const { db } = await connectToDatabase();
    const bikesCollection = db.collection(Collections.BIKES);
    const sellRecordsCollection = db.collection(Collections.SELL_RECORDS);
    const partnersCollection = db.collection(Collections.PARTNERS);

    // Build date filter
    const dateFilter: any = {};
    if (startDate || endDate) {
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);
    } else {
      // Default to current month if no dates specified
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      dateFilter.$gte = startOfMonth;
      dateFilter.$lte = endOfMonth;
    }

    switch (reportType) {
      case 'dashboard':
        return await getDashboardData(db, dateFilter, partnerId);
      
      case 'profit-loss':
        return await getProfitLossReport(db, dateFilter, period, partnerId);
      
      case 'cash-flow':
        return await getCashFlowReport(db, dateFilter, period);
      
      case 'partner-performance':
        return await getPartnerPerformanceReport(db, dateFilter, partnerId);
      
      case 'inventory-valuation':
        return await getInventoryValuationReport(db, dateFilter);
      
      case 'projections':
        if (!includeProjections) {
          return NextResponse.json(
            { success: false, error: 'Projections must be explicitly requested' },
            { status: 400 }
          );
        }
        return await getProjectionsReport(db, dateFilter);
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid report type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error generating financial report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate financial report' },
      { status: 500 }
    );
  }
}

// Dashboard data with key metrics
async function getDashboardData(db: any, dateFilter: any, partnerId?: string) {
  const bikesCollection = db.collection(Collections.BIKES);
  const sellRecordsCollection = db.collection(Collections.SELL_RECORDS);
  const partnersCollection = db.collection(Collections.PARTNERS);

  // Build partner filter
  const partnerFilter = partnerId ? { 'partnerInvestments.partnerId': new ObjectId(partnerId) } : {};

  // Overall metrics
  const overallMetrics = await bikesCollection.aggregate([
    { $match: partnerFilter },
    {
      $group: {
        _id: null,
        totalInventoryValue: {
          $sum: {
            $cond: {
              if: { $ne: ['$status', 'sold'] },
              then: '$purchasePrice',
              else: 0
            }
          }
        },
        totalInvestment: { $sum: '$purchasePrice' },
        totalRevenue: {
          $sum: {
            $cond: {
              if: { $eq: ['$status', 'sold'] },
              then: '$sellingPrice',
              else: 0
            }
          }
        },
        totalProfit: {
          $sum: {
            $cond: {
              if: { $eq: ['$status', 'sold'] },
              then: '$profit',
              else: 0
            }
          }
        },
        activeBikes: {
          $sum: {
            $cond: {
              if: { $ne: ['$status', 'sold'] },
              then: 1,
              else: 0
            }
          }
        },
        soldBikes: {
          $sum: {
            $cond: {
              if: { $eq: ['$status', 'sold'] },
              then: 1,
              else: 0
            }
          }
        },
        totalBikes: { $sum: 1 }
      }
    }
  ]).toArray();

  // Recent sales (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentSales = await sellRecordsCollection.aggregate([
    {
      $match: {
        sellDate: { $gte: thirtyDaysAgo },
        ...(partnerId && { 'partnerShare.partnerId': new ObjectId(partnerId) })
      }
    },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        revenue: { $sum: '$sellingPrice' },
        profit: { $sum: '$profit' }
      }
    }
  ]).toArray();

  // Pending payments
  const pendingPayments = await sellRecordsCollection.aggregate([
    {
      $match: {
        $or: [
          { paymentStatus: 'pending' },
          { dueAmount: { $gt: 0 } }
        ],
        ...(partnerId && { 'partnerShare.partnerId': new ObjectId(partnerId) })
      }
    },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        totalDue: { $sum: '$dueAmount' }
      }
    }
  ]).toArray();

  // Partner investments summary
  const partnerInvestments = await bikesCollection.aggregate([
    { $unwind: '$partnerInvestments' },
    {
      $match: {
        ...(partnerId && { 'partnerInvestments.partnerId': new ObjectId(partnerId) })
      }
    },
    {
      $group: {
        _id: null,
        totalPartnerInvestment: { $sum: '$partnerInvestments.amount' },
        totalPartnerProfit: { $sum: '$partnerInvestments.profitEarned' },
        activePartnerInvestments: {
          $sum: {
            $cond: {
              if: { $ne: ['$status', 'sold'] },
              then: '$partnerInvestments.amount',
              else: 0
            }
          }
        }
      }
    }
  ]).toArray();

  // Monthly trend (last 12 months)
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
  
  const monthlyTrend = await sellRecordsCollection.aggregate([
    {
      $match: {
        sellDate: { $gte: twelveMonthsAgo },
        ...(partnerId && { 'partnerShare.partnerId': new ObjectId(partnerId) })
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$sellDate' },
          month: { $month: '$sellDate' }
        },
        revenue: { $sum: '$sellingPrice' },
        profit: { $sum: '$profit' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]).toArray();

  // Top performing bikes
  const topBikes = await bikesCollection.aggregate([
    {
      $match: {
        status: 'sold',
        profit: { $gt: 0 },
        ...partnerFilter
      }
    },
    {
      $project: {
        name: 1,
        model: 1,
        brand: 1,
        purchasePrice: 1,
        sellingPrice: 1,
        profit: 1,
        profitMargin: {
          $multiply: [
            { $divide: ['$profit', '$purchasePrice'] },
            100
          ]
        }
      }
    },
    { $sort: { profit: -1 } },
    { $limit: 10 }
  ]).toArray();

  const metrics = overallMetrics[0] || {
    totalInventoryValue: 0,
    totalInvestment: 0,
    totalRevenue: 0,
    totalProfit: 0,
    activeBikes: 0,
    soldBikes: 0,
    totalBikes: 0
  };

  const recent = recentSales[0] || { count: 0, revenue: 0, profit: 0 };
  const pending = pendingPayments[0] || { count: 0, totalDue: 0 };
  const partnerInv = partnerInvestments[0] || {
    totalPartnerInvestment: 0,
    totalPartnerProfit: 0,
    activePartnerInvestments: 0
  };

  return NextResponse.json({
    success: true,
    data: {
      overview: {
        ...metrics,
        profitMargin: metrics.totalRevenue > 0 
          ? Math.round((metrics.totalProfit / metrics.totalRevenue) * 10000) / 100
          : 0,
        roi: metrics.totalInvestment > 0 
          ? Math.round((metrics.totalProfit / metrics.totalInvestment) * 10000) / 100
          : 0,
        turnoverRate: metrics.totalBikes > 0 
          ? Math.round((metrics.soldBikes / metrics.totalBikes) * 10000) / 100
          : 0
      },
      recentActivity: {
        sales: recent,
        pendingPayments: pending
      },
      partnerInvestments: partnerInv,
      trends: {
        monthly: monthlyTrend,
        topPerformers: topBikes
      },
      generatedAt: new Date()
    }
  });
}

// Profit & Loss Report
async function getProfitLossReport(db: any, dateFilter: any, period: string, partnerId?: string) {
  const sellRecordsCollection = db.collection(Collections.SELL_RECORDS);
  const bikesCollection = db.collection(Collections.BIKES);

  // Build match filter
  const matchFilter: any = {
    sellDate: dateFilter,
    ...(partnerId && { 'partnerShare.partnerId': new ObjectId(partnerId) })
  };

  // Group by period
  let groupBy: any;
  switch (period) {
    case 'day':
      groupBy = {
        year: { $year: '$sellDate' },
        month: { $month: '$sellDate' },
        day: { $dayOfMonth: '$sellDate' }
      };
      break;
    case 'week':
      groupBy = {
        year: { $year: '$sellDate' },
        week: { $week: '$sellDate' }
      };
      break;
    case 'quarter':
      groupBy = {
        year: { $year: '$sellDate' },
        quarter: {
          $ceil: { $divide: [{ $month: '$sellDate' }, 3] }
        }
      };
      break;
    case 'year':
      groupBy = {
        year: { $year: '$sellDate' }
      };
      break;
    default: // month
      groupBy = {
        year: { $year: '$sellDate' },
        month: { $month: '$sellDate' }
      };
  }

  const profitLossData = await sellRecordsCollection.aggregate([
    { $match: matchFilter },
    {
      $lookup: {
        from: Collections.BIKES,
        localField: 'bikeId',
        foreignField: '_id',
        as: 'bike'
      }
    },
    { $unwind: '$bike' },
    {
      $group: {
        _id: groupBy,
        revenue: { $sum: '$sellingPrice' },
        cogs: { $sum: '$bike.purchasePrice' }, // Cost of Goods Sold
        grossProfit: { $sum: '$profit' },
        salesCount: { $sum: 1 },
        averageSalePrice: { $avg: '$sellingPrice' },
        averageCost: { $avg: '$bike.purchasePrice' },
        partnerPayouts: {
          $sum: {
            $reduce: {
              input: '$partnerShare',
              initialValue: 0,
              in: { $add: ['$$value', '$$this.amount'] }
            }
          }
        }
      }
    },
    {
      $addFields: {
        grossMargin: {
          $cond: {
            if: { $gt: ['$revenue', 0] },
            then: {
              $multiply: [
                { $divide: ['$grossProfit', '$revenue'] },
                100
              ]
            },
            else: 0
          }
        },
        netProfit: {
          $subtract: ['$grossProfit', '$partnerPayouts']
        }
      }
    },
    {
      $addFields: {
        netMargin: {
          $cond: {
            if: { $gt: ['$revenue', 0] },
            then: {
              $multiply: [
                { $divide: ['$netProfit', '$revenue'] },
                100
              ]
            },
            else: 0
          }
        }
      }
    },
    { $sort: { '_id': 1 } }
  ]).toArray();

  // Calculate totals
  const totals = profitLossData.reduce((acc, item) => {
    acc.revenue += item.revenue;
    acc.cogs += item.cogs;
    acc.grossProfit += item.grossProfit;
    acc.partnerPayouts += item.partnerPayouts;
    acc.netProfit += item.netProfit;
    acc.salesCount += item.salesCount;
    return acc;
  }, {
    revenue: 0,
    cogs: 0,
    grossProfit: 0,
    partnerPayouts: 0,
    netProfit: 0,
    salesCount: 0
  });

  return NextResponse.json({
    success: true,
    data: {
      period,
      dateRange: dateFilter,
      breakdown: profitLossData,
      summary: {
        ...totals,
        grossMargin: totals.revenue > 0 ? Math.round((totals.grossProfit / totals.revenue) * 10000) / 100 : 0,
        netMargin: totals.revenue > 0 ? Math.round((totals.netProfit / totals.revenue) * 10000) / 100 : 0,
        averageSalePrice: totals.salesCount > 0 ? Math.round((totals.revenue / totals.salesCount) * 100) / 100 : 0,
        averageCost: totals.salesCount > 0 ? Math.round((totals.cogs / totals.salesCount) * 100) / 100 : 0
      },
      generatedAt: new Date()
    }
  });
}

// Cash Flow Report
async function getCashFlowReport(db: any, dateFilter: any, period: string) {
  const sellRecordsCollection = db.collection(Collections.SELL_RECORDS);
  const bikesCollection = db.collection(Collections.BIKES);

  // Cash inflows (sales)
  const cashInflows = await sellRecordsCollection.aggregate([
    {
      $match: {
        sellDate: dateFilter,
        paymentStatus: 'paid'
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$sellDate' },
          month: { $month: '$sellDate' }
        },
        salesRevenue: { $sum: '$sellingPrice' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id': 1 } }
  ]).toArray();

  // Cash outflows (purchases)
  const cashOutflows = await bikesCollection.aggregate([
    {
      $match: {
        purchaseDate: dateFilter
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$purchaseDate' },
          month: { $month: '$purchaseDate' }
        },
        purchases: { $sum: '$purchasePrice' },
        partnerInvestments: {
          $sum: {
            $reduce: {
              input: '$partnerInvestments',
              initialValue: 0,
              in: { $add: ['$$value', '$$this.amount'] }
            }
          }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id': 1 } }
  ]).toArray();

  // Partner payouts
  const partnerPayouts = await sellRecordsCollection.aggregate([
    {
      $match: {
        sellDate: dateFilter
      }
    },
    { $unwind: '$partnerShare' },
    {
      $group: {
        _id: {
          year: { $year: '$sellDate' },
          month: { $month: '$sellDate' }
        },
        payouts: { $sum: '$partnerShare.amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id': 1 } }
  ]).toArray();

  // Combine data
  const cashFlowData = [];
  const allPeriods = new Set();
  
  [...cashInflows, ...cashOutflows, ...partnerPayouts].forEach(item => {
    const key = `${item._id.year}-${item._id.month}`;
    allPeriods.add(key);
  });

  Array.from(allPeriods).sort().forEach(period => {
    const [year, month] = period.split('-').map(Number);
    
    const inflow = cashInflows.find(item => 
      item._id.year === year && item._id.month === month
    ) || { salesRevenue: 0 };
    
    const outflow = cashOutflows.find(item => 
      item._id.year === year && item._id.month === month
    ) || { purchases: 0, partnerInvestments: 0 };
    
    const payout = partnerPayouts.find(item => 
      item._id.year === year && item._id.month === month
    ) || { payouts: 0 };

    const netCashFlow = inflow.salesRevenue - outflow.purchases - payout.payouts;
    
    cashFlowData.push({
      period: { year, month },
      inflows: {
        salesRevenue: inflow.salesRevenue
      },
      outflows: {
        purchases: outflow.purchases,
        partnerPayouts: payout.payouts,
        total: outflow.purchases + payout.payouts
      },
      netCashFlow,
      partnerInvestments: outflow.partnerInvestments
    });
  });

  return NextResponse.json({
    success: true,
    data: {
      period,
      dateRange: dateFilter,
      cashFlow: cashFlowData,
      summary: {
        totalInflows: cashFlowData.reduce((sum, item) => sum + item.inflows.salesRevenue, 0),
        totalOutflows: cashFlowData.reduce((sum, item) => sum + item.outflows.total, 0),
        netCashFlow: cashFlowData.reduce((sum, item) => sum + item.netCashFlow, 0),
        totalPartnerInvestments: cashFlowData.reduce((sum, item) => sum + item.partnerInvestments, 0)
      },
      generatedAt: new Date()
    }
  });
}

// Partner Performance Report
async function getPartnerPerformanceReport(db: any, dateFilter: any, partnerId?: string) {
  const partnersCollection = db.collection(Collections.PARTNERS);
  const bikesCollection = db.collection(Collections.BIKES);

  const matchFilter = partnerId ? { _id: new ObjectId(partnerId) } : {};

  const partnerPerformance = await partnersCollection.aggregate([
    { $match: matchFilter },
    {
      $lookup: {
        from: Collections.BIKES,
        let: { partnerId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $in: ['$$partnerId', '$partnerInvestments.partnerId']
              }
            }
          },
          {
            $addFields: {
              partnerInvestment: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: '$partnerInvestments',
                      cond: { $eq: ['$$this.partnerId', '$$partnerId'] }
                    }
                  },
                  0
                ]
              }
            }
          }
        ],
        as: 'investments'
      }
    },
    {
      $addFields: {
        performance: {
          totalInvestment: {
            $sum: '$investments.partnerInvestment.amount'
          },
          totalProfit: {
            $sum: '$investments.partnerInvestment.profitEarned'
          },
          activeBikes: {
            $size: {
              $filter: {
                input: '$investments',
                cond: { $ne: ['$$this.status', 'sold'] }
              }
            }
          },
          soldBikes: {
            $size: {
              $filter: {
                input: '$investments',
                cond: { $eq: ['$$this.status', 'sold'] }
              }
            }
          },
          totalBikes: { $size: '$investments' },
          averageInvestmentPerBike: {
            $cond: {
              if: { $gt: [{ $size: '$investments' }, 0] },
              then: {
                $divide: [
                  { $sum: '$investments.partnerInvestment.amount' },
                  { $size: '$investments' }
                ]
              },
              else: 0
            }
          },
          roi: {
            $cond: {
              if: { $gt: [{ $sum: '$investments.partnerInvestment.amount' }, 0] },
              then: {
                $multiply: [
                  {
                    $divide: [
                      { $sum: '$investments.partnerInvestment.profitEarned' },
                      { $sum: '$investments.partnerInvestment.amount' }
                    ]
                  },
                  100
                ]
              },
              else: 0
            }
          }
        }
      }
    },
    {
      $project: {
        name: 1,
        email: 1,
        status: 1,
        joinDate: 1,
        riskTolerance: 1,
        performance: 1,
        investments: {
          $map: {
            input: '$investments',
            as: 'bike',
            in: {
              bikeId: '$$bike._id',
              bikeName: '$$bike.name',
              bikeModel: '$$bike.model',
              status: '$$bike.status',
              investment: '$$bike.partnerInvestment.amount',
              profitEarned: '$$bike.partnerInvestment.profitEarned',
              percentage: '$$bike.partnerInvestment.percentage',
              investmentDate: '$$bike.partnerInvestment.investmentDate'
            }
          }
        }
      }
    },
    { $sort: { 'performance.roi': -1 } }
  ]).toArray();

  return NextResponse.json({
    success: true,
    data: {
      partners: partnerPerformance,
      summary: {
        totalPartners: partnerPerformance.length,
        totalInvestment: partnerPerformance.reduce((sum, p) => sum + p.performance.totalInvestment, 0),
        totalProfit: partnerPerformance.reduce((sum, p) => sum + p.performance.totalProfit, 0),
        averageROI: partnerPerformance.length > 0 
          ? partnerPerformance.reduce((sum, p) => sum + p.performance.roi, 0) / partnerPerformance.length
          : 0
      },
      generatedAt: new Date()
    }
  });
}

// Inventory Valuation Report
async function getInventoryValuationReport(db: any, dateFilter: any) {
  const bikesCollection = db.collection(Collections.BIKES);

  const inventoryData = await bikesCollection.aggregate([
    {
      $match: {
        status: { $ne: 'sold' }
      }
    },
    {
      $group: {
        _id: {
          brand: '$brand',
          status: '$status'
        },
        count: { $sum: 1 },
        totalCost: { $sum: '$purchasePrice' },
        averageCost: { $avg: '$purchasePrice' },
        totalPartnerInvestment: {
          $sum: {
            $reduce: {
              input: '$partnerInvestments',
              initialValue: 0,
              in: { $add: ['$$value', '$$this.amount'] }
            }
          }
        },
        bikes: {
          $push: {
            _id: '$_id',
            name: '$name',
            model: '$model',
            year: '$year',
            purchasePrice: '$purchasePrice',
            purchaseDate: '$purchaseDate',
            condition: '$condition',
            daysInInventory: {
              $divide: [
                { $subtract: [new Date(), '$purchaseDate'] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        }
      }
    },
    { $sort: { '_id.brand': 1, '_id.status': 1 } }
  ]).toArray();

  // Calculate aging analysis
  const agingAnalysis = await bikesCollection.aggregate([
    {
      $match: {
        status: { $ne: 'sold' }
      }
    },
    {
      $addFields: {
        daysInInventory: {
          $divide: [
            { $subtract: [new Date(), '$purchaseDate'] },
            1000 * 60 * 60 * 24
          ]
        }
      }
    },
    {
      $bucket: {
        groupBy: '$daysInInventory',
        boundaries: [0, 30, 60, 90, 180, 365, Infinity],
        default: 'Other',
        output: {
          count: { $sum: 1 },
          totalValue: { $sum: '$purchasePrice' },
          bikes: {
            $push: {
              _id: '$_id',
              name: '$name',
              purchasePrice: '$purchasePrice',
              daysInInventory: '$daysInInventory'
            }
          }
        }
      }
    }
  ]).toArray();

  return NextResponse.json({
    success: true,
    data: {
      inventory: inventoryData,
      aging: agingAnalysis,
      summary: {
        totalBikes: inventoryData.reduce((sum, item) => sum + item.count, 0),
        totalValue: inventoryData.reduce((sum, item) => sum + item.totalCost, 0),
        totalPartnerInvestment: inventoryData.reduce((sum, item) => sum + item.totalPartnerInvestment, 0),
        averageValue: inventoryData.length > 0 
          ? inventoryData.reduce((sum, item) => sum + item.totalCost, 0) / inventoryData.reduce((sum, item) => sum + item.count, 0)
          : 0
      },
      generatedAt: new Date()
    }
  });
}

// Projections Report
async function getProjectionsReport(db: any, dateFilter: any) {
  const bikesCollection = db.collection(Collections.BIKES);
  const sellRecordsCollection = db.collection(Collections.SELL_RECORDS);

  // Historical performance for projections
  const historicalData = await sellRecordsCollection.aggregate([
    {
      $match: {
        sellDate: {
          $gte: new Date(new Date().getFullYear() - 1, 0, 1) // Last year
        }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$sellDate' },
          month: { $month: '$sellDate' }
        },
        revenue: { $sum: '$sellingPrice' },
        profit: { $sum: '$profit' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]).toArray();

  // Current inventory for turnover projections
  const currentInventory = await bikesCollection.aggregate([
    {
      $match: {
        status: { $ne: 'sold' }
      }
    },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        totalValue: { $sum: '$purchasePrice' },
        averageDaysInInventory: {
          $avg: {
            $divide: [
              { $subtract: [new Date(), '$purchaseDate'] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      }
    }
  ]).toArray();

  // Simple projections based on historical averages
  const avgMonthlyRevenue = historicalData.length > 0 
    ? historicalData.reduce((sum, item) => sum + item.revenue, 0) / historicalData.length
    : 0;
  
  const avgMonthlyProfit = historicalData.length > 0 
    ? historicalData.reduce((sum, item) => sum + item.profit, 0) / historicalData.length
    : 0;

  const avgMonthlySales = historicalData.length > 0 
    ? historicalData.reduce((sum, item) => sum + item.count, 0) / historicalData.length
    : 0;

  // Generate next 6 months projections
  const projections = [];
  const currentDate = new Date();
  
  for (let i = 1; i <= 6; i++) {
    const projectionDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
    
    // Apply seasonal factors (simplified)
    const seasonalFactor = Math.sin((projectionDate.getMonth() / 12) * 2 * Math.PI) * 0.2 + 1;
    
    projections.push({
      period: {
        year: projectionDate.getFullYear(),
        month: projectionDate.getMonth() + 1
      },
      projectedRevenue: Math.round(avgMonthlyRevenue * seasonalFactor),
      projectedProfit: Math.round(avgMonthlyProfit * seasonalFactor),
      projectedSales: Math.round(avgMonthlySales * seasonalFactor),
      confidence: Math.max(0.6, 1 - (i * 0.1)) // Decreasing confidence over time
    });
  }

  return NextResponse.json({
    success: true,
    data: {
      historical: historicalData,
      projections,
      currentInventory: currentInventory[0] || {
        count: 0,
        totalValue: 0,
        averageDaysInInventory: 0
      },
      assumptions: {
        basedOnMonths: historicalData.length,
        seasonalAdjustment: true,
        confidenceDecay: 0.1
      },
      generatedAt: new Date()
    }
  });
}

// POST - Create financial transaction or adjustment
export async function POST(request: NextRequest) {
  try {
    const adminAuth = await verifyAdmin(request);
    if (!adminAuth.success) {
      return NextResponse.json(
        { success: false, error: adminAuth.error },
        { status: adminAuth.status }
      );
    }

    const body = await request.json();
    const { type, ...transactionData } = body;

    const { db } = await connectToDatabase();

    switch (type) {
      case 'expense':
        return await createExpenseRecord(db, transactionData, admin);
      
      case 'adjustment':
        return await createFinancialAdjustment(db, transactionData, admin);
      
      case 'partner-payout':
        return await processPartnerPayout(db, transactionData, admin);
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid transaction type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error creating financial transaction:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create financial transaction' },
      { status: 500 }
    );
  }
}

// Helper functions for POST operations
async function createExpenseRecord(db: any, data: any, admin: any) {
  const expensesCollection = db.collection('expenses');
  
  const expense = {
    ...data,
    createdAt: new Date(),
    createdBy: adminAuth.admin.email,
    status: 'recorded'
  };
  
  const result = await expensesCollection.insertOne(expense);
  
  return NextResponse.json({
    success: true,
    message: 'Expense recorded successfully',
    data: { expenseId: result.insertedId }
  }, { status: 201 });
}

async function createFinancialAdjustment(db: any, data: any, admin: any) {
  const adjustmentsCollection = db.collection('financial_adjustments');
  
  const adjustment = {
    ...data,
    createdAt: new Date(),
    createdBy: admin.email,
    status: 'applied'
  };
  
  const result = await adjustmentsCollection.insertOne(adjustment);
  
  return NextResponse.json({
    success: true,
    message: 'Financial adjustment created successfully',
    data: { adjustmentId: result.insertedId }
  }, { status: 201 });
}

async function processPartnerPayout(db: any, data: any, admin: any) {
  const payoutsCollection = db.collection('partner_payouts');
  const partnersCollection = db.collection(Collections.PARTNERS);
  
  // Validate partner exists
  const partner = await partnersCollection.findOne({ _id: new ObjectId(data.partnerId) });
  if (!partner) {
    return NextResponse.json(
      { success: false, error: 'Partner not found' },
      { status: 404 }
    );
  }
  
  const payout = {
    ...data,
    processedAt: new Date(),
    processedBy: adminAuth.admin.email,
    status: 'completed'
  };
  
  const result = await payoutsCollection.insertOne(payout);
  
  return NextResponse.json({
    success: true,
    message: 'Partner payout processed successfully',
    data: { payoutId: result.insertedId }
  }, { status: 201 });
}