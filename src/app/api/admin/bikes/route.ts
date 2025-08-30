import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Bike } from '@/lib/models';
import { withValidation } from '@/lib/middleware';
import { withAdminAuth, AdminAuthRequest } from '@/lib/middleware/adminAuth';
import { getAdminBikesSchema, createBikeSchema } from '@/lib/validations/bike';

// GET /api/admin/bikes - Get all bikes (admin only)
export const GET = withAdminAuth(
  withValidation(
    getAdminBikesSchema,
    async (request: AdminAuthRequest, validatedData: any) => {
      try {
        await connectToDatabase();
        
        const { 
          page = 1, 
          limit = 20, 
          status, 
          search,
          sortBy = 'createdAt',
          sortOrder = 'desc'
        } = validatedData.query || {};
        
        const skip = (page - 1) * limit;
        
        // Build filter
        const filter: any = {};
        
        if (status) {
          filter.status = status;
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
  )
);

// POST /api/admin/bikes - Create new bike (admin only)
export const POST = withAdminAuth(
  withValidation(
    createBikeSchema,
    async (request: AdminAuthRequest, validatedData: any) => {
      try {
        await connectToDatabase();
        const bikeData = validatedData.body;
        
        // Create new bike
        const newBike = new Bike({
          ...bikeData,
          listedDate: new Date()
        });
        
        const savedBike = await newBike.save();
        
        return NextResponse.json({
          success: true,
          message: 'Bike created successfully',
          data: savedBike
        }, { status: 201 });
      } catch (error) {
        console.error('Error creating bike:', error);
        
        if (error instanceof Error && error.name === 'ValidationError') {
          return NextResponse.json(
            { success: false, message: 'Validation error', error: error.message },
            { status: 400 }
          );
        }
        
        return NextResponse.json(
          { success: false, message: 'Failed to create bike' },
          { status: 500 }
        );
      }
    }
  )
);