import prisma from '../lib/prisma';
import { logger } from '../utils/logger';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string;
  discount?: number;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductFilters {
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'price' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ProductListResponse {
  products: (Product & { category: Category })[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ProductService {
  /**
   * Get all products with filtering and pagination
   */
  static async getProducts(filters: ProductFilters): Promise<ProductListResponse> {
    const {
      categoryId,
      search,
      minPrice,
      maxPrice,
      inStock,
      page = 1,
      limit = 12,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    // Build where clause
    const where: any = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (inStock) {
      where.stock = { gt: 0 };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await prisma.product.count({ where });

    // Get products with category
    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    });

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get product by ID
   */
  static async getProductById(productId: string): Promise<(Product & { category: Category }) | null> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
      },
    });

    return product;
  }

  /**
   * Create new product (Admin only)
   */
  static async createProduct(data: {
    name: string;
    description: string;
    price: number;
    stock: number;
    images: string[];
    discount?: number;
    categoryId: string;
  }): Promise<Product & { category: Category }> {
    const { name, description, price, stock, images, discount, categoryId } = data;

    // Validate category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        price,
        stock,
        images: JSON.stringify(images), // Store as JSON string
        discount,
        categoryId,
      },
      include: {
        category: true,
      },
    });

    logger.info(`Product created: ${product.name} (ID: ${product.id})`);

    return product;
  }

  /**
   * Update product (Admin only)
   */
  static async updateProduct(
    productId: string,
    data: {
      name?: string;
      description?: string;
      price?: number;
      stock?: number;
      images?: string[];
      discount?: number;
      categoryId?: string;
    }
  ): Promise<Product & { category: Category }> {
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      throw new Error('Product not found');
    }

    // Validate category if provided
    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        throw new Error('Category not found');
      }
    }

    // Prepare update data
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.description !== undefined) updateData.description = data.description.trim();
    if (data.price !== undefined) updateData.price = data.price;
    if (data.stock !== undefined) updateData.stock = data.stock;
    if (data.images !== undefined) updateData.images = JSON.stringify(data.images);
    if (data.discount !== undefined) updateData.discount = data.discount;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;

    // Update product
    const product = await prisma.product.update({
      where: { id: productId },
      data: updateData,
      include: {
        category: true,
      },
    });

    logger.info(`Product updated: ${product.name} (ID: ${product.id})`);

    return product;
  }

  /**
   * Delete product (Admin only)
   */
  static async deleteProduct(productId: string): Promise<void> {
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Delete product
    await prisma.product.delete({
      where: { id: productId },
    });

    logger.info(`Product deleted: ${product.name} (ID: ${product.id})`);
  }

  /**
   * Get all categories
   */
  static async getCategories(): Promise<Category[]> {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    return categories;
  }

  /**
   * Create new category (Admin only)
   */
  static async createCategory(data: {
    name: string;
    description?: string;
  }): Promise<Category> {
    const { name, description } = data;

    // Check if category name already exists
    const existingCategory = await prisma.category.findUnique({
      where: { name: name.trim() },
    });

    if (existingCategory) {
      throw new Error('Category with this name already exists');
    }

    // Create category
    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        description: description?.trim(),
      },
    });

    logger.info(`Category created: ${category.name} (ID: ${category.id})`);

    return category;
  }

  /**
   * Update category (Admin only)
   */
  static async updateCategory(
    categoryId: string,
    data: {
      name?: string;
      description?: string;
    }
  ): Promise<Category> {
    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      throw new Error('Category not found');
    }

    // Check if new name conflicts with existing category
    if (data.name && data.name.trim() !== existingCategory.name) {
      const nameConflict = await prisma.category.findUnique({
        where: { name: data.name.trim() },
      });

      if (nameConflict) {
        throw new Error('Category with this name already exists');
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.description !== undefined) updateData.description = data.description?.trim();

    // Update category
    const category = await prisma.category.update({
      where: { id: categoryId },
      data: updateData,
    });

    logger.info(`Category updated: ${category.name} (ID: ${category.id})`);

    return category;
  }

  /**
   * Delete category (Admin only)
   */
  static async deleteCategory(categoryId: string): Promise<void> {
    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        products: true,
      },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    // Check if category has products
    if (category.products.length > 0) {
      throw new Error('Cannot delete category with existing products');
    }

    // Delete category
    await prisma.category.delete({
      where: { id: categoryId },
    });

    logger.info(`Category deleted: ${category.name} (ID: ${category.id})`);
  }

  /**
   * Get featured products
   */
  static async getFeaturedProducts(limit: number = 8): Promise<(Product & { category: Category })[]> {
    const products = await prisma.product.findMany({
      where: {
        stock: { gt: 0 },
      },
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return products;
  }

  /**
   * Search products
   */
  static async searchProducts(query: string, limit: number = 10): Promise<(Product & { category: Category })[]> {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
        stock: { gt: 0 },
      },
      include: {
        category: true,
      },
      take: limit,
      orderBy: { name: 'asc' },
    });

    return products;
  }
}