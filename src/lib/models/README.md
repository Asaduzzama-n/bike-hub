# Mongoose Models Documentation

This directory contains all Mongoose models and schemas for the Bike Hub application. The models are properly structured with TypeScript interfaces and Mongoose schemas for type safety and database validation.

## Overview

The application uses MongoDB with Mongoose ODM for database operations. All models are centralized in the `index.ts` file for easy importing and management.

## Models

### 1. AdminUser
**Interface:** `IAdminUser`  
**Model:** `AdminUser`  
**Collection:** `adminusers`

Manages admin users with role-based permissions.

```typescript
interface IAdminUser {
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
```

**Features:**
- Unique email validation
- Automatic timestamps
- Role-based access control
- Password hashing (handled in application layer)

### 2. Bike
**Interface:** `IBike`  
**Model:** `Bike`  
**Collection:** `bikes`

Manages bike inventory with detailed specifications and status tracking.

```typescript
interface IBike {
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
  documents: { type: string; url: string; }[];
  repairs: { description: string; cost: number; date: Date; }[];
  partnerInvestments: { partnerId: ObjectId; amount: number; percentage: number; }[];
  listedDate: Date;
  soldDate?: Date;
  buyerInfo?: { name: string; phone: string; email: string; nid: string; };
  createdAt: Date;
  updatedAt: Date;
}
```

**Features:**
- Automatic profit calculation (pre-save hook)
- Partner investment tracking
- Document and repair history
- Status and condition validation

### 3. Partner
**Interface:** `IPartner`  
**Model:** `Partner`  
**Collection:** `partners`

Manages business partners and their investments.

```typescript
interface IPartner {
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
```

**Features:**
- Unique email validation
- Investment tracking
- ROI calculation
- Status management

### 4. Investment
**Interface:** `IInvestment`  
**Model:** `Investment`  
**Collection:** `investments`

Tracks individual investments by partners in specific bikes.

```typescript
interface IInvestment {
  _id?: ObjectId;
  partnerId: ObjectId;
  bikeId: ObjectId;
  amount: number;
  percentage: number;
  investmentDate: Date;
  returnAmount?: number;
  returnDate?: Date;
}
```

**Features:**
- References to Partner and Bike models
- Investment and return tracking
- Percentage-based profit sharing

### 5. Transaction
**Interface:** `ITransaction`  
**Model:** `Transaction`  
**Collection:** `transactions`

Records all financial transactions in the system.

```typescript
interface ITransaction {
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
```

### 6. Cost
**Interface:** `ICost`  
**Model:** `Cost`  
**Collection:** `costs`

Tracks business expenses and costs.

```typescript
interface ICost {
  _id?: ObjectId;
  description: string;
  amount: number;
  category: 'repair' | 'maintenance' | 'marketing' | 'operational' | 'fuel' | 'insurance' | 'other';
  bikeId?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

### 7. DashboardAnalytics
**Interface:** `IDashboardAnalytics`  
**Model:** `DashboardAnalytics`  
**Collection:** `dashboardanalytics`

Stores daily analytics and metrics for dashboard reporting.

## Usage Examples

### Importing Models

```typescript
// Import specific models
import { Partner, Bike, AdminUser } from '@/lib/models';

// Import all models
import Models from '@/lib/models';
const { Partner, Bike } = Models;
```

### Creating Documents

```typescript
// Create a new partner
const newPartner = new Partner({
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  nid: '1234567890',
  address: '123 Main St'
});

const savedPartner = await newPartner.save();
```

### Querying Documents

```typescript
// Find partners with pagination
const partners = await Partner
  .find({ status: 'active' })
  .sort({ createdAt: -1 })
  .skip(0)
  .limit(10)
  .lean();

// Find partner by ID
const partner = await Partner.findById(partnerId);

// Find with population
const investments = await Investment
  .find({ partnerId })
  .populate('bikeId', 'brand model year')
  .populate('partnerId', 'name email');
```

### Updating Documents

```typescript
// Update partner
const updatedPartner = await Partner.findByIdAndUpdate(
  partnerId,
  { status: 'inactive' },
  { new: true, runValidators: true }
);

// Update with validation
partner.totalInvestment += 1000;
await partner.save();
```

### Deleting Documents

```typescript
// Delete partner
const deletedPartner = await Partner.findByIdAndDelete(partnerId);

// Soft delete (update status)
await Partner.findByIdAndUpdate(partnerId, { status: 'inactive' });
```

## Helper Functions

The `ModelHelpers` object provides utility functions:

```typescript
import { ModelHelpers } from '@/lib/models';

// Calculate bike profit
const profit = ModelHelpers.calculateBikeProfit(bike);

// Calculate partner ROI
const roi = ModelHelpers.calculatePartnerROI(partner);

// Generate document number
const docNumber = ModelHelpers.generateDocumentNumber('INV');

// Format currency
const formatted = ModelHelpers.formatCurrency(1000); // "৳1,000"

// Calculate days listed
const days = ModelHelpers.calculateDaysListed(bike.listedDate);
```

## Database Connection

Ensure you connect to the database before using models:

```typescript
import { connectToDatabase } from '@/lib/mongodb';

// In API routes
export async function GET() {
  await connectToDatabase();
  const partners = await Partner.find();
  // ...
}
```

## Validation

All models include built-in validation:

- **Required fields**: Enforced at schema level
- **Unique constraints**: Email uniqueness for AdminUser and Partner
- **Enum validation**: Status, role, and category fields
- **Number ranges**: Min/max values for numeric fields
- **String formatting**: Trim, lowercase for emails

## Best Practices

1. **Always use `.lean()`** for read-only operations to improve performance
2. **Use population** for related data instead of manual joins
3. **Validate data** using Zod schemas before saving to database
4. **Handle errors** appropriately in try-catch blocks
5. **Use transactions** for operations affecting multiple collections
6. **Index frequently queried fields** for better performance

## Migration from Old Models

If migrating from the old interface-based models in `admin.ts`:

1. Replace imports:
   ```typescript
   // Old
   import { Partner } from '@/lib/models/admin';
   
   // New
   import { Partner } from '@/lib/models';
   ```

2. Update database operations:
   ```typescript
   // Old (native MongoDB)
   const partner = await db.collection('partners').findOne({ _id });
   
   // New (Mongoose)
   const partner = await Partner.findById(_id);
   ```

3. Use Mongoose methods instead of native MongoDB operations
4. Update validation to use Mongoose schema validation

## Environment Variables

Ensure these environment variables are set:

```env
MONGODB_URI=mongodb://localhost:27017/bikehub
JWT_SECRET=your-secret-key
```

## Related Files

- **Database Connection**: `src/lib/mongodb.ts`
- **Validation Schemas**: `src/lib/validations/`
- **API Routes**: `src/app/api/admin/`
- **Middleware**: `src/lib/middleware/`