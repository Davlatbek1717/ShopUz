import { Request, Response } from 'express';
import { OrderService, OrderStatus, PaymentStatus, CreateOrderData } from '../services/orderService';
import { logger } from '../utils/logger';

export class OrderController {
  /**
   * Create order from cart
   * POST /api/orders
   */
  static async createOrder(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const orderData: CreateOrderData = req.body;

      // Validate required fields
      const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'paymentMethod'];
      const missingFields = requiredFields.filter(field => !orderData[field as keyof CreateOrderData]);

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`,
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(orderData.email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format',
        });
      }

      // Validate payment method
      if (!['card', 'cash'].includes(orderData.paymentMethod)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment method. Must be "card" or "cash"',
        });
      }

      const order = await OrderService.createOrder(userId, orderData);

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: order,
      });
    } catch (error) {
      logger.error('Error creating order:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Cart validation failed') || error.message === 'Cart is empty') {
          return res.status(400).json({
            success: false,
            message: error.message,
          });
        }
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create order',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get order by ID
   * GET /api/orders/:id
   */
  static async getOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      const isAdmin = req.user?.role === 'ADMIN';

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      // Admin can view any order, users can only view their own
      const order = await OrderService.getOrderById(id, isAdmin ? undefined : userId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      logger.error('Error getting order:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get order',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get user's orders
   * GET /api/orders
   */
  static async getUserOrders(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (page < 1 || limit < 1 || limit > 100) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pagination parameters',
        });
      }

      const result = await OrderService.getUserOrders(userId, page, limit);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error getting user orders:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get orders',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get all orders (admin only)
   * GET /api/admin/orders
   */
  static async getAllOrders(req: Request, res: Response) {
    try {
      const isAdmin = req.user?.role === 'ADMIN';

      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Admin access required',
        });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as OrderStatus;
      const paymentStatus = req.query.paymentStatus as PaymentStatus;

      if (page < 1 || limit < 1 || limit > 100) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pagination parameters',
        });
      }

      const result = await OrderService.getAllOrders(page, limit, status, paymentStatus);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error getting all orders:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get orders',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Update order status
   * PUT /api/orders/:id/status
   */
  static async updateOrderStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user?.userId;
      const isAdmin = req.user?.role === 'ADMIN';

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Admin access required',
        });
      }

      if (!status || !Object.values(OrderStatus).includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid order status',
        });
      }

      const order = await OrderService.updateOrderStatus(id, status, userId);

      res.json({
        success: true,
        message: 'Order status updated successfully',
        data: order,
      });
    } catch (error) {
      logger.error('Error updating order status:', error);
      
      if (error instanceof Error) {
        if (error.message === 'Order not found') {
          return res.status(404).json({
            success: false,
            message: 'Order not found',
          });
        }
        
        if (error.message.includes('Invalid status transition')) {
          return res.status(400).json({
            success: false,
            message: error.message,
          });
        }
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update order status',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Cancel order
   * PUT /api/orders/:id/cancel
   */
  static async cancelOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      const isAdmin = req.user?.role === 'ADMIN';

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      // Users can cancel their own orders, admins can cancel any order
      const order = await OrderService.cancelOrder(id, isAdmin ? undefined : userId);

      res.json({
        success: true,
        message: 'Order cancelled successfully',
        data: order,
      });
    } catch (error) {
      logger.error('Error cancelling order:', error);
      
      if (error instanceof Error) {
        if (error.message === 'Order not found') {
          return res.status(404).json({
            success: false,
            message: 'Order not found',
          });
        }
        
        if (error.message === 'Unauthorized to cancel this order') {
          return res.status(403).json({
            success: false,
            message: 'You can only cancel your own orders',
          });
        }
        
        if (error.message.includes('Cannot cancel order')) {
          return res.status(400).json({
            success: false,
            message: error.message,
          });
        }
      }

      res.status(500).json({
        success: false,
        message: 'Failed to cancel order',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get order statistics (admin only)
   * GET /api/admin/orders/statistics
   */
  static async getOrderStatistics(req: Request, res: Response) {
    try {
      const isAdmin = req.user?.role === 'ADMIN';

      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Admin access required',
        });
      }

      const statistics = await OrderService.getOrderStatistics();

      res.json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      logger.error('Error getting order statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get order statistics',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}