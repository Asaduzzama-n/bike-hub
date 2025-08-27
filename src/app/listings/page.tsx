"use client";

import { useState, useMemo } from "react";
import Navbar from "@/components/navbar";
import BikeCard from "@/components/bike-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Grid3X3, 
  List,
  ChevronDown,
  X
} from "lucide-react";

// Mock data - in real app this would come from API
const allBikes = [
  {
    id: "1",
    brand: "Honda",
    model: "CBR 150R",
    year: 2020,
    cc: 150,
    price: 2500,
    mileage: 15000,
    images: ["/placeholder-bike.jpg"],
    location: "Dhaka",
    isVerified: true,
    freeWash: true,
    isTrailing: false,
    daysHeld: 15,
  },
  {
    id: "2",
    brand: "Yamaha",
    model: "FZ-S",
    year: 2019,
    cc: 149,
    price: 2200,
    mileage: 22000,
    images: ["/placeholder-bike.jpg"],
    location: "Chittagong",
    isVerified: true,
    freeWash: false,
    isTrailing: true,
    daysHeld: 45,
  },
  {
    id: "3",
    brand: "Bajaj",
    model: "Pulsar NS200",
    year: 2021,
    cc: 200,
    price: 3200,
    mileage: 8000,
    images: ["/placeholder-bike.jpg"],
    location: "Sylhet",
    isVerified: true,
    freeWash: true,
    isTrailing: false,
    daysHeld: 8,
  },
  {
    id: "4",
    brand: "Hero",
    model: "Splendor Plus",
    year: 2018,
    cc: 97,
    price: 1800,
    mileage: 35000,
    images: ["/placeholder-bike.jpg"],
    location: "Rajshahi",
    isVerified: true,
    freeWash: false,
    isTrailing: true,
    daysHeld: 52,
  },
  {
    id: "5",
    brand: "TVS",
    model: "Apache RTR 160",
    year: 2019,
    cc: 160,
    price: 2400,
    mileage: 18000,
    images: ["/placeholder-bike.jpg"],
    location: "Khulna",
    isVerified: true,
    freeWash: true,
    isTrailing: false,
    daysHeld: 22,
  },
  {
    id: "6",
    brand: "Suzuki",
    model: "Gixxer SF",
    year: 2020,
    cc: 155,
    price: 2800,
    mileage: 12000,
    images: ["/placeholder-bike.jpg"],
    location: "Barisal",
    isVerified: true,
    freeWash: true,
    isTrailing: true,
    daysHeld: 38,
  },
];

const brands = ["Honda", "Yamaha", "Bajaj", "Hero", "TVS", "Suzuki"];

export default function ListingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 5000]);

  const [viewMode, setViewMode] = useState<"grid-3" | "grid-2">("grid-3");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter and search logic
  const filteredBikes = useMemo(() => {
    return allBikes.filter((bike) => {
      const matchesSearch = 
        bike.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bike.model.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(bike.brand);
      const matchesPrice = bike.price >= priceRange[0] && bike.price <= priceRange[1];
      return matchesSearch && matchesBrand && matchesPrice;
    });
  }, [searchQuery, selectedBrands, priceRange]);

  const clearFilters = () => {
    setSelectedBrands([]);
    setPriceRange([0, 5000]);

    setSearchQuery("");
  };

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

const activeFiltersCount = [
    searchQuery.length > 0,
    selectedBrands.length > 0,
    priceRange[0] > 0 || priceRange[1] < 5000,
  ].filter(Boolean).length;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Brand Filter */}
      <div>
        <h3 className="font-semibold mb-3">Brands</h3>
        <div className="space-y-2">
          {brands.map((brand) => (
            <div key={brand} className="flex items-center space-x-2">
              <Checkbox
                id={brand}
                checked={selectedBrands.includes(brand)}
                onCheckedChange={() => handleBrandToggle(brand)}
              />
              <label
                htmlFor={brand}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {brand}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-3">Price Range ($)</h3>
        <div className="space-y-4">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={5000}
            min={0}
            step={100}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>
      </div>



      <Separator />

      {/* Clear Filters */}
      <Button 
        variant="outline" 
        onClick={clearFilters}
        className="w-full"
        disabled={activeFiltersCount === 0}
      >
        <X className="w-4 h-4 mr-2" />
        Clear All Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header */}
      <section className="bg-slate-50 dark:bg-slate-900 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Bike Listings
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Browse our collection of verified second-hand bikes with complete documentation
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-6 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {/* Search Bar - Full Width */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by brand, model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 focus:ring-0 focus:ring-offset-0"
              />
            </div>
            
            <div className="flex items-center justify-end">

            <div className="flex items-center gap-4">
              {/* Mobile Filter Button */}
              <div className="lg:hidden">
                <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filters
                      {activeFiltersCount > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[80vh]">
                    <SheetHeader>
                      <SheetTitle>Filter Bikes</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 overflow-y-auto">
                      <FilterContent />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Grid Layout Toggle */}
              <div className="flex items-center border rounded-lg p-1">
                <Button
                  variant={viewMode === "grid-3" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid-3")}
                  className="text-xs  rounded-l-md rounded-r-none"
                >
                  3 Cards
                </Button>
                <Button
                  variant={viewMode === "grid-2" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid-2")}
                  className="text-xs  rounded-r-md rounded-l-none"
                >
                  2 Cards
                </Button>
              </div>

              {/* Results Count */}
              <div className="text-sm text-muted-foreground">
                {filteredBikes.length} bikes found
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {/* Desktop Sidebar Filters */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Filters</span>
                    {activeFiltersCount > 0 && (
                      <Badge variant="secondary">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FilterContent />
                </CardContent>
              </Card>
            </div>

            {/* Bikes Grid/List */}
            <div className="flex-1">
              {filteredBikes.length === 0 ? (
                <Card className="p-12 text-center">
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                      <Search className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold">No bikes found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search criteria or filters
                    </p>
                    <Button onClick={clearFilters} variant="outline">
                      Clear Filters
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className={`grid gap-6 ${
                  viewMode === "grid-3" 
                    ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" 
                    : "grid-cols-1 md:grid-cols-2"
                }`}>
                  {filteredBikes.map((bike) => (
                    <BikeCard key={bike.id} bike={bike} />
                  ))}
                </div>
              )}

              {/* Load More Button (for pagination) */}
              {filteredBikes.length > 0 && (
                <div className="text-center mt-12">
                  <Button variant="outline" size="lg">
                    Load More Bikes
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      {/* <footer className="bg-slate-50 dark:bg-slate-900 py-12 mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-lg font-semibold mb-4">BikeHub</h3>
              <p className="text-muted-foreground mb-4">
                Your trusted platform for buying verified second-hand bikes with complete documentation and free wash services.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="/" className="hover:text-foreground">Home</a></li>
                <li><a href="/listings" className="hover:text-foreground">Browse Bikes</a></li>
                <li><a href="/sell" className="hover:text-foreground">Sell Your Bike</a></li>
                <li><a href="/wash" className="hover:text-foreground">Bike Wash</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="/terms" className="hover:text-foreground">Terms & Conditions</a></li>
                <li><a href="/privacy" className="hover:text-foreground">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 BikeHub. All rights reserved.</p>
          </div>
        </div>
      </footer> */}
    </div>

  );
}