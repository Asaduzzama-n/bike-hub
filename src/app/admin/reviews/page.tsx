"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Star, Eye, EyeOff } from "lucide-react";
import { IReview } from "@/lib/models/Review";
import { toast } from "sonner";
import Image from "next/image";

interface ReviewFormData {
  name: string;
  rating: number;
  description: string;
  image: string;
  isActive: boolean;
}

const initialFormData: ReviewFormData = {
  name: "",
  rating: 5,
  description: "",
  image: "",
  isActive: true,
};

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<IReview | null>(null);
  const [formData, setFormData] = useState<ReviewFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/reviews');
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.data);
      } else {
        toast.error(data.error || 'Failed to fetch reviews');
      }
    } catch (error) {
      toast.error('Failed to fetch reviews');
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingReview(null);
    setFormData(initialFormData);
    setIsSheetOpen(true);
  };

  const handleEdit = (review: IReview) => {
    setEditingReview(review);
    setFormData({
      name: review.name,
      rating: review.rating,
      description: review.description,
      image: review.image,
      isActive: review.isActive || true,
    });
    setIsSheetOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingReview ? `/api/reviews/${editingReview._id}` : '/api/reviews';
      const method = editingReview ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(editingReview ? 'Review updated successfully' : 'Review created successfully');
        setIsSheetOpen(false);
        fetchReviews();
      } else {
        toast.error(data.error || 'Failed to save review');
      }
    } catch (error) {
      toast.error('Failed to save review');
      console.error('Error saving review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Review deleted successfully');
        fetchReviews();
      } else {
        toast.error(data.error || 'Failed to delete review');
      }
    } catch (error) {
      toast.error('Failed to delete review');
      console.error('Error deleting review:', error);
    }
  };

  const toggleStatus = async (review: IReview) => {
    try {
      const response = await fetch(`/api/reviews/${review._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...review,
          isActive: !review.isActive,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Review ${!review.isActive ? 'activated' : 'deactivated'} successfully`);
        fetchReviews();
      } else {
        toast.error(data.error || 'Failed to update review status');
      }
    } catch (error) {
      toast.error('Failed to update review status');
      console.error('Error updating review status:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading reviews...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Reviews Management</h1>
          <p className="text-muted-foreground">Manage customer reviews and testimonials</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Review
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No reviews found. Create your first review!
                </TableCell>
              </TableRow>
            ) : (
              reviews.map((review) => (
                <TableRow key={review._id}>
                  <TableCell>
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                      <Image
                        src={review.image}
                        alt={review.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{review.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {review.description}
                  </TableCell>
                  <TableCell>
                    <Badge variant={review.isActive ? "default" : "secondary"}>
                      {review.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(review.createdAt!).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStatus(review)}
                      >
                        {review.isActive ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(review)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(review._id!)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Review Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-[500px]">
          <SheetHeader>
            <SheetTitle>
              {editingReview ? "Edit Review" : "Add New Review"}
            </SheetTitle>
            <SheetDescription>
              {editingReview
                ? "Update the review information below."
                : "Fill in the details to create a new review."}
            </SheetDescription>
          </SheetHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 py-4 px-6">
            <div className="space-y-2">
              <Label htmlFor="name">Reviewer Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter reviewer name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <select
                id="rating"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                className="w-full p-2 border border-input rounded-md bg-background"
                required
              >
                {[1, 2, 3, 4, 5].map((rating) => (
                  <option key={rating} value={rating}>
                    {rating} Star{rating !== 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="Enter image URL"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Review Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter review description"
                rows={4}
                required
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="isActive">Active (visible on website)</Label>
            </div>
          </form>
          
          <SheetFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsSheetOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Saving..." : editingReview ? "Update" : "Create"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}