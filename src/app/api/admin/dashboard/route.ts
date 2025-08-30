import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Bike, Transaction, Cost, Partner, DashboardAnalytics } from '@/lib/models';
import { withAdminAuth, AdminAuthRequest } from '@/lib/middleware/adminAuth';

// GET /api/admin/dashboard - Get dashboard analytics (admin only)
export const GET = withAdminAuth(
  async (request: AdminAuthRequest) => {
    try {
      await connectToDatabase();
      
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
      
      // Get current metrics
      const [
        totalBikes,
        availableBikes,
        soldBikes,
        totalPartners,
        activePartners,
        monthlyTransactions,
        yearlyTransactions,
        monthlyCosts,
        yearlyCosts,
        recentSales
      ] = await Promise.all([
        Bike.countDocuments(),
        Bike.countDocuments({ status: 'available' }),
        Bike.countDocuments({ status: 'sold' }),
        Partner.countDocuments(),
        Partner.countDocuments({ status: 'active' }),
        Transaction.find({ 
          createdAt: { $gte: startOfMonth },
          type: { $in: ['sale', 'purchase'] }
        }),
        Transaction.find({ 
          createdAt: { $gte: startOfYear },
          type: { $in: ['sale', 'purchase'] }
        }),
        Cost.find({ createdAt: { $gte: startOfMonth } }),
        Cost.find({ createdAt: { $gte: startOfYear } }),
        Bike.find({ 
          status: 'sold',
          soldDate: { $gte: thirtyDaysAgo }
        }).sort({ soldDate: -1 }).limit(5)
      ]);
      
      // Calculate financial metrics
      const monthlyRevenue = monthlyTransactions
        .filter(t => t.type === 'sale')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const monthlyExpenses = monthlyTransactions
        .filter(t => t.type === 'purchase')
        .reduce((sum, t) => sum + t.amount, 0) +
        monthlyCosts.reduce((sum, c) => sum + c.amount, 0);
      
      const monthlyProfit = monthlyRevenue - monthlyExpenses;
      
      const yearlyRevenue = yearlyTransactions
        .filter(t => t.type === 'sale')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const yearlyExpenses = yearlyTransactions
        .filter(t => t.type === 'purchase')
        .reduce((sum, t) => sum + t.amount, 0) +
        yearlyCosts.reduce((sum, c) => sum + c.amount, 0);
      
      const yearlyProfit = yearlyRevenue - yearlyExpenses;
      
      // Calculate average selling time
      const soldBikesWithDates = await Bike.find({
        status: 'sold',
        listedDate: { $exists: true },
        soldDate: { $exists: true }
      });
      
      const avgSellingTime = soldBikesWithDates.length > 0 
        ? soldBikesWithDates.reduce((sum, bike) => {
            const days = Math.floor((bike.soldDate!.getTime() - bike.listedDate.getTime()) / (1000 * 60 * 60 * 24));
            return sum + days;
          }, 0) / soldBikesWithDates.length
        : 0;
      
      // Get top performing bikes
      const topBikes = await Bike.find({ status: 'sold' })
        .sort({ profit: -1 })
        .limit(5)
        .select('brand model year profit sellPrice');
      
      // Calculate trends (compare with previous month)
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      
      const [lastMonthTransactions, lastMonthCosts] = await Promise.all([
        Transaction.find({ 
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
          type: { $in: ['sale', 'purchase'] }
        }),
        Cost.find({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } })
      ]);
      
      const lastMonthRevenue = lastMonthTransactions
        .filter(t => t.type === 'sale')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const lastMonthExpenses = lastMonthTransactions
        .filter(t => t.type === 'purchase')
        .reduce((sum, t) => sum + t.amount, 0) +
        lastMonthCosts.reduce((sum, c) => sum + c.amount, 0);
      
      const lastMonthProfit = lastMonthRevenue - lastMonthExpenses;
      
      // Calculate growth percentages
      const profitGrowth = lastMonthProfit !== 0 
        ? ((monthlyProfit - lastMonthProfit) / Math.abs(lastMonthProfit)) * 100 
        : monthlyProfit > 0 ? 100 : 0;
      
      const revenueGrowth = lastMonthRevenue !== 0 
        ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : monthlyRevenue > 0 ? 100 : 0;
      
      const response = {
        success: true,
        data: {
          overview: {
            totalBikes,
            availableBikes,
            soldBikes,
            totalPartners,
            activePartners,
            avgSellingTime: Math.round(avgSellingTime)
          },
          financial: {
            monthly: {
              revenue: monthlyRevenue,
              expenses: monthlyExpenses,
              profit: monthlyProfit
            },
            yearly: {
              revenue: yearlyRevenue,
              expenses: yearlyExpenses,
              profit: yearlyProfit
            },
            trends: {
              profitGrowth: Math.round(profitGrowth * 100) / 100,
              revenueGrowth: Math.round(revenueGrowth * 100) / 100
            }
          },
          recentSales,
          topBikes
        }
      };
      
      return NextResponse.json(response);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch dashboard data' },
        { status: 500 }
      );
    }
  }
);