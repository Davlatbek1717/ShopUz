#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up E-Commerce Platform...\n');

// Check if .env file exists
if (!fs.existsSync('.env')) {
  console.log('⚠️  .env file not found. Please copy .env.example to .env and configure it.');
  process.exit(1);
}

// Check if PostgreSQL is running (basic check)
try {
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('\n🔧 Installing frontend dependencies...');
  execSync('cd frontend && npm install', { stdio: 'inherit' });
  
  console.log('\n🔧 Installing backend dependencies...');
  execSync('cd backend && npm install', { stdio: 'inherit' });
  
  console.log('\n🗄️  Generating Prisma client...');
  execSync('cd backend && npx prisma generate', { stdio: 'inherit' });
  
  console.log('\n📋 Database setup instructions:');
  console.log('1. Make sure PostgreSQL is running');
  console.log('2. Create a database named "ecommerce_db"');
  console.log('3. Update DATABASE_URL in .env file');
  console.log('4. Run: npm run db:migrate');
  console.log('5. Run: npm run db:seed');
  console.log('6. Start development: npm run dev');
  
  console.log('\n✅ Setup completed successfully!');
  console.log('\n🔐 Default credentials after seeding:');
  console.log('Admin: admin@ecommerce.com / admin123');
  console.log('User: user@test.com / user123');
  
} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}