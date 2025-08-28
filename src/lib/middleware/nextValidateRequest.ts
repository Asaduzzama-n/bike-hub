import { NextRequest, NextResponse } from 'next/server';
import { ZodError, ZodSchema } from 'zod';
import handleZodError from './handleZodError';

// Next.js compatible validation middleware
export const validateRequest = 
  (schema: ZodSchema) =>
  async (request: NextRequest): Promise<NextResponse | null> => {
    try {
      const body = await request.json().catch(() => ({}));
      const url = new URL(request.url);
      const query = Object.fromEntries(url.searchParams.entries());
      
      await schema.parseAsync({
        body,
        query,
        params: {}, // Next.js params would be passed separately
        cookies: Object.fromEntries(
          request.cookies.getAll().map(cookie => [cookie.name, cookie.value])
        ),
      });
      
      return null; // Validation passed
    } catch (error) {
      if (error instanceof ZodError) {
        const errorResponse = handleZodError(error);
        return NextResponse.json(
          {
            success: false,
            message: errorResponse.message,
            errors: errorResponse.errorMessages,
          },
          { status: errorResponse.statusCode }
        );
      }
      
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 400 }
      );
    }
  };

// Higher-order function to wrap API route handlers with validation
export const withValidation = 
  <T extends any[]>(
    schema: ZodSchema,
    handler: (request: NextRequest, validatedData: any, ...args: T) => Promise<NextResponse>
  ) =>
  async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      const body = await request.json().catch(() => ({}));
      const url = new URL(request.url);
      const query = Object.fromEntries(url.searchParams.entries());
      
      // Extract params from the route context (args[0] should contain { params })
      const routeContext = args[0] as { params?: Record<string, string> };
      const params = routeContext?.params || {};
      
      const validatedData = await schema.parseAsync({
        body,
        query,
        params,
        cookies: Object.fromEntries(
          request.cookies.getAll().map(cookie => [cookie.name, cookie.value])
        ),
      });
      
      return handler(request, validatedData, ...args);
    } catch (error) {
      if (error instanceof ZodError) {
        const errorResponse = handleZodError(error);
        return NextResponse.json(
          {
            success: false,
            message: errorResponse.message,
            errors: errorResponse.errorMessages,
          },
          { status: errorResponse.statusCode }
        );
      }
      
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 400 }
      );
    }
  };

export default validateRequest;