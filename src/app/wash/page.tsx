"use client";

import { useState } from "react";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Droplets, 
  Clock, 
  MapPin, 
  Phone, 
  Star, 
  CheckCircle, 
  Sparkles, 
  Shield, 
  Zap,
  Calendar,
  Users,
  Award,
  ThumbsUp,
  Mail,
  MessageCircle
} from "lucide-react";

const packages = [
  {
    id: "basic",
    name: "Basic Wash",
    price: 150,
    duration: "30 mins",
    popular: false,
    features: [
      "Exterior body wash",
      "Wheel cleaning",
      "Basic drying",
      "Chain cleaning"
    ],
    description: "Perfect for regular maintenance and keeping your bike clean"
  },
  {
    id: "premium",
    name: "Premium Wash",
    price: 250,
    duration: "45 mins",
    popular: true,
    features: [
      "Complete exterior wash",
      "Wheel & tire detailing",
      "Chain cleaning & lubrication",
      "Dashboard cleaning",
      "Seat cleaning",
      "Basic wax application"
    ],
    description: "Comprehensive cleaning with protective wax coating"
  },
  {
    id: "deluxe",
    name: "Deluxe Detailing",
    price: 400,
    duration: "90 mins",
    popular: false,
    features: [
      "Premium exterior wash",
      "Complete wheel detailing",
      "Chain service & lubrication",
      "Interior deep cleaning",
      "Premium wax & polish",
      "Chrome polishing",
      "Engine bay cleaning",
      "Free minor touch-ups"
    ],
    description: "Complete detailing service for showroom-like finish"
  }
];

const locations = [
  {
    name: "Dhanmondi Branch",
    address: "House 15, Road 7, Dhanmondi, Dhaka 1205",
    phone: "+880 1712-345678",
    hours: "9:00 AM - 8:00 PM",
    rating: 4.8,
    reviews: 156,
    services: ["All Packages", "Express Service", "Pickup & Drop"]
  }
];

const features = [
  {
    icon: Droplets,
    title: "Eco-Friendly Products",
    description: "We use biodegradable cleaning products that are safe for your bike and the environment"
  },
  {
    icon: Users,
    title: "Expert Technicians",
    description: "Our trained professionals know how to handle different bike models with care"
  },
  {
    icon: Clock,
    title: "Quick Service",
    description: "Most services completed within 30-90 minutes depending on the package"
  },
  {
    icon: Shield,
    title: "Damage Protection",
    description: "Full insurance coverage for any accidental damage during service"
  }
];



export default function WashPage() {

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-slate-900 dark:to-slate-800 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Professional Bike Wash
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Keep your bike looking pristine with our professional washing and detailing services. 
              Eco-friendly products, expert care, and convenient locations.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Droplets className="w-4 h-4 mr-2" />
                Eco-Friendly
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Clock className="w-4 h-4 mr-2" />
                Quick Service
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Award className="w-4 h-4 mr-2" />
                Expert Care
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why Choose Our Service?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Professional bike care with attention to detail
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                      <IconComponent className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Wash Packages
            </h2>
            <p className="text-lg text-muted-foreground">
              Choose the perfect package for your bike's needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {packages.map((pkg) => (
              <Card 
                key={pkg.id} 
                className={`relative hover:shadow-lg transition-shadow ${
                  pkg.popular ? "ring-2 ring-primary" : ""
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                  <div className="text-3xl font-bold text-primary mt-2">
                    ৳{pkg.price}
                  </div>
                  <div className="text-muted-foreground flex items-center justify-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{pkg.duration}</span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-sm text-center">
                    {pkg.description}
                  </p>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Includes:</h4>
                    <ul className="space-y-1">
                      {pkg.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mt-6">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-lg font-semibold text-primary">৳{pkg.price}</p>
                      <p className="text-sm text-muted-foreground">Contact us for booking</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Locations Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Our Locations
            </h2>
            <p className="text-lg text-muted-foreground">
              Visit our convenient location in Dhaka
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Location Info */}
              <div className="flex justify-center">
                <Card className="hover:shadow-lg transition-shadow w-full max-w-md">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{locations[0].name}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{locations[0].rating}</span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                      <span className="text-sm">{locations[0].address}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{locations[0].phone}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{locations[0].hours}</span>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      {locations[0].reviews} reviews
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">Available Services:</h4>
                      <div className="flex flex-wrap gap-1">
                        {locations[0].services.map((service, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Contact us for booking</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Map */}
              <div className="flex justify-center">
                <div className="w-full max-w-md">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-center">Find Us Here</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-square w-full rounded-lg overflow-hidden">
                        <iframe
                          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.9064094312896!2d90.37594731498!3d23.750895894586!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755bf4a5c5b8c5b%3A0x5c5b8c5b8c5b8c5b!2sDhanmondi%2C%20Dhaka!5e0!3m2!1sen!2sbd!4v1635000000000!5m2!1sen!2sbd"
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title="BikeHub Wash Location"
                        ></iframe>
                      </div>
                      <div className="mt-4 text-center">
                        <Button variant="outline" className="w-full">
                          <MapPin className="w-4 h-4 mr-2" />
                          Get Directions
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* CTA Section */}
      {/* <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Give Your Bike a Fresh Look?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Book your wash service today and experience the difference
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Contact Us
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                <Phone className="w-5 h-5 mr-2" />
                Call Us
              </Button>
            </div>
          </div>
        </div>
      </section> */}


    </div>
  );
}