// import { NextRequest, NextResponse } from 'next/server';
// import { connectToDatabase } from '@/lib/mongodb';
// import { ObjectId } from 'mongodb';
// import { cookies } from 'next/headers';
// import { jwtVerify } from 'jose';

// // Verify admin authentication
// async function verifyAdmin(request: NextRequest) {
//   try {
//     const cookieStore = cookies();
//     const token = await cookieStore.get('adminToken')?.value;

//     if (!token) {
//       return null;
//     }

//     const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');
//     const { payload } = await jwtVerify(token, secret);
//     return payload;
//   } catch (error) {
//     return null;
//   }
// }

// // GET - Fetch all bikes with filtering and pagination
// export async function GET(request: NextRequest) {
//   try {
//     const admin = await verifyAdmin(request);
//     if (!admin) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const { searchParams } = new URL(request.url);
//     const page = parseInt(searchParams.get('page') || '1');
//     const limit = parseInt(searchParams.get('limit') || '10');
//     const search = searchParams.get('search') || '';
//     const status = searchParams.get('status') || '';
//     const brand = searchParams.get('brand') || '';
//     const sortBy = searchParams.get('sortBy') || 'createdAt';
//     const sortOrder = searchParams.get('sortOrder') || 'desc';

//     const { db } = await connectToDatabase();
//     const bikesCollection = db.collection('bikes');

//     // Build filter query
//     const filter: any = {};
    
//     if (search) {
//       filter.$or = [
//         { brand: { $regex: search, $options: 'i' } },
//         { model: { $regex: search, $options: 'i' } },
//         { description: { $regex: search, $options: 'i' } }
//       ];
//     }

//     if (status) {
//       filter.status = status;
//     }

//     if (brand) {
//       filter.brand = { $regex: brand, $options: 'i' };
//     }

//     // Count total documents
//     const total = await bikesCollection.countDocuments(filter);

//     // Fetch bikes with pagination
//     const bikes = await bikesCollection
//       .find(filter)
//       .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
//       .skip((page - 1) * limit)
//       .limit(limit)
//       .toArray();

//     return NextResponse.json({
//       bikes,
//       pagination: {
//         page,
//         limit,
//         total,
//         pages: Math.ceil(total / limit)
//       }
//     });
//   } catch (error) {
//     console.error('Error fetching bikes:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }

// // POST - Create new bike listing
// export async function POST(request: NextRequest) {
//   try {
//     const admin = await verifyAdmin(request);
//     if (!admin) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const body = await request.json();
//     const {
//       brand,
//       model,
//       year,
//       cc,
//       mileage,
//       buyPrice,
//       sellPrice,
//       description,
//       images,
//       freeWash,
//       repairs,
//       partnerInvestments
//     } = body;

//     // Validate required fields
//     if (!brand || !model || !year || !cc || !buyPrice || !sellPrice) {
//       return NextResponse.json(
//         { error: 'Missing required fields' },
//         { status: 400 }
//       );
//     }

//     const { db } = await connectToDatabase();
//     const bikesCollection = db.collection('bikes');

//     // Calculate profit
//     const totalCosts = (repairs || []).reduce((sum: number, repair: any) => sum + repair.cost, 0);
//     const profit = sellPrice - buyPrice - totalCosts;

//     const newBike = {
//       brand,
//       model,
//       year: parseInt(year),
//       cc: parseInt(cc),
//       mileage: parseInt(mileage || 0),
//       buyPrice: parseFloat(buyPrice),
//       sellPrice: parseFloat(sellPrice),
//       description,
//       images: images || [],
//       freeWash: freeWash || false,
//       repairs: repairs || [],
//       partnerInvestments: partnerInvestments || [],
//       status: 'available',
//       profit,
//       totalCosts,
//       createdAt: new Date(),
//       updatedAt: new Date(),
//       createdBy: admin.email
//     };

//     const result = await bikesCollection.insertOne(newBike);

//     return NextResponse.json({
//       message: 'Bike created successfully',
//       bikeId: result.insertedId
//     }, { status: 201 });
//   } catch (error) {
//     console.error('Error creating bike:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }

// // PUT - Update bike listing
// export async function PUT(request: NextRequest) {
//   try {
//     const admin = await verifyAdmin(request);
//     if (!admin) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const body = await request.json();
//     const { bikeId, ...updateData } = body;

//     if (!bikeId) {
//       return NextResponse.json(
//         { error: 'Bike ID is required' },
//         { status: 400 }
//       );
//     }

//     const { db } = await connectToDatabase();
//     const bikesCollection = db.collection('bikes');

//     // Recalculate profit if prices or repairs changed
//     if (updateData.buyPrice || updateData.sellPrice || updateData.repairs) {
//       const existingBike = await bikesCollection.findOne({ _id: new ObjectId(bikeId) });
//       if (existingBike) {
//         const buyPrice = updateData.buyPrice || existingBike.buyPrice;
//         const sellPrice = updateData.sellPrice || existingBike.sellPrice;
//         const repairs = updateData.repairs || existingBike.repairs || [];
//         const totalCosts = repairs.reduce((sum: number, repair: any) => sum + repair.cost, 0);
        
//         updateData.profit = sellPrice - buyPrice - totalCosts;
//         updateData.totalCosts = totalCosts;
//       }
//     }

//     updateData.updatedAt = new Date();
//     updateData.updatedBy = admin.email;

//     const result = await bikesCollection.updateOne(
//       { _id: new ObjectId(bikeId) },
//       { $set: updateData }
//     );

//     if (result.matchedCount === 0) {
//       return NextResponse.json({ error: 'Bike not found' }, { status: 404 });
//     }

//     return NextResponse.json({ message: 'Bike updated successfully' });
//   } catch (error) {
//     console.error('Error updating bike:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }

// // DELETE - Delete bike listing
// export async function DELETE(request: NextRequest) {
//   try {
//     const admin = await verifyAdmin(request);
//     if (!admin) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const { searchParams } = new URL(request.url);
//     const bikeId = searchParams.get('bikeId');

//     if (!bikeId) {
//       return NextResponse.json(
//         { error: 'Bike ID is required' },
//         { status: 400 }
//       );
//     }

//     const { db } = await connectToDatabase();
//     const bikesCollection = db.collection('bikes');

//     const result = await bikesCollection.deleteOne({ _id: new ObjectId(bikeId) });

//     if (result.deletedCount === 0) {
//       return NextResponse.json({ error: 'Bike not found' }, { status: 404 });
//     }

//     return NextResponse.json({ message: 'Bike deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting bike:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }