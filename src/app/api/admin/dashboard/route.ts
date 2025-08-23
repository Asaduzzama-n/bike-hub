// import { NextRequest, NextResponse } from 'next/server';
// import { connectToDatabase } from '@/lib/mongodb';
// import { cookies } from 'next/headers';
// import { jwtVerify } from 'jose';

// // Verify admin authentication
// async function verifyAdmin(request: NextRequest) {
//   try {
//     const cookieStore = cookies();
//     const token = cookieStore.get('adminToken')?.value;

//     if (!token) {
//       return null;
//     }

//     const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');
//     const { payload } = await jwtVerify(token, secret);
//     return payload;
//   } catch (error) {
//     return null;
//   }
// }

// // GET - Fetch dashboard analytics data
// export async function GET(request: NextRequest) {
//   try {
//     const admin = await verifyAdmin(request);
//     if (!admin) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const { searchParams } = new URL(request.url);
//     const period = searchParams.get('period') || 'month'; // 'week', 'month', 'quarter', 'year'

//     const { db } = await connectToDatabase();

//     // Get date range based on period
//     const dateRange = getDateRange(period);

//     // Fetch all required data in parallel
//     const [keyMetrics, salesTrend, brandDistribution, trailingBikes, recentActivity, partnerSummary] = await Promise.all([
//       getKeyMetrics(db, dateRange),
//       getSalesTrend(db, period),
//       getBrandDistribution(db),
//       getTrailingBikes(db),
//       getRecentActivity(db),
//       getPartnerSummary(db)
//     ]);

//     return NextResponse.json({
//       keyMetrics,
//       salesTrend,
//       brandDistribution,
//       trailingBikes,
//       recentActivity,
//       partnerSummary,
//       period,
//       lastUpdated: new Date().toISOString()
//     });
//   } catch (error) {
//     console.error('Error fetching dashboard data:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }

// // Helper function to get date range based on period
// function getDateRange(period: string) {
//   const now = new Date();
//   const startDate = new Date();

//   switch (period) {
//     case 'week':
//       startDate.setDate(now.getDate() - 7);
//       break;
//     case 'month':
//       startDate.setMonth(now.getMonth() - 1);
//       break;
//     case 'quarter':
//       startDate.setMonth(now.getMonth() - 3);
//       break;
//     case 'year':
//       startDate.setFullYear(now.getFullYear() - 1);
//       break;
//     default:
//       startDate.setMonth(now.getMonth() - 1);
//   }

//   return { startDate, endDate: now };
// }

// // Get key metrics
// async function getKeyMetrics(db: any, dateRange: any) {
//   const bikesCollection = db.collection('bikes');
//   const transactionsCollection = db.collection('transactions');
//   const costsCollection = db.collection('costs');

//   // Current period metrics
//   const [soldBikes, availableBikes, totalCosts, transactions] = await Promise.all([
//     bikesCollection.find({
//       status: 'sold',
//       soldDate: { $gte: dateRange.startDate, $lte: dateRange.endDate }
//     }).toArray(),
//     bikesCollection.countDocuments({ status: 'available' }),
//     costsCollection.find({
//       createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate }
//     }).toArray(),
//     transactionsCollection.find({
//       type: 'sale',
//       createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate }
//     }).toArray()
//   ]);

//   // Calculate metrics
//   const totalProfit = soldBikes.reduce((sum, bike) => sum + (bike.profit || 0), 0);
//   const totalRevenue = soldBikes.reduce((sum, bike) => sum + bike.sellPrice, 0);
//   const totalExpenses = totalCosts.reduce((sum, cost) => sum + cost.amount, 0);
  
//   // Calculate forecasted profit from available bikes
//   const availableBikesData = await bikesCollection.find({ status: 'available' }).toArray();
//   const forecastedProfit = availableBikesData.reduce((sum, bike) => sum + (bike.profit || 0), 0);

//   // Calculate average sell time
//   const soldBikesWithTime = soldBikes.filter(bike => bike.listedDate && bike.soldDate);
//   const averageSellTime = soldBikesWithTime.length > 0 
//     ? soldBikesWithTime.reduce((sum, bike) => {
//         const listedDate = new Date(bike.listedDate);
//         const soldDate = new Date(bike.soldDate);
//         return sum + (soldDate.getTime() - listedDate.getTime());
//       }, 0) / soldBikesWithTime.length / (1000 * 60 * 60 * 24) // Convert to days
//     : 0;

//   // Previous period for comparison
//   const prevStartDate = new Date(dateRange.startDate);
//   const prevEndDate = new Date(dateRange.startDate);
//   const timeDiff = dateRange.endDate.getTime() - dateRange.startDate.getTime();
//   prevStartDate.setTime(prevStartDate.getTime() - timeDiff);

//   const prevSoldBikes = await bikesCollection.find({
//     status: 'sold',
//     soldDate: { $gte: prevStartDate, $lt: dateRange.startDate }
//   }).toArray();
  
//   const prevProfit = prevSoldBikes.reduce((sum, bike) => sum + (bike.profit || 0), 0);
//   const profitGrowth = prevProfit > 0 ? ((totalProfit - prevProfit) / prevProfit) * 100 : 0;

//   return {
//     totalProfit,
//     totalRevenue,
//     totalExpenses,
//     forecastedProfit,
//     totalBikes: availableBikes + soldBikes.length,
//     soldBikes: soldBikes.length,
//     availableBikes,
//     averageSellTime: Math.round(averageSellTime),
//     profitGrowth: parseFloat(profitGrowth.toFixed(1))
//   };
// }

// // Get sales and profit trend
// async function getSalesTrend(db: any, period: string) {
//   const transactionsCollection = db.collection('transactions');
  
//   let groupBy: any;
//   let dateFormat: string;
  
//   switch (period) {
//     case 'week':
//       groupBy = {
//         year: { $year: '$createdAt' },
//         month: { $month: '$createdAt' },
//         day: { $dayOfMonth: '$createdAt' }
//       };
//       dateFormat = 'day';
//       break;
//     case 'year':
//       groupBy = {
//         year: { $year: '$createdAt' },
//         month: { $month: '$createdAt' }
//       };
//       dateFormat = 'month';
//       break;
//     default:
//       groupBy = {
//         year: { $year: '$createdAt' },
//         month: { $month: '$createdAt' },
//         week: { $week: '$createdAt' }
//       };
//       dateFormat = 'week';
//   }

//   const pipeline = [
//     {
//       $match: {
//         type: 'sale',
//         createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
//       }
//     },
//     {
//       $group: {
//         _id: groupBy,
//         sales: { $sum: '$amount' },
//         profit: { $sum: '$profit' },
//         count: { $sum: 1 }
//       }
//     },
//     {
//       $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 }
//     }
//   ];

//   const results = await transactionsCollection.aggregate(pipeline).toArray();
  
//   // Format results based on period
//   return results.map((item, index) => {
//     let label = '';
//     if (dateFormat === 'day') {
//       label = `${item._id.month}/${item._id.day}`;
//     } else if (dateFormat === 'month') {
//       const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//       label = months[item._id.month - 1];
//     } else {
//       label = `Week ${item._id.week}`;
//     }
    
//     return {
//       name: label,
//       sales: item.sales || 0,
//       profit: item.profit || 0,
//       count: item.count || 0
//     };
//   });
// }

// // Get brand distribution
// async function getBrandDistribution(db: any) {
//   const bikesCollection = db.collection('bikes');
  
//   const pipeline = [
//     {
//       $group: {
//         _id: '$brand',
//         count: { $sum: 1 },
//         totalValue: { $sum: '$sellPrice' },
//         sold: {
//           $sum: {
//             $cond: [{ $eq: ['$status', 'sold'] }, 1, 0]
//           }
//         }
//       }
//     },
//     {
//       $sort: { count: -1 }
//     }
//   ];

//   const results = await bikesCollection.aggregate(pipeline).toArray();
  
//   const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
//   return results.map((item, index) => ({
//     name: item._id || 'Unknown',
//     value: item.count,
//     totalValue: item.totalValue,
//     sold: item.sold,
//     color: colors[index % colors.length]
//   }));
// }

// // Get trailing bikes (bikes taking too long to sell)
// async function getTrailingBikes(db: any) {
//   const bikesCollection = db.collection('bikes');
  
//   const thirtyDaysAgo = new Date();
//   thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
//   const trailingBikes = await bikesCollection.find({
//     status: 'available',
//     listedDate: { $lt: thirtyDaysAgo }
//   }).sort({ listedDate: 1 }).limit(10).toArray();
  
//   return trailingBikes.map(bike => {
//     const daysListed = Math.floor((Date.now() - new Date(bike.listedDate).getTime()) / (1000 * 60 * 60 * 24));
//     return {
//       id: bike._id,
//       brand: bike.brand,
//       model: bike.model,
//       year: bike.year,
//       sellPrice: bike.sellPrice,
//       daysListed,
//       profit: bike.profit || 0
//     };
//   });
// }

// // Get recent activity
// async function getRecentActivity(db: any) {
//   const transactionsCollection = db.collection('transactions');
//   const documentsCollection = db.collection('documents');
//   const bikesCollection = db.collection('bikes');
  
//   const [recentTransactions, recentDocuments, recentBikes] = await Promise.all([
//     transactionsCollection.find({}).sort({ createdAt: -1 }).limit(5).toArray(),
//     documentsCollection.find({}).sort({ uploadDate: -1 }).limit(3).toArray(),
//     bikesCollection.find({}).sort({ createdAt: -1 }).limit(3).toArray()
//   ]);
  
//   const activities = [];
  
//   // Add transactions
//   recentTransactions.forEach(transaction => {
//     activities.push({
//       id: transaction._id,
//       type: 'transaction',
//       title: `${transaction.type === 'sale' ? 'Sold' : 'Purchased'} ${transaction.bikeName || 'bike'}`,
//       description: `$${transaction.amount} ${transaction.type}`,
//       timestamp: transaction.createdAt,
//       icon: transaction.type === 'sale' ? 'sale' : 'purchase'
//     });
//   });
  
//   // Add document verifications
//   recentDocuments.forEach(doc => {
//     activities.push({
//       id: doc._id,
//       type: 'document',
//       title: `${doc.type.toUpperCase()} document ${doc.status}`,
//       description: `${doc.userName} - ${doc.documentNumber}`,
//       timestamp: doc.verificationDate || doc.uploadDate,
//       icon: doc.status
//     });
//   });
  
//   // Add new bike listings
//   recentBikes.forEach(bike => {
//     activities.push({
//       id: bike._id,
//       type: 'bike',
//       title: `New bike listed`,
//       description: `${bike.brand} ${bike.model} ${bike.year}`,
//       timestamp: bike.createdAt,
//       icon: 'listing'
//     });
//   });
  
//   // Sort by timestamp and return top 10
//   return activities
//     .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
//     .slice(0, 10);
// }

// // Get partner summary
// async function getPartnerSummary(db: any) {
//   const partnersCollection = db.collection('partners');
  
//   const partners = await partnersCollection.find({}).toArray();
  
//   const summary = {
//     totalPartners: partners.length,
//     activePartners: partners.filter(p => p.activeInvestments > 0).length,
//     totalInvestments: partners.reduce((sum, p) => sum + p.totalInvestment, 0),
//     totalReturns: partners.reduce((sum, p) => sum + p.totalReturns, 0),
//     pendingPayouts: partners.reduce((sum, p) => sum + p.pendingPayout, 0),
//     averageROI: partners.length > 0 
//       ? partners.reduce((sum, p) => {
//           const roi = p.totalInvestment > 0 ? (p.totalReturns / p.totalInvestment) * 100 : 0;
//           return sum + roi;
//         }, 0) / partners.length
//       : 0
//   };
  
//   return {
//     ...summary,
//     averageROI: parseFloat(summary.averageROI.toFixed(1)),
//     topPartners: partners
//       .sort((a, b) => b.totalInvestment - a.totalInvestment)
//       .slice(0, 5)
//       .map(p => ({
//         name: p.name,
//         investment: p.totalInvestment,
//         returns: p.totalReturns,
//         roi: p.totalInvestment > 0 ? ((p.totalReturns / p.totalInvestment) * 100).toFixed(1) : '0'
//       }))
//   };
// }

// // POST - Update dashboard preferences
// export async function POST(request: NextRequest) {
//   try {
//     const admin = await verifyAdmin(request);
//     if (!admin) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const body = await request.json();
//     const { preferences } = body;

//     // In a real application, this would save user preferences to database
//     // For now, we'll just return success
//     return NextResponse.json({
//       message: 'Dashboard preferences updated successfully',
//       preferences
//     });
//   } catch (error) {
//     console.error('Error updating dashboard preferences:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }