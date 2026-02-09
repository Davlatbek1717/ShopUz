import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, extractTokenFromHeader, JwtPayload } from '../utils/jwt';
import { logger } from '../utils/logger';
import prisma from '../lib/prisma';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        userId?: string; // Alias for compatibility
        email: string;
        role: string;
        name: string;
      };
    }
  }
}

/**
 * Authentication middleware - verifies JWT token
 */
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    // Extract token from Authorization header
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Access token is required',
          code: 'MISSING_TOKEN',
        },
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }

    // Verify token
    const decoded: JwtPayload = verifyAccessToken(token);

    // Get user from database to ensure they still exist and are active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'User not found or account deactivated',
          code: 'USER_NOT_FOUND',
        },
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }

    // Attach user to request object
    req.user = {
      ...user,
      userId: user.id, // Add userId alias for compatibility
    };

    next();
  } catch (error) {
    logger.warn('Authentication failed:', error);
    
    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid or expired token',
        code: 'INVALID_TOKEN',
      },
      timestamp: new Date().toISOString(),
      path: req.path,
    });
  }
}

/**
 * Authorization middleware - checks user roles
 */
export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Authentication required',
          code: 'AUTHENTICATION_REQUIRED',
        },
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(`Authorization failed for user ${req.user.id}. Required roles: ${roles.join(', ')}, User role: ${req.user.role}`);
      
      return res.status(403).json({
        success: false,
        error: {
          message: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS',
          details: {
            required: roles,
            current: req.user.role,
          },
        },
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }

    next();
  };
}

/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      return next();
    }

    const decoded: JwtPayload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (user) {
      req.user = {
        ...user,
        userId: user.id, // Add userId alias for compatibility
      };
    }

    next();
  } catch (error) {
    // Log the error but don't fail the request
    logger.debug('Optional authentication failed:', error);
    next();
  }
}

/**
 * Admin-only middleware
 */
export const requireAdmin = [authenticate, authorize('ADMIN')];

/**
 * User or Admin middleware
 */
export const requireUser = [authenticate, authorize('USER', 'ADMIN')];