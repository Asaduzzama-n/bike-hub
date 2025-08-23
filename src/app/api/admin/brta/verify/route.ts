import { NextRequest, NextResponse } from 'next/server';
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

// Mock BRTA API integration - In production, this would connect to actual BRTA API
const mockBrtaDatabase = {
  'DHAKA-A-123456': {
    registrationNumber: 'DHAKA-A-123456',
    ownerName: 'John Doe',
    vehicleClass: 'Motorcycle',
    engineNumber: 'ABC123456',
    chassisNumber: 'XYZ789012',
    registrationDate: '2020-05-15',
    expiryDate: '2025-05-14',
    status: 'Active',
    taxPaid: true,
    fitnessValid: true,
    model: 'Honda CBR 150R',
    year: 2020,
    cc: 150
  },
  'DHAKA-B-789012': {
    registrationNumber: 'DHAKA-B-789012',
    ownerName: 'Sarah Johnson',
    vehicleClass: 'Motorcycle',
    engineNumber: 'DEF456789',
    chassisNumber: 'UVW345678',
    registrationDate: '2019-03-20',
    expiryDate: '2024-03-19',
    status: 'Expired',
    taxPaid: false,
    fitnessValid: false,
    model: 'Yamaha FZ-S',
    year: 2019,
    cc: 149
  },
  'CHITTAGONG-C-456789': {
    registrationNumber: 'CHITTAGONG-C-456789',
    ownerName: 'Mike Wilson',
    vehicleClass: 'Motorcycle',
    engineNumber: 'GHI789012',
    chassisNumber: 'RST901234',
    registrationDate: '2021-08-10',
    expiryDate: '2026-08-09',
    status: 'Active',
    taxPaid: true,
    fitnessValid: true,
    model: 'Suzuki Gixxer',
    year: 2021,
    cc: 155
  }
};

// POST - Verify vehicle registration with BRTA
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { registrationNumber } = body;

    if (!registrationNumber) {
      return NextResponse.json(
        { error: 'Registration number is required' },
        { status: 400 }
      );
    }

    // Validate registration number format
    const registrationPattern = /^[A-Z]+-[A-Z]-\d+$/;
    if (!registrationPattern.test(registrationNumber)) {
      return NextResponse.json(
        { error: 'Invalid registration number format' },
        { status: 400 }
      );
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Check mock database
    const vehicleData = mockBrtaDatabase[registrationNumber as keyof typeof mockBrtaDatabase];
    
    if (!vehicleData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Vehicle not found in BRTA database',
          registrationNumber
        },
        { status: 404 }
      );
    }

    // Check if registration is expired
    const expiryDate = new Date(vehicleData.expiryDate);
    const currentDate = new Date();
    const isExpired = expiryDate < currentDate;

    // Calculate days until expiry or days since expiry
    const timeDiff = expiryDate.getTime() - currentDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    const response = {
      success: true,
      data: {
        ...vehicleData,
        isExpired,
        daysUntilExpiry: daysDiff > 0 ? daysDiff : null,
        daysSinceExpiry: daysDiff < 0 ? Math.abs(daysDiff) : null,
        verificationDate: new Date().toISOString(),
        verifiedBy: admin.email
      },
      warnings: [],
      errors: []
    };

    // Add warnings and errors
    if (isExpired) {
      response.errors.push('Vehicle registration has expired');
    } else if (daysDiff <= 30) {
      response.warnings.push(`Registration expires in ${daysDiff} days`);
    }

    if (!vehicleData.taxPaid) {
      response.errors.push('Vehicle tax is not paid');
    }

    if (!vehicleData.fitnessValid) {
      response.errors.push('Vehicle fitness certificate is not valid');
    }

    if (vehicleData.status !== 'Active') {
      response.errors.push(`Vehicle status is ${vehicleData.status}`);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error verifying BRTA registration:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error during BRTA verification'
      },
      { status: 500 }
    );
  }
}

// GET - Get BRTA verification history
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // In a real application, this would fetch from a verification history database
    const mockHistory = [
      {
        id: '1',
        registrationNumber: 'DHAKA-A-123456',
        verificationDate: '2024-01-28T10:30:00Z',
        verifiedBy: admin.email,
        status: 'verified',
        result: 'Active vehicle, all documents valid'
      },
      {
        id: '2',
        registrationNumber: 'DHAKA-B-789012',
        verificationDate: '2024-01-27T14:15:00Z',
        verifiedBy: admin.email,
        status: 'expired',
        result: 'Registration expired, tax not paid'
      },
      {
        id: '3',
        registrationNumber: 'INVALID-123',
        verificationDate: '2024-01-26T09:45:00Z',
        verifiedBy: admin.email,
        status: 'not_found',
        result: 'Vehicle not found in BRTA database'
      }
    ];

    const total = mockHistory.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedHistory = mockHistory.slice(startIndex, endIndex);

    return NextResponse.json({
      history: paginatedHistory,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        totalVerifications: total,
        successfulVerifications: mockHistory.filter(h => h.status === 'verified').length,
        expiredVehicles: mockHistory.filter(h => h.status === 'expired').length,
        notFoundVehicles: mockHistory.filter(h => h.status === 'not_found').length
      }
    });
  } catch (error) {
    console.error('Error fetching BRTA verification history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update BRTA integration settings
export async function PUT(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { apiEndpoint, apiKey, timeout, retryAttempts } = body;

    // In a real application, this would update BRTA integration settings
    const settings = {
      apiEndpoint: apiEndpoint || process.env.BRTA_API_ENDPOINT,
      timeout: timeout || 30000,
      retryAttempts: retryAttempts || 3,
      lastUpdated: new Date().toISOString(),
      updatedBy: admin.email
    };

    // Note: In production, never return API keys in response
    return NextResponse.json({
      message: 'BRTA integration settings updated successfully',
      settings: {
        ...settings,
        apiKey: apiKey ? '***masked***' : undefined
      }
    });
  } catch (error) {
    console.error('Error updating BRTA settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}