import prisma from '../lib/prisma';
import { logger } from '../utils/logger';
import { hashPassword, comparePassword } from '../utils/password';

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

export interface ProfileUpdateData {
  name?: string;
  address?: string;
  email?: string;
}

export interface AccountSettings {
  emailNotifications: boolean;
  marketingEmails: boolean;
  twoFactorEnabled: boolean;
}

export class ProfileService {
  /**
   * Get complete user profile with settings
   */
  static async getCompleteProfile(userId: string): Promise<{
    user: Omit<User, 'password'>;
    orderStats: any;
    accountSettings: AccountSettings;
  }> {
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

    // Get order statistics
    const [totalOrders, totalSpent, pendingOrders] = await Promise.all([
      prisma.order.count({ where: { userId } }),
      prisma.order.aggregate({
        where: { userId, status: 'PAID' },
        _sum: { total: true },
      }),
      prisma.order.count({ where: { userId, status: 'PENDING' } }),
    ]);

    const orderStats = {
      totalOrders,
      totalSpent: totalSpent._sum.total || 0,
      pendingOrders,
    };

    // Default account settings (in a real app, these would be stored in DB)
    const accountSettings: AccountSettings = {
      emailNotifications: true,
      marketingEmails: false,
      twoFactorEnabled: false,
    };

    return {
      user,
      orderStats,
      accountSettings,
    };
  }

  /**
   * Update user profile with validation
   */
  static async updateProfile(
    userId: string,
    data: ProfileUpdateData
  ): Promise<Omit<User, 'password'>> {
    const updateData: any = {};

    // Validate and prepare name update
    if (data.name !== undefined) {
      if (!data.name.trim()) {
        throw new Error('Name cannot be empty');
      }
      updateData.name = data.name.trim();
    }

    // Validate and prepare address update
    if (data.address !== undefined) {
      updateData.address = data.address.trim() || null;
    }

    // Validate and prepare email update
    if (data.email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new Error('Invalid email format');
      }

      // Check if email is already taken
      const existingUser = await prisma.user.findFirst({
        where: {
          email: data.email.toLowerCase(),
          id: { not: userId },
        },
      });

      if (existingUser) {
        throw new Error('Email is already taken');
      }

      updateData.email = data.email.toLowerCase();
    }

    // Update user
    const updatedUser = await prisma.user.update({
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

    logger.info(`Profile updated for user: ${updatedUser.email}`);

    return updatedUser;
  }

  /**
   * Change user password with validation
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

    // Validate new password (basic validation - more comprehensive validation in password utils)
    if (newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long');
    }

    if (newPassword === currentPassword) {
      throw new Error('New password must be different from current password');
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
   * Get user's recent activity
   */
  static async getUserActivity(userId: string, limit: number = 10) {
    const [recentOrders, recentCartActivity] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        select: {
          id: true,
          status: true,
          total: true,
          createdAt: true,
          items: {
            select: {
              quantity: true,
              product: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      prisma.cartItem.findMany({
        where: { userId },
        select: {
          quantity: true,
          createdAt: true,
          product: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
    ]);

    return {
      recentOrders,
      recentCartActivity,
    };
  }

  /**
   * Delete user account (soft delete by deactivating)
   */
  static async deleteAccount(userId: string, password: string): Promise<void> {
    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Password is incorrect');
    }

    // In a real application, you might want to soft delete or anonymize data
    // For now, we'll actually delete the user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: userId },
    });

    logger.info(`Account deleted for user: ${user.email}`);
  }

  /**
   * Update account settings
   */
  static async updateAccountSettings(
    userId: string,
    settings: Partial<AccountSettings>
  ): Promise<AccountSettings> {
    // In a real application, these settings would be stored in the database
    // For now, we'll just return the updated settings
    // You would typically have a UserSettings table

    logger.info(`Account settings updated for user: ${userId}`, settings);

    // Return default settings merged with updates
    return {
      emailNotifications: settings.emailNotifications ?? true,
      marketingEmails: settings.marketingEmails ?? false,
      twoFactorEnabled: settings.twoFactorEnabled ?? false,
    };
  }

  /**
   * Get user's addresses (for future multi-address support)
   */
  static async getUserAddresses(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        address: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // For now, return the single address as an array
    // In a real app, you might have a separate addresses table
    return user.address ? [{ id: '1', address: user.address, isDefault: true }] : [];
  }

  /**
   * Validate profile data
   */
  static validateProfileData(data: ProfileUpdateData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (data.name !== undefined) {
      if (!data.name.trim()) {
        errors.push('Name cannot be empty');
      } else if (data.name.length > 100) {
        errors.push('Name must be less than 100 characters');
      }
    }

    if (data.address !== undefined && data.address.length > 500) {
      errors.push('Address must be less than 500 characters');
    }

    if (data.email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push('Invalid email format');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}