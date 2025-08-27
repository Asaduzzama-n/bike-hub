import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Collections } from '@/lib/constants';
import { ObjectId } from 'mongodb';
import { withTransaction } from '@/lib/middleware/transaction-middleware';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// Admin verification function
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



// Validate partner data
function validatePartnerData(data: any, isUpdate = false) {
  const errors: string[] = [];
  const schema = ValidationSchemas.createPartner;

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
      
      if (rules.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.push(`${field} must be a valid email address`);
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
    }
  });

  return errors;
}

// GET - Fetch all partners with filtering and pagination (Admin only)
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminAuth = await verifyAdmin(request);
    if (!adminAuth.success) {
      return NextResponse.json(
        { success: false, error: adminAuth.error },
        { status: adminAuth.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const includeInvestments = searchParams.get('includeInvestments') === 'true';
    const includeMetrics = searchParams.get('includeMetrics') === 'true';

    const { db } = await connectToDatabase();
    const partnersCollection = db.collection(Collections.PARTNERS);

    // Build filter query
    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { businessName: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Count total documents
    const total = await partnersCollection.countDocuments(filter);

    // Build aggregation pipeline
    const pipeline: any[] = [
      { $match: filter },
      { $sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit }
    ];

    // Include investment details if requested
    if (includeInvestments) {
      pipeline.push({
        $lookup: {
          from: Collections.BIKES,
          localField: '_id',
          foreignField: 'partnerInvestments.partnerId',
          as: 'investments'
        }
      });
      
      pipeline.push({
        $addFields: {
          investments: {
            $map: {
              input: '$investments',
              as: 'bike',
              in: {
                bikeId: '$$bike._id',
                bikeName: '$$bike.name',
                bikeModel: '$$bike.model',
                investment: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: '$$bike.partnerInvestments',
                        cond: { $eq: ['$$this.partnerId', '$_id'] }
                      }
                    },
                    0
                  ]
                }
              }
            }
          }
        }
      });
    }

    // Calculate metrics if requested
    if (includeMetrics) {
      pipeline.push({
        $lookup: {
          from: Collections.BIKES,
          let: { partnerId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ['$$partnerId', '$partnerInvestments.partnerId']
                }
              }
            },
            {
              $addFields: {
                partnerInvestment: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: '$partnerInvestments',
                        cond: { $eq: ['$$this.partnerId', '$$partnerId'] }
                      }
                    },
                    0
                  ]
                }
              }
            }
          ],
          as: 'partnerBikes'
        }
      });
      
      pipeline.push({
        $addFields: {
          metrics: {
            totalInvestment: {
              $sum: '$partnerBikes.partnerInvestment.amount'
            },
            totalProfit: {
              $sum: '$partnerBikes.partnerInvestment.profitEarned'
            },
            activeBikes: {
              $size: {
                $filter: {
                  input: '$partnerBikes',
                  cond: { $ne: ['$$this.status', 'sold'] }
                }
              }
            },
            soldBikes: {
              $size: {
                $filter: {
                  input: '$partnerBikes',
                  cond: { $eq: ['$$this.status', 'sold'] }
                }
              }
            },
            totalBikes: { $size: '$partnerBikes' },
            roi: {
              $cond: {
                if: { $gt: [{ $sum: '$partnerBikes.partnerInvestment.amount' }, 0] },
                then: {
                  $multiply: [
                    {
                      $divide: [
                        { $sum: '$partnerBikes.partnerInvestment.profitEarned' },
                        { $sum: '$partnerBikes.partnerInvestment.amount' }
                      ]
                    },
                    100
                  ]
                },
                else: 0
              }
            }
          }
        }
      });
    }

    const partners = await partnersCollection.aggregate(pipeline).toArray();

    // Calculate overall metrics
    const overallMetrics = await partnersCollection.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: Collections.BIKES,
          let: { partnerId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ['$$partnerId', '$partnerInvestments.partnerId']
                }
              }
            },
            {
              $addFields: {
                partnerInvestment: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: '$partnerInvestments',
                        cond: { $eq: ['$$this.partnerId', '$$partnerId'] }
                      }
                    },
                    0
                  ]
                }
              }
            }
          ],
          as: 'partnerBikes'
        }
      },
      {
        $group: {
          _id: null,
          totalPartners: { $sum: 1 },
          totalInvestment: {
            $sum: {
              $sum: '$partnerBikes.partnerInvestment.amount'
            }
          },
          totalProfit: {
            $sum: {
              $sum: '$partnerBikes.partnerInvestment.profitEarned'
            }
          },
          totalBikes: {
            $sum: { $size: '$partnerBikes' }
          }
        }
      }
    ]).toArray();

    const metrics = overallMetrics[0] || {
      totalPartners: 0,
      totalInvestment: 0,
      totalProfit: 0,
      totalBikes: 0
    };

    // Status breakdown
    const statusBreakdown = await partnersCollection.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    return NextResponse.json({
      success: true,
      data: {
        partners,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        metrics: {
          ...metrics,
          averageROI: metrics.totalInvestment > 0 
            ? Math.round((metrics.totalProfit / metrics.totalInvestment) * 10000) / 100
            : 0,
          statusBreakdown
        }
      }
    });
  } catch (error) {
    console.error('Error fetching partners:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch partners' },
      { status: 500 }
    );
  }
}

// POST - Create new partner (Admin only)
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminAuth = await verifyAdmin(request);
    if (!adminAuth.success) {
      return NextResponse.json(
        { success: false, error: adminAuth.error },
        { status: adminAuth.status }
      );
    }

    const body = await request.json();
    const {
      name,
      email,
      phone,
      address,
      businessName,
      businessType,
      taxId,
      bankDetails,
      investmentCapacity,
      riskTolerance,
      preferredBikeTypes,
      notes,
      documents
    } = body;

    // Validate input data
    const validationErrors = validatePartnerData(body);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const partnersCollection = db.collection(Collections.PARTNERS);

    // Check for duplicate email
    const existingPartner = await partnersCollection.findOne({ email: email.toLowerCase() });
    if (existingPartner) {
      return NextResponse.json(
        { success: false, error: 'Partner with this email already exists' },
        { status: 400 }
      );
    }

    const newPartner = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || '',
      address: {
        street: address?.street?.trim() || '',
        city: address?.city?.trim() || '',
        state: address?.state?.trim() || '',
        zipCode: address?.zipCode?.trim() || '',
        country: address?.country?.trim() || ''
      },
      businessName: businessName?.trim() || '',
      businessType: businessType || 'individual',
      taxId: taxId?.trim() || '',
      bankDetails: {
        accountName: bankDetails?.accountName?.trim() || '',
        accountNumber: bankDetails?.accountNumber?.trim() || '',
        bankName: bankDetails?.bankName?.trim() || '',
        routingNumber: bankDetails?.routingNumber?.trim() || '',
        swiftCode: bankDetails?.swiftCode?.trim() || ''
      },
      investmentCapacity: {
        minimum: investmentCapacity?.minimum || 0,
        maximum: investmentCapacity?.maximum || 0,
        preferred: investmentCapacity?.preferred || 0
      },
      riskTolerance: riskTolerance || 'medium', // low, medium, high
      preferredBikeTypes: preferredBikeTypes || [],
      status: 'active', // active, inactive, suspended
      notes: notes?.trim() || '',
      documents: documents || [],
      totalInvestment: 0,
      totalProfit: 0,
      activeBikes: 0,
      completedDeals: 0,
      joinDate: new Date(),
      lastActivity: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: adminAuth.admin.email
    };

    const result = await partnersCollection.insertOne(newPartner);

    return NextResponse.json({
      success: true,
      message: 'Partner created successfully',
      data: {
        partnerId: result.insertedId,
        name: newPartner.name,
        email: newPartner.email,
        status: newPartner.status
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating partner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create partner' },
      { status: 500 }
    );
  }
}

// PUT - Update partner (bulk update) (Admin only)
export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminAuth = await verifyAdmin(request);
    if (!adminAuth.success) {
      return NextResponse.json(
        { success: false, error: adminAuth.error },
        { status: adminAuth.status }
      );
    }

    const body = await request.json();
    const { partnerIds, updateData } = body;

    if (!partnerIds || !Array.isArray(partnerIds) || partnerIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Partner IDs array is required' },
        { status: 400 }
      );
    }

    // Validate all partner IDs
    const invalidIds = partnerIds.filter(id => !ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid partner IDs', details: invalidIds },
        { status: 400 }
      );
    }

    // Validate update data
    const validationErrors = validatePartnerData(updateData, true);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const partnersCollection = db.collection(Collections.PARTNERS);

    // Prepare update data
    const update: any = {
      ...updateData,
      updatedAt: new Date(),
      updatedBy: adminAuth.admin.email
    };

    // Remove undefined values
    Object.keys(update).forEach(key => {
      if (update[key] === undefined) {
        delete update[key];
      }
    });

    // Update partners
    const result = await partnersCollection.updateMany(
      { _id: { $in: partnerIds.map(id => new ObjectId(id)) } },
      { $set: update }
    );

    return NextResponse.json({
      success: true,
      message: `${result.modifiedCount} partners updated successfully`,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        updatedFields: Object.keys(update).filter(key => !['updatedAt', 'updatedBy'].includes(key))
      }
    });
  } catch (error) {
    console.error('Error updating partners:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update partners' },
      { status: 500 }
    );
  }
}

// DELETE - Delete partners (bulk delete) (Admin only)
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminAuth = await verifyAdmin(request);
    if (!adminAuth.success) {
      return NextResponse.json(
        { success: false, error: adminAuth.error },
        { status: adminAuth.status }
      );
    }

    const body = await request.json();
    const { partnerIds } = body;

    if (!partnerIds || !Array.isArray(partnerIds) || partnerIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Partner IDs array is required' },
        { status: 400 }
      );
    }

    // Validate all partner IDs
    const invalidIds = partnerIds.filter(id => !ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid partner IDs', details: invalidIds },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const partnersCollection = db.collection(Collections.PARTNERS);
    const bikesCollection = db.collection(Collections.BIKES);

    // Check if any partners have active investments
    const partnersWithInvestments = await bikesCollection.find({
      'partnerInvestments.partnerId': { $in: partnerIds.map(id => new ObjectId(id)) },
      status: { $ne: 'sold' }
    }).toArray();

    if (partnersWithInvestments.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot delete partners with active investments',
          details: {
            activeBikes: partnersWithInvestments.length,
            message: 'Please settle all investments before deleting partners'
          }
        },
        { status: 400 }
      );
    }

    // Delete the partners
    const result = await partnersCollection.deleteMany({
      _id: { $in: partnerIds.map(id => new ObjectId(id)) }
    });

    return NextResponse.json({
      success: true,
      message: `${result.deletedCount} partners deleted successfully`,
      data: {
        deletedCount: result.deletedCount,
        deletedPartnerIds: partnerIds
      }
    });
  } catch (error) {
    console.error('Error deleting partners:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete partners' },
      { status: 500 }
    );
  }
}