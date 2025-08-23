"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Plus,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calculator,
  Users,
  Receipt,
  Target,
  AlertCircle,
  Download,
  Filter,
} from "lucide-react";

// Mock data - in real app this would come from API
const mockFinanceData = {
  totalProfit: 15420,
  totalRevenue: 45600,
  totalCosts: 30180,
  forecastedProfit: 8750,
  monthlyProfit: 2340,
  profitMargin: 33.8,
};

const mockTransactions = [
  {
    id: "1",
    type: "sale",
    bikeId: "bike-1",
    bikeName: "Honda CBR 150R",
    amount: 2500,
    cost: 2000,
    profit: 500,
    date: "2024-01-28",
    partners: [{name: "John", investment: 500, share: 125}],
  },
  {
    id: "2",
    type: "purchase",
    bikeId: "bike-2",
    bikeName: "Yamaha FZ-S",
    amount: -1800,
    date: "2024-01-15",
  },
  {
    id: "3",
    type: "cost",
    bikeId: "bike-1",
    bikeName: "Honda CBR 150R",
    amount: -150,
    description: "Engine repair",
    date: "2024-01-20",
  },
];

const mockCosts = [
  {
    id: "1",
    type: "repair",
    amount: 150,
    description: "Engine repair for Honda CBR",
    bikeId: "bike-1",
    bikeName: "Honda CBR 150R",
    date: "2024-01-20",
    adjustPrice: true,
  },
  {
    id: "2",
    type: "transport",
    amount: 50,
    description: "Pickup from seller",
    bikeId: "bike-2",
    bikeName: "Yamaha FZ-S",
    date: "2024-01-15",
    adjustPrice: false,
  },
];

const mockPartners = [
  {
    id: "1",
    name: "John Smith",
    totalInvestment: 5000,
    totalReturns: 1250,
    activeInvestments: 3,
    profitShare: 25, // percentage
    pendingPayout: 320,
  },
  {
    id: "2",
    name: "Sarah Johnson",
    totalInvestment: 3500,
    totalReturns: 875,
    activeInvestments: 2,
    profitShare: 25,
    pendingPayout: 180,
  },
];

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
  { name: "Transport", value: 400, color: "#00C49F" },
  { name: "Marketing", value: 300, color: "#FFBB28" },
  { name: "Other", value: 200, color: "#FF8042" },
];

interface CostFormData {
  type: string;
  amount: string;
  description: string;
  bikeId: string;
  adjustPrice: boolean;
}

const initialCostForm: CostFormData = {
  type: "",
  amount: "",
  description: "",
  bikeId: "",
  adjustPrice: false,
};

export default function AdminFinancePage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isAddCostOpen, setIsAddCostOpen] = useState(false);
  const [costForm, setCostForm] = useState<CostFormData>(initialCostForm);
  const [selectedPeriod, setSelectedPeriod] = useState("2024");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddCost = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // In real app, this would save to database
      console.log("Adding cost:", costForm);
      setIsAddCostOpen(false);
      setCostForm(initialCostForm);
    } catch (error) {
      console.error("Error adding cost:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, description, prefix = "" }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{prefix}{typeof value === 'number' ? value.toLocaleString() : value}</div>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finance</h1>
          <p className="text-muted-foreground">Track profits, costs, and partner investments</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="last-6-months">Last 6 Months</SelectItem>
              <SelectItem value="last-3-months">Last 3 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="costs">Costs</TabsTrigger>
          <TabsTrigger value="partners">Partners</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Profit"
              value={mockFinanceData.totalProfit}
              icon={DollarSign}
              trend="up"
              trendValue="+12.5%"
              description="from last month"
              prefix="$"
            />
            <StatCard
              title="Revenue"
              value={mockFinanceData.totalRevenue}
              icon={TrendingUp}
              trend="up"
              trendValue="+8.2%"
              description="this month"
              prefix="$"
            />
            <StatCard
              title="Total Costs"
              value={mockFinanceData.totalCosts}
              icon={Receipt}
              trend="down"
              trendValue="-3.1%"
              description="vs last month"
              prefix="$"
            />
            <StatCard
              title="Profit Margin"
              value={`${mockFinanceData.profitMargin}%`}
              icon={Target}
              trend="up"
              trendValue="+2.3%"
              description="improvement"
            />
          </div>

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Profit Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Profit Trend & Forecast</CardTitle>
                <CardDescription>Monthly profit vs forecasted profit</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={profitTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, '']} />
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
                      name="Forecasted"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Cost Breakdown */}
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
                    <Tooltip formatter={(value) => [`$${value}`, '']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Forecasting */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5" />
                <span>Financial Forecasting</span>
              </CardTitle>
              <CardDescription>Projected performance based on current listings and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Forecasted Monthly Profit</p>
                  <p className="text-2xl font-bold text-green-600">${mockFinanceData.forecastedProfit.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Based on listed bikes and avg. sell time</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Expected ROI</p>
                  <p className="text-2xl font-bold text-blue-600">28.5%</p>
                  <p className="text-xs text-muted-foreground">Return on investment this quarter</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Break-even Point</p>
                  <p className="text-2xl font-bold text-orange-600">14 days</p>
                  <p className="text-xs text-muted-foreground">Average time to recover costs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>Complete history of sales, purchases, and costs</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Bike</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Profit</TableHead>
                    <TableHead>Partners</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={transaction.type === 'sale' ? 'default' : transaction.type === 'purchase' ? 'secondary' : 'outline'}>
                          {transaction.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{transaction.bikeName}</TableCell>
                      <TableCell className={transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                        ${Math.abs(transaction.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {transaction.profit ? (
                          <span className="text-green-600 font-medium">
                            ${transaction.profit.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {transaction.partners ? (
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{transaction.partners.length}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Costs Tab */}
        <TabsContent value="costs" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Cost Management</h2>
              <p className="text-muted-foreground">Track and manage all business expenses</p>
            </div>
            <Dialog open={isAddCostOpen} onOpenChange={setIsAddCostOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Cost
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Cost</DialogTitle>
                  <DialogDescription>
                    Record a new business expense
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddCost} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Cost Type</Label>
                    <Select value={costForm.type} onValueChange={(value) => setCostForm(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select cost type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="repair">Repair</SelectItem>
                        <SelectItem value="transport">Transport</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={costForm.amount}
                      onChange={(e) => setCostForm(prev => ({ ...prev, amount: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={costForm.description}
                      onChange={(e) => setCostForm(prev => ({ ...prev, description: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bikeId">Related Bike (Optional)</Label>
                    <Select value={costForm.bikeId} onValueChange={(value) => setCostForm(prev => ({ ...prev, bikeId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select bike" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bike-1">Honda CBR 150R</SelectItem>
                        <SelectItem value="bike-2">Yamaha FZ-S</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="adjustPrice"
                      checked={costForm.adjustPrice}
                      onCheckedChange={(checked) => setCostForm(prev => ({ ...prev, adjustPrice: checked as boolean }))}
                    />
                    <Label htmlFor="adjustPrice">Auto-adjust bike selling price</Label>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddCostOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Adding...' : 'Add Cost'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Costs</CardTitle>
              <CardDescription>All recorded business expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Related Bike</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Price Adjusted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockCosts.map((cost) => (
                    <TableRow key={cost.id}>
                      <TableCell>{new Date(cost.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{cost.type}</Badge>
                      </TableCell>
                      <TableCell>{cost.description}</TableCell>
                      <TableCell>{cost.bikeName}</TableCell>
                      <TableCell className="text-red-600">${cost.amount}</TableCell>
                      <TableCell>
                        {cost.adjustPrice ? (
                          <Badge variant="default">Yes</Badge>
                        ) : (
                          <Badge variant="secondary">No</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Partners Tab */}
        <TabsContent value="partners" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Partner Profit Sharing</h2>
            <p className="text-muted-foreground">Manage partner investments and profit distributions</p>
          </div>

          {/* Partner Summary */}
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              title="Total Partners"
              value={mockPartners.length}
              icon={Users}
            />
            <StatCard
              title="Total Investments"
              value={mockPartners.reduce((acc, p) => acc + p.totalInvestment, 0)}
              icon={DollarSign}
              prefix="$"
            />
            <StatCard
              title="Total Returns"
              value={mockPartners.reduce((acc, p) => acc + p.totalReturns, 0)}
              icon={TrendingUp}
              prefix="$"
            />
            <StatCard
              title="Pending Payouts"
              value={mockPartners.reduce((acc, p) => acc + p.pendingPayout, 0)}
              icon={AlertCircle}
              prefix="$"
            />
          </div>

          {/* Partners Table */}
          <Card>
            <CardHeader>
              <CardTitle>Partner Details</CardTitle>
              <CardDescription>Individual partner performance and profit sharing</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Partner</TableHead>
                    <TableHead>Total Investment</TableHead>
                    <TableHead>Total Returns</TableHead>
                    <TableHead>Active Investments</TableHead>
                    <TableHead>Profit Share</TableHead>
                    <TableHead>Pending Payout</TableHead>
                    <TableHead>ROI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPartners.map((partner) => {
                    const roi = ((partner.totalReturns / partner.totalInvestment) * 100).toFixed(1);
                    return (
                      <TableRow key={partner.id}>
                        <TableCell className="font-medium">{partner.name}</TableCell>
                        <TableCell>${partner.totalInvestment.toLocaleString()}</TableCell>
                        <TableCell className="text-green-600">${partner.totalReturns.toLocaleString()}</TableCell>
                        <TableCell>{partner.activeInvestments}</TableCell>
                        <TableCell>{partner.profitShare}%</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span>${partner.pendingPayout}</span>
                            {partner.pendingPayout > 0 && (
                              <Button size="sm" variant="outline">
                                Pay Out
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={parseFloat(roi) > 0 ? 'text-green-600' : 'text-red-600'}>
                            {roi}%
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}