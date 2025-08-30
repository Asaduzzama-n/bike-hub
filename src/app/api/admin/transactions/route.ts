import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Transaction } from '@/lib/models';
import { withValidation } from '@/lib/middleware';
import { withAdminAuth, AdminAuthRequest } from '@/lib/middleware/adminAuth';
import { getTransactionsSchema, createTransactionSchema } from '@/lib/validations/transaction';

// GET /api/admin/transactions - Get all transactions (admin only)
export const GET = withAdminAuth(
  withValidation(
    getTransactionsSchema,
    async (request: AdminAuthRequest, validatedData: any) => {
      try {
        await connectToDatabase();
        
        const { 
          page = 1, 
          limit = 20, 
          type, 
          startDate, 
          endDate,
          sortBy = 'createdAt',
          sortOrder = 'desc'
        } = validatedData.query || {};
        
        const skip = (page - 1) * limit;
        
        // Build filter
        const filter: any = {};
        
        if (type) {
          filter.type = type;
        }
        
        if (startDate || endDate) {
          filter.createdAt = {};
          if (startDate) filter.createdAt.$gte = new Date(startDate);
          if (endDate) filter.createdAt.$lte = new Date(endDate);
        }
        
        // Build sort object
        const sort: any = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
        
        // Get transactions with pagination
        const [transactions, total] = await Promise.all([
          Transaction.find(filter)
            .populate('bikeId', 'brand model year')
            .populate('partnerId', 'name email')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),
          Transaction.countDocuments(filter)
        ]);
        
        const totalPages = Math.ceil(total / limit);
        
        return NextResponse.json({
          success: true,
          data: {
            transactions,
            pagination: {
              currentPage: page,
              totalPages,
              totalItems: total,
              itemsPerPage: limit,
              hasNextPage: page < totalPages,
              hasPrevPage: page > 1
            }
          }
        });
      } catch (error) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json(
          { success: false, message: 'Failed to fetch transactions' },
          { status: 500 }
        );
      }
    }
  )
);

// POST /api/admin/transactions - Create new transaction (admin only)
export const POST = withAdminAuth(
  withValidation(
    createTransactionSchema,
    async (request: AdminAuthRequest, validatedData: any) => {
      try {
        await connectToDatabase();
        const transactionData = validatedData.body;
        
        // Create new transaction
        const newTransaction = new Transaction(transactionData);
        const savedTransaction = await newTransaction.save();
        
        return NextResponse.json({
          success: true,
          message: 'Transaction created successfully',
          data: savedTransaction
        }, { status: 201 });
      } catch (error) {
        console.error('Error creating transaction:', error);
        
        if (error instanceof Error && error.name === 'ValidationError') {
          return NextResponse.json(
            { success: false, message: 'Validation error', error: error.message },
            { status: 400 }
          );
        }
        
        return NextResponse.json(
          { success: false, message: 'Failed to create transaction' },
          { status: 500 }
        );
      }
    }
  )
);