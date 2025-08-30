"use client";

import { Badge } from "@/components/ui/badge";
import { Calendar, Gauge, MapPin, Eye, Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Card } from "./ui/card";
import bikeImage from '../../public/bike.jpg'
import { BikeData } from '@/lib/api';
import { IBike } from "@/lib/models";

interface BikeCardProps {
  bike: BikeData;
  variant?: "default" | "compact";
}

export default function BikeCard({ bike, variant = "default" }: BikeCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Get the actual price (sellPrice for API data, price for mock data)
  const actualPrice = bike.sellPrice;
  
  // Check if bike is sold (status === 'sold' for API data, isSold for mock data)
  const isSold = bike.status === 'sold';
  

  const bikeId =bike._id;

  const formatMileage = (mileage: number) => {
    return `${mileage.toLocaleString()} miles`;
  };

  return (
    <div className={`group bg-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border border-gray-200 ${isSold ? 'opacity-75' : ''}`}>
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {/* Main Image */}
        <div className="relative w-full h-full bg-slate-100 dark:bg-slate-800">
          {bike.images && bike.images.length > 0 ? (
            <Image
              src={  bikeImage}
              alt={`${bike.brand} ${bike.model}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="text-sm text-muted-foreground">No Image</p>
              </div>
            </div>
          )}
        </div>

        {/* Image Navigation Dots */}
        {bike.images && bike.images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {bike.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col space-y-1">
          {isSold && (
            <Badge variant="destructive" className="text-xs">
              SOLD
            </Badge>
          )}
          {bike.freeWash && (
            <Badge variant="outline" className="text-xs bg-primary/40 text-white border-primary">
              Free Wash
            </Badge>
          )}
        </div>

        {/* Like Button */}
        {/* <button
          onClick={() => setIsLiked(!isLiked)}
          className="absolute top-2 right-2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-colors"
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} />
        </button> */}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="space-y-4">
          {/* Title and Price */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-lg leading-tight text-gray-900">
                {bike.brand} {bike.model}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {bike.year} • {bike.cc}cc
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">
                {formatPrice(actualPrice)}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Gauge className="w-4 h-4" />
              <span>{formatMileage(bike.mileage)}</span>
            </div>
            {/* {bike. && (
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{bike.location}</span>
              </div>
            )} */}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 pb-5">
        <Link 
          href={`/listings/${bikeId}`}
          className="w-full bg-primary hover:bg-primary/95 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <Eye className="w-4 h-4" />
          <span>View Details</span>
        </Link>
      </div>
    </div>
  );
}

// Compact variant for smaller spaces
export function CompactBikeCard({ bike }: { bike: BikeCardProps['bike'] }) {
  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-md">
      <div className="flex">
        {/* Image */}
        <div className="relative w-24 h-24 flex-shrink-0">
          {bike.images && bike.images.length > 0 ? (
            <Image
              src={bike.images[0] || '/placeholder-bike.jpg'}
              alt={`${bike.brand} ${bike.model}`}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          )}
          {bike.status === 'sold' && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive" className="text-xs">
                SOLD
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-3">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium text-sm leading-tight">
                {bike.brand} {bike.model}
              </h4>
              <p className="text-xs text-muted-foreground">
                {bike.year} • {bike.cc}cc
              </p>
            </div>
            <p className="text-sm font-bold text-primary">
              {new Intl.NumberFormat('en-BD', {
                style: 'currency',
                currency: 'BDT',
                minimumFractionDigits: 0,
              }).format(bike.sellPrice)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}