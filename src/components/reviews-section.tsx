import { Star } from "lucide-react";
import { publicApi, ReviewData } from "@/lib/api";
import ReviewsClient from "./reviews-client";



export default async function ReviewsSection() {
  // Fetch reviews data server-side
  let reviews: ReviewData[] = [];
  
  try {
    const response = await publicApi.getReviews({ limit: 20 });
    if (response.success && response.data?.reviews) {
      reviews = response.data.reviews;
    }
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    // Fallback to mock data if API fails
  }
  


  if (reviews.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center">
          <div className="text-lg text-muted-foreground">
            No reviews available
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br ">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full mb-6">
            <Star className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">
            Customer Stories
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover why thousands of bike enthusiasts trust BikeHub for their cycling journey
          </p>
        </div>
      
        {/* Client-side interactive component */}
        <ReviewsClient reviews={reviews} />
      </div>
    </section>
  );
}