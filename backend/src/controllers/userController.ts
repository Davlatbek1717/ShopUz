import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { AuthService } from '../services/authService';
import { logger } from '../utils/logger';
import { ValidationHelpers } from '../middleware/validation';
import prisma from '../lib/prisma';

/**
 * Get current user profile
 */
export async function getProfile(req: Request, res: Response) {
  try {
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

    const user = await UserService.getUserById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND',
        },
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }

    // Get user's order summary
    const orderSummary = await UserService.getUserOrderSummary(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        user,
        orderSummary,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Get profile failed:', error);

    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get profile',
        code: 'PROFILE_FETCH_ERROR',
      },
      timestamp: new Date().toISOString(),
      path: req.path,
    });
  }
}

/**
 * Update user profile
 */
export async function updateProfile(req: Request, res: Response) {
  try {
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

    const { name, address } = req.body;

    const updatedUser = await AuthService.updateProfile(req.user.id, {
      name,
      address,
    });

    res.status(200).json({
      success: true,
      data: { user: updatedUser },
      message: 'Profile updated successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Update profile failed:', error);

    res.status(400).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to update profile',
        code: 'PROFILE_UPDATE_ERROR',
      },
      timestamp: new Date().toISOString(),
      path: req.path,
    });
  }
}

/**
 * Get user's order history
 */
export async function getOrderHistory(req: Request, res: Response) {
  try {
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

    const { page, limit } = ValidationHelpers.validatePagination(
      req.query.page as string,
      req.query.limit as string
    );

    if (!ValidationHelpers.validatePagination(req.query.page as string, req.query.limit as string).isValid) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid pagination parameters',
          code: 'INVALID_PAGINATION',
        },
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }

    // Get user's orders with pagination
    const skip = (page - 1) * limit;
    
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId: req.user.id },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where: { userId: req.user.id } }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Get order history failed:', error);

    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get order history',
        code: 'ORDER_HISTORY_ERROR',
      },
      timestamp: new Date().toISOString(),
      path: req.path,
    });
  }
}

/**
 * Get all users (Admin only)
 */
export async function getUsers(req: Request, res: Response) {
  try {
    const { page, limit } = ValidationHelpers.validatePagination(
      req.query.page as string,
      req.query.limit as string
    );

    const { sortBy, sortOrder } = ValidationHelpers.validateSort(
      req.query.sortBy as string,
      req.query.sortOrder as string,
      ['name', 'email', 'createdAt']
    );

    const filters = {
      role: req.query.role as any,
      search: ValidationHelpers.sanitizeSearchQuery(req.query.search as string),
      page,
      limit,
      sortBy: sortBy as 'name' | 'email' | 'createdAt',
      sortOrder,
    };

    const result = await UserService.getUsers(filters);

    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Get users failed:', error);

    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get users',
        code: 'USERS_FETCH_ERROR',
      },
      timestamp: new Date().toISOString(),
      path: req.path,
    });
  }
}

/**
 * Get user by ID (Admin only)
 */
export async function getUserById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!ValidationHelpers.isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid user ID format',
          code: 'INVALID_USER_ID',
        },
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }

    const user = await UserService.getUserById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND',
        },
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }

    // Get user's order summary
    const orderSummary = await UserService.getUserOrderSummary(id);

    res.status(200).json({
      success: true,
      data: {
        user,
        orderSummary,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Get user by ID failed:', error);

    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get user',
        code: 'USER_FETCH_ERROR',
      },
      timestamp: new Date().toISOString(),
      path: req.path,
    });
  }
}

/**
 * Update user role (Admin only)
 */
export async function updateUserRole(req: Request, res: Response) {
  try {
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

    const { id } = req.params;
    const { role } = req.body;

    if (!ValidationHelpers.isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid user ID format',
          code: 'INVALID_USER_ID',
        },
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }

    if (!['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid role. Must be USER or ADMIN',
          code: 'INVALID_ROLE',
        },
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }

    const updatedUser = await UserService.updateUserRole(id, role, req.user.id);

    res.status(200).json({
      success: true,
      data: { user: updatedUser },
      message: 'User role updated successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Update user role failed:', error);

    const message = error instanceof Error ? error.message : 'Failed to update user role';
    const statusCode = message.includes('not found') ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      error: {
        message,
        code: 'ROLE_UPDATE_ERROR',
      },
      timestamp: new Date().toISOString(),
      path: req.path,
    });
  }
}

/**
 * Delete user (Admin only)
 */
export async function deleteUser(req: Request, res: Response) {
  try {
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

    const { id } = req.params;

    if (!ValidationHelpers.isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid user ID format',
          code: 'INVALID_USER_ID',
        },
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }

    await UserService.deleteUser(id, req.user.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Delete user failed:', error);

    const message = error instanceof Error ? error.message : 'Failed to delete user';
    const statusCode = message.includes('not found') ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      error: {
        message,
        code: 'USER_DELETE_ERROR',
      },
      timestamp: new Date().toISOString(),
      path: req.path,
    });
  }
}

/**
 * Get user statistics (Admin only)
 */
export async function getUserStats(req: Request, res: Response) {
  try {
    const stats = await UserService.getUserStats();

    res.status(200).json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Get user stats failed:', error);

    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get user statistics',
        code: 'STATS_FETCH_ERROR',
      },
      timestamp: new Date().toISOString(),
      path: req.path,
    });
  }
}

/**
 * Search users (Admin only)
 */
export async function searchUsers(req: Request, res: Response) {
  try {
    const query = ValidationHelpers.sanitizeSearchQuery(req.query.q as string);
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Search query is required',
          code: 'MISSING_SEARCH_QUERY',
        },
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const users = await UserService.searchUsers(query, limit);

    res.status(200).json({
      success: true,
      data: { users },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Search users failed:', error);

    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to search users',
        code: 'USER_SEARCH_ERROR',
      },
      timestamp: new Date().toISOString(),
      path: req.path,
    });
  }
}