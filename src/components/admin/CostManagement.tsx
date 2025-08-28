"use client";

import { useState } from "react";
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
import {
  Plus,
  Calculator,
  Receipt,
  TrendingDown,
  Download,
  Filter,
} from "lucide-react";

interface Cost {
  id: string;
  category: string;
  amount: number;
  description: string;
  bikeId: string;
  bikeName: string;
  date: string;
  adjustPrice: boolean;
}

interface CostFormData {
  category: string;
  amount: string;
  description: string;
  bikeId: string;
  adjustPrice: boolean;
}

const initialCostForm: CostFormData = {
  category: "",
  amount: "",
  description: "",
  bikeId: "",
  adjustPrice: false,
};

// Sample data - this should be replaced with real API data
const mockCosts: Cost[] = [
  {
    id: "1",
    category: "repair",
    amount: 150,
    description: "Engine repair for Honda CBR",
    bikeId: "bike-1",
    bikeName: "Honda CBR 150R",
    date: "2024-01-20",
    adjustPrice: true,
  },
  {
    id: "2",
    category: "operational",
    amount: 50,
    description: "Pickup from seller",
    bikeId: "bike-2",
    bikeName: "Yamaha FZ-S",
    date: "2024-01-15",
    adjustPrice: false,
  },
  {
    id: "3",
    category: "maintenance",
    amount: 75,
    description: "Oil change and filter replacement",
    bikeId: "bike-1",
    bikeName: "Honda CBR 150R",
    date: "2024-01-10",
    adjustPrice: true,
  },
];

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  prefix?: string;
}

function StatCard({ title, value, icon: Icon, prefix = "" }: StatCardProps) {
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
      </CardContent>
    </Card>
  );
}

export default function CostManagement() {
  const [costs, setCosts] = useState<Cost[]>(mockCosts);
  const [costForm, setCostForm] = useState<CostFormData>(initialCostForm);
  const [isAddCostOpen, setIsAddCostOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddCost = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // TODO: Replace with actual API call
    const newCost: Cost = {
      id: Date.now().toString(),
      category: costForm.category,
      amount: parseFloat(costForm.amount),
      description: costForm.description,
      bikeId: costForm.bikeId,
      bikeName: `Bike ${costForm.bikeId}`, // This should come from bike data
      date: new Date().toISOString().split('T')[0],
      adjustPrice: costForm.adjustPrice,
    };

    setCosts(prev => [newCost, ...prev]);
    setCostForm(initialCostForm);
    setIsAddCostOpen(false);
    setIsLoading(false);
  };

  const filteredCosts = costs.filter(cost => 
    filterCategory === "all" || cost.category === filterCategory
  );

  const totalCosts = costs.reduce((acc, cost) => acc + cost.amount, 0);
  const repairCosts = costs.filter(c => c.category === "repair").reduce((acc, c) => acc + c.amount, 0);
  const maintenanceCosts = costs.filter(c => c.category === "maintenance").reduce((acc, c) => acc + c.amount, 0);
  const operationalCosts = costs.filter(c => c.category === "operational").reduce((acc, c) => acc + c.amount, 0);

  const costCategories = [
    { value: "repair", label: "Repair" },
    { value: "maintenance", label: "Maintenance" },
    { value: "operational", label: "Operational" },
    { value: "marketing", label: "Marketing" },
    { value: "fuel", label: "Fuel" },
    { value: "insurance", label: "Insurance" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Cost Management</h2>
          <p className="text-muted-foreground">Track and manage all business expenses</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
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
                  Record a new business expense or cost
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddCost} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={costForm.category}
                    onValueChange={(value) => setCostForm(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select cost category" />
                    </SelectTrigger>
                    <SelectContent>
                      {costCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (৳)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={costForm.amount}
                    onChange={(e) => setCostForm(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="Enter cost amount"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={costForm.description}
                    onChange={(e) => setCostForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the cost or expense"
                    rows={3}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bikeId">Related Bike ID (Optional)</Label>
                  <Input
                    id="bikeId"
                    type="text"
                    value={costForm.bikeId}
                    onChange={(e) => setCostForm(prev => ({ ...prev, bikeId: e.target.value }))}
                    placeholder="Enter bike ID if applicable"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="adjustPrice"
                    checked={costForm.adjustPrice}
                    onCheckedChange={(checked) => 
                      setCostForm(prev => ({ ...prev, adjustPrice: checked as boolean }))
                    }
                  />
                  <Label htmlFor="adjustPrice">Adjust bike selling price</Label>
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
      </div>

      {/* Cost Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Total Costs"
          value={totalCosts}
          icon={Calculator}
          prefix="৳"
        />
        <StatCard
          title="Repair Costs"
          value={repairCosts}
          icon={Receipt}
          prefix="৳"
        />
        <StatCard
          title="Maintenance"
          value={maintenanceCosts}
          icon={TrendingDown}
          prefix="৳"
        />
        <StatCard
          title="Operational"
          value={operationalCosts}
          icon={Calculator}
          prefix="৳"
        />
      </div>

      {/* Costs Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Cost Records</CardTitle>
              <CardDescription>All business expenses and costs</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {costCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Related Bike</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Price Adjust</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCosts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No costs found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCosts.map((cost) => (
                  <TableRow key={cost.id}>
                    <TableCell>{new Date(cost.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {cost.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="truncate">{cost.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {cost.bikeId ? (
                        <div>
                          <div className="font-medium">{cost.bikeName}</div>
                          <div className="text-sm text-muted-foreground">{cost.bikeId}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-red-600">
                      ৳{cost.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {cost.adjustPrice ? (
                        <Badge variant="default">Yes</Badge>
                      ) : (
                        <Badge variant="secondary">No</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Cost Analysis */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {costCategories.map((category) => {
                const categoryTotal = costs
                  .filter(c => c.category === category.value)
                  .reduce((acc, c) => acc + c.amount, 0);
                const percentage = totalCosts > 0 ? (categoryTotal / totalCosts) * 100 : 0;
                
                return (
                  <div key={category.value} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{category.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {percentage.toFixed(1)}%
                      </span>
                      <span className="font-medium">৳{categoryTotal.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {costs.slice(0, 5).map((cost) => (
                <div key={cost.id} className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{cost.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(cost.date).toLocaleDateString()} • {cost.category}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-red-600">
                    ৳{cost.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}