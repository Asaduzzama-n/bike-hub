# Zod Validation Middleware for Next.js

This directory contains Zod validation middleware for Next.js API routes, providing robust input validation and error handling.

## Files Overview

### Core Middleware Files

- **`validateRequest.ts`** - Express-compatible validation middleware (for reference)
- **`nextValidateRequest.ts`** - Next.js-compatible validation middleware
- **`handleZodError.ts`** - Zod error handler for consistent error responses

### Supporting Files

- **`../interfaces/error.ts`** - Error interface definitions
- **`../validations/partner.ts`** - Example validation schemas for partner operations

## Usage

### 1. Basic Usage with `withValidation`

```typescript
import { withValidation } from '@/lib/middleware/nextValidateRequest';
import { createPartnerSchema } from '@/lib/validations/partner';

export const POST = withValidation(
  createPartnerSchema,
  async (request: NextRequest) => {
    // Your validated route handler logic here
    const body = await request.json();
    // body is now validated according to createPartnerSchema
  }
);
```

### 2. Manual Validation

```typescript
import { validateRequest } from '@/lib/middleware/nextValidateRequest';
import { createPartnerSchema } from '@/lib/validations/partner';

export async function POST(request: NextRequest) {
  // Validate request
  const validationError = await validateRequest(createPartnerSchema)(request);
  
  if (validationError) {
    return validationError; // Returns formatted error response
  }
  
  // Continue with validated data
  const body = await request.json();
  // Process validated data...
}
```

## Creating Validation Schemas

### Schema Structure

All validation schemas should follow this structure:

```typescript
import { z } from 'zod';

export const yourSchema = z.object({
  body: z.object({
    // Request body validation
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email format'),
  }),
  query: z.object({
    // Query parameters validation
    page: z.string().transform(val => parseInt(val)).pipe(z.number().min(1)).optional(),
  }).optional(),
  params: z.object({
    // Route parameters validation
    id: z.string().min(1, 'ID is required'),
  }).optional(),
  cookies: z.object({
    // Cookies validation
  }).optional(),
});
```

### Example Schemas

#### Partner Creation

```typescript
export const createPartnerSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    email: z.string().email('Invalid email format'),
    phone: z.string().min(10, 'Phone must be at least 10 digits'),
    status: z.enum(['active', 'inactive', 'suspended']).optional().default('active'),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
  cookies: z.object({}).optional(),
});
```

#### Partner Update

```typescript
export const updatePartnerSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(10).max(15).optional(),
    status: z.enum(['active', 'inactive', 'suspended']).optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Partner ID is required'),
  }),
  query: z.object({}).optional(),
  cookies: z.object({}).optional(),
});
```

## Error Handling

The middleware automatically handles validation errors and returns consistent error responses:

```json
{
  "success": false,
  "message": "Validation Error",
  "errors": [
    {
      "path": "email",
      "message": "Invalid email format"
    },
    {
      "path": "name",
      "message": "Name is required"
    }
  ]
}
```

## API Route Examples

### Complete API Route with Validation

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withValidation } from '@/lib/middleware/nextValidateRequest';
import { createPartnerSchema } from '@/lib/validations/partner';
import { connectToDatabase } from '@/lib/mongodb';

export const POST = withValidation(
  createPartnerSchema,
  async (request: NextRequest) => {
    try {
      const { db } = await connectToDatabase();
      const body = await request.json();
      
      // Data is already validated by middleware
      const result = await db.collection('partners').insertOne({
        ...body,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return NextResponse.json({
        success: true,
        data: { partnerId: result.insertedId }
      }, { status: 201 });
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: 'Failed to create partner'
      }, { status: 500 });
    }
  }
);
```

### Dynamic Route with Parameters

```typescript
export const PUT = withValidation(
  updatePartnerSchema,
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    // params.id is validated by the schema
    const body = await request.json();
    // body is validated by the schema
    
    // Your update logic here...
  }
);
```

## Best Practices

1. **Always validate input data** - Use validation schemas for all API routes that accept user input

2. **Use specific error messages** - Provide clear, actionable error messages in your schemas

3. **Validate all input sources** - Include validation for body, query, params, and cookies as needed

4. **Use transformations** - Leverage Zod's transform capabilities for data type conversions

5. **Group related schemas** - Organize validation schemas by feature/domain (e.g., partner.ts, bike.ts)

6. **Handle edge cases** - Consider optional fields, default values, and edge cases in your schemas

## Integration with Existing Code

To integrate with existing API routes:

1. Create validation schemas in `/lib/validations/`
2. Import `withValidation` from the middleware
3. Wrap your route handlers with `withValidation`
4. Remove manual validation code from your handlers

The middleware will automatically handle validation and return appropriate error responses, making your API routes cleaner and more consistent.