import { ObjectId } from 'mongodb';

// Admin User Schema
export interface AdminUser {
  _id?: ObjectId;
  email: string;
  password: string; // hashed
  name: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: string[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Bike Schema
export interface Bike {
  _id?: ObjectId;
  brand: string;
  model: string;
  year: number;
  cc: number;
  mileage: number;
  buyPrice: number;
  sellPrice: number;
  profit: number;
  description: string;
  images: string[];
  status: 'available' | 'sold' | 'reserved' | 'maintenance';
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  freeWash: boolean;
  repairs: {
    description: string;
    cost: number;
    date: Date;
  }[];
  partnerInvestments: {
    partnerId: ObjectId;
    amount: number;
    percentage: number;
  }[];
  listedDate: Date;
  soldDate?: Date;
  buyerInfo?: {
    name: string;
    phone: string;
    email: string;
    nid: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Transaction Schema
export interface Transaction {
  _id?: ObjectId;
  type: 'sale' | 'purchase' | 'cost' | 'partner_payout' | 'refund';
  amount: number;
  profit?: number;
  bikeId?: ObjectId;
  bikeName?: string;
  partnerId?: ObjectId;
  partnerName?: string;
  description: string;
  category?: 'repair' | 'maintenance' | 'marketing' | 'operational' | 'other';
  paymentMethod: 'cash' | 'bank_transfer' | 'mobile_banking' | 'card';
  reference?: string;
  status: 'completed' | 'pending' | 'failed';
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Cost Schema
export interface Cost {
  _id?: ObjectId;
  title: string;
  description: string;
  amount: number;
  category: 'repair' | 'maintenance' | 'marketing' | 'operational' | 'fuel' | 'insurance' | 'other';
  bikeId?: ObjectId;
  bikeName?: string;
  receipt?: string;
  vendor?: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'mobile_banking' | 'card';
  isRecurring: boolean;
  recurringPeriod?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextDueDate?: Date;
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Partner Schema
export interface Partner {
  _id?: ObjectId;
  name: string;
  email: string;
  phone: string;
  nid: string;
  address: string;
  totalInvestment: number;
  totalReturns: number;
  activeInvestments: number;
  pendingPayout: number;
  roi: number;
  joinDate: Date;
  status: 'active' | 'inactive' | 'suspended';
  bankDetails: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    branchName: string;
    routingNumber: string;
  };
  investments: {
    bikeId: ObjectId;
    amount: number;
    percentage: number;
    investmentDate: Date;
    returnAmount?: number;
    returnDate?: Date;
    status: 'active' | 'returned' | 'partial';
  }[];
  payouts: {
    amount: number;
    date: Date;
    method: string;
    reference: string;
    bikesSold: ObjectId[];
  }[];
  createdAt: Date;
  updatedAt: Date;
}

// Document Schema
export interface Document {
  _id?: ObjectId;
  userId: ObjectId;
  userName: string;
  userPhone: string;
  type: 'nid' | 'driving_license' | 'passport' | 'utility_bill' | 'bank_statement';
  documentNumber: string;
  frontImage: string;
  backImage?: string;
  status: 'pending' | 'verified' | 'rejected';
  verificationNotes?: string;
  rejectionReason?: string;
  verifiedBy?: ObjectId;
  verifiedAt?: Date;
  uploadDate: Date;
  expiryDate?: Date;
  extractedData?: {
    name?: string;
    fatherName?: string;
    motherName?: string;
    dateOfBirth?: Date;
    address?: string;
    bloodGroup?: string;
    [key: string]: any;
  };
  confidence?: number;
  flags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// BRTA Verification Schema
export interface BRTAVerification {
  _id?: ObjectId;
  registrationNumber: string;
  chassisNumber?: string;
  engineNumber?: string;
  ownerName: string;
  ownerNID: string;
  vehicleClass: string;
  makerName: string;
  modelName: string;
  yearOfManufacture: number;
  registrationDate: Date;
  fitnessExpiry: Date;
  taxTokenExpiry: Date;
  insuranceExpiry?: Date;
  status: 'active' | 'suspended' | 'cancelled';
  verificationDate: Date;
  verifiedBy: ObjectId;
  warnings: string[];
  errors: string[];
  rawResponse?: any;
  createdAt: Date;
  updatedAt: Date;
}

// Notification Schema
export interface Notification {
  _id?: ObjectId;
  userId?: ObjectId;
  adminId?: ObjectId;
  type: 'document_verified' | 'document_rejected' | 'bike_sold' | 'partner_payout' | 'system_alert';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// System Settings Schema
export interface SystemSettings {
  _id?: ObjectId;
  key: string;
  value: any;
  description?: string;
  category: 'general' | 'finance' | 'notifications' | 'integrations' | 'security';
  isPublic: boolean;
  lastModifiedBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Audit Log Schema
export interface AuditLog {
  _id?: ObjectId;
  userId: ObjectId;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: ObjectId;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  status: 'success' | 'failed';
  errorMessage?: string;
}

// Dashboard Analytics Schema
export interface DashboardAnalytics {
  _id?: ObjectId;
  date: Date;
  metrics: {
    totalProfit: number;
    totalRevenue: number;
    totalExpenses: number;
    bikesListed: number;
    bikesSold: number;
    documentsVerified: number;
    newPartners: number;
    activeUsers: number;
  };
  trends: {
    profitGrowth: number;
    salesGrowth: number;
    userGrowth: number;
  };
  createdAt: Date;
}

// Database Collections
export const Collections = {
  ADMINS: 'admins',
  BIKES: 'bikes',
  TRANSACTIONS: 'transactions',
  COSTS: 'costs',
  PARTNERS: 'partners',
  DOCUMENTS: 'documents',
  BRTA_VERIFICATIONS: 'brta_verifications',
  NOTIFICATIONS: 'notifications',
  SYSTEM_SETTINGS: 'system_settings',
  AUDIT_LOGS: 'audit_logs',
  DASHBOARD_ANALYTICS: 'dashboard_analytics',
  USERS: 'users'
} as const;

// Database Indexes
export const DatabaseIndexes = {
  [Collections.ADMINS]: [
    { email: 1 },
    { isActive: 1 },
    { role: 1 }
  ],
  [Collections.BIKES]: [
    { status: 1 },
    { brand: 1 },
    { year: 1 },
    { sellPrice: 1 },
    { listedDate: 1 },
    { soldDate: 1 },
    { 'partnerInvestments.partnerId': 1 }
  ],
  [Collections.TRANSACTIONS]: [
    { type: 1 },
    { createdAt: -1 },
    { bikeId: 1 },
    { partnerId: 1 },
    { status: 1 }
  ],
  [Collections.COSTS]: [
    { category: 1 },
    { createdAt: -1 },
    { bikeId: 1 },
    { isRecurring: 1 },
    { nextDueDate: 1 }
  ],
  [Collections.PARTNERS]: [
    { email: 1 },
    { status: 1 },
    { totalInvestment: -1 },
    { roi: -1 }
  ],
  [Collections.DOCUMENTS]: [
    { userId: 1 },
    { status: 1 },
    { type: 1 },
    { uploadDate: -1 },
    { verifiedAt: -1 }
  ],
  [Collections.BRTA_VERIFICATIONS]: [
    { registrationNumber: 1 },
    { verificationDate: -1 },
    { status: 1 }
  ],
  [Collections.NOTIFICATIONS]: [
    { userId: 1 },
    { adminId: 1 },
    { isRead: 1 },
    { createdAt: -1 },
    { priority: 1 }
  ],
  [Collections.AUDIT_LOGS]: [
    { userId: 1 },
    { timestamp: -1 },
    { action: 1 },
    { resource: 1 }
  ],
  [Collections.DASHBOARD_ANALYTICS]: [
    { date: -1 }
  ]
};

// Validation Schemas
export const ValidationSchemas = {
  createBike: {
    brand: { required: true, type: 'string', minLength: 2 },
    model: { required: true, type: 'string', minLength: 1 },
    year: { required: true, type: 'number', min: 1990, max: new Date().getFullYear() + 1 },
    cc: { required: true, type: 'number', min: 50 },
    mileage: { required: true, type: 'number', min: 0 },
    buyPrice: { required: true, type: 'number', min: 0 },
    sellPrice: { required: true, type: 'number', min: 0 },
    description: { required: false, type: 'string', maxLength: 1000 },
    condition: { required: true, type: 'string', enum: ['excellent', 'good', 'fair', 'poor'] }
  },
  createPartner: {
    name: { required: true, type: 'string', minLength: 2 },
    email: { required: true, type: 'email' },
    phone: { required: true, type: 'string', pattern: /^[0-9+\-\s()]+$/ },
    nid: { required: true, type: 'string', minLength: 10 },
    address: { required: true, type: 'string', minLength: 10 }
  },
  verifyDocument: {
    status: { required: true, type: 'string', enum: ['verified', 'rejected'] },
    verificationNotes: { required: false, type: 'string', maxLength: 500 },
    rejectionReason: { required: false, type: 'string', maxLength: 200 }
  }
};

// Helper Functions
export const ModelHelpers = {
  calculateBikeProfit: (bike: Partial<Bike>): number => {
    if (!bike.sellPrice || !bike.buyPrice) return 0;
    const repairCosts = bike.repairs?.reduce((sum, repair) => sum + repair.cost, 0) || 0;
    return bike.sellPrice - bike.buyPrice - repairCosts;
  },
  
  calculatePartnerROI: (partner: Partner): number => {
    if (partner.totalInvestment === 0) return 0;
    return ((partner.totalReturns / partner.totalInvestment) - 1) * 100;
  },
  
  generateDocumentNumber: (type: string): string => {
    const prefix = type.toUpperCase().substring(0, 3);
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  },
  
  formatCurrency: (amount: number): string => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  },
  
  calculateDaysListed: (listedDate: Date): number => {
    return Math.floor((Date.now() - listedDate.getTime()) / (1000 * 60 * 60 * 24));
  }
};

export default {
  Collections,
  DatabaseIndexes,
  ValidationSchemas,
  ModelHelpers
};