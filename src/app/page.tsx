


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
import ReviewsSection from "@/components/reviews-section";
import Footer from "@/components/footer";
import { publicApi, BikeData } from "@/lib/api";
import { IBike } from "@/lib/models";

// Data now comes from API



export default async function Home() {
  // Fetch current available bikes
  const currentListingsResponse = await publicApi.getBikes({
    limit: 4,
    page: 1,
  });

  // Fetch recently sold bikes
  const soldBikesResponse = await publicApi.getBikes({
    limit: 4,
    page: 1,
    status: 'sold'
  });

  const currentListings = currentListingsResponse.success ? currentListingsResponse.data?.bikes || [] : [];
  const recentlySold = soldBikesResponse.success ? soldBikesResponse.data?.bikes || [] : [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      
      {/* Current Listings Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Current Listings
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Browse our latest collection of verified bikes with complete documentation
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
             {currentListings.map((bike: BikeData) => (
               <BikeCard key={bike._id} bike={bike} />
             ))}
           </div>
          
          <div className="text-center">
            <Link href="/listings">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                View All Listings
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {recentlySold.map((bike: BikeData) => (
                <BikeCard key={bike._id} bike={bike} />
              ))}
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
        <ReviewsSection></ReviewsSection>
      </section>
      
      <Footer />
    </div>
  );
}
