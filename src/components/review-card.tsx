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
    <div className={`group  backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-orange-200/40 dark:border-orange-800/40 hover:shadow-2xl hover:border-orange-300/60 dark:hover:border-orange-700/60 transition-all duration-300 hover:-translate-y-2 ${className}`}>
      {/* Review Image */}
      <div className="relative w-full h-52 mb-6 rounded-xl overflow-hidden group-hover:scale-105 transition-transform duration-300">
        <Image
          src={review.image}
          alt={`Review by ${review.name}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full p-2">
          <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
        </div>
      </div>
      
      {/* Reviewer Info */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-xl text-foreground mb-1">{review.name}</h3>
            <p className="text-sm text-muted-foreground font-medium">Verified Customer</p>
          </div>
          <div className="flex items-center space-x-1 bg-orange-50 dark:bg-orange-900/20 px-3 py-1 rounded-full">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < review.rating
                    ? "fill-orange-500 text-orange-500"
                    : "text-gray-300 dark:text-gray-600"
                }`}
              />
            ))}
            <span className="text-sm font-semibold text-orange-600 dark:text-orange-400 ml-2">
              {review.rating}.0
            </span>
          </div>
        </div>
        
        {/* Review Description */}
        <blockquote className="text-base text-muted-foreground leading-relaxed italic border-l-4 border-orange-200 dark:border-orange-800 pl-4">
          "{review.description}"
        </blockquote>
      </div>
    </div>
  );
}