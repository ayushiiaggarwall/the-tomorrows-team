
// Security validation utilities
export const validateInput = {
  // Sanitize HTML content to prevent XSS
  sanitizeHtml: (input: string): string => {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  },

  // Validate text length
  validateLength: (text: string, maxLength: number): boolean => {
    return text.length <= maxLength;
  },

  // Validate points range
  validatePoints: (points: number): boolean => {
    return points >= 0 && points <= 10000;
  },

  // Validate rating range
  validateRating: (rating: number): boolean => {
    return rating >= 1 && rating <= 5;
  },

  // Validate slot capacity
  validateSlotCapacity: (capacity: number): boolean => {
    return capacity > 0 && capacity <= 100;
  },

  // Validate email format
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Remove potentially dangerous characters
  sanitizeString: (input: string): string => {
    return input.replace(/[<>\"']/g, '');
  }
};

// Rate limiting for client-side operations
export class ClientRateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(key);

    if (!attempt || now > attempt.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (attempt.count >= this.maxAttempts) {
      return false;
    }

    attempt.count++;
    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}
