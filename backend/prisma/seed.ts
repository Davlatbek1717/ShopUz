import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create categories
  console.log('📂 Creating categories...');
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Electronics' },
      update: {},
      create: {
        name: 'Electronics',
        description: 'Electronic devices and gadgets',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Clothing' },
      update: {},
      create: {
        name: 'Clothing',
        description: 'Fashion and apparel',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Books' },
      update: {},
      create: {
        name: 'Books',
        description: 'Books and educational materials',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Home & Garden' },
      update: {},
      create: {
        name: 'Home & Garden',
        description: 'Home improvement and garden supplies',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Sports' },
      update: {},
      create: {
        name: 'Sports',
        description: 'Sports equipment and accessories',
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Create admin user
  console.log('👤 Creating admin user...');
  const hashedAdminPassword = await bcrypt.hash('admin123', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@ecommerce.com' },
    update: {},
    create: {
      email: 'admin@ecommerce.com',
      name: 'Admin User',
      password: hashedAdminPassword,
      role: 'ADMIN',
      address: '123 Admin Street, Admin City, AC 12345',
    },
  });

  // Create test user
  console.log('👤 Creating test user...');
  const hashedUserPassword = await bcrypt.hash('user123', 12);
  const testUser = await prisma.user.upsert({
    where: { email: 'user@test.com' },
    update: {},
    create: {
      email: 'user@test.com',
      name: 'Test User',
      password: hashedUserPassword,
      role: 'USER',
      address: '456 User Avenue, User City, UC 67890',
    },
  });

  console.log('✅ Created admin and test users');

  // Create sample products
  console.log('📦 Creating sample products...');
  const products = [
    // Electronics
    {
      name: 'Smartphone Pro Max',
      description: 'Latest flagship smartphone with advanced features, high-quality camera, and long battery life.',
      price: 999.99,
      stock: 50,
      categoryId: categories[0].id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500',
      ]),
      discount: 10.00,
    },
    {
      name: 'Wireless Headphones',
      description: 'Premium noise-cancelling wireless headphones with superior sound quality.',
      price: 299.99,
      stock: 75,
      categoryId: categories[0].id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      ]),
    },
    {
      name: 'Laptop Ultra',
      description: 'High-performance laptop perfect for work and gaming with latest processor.',
      price: 1299.99,
      stock: 25,
      categoryId: categories[0].id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500',
      ]),
    },
    
    // Clothing
    {
      name: 'Classic T-Shirt',
      description: 'Comfortable cotton t-shirt available in multiple colors and sizes.',
      price: 29.99,
      stock: 200,
      categoryId: categories[1].id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
      ]),
    },
    {
      name: 'Denim Jeans',
      description: 'Premium quality denim jeans with perfect fit and durability.',
      price: 79.99,
      stock: 100,
      categoryId: categories[1].id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500',
      ]),
      discount: 15.00,
    },
    {
      name: 'Winter Jacket',
      description: 'Warm and stylish winter jacket perfect for cold weather.',
      price: 149.99,
      stock: 60,
      categoryId: categories[1].id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500',
      ]),
    },
    
    // Books
    {
      name: 'JavaScript: The Complete Guide',
      description: 'Comprehensive guide to modern JavaScript programming with practical examples.',
      price: 49.99,
      stock: 150,
      categoryId: categories[2].id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500',
      ]),
    },
    {
      name: 'Design Patterns',
      description: 'Essential book on software design patterns for developers.',
      price: 59.99,
      stock: 80,
      categoryId: categories[2].id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
      ]),
    },
    
    // Home & Garden
    {
      name: 'Coffee Maker Deluxe',
      description: 'Premium coffee maker with multiple brewing options and timer function.',
      price: 199.99,
      stock: 40,
      categoryId: categories[3].id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500',
      ]),
    },
    {
      name: 'Garden Tool Set',
      description: 'Complete set of essential garden tools for all your gardening needs.',
      price: 89.99,
      stock: 35,
      categoryId: categories[3].id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500',
      ]),
    },
    
    // Sports
    {
      name: 'Yoga Mat Premium',
      description: 'High-quality yoga mat with excellent grip and cushioning.',
      price: 39.99,
      stock: 120,
      categoryId: categories[4].id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500',
      ]),
    },
    {
      name: 'Running Shoes',
      description: 'Comfortable running shoes with advanced cushioning technology.',
      price: 129.99,
      stock: 90,
      categoryId: categories[4].id,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
      ]),
      discount: 20.00,
    },
  ];

  const createdProducts = [];
  for (const productData of products) {
    const product = await prisma.product.create({
      data: productData,
    });
    createdProducts.push(product);
  }

  console.log(`✅ Created ${createdProducts.length} products`);

  // Create sample cart items for test user
  console.log('🛒 Creating sample cart items...');
  await prisma.cartItem.createMany({
    data: [
      {
        userId: testUser.id,
        productId: createdProducts[0].id, // Smartphone
        quantity: 1,
      },
      {
        userId: testUser.id,
        productId: createdProducts[3].id, // T-Shirt
        quantity: 2,
      },
    ],
  });

  console.log('✅ Created sample cart items');

  // Create sample order
  console.log('📋 Creating sample order...');
  const sampleOrder = await prisma.order.create({
    data: {
      userId: testUser.id,
      status: 'PAID',
      total: 1059.97, // Smartphone (999.99 - 10% discount) + T-Shirt (29.99 * 2)
      shippingAddress: testUser.address,
      items: {
        create: [
          {
            productId: createdProducts[0].id,
            quantity: 1,
            price: 899.99, // With discount
          },
          {
            productId: createdProducts[3].id,
            quantity: 2,
            price: 29.99,
          },
        ],
      },
    },
  });

  console.log('✅ Created sample order');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`- Categories: ${categories.length}`);
  console.log(`- Products: ${createdProducts.length}`);
  console.log(`- Users: 2 (1 admin, 1 test user)`);
  console.log(`- Orders: 1`);
  console.log('\n🔐 Test Credentials:');
  console.log('Admin: admin@ecommerce.com / admin123');
  console.log('User: user@test.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });