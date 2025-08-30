import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Cost } from '@/lib/models';
import { withValidation } from '@/lib/middleware';
import { withAdminAuth, AdminAuthRequest } from '@/lib/middleware/adminAuth';
import { getCostsSchema, createCostSchema } from '@/lib/validations/cost';

// GET /api/admin/costs - Get all costs (admin only)
export const GET = withAdminAuth(
  withValidation(
    getCostsSchema,
    async (request: AdminAuthRequest, validatedData: any) => {
      try {
        await connectToDatabase();
        
        const { 
          page = 1, 
          limit = 20, 
          category, 
          bikeId,
          startDate, 
          endDate,
          sortBy = 'createdAt',
          sortOrder = 'desc'
        } = validatedData.query || {};
        
        const skip = (page - 1) * limit;
        
        // Build filter
        const filter: any = {};
        
        if (category) {
          filter.category = category;
        }
        
        if (bikeId) {
          filter.bikeId = bikeId;
        }
        
        if (startDate || endDate) {
          filter.createdAt = {};
          if (startDate) filter.createdAt.$gte = new Date(startDate);
          if (endDate) filter.createdAt.$lte = new Date(endDate);
        }
        
        // Build sort object
        const sort: any = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
        
        // Get costs with pagination
        const [costs, total] = await Promise.all([
          Cost.find(filter)
            .populate('bikeId', 'brand model year')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),
          Cost.countDocuments(filter)
        ]);
        
        const totalPages = Math.ceil(total / limit);
        
        return NextResponse.json({
          success: true,
          data: {
            costs,
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
        console.error('Error fetching costs:', error);
        return NextResponse.json(
          { success: false, message: 'Failed to fetch costs' },
          { status: 500 }
        );
      }
    }
  )
);

// POST /api/admin/costs - Create new cost (admin only)
export const POST = withAdminAuth(
  withValidation(
    createCostSchema,
    async (request: AdminAuthRequest, validatedData: any) => {
      try {
        await connectToDatabase();
        const costData = validatedData.body;
        
        // Create new cost
        const newCost = new Cost(costData);
        const savedCost = await newCost.save();
        
        return NextResponse.json({
          success: true,
          message: 'Cost created successfully',
          data: savedCost
        }, { status: 201 });
      } catch (error) {
        console.error('Error creating cost:', error);
        
        if (error instanceof Error && error.name === 'ValidationError') {
          return NextResponse.json(
            { success: false, message: 'Validation error', error: error.message },
            { status: 400 }
          );
        }
        
        return NextResponse.json(
          { success: false, message: 'Failed to create cost' },
          { status: 500 }
        );
      }
    }
  )
);