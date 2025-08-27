"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Heart, 
  Share2, 
  Phone, 
  MessageCircle, 
  MapPin, 
  Calendar, 
  Gauge, 
  Fuel, 
  Settings, 
  Shield, 
  CheckCircle, 
  Star,
  ChevronLeft,
  ChevronRight,
  Eye,
  Clock
} from "lucide-react";

// Mock data - in real app this would come from API
const bikeDetails = {
  id: "1",
  brand: "Honda",
  model: "CBR 150R",
  year: 2020,
  cc: 150,
  price: 2500,
  mileage: 15000,
  images: [
    "/placeholder-bike.jpg",
    "/placeholder-bike.jpg",
    "/placeholder-bike.jpg",
    "/placeholder-bike.jpg"
  ],
  location: "Dhaka, Bangladesh",
  isVerified: true,
  freeWash: true,
  description: "Well-maintained Honda CBR 150R in excellent condition. Single owner, all papers verified. Regular servicing done at authorized Honda service center. No accidents, no major repairs. Ready for immediate sale.",
  features: [
    "ABS Braking System",
    "Digital Speedometer",
    "LED Headlight",
    "Electric Start",
    "Tubeless Tires",
    "Disc Brakes (Front & Rear)"
  ],
  specifications: {
    engine: "149.16 cc",
    power: "17.1 PS @ 9000 rpm",
    torque: "14.4 Nm @ 7000 rpm",
    fuelTank: "12 Liters",
    weight: "136 kg",
    topSpeed: "135 km/h"
  },
  seller: {
    name: "Ahmed Rahman",
    phone: "+880 1712-345678",
    location: "Dhanmondi, Dhaka",
    memberSince: "2022",
    rating: 4.8,
    totalSales: 12
  },
  postedDate: "2024-01-15",
  views: 234,
  interested: 18
};

const relatedBikes = [
  {
    id: "2",
    brand: "Yamaha",
    model: "FZ-S",
    year: 2019,
    price: 2200,
    images: ["/placeholder-bike.jpg"],
    location: "Chittagong"
  },
  {
    id: "3",
    brand: "Bajaj",
    model: "Pulsar NS200",
    year: 2021,
    price: 3200,
    images: ["/placeholder-bike.jpg"],
    location: "Sylhet"
  },
  {
    id: "4",
    brand: "Hero",
    model: "Splendor Plus",
    year: 2018,
    price: 1800,
    images: ["/placeholder-bike.jpg"],
    location: "Rajshahi"
  }
];

export default function BikeDetailsPage() {
  const params = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === bikeDetails.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? bikeDetails.images.length - 1 : prev - 1
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="p-0">
              <CardContent className="p-0">
                <div className="relative aspect-video bg-slate-100 dark:bg-slate-800 rounded-t-lg  overflow-hidden">
                  <img
                    src={bikeDetails.images[currentImageIndex]}
                    alt={`${bikeDetails.brand} ${bikeDetails.model}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Navigation Arrows */}
                  {bikeDetails.images.length > 1 && (
                    <>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={nextImage}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  
                  {/* Image Indicators */}
                  {bikeDetails.images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {bikeDetails.images.map((_, index) => (
                        <button
                          key={index}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentImageIndex ? "bg-white" : "bg-white/50"
                          }`}
                          onClick={() => setCurrentImageIndex(index)}
                        />
                      ))}
                    </div>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    {/* {bikeDetails.isVerified && (
                      <Badge className="bg-green-500 hover:bg-green-600">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )} */}
                    {bikeDetails.freeWash && (
                      <Badge className="bg-primary text-primary-foreground hover:bg-primary/90">
                        Free Wash
                      </Badge>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="bg-white/80 hover:bg-white"
                      onClick={() => setIsLiked(!isLiked)}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="bg-white/80 hover:bg-white"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Thumbnail Strip */}
                {bikeDetails.images.length > 1 && (
                  <div className="p-4 border-t">
                    <div className="flex gap-2 overflow-x-auto">
                      {bikeDetails.images.map((image, index) => (
                        <button
                          key={index}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                            index === currentImageIndex ? "border-primary" : "border-transparent"
                          }`}
                          onClick={() => setCurrentImageIndex(index)}
                        >
                          <img
                            src={image}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bike Details */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">
                      {bikeDetails.brand} {bikeDetails.model}
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{bikeDetails.year}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Gauge className="w-4 h-4" />
                        <span>{bikeDetails.cc} CC</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{bikeDetails.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">
                      ${bikeDetails.price.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {bikeDetails.mileage.toLocaleString()} km
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <Eye className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                    <div className="font-semibold">{bikeDetails.views}</div>
                    <div className="text-xs text-muted-foreground">Views</div>
                  </div>
                  <div className="text-center p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <Heart className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                    <div className="font-semibold">{bikeDetails.interested}</div>
                    <div className="text-xs text-muted-foreground">Interested</div>
                  </div>
                  <div className="text-center p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <Clock className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                    <div className="font-semibold">5 days</div>
                    <div className="text-xs text-muted-foreground">Posted</div>
                  </div>
                  <div className="text-center p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <CheckCircle className="w-5 h-5 mx-auto mb-1 text-green-500" />
                    <div className="font-semibold">Verified</div>
                    <div className="text-xs text-muted-foreground">Papers</div>
                  </div>
                </div>

                <Separator />

                {/* Description */}
                <div>
                  <h3 className="font-semibold mb-3">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {bikeDetails.description}
                  </p>
                </div>

                <Separator />

                {/* Features */}
                <div>
                  <h3 className="font-semibold mb-3">Key Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {bikeDetails.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Specifications */}
                <div>
                  <h3 className="font-semibold mb-3">Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(bikeDetails.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Seller */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Seller</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                    <span className="font-semibold">
                      {bikeDetails.seller.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold">{bikeDetails.seller.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Member since {bikeDetails.seller.memberSince}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{bikeDetails.seller.rating}</span>
                  <span className="text-sm text-muted-foreground">
                    ({bikeDetails.seller.totalSales} sales)
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{bikeDetails.seller.location}</span>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    className="w-full" 
                    onClick={() => setShowContactDialog(true)}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call Seller
                  </Button>
                  <Button variant="outline" className="w-full">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Safety Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Safety Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Meet in a public place</li>
                  <li>• Verify all documents</li>
                  <li>• Test ride before buying</li>
                  <li>• Check engine and brakes</li>
                  <li>• Negotiate fairly</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Bikes */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Similar Bikes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedBikes.map((bike) => (
              <Card key={bike.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-slate-100 dark:bg-slate-800">
                  <img
                    src={bike.images[0]}
                    alt={`${bike.brand} ${bike.model}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold">{bike.brand} {bike.model}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-lg font-bold text-primary">
                      ${bike.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {bike.year}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span className="text-xs">{bike.location}</span>
                  </div>
                  <Button className="w-full mt-3" variant="outline" size="sm">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>

      {/* Contact Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Seller</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{bikeDetails.seller.phone}</div>
              <p className="text-muted-foreground mt-2">
                Call {bikeDetails.seller.name} to discuss this {bikeDetails.brand} {bikeDetails.model}
              </p>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => window.open(`tel:${bikeDetails.seller.phone}`)}>
                <Phone className="w-4 h-4 mr-2" />
                Call Now
              </Button>
              <Button variant="outline" className="flex-1">
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}