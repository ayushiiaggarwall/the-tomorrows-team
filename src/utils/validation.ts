// Input validation utilities for security hardening
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const validatePhone = (phone: string): boolean => {
  // Remove all non-digit characters for validation
  const cleanPhone = phone.replace(/\D/g, '');
  // Allow 10-15 digits (international format)
  return cleanPhone.length >= 10 && cleanPhone.length <= 15;
};

export const sanitizePhone = (phone: string): string => {
  // Keep only digits, spaces, dashes, parentheses, and plus sign
  return phone.replace(/[^0-9\s\-\(\)\+]/g, '');
};

export const validateTextLength = (text: string, maxLength: number): boolean => {
  return text.length <= maxLength && text.trim().length > 0;
};

export const sanitizeText = (text: string): string => {
  // Remove potentially dangerous HTML/script tags and excessive whitespace
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export const validatePoints = (points: number): boolean => {
  return Number.isInteger(points) && points >= 0 && points <= 10000;
};

export const validateRating = (rating: number): boolean => {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
};

// Rate limiting utility (simple in-memory implementation)
class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const record = this.requests.get(identifier);

    if (!record || now > record.resetTime) {
      this.requests.set(identifier, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (record.count >= this.maxRequests) {
      return false;
    }

    record.count++;
    return true;
  }
}

export const adminOperationLimiter = new RateLimiter(20, 60000); // 20 requests per minute
export const authLimiter = new RateLimiter(5, 300000); // 5 requests per 5 minutes
