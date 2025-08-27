import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
ReviewSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);

export default Review;

export interface IReview {
  _id?: string;
  name: string;
  rating: number;
  description: string;
  image: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}