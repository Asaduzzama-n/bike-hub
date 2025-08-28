import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

// Admin User Schema
export interface IAdminUser {
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

const AdminUserSchema = new mongoose.Schema<IAdminUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'moderator'],
    default: 'admin'
  },
  permissions: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Bike Schema
export interface IBike {
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
  documents: {
    type: string;
    url: string;
  }[];
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

const BikeSchema = new mongoose.Schema<IBike>({
  brand: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 1990,
    max: new Date().getFullYear() + 1
  },
  cc: {
    type: Number,
    required: true,
    min: 50
  },
  mileage: {
    type: Number,
    required: true,
    min: 0
  },
  buyPrice: {
    type: Number,
    required: true,
    min: 0
  },
  sellPrice: {
    type: Number,
    required: true,
    min: 0
  },
  profit: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  images: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['available', 'sold', 'reserved', 'maintenance'],
    default: 'available'
  },
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    required: true
  },
  freeWash: {
    type: Boolean,
    default: false
  },
  documents: [{
    type: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  }],
  repairs: [{
    description: {
      type: String,
      required: true
    },
    cost: {
      type: Number,
      required: true,
      min: 0
    },
    date: {
      type: Date,
      required: true
    }
  }],
  partnerInvestments: [{
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partner',
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    }
  }],
  listedDate: {
    type: Date,
    default: Date.now
  },
  soldDate: {
    type: Date
  },
  buyerInfo: {
    name: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      lowercase: true,
      trim: true
    },
    nid: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: true
});

// Calculate profit before saving
BikeSchema.pre('save', function(next) {
  const repairCosts = this.repairs.reduce((sum, repair) => sum + repair.cost, 0);
  this.profit = this.sellPrice - this.buyPrice - repairCosts;
  next();
});

// Transaction Schema
export interface ITransaction {
  _id?: ObjectId;
  type: 'sale' | 'purchase' | 'cost' | 'partner_payout' | 'refund';
  amount: number;
  profit?: number;
  bikeId?: ObjectId;
  partnerId?: ObjectId;
  description?: string;
  category?: 'repair' | 'maintenance' | 'marketing' | 'operational' | 'other';
  paymentMethod: 'cash' | 'bank_transfer' | 'mobile_banking' | 'card';
  reference?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new mongoose.Schema<ITransaction>({
  type: {
    type: String,
    enum: ['sale', 'purchase', 'cost', 'partner_payout', 'refund'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  profit: {
    type: Number
  },
  bikeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bike'
  },
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partner'
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['repair', 'maintenance', 'marketing', 'operational', 'other']
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'mobile_banking', 'card'],
    required: true
  },
  reference: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Cost Schema
export interface ICost {
  _id?: ObjectId;
  description: string;
  amount: number;
  category: 'repair' | 'maintenance' | 'marketing' | 'operational' | 'fuel' | 'insurance' | 'other';
  bikeId?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CostSchema = new mongoose.Schema<ICost>({
  description: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    enum: ['repair', 'maintenance', 'marketing', 'operational', 'fuel', 'insurance', 'other'],
    required: true
  },
  bikeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bike'
  }
}, {
  timestamps: true
});

// Partner Schema
export interface IPartner {
  _id?: ObjectId;
  name: string;
  email: string;
  phone: string;
  nid?: string;
  address?: string;
  totalInvestment?: number;
  totalReturns?: number;
  activeInvestments?: number;
  pendingPayout: number;
  roi?: number;
  status?: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

const PartnerSchema = new mongoose.Schema<IPartner>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  nid: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  totalInvestment: {
    type: Number,
    default: 0,
    min: 0
  },
  totalReturns: {
    type: Number,
    default: 0,
    min: 0
  },
  activeInvestments: {
    type: Number,
    default: 0,
    min: 0
  },
  pendingPayout: {
    type: Number,
    default: 0,
    min: 0
  },
  roi: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Investment Schema
export interface IInvestment {
  _id?: ObjectId;
  partnerId: ObjectId;
  bikeId: ObjectId;
  amount: number;
  percentage: number;
  investmentDate: Date;
  returnAmount?: number;
  returnDate?: Date;
}

const InvestmentSchema = new mongoose.Schema<IInvestment>({
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partner',
    required: true
  },
  bikeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bike',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  investmentDate: {
    type: Date,
    default: Date.now
  },
  returnAmount: {
    type: Number,
    min: 0
  },
  returnDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Dashboard Analytics Schema
export interface IDashboardAnalytics {
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

const DashboardAnalyticsSchema = new mongoose.Schema<IDashboardAnalytics>({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  metrics: {
    totalProfit: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    totalExpenses: {
      type: Number,
      default: 0
    },
    bikesListed: {
      type: Number,
      default: 0
    },
    bikesSold: {
      type: Number,
      default: 0
    },
    documentsVerified: {
      type: Number,
      default: 0
    },
    newPartners: {
      type: Number,
      default: 0
    },
    activeUsers: {
      type: Number,
      default: 0
    }
  },
  trends: {
    profitGrowth: {
      type: Number,
      default: 0
    },
    salesGrowth: {
      type: Number,
      default: 0
    },
    userGrowth: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Create Models
export const AdminUser = mongoose.models.AdminUser || mongoose.model<IAdminUser>('AdminUser', AdminUserSchema);
export const Bike = mongoose.models.Bike || mongoose.model<IBike>('Bike', BikeSchema);
export const Transaction = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);
export const Cost = mongoose.models.Cost || mongoose.model<ICost>('Cost', CostSchema);
export const Partner = mongoose.models.Partner || mongoose.model<IPartner>('Partner', PartnerSchema);
export const Investment = mongoose.models.Investment || mongoose.model<IInvestment>('Investment', InvestmentSchema);
export const DashboardAnalytics = mongoose.models.DashboardAnalytics || mongoose.model<IDashboardAnalytics>('DashboardAnalytics', DashboardAnalyticsSchema);

// Database Collections
export const Collections = {
  ADMINS: 'adminusers',
  BIKES: 'bikes',
  TRANSACTIONS: 'transactions',
  COSTS: 'costs',
  INVESTMENTS: 'investments',
  PARTNERS: 'partners',
  REVIEWS: 'reviews',
  SELL_RECORDS: 'sell_records',
  DASHBOARD_ANALYTICS: 'dashboardanalytics',
} as const;

// Helper Functions
export const ModelHelpers = {
  calculateBikeProfit: (bike: Partial<IBike>): number => {
    if (!bike.sellPrice || !bike.buyPrice) return 0;
    const repairCosts = bike.repairs?.reduce((sum, repair) => sum + repair.cost, 0) || 0;
    return bike.sellPrice - bike.buyPrice - repairCosts;
  },
  
  calculatePartnerROI: (partner: IPartner): number => {
    if (!partner.totalInvestment || partner.totalInvestment === 0) return 0;
    return ((partner.totalReturns! / partner.totalInvestment) - 1) * 100;
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
  AdminUser,
  Bike,
  Transaction,
  Cost,
  Partner,
  Investment,
  DashboardAnalytics,
  Collections,
  ModelHelpers
};