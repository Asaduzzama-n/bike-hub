"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Edit, Trash2, Plus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import BikeSheet from "@/components/bikeSheet";

interface TrailingBike {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  daysHeld: number;
  condition: string;
  location: string;
}

// Mock data for trailing bikes
const initialTrailingBikes: TrailingBike[] = [
  {
    id: "1",
    brand: "Honda",
    model: "CBR 150R",
    year: 2020,
    price: 2500,
    daysHeld: 45,
    condition: "Good",
    location: "Warehouse A",
  },
  {
    id: "2",
    brand: "Yamaha",
    model: "FZ-S",
    year: 2019,
    price: 2200,
    daysHeld: 38,
    condition: "Excellent",
    location: "Warehouse B",
  },
  {
    id: "3",
    brand: "Bajaj",
    model: "Pulsar NS200",
    year: 2021,
    price: 3200,
    daysHeld: 32,
    condition: "Fair",
    location: "Warehouse A",
  },
  {
    id: "4",
    brand: "Hero",
    model: "Splendor Plus",
    year: 2018,
    price: 1800,
    daysHeld: 52,
    condition: "Good",
    location: "Warehouse C",
  },
  {
    id: "5",
    brand: "TVS",
    model: "Apache RTR 160",
    year: 2020,
    price: 2800,
    daysHeld: 41,
    condition: "Excellent",
    location: "Warehouse B",
  },
];

export default function TrailingBikesPage() {
  const [bikes, setBikes] = useState<TrailingBike[]>(initialTrailingBikes);
  const [editingBike, setEditingBike] = useState<TrailingBike | null>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isBikeSheetOpen, setIsBikeSheetOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<TrailingBike>>({});

  const handleEdit = (bike: TrailingBike) => {
    setEditingBike(bike);
    setFormData(bike);
    setIsEditSheetOpen(true);
  };

  const handleAdd = () => {
    setEditingBike(null);
    setFormData({
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      price: 0,
      daysHeld: 0,
      condition: "Good",
      location: "Warehouse A",
    });
    setIsAddSheetOpen(true);
  };

  const handleSave = () => {
    if (editingBike) {
      // Update existing bike
      setBikes(bikes.map(bike => 
        bike.id === editingBike.id ? { ...formData as TrailingBike } : bike
      ));
      setIsEditSheetOpen(false);
    } else {
      // Add new bike
      const newBike: TrailingBike = {
        ...formData as TrailingBike,
        id: Date.now().toString(),
      };
      setBikes([...bikes, newBike]);
      setIsAddSheetOpen(false);
    }
    setFormData({});
    setEditingBike(null);
  };

  const handleDelete = (id: string) => {
    setBikes(bikes.filter(bike => bike.id !== id));
  };

  const getDaysHeldBadgeVariant = (days: number) => {
    if (days >= 50) return "destructive";
    if (days >= 40) return "secondary";
    return "outline";
  };

  const EditSheet = ({ isOpen, onOpenChange, title }: { isOpen: boolean; onOpenChange: (open: boolean) => void; title: string }) => (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[500px]">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            {editingBike ? "Make changes to the bike details here." : "Add a new bike to the trailing list."}
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="brand" className="text-right">
              Brand
            </Label>
            <Input
              id="brand"
              value={formData.brand || ""}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="model" className="text-right">
              Model
            </Label>
            <Input
              id="model"
              value={formData.model || ""}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="year" className="text-right">
              Year
            </Label>
            <Input
              id="year"
              type="number"
              value={formData.year || ""}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Price ($)
            </Label>
            <Input
              id="price"
              type="number"
              value={formData.price || ""}
              onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="daysHeld" className="text-right">
              Days Held
            </Label>
            <Input
              id="daysHeld"
              type="number"
              value={formData.daysHeld || ""}
              onChange={(e) => setFormData({ ...formData, daysHeld: parseInt(e.target.value) })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="condition" className="text-right">
              Condition
            </Label>
            <Input
              id="condition"
              value={formData.condition || ""}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">
              Location
            </Label>
            <Input
              id="location"
              value={formData.location || ""}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="col-span-3"
            />
          </div>
        </div>
        <SheetFooter>
          <Button type="submit" onClick={handleSave}>
            {editingBike ? "Save Changes" : "Add Bike"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trailing Bikes</h1>
          <p className="text-muted-foreground">
            Bikes that have been listed for more than 30 days without selling
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Bike
        </Button>
      </div>

      {/* Alert */}
      {bikes.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have <strong>{bikes.length} bikes</strong> that have been listed for more than 30 days.
            Consider reviewing their pricing or marketing strategy.
          </AlertDescription>
        </Alert>
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <span>Trailing Bikes Inventory</span>
          </CardTitle>
          <CardDescription>
            Manage bikes that require attention due to extended listing periods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Brand & Model</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Days Held</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bikes.map((bike) => (
                <TableRow key={bike.id}>
                  <TableCell className="font-medium">
                    {bike.brand} {bike.model}
                  </TableCell>
                  <TableCell>{bike.year}</TableCell>
                  <TableCell>${bike.price.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={getDaysHeldBadgeVariant(bike.daysHeld)}>
                      {bike.daysHeld} days
                    </Badge>
                  </TableCell>
                  <TableCell>{bike.condition}</TableCell>
                  <TableCell>{bike.location}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(bike)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(bike.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {bikes.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No trailing bikes found. Great job keeping inventory moving!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Sheet */}
      <EditSheet 
        isOpen={isEditSheetOpen} 
        onOpenChange={setIsEditSheetOpen} 
        title="Edit Bike"
      />

      {/* Add Sheet */}
      <EditSheet 
        isOpen={isAddSheetOpen} 
        onOpenChange={setIsAddSheetOpen} 
        title="Add New Bike"
      />
    </div>
  );
}