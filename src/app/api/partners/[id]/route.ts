import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { Collections, ValidationSchemas } from '@/lib/models/admin';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// Verify admin authentication
async function verifyAdmin(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('adminToken')?.value;

    if (!token) {
      return null;
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
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

// GET - Fetch individual partner with detailed information
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid partner ID' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const includeInvestments = searchParams.get('includeInvestments') !== 'false';
    const includeMetrics = searchParams.get('includeMetrics') !== 'false';
    const includeHistory = searchParams.get('includeHistory') === 'true';

    const { db } = await connectToDatabase();
    const partnersCollection = db.collection(Collections.PARTNERS);

    // Build aggregation pipeline
    const pipeline: any[] = [
      { $match: { _id: new ObjectId(id) } }
    ];

    // Include investment details
    if (includeInvestments) {
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
            },
            {
              $project: {
                _id: 1,
                name: 1,
                model: 1,
                brand: 1,
                year: 1,
                status: 1,
                purchasePrice: 1,
                sellingPrice: 1,
                profit: 1,
                purchaseDate: 1,
                sellDate: 1,
                partnerInvestment: 1,
                images: { $arrayElemAt: ['$images', 0] }
              }
            }
          ],
          as: 'investments'
        }
      });
    }

    // Include sell records for this partner's bikes
    if (includeInvestments) {
      pipeline.push({
        $lookup: {
          from: Collections.SELL_RECORDS,
          let: { partnerBikeIds: '$investments._id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ['$bikeId', '$$partnerBikeIds']
                }
              }
            },
            {
              $project: {
                _id: 1,
                bikeId: 1,
                customerName: 1,
                customerEmail: 1,
                sellingPrice: 1,
                profit: 1,
                sellDate: 1,
                paymentStatus: 1,
                dueAmount: 1
              }
            }
          ],
          as: 'sellRecords'
        }
      });
    }

    // Calculate detailed metrics
    if (includeMetrics) {
      pipeline.push({
        $addFields: {
          metrics: {
            totalInvestment: {
              $sum: '$investments.partnerInvestment.amount'
            },
            totalProfit: {
              $sum: '$investments.partnerInvestment.profitEarned'
            },
            pendingProfit: {
              $sum: {
                $map: {
                  input: '$investments',
                  as: 'bike',
                  in: {
                    $cond: {
                      if: { $eq: ['$$bike.status', 'sold'] },
                      then: {
                        $subtract: [
                          {
                            $multiply: [
                              '$$bike.profit',
                              { $divide: ['$$bike.partnerInvestment.percentage', 100] }
                            ]
                          },
                          '$$bike.partnerInvestment.profitEarned'
                        ]
                      },
                      else: 0
                    }
                  }
                }
              }
            },
            activeBikes: {
              $size: {
                $filter: {
                  input: '$investments',
                  cond: { $ne: ['$$this.status', 'sold'] }
                }
              }
            },
            soldBikes: {
              $size: {
                $filter: {
                  input: '$investments',
                  cond: { $eq: ['$$this.status', 'sold'] }
                }
              }
            },
            totalBikes: { $size: '$investments' },
            averageInvestmentPerBike: {
              $cond: {
                if: { $gt: [{ $size: '$investments' }, 0] },
                then: {
                  $divide: [
                    { $sum: '$investments.partnerInvestment.amount' },
                    { $size: '$investments' }
                  ]
                },
                else: 0
              }
            },
            roi: {
              $cond: {
                if: { $gt: [{ $sum: '$investments.partnerInvestment.amount' }, 0] },
                then: {
                  $multiply: [
                    {
                      $divide: [
                        { $sum: '$investments.partnerInvestment.profitEarned' },
                        { $sum: '$investments.partnerInvestment.amount' }
                      ]
                    },
                    100
                  ]
                },
                else: 0
              }
            },
            monthlyBreakdown: {
              $reduce: {
                input: '$investments',
                initialValue: {},
                in: {
                  $mergeObjects: [
                    '$$value',
                    {
                      $let: {
                        vars: {
                          month: {
                            $dateToString: {
                              format: '%Y-%m',
                              date: '$$this.partnerInvestment.investmentDate'
                            }
                          }
                        },
                        in: {
                          '$$month': {
                            $add: [
                              { $ifNull: [{ $getField: { field: '$$month', input: '$$value' } }, 0] },
                              '$$this.partnerInvestment.amount'
                            ]
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          }
        }
      });
    }

    // Include activity history
    if (includeHistory) {
      pipeline.push({
        $lookup: {
          from: 'partner_activities', // Assuming we have an activities collection
          localField: '_id',
          foreignField: 'partnerId',
          pipeline: [
            { $sort: { createdAt: -1 } },
            { $limit: 50 }
          ],
          as: 'activityHistory'
        }
      });
    }

    const result = await partnersCollection.aggregate(pipeline).toArray();
    
    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Partner not found' },
        { status: 404 }
      );
    }

    const partner = result[0];

    // Calculate additional insights
    if (includeMetrics && partner.investments) {
      const now = new Date();
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      
      partner.insights = {
        recentActivity: partner.investments.filter(
          (inv: any) => new Date(inv.partnerInvestment.investmentDate) >= sixMonthsAgo
        ).length,
        averageHoldingPeriod: partner.investments
          .filter((inv: any) => inv.status === 'sold')
          .reduce((acc: number, inv: any) => {
            const purchaseDate = new Date(inv.purchaseDate);
            const sellDate = new Date(inv.sellDate);
            return acc + (sellDate.getTime() - purchaseDate.getTime());
          }, 0) / (partner.investments.filter((inv: any) => inv.status === 'sold').length || 1) / (1000 * 60 * 60 * 24), // in days
        profitTrend: 'stable', // This could be calculated based on recent performance
        riskScore: partner.riskTolerance === 'high' ? 8 : partner.riskTolerance === 'medium' ? 5 : 2
      };
    }

    return NextResponse.json({
      success: true,
      data: partner
    });
  } catch (error) {
    console.error('Error fetching partner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch partner' },
      { status: 500 }
    );
  }
}

// PUT - Update individual partner
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid partner ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validate input data
    const validationErrors = validatePartnerData(body, true);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const partnersCollection = db.collection(Collections.PARTNERS);

    // Check if partner exists
    const existingPartner = await partnersCollection.findOne({ _id: new ObjectId(id) });
    if (!existingPartner) {
      return NextResponse.json(
        { success: false, error: 'Partner not found' },
        { status: 404 }
      );
    }

    // Check for duplicate email if email is being updated
    if (body.email && body.email.toLowerCase() !== existingPartner.email) {
      const duplicatePartner = await partnersCollection.findOne({ 
        email: body.email.toLowerCase(),
        _id: { $ne: new ObjectId(id) }
      });
      if (duplicatePartner) {
        return NextResponse.json(
          { success: false, error: 'Partner with this email already exists' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      ...body,
      updatedAt: new Date(),
      updatedBy: admin.email
    };

    // Handle nested objects properly
    if (body.address) {
      updateData.address = {
        ...existingPartner.address,
        ...body.address
      };
    }

    if (body.bankDetails) {
      updateData.bankDetails = {
        ...existingPartner.bankDetails,
        ...body.bankDetails
      };
    }

    if (body.investmentCapacity) {
      updateData.investmentCapacity = {
        ...existingPartner.investmentCapacity,
        ...body.investmentCapacity
      };
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Update last activity if status is being changed to active
    if (body.status === 'active' && existingPartner.status !== 'active') {
      updateData.lastActivity = new Date();
    }

    const result = await partnersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Partner not found' },
        { status: 404 }
      );
    }

    // Fetch updated partner
    const updatedPartner = await partnersCollection.findOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      success: true,
      message: 'Partner updated successfully',
      data: updatedPartner
    });
  } catch (error) {
    console.error('Error updating partner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update partner' },
      { status: 500 }
    );
  }
}

// DELETE - Delete individual partner
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid partner ID' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const partnersCollection = db.collection(Collections.PARTNERS);
    const bikesCollection = db.collection(Collections.BIKES);

    // Check if partner exists
    const partner = await partnersCollection.findOne({ _id: new ObjectId(id) });
    if (!partner) {
      return NextResponse.json(
        { success: false, error: 'Partner not found' },
        { status: 404 }
      );
    }

    // Check if partner has active investments
    const activeBikes = await bikesCollection.find({
      'partnerInvestments.partnerId': new ObjectId(id),
      status: { $ne: 'sold' }
    }).toArray();

    if (activeBikes.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot delete partner with active investments',
          details: {
            activeBikes: activeBikes.length,
            bikeIds: activeBikes.map(bike => bike._id),
            message: 'Please settle all investments before deleting this partner'
          }
        },
        { status: 400 }
      );
    }

    // Remove partner from all bike investments (for sold bikes)
    await bikesCollection.updateMany(
      { 'partnerInvestments.partnerId': new ObjectId(id) },
      { $pull: { partnerInvestments: { partnerId: new ObjectId(id) } } }
    );

    // Delete the partner
    const result = await partnersCollection.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      success: true,
      message: 'Partner deleted successfully',
      data: {
        deletedPartnerId: id,
        partnerName: partner.name,
        partnerEmail: partner.email
      }
    });
  } catch (error) {
    console.error('Error deleting partner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete partner' },
      { status: 500 }
    );
  }
}

// PATCH - Update partner status or specific fields
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid partner ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action, ...data } = body;

    const { db } = await connectToDatabase();
    const partnersCollection = db.collection(Collections.PARTNERS);

    // Check if partner exists
    const partner = await partnersCollection.findOne({ _id: new ObjectId(id) });
    if (!partner) {
      return NextResponse.json(
        { success: false, error: 'Partner not found' },
        { status: 404 }
      );
    }

    let updateData: any = {
      updatedAt: new Date(),
      updatedBy: admin.email
    };

    let message = 'Partner updated successfully';

    switch (action) {
      case 'updateStatus':
        if (!data.status || !['active', 'inactive', 'suspended'].includes(data.status)) {
          return NextResponse.json(
            { success: false, error: 'Valid status is required (active, inactive, suspended)' },
            { status: 400 }
          );
        }
        updateData.status = data.status;
        updateData.statusChangeReason = data.reason || '';
        updateData.statusChangedAt = new Date();
        if (data.status === 'active') {
          updateData.lastActivity = new Date();
        }
        message = `Partner status updated to ${data.status}`;
        break;

      case 'updateInvestmentCapacity':
        if (!data.investmentCapacity) {
          return NextResponse.json(
            { success: false, error: 'Investment capacity data is required' },
            { status: 400 }
          );
        }
        updateData.investmentCapacity = {
          ...partner.investmentCapacity,
          ...data.investmentCapacity
        };
        message = 'Investment capacity updated successfully';
        break;

      case 'updateRiskTolerance':
        if (!data.riskTolerance || !['low', 'medium', 'high'].includes(data.riskTolerance)) {
          return NextResponse.json(
            { success: false, error: 'Valid risk tolerance is required (low, medium, high)' },
            { status: 400 }
          );
        }
        updateData.riskTolerance = data.riskTolerance;
        message = 'Risk tolerance updated successfully';
        break;

      case 'updatePreferences':
        if (data.preferredBikeTypes) {
          updateData.preferredBikeTypes = data.preferredBikeTypes;
        }
        if (data.notes !== undefined) {
          updateData.notes = data.notes;
        }
        message = 'Partner preferences updated successfully';
        break;

      case 'addDocument':
        if (!data.document) {
          return NextResponse.json(
            { success: false, error: 'Document data is required' },
            { status: 400 }
          );
        }
        updateData = {
          $push: {
            documents: {
              ...data.document,
              uploadedAt: new Date(),
              uploadedBy: admin.email
            }
          },
          $set: {
            updatedAt: new Date(),
            updatedBy: admin.email
          }
        };
        message = 'Document added successfully';
        break;

      case 'removeDocument':
        if (!data.documentId) {
          return NextResponse.json(
            { success: false, error: 'Document ID is required' },
            { status: 400 }
          );
        }
        updateData = {
          $pull: {
            documents: { _id: new ObjectId(data.documentId) }
          },
          $set: {
            updatedAt: new Date(),
            updatedBy: admin.email
          }
        };
        message = 'Document removed successfully';
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action specified' },
          { status: 400 }
        );
    }

    const updateOperation = action === 'addDocument' || action === 'removeDocument' 
      ? updateData 
      : { $set: updateData };

    const result = await partnersCollection.updateOne(
      { _id: new ObjectId(id) },
      updateOperation
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Partner not found' },
        { status: 404 }
      );
    }

    // Fetch updated partner
    const updatedPartner = await partnersCollection.findOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      success: true,
      message,
      data: {
        partner: updatedPartner,
        action,
        updatedFields: Object.keys(updateData).filter(key => !['updatedAt', 'updatedBy'].includes(key))
      }
    });
  } catch (error) {
    console.error('Error updating partner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update partner' },
      { status: 500 }
    );
  }
}