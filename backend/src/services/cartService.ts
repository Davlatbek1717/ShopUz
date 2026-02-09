import prisma from '../lib/prisma';
import { logger } from '../utils/logger';

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    images: string;
    discount: number | null;
    category: {
      id: string;
      name: string;
    };
  };
}

export interface CartSummary {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  discount: number;
  total: number;
}

export class CartService {
  /**
   * Get user's cart with all items
   */
  static async getCart(userId: string): Promise<CartSummary> {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return this.calculateCartSummary(cartItems);
  }

  /**
   * Add item to cart or update quantity if exists
   */
  static async addToCart(
    userId: string,
    productId: string,
    quantity: number = 1
  ): Promise<CartItem> {
    // Validate product exists and has stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { category: true },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    if (product.stock < quantity) {
      throw new Error(`Only ${product.stock} items available in stock`);
    }

    // Check if item already exists in cart
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    let cartItem;

    if (existingCartItem) {
      // Update existing item quantity
      const newQuantity = existingCartItem.quantity + quantity;
      
      if (newQuantity > product.stock) {
        throw new Error(`Cannot add ${quantity} more items. Only ${product.stock - existingCartItem.quantity} more available`);
      }

      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity },
        include: {
          product: {
            include: { category: true },
          },
        },
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          userId,
          productId,
          quantity,
        },
        include: {
          product: {
            include: { category: true },
          },
        },
      });
    }

    logger.info(`Item added to cart: ${product.name} (qty: ${quantity}) for user ${userId}`);
    return cartItem;
  }

  /**
   * Update cart item quantity
   */
  static async updateCartItem(
    userId: string,
    cartItemId: string,
    quantity: number
  ): Promise<CartItem> {
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    // Find cart item and verify ownership
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        userId,
      },
      include: {
        product: {
          include: { category: true },
        },
      },
    });

    if (!cartItem) {
      throw new Error('Cart item not found');
    }

    // Check stock availability
    if (quantity > cartItem.product.stock) {
      throw new Error(`Only ${cartItem.product.stock} items available in stock`);
    }

    const updatedCartItem = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
      include: {
        product: {
          include: { category: true },
        },
      },
    });

    logger.info(`Cart item updated: ${cartItem.product.name} (qty: ${quantity}) for user ${userId}`);
    return updatedCartItem;
  }

  /**
   * Remove item from cart
   */
  static async removeFromCart(userId: string, cartItemId: string): Promise<void> {
    // Find cart item and verify ownership
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        userId,
      },
      include: {
        product: true,
      },
    });

    if (!cartItem) {
      throw new Error('Cart item not found');
    }

    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    logger.info(`Item removed from cart: ${cartItem.product.name} for user ${userId}`);
  }

  /**
   * Clear entire cart
   */
  static async clearCart(userId: string): Promise<void> {
    const deletedItems = await prisma.cartItem.deleteMany({
      where: { userId },
    });

    logger.info(`Cart cleared for user ${userId}: ${deletedItems.count} items removed`);
  }

  /**
   * Get cart item count
   */
  static async getCartItemCount(userId: string): Promise<number> {
    const result = await prisma.cartItem.aggregate({
      where: { userId },
      _sum: { quantity: true },
    });

    return result._sum.quantity || 0;
  }

  /**
   * Validate cart before checkout
   */
  static async validateCart(userId: string): Promise<{
    isValid: boolean;
    errors: string[];
    cart: CartSummary;
  }> {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: { category: true },
        },
      },
    });

    const errors: string[] = [];

    // Check if cart is empty
    if (cartItems.length === 0) {
      errors.push('Cart is empty');
    }

    // Check stock availability for each item
    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        errors.push(
          `${item.product.name}: Only ${item.product.stock} available, but ${item.quantity} requested`
        );
      }
    }

    const cart = this.calculateCartSummary(cartItems);

    return {
      isValid: errors.length === 0,
      errors,
      cart,
    };
  }

  /**
   * Calculate cart summary with totals
   */
  private static calculateCartSummary(cartItems: any[]): CartSummary {
    let subtotal = 0;
    let discount = 0;
    let totalItems = 0;

    for (const item of cartItems) {
      const itemPrice = item.product.price;
      const itemDiscount = item.product.discount ?? 0; // Use nullish coalescing
      const itemQuantity = item.quantity;

      totalItems += itemQuantity;
      
      const itemSubtotal = itemPrice * itemQuantity;
      const itemDiscountAmount = (itemSubtotal * itemDiscount) / 100;
      
      subtotal += itemSubtotal;
      discount += itemDiscountAmount;
    }

    const total = subtotal - discount;

    return {
      items: cartItems,
      totalItems,
      subtotal: Math.round(subtotal * 100) / 100, // Round to 2 decimal places
      discount: Math.round(discount * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  }

  /**
   * Sync cart with product stock (cleanup invalid items)
   */
  static async syncCartWithStock(userId: string): Promise<{
    removedItems: string[];
    updatedItems: string[];
  }> {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    const removedItems: string[] = [];
    const updatedItems: string[] = [];

    for (const item of cartItems) {
      if (item.product.stock === 0) {
        // Remove items that are out of stock
        await prisma.cartItem.delete({ where: { id: item.id } });
        removedItems.push(item.product.name);
      } else if (item.quantity > item.product.stock) {
        // Update quantity to available stock
        await prisma.cartItem.update({
          where: { id: item.id },
          data: { quantity: item.product.stock },
        });
        updatedItems.push(`${item.product.name} (reduced to ${item.product.stock})`);
      }
    }

    if (removedItems.length > 0 || updatedItems.length > 0) {
      logger.info(`Cart synced for user ${userId}: removed ${removedItems.length}, updated ${updatedItems.length}`);
    }

    return { removedItems, updatedItems };
  }

  /**
   * Get cart items for checkout (with latest product data)
   */
  static async getCartForCheckout(userId: string): Promise<CartSummary> {
    // First sync cart with current stock
    await this.syncCartWithStock(userId);
    
    // Then return updated cart
    return this.getCart(userId);
  }
}