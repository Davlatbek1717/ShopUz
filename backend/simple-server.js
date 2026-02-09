const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Simple routes
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'E-Commerce Backend is running'
  });
});

app.get('/api', (req, res) => {
  res.json({
    message: 'E-Commerce Platform API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      api: '/api',
      products: '/api/products',
      categories: '/api/categories'
    }
  });
});

// Sample products data
const sampleProducts = [
  {
    id: '1',
    name: 'Smartphone Samsung Galaxy S24',
    description: 'Latest Samsung smartphone with advanced features',
    price: 999.99,
    stock: 50,
    images: ['https://via.placeholder.com/300x300?text=Samsung+S24'],
    discount: 10,
    categoryId: '1',
    category: { id: '1', name: 'Electronics', description: 'Electronic devices' }
  },
  {
    id: '2',
    name: 'MacBook Pro 16"',
    description: 'Powerful laptop for professionals',
    price: 2499.99,
    stock: 25,
    images: ['https://via.placeholder.com/300x300?text=MacBook+Pro'],
    discount: 5,
    categoryId: '1',
    category: { id: '1', name: 'Electronics', description: 'Electronic devices' }
  },
  {
    id: '3',
    name: 'Nike Air Max 270',
    description: 'Comfortable running shoes',
    price: 149.99,
    stock: 100,
    images: ['https://via.placeholder.com/300x300?text=Nike+Air+Max'],
    categoryId: '2',
    category: { id: '2', name: 'Fashion', description: 'Clothing and accessories' }
  }
];

const sampleCategories = [
  { id: '1', name: 'Electronics', description: 'Electronic devices and gadgets' },
  { id: '2', name: 'Fashion', description: 'Clothing and accessories' },
  { id: '3', name: 'Home & Garden', description: 'Home improvement and garden items' }
];

// Sample cart data (in-memory for demo)
let sampleCart = [
  {
    id: 'cart1',
    userId: 'user1',
    productId: '1',
    quantity: 2,
    product: sampleProducts[0]
  },
  {
    id: 'cart2', 
    userId: 'user1',
    productId: '3',
    quantity: 1,
    product: sampleProducts[2]
  }
];

// Sample orders data (in-memory for demo)
let sampleOrders = [
  {
    id: 'order1',
    userId: 'user1',
    status: 'CONFIRMED',
    totalAmount: 1299.98,
    shippingAddress: JSON.stringify({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+998901234567',
      address: 'Toshkent shahar, Yunusobod tumani',
      city: 'Toshkent',
      postalCode: '100000'
    }),
    paymentMethod: 'card',
    paymentStatus: 'PAID',
    createdAt: new Date('2024-01-15'),
    items: [
      {
        id: 'item1',
        productId: '1',
        quantity: 1,
        price: 999.99,
        product: sampleProducts[0]
      },
      {
        id: 'item2',
        productId: '3',
        quantity: 2,
        price: 149.99,
        product: sampleProducts[2]
      }
    ]
  }
];

// Cart endpoints
app.get('/api/cart', (req, res) => {
  // For demo, return sample cart
  const items = sampleCart;
  let subtotal = 0;
  let discount = 0;
  let totalItems = 0;

  items.forEach(item => {
    const itemPrice = item.product.price;
    const itemDiscount = item.product.discount || 0;
    const itemQuantity = item.quantity;

    totalItems += itemQuantity;
    
    const itemSubtotal = itemPrice * itemQuantity;
    const itemDiscountAmount = (itemSubtotal * itemDiscount) / 100;
    
    subtotal += itemSubtotal;
    discount += itemDiscountAmount;
  });

  const total = subtotal - discount;

  res.json({
    success: true,
    data: {
      items,
      totalItems,
      subtotal: Math.round(subtotal * 100) / 100,
      discount: Math.round(discount * 100) / 100,
      total: Math.round(total * 100) / 100
    }
  });
});

app.post('/api/cart/items', (req, res) => {
  const { productId, quantity = 1 } = req.body;
  
  if (!productId) {
    return res.status(400).json({
      success: false,
      message: 'Product ID is required'
    });
  }

  const product = sampleProducts.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  // Check if item already exists
  const existingItem = sampleCart.find(item => item.productId === productId);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    sampleCart.push({
      id: `cart${Date.now()}`,
      userId: 'user1',
      productId,
      quantity,
      product
    });
  }

  res.json({
    success: true,
    message: 'Item added to cart successfully'
  });
});

app.put('/api/cart/items/:id', (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  const item = sampleCart.find(item => item.id === id);
  if (!item) {
    return res.status(404).json({
      success: false,
      message: 'Cart item not found'
    });
  }

  item.quantity = quantity;

  res.json({
    success: true,
    message: 'Cart item updated successfully'
  });
});

app.delete('/api/cart/items/:id', (req, res) => {
  const { id } = req.params;
  
  const index = sampleCart.findIndex(item => item.id === id);
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: 'Cart item not found'
    });
  }

  sampleCart.splice(index, 1);

  res.json({
    success: true,
    message: 'Item removed from cart successfully'
  });
});

app.delete('/api/cart', (req, res) => {
  sampleCart = [];
  res.json({
    success: true,
    message: 'Cart cleared successfully'
  });
});

app.get('/api/cart/count', (req, res) => {
  const count = sampleCart.reduce((total, item) => total + item.quantity, 0);
  res.json({
    success: true,
    data: { count }
  });
});

// Product endpoints
app.get('/api/products', (req, res) => {
  const { search, categoryId, page = 1, limit = 12 } = req.query;
  let filteredProducts = [...sampleProducts];

  // Filter by search
  if (search) {
    filteredProducts = filteredProducts.filter(product => 
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.description.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Filter by category
  if (categoryId) {
    filteredProducts = filteredProducts.filter(product => 
      product.categoryId === categoryId
    );
  }

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: {
      products: paginatedProducts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredProducts.length,
        totalPages: Math.ceil(filteredProducts.length / limit)
      }
    }
  });
});

app.get('/api/products/featured', (req, res) => {
  res.json({
    success: true,
    data: sampleProducts.slice(0, 3)
  });
});

app.get('/api/products/search', (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({
      success: false,
      message: 'Search query is required'
    });
  }

  const results = sampleProducts.filter(product => 
    product.name.toLowerCase().includes(q.toLowerCase()) ||
    product.description.toLowerCase().includes(q.toLowerCase())
  );

  res.json({
    success: true,
    data: results
  });
});

app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const product = sampleProducts.find(p => p.id === id);
  
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  res.json({
    success: true,
    data: product
  });
});

// Category endpoints
app.get('/api/categories', (req, res) => {
  res.json({
    success: true,
    data: sampleCategories
  });
});

// Order endpoints
app.post('/api/orders', (req, res) => {
  const orderData = req.body;
  
  // Validate required fields
  const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'paymentMethod'];
  const missingFields = requiredFields.filter(field => !orderData[field]);

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${missingFields.join(', ')}`
    });
  }

  // Calculate total from current cart
  let total = 0;
  const orderItems = sampleCart.map(cartItem => {
    const itemPrice = cartItem.product.price;
    const itemDiscount = cartItem.product.discount || 0;
    const discountedPrice = itemPrice * (1 - itemDiscount / 100);
    const itemTotal = discountedPrice * cartItem.quantity;
    total += itemTotal;

    return {
      id: `item${Date.now()}_${cartItem.id}`,
      productId: cartItem.productId,
      quantity: cartItem.quantity,
      price: discountedPrice,
      product: cartItem.product
    };
  });

  // Create new order
  const newOrder = {
    id: `order${Date.now()}`,
    userId: 'user1',
    status: 'PENDING',
    totalAmount: Math.round(total * 100) / 100,
    shippingAddress: JSON.stringify({
      firstName: orderData.firstName,
      lastName: orderData.lastName,
      email: orderData.email,
      phone: orderData.phone,
      address: orderData.address,
      city: orderData.city,
      postalCode: orderData.postalCode || ''
    }),
    paymentMethod: orderData.paymentMethod,
    paymentStatus: orderData.paymentMethod === 'cash' ? 'PENDING' : 'PENDING',
    createdAt: new Date(),
    items: orderItems
  };

  // Add to orders and clear cart
  sampleOrders.unshift(newOrder);
  sampleCart = [];

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: newOrder
  });
});

app.get('/api/orders', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  const userOrders = sampleOrders.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: {
      orders: userOrders,
      pagination: {
        page,
        limit,
        total: sampleOrders.length,
        totalPages: Math.ceil(sampleOrders.length / limit)
      }
    }
  });
});

app.get('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const order = sampleOrders.find(o => o.id === id);
  
  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  res.json({
    success: true,
    data: order
  });
});

app.put('/api/orders/:id/cancel', (req, res) => {
  const { id } = req.params;
  const orderIndex = sampleOrders.findIndex(o => o.id === id);
  
  if (orderIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  const order = sampleOrders[orderIndex];
  
  if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
    return res.status(400).json({
      success: false,
      message: `Cannot cancel order with status ${order.status}`
    });
  }

  order.status = 'CANCELLED';
  
  res.json({
    success: true,
    message: 'Order cancelled successfully',
    data: order
  });
});

// Sample users data (in-memory for demo)
const sampleUsers = [
  {
    id: 'user1',
    email: 'user@test.com',
    password: 'user123', // In real app, this would be hashed
    firstName: 'Test',
    lastName: 'User',
    role: 'USER'
  },
  {
    id: 'admin1',
    email: 'admin@ecommerce.com',
    password: 'admin123', // In real app, this would be hashed
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN'
  }
];

// Test auth endpoints
app.post('/api/auth/register', (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  
  // Check if user already exists
  const existingUser = sampleUsers.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'Bu email manzil allaqachon ro\'yxatdan o\'tgan'
    });
  }

  // Create new user
  const newUser = {
    id: `user${Date.now()}`,
    email,
    password, // In real app, hash this
    firstName,
    lastName,
    role: 'USER'
  };

  sampleUsers.push(newUser);

  // Return user data (without password) and token
  const { password: _, ...userWithoutPassword } = newUser;
  
  res.status(201).json({
    success: true,
    message: 'Ro\'yxatdan o\'tish muvaffaqiyatli yakunlandi',
    data: {
      user: userWithoutPassword,
      token: `demo_token_${newUser.id}`
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Find user
  const user = sampleUsers.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Email yoki parol noto\'g\'ri'
    });
  }

  // Return user data (without password) and token
  const { password: _, ...userWithoutPassword } = user;
  
  res.json({
    success: true,
    message: 'Muvaffaqiyatli kirildi',
    data: {
      user: userWithoutPassword,
      token: `demo_token_${user.id}`
    }
  });
});

app.get('/api/users/profile', (req, res) => {
  // For demo, return first user
  const { password: _, ...userWithoutPassword } = sampleUsers[0];
  
  res.json({
    success: true,
    data: userWithoutPassword
  });
});

app.put('/api/users/profile', (req, res) => {
  const { firstName, lastName, email } = req.body;
  
  // For demo, update first user
  const user = sampleUsers[0];
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (email) user.email = email;
  
  const { password: _, ...userWithoutPassword } = user;
  
  res.json({
    success: true,
    message: 'Profil muvaffaqiyatli yangilandi',
    data: userWithoutPassword
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📱 Environment: development`);
  console.log(`🌐 Frontend URL: http://localhost:3000`);
  console.log(`💾 Database: SQLite (will connect later)`);
});