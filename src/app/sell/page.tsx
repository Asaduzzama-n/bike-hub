"use client";

import { useState } from "react";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Upload, 
  FileText, 
  Camera, 
  CheckCircle, 
  DollarSign, 
  Clock, 
  Shield, 
  Users, 
  TrendingUp,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  Star,
  Zap
} from "lucide-react";

const benefits = [
  {
    icon: DollarSign,
    title: "Fair Market Price",
    description: "We offer competitive market rates based on your bike's condition"
  },
  {
    icon: Clock,
    title: "Quick Process",
    description: "Complete evaluation and purchase within 24-48 hours"
  },
  {
    icon: Shield,
    title: "Direct Purchase",
    description: "We buy your bike directly - no waiting for buyers or negotiations"
  },
  {
    icon: Users,
    title: "Instant Payment",
    description: "Get paid immediately upon bike inspection and paperwork completion"
  }
];

const process = [
  {
    step: "1",
    title: "Submit Details",
    description: "Fill out the form with your bike information and upload photos",
    icon: FileText
  },
  {
    step: "2",
    title: "Bike Evaluation",
    description: "Our team evaluates your bike's condition and market value",
    icon: Shield
  },
  {
    step: "3",
    title: "Price Negotiation",
    description: "We contact you with our best offer for your motorcycle",
    icon: DollarSign
  },
  {
    step: "4",
    title: "Complete Sale",
    description: "Finalize paperwork and receive immediate payment",
    icon: CheckCircle
  }
];

const requirements = [
  "Valid registration certificate (original)",
  "Tax token (up to date)",
  "Insurance papers (if applicable)",
  "National ID of owner",
  "Clear photos of the bike (minimum 5)",
  "Service history (if available)"
];

const tips = [
  {
    icon: Camera,
    title: "Take Clear Photos",
    description: "High-quality photos from multiple angles help us evaluate your bike accurately"
  },
  {
    icon: FileText,
    title: "Provide Complete Details",
    description: "Detailed information and maintenance history helps us offer the best price"
  },
  {
    icon: DollarSign,
    title: "Fair Market Value",
    description: "We research current market prices to offer you a competitive rate"
  },
  {
    icon: Zap,
    title: "Quick Evaluation",
    description: "Our team evaluates your bike within 24-48 hours of submission"
  }
 ];

export default function SellPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    location: "",
    brand: "",
    model: "",
    year: "",
    cc: "",
    mileage: "",
    price: "",
    description: "",
    condition: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Thank You!</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Your bike sale request has been submitted successfully. Our team will review 
              your submission and contact you within 24 hours with our evaluation and offer.
            </p>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                What happens next:
              </p>
              <div className="text-left space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Bike evaluation and price assessment (1-2 business days)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">We contact you with our best offer</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Complete sale and receive immediate payment</span>
                </div>
              </div>
            </div>
            <Button className="mt-8" onClick={() => window.location.href = '/'}>
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-slate-900 dark:to-slate-800 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Sell Your Bike to BikeHub
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Skip the hassle of finding buyers. We purchase your motorcycle directly at fair market value.
              Quick evaluation, instant payment, and we handle all the paperwork.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Star className="w-4 h-4 mr-2" />
                4.9/5 Seller Rating
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Clock className="w-4 h-4 mr-2" />
                Avg 10 Days to Sell
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Shield className="w-4 h-4 mr-2" />
                100% Verified
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why Sell to BikeHub?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We buy your motorcycle directly - no hassle, instant payment
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                      <IconComponent className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-3">{benefit.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Simple 4-step process to sell your bike directly to BikeHub
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 mx-auto bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                  1
                </div>
                <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-slate-200 dark:bg-slate-700 -translate-x-8" />
              </div>
              <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Submit Details</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Fill out our form with your bike details and upload photos
              </p>
            </div>
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 mx-auto bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                  2
                </div>
                <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-slate-200 dark:bg-slate-700 -translate-x-8" />
              </div>
              <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Get Quote</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Receive our competitive offer based on market evaluation
              </p>
            </div>
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 mx-auto bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                  3
                </div>
                <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-slate-200 dark:bg-slate-700 -translate-x-8" />
              </div>
              <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Inspection</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Our expert team inspects your bike and verifies documents
              </p>
            </div>
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 mx-auto bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                  4
                </div>
              </div>
              <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Get Paid</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Receive instant payment and we handle all paperwork
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Sell Your Bike to Us
              </h2>
              <p className="text-lg text-muted-foreground">
                Submit your bike details and we'll provide you with a fair market offer
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Submit Your Bike Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Personal Information */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Full Name *</label>
                            <Input
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              placeholder="Enter your full name"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Phone Number *</label>
                            <Input
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              placeholder="01712-345678"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Email Address</label>
                            <Input
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              placeholder="your@email.com"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Location *</label>
                            <Input
                              name="location"
                              value={formData.location}
                              onChange={handleInputChange}
                              placeholder="City, Area"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Bike Information */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Bike Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Brand *</label>
                            <Input
                              name="brand"
                              value={formData.brand}
                              onChange={handleInputChange}
                              placeholder="Honda, Yamaha, Bajaj..."
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Model *</label>
                            <Input
                              name="model"
                              value={formData.model}
                              onChange={handleInputChange}
                              placeholder="CBR 150R, FZ-S..."
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Year *</label>
                            <Input
                              name="year"
                              type="number"
                              value={formData.year}
                              onChange={handleInputChange}
                              placeholder="2020"
                              min="2000"
                              max="2024"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Engine CC *</label>
                            <Input
                              name="cc"
                              type="number"
                              value={formData.cc}
                              onChange={handleInputChange}
                              placeholder="150"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Mileage (KM) *</label>
                            <Input
                              name="mileage"
                              type="number"
                              value={formData.mileage}
                              onChange={handleInputChange}
                              placeholder="15000"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Asking Price ($) *</label>
                            <Input
                              name="price"
                              type="number"
                              value={formData.price}
                              onChange={handleInputChange}
                              placeholder="2500"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Condition *</label>
                        <select
                          name="condition"
                          value={formData.condition}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-input rounded-md bg-background"
                          required
                        >
                          <option value="">Select condition</option>
                          <option value="excellent">Excellent</option>
                          <option value="good">Good</option>
                          <option value="fair">Fair</option>
                          <option value="needs-work">Needs Work</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Description *</label>
                        <Textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Describe your bike's condition, maintenance history, any modifications, etc."
                          rows={4}
                          required
                        />
                      </div>

                      <Separator />

                      {/* Photo Upload */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Photos & Documents</h3>
                        <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center">
                          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                          <h4 className="text-lg font-medium mb-2">Upload Photos</h4>
                          <p className="text-muted-foreground mb-4">
                            Upload at least 5 clear photos of your bike from different angles
                          </p>
                          <Button type="button" variant="outline">
                            <Camera className="w-4 h-4 mr-2" />
                            Choose Photos
                          </Button>
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full" 
                        size="lg"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Submitting..." : "Submit for Evaluation"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Requirements */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Required Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Tips */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Evaluation Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {tips.map((tip, index) => {
                        const IconComponent = tip.icon;
                        return (
                          <div key={index} className="flex gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                              <IconComponent className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-medium text-sm">{tip.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {tip.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Contact */}
                <Card>
                  <CardHeader>
                    <CardTitle>Need Help?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>+880 1712-345678</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>sell@bikehub.bd</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>Dhanmondi, Dhaka</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}