import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Bike } from '@/lib/models';
import { withValidation } from '@/lib/middleware';
import { z } from 'zod';

const getBikesSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(12),
    brand: z.string().optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    condition: z.string().optional(),
    minYear: z.coerce.number().optional(),
    maxYear: z.coerce.number().optional(),
    search: z.string().optional(),
    sortBy: z.string().default('createdAt'),
    sortOrder: z.string().default('desc'),
    status: z.string().optional()
  }),
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  cookies: z.object({}).optional()
});

// GET /api/bikes - Get all available bikes (public)
export const GET = withValidation(
  getBikesSchema,
  async (request: NextRequest, validatedData: any) => {
    try {
      await connectToDatabase();
      
      const { 
        page = 1, 
        limit = 12, 
        brand, 
        minPrice, 
        maxPrice, 
        condition, 
        minYear, 
        maxYear, 
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        status
      } = validatedData.query || {};
      
      const skip = (page - 1) * limit;
      
      // Build filter object
      const filter: any = {};
      
      // Use status parameter for filtering, default to 'available' if not specified
      if (status) {
        filter.status = status;
      } else {
        filter.status = 'available';
      }
      
      if (brand) {
        // Handle multiple brands separated by comma
        const brands = brand.split(',').map((b: string) => b.trim());
        filter.brand = { $in: brands };
      }
      
      if (minPrice !== undefined || maxPrice !== undefined) {
        filter.sellPrice = {};
        if (minPrice !== undefined) filter.sellPrice.$gte = minPrice;
        if (maxPrice !== undefined) filter.sellPrice.$lte = maxPrice;
      }
      
      if (condition) {
        filter.condition = condition;
      }
      
      if (minYear !== undefined || maxYear !== undefined) {
        filter.year = {};
        if (minYear !== undefined) filter.year.$gte = minYear;
        if (maxYear !== undefined) filter.year.$lte = maxYear;
      }
      
      if (search) {
        filter.$or = [
          { brand: { $regex: search, $options: 'i' } },
          { model: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      
      // Build sort object
      const sort: any = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
      
      // Get bikes with pagination
      const [bikes, total] = await Promise.all([
        Bike.find(filter)
          .select('-buyerInfo -partnerInvestments -repairs') // Exclude sensitive data
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        Bike.countDocuments(filter)
      ]);
      
      const totalPages = Math.ceil(total / limit);
      
      return NextResponse.json({
        success: true,
        data: {
          bikes,
          pagination: {
            currentPage: page,
            totalPages,
            totalItems: total,
            itemsPerPage: limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        }
      });
    } catch (error) {
      console.error('Error fetching bikes:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch bikes' },
        { status: 500 }
      );
    }
  }
);