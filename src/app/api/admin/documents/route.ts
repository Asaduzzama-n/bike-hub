// import { NextRequest, NextResponse } from 'next/server';
// import { connectToDatabase } from '@/lib/mongodb';
// import { ObjectId } from 'mongodb';
// import { cookies } from 'next/headers';
// import { jwtVerify } from 'jose';

// // Verify admin authentication
// async function verifyAdmin(request: NextRequest) {
//   try {
//     const cookieStore = cookies();
//     const token = cookieStore.get('adminToken')?.value;

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

// // GET - Fetch documents with filtering and pagination
// export async function GET(request: NextRequest) {
//   try {
//     const admin = await verifyAdmin(request);
//     if (!admin) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const { searchParams } = new URL(request.url);
//     const page = parseInt(searchParams.get('page') || '1');
//     const limit = parseInt(searchParams.get('limit') || '10');
//     const status = searchParams.get('status') || '';
//     const type = searchParams.get('type') || '';
//     const search = searchParams.get('search') || '';
//     const statsOnly = searchParams.get('stats') === 'true';

//     const { db } = await connectToDatabase();
//     const documentsCollection = db.collection('documents');

//     // If only stats requested
//     if (statsOnly) {
//       return await getDocumentStats(documentsCollection);
//     }

//     // Build filter query
//     const filter: any = {};
    
//     if (status) {
//       filter.status = status;
//     }

//     if (type) {
//       filter.type = type;
//     }

//     if (search) {
//       filter.$or = [
//         { userName: { $regex: search, $options: 'i' } },
//         { userEmail: { $regex: search, $options: 'i' } },
//         { documentNumber: { $regex: search, $options: 'i' } },
//         { bikeName: { $regex: search, $options: 'i' } }
//       ];
//     }

//     // Count total documents
//     const total = await documentsCollection.countDocuments(filter);

//     // Fetch documents with pagination
//     const documents = await documentsCollection
//       .find(filter)
//       .sort({ uploadDate: -1 })
//       .skip((page - 1) * limit)
//       .limit(limit)
//       .toArray();

//     return NextResponse.json({
//       documents,
//       pagination: {
//         page,
//         limit,
//         total,
//         pages: Math.ceil(total / limit)
//       }
//     });
//   } catch (error) {
//     console.error('Error fetching documents:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }

// // Get document statistics
// async function getDocumentStats(documentsCollection: any) {
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);
//   const tomorrow = new Date(today);
//   tomorrow.setDate(tomorrow.getDate() + 1);

//   const [totalDocs, pendingDocs, verifiedToday, rejectedToday] = await Promise.all([
//     documentsCollection.countDocuments(),
//     documentsCollection.countDocuments({ status: 'pending' }),
//     documentsCollection.countDocuments({
//       status: 'verified',
//       verificationDate: { $gte: today, $lt: tomorrow }
//     }),
//     documentsCollection.countDocuments({
//       status: 'rejected',
//       verificationDate: { $gte: today, $lt: tomorrow }
//     })
//   ]);

//   // Calculate average verification time
//   const verifiedDocs = await documentsCollection.find({
//     status: { $in: ['verified', 'rejected'] },
//     verificationDate: { $exists: true },
//     uploadDate: { $exists: true }
//   }).toArray();

//   let averageVerificationTime = '0 hours';
//   if (verifiedDocs.length > 0) {
//     const totalTime = verifiedDocs.reduce((sum, doc) => {
//       const uploadTime = new Date(doc.uploadDate).getTime();
//       const verificationTime = new Date(doc.verificationDate).getTime();
//       return sum + (verificationTime - uploadTime);
//     }, 0);
    
//     const avgTimeMs = totalTime / verifiedDocs.length;
//     const avgTimeHours = avgTimeMs / (1000 * 60 * 60);
//     averageVerificationTime = `${avgTimeHours.toFixed(1)} hours`;
//   }

//   return NextResponse.json({
//     stats: {
//       totalDocuments: totalDocs,
//       pendingVerification: pendingDocs,
//       verifiedToday,
//       rejectedToday,
//       averageVerificationTime
//     }
//   });
// }

// // POST - Verify/Reject document
// export async function POST(request: NextRequest) {
//   try {
//     const admin = await verifyAdmin(request);
//     if (!admin) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const body = await request.json();
//     const { documentId, action, notes, rejectionReason } = body;

//     if (!documentId || !action || !['approve', 'reject'].includes(action)) {
//       return NextResponse.json(
//         { error: 'Invalid request parameters' },
//         { status: 400 }
//       );
//     }

//     if (action === 'reject' && !rejectionReason) {
//       return NextResponse.json(
//         { error: 'Rejection reason is required' },
//         { status: 400 }
//       );
//     }

//     const { db } = await connectToDatabase();
//     const documentsCollection = db.collection('documents');
//     const usersCollection = db.collection('users');
//     const notificationsCollection = db.collection('notifications');

//     // Check if document exists
//     const document = await documentsCollection.findOne({ _id: new ObjectId(documentId) });
//     if (!document) {
//       return NextResponse.json({ error: 'Document not found' }, { status: 404 });
//     }

//     if (document.status !== 'pending') {
//       return NextResponse.json(
//         { error: 'Document has already been processed' },
//         { status: 400 }
//       );
//     }

//     // Update document status
//     const updateData: any = {
//       status: action === 'approve' ? 'verified' : 'rejected',
//       verificationDate: new Date(),
//       verifiedBy: admin.email,
//       notes: notes || '',
//       updatedAt: new Date()
//     };

//     if (action === 'reject') {
//       updateData.rejectionReason = rejectionReason;
//     }

//     await documentsCollection.updateOne(
//       { _id: new ObjectId(documentId) },
//       { $set: updateData }
//     );

//     // Create notification for user
//     const notificationMessage = action === 'approve'
//       ? `Your ${document.type.toUpperCase()} document has been verified and approved.`
//       : `Your ${document.type.toUpperCase()} document has been rejected. Reason: ${rejectionReason}`;

//     await notificationsCollection.insertOne({
//       userId: document.userId,
//       type: 'document_verification',
//       title: `Document ${action === 'approve' ? 'Approved' : 'Rejected'}`,
//       message: notificationMessage,
//       documentId: new ObjectId(documentId),
//       read: false,
//       createdAt: new Date()
//     });

//     // Update user's document verification status if approved
//     if (action === 'approve') {
//       const updateField = document.type === 'nid' ? 'nidVerified' : 'brtaVerified';
//       await usersCollection.updateOne(
//         { _id: new ObjectId(document.userId) },
//         {
//           $set: {
//             [updateField]: true,
//             [`${updateField}Date`]: new Date()
//           }
//         }
//       );
//     }

//     return NextResponse.json({
//       message: `Document ${action === 'approve' ? 'approved' : 'rejected'} successfully`
//     });
//   } catch (error) {
//     console.error('Error processing document verification:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }

// // PUT - Update document (re-upload or admin edit)
// export async function PUT(request: NextRequest) {
//   try {
//     const admin = await verifyAdmin(request);
//     if (!admin) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const body = await request.json();
//     const { documentId, ...updateData } = body;

//     if (!documentId) {
//       return NextResponse.json(
//         { error: 'Document ID is required' },
//         { status: 400 }
//       );
//     }

//     const { db } = await connectToDatabase();
//     const documentsCollection = db.collection('documents');

//     updateData.updatedAt = new Date();
//     updateData.updatedBy = admin.email;

//     const result = await documentsCollection.updateOne(
//       { _id: new ObjectId(documentId) },
//       { $set: updateData }
//     );

//     if (result.matchedCount === 0) {
//       return NextResponse.json({ error: 'Document not found' }, { status: 404 });
//     }

//     return NextResponse.json({ message: 'Document updated successfully' });
//   } catch (error) {
//     console.error('Error updating document:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }

// // DELETE - Delete document
// export async function DELETE(request: NextRequest) {
//   try {
//     const admin = await verifyAdmin(request);
//     if (!admin) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const { searchParams } = new URL(request.url);
//     const documentId = searchParams.get('documentId');

//     if (!documentId) {
//       return NextResponse.json(
//         { error: 'Document ID is required' },
//         { status: 400 }
//       );
//     }

//     const { db } = await connectToDatabase();
//     const documentsCollection = db.collection('documents');

//     const result = await documentsCollection.deleteOne({ _id: new ObjectId(documentId) });

//     if (result.deletedCount === 0) {
//       return NextResponse.json({ error: 'Document not found' }, { status: 404 });
//     }

//     return NextResponse.json({ message: 'Document deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting document:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }