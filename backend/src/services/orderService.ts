import prisma from '../lib/prisma';
import { logger } from '../utils/logger';
import { CartService } from './cartService';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    images: string;
  };
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: string;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export interface CreateOrderData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode?: string;
  paymentMethod: 'card' | 'cash';
}

export class OrderService {
  /**
   * Create order from user's cart
   */
  static async createOrder(userId: string, orderData: CreateOrderData): Promise<Order> {
    // Get and validate cart
    const cartValidation = await CartService.validateCart(userId);
    
    if (!cartValidation.isValid) {
      throw new Error(`Cart validation failed: ${cartValidation.errors.join(', ')}`);
    }

    const cart = cartValidation.cart;
    
    if (cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    // Prepare shipping address
    const shippingAddress = JSON.stringify({
      firstName: orderData.firstName,
      lastName: orderData.lastName,
      email: orderData.email,
      phone: orderData.phone,
      address: orderData.address,
      city: orderData.city,
      postalCode: orderData.postalCode || '',
    });

    // Create order with transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId,
          status: OrderStatus.PENDING,
          totalAmount: cart.total,
          shippingAddress,
          paymentMethod: orderData.paymentMethod,
          paymentStatus: orderData.paymentMethod === 'cash' ? PaymentStatus.PENDING : PaymentStatus.PENDING,
        },
      });

      // Create order items
      const orderItems = await Promise.all(
        cart.items.map(async (cartItem) => {
          return tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              productId: cartItem.productId,
              quantity: cartItem.quantity,
              price: cartItem.product.discount 
                ? cartItem.product.price * (1 - cartItem.product.discount / 100)
                : cartItem.product.price,
            },
          });
        })
      );

      // Update product stock
      await Promise.all(
        cart.items.map(async (cartItem) => {
          await tx.product.update({
            where: { id: cartItem.productId },
            data: {
              stock: {
                decrement: cartItem.quantity,
              },
            },
          });
        })
      );

      // Clear user's cart
      await tx.cartItem.deleteMany({
        where: { userId },
      });

      // Return order with items
      return tx.order.findUnique({
        where: { id: newOrder.id },
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
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });
    });

    if (!order) {
      throw new Error('Failed to create order');
    }

    logger.info(`Order created: ${order.id} for user ${userId}, total: $${order.totalAmount}`);
    
    return order as Order;
  }

  /**
   * Get order by ID
   */
  static async getOrderById(orderId: string, userId?: string): Promise<Order | null> {
    const whereClause: any = { id: orderId };
    
    // If userId provided, ensure user can only access their own orders
    if (userId) {
      whereClause.userId = userId;
    }

    const order = await prisma.order.findUnique({
      where: whereClause,
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
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return order as Order | null;
  }

  /**
   * Get user's orders with pagination
   */
  static async getUserOrders(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    orders: Order[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
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
      prisma.order.count({
        where: { userId },
      }),
    ]);

    return {
      orders: orders as Order[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get all orders (admin only) with pagination and filters
   */
  static async getAllOrders(
    page: number = 1,
    limit: number = 20,
    status?: OrderStatus,
    paymentStatus?: PaymentStatus
  ): Promise<{
    orders: Order[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const skip = (page - 1) * limit;
    const whereClause: any = {};

    if (status) {
      whereClause.status = status;
    }

    if (paymentStatus) {
      whereClause.paymentStatus = paymentStatus;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
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
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({
        where: whereClause,
      }),
    ]);

    return {
      orders: orders as Order[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    adminUserId?: string
  ): Promise<Order> {
    // Validate status transition
    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!currentOrder) {
      throw new Error('Order not found');
    }

    // Define valid status transitions
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.RETURNED],
      [OrderStatus.DELIVERED]: [OrderStatus.RETURNED],
      [OrderStatus.CANCELLED]: [], // Final state
      [OrderStatus.RETURNED]: [], // Final state
    };

    const currentStatus = currentOrder.status as OrderStatus;
    const allowedTransitions = validTransitions[currentStatus];

    if (!allowedTransitions.includes(status)) {
      throw new Error(
        `Invalid status transition from ${currentStatus} to ${status}`
      );
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { 
        status,
        updatedAt: new Date(),
      },
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
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    logger.info(
      `Order ${orderId} status updated from ${currentStatus} to ${status}${
        adminUserId ? ` by admin ${adminUserId}` : ''
      }`
    );

    return updatedOrder as Order;
  }

  /**
   * Update payment status
   */
  static async updatePaymentStatus(
    orderId: string,
    paymentStatus: PaymentStatus
  ): Promise<Order> {
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { 
        paymentStatus,
        updatedAt: new Date(),
      },
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
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    logger.info(`Order ${orderId} payment status updated to ${paymentStatus}`);

    return updatedOrder as Order;
  }

  /**
   * Cancel order
   */
  static async cancelOrder(orderId: string, userId?: string): Promise<Order> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Check if user owns the order (if userId provided)
    if (userId && order.userId !== userId) {
      throw new Error('Unauthorized to cancel this order');
    }

    // Check if order can be cancelled
    const cancellableStatuses = [OrderStatus.PENDING, OrderStatus.CONFIRMED];
    if (!cancellableStatuses.includes(order.status as OrderStatus)) {
      throw new Error(`Cannot cancel order with status ${order.status}`);
    }

    // Cancel order and restore stock
    const cancelledOrder = await prisma.$transaction(async (tx) => {
      // Restore product stock
      await Promise.all(
        order.items.map(async (item) => {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        })
      );

      // Update order status
      return tx.order.update({
        where: { id: orderId },
        data: { 
          status: OrderStatus.CANCELLED,
          updatedAt: new Date(),
        },
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
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });
    });

    logger.info(`Order ${orderId} cancelled${userId ? ` by user ${userId}` : ''}`);

    return cancelledOrder as Order;
  }

  /**
   * Get order statistics (admin only)
   */
  static async getOrderStatistics(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    ordersByStatus: Record<string, number>;
    ordersByPaymentStatus: Record<string, number>;
    recentOrders: Order[];
  }> {
    const [
      totalOrders,
      totalRevenue,
      ordersByStatus,
      ordersByPaymentStatus,
      recentOrders,
    ] = await Promise.all([
      // Total orders
      prisma.order.count(),
      
      // Total revenue (only from paid orders)
      prisma.order.aggregate({
        where: { paymentStatus: PaymentStatus.PAID },
        _sum: { totalAmount: true },
      }),
      
      // Orders by status
      prisma.order.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      
      // Orders by payment status
      prisma.order.groupBy({
        by: ['paymentStatus'],
        _count: { paymentStatus: true },
      }),
      
      // Recent orders
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
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
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
    ]);

    // Format grouped data
    const statusCounts: Record<string, number> = {};
    ordersByStatus.forEach((item) => {
      statusCounts[item.status] = item._count.status;
    });

    const paymentStatusCounts: Record<string, number> = {};
    ordersByPaymentStatus.forEach((item) => {
      paymentStatusCounts[item.paymentStatus] = item._count.paymentStatus;
    });

    return {
      totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      ordersByStatus: statusCounts,
      ordersByPaymentStatus: paymentStatusCounts,
      recentOrders: recentOrders as Order[],
    };
  }
}