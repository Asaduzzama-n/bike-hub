import { z } from 'zod';

// Base cost validation schema
export const costBaseSchema = z.object({
  description: z.string().min(1, 'Description is required').max(500, 'Description cannot exceed 500 characters').trim(),
  amount: z.number().min(0, 'Amount cannot be negative'),
  category: z.enum(['repair', 'maintenance', 'marketing', 'operational', 'fuel', 'insurance', 'other'], {
    errorMap: () => ({ message: 'Category must be repair, maintenance, marketing, operational, fuel, insurance, or other' })
  }),
  bikeId: z.string().optional()
});

// Create cost schema
export const createCostSchema = z.object({
  body: costBaseSchema,
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

// Update cost schema
export const updateCostSchema = z.object({
  body: costBaseSchema.partial(),
  params: z.object({
    id: z.string().min(1, 'Cost ID is required')
  }),
  query: z.object({}).optional()
});

// Get costs schema
export const getCostsSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1).optional(),
    limit: z.coerce.number().min(1).max(100).default(20).optional(),
    category: z.enum(['repair', 'maintenance', 'marketing', 'operational', 'fuel', 'insurance', 'other']).optional(),
    bikeId: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    sortBy: z.enum(['amount', 'createdAt', 'category']).default('createdAt').optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc').optional()
  }).optional(),
  body: z.object({}).optional(),
  params: z.object({}).optional()
});

// Get single cost schema
export const getCostSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Cost ID is required')
  }),
  query: z.object({}).optional(),
  body: z.object({}).optional()
});