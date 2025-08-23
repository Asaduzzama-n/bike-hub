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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Upload,
  X,
  Calendar,
  DollarSign,
  Package,
  CheckCircle,
  Clock,
  Car,
  Users,
  Wrench,
  FileText,
} from "lucide-react";
import Image from "next/image";
import BikeSheet from "@/components/bikeSheet";

// Types
interface Repair {
  name: string;
  cost: string;
}

interface Partner {
  name: string;
  investment: string;
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
  repairs: Repair[];
  partners: Partner[];
  listedDate: string;
  soldDate?: string;
  holdDuration: number;
}

interface BikeFormData {
  brand: string;
  model: string;
  year: string;
  cc: string;
  purchasePrice: string;
  sellingPrice: string;
  miles: string;
  description: string;
  documents: string[];
  freeWash: boolean;
  repairs: Repair[];
  partners: Partner[];
  images: File[];
}

// Mock data
const mockBikes: Bike[] = [
  {
    id: "1",
    brand: "Honda",
    model: "CBR 150R",
    year: 2020,
    cc: 150,
    purchasePrice: 2000,
    sellingPrice: 2500,
    miles: 15000,
    status: "listed",
    images: ["/placeholder-bike.jpg"],
    documents: ["RC Book", "Insurance", "Pollution Certificate"],
    description: "Well maintained bike with all papers",
    freeWash: true,
    repairs: [{name: "Minor scratches fixed", cost: "150"}],
    partners: [{name: "John", investment: "500"}],
    listedDate: "2024-01-15",
    holdDuration: 25,
  },
  {
    id: "2",
    brand: "Yamaha",
    model: "FZ-S",
    year: 2019,
    cc: 149,
    purchasePrice: 1800,
    sellingPrice: 2200,
    miles: 22000,
    status: "sold",
    images: ["/placeholder-bike.jpg"],
    documents: ["RC Book", "Insurance"],
    description: "Good condition, single owner",
    freeWash: false,
    repairs: [],
    partners: [],
    listedDate: "2024-01-10",
    soldDate: "2024-01-28",
    holdDuration: 18,
  },
];

const brands = ["Honda", "Yamaha", "Bajaj", "Hero", "TVS", "Suzuki", "KTM", "Royal Enfield"];

const initialFormData: BikeFormData = {
  brand: "",
  model: "",
  year: "",
  cc: "",
  purchasePrice: "",
  sellingPrice: "",
  miles: "",
  description: "",
  documents: [],
  freeWash: false,
  repairs: [],
  partners: [],
  images: [],
};

// Reusable Bike Sheet Component
interface BikeSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'view' | 'edit' | 'create';
  bike?: Bike | null;
  onSubmit?: (data: BikeFormData) => Promise<void>;
  isLoading?: boolean;
}


// Main Admin Listings Component
export default function AdminListingsPage() {
  const [bikes, setBikes] = useState<Bike[]>(mockBikes);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sheetState, setSheetState] = useState<{
    isOpen: boolean;
    mode: 'view' | 'edit' | 'create';
    bike: Bike | null;
  }>({
    isOpen: false,
    mode: 'create',
    bike: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  const filteredBikes = bikes.filter((bike) => {
    const matchesSearch = 
      bike.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bike.model.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || bike.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = async (formData: BikeFormData) => {
    setIsLoading(true);

    try {
      // In real app, this would upload images and save to database
      const newBike: Bike = {
        id: sheetState.bike?.id || Date.now().toString(),
        brand: formData.brand,
        model: formData.model,
        year: parseInt(formData.year),
        cc: parseInt(formData.cc),
        purchasePrice: parseFloat(formData.purchasePrice),
        sellingPrice: parseFloat(formData.sellingPrice),
        miles: parseInt(formData.miles),
        description: formData.description,
        documents: formData.documents,
        freeWash: formData.freeWash,
        repairs: formData.repairs,
        partners: formData.partners,
        status: sheetState.bike?.status || "listed",
        images: ["/placeholder-bike.jpg"], // In real app, use uploaded image URLs
        listedDate: sheetState.bike?.listedDate || new Date().toISOString().split('T')[0],
        holdDuration: sheetState.bike?.holdDuration || 0,
      };

      if (sheetState.mode === 'edit' && sheetState.bike) {
        setBikes(prev => prev.map(bike => bike.id === sheetState.bike?.id ? newBike : bike));
      } else {
        setBikes(prev => [...prev, newBike]);
      }

      setSheetState({ isOpen: false, mode: 'create', bike: null });
    } catch (error) {
      console.error("Error saving bike:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (bike: Bike) => {
    setSheetState({
      isOpen: true,
      mode: 'edit',
      bike,
    });
  };

  const handleView = (bike: Bike) => {
    setSheetState({
      isOpen: true,
      mode: 'view',
      bike,
    });
  };

  const handleDelete = (bikeId: string) => {
    setBikes(prev => prev.filter(bike => bike.id !== bikeId));
  };

  const openNewBikeDialog = () => {
    setSheetState({
      isOpen: true,
      mode: 'create',
      bike: null,
    });
  };

  const handleSheetOpenChange = (open: boolean) => {
    if (!open) {
      setSheetState(prev => ({ ...prev, isOpen: false }));
    }
  };

  const totalBikes = bikes.length;
  const listedBikes = bikes.filter(b => b.status === 'listed').length;
  const soldBikes = bikes.filter(b => b.status === 'sold').length;
  const avgHoldTime = totalBikes > 0 
    ? Math.round(bikes.reduce((acc, bike) => acc + bike.holdDuration, 0) / totalBikes)
    : 0;

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bike Listings</h1>
          <p className="text-muted-foreground">Manage your bike inventory and listings</p>
        </div>
        <Button onClick={openNewBikeDialog} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add New Bike
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search bikes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="listed">Listed</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bikes</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBikes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Listed</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{listedBikes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sold</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{soldBikes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Hold Time</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgHoldTime} days</div>
          </CardContent>
        </Card>
      </div>

      {/* Bikes Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Bikes</CardTitle>
          <CardDescription>A list of all bikes in your inventory</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Bike</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Purchase Price</TableHead>
                  <TableHead>Selling Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Hold Duration</TableHead>
                  <TableHead className="text-right w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBikes.map((bike) => (
                  <TableRow key={bike.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Image
                          src={bike.images[0]}
                          alt={`${bike.brand} ${bike.model}`}
                          width={40}
                          height={40}
                          className="rounded object-cover"
                        />
                        <div>
                          <div className="font-medium">{bike.brand} {bike.model}</div>
                          <div className="text-sm text-muted-foreground">
                            {bike.cc}cc • {bike.miles.toLocaleString()} miles
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{bike.year}</TableCell>
                    <TableCell>${bike.purchasePrice.toLocaleString()}</TableCell>
                    <TableCell>${bike.sellingPrice.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={bike.status === 'sold' ? 'default' : 'secondary'}>
                        {bike.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={bike.holdDuration > 30 ? 'text-orange-600 font-medium' : ''}>
                        {bike.holdDuration} days
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEdit(bike)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleView(bike)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDelete(bike.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Reusable Bike Sheet */}
      <BikeSheet
        isOpen={sheetState.isOpen}
        onOpenChange={handleSheetOpenChange}
        mode={sheetState.mode}
        bike={sheetState.bike}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}