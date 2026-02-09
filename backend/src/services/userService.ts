import prisma from '../lib/prisma';
import { logger } from '../utils/logger';

export type Role = 'USER' | 'ADMIN';

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

export interface UserFilters {
  role?: Role;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'email' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface UserListResponse {
  users: Omit<User, 'password'>[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class UserService {
  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<Omit<User, 'password'> | null> {
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

    return user;
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string): Promise<Omit<User, 'password'> | null> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
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

    return user;
  }

  /**
   * Get all users with filtering and pagination (Admin only)
   */
  static async getUsers(filters: UserFilters): Promise<UserListResponse> {
    const {
      role,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    // Build where clause
    const where: any = {};

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await prisma.user.count({ where });

    // Get users
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        address: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    });

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update user role (Admin only)
   */
  static async updateUserRole(
    userId: string,
    newRole: Role,
    adminId: string
  ): Promise<Omit<User, 'password'>> {
    // Prevent admin from changing their own role
    if (userId === adminId) {
      throw new Error('Cannot change your own role');
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Update role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
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

    logger.info(`User role updated: ${user.email} -> ${newRole} by admin ${adminId}`);

    return updatedUser;
  }

  /**
   * Delete user (Admin only)
   */
  static async deleteUser(userId: string, adminId: string): Promise<void> {
    // Prevent admin from deleting themselves
    if (userId === adminId) {
      throw new Error('Cannot delete your own account');
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: userId },
    });

    logger.info(`User deleted: ${user.email} by admin ${adminId}`);
  }

  /**
   * Get user statistics (Admin only)
   */
  static async getUserStats() {
    const [totalUsers, totalAdmins, recentUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    return {
      totalUsers,
      totalAdmins,
      totalRegularUsers: totalUsers - totalAdmins,
      recentUsers,
    };
  }

  /**
   * Get user's order summary
   */
  static async getUserOrderSummary(userId: string) {
    const [totalOrders, totalSpent, recentOrders] = await Promise.all([
      prisma.order.count({ where: { userId } }),
      prisma.order.aggregate({
        where: { userId, status: 'PAID' },
        _sum: { total: true },
      }),
      prisma.order.findMany({
        where: { userId },
        select: {
          id: true,
          status: true,
          total: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    return {
      totalOrders,
      totalSpent: totalSpent._sum.total || 0,
      recentOrders,
    };
  }

  /**
   * Check if email is available
   */
  static async isEmailAvailable(email: string, excludeUserId?: string): Promise<boolean> {
    const where: any = { email: email.toLowerCase() };
    
    if (excludeUserId) {
      where.id = { not: excludeUserId };
    }

    const existingUser = await prisma.user.findFirst({ where });
    return !existingUser;
  }

  /**
   * Update user's last login timestamp
   */
  static async updateLastLogin(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { updatedAt: new Date() }, // Using updatedAt as last activity indicator
    });
  }

  /**
   * Deactivate user account (soft delete alternative)
   */
  static async deactivateUser(userId: string, adminId: string): Promise<void> {
    if (userId === adminId) {
      throw new Error('Cannot deactivate your own account');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // For now, we'll use deletion. In a real app, you might add an 'active' field
    await this.deleteUser(userId, adminId);
  }

  /**
   * Search users by various criteria
   */
  static async searchUsers(query: string, limit: number = 10): Promise<Omit<User, 'password'>[]> {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
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
      take: limit,
      orderBy: { name: 'asc' },
    });

    return users;
  }
}