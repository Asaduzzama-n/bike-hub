"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Shield, CheckCircle, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import  bike from '../../public/bike.jpg'
import { CountUp } from "./count-up";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-screen flex items-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
      
      <div className="relative container mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Content */}
          <div className="flex flex-col justify-center space-y-8">
            {/* Badge */}
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="px-3 py-1">
                <Shield className="mr-1 h-3 w-3" />
                Verified Papers Guaranteed
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                <Star className="mr-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
                Trusted Platform
              </Badge>
            </div>

            {/* Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Reliable Second-Hand Bikes with{" "}
                <span className="text-primary">Verified Papers</span>
              </h1>
              <p className="text-lg text-muted-foreground sm:text-xl">
                Find your perfect ride with complete documentation, paper verification, 
                and name change services. Quality bikes, transparent process, guaranteed satisfaction.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">Document Verification</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">Name Change Service</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">Paper Exchange Assurance</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">Quality Inspection</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
              <Button asChild size="lg" className="text-base">
                <Link href="/listings">
                  Browse Listings
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link href="/sell">
                  Sell Your Bike
                </Link>
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  <CountUp to={500} suffix="+" />
                </div>
                <div className="text-sm text-muted-foreground">Bikes Sold</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  <CountUp to={100} suffix="%" />
                </div>
                <div className="text-sm text-muted-foreground">Verified Papers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  <CountUp to={4.9} decimals={1} suffix="★" />
                </div>
                <div className="text-sm text-muted-foreground">Customer Rating</div>
              </div>
            </div>

          </div>

          {/* Image */}
<div className="relative aspect-[4/3] rounded-2xl">
  {/* Inner wrapper just for image & gradient */}
  <div className="absolute inset-0 overflow-hidden rounded-2xl">
    <Image
      src={bike}
      alt="Premium Bike Collection"
      fill
      className="object-cover"
      priority
    />
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
  </div>

  {/* Centered overlay content */}
  {/* <div className="absolute inset-0 flex items-center justify-center z-10">
    <p className="text-lg text-muted-foreground bg-background/80 px-3 py-1 rounded-lg inline-block">
      Premium Bike Collection
    </p>
  </div> */}

  {/* Floating Cards (not clipped anymore) */}
  <div className="absolute -bottom-6 -left-6 z-20 bg-background border rounded-lg p-4 shadow-lg">
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
      </div>
      <div>
        <div className="text-sm font-medium">Verified</div>
        <div className="text-xs text-muted-foreground">All Documents</div>
      </div>
    </div>
  </div>

  <div className="absolute -top-6 -right-6 z-20 bg-background border rounded-lg p-4 shadow-lg">
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
        <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
      </div>
      <div>
        <div className="text-sm font-medium">Guaranteed</div>
        <div className="text-xs text-muted-foreground">Quality & Service</div>
      </div>
    </div>
  </div>
</div>


        </div>
      </div>
      
    </section>
  );
}