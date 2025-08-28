import { z } from 'zod';

// Partner creation validation schema
export const createPartnerSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
    email: z.string().email('Invalid email format'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone number must be less than 15 digits'),
    nid: z.string().optional(),
    address: z.string().optional(),
    totalInvestment: z.number().min(0, 'Total investment must be positive').optional(),
    profitSharePercentage: z.number().min(0).max(100, 'Profit share must be between 0 and 100').optional(),
    status: z.enum(['active', 'inactive', 'suspended']).optional().default('active'),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
  cookies: z.object({}).optional(),
});

// Partner update validation schema
export const updatePartnerSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters').optional(),
    email: z.string().email('Invalid email format').optional(),
    phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone number must be less than 15 digits').optional(),
    nid: z.string().optional(),
    address: z.string().optional(),
    status: z.enum(['active', 'inactive', 'suspended']).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1, 'Partner ID is required'),
  }),
  cookies: z.object({}).optional(),
});

// Partner query validation schema
export const getPartnerSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    page: z.string().transform(val => parseInt(val)).pipe(z.number().min(1)).optional(),
    limit: z.string().transform(val => parseInt(val)).pipe(z.number().min(1).max(100)).optional(),
    status: z.enum(['active', 'inactive', 'suspended']).optional(),
    search: z.string().optional(),
  }),
  params: z.object({}).optional(),
  cookies: z.object({}).optional(),
});

// Partner investment validation schema
export const partnerInvestmentSchema = z.object({
  body: z.object({
    partnerId: z.string().min(1, 'Partner ID is required'),
    bikeId: z.string().min(1, 'Bike ID is required'),
    investmentAmount: z.number().min(1, 'Investment amount must be greater than 0'),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
  cookies: z.object({}).optional(),
});