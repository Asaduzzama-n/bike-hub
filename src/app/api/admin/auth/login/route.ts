// import { NextRequest, NextResponse } from 'next/server';
// import bcrypt from 'bcryptjs';
// import { SignJWT } from 'jose';
// import { connectToDatabase } from '@/lib/mongodb';

// const JWT_SECRET = new TextEncoder().encode(
//   process.env.JWT_SECRET || 'your-secret-key'
// );

// export async function POST(request: NextRequest) {
//   try {
//     const { email, password } = await request.json();

//     if (!email || !password) {
//       return NextResponse.json(
//         { message: 'Email and password are required' },
//         { status: 400 }
//       );
//     }

//     // Connect to database
//     const { db } = await connectToDatabase();
    
//     // Find admin user
//     const admin = await db.collection('admins').findOne({ email });
    
//     if (!admin) {
//       return NextResponse.json(
//         { message: 'Invalid credentials' },
//         { status: 401 }
//       );
//     }

//     // Verify password
//     const isValidPassword = await bcrypt.compare(password, admin.passwordHash);
    
//     if (!isValidPassword) {
//       return NextResponse.json(
//         { message: 'Invalid credentials' },
//         { status: 401 }
//       );
//     }

//     // Create JWT token
//     const token = await new SignJWT({ 
//       adminId: admin._id.toString(),
//       email: admin.email,
//       role: admin.role || 'admin'
//     })
//       .setProtectedHeader({ alg: 'HS256' })
//       .setIssuedAt()
//       .setExpirationTime('24h')
//       .sign(JWT_SECRET);

//     // Create response with token
//     const response = NextResponse.json(
//       { 
//         message: 'Login successful',
//         token,
//         admin: {
//           id: admin._id.toString(),
//           email: admin.email,
//           name: admin.name,
//           role: admin.role || 'admin'
//         }
//       },
//       { status: 200 }
//     );

//     // Set HTTP-only cookie
//     response.cookies.set('adminToken', token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'strict',
//       maxAge: 24 * 60 * 60, // 24 hours
//       path: '/'
//     });

//     return response;
//   } catch (error) {
//     console.error('Login error:', error);
//     return NextResponse.json(
//       { message: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }