// import { NextRequest, NextResponse } from 'next/server';
// // import { connectToDatabase } from '@/lib/mongodb';
// import { ObjectId } from 'mongodb';
// import { cookies } from 'next/headers';
// import { jwtVerify } from 'jose';

// // Verify admin authentication
// // async function verifyAdmin(request: NextRequest) {
// //   try {
// //     const cookieStore = cookies();
// //     const token = cookieStore.get('adminToken')?.value;

// //     if (!token) {
// //       return null;
// //     }

// //     const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');
// //     const { payload } = await jwtVerify(token, secret);
// //     return payload;
// //   } catch (error) {
// //     return null;
// //   }
// // }

// // GET - Fetch financial data with analytics
// // export async function GET(request: NextRequest) {
// //   try {
// //     const admin = await verifyAdmin(request);
// //     if (!admin) {
// //       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
// //     }

// //     const { searchParams } = new URL(request.url);
// //     const type = searchParams.get('type'); // 'overview', 'transactions', 'costs', 'partners'
// //     const period = searchParams.get('period') || '2024';
// //     const page = parseInt(searchParams.get('page') || '1');
// //     const limit = parseInt(searchParams.get('limit') || '10');

// //     // const { db } = await connectToDatabase();

// //     switch (type) {
// //       case 'overview':
// //         return await getFinancialOverview(db, period);
// //       case 'transactions':
// //         return await getTransactions(db, page, limit, period);
// //       case 'costs':
// //         return await getCosts(db, page, limit, period);
// //       case 'partners':
// //         return await getPartners(db);
// //       default:
// //         return await getFinancialOverview(db, period);
// //     }
// //   } catch (error) {
// //     console.error('Error fetching financial data:', error);
// //     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
// //   }
// // }

// // Get financial overview with key metrics
// async function getFinancialOverview(db: any, period: string) {
//   const bikesCollection = db.collection('bikes');
//   const transactionsCollection = db.collection('transactions');
//   const costsCollection = db.collection('costs');

//   // Calculate date range based on period
//   let dateFilter = {};
//   const now = new Date();
  
//   if (period === 'last-6-months') {
//     const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
//     dateFilter = { createdAt: { $gte: sixMonthsAgo } };
//   } else if (period === 'last-3-months') {
//     const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
//     dateFilter = { createdAt: { $gte: threeMonthsAgo } };
//   } else {
//     const year = parseInt(period);
//     const startOfYear = new Date(year, 0, 1);
//     const endOfYear = new Date(year + 1, 0, 1);
//     dateFilter = { createdAt: { $gte: startOfYear, $lt: endOfYear } };
//   }

//   // Get sold bikes for revenue calculation
//   const soldBikes = await bikesCollection.find({
//     status: 'sold',
//     ...dateFilter
//   }).toArray();

//   // Get all costs
//   const costs = await costsCollection.find(dateFilter).toArray();

//   // Calculate metrics
//   const totalRevenue = soldBikes.reduce((sum, bike) => sum + bike.sellPrice, 0);
//   const totalCosts = soldBikes.reduce((sum, bike) => sum + bike.buyPrice, 0) +
//                     costs.reduce((sum, cost) => sum + cost.amount, 0);
//   const totalProfit = totalRevenue - totalCosts;
//   const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

//   // Get monthly profit trend
//   const monthlyData = await getMonthlyProfitTrend(db, period);

//   // Get cost breakdown
//   const costBreakdown = await getCostBreakdown(db, period);

//   // Forecasting based on current listings
//   const availableBikes = await bikesCollection.find({ status: 'available' }).toArray();
//   const forecastedProfit = availableBikes.reduce((sum, bike) => sum + (bike.profit || 0), 0);

//   return NextResponse.json({
//     overview: {
//       totalProfit,
//       totalRevenue,
//       totalCosts,
//       profitMargin: parseFloat(profitMargin.toFixed(2)),
//       forecastedProfit,
//       soldBikesCount: soldBikes.length,
//       availableBikesCount: availableBikes.length
//     },
//     monthlyTrend: monthlyData,
//     costBreakdown,
//     period
//   });
// }

// // Get monthly profit trend
// async function getMonthlyProfitTrend(db: any, period: string) {
//   const transactionsCollection = db.collection('transactions');
  
//   const pipeline = [
//     {
//       $match: {
//         type: 'sale',
//         createdAt: {
//           $gte: new Date(new Date().getFullYear(), 0, 1) // This year
//         }
//       }
//     },
//     {
//       $group: {
//         _id: {
//           year: { $year: '$createdAt' },
//           month: { $month: '$createdAt' }
//         },
//         profit: { $sum: '$profit' },
//         revenue: { $sum: '$amount' }
//       }
//     },
//     {
//       $sort: { '_id.year': 1, '_id.month': 1 }
//     }
//   ];

//   const results = await transactionsCollection.aggregate(pipeline).toArray();
  
//   // Format for chart
//   const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//   return months.map((month, index) => {
//     const data = results.find(r => r._id.month === index + 1);
//     return {
//       month,
//       profit: data?.profit || 0,
//       revenue: data?.revenue || 0
//     };
//   });
// }

// // Get cost breakdown by category
// async function getCostBreakdown(db: any, period: string) {
//   const costsCollection = db.collection('costs');
  
//   const pipeline = [
//     {
//       $group: {
//         _id: '$type',
//         total: { $sum: '$amount' }
//       }
//     }
//   ];

//   const results = await costsCollection.aggregate(pipeline).toArray();
  
//   const colors = {
//     repair: '#0088FE',
//     transport: '#00C49F',
//     marketing: '#FFBB28',
//     other: '#FF8042'
//   };

//   return results.map(item => ({
//     name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
//     value: item.total,
//     color: colors[item._id as keyof typeof colors] || '#8884d8'
//   }));
// }

// // Get transactions with pagination
// async function getTransactions(db: any, page: number, limit: number, period: string) {
//   const transactionsCollection = db.collection('transactions');
  
//   const total = await transactionsCollection.countDocuments();
//   const transactions = await transactionsCollection
//     .find({})
//     .sort({ createdAt: -1 })
//     .skip((page - 1) * limit)
//     .limit(limit)
//     .toArray();

//   return NextResponse.json({
//     transactions,
//     pagination: {
//       page,
//       limit,
//       total,
//       pages: Math.ceil(total / limit)
//     }
//   });
// }

// // Get costs with pagination
// async function getCosts(db: any, page: number, limit: number, period: string) {
//   const costsCollection = db.collection('costs');
  
//   const total = await costsCollection.countDocuments();
//   const costs = await costsCollection
//     .find({})
//     .sort({ createdAt: -1 })
//     .skip((page - 1) * limit)
//     .limit(limit)
//     .toArray();

//   return NextResponse.json({
//     costs,
//     pagination: {
//       page,
//       limit,
//       total,
//       pages: Math.ceil(total / limit)
//     }
//   });
// }

// // Get partners data
// async function getPartners(db: any) {
//   const partnersCollection = db.collection('partners');
//   const partners = await partnersCollection.find({}).toArray();

//   // Calculate summary statistics
//   const summary = {
//     totalPartners: partners.length,
//     totalInvestments: partners.reduce((sum, p) => sum + p.totalInvestment, 0),
//     totalReturns: partners.reduce((sum, p) => sum + p.totalReturns, 0),
//     pendingPayouts: partners.reduce((sum, p) => sum + p.pendingPayout, 0)
//   };

//   return NextResponse.json({
//     partners,
//     summary
//   });
// }

// // POST - Create new cost entry
// export async function POST(request: NextRequest) {
//   try {
//     const admin = await verifyAdmin(request);
//     if (!admin) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const body = await request.json();
//     const { type, amount, description, bikeId, adjustPrice } = body;

//     if (!type || !amount || !description) {
//       return NextResponse.json(
//         { error: 'Missing required fields' },
//         { status: 400 }
//       );
//     }

//     const { db } = await connectToDatabase();
//     const costsCollection = db.collection('costs');
//     const bikesCollection = db.collection('bikes');

//     // Create cost entry
//     const newCost = {
//       type,
//       amount: parseFloat(amount),
//       description,
//       bikeId: bikeId || null,
//       adjustPrice: adjustPrice || false,
//       createdAt: new Date(),
//       createdBy: admin.email
//     };

//     const result = await costsCollection.insertOne(newCost);

//     // If adjustPrice is true and bikeId is provided, update bike's sell price
//     if (adjustPrice && bikeId) {
//       const bike = await bikesCollection.findOne({ _id: new ObjectId(bikeId) });
//       if (bike) {
//         const newSellPrice = bike.sellPrice + parseFloat(amount);
//         const newProfit = newSellPrice - bike.buyPrice - (bike.totalCosts || 0) - parseFloat(amount);
        
//         await bikesCollection.updateOne(
//           { _id: new ObjectId(bikeId) },
//           {
//             $set: {
//               sellPrice: newSellPrice,
//               profit: newProfit,
//               totalCosts: (bike.totalCosts || 0) + parseFloat(amount),
//               updatedAt: new Date()
//             },
//             $push: {
//               repairs: {
//                 type,
//                 cost: parseFloat(amount),
//                 description,
//                 date: new Date()
//               }
//             }
//           }
//         );
//       }
//     }

//     return NextResponse.json({
//       message: 'Cost added successfully',
//       costId: result.insertedId
//     }, { status: 201 });
//   } catch (error) {
//     console.error('Error adding cost:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }

// // PUT - Update partner payout
// export async function PUT(request: NextRequest) {
//   try {
//     const admin = await verifyAdmin(request);
//     if (!admin) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const body = await request.json();
//     const { partnerId, action, amount } = body;

//     if (!partnerId || !action) {
//       return NextResponse.json(
//         { error: 'Missing required fields' },
//         { status: 400 }
//       );
//     }

//     const { db } = await connectToDatabase();
//     const partnersCollection = db.collection('partners');
//     const transactionsCollection = db.collection('transactions');

//     if (action === 'payout') {
//       // Process partner payout
//       const partner = await partnersCollection.findOne({ _id: new ObjectId(partnerId) });
//       if (!partner) {
//         return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
//       }

//       const payoutAmount = amount || partner.pendingPayout;
      
//       // Update partner record
//       await partnersCollection.updateOne(
//         { _id: new ObjectId(partnerId) },
//         {
//           $inc: {
//             totalReturns: payoutAmount,
//             pendingPayout: -payoutAmount
//           },
//           $set: {
//             lastPayoutDate: new Date(),
//             updatedAt: new Date()
//           }
//         }
//       );

//       // Record transaction
//       await transactionsCollection.insertOne({
//         type: 'partner_payout',
//         partnerId: new ObjectId(partnerId),
//         partnerName: partner.name,
//         amount: -payoutAmount,
//         description: `Profit sharing payout to ${partner.name}`,
//         createdAt: new Date(),
//         createdBy: admin.email
//       });

//       return NextResponse.json({ message: 'Payout processed successfully' });
//     }

//     return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
//   } catch (error) {
//     console.error('Error processing partner update:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }