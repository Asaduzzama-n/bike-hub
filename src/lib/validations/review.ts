import { z } from 'zod';

// Review creation validation schema
export const createReviewSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
    rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
    description: z.string().min(1, 'Description is required').max(1000, 'Description must be less than 1000 characters'),
    image: z.string().url('Invalid image URL').min(1, 'Image is required'),
    isActive: z.boolean().optional().default(true),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
  cookies: z.object({}).optional(),
});

// Review update validation schema
export const updateReviewSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters').optional(),
    rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5').optional(),
    description: z.string().min(1, 'Description is required').max(1000, 'Description must be less than 1000 characters').optional(),
    image: z.string().url('Invalid image URL').optional(),
    isActive: z.boolean().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1, 'Review ID is required'),
  }),
  cookies: z.object({}).optional(),
});

// Review query validation schema
export const getReviewSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    page: z.string().transform(val => parseInt(val)).pipe(z.number().min(1)).optional(),
    limit: z.string().transform(val => parseInt(val)).pipe(z.number().min(1).max(100)).optional(),
    isActive: z.string().transform(val => val === 'true').pipe(z.boolean()).optional(),
    search: z.string().optional(),
    rating: z.string().transform(val => parseInt(val)).pipe(z.number().min(1).max(5)).optional(),
  }),
  params: z.object({}).optional(),
  cookies: z.object({}).optional(),
});

// Single review validation schema
export const getSingleReviewSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1, 'Review ID is required'),
  }),
  cookies: z.object({}).optional(),
});