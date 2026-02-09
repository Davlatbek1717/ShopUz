import { Router } from 'express';
import { OrderController } from '../controllers/orderController';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { body } from 'express-validator';

const router = Router();

// Validation schemas
const createOrderValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  
  body('phone')
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage('Phone number must be between 10 and 20 characters'),
  
  body('address')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Address must be between 10 and 200 characters'),
  
  body('city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  
  body('postalCode')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Postal code must be less than 20 characters'),
  
  body('paymentMethod')
    .isIn(['card', 'cash'])
    .withMessage('Payment method must be either "card" or "cash"'),
];

const updateOrderStatusValidation = [
  body('status')
    .isIn(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'])
    .withMessage('Invalid order status'),
];

// Routes

/**
 * @route   POST /api/orders
 * @desc    Create order from cart
 * @access  Private
 */
router.post('/', authenticateToken, createOrderValidation, validateRequest, OrderController.createOrder);

/**
 * @route   GET /api/orders
 * @desc    Get user's orders
 * @access  Private
 */
router.get('/', authenticateToken, OrderController.getUserOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Get order by ID
 * @access  Private
 */
router.get('/:id', authenticateToken, OrderController.getOrder);

/**
 * @route   PUT /api/orders/:id/cancel
 * @desc    Cancel order
 * @access  Private
 */
router.put('/:id/cancel', authenticateToken, OrderController.cancelOrder);

// Admin routes

/**
 * @route   GET /api/admin/orders
 * @desc    Get all orders (admin only)
 * @access  Private (Admin)
 */
router.get('/admin/orders', authenticateToken, OrderController.getAllOrders);

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status (admin only)
 * @access  Private (Admin)
 */
router.put('/:id/status', authenticateToken, updateOrderStatusValidation, validateRequest, OrderController.updateOrderStatus);

/**
 * @route   GET /api/admin/orders/statistics
 * @desc    Get order statistics (admin only)
 * @access  Private (Admin)
 */
router.get('/admin/orders/statistics', authenticateToken, OrderController.getOrderStatistics);

export default router;