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


interface BikeSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'view' | 'edit' | 'create';
  bike?: Bike | null;
  onSubmit?: (data: BikeFormData) => Promise<void>;
  isLoading?: boolean;
}

function BikeSheet({ isOpen, onOpenChange, mode, bike, onSubmit, isLoading = false }: BikeSheetProps) {
  const [formData, setFormData] = useState<BikeFormData>(initialFormData);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    if (bike && (mode === 'edit' || mode === 'view')) {
      setFormData({
        brand: bike.brand,
        model: bike.model,
        year: bike.year.toString(),
        cc: bike.cc.toString(),
        purchasePrice: bike.purchasePrice.toString(),
        sellingPrice: bike.sellingPrice.toString(),
        miles: bike.miles.toString(),
        description: bike.description,
        documents: bike.documents,
        freeWash: bike.freeWash,
        repairs: bike.repairs.map((r) => ({ name: r.name, cost: r.cost.toString() })),
        partners: bike.partners.map((p) => ({ name: p.name, investment: p.investment.toString() })),
        images: [],
      });
    } else {
      setFormData(initialFormData);
      setImagePreviewUrls([]);
    }
  }, [bike, mode, isOpen]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
    
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const addPartner = () => {
    setFormData(prev => ({
      ...prev,
      partners: [...prev.partners, { name: "", investment: "" }]
    }));
  };

  const updatePartner = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      partners: prev.partners.map((partner, i) => 
        i === index ? { ...partner, [field]: value } : partner
      )
    }));
  };

  const removePartner = (index: number) => {
    setFormData(prev => ({
      ...prev,
      partners: prev.partners.filter((_, i) => i !== index)
    }));
  };

  const addRepair = () => {
    setFormData(prev => ({
      ...prev,
      repairs: [...prev.repairs, { name: "", cost: "" }]
    }));
  };

  const updateRepair = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      repairs: prev.repairs.map((repair, i) => 
        i === index ? { ...repair, [field]: value } : repair
      )
    }));
  };

  const removeRepair = (index: number) => {
    setFormData(prev => ({
      ...prev,
      repairs: prev.repairs.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      await onSubmit(formData);
    }
  };

  const getSheetTitle = () => {
    switch (mode) {
      case 'create':
        return 'Add New Bike';
      case 'edit':
        return 'Edit Bike';
      case 'view':
        return `${bike?.brand} ${bike?.model}`;
      default:
        return 'Bike Details';
    }
  };

  const getSheetDescription = () => {
    switch (mode) {
      case 'create':
        return 'Add a new bike to your inventory';
      case 'edit':
        return 'Update the bike information';
      case 'view':
        return `${bike?.year} • ${bike?.cc}cc • ${bike?.miles.toLocaleString()} miles`;
      default:
        return '';
    }
  };

  if (mode === 'view' && bike) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="max-h-[100vh] sm:h-auto sm:side-right sm:w-[95vw] sm:max-w-[800px] overflow-hidden">
          <SheetHeader className="px-6 py-4 border-b flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-primary" />
              </div>
              <div>
                <SheetTitle className="text-lg font-bold">{getSheetTitle()}</SheetTitle>
                <SheetDescription className="text-sm text-muted-foreground">
                  {getSheetDescription()}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {/* Basic Information */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-foreground">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={bike.status === 'sold' ? 'default' : 'secondary'}>
                    {bike.status}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Listed Date</p>
                  <p className="text-sm font-medium">{bike.listedDate}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Hold Duration</p>
                  <p className="text-sm font-medium">{bike.holdDuration} days</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Free Wash</p>
                  <div className="flex items-center gap-2">
                    <Checkbox checked={bike.freeWash} disabled className="w-4 h-4" />
                    <span className="text-sm">{bike.freeWash ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Overview */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-foreground">Financial Overview</h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Purchase Price</span>
                  <span className="text-lg font-bold">${bike.purchasePrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Selling Price</span>
                  <span className="text-lg font-bold">${bike.sellingPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-sm font-medium">Net Profit</span>
                  <span className="text-lg font-bold text-green-600">
                    ${(bike.sellingPrice - bike.purchasePrice - 
                      bike.repairs.reduce((sum, repair) => sum + parseFloat(repair.cost || '0'), 0)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Repairs & Modifications */}
            {bike.repairs && bike.repairs.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-foreground">Repairs & Modifications</h3>
                <div className="space-y-2">
                  {bike.repairs.map((repair, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium">{repair.name}</span>
                      <span className="text-sm font-semibold">${parseFloat(repair.cost || '0').toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <span className="text-sm font-medium">Total Repair Cost</span>
                    <span className="text-sm font-bold text-orange-600">
                      ${bike.repairs.reduce((sum, repair) => sum + parseFloat(repair.cost || '0'), 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Partner Investments */}
            {bike.partners && bike.partners.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-foreground">Partner Investments</h3>
                <div className="space-y-3">
                  {bike.partners.map((partner, index) => {
                    const totalInvestment = bike.partners.reduce((sum, p) => sum + parseFloat(p.investment || '0'), 0);
                    const partnerShare = parseFloat(partner.investment || '0') / totalInvestment;
                    const partnerProfit = partnerShare * (bike.sellingPrice - bike.purchasePrice - 
                      bike.repairs.reduce((sum, repair) => sum + parseFloat(repair.cost || '0'), 0));
                    
                    return (
                      <div key={index} className="p-4 bg-muted/50 rounded-lg space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">{partner.name.charAt(0)}</span>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold">{partner.name}</h4>
                            <p className="text-xs text-muted-foreground">{(partnerShare * 100).toFixed(1)}% ownership</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center">
                            <p className="text-sm font-semibold">${parseFloat(partner.investment || '0').toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Investment</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-semibold text-green-600">${partnerProfit.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Profit</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-semibold">${(parseFloat(partner.investment || '0') + partnerProfit).toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Total Return</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-foreground">Additional Information</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-sm leading-relaxed p-3 bg-muted/50 rounded-lg">{bike.description}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Documents</p>
                  <div className="flex flex-wrap gap-2">
                    {bike.documents.map((doc, index) => (
                      <Badge key={index} variant="outline" className="text-xs">{doc}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
            
           <SheetFooter className="border-t pt-4">
             <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
               Close
             </Button>
           </SheetFooter>
         </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[100vh] sm:h-auto sm:side-right sm:w-[95vw] sm:max-w-[800px] overflow-hidden">
        <div className="flex flex-col h-full">
          <SheetHeader className="px-6 py-4 border-b flex-shrink-0">
            <SheetTitle>{getSheetTitle()}</SheetTitle>
            <SheetDescription>{getSheetDescription()}</SheetDescription>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Select 
                    value={formData.brand} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, brand: value }))}
                    disabled={mode === 'view'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map(brand => (
                        <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                    required
                    disabled={mode === 'view'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                    required
                    disabled={mode === 'view'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cc">CC</Label>
                  <Input
                    id="cc"
                    type="number"
                    value={formData.cc}
                    onChange={(e) => setFormData(prev => ({ ...prev, cc: e.target.value }))}
                    required
                    disabled={mode === 'view'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchasePrice">Purchase Price ($)</Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: e.target.value }))}
                    required
                    disabled={mode === 'view'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sellingPrice">Selling Price ($)</Label>
                  <Input
                    id="sellingPrice"
                    type="number"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, sellingPrice: e.target.value }))}
                    required
                    disabled={mode === 'view'}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="miles">Miles</Label>
                  <Input
                    id="miles"
                    type="number"
                    value={formData.miles}
                    onChange={(e) => setFormData(prev => ({ ...prev, miles: e.target.value }))}
                    required
                    disabled={mode === 'view'}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  disabled={mode === 'view'}
                />
              </div>

              {/* Images */}
              {mode !== 'view' && (
                <div className="space-y-2">
                  <Label>Images</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                      <div className="mt-4">
                        <Label htmlFor="images" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-foreground">
                            Click to upload images
                          </span>
                          <Input
                            id="images"
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </Label>
                      </div>
                    </div>
                  </div>
                  {imagePreviewUrls.length > 0 && (
                    <div className="grid grid-cols-4 gap-4 mt-4">
                      {imagePreviewUrls.map((url, index) => (
                        <div key={index} className="relative">
                          <Image
                            src={url}
                            alt={`Preview ${index + 1}`}
                            width={100}
                            height={100}
                            className="rounded object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Additional Options */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="freeWash"
                    checked={formData.freeWash}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, freeWash: checked as boolean }))}
                    disabled={mode === 'view'}
                  />
                  <Label htmlFor="freeWash">Free Wash Included</Label>
                </div>
                
                {/* Repairs/Modifications */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Repairs/Modifications</Label>
                    {mode !== 'view' && (
                      <Button type="button" variant="outline" size="sm" onClick={addRepair}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Repair
                      </Button>
                    )}
                  </div>
                  {formData.repairs.map((repair, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        placeholder="Repair/modification name"
                        value={repair.name}
                        onChange={(e) => updateRepair(index, 'name', e.target.value)}
                        disabled={mode === 'view'}
                      />
                      <Input
                        placeholder="Cost"
                        type="number"
                        value={repair.cost}
                        onChange={(e) => updateRepair(index, 'cost', e.target.value)}
                        disabled={mode === 'view'}
                      />
                      {mode !== 'view' && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeRepair(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Partners */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Partner Investments</Label>
                    {mode !== 'view' && (
                      <Button type="button" variant="outline" size="sm" onClick={addPartner}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Partner
                      </Button>
                    )}
                  </div>
                  {formData.partners.map((partner, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        placeholder="Partner name"
                        value={partner.name}
                        onChange={(e) => updatePartner(index, 'name', e.target.value)}
                        disabled={mode === 'view'}
                      />
                      <Input
                        placeholder="Investment amount"
                        type="number"
                        value={partner.investment}
                        onChange={(e) => updatePartner(index, 'investment', e.target.value)}
                        disabled={mode === 'view'}
                      />
                      {mode !== 'view' && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removePartner(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </form>
          </div>

          <SheetFooter className="px-6 py-4 border-t flex-shrink-0">
            <div className="flex gap-2 w-full">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              {mode !== 'view' && (
                <Button 
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Saving...' : mode === 'edit' ? 'Update Bike' : 'Add Bike'}
                </Button>
              )}
            </div>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default BikeSheet;