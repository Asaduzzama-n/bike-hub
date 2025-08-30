import { z } from 'zod';

// Base transaction validation schema
export const transactionBaseSchema = z.object({
  type: z.enum(['sale', 'purchase', 'cost', 'partner_payout', 'refund'], {
    errorMap: () => ({ message: 'Type must be sale, purchase, cost, partner_payout, or refund' })
  }),
  amount: z.number().min(0, 'Amount cannot be negative'),
  profit: z.number().optional(),
  bikeId: z.string().optional(),
  partnerId: z.string().optional(),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  category: z.enum(['repair', 'maintenance', 'marketing', 'operational', 'other']).optional(),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'mobile_banking', 'card'], {
    errorMap: () => ({ message: 'Payment method must be cash, bank_transfer, mobile_banking, or card' })
  }),
  reference: z.string().max(100, 'Reference cannot exceed 100 characters').optional()
});

// Create transaction schema
export const createTransactionSchema = z.object({
  body: transactionBaseSchema,
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

// Update transaction schema
export const updateTransactionSchema = z.object({
  body: transactionBaseSchema.partial(),
  params: z.object({
    id: z.string().min(1, 'Transaction ID is required')
  }),
  query: z.object({}).optional()
});

// Get transactions schema
export const getTransactionsSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1).optional(),
    limit: z.coerce.number().min(1).max(100).default(20).optional(),
    type: z.enum(['sale', 'purchase', 'cost', 'partner_payout', 'refund']).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    sortBy: z.enum(['amount', 'createdAt', 'type']).default('createdAt').optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc').optional()
  }).optional(),
  body: z.object({}).optional(),
  params: z.object({}).optional()
});

// Get single transaction schema
export const getTransactionSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Transaction ID is required')
  }),
  query: z.object({}).optional(),
  body: z.object({}).optional()
});