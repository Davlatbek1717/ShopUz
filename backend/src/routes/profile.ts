import { Router } from 'express';
import {
  getCompleteProfile,
  updateProfileEnhanced,
  changePasswordEnhanced,
  getUserActivity,
  updateAccountSettings,
  getUserAddresses,
  deleteAccount,
} from '../controllers/profileController';
import { requireUser } from '../middleware/auth';
import { validateSchema } from '../middleware/advancedValidation';
import { passwordLimiter } from '../middleware/rateLimit';
import { z } from 'zod';

const router = Router();

// Validation schemas
const updateProfileSchema = {
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    address: z.string().max(500).optional(),
    email: z.string().email().optional(),
  }),
};

const changePasswordSchema = {
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string()
      .min(8, 'Password must be at least 8 characters long')
      .max(128, 'Password must be less than 128 characters long')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/\d/, 'Password must contain at least one number')
      .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain at least one special character'),
  }),
};

const accountSettingsSchema = {
  body: z.object({
    emailNotifications: z.boolean().optional(),
    marketingEmails: z.boolean().optional(),
    twoFactorEnabled: z.boolean().optional(),
  }),
};

const deleteAccountSchema = {
  body: z.object({
    password: z.string().min(1, 'Password is required'),
  }),
};

const activityQuerySchema = {
  query: z.object({
    limit: z.string().optional().transform(val => val ? Math.min(parseInt(val, 10), 50) : 10),
  }),
};

// Profile management routes
router.get('/complete', requireUser, getCompleteProfile);
router.put('/update', requireUser, validateSchema(updateProfileSchema), updateProfileEnhanced);
router.put('/change-password', requireUser, passwordLimiter, validateSchema(changePasswordSchema), changePasswordEnhanced);
router.get('/activity', requireUser, validateSchema(activityQuerySchema), getUserActivity);
router.put('/settings', requireUser, validateSchema(accountSettingsSchema), updateAccountSettings);
router.get('/addresses', requireUser, getUserAddresses);
router.delete('/delete', requireUser, passwordLimiter, validateSchema(deleteAccountSchema), deleteAccount);

export default router;