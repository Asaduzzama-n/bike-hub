"use client";

import { useEffect, useState } from "react";
import ReviewCard from "./review-card";
import { IReview } from "@/lib/models/Review";

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/admin/reviews');
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.data?.reviews || data.data);
      } else {
        setError(data.message || 'Failed to fetch reviews');
      }
    } catch (err) {
      setError('Failed to fetch reviews');
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-orange-50/80 via-orange-100/60 to-orange-50/80 dark:from-orange-950/30 dark:via-orange-900/20 dark:to-orange-950/30 backdrop-blur-sm border-t border-orange-200/50 dark:border-orange-800/30 py-6">
        <div className="flex items-center justify-center">
          <div className="text-sm text-muted-foreground">Loading reviews...</div>
        </div>
      </div>
    );
  }

  if (error || reviews.length === 0) {
    return (
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-orange-50/80 via-orange-100/60 to-orange-50/80 dark:from-orange-950/30 dark:via-orange-900/20 dark:to-orange-950/30 backdrop-blur-sm border-t border-orange-200/50 dark:border-orange-800/30 py-6">
        <div className="flex items-center justify-center">
          <div className="text-sm text-muted-foreground">
            {error || 'No reviews available'}
          </div>
        </div>
      </div>
    );
  }

  // Duplicate reviews for seamless infinite scroll
  const duplicatedReviews = [...reviews, ...reviews];

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-orange-50/80 via-orange-100/60 to-orange-50/80 dark:from-orange-950/30 dark:via-orange-900/20 dark:to-orange-950/30 backdrop-blur-sm border-t border-orange-200/50 dark:border-orange-800/30 py-6 overflow-hidden">
      <div className="flex animate-scroll-infinite space-x-8">
        {duplicatedReviews.map((review, index) => (
          <ReviewCard
            key={`${review._id}-${index}`}
            review={review}
          />
        ))}
      </div>
    </div>
  );
}