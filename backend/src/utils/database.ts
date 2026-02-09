import prisma from '../lib/prisma';
import { logger } from './logger';

/**
 * Test database connection
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    logger.info('✅ Database connection successful');
    return true;
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    return false;
  }
}

/**
 * Get database health status
 */
export async function getDatabaseHealth() {
  try {
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - startTime;

    return {
      status: 'healthy',
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Initialize database (run migrations if needed)
 */
export async function initializeDatabase() {
  try {
    logger.info('🔄 Initializing database...');
    
    // Test connection
    const isConnected = await testDatabaseConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to database');
    }

    // Check if database is properly migrated
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;

    logger.info(`📊 Found ${Array.isArray(tables) ? tables.length : 0} tables in database`);
    
    return true;
  } catch (error) {
    logger.error('❌ Database initialization failed:', error);
    throw error;
  }
}