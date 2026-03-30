
// Secure error handling utilities
interface ErrorResponse {
  message: string;
  code?: string;
  details?: string;
}

export const createSafeError = (error: any, context: string): ErrorResponse => {
  // In production, don't expose internal error details
  const isProduction = import.meta.env.PROD;
  
  if (isProduction) {
    // Generic error messages for production
    const safeMessages: Record<string, string> = {
      'auth': 'Authentication failed. Please check your credentials.',
      'database': 'Unable to process your request. Please try again.',
      'validation': 'Invalid input provided. Please check your data.',
      'permission': 'You do not have permission to perform this action.',
      'network': 'Network error. Please check your connection.',
      'default': 'An unexpected error occurred. Please try again.'
    };
    
    return {
      message: safeMessages[context] || safeMessages.default,
      code: 'GENERIC_ERROR'
    };
  }

  // Development mode - show more details
  return {
    message: error?.message || 'An error occurred',
    code: error?.code || 'UNKNOWN_ERROR',
    details: error?.details || JSON.stringify(error)
  };
};

export const logSecurityEvent = (event: string, details: any, userId?: string) => {
  // In production, this would send to a proper logging service
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    userId,
    details: typeof details === 'object' ? JSON.stringify(details) : details,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown'
  };
  
  // For now, just console.error in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('Security Event:', logEntry);
  }
  
  // TODO: Send to monitoring service in production
};
