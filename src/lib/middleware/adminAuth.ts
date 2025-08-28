import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { connectToDatabase } from '@/lib/mongodb';
import { AdminUser } from '@/lib/models';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret'
);

export interface AdminAuthRequest extends NextRequest {
  admin?: {
    userId: string;
    email: string;
    role: string;
    permissions: string[];
  };
}

export function withAdminAuth<T extends any[]>(
  handler: (request: AdminAuthRequest, ...args: T) => Promise<NextResponse>,
  options: { optional?: boolean } = {}
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      // Get token from cookie or Authorization header
      const token = request.cookies.get('auth-token')?.value ||
                    request.cookies.get('adminToken')?.value ||
                    request.headers.get('authorization')?.replace('Bearer ', '');

      if (!token) {
        if (options.optional) {
          // For optional auth, continue without admin context
          const adminRequest = request as AdminAuthRequest;
          return await handler(adminRequest, ...args);
        }
        return NextResponse.json(
          { success: false, message: 'Access denied. No token provided.' },
          { status: 401 }
        );
      }

      // Verify JWT token
      const { payload } = await jwtVerify(token, JWT_SECRET);
      
      if (!payload.userId || !payload.email) {
        return NextResponse.json(
          { success: false, message: 'Invalid token format.' },
          { status: 401 }
        );
      }

      // Connect to database and verify admin exists and is active
      await connectToDatabase();
      const admin = await AdminUser.findById(payload.userId);
      
      if (!admin || !admin.isActive) {
        return NextResponse.json(
          { success: false, message: 'Admin account not found or inactive.' },
          { status: 401 }
        );
      }

      // Add admin info to request
      const adminRequest = request as AdminAuthRequest;
      adminRequest.admin = {
        userId: payload.userId as string,
        email: payload.email as string,
        role: payload.role as string,
        permissions: payload.permissions as string[]
      };

      // Call the original handler with admin context
      return await handler(adminRequest, ...args);
      
    } catch (error) {
      console.error('Admin authentication error:', error);
      if (options.optional) {
        // For optional auth, continue without admin context on token error
        const adminRequest = request as AdminAuthRequest;
        return await handler(adminRequest, ...args);
      }
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token.' },
        { status: 401 }
      );
    }
  };
}

// Helper function to check specific permissions
export function requirePermission(permission: string) {
  return function<T extends any[]>(
    handler: (request: AdminAuthRequest, ...args: T) => Promise<NextResponse>
  ) {
    return withAdminAuth(async (request: AdminAuthRequest, ...args: T) => {
      if (!request.admin?.permissions.includes(permission) && 
          request.admin?.role !== 'super_admin') {
        return NextResponse.json(
          { success: false, message: 'Insufficient permissions.' },
          { status: 403 }
        );
      }
      
      return await handler(request, ...args);
    });
  };
}

// Helper function to check admin role
export function requireRole(roles: string | string[]) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  return function<T extends any[]>(
    handler: (request: AdminAuthRequest, ...args: T) => Promise<NextResponse>
  ) {
    return withAdminAuth(async (request: AdminAuthRequest, ...args: T) => {
      if (!allowedRoles.includes(request.admin?.role || '')) {
        return NextResponse.json(
          { success: false, message: 'Insufficient role privileges.' },
          { status: 403 }
        );
      }
      
      return await handler(request, ...args);
    });
  };
}