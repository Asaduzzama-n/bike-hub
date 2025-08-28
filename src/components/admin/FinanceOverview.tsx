"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calculator,
  Target,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  prefix?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function StatCard({ title, value, icon: Icon, prefix = "", trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {trend && (
          <p className={`text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'} flex items-center`}>
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            {trend.value}% from last month
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Sample data - this should be replaced with real API data
const financeData = {
  totalProfit: 15420,
  totalRevenue: 45600,
  totalCosts: 30180,
  forecastedProfit: 8750,
  monthlyProfit: 2340,
  profitMargin: 33.8,
};

const profitTrendData = [
  { month: "Jul", profit: 1200, forecast: 1100 },
  { month: "Aug", profit: 1800, forecast: 1600 },
  { month: "Sep", profit: 2100, forecast: 2000 },
  { month: "Oct", profit: 1900, forecast: 2200 },
  { month: "Nov", profit: 2400, forecast: 2300 },
  { month: "Dec", profit: 2800, forecast: 2600 },
  { month: "Jan", profit: 0, forecast: 2900 },
];

const costBreakdownData = [
  { name: "Repairs", value: 1200, color: "#0088FE" },
  { name: "Maintenance", value: 800, color: "#00C49F" },
  { name: "Marketing", value: 300, color: "#FFBB28" },
  { name: "Operational", value: 400, color: "#FF8042" },
  { name: "Fuel", value: 250, color: "#8884D8" },
  { name: "Insurance", value: 180, color: "#82CA9D" },
  { name: "Other", value: 200, color: "#FFC658" },
];

export default function FinanceOverview() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Finance Overview</h2>
        <p className="text-muted-foreground">Track your business performance and financial metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Profit"
          value={financeData.totalProfit}
          icon={DollarSign}
          prefix="৳"
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatCard
          title="Total Revenue"
          value={financeData.totalRevenue}
          icon={TrendingUp}
          prefix="৳"
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatCard
          title="Total Costs"
          value={financeData.totalCosts}
          icon={Calculator}
          prefix="৳"
          trend={{ value: 3.1, isPositive: false }}
        />
        <StatCard
          title="Profit Margin"
          value={`${financeData.profitMargin}%`}
          icon={Target}
          trend={{ value: 2.4, isPositive: true }}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Profit Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Profit Trend</CardTitle>
            <CardDescription>Monthly profit vs forecast</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={profitTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`৳${value}`, '']} />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name="Actual Profit"
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Forecasted Profit"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cost Breakdown Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown</CardTitle>
            <CardDescription>Distribution of expenses by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={costBreakdownData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {costBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`৳${value}`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">This Month's Profit</span>
                <span className="font-medium">৳{financeData.monthlyProfit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Forecasted Profit</span>
                <span className="font-medium">৳{financeData.forecastedProfit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Achievement</span>
                <span className="font-medium text-green-600">
                  {((financeData.monthlyProfit / financeData.forecastedProfit) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Bike Sales</span>
                <span className="font-medium">৳{(financeData.totalRevenue * 0.8).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Services</span>
                <span className="font-medium">৳{(financeData.totalRevenue * 0.15).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Other</span>
                <span className="font-medium">৳{(financeData.totalRevenue * 0.05).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Fixed Costs</span>
                <span className="font-medium">৳{(financeData.totalCosts * 0.4).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Variable Costs</span>
                <span className="font-medium">৳{(financeData.totalCosts * 0.6).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Cost Ratio</span>
                <span className="font-medium">
                  {((financeData.totalCosts / financeData.totalRevenue) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}