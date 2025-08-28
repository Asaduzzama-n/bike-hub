import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Partner, Investment, Collections } from '@/lib/models';
import { withValidation } from '@/lib/middleware';
import { withAdminAuth, AdminAuthRequest } from '@/lib/middleware/adminAuth';
import { updatePartnerSchema } from '@/lib/validations/partner';
import { ObjectId } from 'mongodb';
import { z } from 'zod';

// Validation schema for partner ID parameter
const partnerIdSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1, 'Partner ID is required'),
  }),
  cookies: z.object({}).optional(),
});

// GET /api/admin/partners/[id] - Get single partner
export const GET = withAdminAuth(
  withValidation(
    partnerIdSchema,
    async (request: AdminAuthRequest, validatedData: any, { params }: { params: { id: string } }) => {
  try {
    await connectToDatabase();
    const partnerId = params.id;
    console.log(partnerId,"🤦‍♂️🤦‍♂️🤦‍♂️🤦‍♂️🤦‍♂️🤦‍♂️🤦‍♂️🤦‍♂️")
    if (!ObjectId.isValid(partnerId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid partner ID' },
        { status: 400 }
      );
    }
    
    const partner = await Partner.findById(partnerId).lean();
    
    if (!partner) {
      return NextResponse.json(
        { success: false, message: 'Partner not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: partner
    });
  } catch (error) {
    console.error('Error fetching partner:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch partner' },
      { status: 500 }
    );
  }
    }
  )
);

// PUT /api/admin/partners/[id] - Update partner with validation
export const PUT = withAdminAuth(
  withValidation(
    updatePartnerSchema,
    async (request: AdminAuthRequest, validatedData: any, { params }: { params: { id: string } }) => {
  try {
    await connectToDatabase();
    const partnerId = params.id;
    const updateData = validatedData.body;
    console.log(updateData,"🤦‍♂️🤦‍♂️🤦‍♂️🤦‍♂️🤦‍♂️🤦‍♂️🤦‍♂️🤦‍♂️")
    if (!ObjectId.isValid(partnerId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid partner ID' },
        { status: 400 }
      );
    }
    
    // Check if email is being updated and if it already exists
    if (updateData.email) {
      const existingPartner = await Partner.findOne({ 
        email: updateData.email,
        _id: { $ne: partnerId }
      });
      
      if (existingPartner) {
        return NextResponse.json(
          { success: false, message: 'Partner with this email already exists' },
          { status: 400 }
        );
      }
    }
    
    const updatedPartner = await Partner.findByIdAndUpdate(
      partnerId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedPartner) {
      return NextResponse.json(
        { success: false, message: 'Partner not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Partner updated successfully',
      data: updatedPartner
    });
  } catch (error) {
    console.error('Error updating partner:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update partner' },
      { status: 500 }
    );
  }
    }
  )
);

// DELETE /api/admin/partners/[id] - Delete partner
export const DELETE = withAdminAuth(
  withValidation(
    partnerIdSchema,
    async (request: AdminAuthRequest, validatedData: any, { params }: { params: { id: string } }) => {
  try {
    await connectToDatabase();
    const partnerId = params.id;
    
    if (!ObjectId.isValid(partnerId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid partner ID' },
        { status: 400 }
      );
    }
    
    // Check if partner has active investments
    const activeInvestments = await Investment.countDocuments({ 
      partnerId: partnerId,
      returnDate: { $exists: false }
    });
    
    if (activeInvestments > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Cannot delete partner with active investments' 
        },
        { status: 400 }
      );
    }
    
    const deletedPartner = await Partner.findByIdAndDelete(partnerId);
    
    if (!deletedPartner) {
      return NextResponse.json(
        { success: false, message: 'Partner not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Partner deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting partner:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete partner' },
      { status: 500 }
    );
  }
    }
  )
);