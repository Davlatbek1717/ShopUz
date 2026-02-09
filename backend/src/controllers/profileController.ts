import { Request, Response } from 'express';
import { ProfileService } from '../services/profileService';
import { logger } from '../utils/logger';

/**
 * Get complete user profile with statistics
 */
export async function getCompleteProfile(req: Request, res: Response) {
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

    const profileData = await ProfileService.getCompleteProfile(req.user.id);

    res.status(200).json({
      success: true,
      data: profileData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Get complete profile failed:', error);

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
 * Update user profile with enhanced validation
 */
export async function updateProfileEnhanced(req: Request, res: Response) {
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

    const { name, address, email } = req.body;

    // Validate input data
    const validation = ProfileService.validateProfileData({ name, address, email });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: validation.errors,
        },
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }

    const updatedUser = await ProfileService.updateProfile(req.user.id, {
      name,
      address,
      email,
    });

    res.status(200).json({
      success: true,
      data: { user: updatedUser },
      message: 'Profile updated successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Update profile enhanced failed:', error);

    const message = error instanceof Error ? error.message : 'Failed to update profile';
    const statusCode = message.includes('already taken') ? 409 : 400;

    res.status(statusCode).json({
      success: false,
      error: {
        message,
        code: 'PROFILE_UPDATE_ERROR',
      },
      timestamp: new Date().toISOString(),
      path: req.path,
    });
  }
}

/**
 * Change password with enhanced security
 */
export async function changePasswordEnhanced(req: Request, res: Response) {
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

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Current password and new password are required',
          code: 'MISSING_PASSWORDS',
        },
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }

    await ProfileService.changePassword(req.user.id, currentPassword, newPassword);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Change password enhanced failed:', error);

    const message = error instanceof Error ? error.message : 'Failed to change password';

    res.status(400).json({
      success: false,
      error: {
        message,
        code: 'PASSWORD_CHANGE_ERROR',
      },
      timestamp: new Date().toISOString(),
      path: req.path,
    });
  }
}

/**
 * Get user activity
 */
export async function getUserActivity(req: Request, res: Response) {
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

    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const activity = await ProfileService.getUserActivity(req.user.id, limit);

    res.status(200).json({
      success: true,
      data: activity,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Get user activity failed:', error);

    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get user activity',
        code: 'ACTIVITY_FETCH_ERROR',
      },
      timestamp: new Date().toISOString(),
      path: req.path,
    });
  }
}

/**
 * Update account settings
 */
export async function updateAccountSettings(req: Request, res: Response) {
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

    const { emailNotifications, marketingEmails, twoFactorEnabled } = req.body;

    const updatedSettings = await ProfileService.updateAccountSettings(req.user.id, {
      emailNotifications,
      marketingEmails,
      twoFactorEnabled,
    });

    res.status(200).json({
      success: true,
      data: { settings: updatedSettings },
      message: 'Account settings updated successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Update account settings failed:', error);

    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update account settings',
        code: 'SETTINGS_UPDATE_ERROR',
      },
      timestamp: new Date().toISOString(),
      path: req.path,
    });
  }
}

/**
 * Get user addresses
 */
export async function getUserAddresses(req: Request, res: Response) {
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

    const addresses = await ProfileService.getUserAddresses(req.user.id);

    res.status(200).json({
      success: true,
      data: { addresses },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Get user addresses failed:', error);

    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get addresses',
        code: 'ADDRESSES_FETCH_ERROR',
      },
      timestamp: new Date().toISOString(),
      path: req.path,
    });
  }
}

/**
 * Delete user account
 */
export async function deleteAccount(req: Request, res: Response) {
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

    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Password is required to delete account',
          code: 'PASSWORD_REQUIRED',
        },
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }

    await ProfileService.deleteAccount(req.user.id, password);

    // Clear any cookies
    res.clearCookie('refreshToken');

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Delete account failed:', error);

    const message = error instanceof Error ? error.message : 'Failed to delete account';

    res.status(400).json({
      success: false,
      error: {
        message,
        code: 'ACCOUNT_DELETE_ERROR',
      },
      timestamp: new Date().toISOString(),
      path: req.path,
    });
  }
}