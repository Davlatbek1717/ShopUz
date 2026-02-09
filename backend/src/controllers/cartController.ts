import { Request, Response } from 'express';
import { CartService } from '../services/cartService';
import { logger } from '../utils/logger';

export class CartController {
  /**
   * Get user's cart
   * GET /api/cart
   */
  static async getCart(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const cart = await CartService.getCart(userId);

      res.json({
        success: true,
        data: cart,
      });
    } catch (error) {
      logger.error('Error getting cart:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get cart',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Add item to cart
   * POST /api/cart/items
   */
  static async addToCart(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const { productId, quantity = 1 } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      if (!productId) {
        return res.status(400).json({
          success: false,
          message: 'Product ID is required',
        });
      }

      if (quantity <= 0 || !Number.isInteger(quantity)) {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be a positive integer',
        });
      }

      const cartItem = await CartService.addToCart(userId, productId, quantity);

      res.status(201).json({
        success: true,
        message: 'Item added to cart successfully',
        data: cartItem,
      });
    } catch (error) {
      logger.error('Error adding to cart:', error);
      
      if (error instanceof Error) {
        if (error.message === 'Product not found') {
          return res.status(404).json({
            success: false,
            message: 'Product not found',
          });
        }
        
        if (error.message.includes('stock') || error.message.includes('available')) {
          return res.status(400).json({
            success: false,
            message: error.message,
          });
        }
      }

      res.status(500).json({
        success: false,
        message: 'Failed to add item to cart',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Update cart item quantity
   * PUT /api/cart/items/:id
   */
  static async updateCartItem(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;
      const { quantity } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      if (!quantity || quantity <= 0 || !Number.isInteger(quantity)) {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be a positive integer',
        });
      }

      const cartItem = await CartService.updateCartItem(userId, id, quantity);

      res.json({
        success: true,
        message: 'Cart item updated successfully',
        data: cartItem,
      });
    } catch (error) {
      logger.error('Error updating cart item:', error);
      
      if (error instanceof Error) {
        if (error.message === 'Cart item not found') {
          return res.status(404).json({
            success: false,
            message: 'Cart item not found',
          });
        }
        
        if (error.message.includes('stock') || error.message.includes('available')) {
          return res.status(400).json({
            success: false,
            message: error.message,
          });
        }
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update cart item',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Remove item from cart
   * DELETE /api/cart/items/:id
   */
  static async removeFromCart(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      await CartService.removeFromCart(userId, id);

      res.json({
        success: true,
        message: 'Item removed from cart successfully',
      });
    } catch (error) {
      logger.error('Error removing from cart:', error);
      
      if (error instanceof Error && error.message === 'Cart item not found') {
        return res.status(404).json({
          success: false,
          message: 'Cart item not found',
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to remove item from cart',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Clear entire cart
   * DELETE /api/cart
   */
  static async clearCart(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      await CartService.clearCart(userId);

      res.json({
        success: true,
        message: 'Cart cleared successfully',
      });
    } catch (error) {
      logger.error('Error clearing cart:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clear cart',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get cart item count
   * GET /api/cart/count
   */
  static async getCartCount(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const count = await CartService.getCartItemCount(userId);

      res.json({
        success: true,
        data: { count },
      });
    } catch (error) {
      logger.error('Error getting cart count:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get cart count',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Validate cart for checkout
   * GET /api/cart/validate
   */
  static async validateCart(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const validation = await CartService.validateCart(userId);

      res.json({
        success: true,
        data: validation,
      });
    } catch (error) {
      logger.error('Error validating cart:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to validate cart',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Sync cart with current stock
   * POST /api/cart/sync
   */
  static async syncCart(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const syncResult = await CartService.syncCartWithStock(userId);
      const cart = await CartService.getCart(userId);

      res.json({
        success: true,
        message: 'Cart synced successfully',
        data: {
          syncResult,
          cart,
        },
      });
    } catch (error) {
      logger.error('Error syncing cart:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to sync cart',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}