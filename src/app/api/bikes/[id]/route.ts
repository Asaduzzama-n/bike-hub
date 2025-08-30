import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Bike } from '@/lib/models';
import { withValidation } from '@/lib/middleware';
import { getBikeSchema } from '@/lib/validations/bike';
import { ObjectId } from 'mongodb';

// GET /api/bikes/[id] - Get single bike (public)
export const GET = withValidation(
  getBikeSchema,
  async (request: NextRequest, validatedData: any) => {
    try {
      await connectToDatabase();
      
      const { id } = validatedData.params;
      
      // Find bike by ID, only if available
      const bike = await Bike.findOne({ 
        _id: id, 
        status: 'available' 
      })
      .select('-buyerInfo -partnerInvestments -repairs') // Exclude sensitive data
      .lean();
      
      if (!bike) {
        return NextResponse.json(
          { success: false, message: 'Bike not found or not available' },
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
);