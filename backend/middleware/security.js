import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';

// Rate limiting
export const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { message },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// General rate limiter
export const generalLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // limit each IP to 100 requests per windowMs
  'Too many requests from this IP, please try again later.'
);

// Strict rate limiter for auth endpoints
export const authLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // limit each IP to 5 requests per windowMs
  'Too many authentication attempts, please try again later.'
);

// Bidding rate limiter
export const biddingLimiter = createRateLimit(
  60 * 1000, // 1 minute
  10, // limit each IP to 10 bids per minute
  'Too many bids, please slow down.'
);

// Security headers
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// Data sanitization
export const sanitizeData = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`This request[${key}] is sanitized`, req[key]);
  },
});

// XSS protection
export const xssProtection = xss();

// HTTP Parameter Pollution protection
export const hppProtection = hpp();

// Input validation middleware
export const validateInput = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

// IP whitelist for admin functions
export const ipWhitelist = (allowedIPs) => {
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    if (allowedIPs.includes(clientIP)) {
      next();
    } else {
      res.status(403).json({ message: 'Access denied' });
    }
  };
};

// Request logging for security monitoring
export const securityLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent');
  const method = req.method;
  const url = req.originalUrl;
  
  console.log(`[${timestamp}] ${ip} ${method} ${url} - ${userAgent}`);
  
  // Log suspicious activity
  if (req.body && typeof req.body === 'object') {
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /union\s+select/i,
      /drop\s+table/i,
      /insert\s+into/i,
      /delete\s+from/i
    ];
    
    const bodyString = JSON.stringify(req.body).toLowerCase();
    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(bodyString));
    
    if (isSuspicious) {
      console.warn(`[SECURITY WARNING] Suspicious activity detected from ${ip}: ${bodyString}`);
    }
  }
  
  next();
};

// Account lockout protection
export const accountLockout = () => {
  const failedAttempts = new Map();
  const lockoutDuration = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;
  
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    // Clean up old entries
    for (const [key, data] of failedAttempts.entries()) {
      if (now - data.lastAttempt > lockoutDuration) {
        failedAttempts.delete(key);
      }
    }
    
    const attempts = failedAttempts.get(ip);
    
    if (attempts && attempts.count >= maxAttempts) {
      const timeLeft = Math.ceil((lockoutDuration - (now - attempts.lastAttempt)) / 1000 / 60);
      return res.status(429).json({
        message: `Account temporarily locked. Try again in ${timeLeft} minutes.`
      });
    }
    
    // Track failed login attempts
    if (req.path.includes('/login') && req.method === 'POST') {
      req.on('response', (response) => {
        if (response.statusCode === 401) {
          const current = failedAttempts.get(ip) || { count: 0, lastAttempt: 0 };
          failedAttempts.set(ip, {
            count: current.count + 1,
            lastAttempt: now
          });
        } else if (response.statusCode === 200) {
          // Reset on successful login
          failedAttempts.delete(ip);
        }
      });
    }
    
    next();
  };
};
