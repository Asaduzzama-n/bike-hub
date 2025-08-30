import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Bike } from '@/lib/models';
import { withValidation } from '@/lib/middleware';
import { withAdminAuth, AdminAuthRequest } from '@/lib/middleware/adminAuth';
import { getBikeSchema, updateBikeSchema } from '@/lib/validations/bike';
import { ObjectId } from 'mongodb';

// GET /api/admin/bikes/[id] - Get single bike (admin only)
export const GET = withAdminAuth(
  withValidation(
    getBikeSchema,
    async (request: AdminAuthRequest, validatedData: any) => {
      try {
        await connectToDatabase();
        
        const { id } = validatedData.params;
        
        const bike = await Bike.findById(id).lean();
        
        if (!bike) {
          return NextResponse.json(
            { success: false, message: 'Bike not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          data: { bike }
        });
      } catch (error) {
        console.error('Error fetching bike:', error);
        return NextResponse.json(
          { success: false, message: 'Failed to fetch bike' },
          { status: 500 }
        );
      }
    }
  )
);

// PUT /api/admin/bikes/[id] - Update bike (admin only)
export const PUT = withAdminAuth(
  withValidation(
    updateBikeSchema,
    async (request: AdminAuthRequest, validatedData: any) => {
      try {
        await connectToDatabase();
        
        const { id } = validatedData.params;
        const updateData = validatedData.body;
        
        // Convert soldDate string to Date if provided
        if (updateData.soldDate) {
          updateData.soldDate = new Date(updateData.soldDate);
        }
        
        const updatedBike = await Bike.findByIdAndUpdate(
          id,
          { ...updateData, updatedAt: new Date() },
          { new: true, runValidators: true }
        );
        
        if (!updatedBike) {
          return NextResponse.json(
            { success: false, message: 'Bike not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          message: 'Bike updated successfully',
          data: updatedBike
        });
      } catch (error) {
        console.error('Error updating bike:', error);
        
        if (error instanceof Error && error.name === 'ValidationError') {
          return NextResponse.json(
            { success: false, message: 'Validation error', error: error.message },
            { status: 400 }
          );
        }
        
        return NextResponse.json(
          { success: false, message: 'Failed to update bike' },
          { status: 500 }
        );
      }
    }
  )
);

// DELETE /api/admin/bikes/[id] - Delete bike (admin only)
export const DELETE = withAdminAuth(
  withValidation(
    getBikeSchema,
    async (request: AdminAuthRequest, validatedData: any) => {
      try {
        await connectToDatabase();
        
        const { id } = validatedData.params;
        
        const deletedBike = await Bike.findByIdAndDelete(id);
        
        if (!deletedBike) {
          return NextResponse.json(
            { success: false, message: 'Bike not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          message: 'Bike deleted successfully'
        });
      } catch (error) {
        console.error('Error deleting bike:', error);
        return NextResponse.json(
          { success: false, message: 'Failed to delete bike' },
          { status: 500 }
        );
      }
    }
  )
);