#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🗄️  Setting up development database...\n');

try {
  // Check if .env exists
  if (!fs.existsSync('.env')) {
    console.log('⚠️  .env file not found. Copying from .env.example...');
    fs.copyFileSync('.env.example', '.env');
    console.log('✅ Created .env file. Please update DATABASE_URL and other settings.');
  }

  // Generate Prisma client
  console.log('🔧 Generating Prisma client...');
  execSync('cd backend && npx prisma generate', { stdio: 'inherit' });

  console.log('\n📋 Next steps:');
  console.log('1. Make sure PostgreSQL is running on your system');
  console.log('2. Create a database: createdb ecommerce_db');
  console.log('3. Update DATABASE_URL in .env if needed');
  console.log('4. Run migrations: npm run db:migrate');
  console.log('5. Seed database: npm run db:seed');
  console.log('6. Start development: npm run dev');

  console.log('\n💡 Quick PostgreSQL setup:');
  console.log('- Install PostgreSQL: https://postgresql.org/download/');
  console.log('- Create database: createdb ecommerce_db');
  console.log('- Default connection: postgresql://postgres:postgres@localhost:5432/ecommerce_db');

} catch (error) {
  console.error('❌ Database setup failed:', error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('- Make sure PostgreSQL is installed and running');
  console.log('- Check your DATABASE_URL in .env file');
  console.log('- Ensure the database exists: createdb ecommerce_db');
  process.exit(1);
}