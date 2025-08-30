"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReviewCard from "./review-card";
import { ReviewData } from "@/lib/api";

interface ReviewsClientProps {
  reviews: ReviewData[];
}

export default function ReviewsClient({ reviews }: ReviewsClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Responsive reviews per page
  const getReviewsPerPage = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 1280) return 3; // xl screens
      if (window.innerWidth >= 768) return 2;  // md screens
    }
    return 1; // sm screens and SSR
  };
  
  const [reviewsPerPage, setReviewsPerPage] = useState(getReviewsPerPage);
  
  useEffect(() => {
    const handleResize = () => {
      setReviewsPerPage(getReviewsPerPage());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  
  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };
  
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };
  
  // Calculate current reviews to display
  const startIndex = currentIndex * reviewsPerPage;
  const endIndex = startIndex + reviewsPerPage;
  const currentReviews = reviews.slice(startIndex, endIndex);

  if (reviews.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-lg text-muted-foreground">
          No reviews available
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
        {currentReviews.map((review) => (
          <ReviewCard
            key={review._id}
            review={review as any}
            className="h-full"
          />
        ))}
      </div>
      
      {/* Navigation */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-8">
          <Button
            variant="outline"
            size="lg"
            onClick={goToPrevious}
            className="group rounded-full border-2 border-orange-200 hover:border-orange-400 hover:bg-orange-50 dark:border-orange-800 dark:hover:border-orange-600 dark:hover:bg-orange-900/20 transition-all duration-300 px-6 py-3"
          >
            <ChevronLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            Previous
          </Button>
          
          {/* Page Indicators */}
          <div className="flex items-center space-x-3">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-orange-500 scale-125 shadow-lg shadow-orange-500/30"
                    : "bg-gray-300 dark:bg-gray-600 hover:bg-orange-300 dark:hover:bg-orange-700 hover:scale-110"
                }`}
              />
            ))}
            <span className="text-sm text-muted-foreground ml-4">
              {currentIndex + 1} of {totalPages}
            </span>
          </div>
          
          <Button
            variant="outline"
            size="lg"
            onClick={goToNext}
            className="group rounded-full border-2 border-orange-200 hover:border-orange-400 hover:bg-orange-50 dark:border-orange-800 dark:hover:border-orange-600 dark:hover:bg-orange-900/20 transition-all duration-300 px-6 py-3"
          >
            Next
            <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </div>
      )}
    </div>
  );
}