"use client";

import { useState, useMemo, useEffect } from "react";
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
  X,
  Loader2
} from "lucide-react";
import { useBikes } from "@/hooks/useApi";
import { BikeData } from "@/lib/api";

// Removed mock data - now using API data exclusively

const brands = ["Honda", "Yamaha", "Bajaj", "Hero", "TVS", "Suzuki"];

export default function ListingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid-3" | "grid-2">("grid-3");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch bikes from API
  const { data: bikesData, loading, error, refetch } = useBikes({
    page,
    limit: 12,
    search: searchQuery || undefined,
    minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
    maxPrice: priceRange[1] < 500000 ? priceRange[1] : undefined,
    brand: selectedBrands.length > 0 ? selectedBrands.join(',') : undefined,
  });

  // Use API data
  const allBikes = bikesData?.bikes || [];
  
  // No need for client-side filtering since API handles brand filtering
  const filteredBikes = allBikes;

  const clearFilters = () => {
    setSelectedBrands([]);
    setPriceRange([0, 500000]);
    setSearchQuery("");
    setPage(1);
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
    priceRange[0] > 0 || priceRange[1] < 500000,
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
        <h3 className="font-semibold mb-3">Price Range (BDT)</h3>
        <div className="space-y-4">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={500000}
            min={0}
            step={10000}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>৳{priceRange[0].toLocaleString()}</span>
            <span>৳{priceRange[1].toLocaleString()}</span>
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
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Loading bikes...</span>
                </div>
              ) : error ? (
                <Card className="p-12 text-center">
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                      <X className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold">Error loading bikes</h3>
                    <p className="text-muted-foreground">{error}</p>
                    <Button onClick={refetch} variant="outline">
                      Try Again
                    </Button>
                  </div>
                </Card>
              ) : filteredBikes.length === 0 ? (
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
                    <BikeCard key={'_id' in bike ? bike._id : bike.id} bike={bike} />
                  ))}
                </div>
              )}

              {/* Load More Button (for pagination) */}
              {filteredBikes.length > 0 && bikesData?.pagination?.hasNextPage && (
                <div className="text-center mt-12">
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => setPage(prev => prev + 1)}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More Bikes'
                    )}
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