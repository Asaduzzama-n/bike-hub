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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Package,
  Clock,
} from "lucide-react";

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

const chartConfig = {
  sales: {
    label: "Sales",
    color: "hsl(var(--chart-1))",
  },
  profit: {
    label: "Profit ($)",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

const brandData = [
  { brand: "Honda", bikes: 35, fill: "var(--color-honda)" },
  { brand: "Yamaha", bikes: 25, fill: "var(--color-yamaha)" },
  { brand: "Bajaj", bikes: 20, fill: "var(--color-bajaj)" },
  { brand: "Hero", bikes: 12, fill: "var(--color-hero)" },
  { brand: "Others", bikes: 8, fill: "var(--color-others)" },
];

const brandChartConfig = {
  bikes: {
    label: "Bikes",
  },
  honda: {
    label: "Honda",
    color: "hsl(var(--chart-1))",
  },
  yamaha: {
    label: "Yamaha",
    color: "hsl(var(--chart-2))",
  },
  bajaj: {
    label: "Bajaj",
    color: "hsl(var(--chart-3))",
  },
  hero: {
    label: "Hero",
    color: "hsl(var(--chart-4))",
  },
  others: {
    label: "Others",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;



export default function AdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("2024");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your bike business performance</p>
        </div>
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

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Profit"
          value={`$${mockData.totalProfit.toLocaleString()}`}
          icon={DollarSign}
          trend="up"
          trendValue="+12.5%"
          description="from last month"
        />
        <StatCard
          title="Forecasted Profit"
          value={`$${mockData.forecastedProfit.toLocaleString()}`}
          icon={TrendingUp}
          trend="up"
          trendValue="+8.2%"
          description="from listed bikes"
        />
        <StatCard
          title="Total Bikes"
          value={mockData.totalBikes}
          icon={Package}
          trend="up"
          trendValue="+3"
          description="this month"
        />
        <StatCard
          title="Avg. Sell Time"
          value={`${mockData.averageSellTime} days`}
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
            <ChartContainer config={chartConfig}>
              <LineChart
                accessibilityLayer
                data={monthlyData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Bar
                  yAxisId="left"
                  dataKey="sales"
                  fill="var(--color-sales)"
                  radius={8}
                />
                <Line
                  yAxisId="right"
                  dataKey="profit"
                  type="natural"
                  stroke="var(--color-profit)"
                  strokeWidth={2}
                  dot={{
                    fill: "var(--color-profit)",
                  }}
                  activeDot={{
                    r: 6,
                  }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Brand Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Brand Distribution</CardTitle>
            <CardDescription>Percentage of bikes by brand</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={brandChartConfig}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={brandData}
                  dataKey="bikes"
                  nameKey="brand"
                  innerRadius={60}
                  strokeWidth={5}
                >
                  <Cell fill="var(--color-honda)" />
                  <Cell fill="var(--color-yamaha)" />
                  <Cell fill="var(--color-bajaj)" />
                  <Cell fill="var(--color-hero)" />
                  <Cell fill="var(--color-others)" />
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>




    </div>
  );
}