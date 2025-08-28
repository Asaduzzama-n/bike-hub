// Export validation middleware
export { default as validateRequest, withValidation } from './nextValidateRequest';
export { default as handleZodError } from './handleZodError';

// Export validation schemas
export * from '../validations/partner';
export * from '../validations/auth';

// Export error interfaces
export type { IGenericErrorMessage, IGenericErrorResponse } from '../interfaces/error';