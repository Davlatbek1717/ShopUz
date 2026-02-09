import { Request, Response } from 'express';
import { ProductService } from '../services/productService';
import { logger } from '../utils/logger';

export class ProductController {
  /**
   * Get all products with filtering and pagination
   * GET /api/products
   */
  static async getProducts(req: Request, res: Response) {
    try {
      const {
        categoryId,
        search,
        minPrice,
        maxPrice,
        inStock,
        page,
        limit,
        sortBy,
        sortOrder,
      } = req.query;

      const filters = {
        categoryId: categoryId as string,
        search: search as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        inStock: inStock === 'true',
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        sortBy: sortBy as 'name' | 'price' | 'createdAt',
        sortOrder: sortOrder as 'asc' | 'desc',
      };

      const result = await ProductService.getProducts(filters);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error getting products:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get products',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get product by ID
   * GET /api/products/:id
   */
  static async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const product = await ProductService.getProductById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      logger.error('Error getting product:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get product',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Create new product (Admin only)
   * POST /api/products
   */
  static async createProduct(req: Request, res: Response) {
    try {
      const { name, description, price, stock, images, discount, categoryId } = req.body;

      // Validation
      if (!name || !description || !price || !stock || !categoryId) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: name, description, price, stock, categoryId',
        });
      }

      if (price <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Price must be greater than 0',
        });
      }

      if (stock < 0) {
        return res.status(400).json({
          success: false,
          message: 'Stock cannot be negative',
        });
      }

      if (discount && (discount < 0 || discount > 100)) {
        return res.status(400).json({
          success: false,
          message: 'Discount must be between 0 and 100',
        });
      }

      const product = await ProductService.createProduct({
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        images: images || [],
        discount: discount ? parseFloat(discount) : undefined,
        categoryId,
      });

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product,
      });
    } catch (error) {
      logger.error('Error creating product:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create product',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Update product (Admin only)
   * PUT /api/products/:id
   */
  static async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, price, stock, images, discount, categoryId } = req.body;

      // Validation
      if (price !== undefined && price <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Price must be greater than 0',
        });
      }

      if (stock !== undefined && stock < 0) {
        return res.status(400).json({
          success: false,
          message: 'Stock cannot be negative',
        });
      }

      if (discount !== undefined && (discount < 0 || discount > 100)) {
        return res.status(400).json({
          success: false,
          message: 'Discount must be between 0 and 100',
        });
      }

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (price !== undefined) updateData.price = parseFloat(price);
      if (stock !== undefined) updateData.stock = parseInt(stock);
      if (images !== undefined) updateData.images = images;
      if (discount !== undefined) updateData.discount = parseFloat(discount);
      if (categoryId !== undefined) updateData.categoryId = categoryId;

      const product = await ProductService.updateProduct(id, updateData);

      res.json({
        success: true,
        message: 'Product updated successfully',
        data: product,
      });
    } catch (error) {
      logger.error('Error updating product:', error);
      
      if (error instanceof Error && error.message === 'Product not found') {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      if (error instanceof Error && error.message === 'Category not found') {
        return res.status(400).json({
          success: false,
          message: 'Category not found',
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update product',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Delete product (Admin only)
   * DELETE /api/products/:id
   */
  static async deleteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await ProductService.deleteProduct(id);

      res.json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting product:', error);
      
      if (error instanceof Error && error.message === 'Product not found') {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to delete product',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get all categories
   * GET /api/categories
   */
  static async getCategories(req: Request, res: Response) {
    try {
      const categories = await ProductService.getCategories();

      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      logger.error('Error getting categories:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get categories',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Create new category (Admin only)
   * POST /api/categories
   */
  static async createCategory(req: Request, res: Response) {
    try {
      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Category name is required',
        });
      }

      const category = await ProductService.createCategory({
        name,
        description,
      });

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category,
      });
    } catch (error) {
      logger.error('Error creating category:', error);
      
      if (error instanceof Error && error.message === 'Category with this name already exists') {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists',
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create category',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Update category (Admin only)
   * PUT /api/categories/:id
   */
  static async updateCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      const category = await ProductService.updateCategory(id, {
        name,
        description,
      });

      res.json({
        success: true,
        message: 'Category updated successfully',
        data: category,
      });
    } catch (error) {
      logger.error('Error updating category:', error);
      
      if (error instanceof Error && error.message === 'Category not found') {
        return res.status(404).json({
          success: false,
          message: 'Category not found',
        });
      }

      if (error instanceof Error && error.message === 'Category with this name already exists') {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists',
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update category',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Delete category (Admin only)
   * DELETE /api/categories/:id
   */
  static async deleteCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await ProductService.deleteCategory(id);

      res.json({
        success: true,
        message: 'Category deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting category:', error);
      
      if (error instanceof Error && error.message === 'Category not found') {
        return res.status(404).json({
          success: false,
          message: 'Category not found',
        });
      }

      if (error instanceof Error && error.message === 'Cannot delete category with existing products') {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete category with existing products',
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to delete category',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get featured products
   * GET /api/products/featured
   */
  static async getFeaturedProducts(req: Request, res: Response) {
    try {
      const { limit } = req.query;
      const limitNum = limit ? parseInt(limit as string) : 8;

      const products = await ProductService.getFeaturedProducts(limitNum);

      res.json({
        success: true,
        data: products,
      });
    } catch (error) {
      logger.error('Error getting featured products:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get featured products',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Search products
   * GET /api/products/search
   */
  static async searchProducts(req: Request, res: Response) {
    try {
      const { q, limit } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required',
        });
      }

      const limitNum = limit ? parseInt(limit as string) : 10;
      const products = await ProductService.searchProducts(q as string, limitNum);

      res.json({
        success: true,
        data: products,
      });
    } catch (error) {
      logger.error('Error searching products:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search products',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}