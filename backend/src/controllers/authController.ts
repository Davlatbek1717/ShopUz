import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { logger } from '../utils/logger';

/**
 * Register a new user
 */
export async function register(req: Request, res: Response) {
  try {
    const { email, password, name, address } = req.body;

    // Validate required fields
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email, password, and name are required',
          code: 'MISSING_REQUIRED_FIELDS',
        },
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }

    const result = await AuthService.register({
      email,
      password,
      name,
      address,
    });

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.tokens.accessToken,
      },
      message: 'User registered successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Registration failed:', error);

    const message = error instanceof Error ? error.message : 'Registration failed';
    const statusCode = message.includes('already exists') ? 409 : 400;

    res.status(statusCode).json({
      success: false,
      error: {
        message,
        code: 'REGISTRATION_FAILED',
      },
      timestamp: new Date().toISOString(),
      path: req.path,
    });
  }
}

/**
 * Login user
 */
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email and password are required',
          code: 'MISSING_CREDENTIALS',
        },
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }

    const result = await AuthService.login({ email, password });

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.tokens.accessToken,
      },
      message: 'Login successful',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Login failed:', error);

    const message = error instanceof Error ? error.message : 'Login failed';

    res.status(401).json({
      success: false,
      error: {
        message,
        code: 'LOGIN_FAILED',
      },
      timestamp: new Date().toISOString(),
      path: req.path,
    });
  }
}

/**
 * Refresh access token
 */
export async function refreshToken(req: Request, res: Response) {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Refresh token is required',
          code: 'MISSING_REFRESH_TOKEN',
        },
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }

    const tokens = await AuthService.refreshToken(refreshToken);

    // Set new refresh token as httpOnly cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
      },
      message: 'Token refreshed successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Token refresh failed:', error);

    const message = error instanceof Error ? error.message : 'Token refresh failed';

    res.status(401).json({
      success: false,
      error: {
        message,
        code: 'TOKEN_REFRESH_FAILED',
      },
      timestamp: new Date().toISOString(),
      path: req.path,
    });
  }
}

/**
 * Logout user
 */
export async function logout(req: Request, res: Response) {
  try {
    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json({
      success: true,
      message: 'Logout successful',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Logout failed:', error);

    res.status(500).json({
      success: false,
      error: {
        message: 'Logout failed',
        code: 'LOGOUT_FAILED',
      },
      timestamp: new Date().toISOString(),
      path: req.path,
    });
  }
}

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

    const user = await AuthService.getUserProfile(req.user.id);

    res.status(200).json({
      success: true,
      data: { user },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Get profile failed:', error);

    const message = error instanceof Error ? error.message : 'Failed to get profile';

    res.status(404).json({
      success: false,
      error: {
        message,
        code: 'PROFILE_NOT_FOUND',
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

    const user = await AuthService.updateProfile(req.user.id, {
      name,
      address,
    });

    res.status(200).json({
      success: true,
      data: { user },
      message: 'Profile updated successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Update profile failed:', error);

    const message = error instanceof Error ? error.message : 'Failed to update profile';

    res.status(400).json({
      success: false,
      error: {
        message,
        code: 'PROFILE_UPDATE_FAILED',
      },
      timestamp: new Date().toISOString(),
      path: req.path,
    });
  }
}

/**
 * Change user password
 */
export async function changePassword(req: Request, res: Response) {
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

    await AuthService.changePassword(req.user.id, currentPassword, newPassword);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Change password failed:', error);

    const message = error instanceof Error ? error.message : 'Failed to change password';

    res.status(400).json({
      success: false,
      error: {
        message,
        code: 'PASSWORD_CHANGE_FAILED',
      },
      timestamp: new Date().toISOString(),
      path: req.path,
    });
  }
}