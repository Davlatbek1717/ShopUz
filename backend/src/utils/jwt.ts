import jwt from 'jsonwebtoken';
import { logger } from './logger';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  type: 'access' | 'refresh';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Generate JWT access token
 */
export function generateAccessToken(payload: Omit<JwtPayload, 'type'>): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  const tokenPayload: JwtPayload = {
    ...payload,
    type: 'access',
  };

  return jwt.sign(tokenPayload, secret, {
    expiresIn: process.env.JWT_EXPIRE || '15m',
    issuer: 'ecommerce-platform',
    audience: 'ecommerce-users',
  } as jwt.SignOptions);
}

/**
 * Generate JWT refresh token
 */
export function generateRefreshToken(payload: Omit<JwtPayload, 'type'>): string {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
  }

  const tokenPayload: JwtPayload = {
    ...payload,
    type: 'refresh',
  };

  return jwt.sign(tokenPayload, secret, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
    issuer: 'ecommerce-platform',
    audience: 'ecommerce-users',
  } as jwt.SignOptions);
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokenPair(payload: Omit<JwtPayload, 'type'>): TokenPair {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

/**
 * Verify JWT access token
 */
export function verifyAccessToken(token: string): JwtPayload {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  try {
    const decoded = jwt.verify(token, secret, {
      issuer: 'ecommerce-platform',
      audience: 'ecommerce-users',
    }) as JwtPayload;

    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    logger.warn('Access token verification failed:', error);
    throw new Error('Invalid or expired access token');
  }
}

/**
 * Verify JWT refresh token
 */
export function verifyRefreshToken(token: string): JwtPayload {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
  }

  try {
    const decoded = jwt.verify(token, secret, {
      issuer: 'ecommerce-platform',
      audience: 'ecommerce-users',
    }) as JwtPayload;

    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    logger.warn('Refresh token verification failed:', error);
    throw new Error('Invalid or expired refresh token');
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Decode JWT token without verification (for debugging)
 */
export function decodeToken(token: string): any {
  try {
    return jwt.decode(token);
  } catch (error) {
    logger.error('Token decode failed:', error);
    return null;
  }
}