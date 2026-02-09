import { Router } from 'express';
import { ProductController } from '../controllers/productController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { body, param, query } from 'express-validator';

const router = Router();

// Validation schemas
const createProductValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Product name must be between 1 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Product description must be between 1 and 2000 characters'),
  body('price')
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number'),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('categoryId')
    .isString()
    .isLength({ min: 1 })
    .withMessage('Category ID is required'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  body('discount')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Discount must be between 0 and 100'),
];

const updateProductValidation = [
  param('id')
    .isString()
    .isLength({ min: 1 })
    .withMessage('Product ID is required'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Product name must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Product description must be between 1 and 2000 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('categoryId')
    .optional()
    .isString()
    .isLength({ min: 1 })
    .withMessage('Category ID must be a valid string'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  body('discount')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Discount must be between 0 and 100'),
];

const createCategoryValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Category name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Category description must be less than 500 characters'),
];

const updateCategoryValidation = [
  param('id')
    .isString()
    .isLength({ min: 1 })
    .withMessage('Category ID is required'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Category name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Category description must be less than 500 characters'),
];

const productQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be non-negative'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be non-negative'),
  query('sortBy')
    .optional()
    .isIn(['name', 'price', 'createdAt'])
    .withMessage('Sort by must be one of: name, price, createdAt'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
];

// Public routes
router.get('/', productQueryValidation, validateRequest, ProductController.getProducts);
router.get('/featured', ProductController.getFeaturedProducts);
router.get('/search', ProductController.searchProducts);
router.get('/:id', ProductController.getProductById);

// Category routes (public read access)
router.get('/categories', ProductController.getCategories);

// Admin-only routes for products
router.post('/', 
  authenticateToken, 
  requireAdmin, 
  createProductValidation, 
  validateRequest, 
  ProductController.createProduct
);

router.put('/:id', 
  authenticateToken, 
  requireAdmin, 
  updateProductValidation, 
  validateRequest, 
  ProductController.updateProduct
);

router.delete('/:id', 
  authenticateToken, 
  requireAdmin, 
  ProductController.deleteProduct
);

// Admin-only routes for categories
router.post('/categories', 
  authenticateToken, 
  requireAdmin, 
  createCategoryValidation, 
  validateRequest, 
  ProductController.createCategory
);

router.put('/categories/:id', 
  authenticateToken, 
  requireAdmin, 
  updateCategoryValidation, 
  validateRequest, 
  ProductController.updateCategory
);

router.delete('/categories/:id', 
  authenticateToken, 
  requireAdmin, 
  ProductController.deleteCategory
);

export default router;