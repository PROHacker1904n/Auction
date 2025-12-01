import Joi from 'joi';

// User validation schemas
export const userRegistrationSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]')).required()
    .messages({
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
  urn: Joi.string().optional(),
  graduationYear: Joi.number().integer().min(1900).max(2100).optional(),
  studentId: Joi.string().optional(),
  phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional()
});

export const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Listing validation schemas
export const listingSchema = Joi.object({
  title: Joi.string().min(5).max(100).required(),
  description: Joi.string().min(10).max(1000).required(),
  startPrice: Joi.number().positive().required(),
  startTime: Joi.date().greater('now').required(),
  endTime: Joi.date().greater(Joi.ref('startTime')).required(),
  image: Joi.string().uri().required(),
  category: Joi.string().valid('electronics', 'books', 'clothing', 'furniture', 'sports', 'stationary', 'other').required(),
  condition: Joi.string().valid('new', 'like-new', 'good', 'fair', 'poor').required(),
  targetGender: Joi.string().valid('male', 'female', 'all').optional()
});

// Bid validation schema
export const bidSchema = Joi.object({
  amount: Joi.number().positive().required()
});

// Rating validation schema
export const ratingSchema = Joi.object({
  ratedUserId: Joi.string().required(),
  listingId: Joi.string().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().max(500).optional(),
  isAnonymous: Joi.boolean().optional()
});

// Review validation schema
export const reviewSchema = Joi.object({
  reviewedUserId: Joi.string().required(),
  listingId: Joi.string().required(),
  transactionId: Joi.string().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  title: Joi.string().min(5).max(100).required(),
  content: Joi.string().min(10).max(1000).required(),
  isAnonymous: Joi.boolean().optional()
});

// Transaction validation schema
export const transactionSchema = Joi.object({
  listingId: Joi.string().required(),
  finalPrice: Joi.number().positive().required(),
  shippingAddress: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zipCode: Joi.string().required(),
    country: Joi.string().required()
  }).required()
});

// Report validation schema
export const reportSchema = Joi.object({
  reportedUserId: Joi.string().optional(),
  reportedListingId: Joi.string().optional(),
  type: Joi.string().valid(
    'fraud',
    'fake_item',
    'inappropriate_content',
    'harassment',
    'spam',
    'scam',
    'payment_issue',
    'shipping_issue',
    'other'
  ).required(),
  reason: Joi.string().min(10).max(500).required(),
  description: Joi.string().min(20).max(1000).optional(),
  evidence: Joi.array().items(Joi.string().uri()).optional()
}).custom((value, helpers) => {
  if (!value.reportedUserId && !value.reportedListingId) {
    return helpers.error('custom.missingTarget');
  }
  return value;
}).messages({
  'custom.missingTarget': 'Must report either a user or listing'
});

// Notification preferences schema
export const notificationPreferencesSchema = Joi.object({
  emailNotifications: Joi.boolean().optional(),
  pushNotifications: Joi.boolean().optional(),
  bidNotifications: Joi.boolean().optional(),
  auctionEndNotifications: Joi.boolean().optional(),
  reviewNotifications: Joi.boolean().optional(),
  messageNotifications: Joi.boolean().optional()
});

// Password strength validator
export const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[@$!%*?&]/.test(password);
  
  const errors = [];
  
  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  if (!hasUpperCase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!hasNumbers) {
    errors.push('Password must contain at least one number');
  }
  if (!hasSpecialChar) {
    errors.push('Password must contain at least one special character (@$!%*?&)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone number validation
export const validatePhoneNumber = (phone) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

// Sanitize input
export const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }
  return input;
};
