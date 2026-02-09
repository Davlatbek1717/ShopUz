import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError } from 'express-validator';
import { logger } from '../utils/logger';

/**
 * Middleware to handle express-validator validation results
 */
export function validateRequest(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error: ValidationError) => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? error.value : undefined,
    }));

    logger.warn('Validation failed:', {
      path: req.path,
      method: req.method,
      errors: formattedErrors,
      body: req.body,
    });

    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: formattedErrors,
      },
      timestamp: new Date().toISOString(),
      path: req.path,
    });
  }

  next();
}

/**
 * Custom validation helper for common patterns
 */
export class ValidationHelpers {
  /**
   * Validate pagination parameters
   */
  static validatePagination(page?: string, limit?: string) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '10', 10);

    const errors: string[] = [];

    if (isNaN(pageNum) || pageNum < 1) {
      errors.push('Page must be a positive integer');
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      errors.push('Limit must be between 1 and 100');
    }

    return {
      isValid: errors.length === 0,
      errors,
      page: Math.max(1, pageNum),
      limit: Math.min(100, Math.max(1, limitNum)),
    };
  }

  /**
   * Validate sort parameters
   */
  static validateSort(sortBy?: string, sortOrder?: string, allowedFields: string[] = []) {
    const errors: string[] = [];

    if (sortBy && !allowedFields.includes(sortBy)) {
      errors.push(`Sort field must be one of: ${allowedFields.join(', ')}`);
    }

    if (sortOrder && !['asc', 'desc'].includes(sortOrder.toLowerCase())) {
      errors.push('Sort order must be "asc" or "desc"');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sortBy: sortBy || allowedFields[0] || 'createdAt',
      sortOrder: (sortOrder?.toLowerCase() as 'asc' | 'desc') || 'desc',
    };
  }

  /**
   * Validate UUID format
   */
  static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Validate price format
   */
  static validatePrice(price: any) {
    const priceNum = parseFloat(price);
    
    if (isNaN(priceNum) || priceNum < 0) {
      return {
        isValid: false,
        error: 'Price must be a positive number',
      };
    }

    if (priceNum > 999999.99) {
      return {
        isValid: false,
        error: 'Price cannot exceed 999,999.99',
      };
    }

    // Round to 2 decimal places
    const roundedPrice = Math.round(priceNum * 100) / 100;

    return {
      isValid: true,
      price: roundedPrice,
    };
  }

  /**
   * Validate quantity
   */
  static validateQuantity(quantity: any) {
    const quantityNum = parseInt(quantity, 10);

    if (isNaN(quantityNum) || quantityNum < 1) {
      return {
        isValid: false,
        error: 'Quantity must be a positive integer',
      };
    }

    if (quantityNum > 10000) {
      return {
        isValid: false,
        error: 'Quantity cannot exceed 10,000',
      };
    }

    return {
      isValid: true,
      quantity: quantityNum,
    };
  }

  /**
   * Sanitize search query
   */
  static sanitizeSearchQuery(query?: string): string {
    if (!query) return '';

    return query
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .substring(0, 100); // Limit length
  }
}