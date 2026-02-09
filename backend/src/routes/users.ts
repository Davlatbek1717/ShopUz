import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  getOrderHistory,
  getUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getUserStats,
  searchUsers,
} from '../controllers/userController';
import { requireAdmin, requireUser } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { validateSchema, commonSchemas } from '../middleware/advancedValidation';
import { searchLimiter } from '../middleware/rateLimit';
import { body, param, query } from 'express-validator';
import { z } from 'zod';

const router = Router();

// Validation schemas
const updateProfileSchema = {
  body: z.object({
    name: commonSchemas.name.optional(),
    address: commonSchemas.address,
  }),
};

const updateRoleSchema = {
  params: z.object({
    id: z.string().uuid('Invalid user ID'),
  }),
  body: z.object({
    role: z.enum(['USER', 'ADMIN'], {
      errorMap: () => ({ message: 'Role must be USER or ADMIN' }),
    }),
  }),
};

const userParamsSchema = {
  params: z.object({
    id: z.string().uuid('Invalid user ID'),
  }),
};

const usersQuerySchema = {
  query: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
    role: z.enum(['USER', 'ADMIN']).optional(),
    search: z.string().max(100).optional(),
    sortBy: z.enum(['name', 'email', 'createdAt']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
};

const searchQuerySchema = {
  query: z.object({
    q: z.string().min(1, 'Search query is required').max(100),
    limit: z.string().optional().transform(val => val ? Math.min(parseInt(val, 10), 50) : 10),
  }),
};

// Express-validator fallback for some routes
const profileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address must be less than 500 characters'),
];

const roleValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid user ID'),
  body('role')
    .isIn(['USER', 'ADMIN'])
    .withMessage('Role must be USER or ADMIN'),
];

const userIdValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid user ID'),
];

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sortBy')
    .optional()
    .isIn(['name', 'email', 'createdAt'])
    .withMessage('Sort field must be name, email, or createdAt'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
];

// User profile routes (authenticated users)
router.get('/profile', requireUser, getProfile);
router.put('/profile', requireUser, validateSchema(updateProfileSchema), updateProfile);
router.get('/orders', requireUser, getOrderHistory);

// Admin-only user management routes
router.get('/', requireAdmin, validateSchema(usersQuerySchema), getUsers);
router.get('/stats', requireAdmin, getUserStats);
router.get('/search', requireAdmin, searchLimiter, validateSchema(searchQuerySchema), searchUsers);
router.get('/:id', requireAdmin, validateSchema(userParamsSchema), getUserById);
router.put('/:id/role', requireAdmin, validateSchema(updateRoleSchema), updateUserRole);
router.delete('/:id', requireAdmin, validateSchema(userParamsSchema), deleteUser);

// Alternative routes with express-validator (for backward compatibility)
router.put('/profile-alt', requireUser, profileValidation, validateRequest, updateProfile);
router.put('/:id/role-alt', requireAdmin, roleValidation, validateRequest, updateUserRole);
router.delete('/:id-alt', requireAdmin, userIdValidation, validateRequest, deleteUser);
router.get('/list-alt', requireAdmin, paginationValidation, validateRequest, getUsers);

export default router;