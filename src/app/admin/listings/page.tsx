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
  Loader2,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import BikeSheet from "@/components/bikeSheet";
import { adminApi, type BikeData, type PaginationData } from "@/lib/api";
import { 
  LocalBike, 
  BikeFormData, 
  convertApiBikeToLocal, 
  convertFormToApiData, 
  initialFormData, 
  brands 
} from "@/lib/utils/interface-converters";

// Types
type Bike = LocalBike;

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
  const [bikes, setBikes] = useState<Bike[]>([]);
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
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch bikes from API
  const fetchBikes = async (page = 1) => {
    try {
      setIsPageLoading(true);
      setError(null);
      
      const response = await adminApi.getBikes({
        page,
        limit: 20,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchQuery || undefined,
        sortBy,
        sortOrder,
      });
      
      if (response.success && response.data) {
        const convertedBikes = response.data.bikes.map(convertApiBikeToLocal);
        setBikes(convertedBikes);
        setPagination(response.data.pagination);
        setCurrentPage(page);
      } else {
        setError(response.error || response.message || 'Failed to fetch bikes');
        setBikes([]);
      }
    } catch (err) {
      console.error('Error fetching bikes:', err);
      setError('Failed to connect to server');
      setBikes([]);
    } finally {
      setIsPageLoading(false);
    }
  };

  // Load bikes on component mount and when filters change
  useEffect(() => {
    fetchBikes(1);
  }, [statusFilter, searchQuery, sortBy, sortOrder]);

  // Handle page changes
  const handlePageChange = (page: number) => {
    fetchBikes(page);
  };

  // Since filtering is now done server-side, we use bikes directly
  const filteredBikes = bikes;

  const handleSubmit = async (formData: BikeFormData) => {
    setIsLoading(true);

    try {
      const bikeData = convertFormToApiData(formData);
      
      // Preserve existing status if editing
      if (sheetState.mode === 'edit' && sheetState.bike) {
        bikeData.status = sheetState.bike.status;
      }

      let response;
      if (sheetState.mode === 'edit' && sheetState.bike) {
        response = await adminApi.updateBike(sheetState.bike.id, bikeData);
      } else {
        response = await adminApi.createBike(bikeData);
      }

      if (response.success) {
        setSheetState({ isOpen: false, mode: 'create', bike: null });
        // Refresh the bikes list
        await fetchBikes(currentPage);
      } else {
        setError(response.error || response.message || 'Failed to save bike');
      }
    } catch (error) {
      console.error("Error saving bike:", error);
      setError('Failed to save bike');
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

  const handleDelete = async (bikeId: string) => {
    try {
      const response = await adminApi.deleteBike(bikeId);
      
      if (response.success) {
        // Refresh the bikes list
        await fetchBikes(currentPage);
      } else {
        setError(response.error || response.message || 'Failed to delete bike');
      }
    } catch (error) {
      console.error('Error deleting bike:', error);
      setError('Failed to delete bike');
    }
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

  const totalBikes = pagination?.totalItems || 0;
  const listedBikes = bikes.filter(b => b.status === 'available').length;
  const soldBikes = bikes.filter(b => b.status === 'sold').length;
  const avgHoldTime = totalBikes > 0 
    ? Math.round(bikes.reduce((acc, bike) => acc + (bike.holdDuration || 0), 0) / totalBikes)
    : 0;

  if (isPageLoading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading bikes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bike Listings</h1>
          <p className="text-muted-foreground">Manage your bike inventory and listings</p>
          {error && (
            <div className="flex items-center mt-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 mr-1" />
              {error}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchBikes(currentPage)}>
            Refresh
          </Button>
          <Button onClick={openNewBikeDialog} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add New Bike
          </Button>
        </div>
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
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
            <SelectItem value="reserved">Reserved</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
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
                  <TableHead>Buy Price</TableHead>
                  <TableHead>Sell Price</TableHead>
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
                            {bike.cc}cc • {bike.mileage.toLocaleString()} miles
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{bike.year}</TableCell>
                    <TableCell>${bike.buyPrice.toLocaleString()}</TableCell>
                    <TableCell>${bike.sellPrice.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={bike.status === 'sold' ? 'default' : 'secondary'}>
                        {bike.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={bike.holdDuration && bike.holdDuration > 30 ? 'text-orange-600 font-medium' : ''}>
                        {bike.holdDuration ? `${bike.holdDuration} days` : 'N/A'}
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

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
            {pagination.totalItems} bikes
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
            >
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = Math.max(1, pagination.currentPage - 2) + i;
                if (pageNum > pagination.totalPages) return null;
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === pagination.currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      )}

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