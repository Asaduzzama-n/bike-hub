import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Partner } from '@/lib/models';
import { withValidation } from '@/lib/middleware';
import { withAdminAuth, AdminAuthRequest } from '@/lib/middleware/adminAuth';
import { createPartnerSchema, getPartnerSchema } from '@/lib/validations/partner';
import { z } from 'zod';

// GET /api/admin/partners - Get all partners with validation
export const GET = withAdminAuth(
  withValidation(
    getPartnerSchema,
    async (request: AdminAuthRequest, validatedData: any) => {
    try {
      await connectToDatabase();


      
      const partners = await Partner
        .find({})
        .sort({ createdAt: -1 })
        .lean();
      
      return NextResponse.json({
        success: true,
        data: {
          partners
        }
      });
    } catch (error) {
      console.error('Error fetching partners:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to fetch partners',
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  }
));

// POST /api/admin/partners - Create new partner with validation
export const POST = withAdminAuth(
  withValidation(
    createPartnerSchema,
    async (request: AdminAuthRequest, validatedData: any) => {
    try {
      await connectToDatabase();
      const partnerData = validatedData.body ;
      
      // Check if partner with email already exists
      const existingPartner = await Partner.findOne({ email: partnerData.email });
      
      if (existingPartner) {
        return NextResponse.json(
          { success: false, message: 'Partner with this email already exists' },
          { status: 400 }
        );
      }
      
      const newPartner = new Partner({
        ...partnerData,
        totalInvestment: 0,
        totalReturns: 0,
        activeInvestments: 0,
        pendingPayout: 0,
        roi: 0,
        status: 'active'
      });
      
      const savedPartner = await newPartner.save();
      
      return NextResponse.json({
        success: true,
        message: 'Partner created successfully',
        data: savedPartner
      }, { status: 201 });
    } catch (error) {
      console.error('Error creating partner:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to create partner',
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  }
));
