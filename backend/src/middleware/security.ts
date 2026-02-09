import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * CSRF Protection Middleware
 * Simple CSRF protection using custom header validation
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Skip CSRF protection for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip CSRF protection for webhook endpoints
  if (req.path.includes('/webhook')) {
    return next();
  }

  // Check for CSRF token in custom header
  const csrfToken = req.headers['x-csrf-token'] || req.headers['x-requested-with'];

  if (!csrfToken) {
    logger.warn('CSRF protection: Missing CSRF token', {
      ip: req.ip,
      path: req.path,
      method: req.method,
      userAgent: req.get('User-Agent'),
    });

    return res.status(403).json({
      success: false,
      error: {
        message: 'CSRF token required',
        code: 'CSRF_TOKEN_MISSING',
        details: 'Include X-CSRF-Token or X-Requested-With header',
      },
      timestamp: new Date().toISOString(),
      path: req.path,
    });
  }

  next();
}

/**
 * Input Sanitization Middleware
 */
export function sanitizeInput(req: Request, _res: Response, next: NextFunction) {
  // Sanitize request body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }

  next();
}

/**
 * Recursively sanitize object properties
 */
function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
}

/**
 * Sanitize string input
 */
function sanitizeString(str: string): string {
  if (typeof str !== 'string') {
    return str;
  }

  return str
    .trim()
    // Remove potential XSS patterns
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    // Remove potential SQL injection patterns
    .replace(/('|(\\')|(;)|(\\)|(--)|(\s+or\s+)|(union\s+select))/gi, '')
    // Limit length to prevent DoS
    .substring(0, 10000);
}

/**
 * Request size limiter middleware
 */
export function requestSizeLimiter(maxSize: number = 10 * 1024 * 1024) { // 10MB default
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      logger.warn('Request size limit exceeded', {
        ip: req.ip,
        path: req.path,
        contentLength,
        maxSize,
      });

      return res.status(413).json({
        success: false,
        error: {
          message: 'Request entity too large',
          code: 'REQUEST_TOO_LARGE',
          maxSize: `${maxSize} bytes`,
        },
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }

    next();
  };
}

/**
 * IP Whitelist/Blacklist Middleware
 */
export function ipFilter(options: {
  whitelist?: string[];
  blacklist?: string[];
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.connection.remoteAddress || '';

    // Check blacklist first
    if (options.blacklist && options.blacklist.includes(clientIP)) {
      logger.warn('IP blocked by blacklist', {
        ip: clientIP,
        path: req.path,
      });

      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
          code: 'IP_BLOCKED',
        },
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }

    // Check whitelist if provided
    if (options.whitelist && options.whitelist.length > 0) {
      if (!options.whitelist.includes(clientIP)) {
        logger.warn('IP not in whitelist', {
          ip: clientIP,
          path: req.path,
        });

        return res.status(403).json({
          success: false,
          error: {
            message: 'Access denied',
            code: 'IP_NOT_WHITELISTED',
          },
          timestamp: new Date().toISOString(),
          path: req.path,
        });
      }
    }

    next();
  };
}

/**
 * Security Headers Middleware
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // Content Security Policy (basic)
  if (!req.path.includes('/webhook')) {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';"
    );
  }

  next();
}

/**
 * Request logging middleware for security monitoring
 */
export function securityLogger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();

  // Log suspicious patterns
  const suspiciousPatterns = [
    /\.\.\//,  // Directory traversal
    /<script/i, // XSS attempts
    /union\s+select/i, // SQL injection
    /exec\s*\(/i, // Code execution
    /eval\s*\(/i, // Code evaluation
  ];

  const requestData = JSON.stringify({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(requestData) || pattern.test(req.url)
  );

  if (isSuspicious) {
    logger.warn('Suspicious request detected', {
      ip: req.ip,
      method: req.method,
      path: req.path,
      userAgent: req.get('User-Agent'),
      body: req.body,
      query: req.query,
    });
  }

  // Log response time on finish
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    if (duration > 5000) { // Log slow requests
      logger.warn('Slow request detected', {
        ip: req.ip,
        method: req.method,
        path: req.path,
        duration: `${duration}ms`,
        statusCode: res.statusCode,
      });
    }
  });

  next();
}