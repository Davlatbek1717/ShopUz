-- Initialize database with extensions and basic setup
-- This file is used by Docker to initialize the PostgreSQL database

-- Create database if it doesn't exist (handled by Docker)
-- CREATE DATABASE IF NOT EXISTS ecommerce_db;

-- Enable UUID extension for better ID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create indexes for better performance (these will be created by Prisma migrations)
-- Additional custom indexes can be added here if needed

-- Set timezone
SET timezone = 'UTC';