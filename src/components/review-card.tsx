"use client";

import { Star } from "lucide-react";
import Image from "next/image";
import { IReview } from "@/lib/models/Review";

interface ReviewCardProps {
  review: IReview;
  className?: string;
}

export default function ReviewCard({ review, className = "" }: ReviewCardProps) {
  return (
    <div className={`flex-shrink-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-orange-200/30 dark:border-orange-800/30 w-80 ${className}`}>
      {/* Review Image */}
      <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
        <Image
          src={review.image}
          alt={`Review by ${review.name}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
      
      {/* Reviewer Info */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg text-foreground">{review.name}</h3>
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < review.rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300 dark:text-gray-600"
                }`}
              />
            ))}
          </div>
        </div>
        
        {/* Review Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          "{review.description}"
        </p>
      </div>
    </div>
  );
}