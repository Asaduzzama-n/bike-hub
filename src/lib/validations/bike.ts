import { z } from 'zod';

// Base bike validation schema
export const bikeBaseSchema = z.object({
    brand: z.string().min(1, 'Brand is required').trim(),
    model: z.string().min(1, 'Model is required').trim(),
    year: z.number().min(1990, 'Year must be 1990 or later').max(new Date().getFullYear() + 1, 'Year cannot be in the future'),
    cc: z.number().min(50, 'CC must be at least 50'),
    mileage: z.number().min(0, 'Mileage cannot be negative'),
    buyPrice: z.number().min(0, 'Buy price cannot be negative'),
    sellPrice: z.number().min(0, 'Sell price cannot be negative'),
    description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
    images: z.array(z.string().url({ message: 'Invalid image URL' })).optional(),
    condition: z.enum(['excellent', 'good', 'fair', 'poor'], {
        message: 'Condition must be excellent, good, fair, or poor'
    }),
    freeWash: z.boolean().default(false),
    documents: z.array(z.object({
        type: z.string().min(1, 'Document type is required'),
        url: z.string().url({ message: 'Invalid document URL' })
    })).optional()
});

// Create bike schema
export const createBikeSchema = z.object({
    body: bikeBaseSchema,
    query: z.object({}).optional(),
    params: z.object({}).optional()
});

// Update bike schema (all fields optional)
export const updateBikeSchema = z.object({
    body: bikeBaseSchema.partial().extend({
        status: z.enum(['available', 'sold', 'reserved', 'maintenance']).optional(),
        buyerInfo: z.object({
            name: z.string().trim().optional(),
            phone: z.string().trim().optional(),
            email: z.string().email({ message: 'Invalid email format' }).optional(),
            nid: z.string().trim().optional()
        }).optional(),
        soldDate: z.string().datetime({ message: 'Invalid date format' }).optional()
    }),
    params: z.object({
        id: z.string().min(1, 'Bike ID is required').regex(/^[0-9a-fA-F]{24}$/, 'Invalid bike ID format')
    }),
    query: z.object({}).optional()
});

// Get bikes schema (public)
export const getBikesSchema = z.object({
    query: z.object({
        page: z.coerce.number().min(1).default(1).optional(),
        limit: z.coerce.number().min(1).max(50).default(12).optional(),
        brand: z.string().optional(),
        minPrice: z.coerce.number().min(0).optional(),
        maxPrice: z.coerce.number().min(0).optional(),
        condition: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
        minYear: z.coerce.number().min(1990).optional(),
        maxYear: z.coerce.number().max(new Date().getFullYear() + 1).optional(),
        search: z.string().optional(),
        sortBy: z.enum(['sellPrice', 'year', 'mileage', 'createdAt']).default('createdAt').optional(),
        sortOrder: z.enum(['asc', 'desc']).default('desc').optional()
    }).optional(),
    body: z.object({}).optional(),
    params: z.object({}).optional()
});

// Get bikes schema (admin)
export const getAdminBikesSchema = z.object({
    query: z.object({
        page: z.coerce.number().min(1).default(1).optional(),
        limit: z.coerce.number().min(1).max(100).default(20).optional(),
        status: z.enum(['available', 'sold', 'reserved', 'maintenance']).optional(),
        search: z.string().optional(),
        sortBy: z.enum(['sellPrice', 'buyPrice', 'year', 'mileage', 'createdAt', 'profit']).default('createdAt').optional(),
        sortOrder: z.enum(['asc', 'desc']).default('desc').optional()
    }).optional(),
    body: z.object({}).optional(),
    params: z.object({}).optional()
});

// Get single bike schema
export const getBikeSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Bike ID is required').regex(/^[0-9a-fA-F]{24}$/, 'Invalid bike ID format')
    }),
    query: z.object({}).optional(),
    body: z.object({}).optional()
});