import rateLimit from 'express-rate-limit';

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
