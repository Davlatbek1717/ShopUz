import { Router } from 'express';
import { CartController } from '../controllers/cartController';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { body, param } from 'express-validator';

const router = Router();

// All cart routes require authentication
router.use(authenticateToken);

// Validation schemas
const addToCartValidation = [
  body('productId')
    .isString()
    .isLength({ min: 1 })
    .withMessage('Product ID is required'),
  body('quantity')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Quantity must be between 1 and 100'),
];

const updateCartItemValidation = [
  param('id')
    .isString()
    .isLength({ min: 1 })
    .withMessage('Cart item ID is required'),
  body('quantity')
    .isInt({ min: 1, max: 100 })
    .withMessage('Quantity must be between 1 and 100'),
];

const cartItemIdValidation = [
  param('id')
    .isString()
    .isLength({ min: 1 })
    .withMessage('Cart item ID is required'),
];

// Routes
router.get('/', CartController.getCart);
router.get('/count', CartController.getCartCount);
router.get('/validate', CartController.validateCart);

router.post('/items', addToCartValidation, validateRequest, CartController.addToCart);
router.post('/sync', CartController.syncCart);

router.put('/items/:id', updateCartItemValidation, validateRequest, CartController.updateCartItem);

router.delete('/', CartController.clearCart);
router.delete('/items/:id', cartItemIdValidation, validateRequest, CartController.removeFromCart);

export default router;