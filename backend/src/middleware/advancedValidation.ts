import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { logger } from '../utils/logger';

/**
 * Zod validation middleware factory
 */
export function validateSchema(schema: {
  body?: z.ZodSchema;
  query?: z.ZodSchema;
  params?: z.ZodSchema;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      if (schema.body) {
        const bodyResult = schema.body.safeParse(req.body);
        if (!bodyResult.success) {
          return res.status(400).json({
            success: false,
            error: {
              message: 'Invalid request body',
              code: 'BODY_VALIDATION_ERROR',
              details: bodyResult.error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message,
                code: err.code,
              })),
            },
            timestamp: new Date().toISOString(),
            path: req.path,
          });
        }
        req.body = bodyResult.data;
      }

      // Validate query parameters
      if (schema.query) {
        const queryResult = schema.query.safeParse(req.query);
        if (!queryResult.success) {
          return res.status(400).json({
            success: false,
            error: {
              message: 'Invalid query parameters',
              code: 'QUERY_VALIDATION_ERROR',
              details: queryResult.error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message,
                code: err.code,
              })),
            },
            timestamp: new Date().toISOString(),
            path: req.path,
          });
        }
        req.query = queryResult.data;
      }

      // Validate route parameters
      if (schema.params) {
        const paramsResult = schema.params.safeParse(req.params);
        if (!paramsResult.success) {
          return res.status(400).json({
            success: false,
            error: {
              message: 'Invalid route parameters',
              code: 'PARAMS_VALIDATION_ERROR',
              details: paramsResult.error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message,
                code: err.code,
              })),
            },
            timestamp: new Date().toISOString(),
            path: req.path,
          });
        }
        req.params = paramsResult.data;
      }

      next();
    } catch (error) {
      logger.error('Schema validation error:', error);
      
      res.status(500).json({
        success: false,
        error: {
          message: 'Validation error',
          code: 'VALIDATION_ERROR',
        },
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }
  };
}

/**
 * Common validation schemas
 */
export const commonSchemas = {
  // UUID parameter validation
  uuidParam: z.object({
    id: z.string().uuid('Invalid UUID format'),
  }),

  // Pagination query validation
  paginationQuery: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }).refine(data => data.page >= 1, {
    message: 'Page must be greater than 0',
    path: ['page'],
  }).refine(data => data.limit >= 1 && data.limit <= 100, {
    message: 'Limit must be between 1 and 100',
    path: ['limit'],
  }),

  // Search query validation
  searchQuery: z.object({
    q: z.string().min(1).max(100).optional(),
    category: z.string().uuid().optional(),
    minPrice: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
    maxPrice: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  }),

  // Email validation
  email: z.string().email('Invalid email format').toLowerCase(),

  // Password validation
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password must be less than 128 characters long')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain at least one special character'),

  // Name validation
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),

  // Price validation
  price: z.number()
    .positive('Price must be positive')
    .max(999999.99, 'Price cannot exceed 999,999.99')
    .multipleOf(0.01, 'Price must have at most 2 decimal places'),

  // Quantity validation
  quantity: z.number()
    .int('Quantity must be an integer')
    .positive('Quantity must be positive')
    .max(10000, 'Quantity cannot exceed 10,000'),

  // Address validation
  address: z.string()
    .max(500, 'Address must be less than 500 characters')
    .optional(),
};

/**
 * Authentication schema validation
 */
export const authSchemas = {
  register: z.object({
    email: commonSchemas.email,
    password: commonSchemas.password,
    name: commonSchemas.name,
    address: commonSchemas.address,
  }),

  login: z.object({
    email: commonSchemas.email,
    password: z.string().min(1, 'Password is required'),
  }),

  updateProfile: z.object({
    name: commonSchemas.name.optional(),
    address: commonSchemas.address,
  }),

  changePassword: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: commonSchemas.password,
  }),
};

/**
 * Product schema validation
 */
export const productSchemas = {
  create: z.object({
    name: z.string().min(1, 'Product name is required').max(200, 'Product name must be less than 200 characters'),
    description: z.string().min(1, 'Product description is required').max(2000, 'Description must be less than 2000 characters'),
    price: commonSchemas.price,
    stock: commonSchemas.quantity,
    categoryId: z.string().uuid('Invalid category ID'),
    images: z.array(z.string().url('Invalid image URL')).min(1, 'At least one image is required').max(10, 'Maximum 10 images allowed'),
    discount: z.number().min(0).max(100).optional(),
  }),

  update: z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().min(1).max(2000).optional(),
    price: commonSchemas.price.optional(),
    stock: commonSchemas.quantity.optional(),
    categoryId: z.string().uuid().optional(),
    images: z.array(z.string().url()).min(1).max(10).optional(),
    discount: z.number().min(0).max(100).optional(),
  }),

  search: z.object({
    q: z.string().min(1).max(100).optional(),
    category: z.string().uuid().optional(),
    minPrice: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
    maxPrice: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
    page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
};

/**
 * Cart schema validation
 */
export const cartSchemas = {
  addItem: z.object({
    productId: z.string().uuid('Invalid product ID'),
    quantity: commonSchemas.quantity,
  }),

  updateItem: z.object({
    quantity: commonSchemas.quantity,
  }),
};

/**
 * Order schema validation
 */
export const orderSchemas = {
  create: z.object({
    items: z.array(z.object({
      productId: z.string().uuid('Invalid product ID'),
      quantity: commonSchemas.quantity,
    })).min(1, 'At least one item is required'),
    shippingAddress: z.string().min(1, 'Shipping address is required').max(500),
  }),

  updateStatus: z.object({
    status: z.enum(['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  }),
};