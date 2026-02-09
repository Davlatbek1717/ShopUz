import prisma from '../lib/prisma';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password';
import { generateTokenPair, verifyRefreshToken, TokenPair } from '../utils/jwt';
import { logger } from '../utils/logger';

export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  role: string;
  address: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  address?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  tokens: TokenPair;
}

export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: RegisterData): Promise<AuthResponse> {
    const { email, password, name, address } = data;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name.trim(),
        address: address?.trim(),
        role: 'USER', // Default role
      },
    });

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    logger.info(`New user registered: ${user.email}`);

    return {
      user: userWithoutPassword,
      tokens,
    };
  }

  /**
   * Login user
   */
  static async login(data: LoginData): Promise<AuthResponse> {
    const { email, password } = data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    logger.info(`User logged in: ${user.email}`);

    return {
      user: userWithoutPassword,
      tokens,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(refreshToken: string): Promise<TokenPair> {
    try {
      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);

      // Get user to ensure they still exist
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          role: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Generate new token pair
      const tokens = generateTokenPair({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      logger.info(`Token refreshed for user: ${user.email}`);

      return tokens;
    } catch (error) {
      logger.warn('Token refresh failed:', error);
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Get user profile by ID
   */
  static async getUserProfile(userId: string): Promise<Omit<User, 'password'>> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        address: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Update user profile
   */
  static async updateProfile(
    userId: string,
    data: { name?: string; address?: string }
  ): Promise<Omit<User, 'password'>> {
    const updateData: any = {};

    if (data.name !== undefined) {
      updateData.name = data.name.trim();
    }

    if (data.address !== undefined) {
      updateData.address = data.address.trim() || null;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        address: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info(`Profile updated for user: ${user.email}`);

    return user;
  }

  /**
   * Change user password
   */
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    logger.info(`Password changed for user: ${user.email}`);
  }

  /**
   * Create admin user (for seeding or admin operations)
   */
  static async createAdmin(data: RegisterData): Promise<Omit<User, 'password'>> {
    const { email, password, name, address } = data;

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create admin user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name.trim(),
        address: address?.trim(),
        role: 'ADMIN',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        address: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info(`Admin user created: ${user.email}`);

    return user;
  }
}