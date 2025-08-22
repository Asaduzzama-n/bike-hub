import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero-section";
import BikeCard from "@/components/bike-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Shield, 
  FileCheck, 
  RefreshCw, 
  Star, 
  ArrowRight, 
  Phone, 
  Mail, 
  MapPin,
  CheckCircle,
  Award,
  Users
} from "lucide-react";
import Link from "next/link";

// Mock data - in real app this would come from API
const currentListings = [
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
  },
  {
    id: "4",
    brand: "TVS",
    model: "Apache RTR 160",
    year: 2019,
    cc: 160,
    price: 2400,
    mileage: 18000,
    images: ["/placeholder-bike.jpg"],
    location: "Sylhet",
    isVerified: true,
    freeWash: true,
  }
];

const recentlySold = [
  {
    id: "s1",
    brand: "Hero",
    model: "Splendor Plus",
    year: 2018,
    cc: 97,
    price: 1800,
    mileage: 35000,
    images: ["/placeholder-bike.jpg"],
    isSold: true,
    isVerified: true,
  },
  {
    id: "s2",
    brand: "TVS",
    model: "Apache RTR 160",
    year: 2019,
    cc: 160,
    price: 2400,
    mileage: 18000,
    images: ["/placeholder-bike.jpg"],
    isSold: true,
    isVerified: true,
  },
  
];

const reviews = [
  {
    id: 1,
    name: "Ahmed Rahman",
    rating: 5,
    text: "Excellent service! Got my bike with all verified papers. The team was very professional and helpful throughout the process.",
    date: "2024-01-15",
    avatar: "AR",
  },
  {
    id: 2,
    name: "Fatima Khan",
    rating: 5,
    text: "Bought a Honda CBR from them. Everything was transparent, and they even helped with the name change process. Highly recommended!",
    date: "2024-01-10",
    avatar: "FK",
  },
  {
    id: 3,
    name: "Mohammad Ali",
    rating: 4,
    text: "Good quality bikes with proper documentation. The verification process gave me confidence in my purchase.",
    date: "2024-01-05",
    avatar: "MA",
  },
  {
    id: 4,
    name: "Mohammad Ali",
    rating: 4,
    text: "Good quality bikes with proper documentation. The verification process gave me confidence in my purchase.",
    date: "2024-01-05",
    avatar: "MA",
  },
  {
    id: 5,
    name: "Mohammad Ali",
    rating: 4,
    text: "Good quality bikes with proper documentation. The verification process gave me confidence in my purchase.",
    date: "2024-01-05",
    avatar: "MA",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Current Listings Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Current Listings
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover our latest collection of verified second-hand bikes with complete documentation
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {currentListings.map((bike) => (
              <BikeCard key={bike.id} bike={bike} />
            ))}
          </div>
          
          <div className="text-center">
            <Button asChild size="lg">
              <Link href="/listings">
                View All Listings
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Verification Process Section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Our Verification Process
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We ensure every bike comes with verified papers and complete documentation for your peace of mind
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle>Paper Verification</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Complete verification of all bike documents including RC book, insurance, and pollution certificate
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                  <RefreshCw className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>Name Change Service</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We handle the complete name change process to ensure smooth ownership transfer
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 mx-auto bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4">
                  <FileCheck className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle>Paper Exchange Assurance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Guaranteed paper exchange with complete legal documentation and support
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Recently Sold Bikes */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Recently Sold Bikes
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See our successful sales and happy customers who found their perfect rides
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentlySold.map((bike) => (
              <BikeCard key={bike.id} bike={bike} />
            ))}
            
            {/* Success Stats Card */}
            <Card className="flex items-center justify-center">
              <CardContent className="text-center p-8">
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <Award className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">500+</h3>
                    <p className="text-muted-foreground">Happy Customers</p>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">100%</h3>
                    <p className="text-muted-foreground">Verified Papers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Contact Section for Sellers */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Want to Sell Your Bike?
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Get the best value for your bike with our transparent process and verified documentation service.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Free bike inspection and valuation</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Complete documentation support</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Quick and hassle-free process</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg">
                    <Link href="/sell">
                      Sell Your Bike
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg">
                    <Phone className="mr-2 h-4 w-4" />
                    Call Us: +880-123-456789
                  </Button>
                </div>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Emergency Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>+880-123-456789</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>contact@bikehub.com</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>123 Bike Street, Dhaka, Bangladesh</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
      
      {/* Reviews Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Read reviews from our satisfied customers who found their perfect bikes
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <Avatar>
                      <AvatarFallback>{review.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{review.name}</h4>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">{review.text}</p>
                  <p className="text-sm text-muted-foreground">{review.date}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              Load More Reviews
            </Button>
          </div>
        </div>
      </section>
      

    </div>
  );
}
