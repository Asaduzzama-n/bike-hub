"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { DollarSign, TrendingUp, TrendingDown, Package, Clock, Loader2, AlertCircle } from "lucide-react";
import { adminApi } from "@/lib/api";

// Mock data - in real app this would come from API
const mockData = {
  totalProfit: 15420,
  forecastedProfit: 8750,
  totalBikes: 24,
  soldThisMonth: 8,
  averageSellTime: 18, // days
};

const monthlyData = [
  { month: "Jan", sales: 12, profit: 2400 },
  { month: "Feb", sales: 8, profit: 1800 },
  { month: "Mar", sales: 15, profit: 3200 },
  { month: "Apr", sales: 10, profit: 2100 },
  { month: "May", sales: 18, profit: 3800 },
  { month: "Jun", sales: 14, profit: 2900 },
];

const soldBrandData = [
  { brand: "Honda", bikes: 28 },
  { brand: "Yamaha", bikes: 18 },
  { brand: "Bajaj", bikes: 15 },
  { brand: "Hero", bikes: 8 },
  { brand: "Others", bikes: 5 },
];

const orangeShades = ["#FFA500", "#FF8C00", "#FF7F50", "#FF6347", "#FF4500"];

export default function AdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("2024");
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminApi.getDashboard();
      
      if (response.success && response.data) {
        setDashboardData(response.data);
      } else {
        // Fallback to mock data if API fails
        setDashboardData({
          overview: mockData,
          financial: {
            monthly: { profit: mockData.totalProfit, revenue: mockData.totalProfit * 1.5, expenses: mockData.totalProfit * 0.5 },
            trends: { profitGrowth: 12.5, revenueGrowth: 8.2 }
          },
          monthlyData: monthlyData,
          brandData: soldBrandData,
          recentSales: [],
          topBikes: []
        });
        setError(response.error || response.message || 'Failed to load dashboard data');
      }
    } catch (err) {
      console.error('Dashboard error:', err);
      // Use mock data as fallback
      setDashboardData({
        overview: mockData,
        financial: {
          monthly: { profit: mockData.totalProfit, revenue: mockData.totalProfit * 1.5, expenses: mockData.totalProfit * 0.5 },
          trends: { profitGrowth: 12.5, revenueGrowth: 8.2 }
        },
        monthlyData: monthlyData,
        brandData: soldBrandData,
        recentSales: [],
        topBikes: []
      });
      setError('Failed to connect to server. Showing sample data.');
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, description }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            {trend === "up" ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            <span className={trend === "up" ? "text-green-500" : "text-red-500"}>
              {trendValue}
            </span>
            <span>{description}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded" />
          ))}
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const data = dashboardData || { overview: mockData, financial: { monthly: {}, trends: {} } };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your bike business performance</p>
          {error && (
            <div className="flex items-center mt-2 text-sm text-amber-600">
              <AlertCircle className="w-4 h-4 mr-1" />
              {error}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchDashboardData}>
            Refresh
          </Button>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="last-6-months">Last 6 Months</SelectItem>
              <SelectItem value="last-3-months">Last 3 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Monthly Profit"
          value={`৳${(data.financial?.monthly?.profit || mockData.totalProfit).toLocaleString()}`}
          icon={DollarSign}
          trend="up"
          trendValue="+12.5%"
          description="from last month"
        />
        <StatCard
          title="Monthly Revenue"
          value={`৳${(data.financial?.monthly?.revenue || mockData.totalProfit * 1.5).toLocaleString()}`}
          icon={TrendingUp}
          trend="up"
          trendValue="+8.2%"
          description="from listed bikes"
        />
        <StatCard
          title="Total Bikes"
          value={data.overview?.totalBikes || mockData.totalBikes}
          icon={Package}
          trend="up"
          trendValue="+3"
          description="this month"
        />
        <StatCard
          title="Avg. Sell Time"
          value={`${data.overview?.averageSellTime || mockData.averageSellTime} days`}
          icon={Clock}
          trend="down"
          trendValue="-2 days"
          description="improvement"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Sales & Profit Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Sales & Profit Trend</CardTitle>
            <CardDescription>Monthly performance over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.monthlyData || monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#FF8C00"
                  strokeWidth={3}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#22c55e"
                  strokeWidth={3}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sold Bike Brands */}
        <Card>
          <CardHeader>
            <CardTitle>Sold Bike Brands</CardTitle>
            <CardDescription>Distribution of sold bikes by brand</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <PieChart width={400} height={250}>
              <Pie
                data={data.brandData || soldBrandData}
                dataKey="bikes"
                nameKey="brand"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
              >
                {(data.brandData || soldBrandData).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={orangeShades[index % orangeShades.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
