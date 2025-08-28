"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  DollarSign,
  TrendingUp,
  TrendingDown,
  Receipt,
  Download,
  Filter,
} from "lucide-react";

interface Transaction {
  id: string;
  type: "sale" | "purchase" | "cost";
  bikeId: string;
  bikeName: string;
  amount: number;
  cost?: number;
  profit?: number;
  date: string;
  description?: string;
  partners?: Array<{
    name: string;
    investment: number;
    share: number;
  }>;
}

interface TransactionFormData {
  type: string;
  bikeId: string;
  amount: string;
  description: string;
}

const initialTransactionForm: TransactionFormData = {
  type: "",
  bikeId: "",
  amount: "",
  description: "",
};

// Sample data - this should be replaced with real API data
const mockTransactions: Transaction[] = [
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

export default function TransactionManagement() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [transactionForm, setTransactionForm] = useState<TransactionFormData>(initialTransactionForm);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // TODO: Replace with actual API call
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: transactionForm.type as "sale" | "purchase" | "cost",
      bikeId: transactionForm.bikeId,
      bikeName: `Bike ${transactionForm.bikeId}`, // This should come from bike data
      amount: parseFloat(transactionForm.amount),
      date: new Date().toISOString().split('T')[0],
      description: transactionForm.description,
    };

    setTransactions(prev => [newTransaction, ...prev]);
    setTransactionForm(initialTransactionForm);
    setIsAddTransactionOpen(false);
    setIsLoading(false);
  };

  const filteredTransactions = transactions.filter(transaction => 
    filterType === "all" || transaction.type === filterType
  );

  const totalSales = transactions
    .filter(t => t.type === "sale")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalPurchases = Math.abs(transactions
    .filter(t => t.type === "purchase")
    .reduce((acc, t) => acc + t.amount, 0));

  const totalCosts = Math.abs(transactions
    .filter(t => t.type === "cost")
    .reduce((acc, t) => acc + t.amount, 0));

  const totalProfit = transactions
    .filter(t => t.type === "sale" && t.profit)
    .reduce((acc, t) => acc + (t.profit || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Transaction Management</h2>
          <p className="text-muted-foreground">Track all sales, purchases, and costs</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Dialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Transaction</DialogTitle>
                <DialogDescription>
                  Record a new sale, purchase, or cost transaction
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddTransaction} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Transaction Type</Label>
                  <Select
                    value={transactionForm.type}
                    onValueChange={(value) => setTransactionForm(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select transaction type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale">Sale</SelectItem>
                      <SelectItem value="purchase">Purchase</SelectItem>
                      <SelectItem value="cost">Cost/Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bikeId">Bike ID</Label>
                  <Input
                    id="bikeId"
                    type="text"
                    value={transactionForm.bikeId}
                    onChange={(e) => setTransactionForm(prev => ({ ...prev, bikeId: e.target.value }))}
                    placeholder="Enter bike ID"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (৳)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={transactionForm.amount}
                    onChange={(e) => setTransactionForm(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="Enter amount"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    type="text"
                    value={transactionForm.description}
                    onChange={(e) => setTransactionForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter description"
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddTransactionOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Adding...' : 'Add Transaction'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Transaction Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Total Sales"
          value={totalSales}
          icon={TrendingUp}
          prefix="৳"
        />
        <StatCard
          title="Total Purchases"
          value={totalPurchases}
          icon={TrendingDown}
          prefix="৳"
        />
        <StatCard
          title="Total Costs"
          value={totalCosts}
          icon={Receipt}
          prefix="৳"
        />
        <StatCard
          title="Total Profit"
          value={totalProfit}
          icon={DollarSign}
          prefix="৳"
        />
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>All sales, purchases, and costs</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="sale">Sales</SelectItem>
                  <SelectItem value="purchase">Purchases</SelectItem>
                  <SelectItem value="cost">Costs</SelectItem>
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
                <TableHead>Type</TableHead>
                <TableHead>Bike</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Profit</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Partners</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No transactions found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          transaction.type === 'sale' ? 'default' : 
                          transaction.type === 'purchase' ? 'secondary' : 'destructive'
                        }
                      >
                        {transaction.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{transaction.bikeName}</div>
                        <div className="text-sm text-muted-foreground">{transaction.bikeId}</div>
                      </div>
                    </TableCell>
                    <TableCell className={transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                      ৳{Math.abs(transaction.amount).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {transaction.profit ? (
                        <span className="text-green-600">৳{transaction.profit.toLocaleString()}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {transaction.description || (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {transaction.partners && transaction.partners.length > 0 ? (
                        <div className="text-sm">
                          {transaction.partners.map((partner, index) => (
                            <div key={index}>
                              {partner.name}: ৳{partner.share}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}