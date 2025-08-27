"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { Plus, Edit, Trash2, Eye, DollarSign, Calendar, User, Phone, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";

interface SellRecord {
  id: string;
  bikeId: string;
  bikeBrand: string;
  bikeModel: string;
  bikeYear: number;
  purchasePrice: number;
  sellingPrice: number;
  profit: number;
  buyerName: string;
  buyerPhone: string;
  buyerEmail?: string;
  saleDate: string;
  paymentMethod: string;
  dueAmount?: number;
  dueReason?: string;
  notes?: string;
  createdAt: string;
}

interface Bike {
  id: string;
  brand: string;
  model: string;
  year: number;
  cc: number;
  purchasePrice: number;
  sellingPrice: number;
  miles: number;
  status: string;
  images: string[];
  documents: string[];
  description: string;
  freeWash: boolean;
  repairs: any[];
  partners: any[];
  listedDate: string;
  soldDate?: string;
  holdDuration: number;
}

interface SellRecordFormData {
  selectedBike: Bike | null;
  sellingPrice: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  saleDate: string;
  paymentMethod: string;
  dueAmount: string;
  dueReason: string;
  notes: string;
}

const initialFormData: SellRecordFormData = {
  selectedBike: null,
  sellingPrice: "",
  buyerName: "",
  buyerPhone: "",
  buyerEmail: "",
  saleDate: new Date().toISOString().split('T')[0],
  paymentMethod: "",
  dueAmount: "",
  dueReason: "",
  notes: "",
};

// Mock available bikes for selection
const availableBikes: Bike[] = [
  {
    id: "1",
    brand: "Honda",
    model: "CBR 150R",
    year: 2020,
    cc: 150,
    purchasePrice: 180000,
    sellingPrice: 220000,
    miles: 15000,
    status: "listed",
    images: ["/placeholder-bike.jpg"],
    documents: ["RC Book", "Insurance", "Pollution Certificate"],
    description: "Well maintained bike with all papers",
    freeWash: true,
    repairs: [],
    partners: [],
    listedDate: "2024-01-15",
    holdDuration: 25,
  },
  {
    id: "3",
    brand: "Bajaj",
    model: "Pulsar NS200",
    year: 2021,
    cc: 200,
    purchasePrice: 280000,
    sellingPrice: 320000,
    miles: 8000,
    status: "listed",
    images: ["/placeholder-bike.jpg"],
    documents: ["RC Book", "Insurance"],
    description: "Sporty bike in excellent condition",
    freeWash: true,
    repairs: [],
    partners: [],
    listedDate: "2023-11-20",
    holdDuration: 45,
  },
  {
    id: "4",
    brand: "Hero",
    model: "Splendor Plus",
    year: 2018,
    cc: 97,
    purchasePrice: 120000,
    sellingPrice: 180000,
    miles: 35000,
    status: "listed",
    images: ["/placeholder-bike.jpg"],
    documents: ["RC Book"],
    description: "Reliable commuter bike",
    freeWash: false,
    repairs: [],
    partners: [],
    listedDate: "2023-10-15",
    holdDuration: 62,
  },
];

// Mock data for demonstration
const mockSellRecords: SellRecord[] = [
  {
    id: "1",
    bikeId: "bike-1",
    bikeBrand: "Honda",
    bikeModel: "CBR 150R",
    bikeYear: 2020,
    purchasePrice: 180000,
    sellingPrice: 220000,
    profit: 40000,
    buyerName: "Ahmed Rahman",
    buyerPhone: "+880 1712-345678",
    buyerEmail: "ahmed@example.com",
    saleDate: "2024-01-28",
    paymentMethod: "cash",
    notes: "Smooth transaction, buyer was very satisfied",
    createdAt: "2024-01-28T10:30:00Z",
  },
  {
    id: "2",
    bikeId: "bike-2",
    bikeBrand: "Yamaha",
    bikeModel: "FZ-S",
    bikeYear: 2019,
    purchasePrice: 150000,
    sellingPrice: 185000,
    profit: 35000,
    buyerName: "Fatima Khan",
    buyerPhone: "+880 1812-987654",
    saleDate: "2024-01-25",
    paymentMethod: "bank_transfer",
    createdAt: "2024-01-25T14:15:00Z",
  },
];

const paymentMethods = [
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "mobile_banking", label: "Mobile Banking" },
  { value: "installment", label: "Installment" },
];

export default function SellRecordsPage() {
  const [sellRecords, setSellRecords] = useState<SellRecord[]>(mockSellRecords);
  const [loading, setLoading] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SellRecord | null>(null);
  const [formData, setFormData] = useState<SellRecordFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [bikeSelectOpen, setBikeSelectOpen] = useState(false);

  const handleAdd = () => {
    setEditingRecord(null);
    setFormData(initialFormData);
    setIsSheetOpen(true);
  };

  const handleEdit = (record: SellRecord) => {
    const selectedBike = availableBikes.find(bike => bike.id === record.bikeId);
    setFormData({
      selectedBike: selectedBike || null,
      sellingPrice: record.sellingPrice.toString(),
      buyerName: record.buyerName,
      buyerPhone: record.buyerPhone,
      buyerEmail: record.buyerEmail || "",
      saleDate: record.saleDate,
      paymentMethod: record.paymentMethod,
      dueAmount: record.dueAmount ? record.dueAmount.toString() : "",
      dueReason: record.dueReason || "",
      notes: record.notes || "",
    });
    setEditingRecord(record);
    setIsSheetOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!formData.selectedBike) {
        toast.error("Please select a bike");
        setSubmitting(false);
        return;
      }

      const purchasePrice = formData.selectedBike.purchasePrice;
      const sellingPrice = parseFloat(formData.sellingPrice);
      const profit = sellingPrice - purchasePrice;

      const newRecord: SellRecord = {
        id: editingRecord ? editingRecord.id : Date.now().toString(),
        bikeId: formData.selectedBike.id,
        bikeBrand: formData.selectedBike.brand,
        bikeModel: formData.selectedBike.model,
        bikeYear: formData.selectedBike.year,
        purchasePrice,
        sellingPrice,
        profit,
        buyerName: formData.buyerName,
        buyerPhone: formData.buyerPhone,
        buyerEmail: formData.buyerEmail,
        saleDate: formData.saleDate,
        paymentMethod: formData.paymentMethod,
        dueAmount: formData.dueAmount ? parseFloat(formData.dueAmount) : undefined,
        dueReason: formData.dueReason || undefined,
        notes: formData.notes,
        createdAt: editingRecord ? editingRecord.createdAt : new Date().toISOString(),
      };

      if (editingRecord) {
        setSellRecords(prev => prev.map(record => 
          record.id === editingRecord.id ? newRecord : record
        ));
        toast.success("Sell record updated successfully");
      } else {
        setSellRecords(prev => [newRecord, ...prev]);
        toast.success("Sell record created successfully");
      }

      setIsSheetOpen(false);
    } catch (error) {
      toast.error("Failed to save sell record");
      console.error("Error saving sell record:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (recordId: string) => {
    if (!confirm("Are you sure you want to delete this sell record?")) {
      return;
    }

    setSellRecords(prev => prev.filter(record => record.id !== recordId));
    toast.success("Sell record deleted successfully");
  };

  const totalProfit = sellRecords.reduce((sum, record) => sum + record.profit, 0);
  const totalSales = sellRecords.reduce((sum, record) => sum + record.sellingPrice, 0);
  const averageProfit = sellRecords.length > 0 ? totalProfit / sellRecords.length : 0;

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Sell Records</h1>
          <p className="text-muted-foreground">Manage bike sales records and track performance</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Sell Record
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{totalSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From {sellRecords.length} transactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">৳{totalProfit.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Net profit from sales
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{Math.round(averageProfit).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Per transaction
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sellRecords.length}</div>
            <p className="text-xs text-muted-foreground">
              Completed sales
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sell Records Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bike Details</TableHead>
              <TableHead>Buyer Info</TableHead>
              <TableHead>Purchase Price</TableHead>
              <TableHead>Selling Price</TableHead>
              <TableHead>Profit</TableHead>
              <TableHead>Sale Date</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Due Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sellRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  No sell records found. Create your first sell record!
                </TableCell>
              </TableRow>
            ) : (
              sellRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {record.bikeBrand} {record.bikeModel}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {record.bikeYear} • ID: {record.bikeId}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{record.buyerName}</div>
                      <div className="text-sm text-muted-foreground">{record.buyerPhone}</div>
                    </div>
                  </TableCell>
                  <TableCell>৳{record.purchasePrice.toLocaleString()}</TableCell>
                  <TableCell>৳{record.sellingPrice.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={record.profit > 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                      ৳{record.profit.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(record.saleDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {paymentMethods.find(p => p.value === record.paymentMethod)?.label || record.paymentMethod}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {record.dueAmount ? (
                      <div className="text-orange-600">
                        <div>৳{record.dueAmount.toLocaleString()}</div>
                        {record.dueReason && (
                          <div className="text-xs text-gray-500">{record.dueReason}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-green-600">Paid</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(record)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(record.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Sell Record Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom" className="h-screen w-full max-w-none overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingRecord ? "Edit Sell Record" : "Add New Sell Record"}
            </SheetTitle>
            <SheetDescription>
              {editingRecord
                ? "Update the sell record information below."
                : "Fill in the details to create a new sell record."}
            </SheetDescription>
          </SheetHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6 py-4 px-6">
            {/* Bike Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Select Bike</h3>
              <div className="space-y-2">
                <Label>Available Bikes</Label>
                <Popover open={bikeSelectOpen} onOpenChange={setBikeSelectOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={bikeSelectOpen}
                      className="w-full justify-between"
                    >
                      {formData.selectedBike
                        ? `${formData.selectedBike.brand} ${formData.selectedBike.model} (${formData.selectedBike.year})`
                        : "Select a bike..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[300px] p-0">
                    <Command>
                      <CommandInput placeholder="Search bikes..." />
                      <CommandEmpty>No bike found.</CommandEmpty>
                      <CommandGroup>
                        {availableBikes.map((bike) => (
                          <CommandItem
                            key={bike.id}
                            value={`${bike.brand} ${bike.model} ${bike.year}`}
                            onSelect={() => {
                              setFormData({ 
                                ...formData, 
                                selectedBike: bike,
                                sellingPrice: bike.sellingPrice.toString()
                              });
                              setBikeSelectOpen(false);
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                formData.selectedBike?.id === bike.id ? "opacity-100" : "opacity-0"
                              }`}
                            />
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {bike.brand} {bike.model} ({bike.year})
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {bike.cc}cc • {bike.miles.toLocaleString()} miles • ৳{bike.purchasePrice.toLocaleString()}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* Selected Bike Details */}
              {formData.selectedBike && (
                <div className="p-4 bg-muted rounded-md space-y-2">
                  <h4 className="font-medium">Selected Bike Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Brand:</span> {formData.selectedBike.brand}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Model:</span> {formData.selectedBike.model}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Year:</span> {formData.selectedBike.year}
                    </div>
                    <div>
                      <span className="text-muted-foreground">CC:</span> {formData.selectedBike.cc}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Miles:</span> {formData.selectedBike.miles.toLocaleString()}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Purchase Price:</span> ৳{formData.selectedBike.purchasePrice.toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pricing Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Pricing Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Purchase Price (৳)</Label>
                  <Input
                    type="number"
                    value={formData.selectedBike?.purchasePrice || ''}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sellingPrice">Selling Price (৳)</Label>
                  <Input
                    id="sellingPrice"
                    type="number"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    placeholder="220000"
                    required
                  />
                </div>
              </div>
              {formData.selectedBike && formData.sellingPrice && (
                <div className="p-3 bg-muted rounded-md">
                  <div className="text-sm font-medium">
                    Profit: ৳{(parseFloat(formData.sellingPrice) - formData.selectedBike.purchasePrice).toLocaleString()}
                  </div>
                </div>
              )}
            </div>

            {/* Buyer Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Buyer Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="buyerName">Buyer Name</Label>
                  <Input
                    id="buyerName"
                    value={formData.buyerName}
                    onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                    placeholder="Ahmed Rahman"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buyerPhone">Phone Number</Label>
                  <Input
                    id="buyerPhone"
                    value={formData.buyerPhone}
                    onChange={(e) => setFormData({ ...formData, buyerPhone: e.target.value })}
                    placeholder="+880 1712-345678"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="buyerEmail">Email (Optional)</Label>
                <Input
                  id="buyerEmail"
                  type="email"
                  value={formData.buyerEmail}
                  onChange={(e) => setFormData({ ...formData, buyerEmail: e.target.value })}
                  placeholder="ahmed@example.com"
                />
              </div>
            </div>

            {/* Sale Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Sale Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="saleDate">Sale Date</Label>
                  <Input
                    id="saleDate"
                    type="date"
                    value={formData.saleDate}
                    onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dueAmount">Due Amount (৳)</Label>
                  <Input
                    id="dueAmount"
                    type="number"
                    placeholder="Enter due amount"
                    value={formData.dueAmount}
                    onChange={(e) => setFormData({ ...formData, dueAmount: e.target.value })}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueReason">Due Reason</Label>
                  <Input
                    id="dueReason"
                    placeholder="Reason for due amount"
                    value={formData.dueReason}
                    onChange={(e) => setFormData({ ...formData, dueReason: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes about the sale..."
                  rows={3}
                />
              </div>
            </div>
          </form>
          
          <SheetFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsSheetOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Saving..." : editingRecord ? "Update" : "Create"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}