import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { Collections, ValidationSchemas, ModelHelpers } from '@/lib/models/admin';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import jwt from 'jsonwebtoken';

// Verify admin authentication
async function verifyAdmin(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('adminToken')?.value || cookieStore.get('admin_token')?.value;

    if (!token) {
      return { success: false, error: 'Admin authentication required', status: 401 };
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');
    const { payload } = await jwtVerify(token, secret);
    
    if (payload.role !== 'admin') {
      return { success: false, error: 'Admin access required', status: 403 };
    }

    return { success: true, admin: payload };
  } catch (error) {
    return { success: false, error: 'Invalid admin token', status: 401 };
  }
}

// Validate bike data
function validateBikeData(data: any, isUpdate = false) {
  const errors: string[] = [];
  const schema = ValidationSchemas.createBike;

  Object.entries(schema).forEach(([field, rules]) => {
    const value = data[field];
    
    if (rules.required && !isUpdate && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      return;
    }

    if (value !== undefined && value !== null && value !== '') {
      if (rules.type === 'number' && (isNaN(value) || typeof value !== 'number')) {
        errors.push(`${field} must be a valid number`);
      }
      
      if (rules.type === 'string' && typeof value !== 'string') {
        errors.push(`${field} must be a string`);
      }
      
      if (rules.minLength && value.length < rules.minLength) {
        errors.push(`${field} must be at least ${rules.minLength} characters`);
      }
      
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`${field} must not exceed ${rules.maxLength} characters`);
      }
      
      if (rules.min && value < rules.min) {
        errors.push(`${field} must be at least ${rules.min}`);
      }
      
      if (rules.max && value > rules.max) {
        errors.push(`${field} must not exceed ${rules.max}`);
      }
      
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
      }
    }
  });

  return errors;
}

// GET - Public route to fetch all bikes with filtering, pagination, and search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'available'; // Default to available for public
    const brand = searchParams.get('brand') || '';
    const condition = searchParams.get('condition') || '';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const { db } = await connectToDatabase();
    const bikesCollection = db.collection(Collections.BIKES);

    // Build filter query
    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      filter.status = status;
    }

    if (brand) {
      filter.brand = { $regex: brand, $options: 'i' };
    }

    if (condition) {
      filter.condition = condition;
    }

    if (minPrice || maxPrice) {
      filter.sellPrice = {};
      if (minPrice) filter.sellPrice.$gte = parseFloat(minPrice);
      if (maxPrice) filter.sellPrice.$lte = parseFloat(maxPrice);
    }

    // Count total documents
    const total = await bikesCollection.countDocuments(filter);

    // Simple aggregation for public access (no sensitive data)
    const pipeline = [
      { $match: filter },
      {
        $lookup: {
          from: Collections.REVIEWS,
          localField: '_id',
          foreignField: 'bikeId',
          as: 'reviews'
        }
      },
      {
        $addFields: {
          averageRating: {
            $cond: {
              if: { $gt: [{ $size: '$reviews' }, 0] },
              then: { $avg: '$reviews.rating' },
              else: 0
            }
          },
          totalReviews: { $size: '$reviews' }
        }
      },
      {
        $project: {
          brand: 1,
          model: 1,
          year: 1,
          cc: 1,
          mileage: 1,
          sellPrice: 1,
          description: 1,
          images: 1,
          condition: 1,
          freeWash: 1,
          status: 1,
          averageRating: 1,
          totalReviews: 1,
          createdAt: 1
        }
      },
      { $sort: sort },
      { $skip: skip },
      { $limit: limit }
    ];

    const bikes = await bikesCollection.aggregate(pipeline).toArray();

    // Calculate additional metrics
    const metrics = {
      totalBikes: total,
      availableBikes: await bikesCollection.countDocuments({ status: 'available' }),
      soldBikes: await bikesCollection.countDocuments({ status: 'sold' }),
      reservedBikes: await bikesCollection.countDocuments({ status: 'reserved' }),
      totalValue: await bikesCollection.aggregate([
        { $match: { status: 'available' } },
        { $group: { _id: null, total: { $sum: '$sellPrice' } } }
      ]).toArray().then(result => result[0]?.total || 0)
    };

    return NextResponse.json({
      success: true,
      data: {
        bikes,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        metrics
      }
    });
  } catch (error) {
    console.error('Error fetching bikes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bikes' },
      { status: 500 }
    );
  }
}

// POST - Create new bike listing (Admin only)
export async function POST(request: NextRequest) {
  try {
    const adminVerification = await verifyAdmin(request);
    if (!adminVerification.success) {
      return NextResponse.json(
        { success: false, error: adminVerification.error },
        { status: adminVerification.status }
      );
    }
    const admin = adminVerification.admin;

    const body = await request.json();
    const {
      brand,
      model,
      year,
      cc,
      mileage,
      buyPrice,
      sellPrice,
      description,
      images,
      condition,
      freeWash,
      repairs,
      partnerInvestments
    } = body;

    // Validate input data
    const validationErrors = validateBikeData(body);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const bikesCollection = db.collection(Collections.BIKES);
    const partnersCollection = db.collection(Collections.PARTNERS);

    // Validate partner investments if provided
    if (partnerInvestments && partnerInvestments.length > 0) {
      const partnerIds = partnerInvestments.map((inv: any) => new ObjectId(inv.partnerId));
      const partners = await partnersCollection.find({ _id: { $in: partnerIds } }).toArray();
      
      if (partners.length !== partnerIds.length) {
        return NextResponse.json(
          { success: false, error: 'One or more partners not found' },
          { status: 400 }
        );
      }

      // Validate investment percentages don't exceed 100%
      const totalPercentage = partnerInvestments.reduce((sum: number, inv: any) => sum + inv.percentage, 0);
      if (totalPercentage > 100) {
        return NextResponse.json(
          { success: false, error: 'Total partner investment percentage cannot exceed 100%' },
          { status: 400 }
        );
      }
    }

    // Calculate profit and total costs
    const totalRepairCosts = (repairs || []).reduce((sum: number, repair: any) => sum + (repair.cost || 0), 0);
    const profit = ModelHelpers.calculateBikeProfit({ buyPrice, sellPrice, repairs });

    const newBike = {
      brand: brand.trim(),
      model: model.trim(),
      year: parseInt(year),
      cc: parseInt(cc),
      mileage: parseInt(mileage || 0),
      buyPrice: parseFloat(buyPrice),
      sellPrice: parseFloat(sellPrice),
      profit,
      description: description?.trim() || '',
      images: images || [],
      condition: condition || 'good',
      status: 'available',
      freeWash: freeWash || false,
      repairs: (repairs || []).map((repair: any) => ({
        ...repair,
        date: new Date(repair.date || Date.now())
      })),
      partnerInvestments: (partnerInvestments || []).map((inv: any) => ({
        partnerId: new ObjectId(inv.partnerId),
        amount: parseFloat(inv.amount),
        percentage: parseFloat(inv.percentage)
      })),
      listedDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: admin.email
    };

    const result = await bikesCollection.insertOne(newBike);

    // Update partner investments if any
    if (partnerInvestments && partnerInvestments.length > 0) {
      for (const investment of partnerInvestments) {
        await partnersCollection.updateOne(
          { _id: new ObjectId(investment.partnerId) },
          {
            $inc: {
              totalInvestment: parseFloat(investment.amount),
              activeInvestments: parseFloat(investment.amount)
            },
            $push: {
              investments: {
                bikeId: result.insertedId,
                amount: parseFloat(investment.amount),
                percentage: parseFloat(investment.percentage),
                investmentDate: new Date(),
                status: 'active'
              }
            },
            $set: { updatedAt: new Date() }
          }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Bike created successfully',
      data: {
        bikeId: result.insertedId,
        profit,
        totalRepairCosts
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating bike:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create bike' },
      { status: 500 }
    );
  }
}

// PUT - Update bike listing
export async function PUT(request: NextRequest) {
  try {
    const adminVerification = await verifyAdmin(request);
    if (!adminVerification.success) {
      return NextResponse.json(
        { success: false, error: adminVerification.error },
        { status: adminVerification.status }
      );
    }
    const admin = adminVerification.admin;

    const body = await request.json();
    const { bikeId, ...updateData } = body;

    if (!bikeId) {
      return NextResponse.json(
        { success: false, error: 'Bike ID is required' },
        { status: 400 }
      );
    }

    // Validate update data
    const validationErrors = validateBikeData(updateData, true);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const bikesCollection = db.collection(Collections.BIKES);

    // Get existing bike
    const existingBike = await bikesCollection.findOne({ _id: new ObjectId(bikeId) });
    if (!existingBike) {
      return NextResponse.json(
        { success: false, error: 'Bike not found' },
        { status: 404 }
      );
    }

    // Prevent updating sold bikes
    if (existingBike.status === 'sold' && updateData.status !== 'sold') {
      return NextResponse.json(
        { success: false, error: 'Cannot modify sold bike details' },
        { status: 400 }
      );
    }

    // Recalculate profit if prices or repairs changed
    if (updateData.buyPrice || updateData.sellPrice || updateData.repairs) {
      const buyPrice = updateData.buyPrice || existingBike.buyPrice;
      const sellPrice = updateData.sellPrice || existingBike.sellPrice;
      const repairs = updateData.repairs || existingBike.repairs || [];
      
      updateData.profit = ModelHelpers.calculateBikeProfit({ buyPrice, sellPrice, repairs });
    }

    // Process repairs if provided
    if (updateData.repairs) {
      updateData.repairs = updateData.repairs.map((repair: any) => ({
        ...repair,
        date: new Date(repair.date || Date.now())
      }));
    }

    updateData.updatedAt = new Date();
    updateData.updatedBy = admin.email;

    const result = await bikesCollection.updateOne(
      { _id: new ObjectId(bikeId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Bike not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Bike updated successfully',
      data: {
        bikeId,
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('Error updating bike:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update bike' },
      { status: 500 }
    );
  }
}

// DELETE - Delete bike listing
export async function DELETE(request: NextRequest) {
  try {
    const adminVerification = await verifyAdmin(request);
    if (!adminVerification.success) {
      return NextResponse.json(
        { success: false, error: adminVerification.error },
        { status: adminVerification.status }
      );
    }
    const admin = adminVerification.admin;

    const { searchParams } = new URL(request.url);
    const bikeId = searchParams.get('id');

    if (!bikeId) {
      return NextResponse.json(
        { success: false, error: 'Bike ID is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const bikesCollection = db.collection(Collections.BIKES);
    const partnersCollection = db.collection(Collections.PARTNERS);

    // Get bike details before deletion
    const bike = await bikesCollection.findOne({ _id: new ObjectId(bikeId) });
    if (!bike) {
      return NextResponse.json(
        { success: false, error: 'Bike not found' },
        { status: 404 }
      );
    }

    // Prevent deletion of sold bikes
    if (bike.status === 'sold') {
      return NextResponse.json(
        { success: false, error: 'Cannot delete sold bikes' },
        { status: 400 }
      );
    }

    // Remove partner investments
    if (bike.partnerInvestments && bike.partnerInvestments.length > 0) {
      for (const investment of bike.partnerInvestments) {
        await partnersCollection.updateOne(
          { _id: investment.partnerId },
          {
            $inc: {
              totalInvestment: -investment.amount,
              activeInvestments: -investment.amount
            },
            $pull: {
              investments: { bikeId: new ObjectId(bikeId) }
            },
            $set: { updatedAt: new Date() }
          }
        );
      }
    }

    const result = await bikesCollection.deleteOne({ _id: new ObjectId(bikeId) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Bike not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Bike deleted successfully',
      data: {
        bikeId,
        deletedCount: result.deletedCount
      }
    });
  } catch (error) {
    console.error('Error deleting bike:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete bike' },
      { status: 500 }
    );
  }
}