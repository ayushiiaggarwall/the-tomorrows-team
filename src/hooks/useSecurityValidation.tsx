
import { useState, useCallback } from 'react';
import { validateInput } from '@/utils/securityValidation';
import { useToast } from '@/hooks/use-toast';

export const useSecurityValidation = () => {
  const { toast } = useToast();
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateBlogContent = useCallback((title: string, content: string) => {
    const errors: Record<string, string> = {};

    if (!validateInput.validateLength(title, 200)) {
      errors.title = 'Title must be less than 200 characters';
    }

    if (!validateInput.validateLength(content, 50000)) {
      errors.content = 'Content must be less than 50,000 characters';
    }

    if (title.trim().length === 0) {
      errors.title = 'Title is required';
    }

    if (content.trim().length === 0) {
      errors.content = 'Content is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, []);

  const validateTestimonial = useCallback((content: string, rating: number) => {
    const errors: Record<string, string> = {};

    if (!validateInput.validateLength(content, 2000)) {
      errors.content = 'Testimonial must be less than 2,000 characters';
    }

    if (!validateInput.validateRating(rating)) {
      errors.rating = 'Rating must be between 1 and 5';
    }

    if (content.trim().length === 0) {
      errors.content = 'Testimonial content is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, []);

  const validateRewardPoints = useCallback((points: number, reason: string) => {
    const errors: Record<string, string> = {};

    if (!validateInput.validatePoints(points)) {
      errors.points = 'Points must be between 0 and 10,000';
    }

    if (reason.trim().length === 0) {
      errors.reason = 'Reason is required';
    }

    if (!validateInput.validateLength(reason, 500)) {
      errors.reason = 'Reason must be less than 500 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, []);

  const sanitizeUserInput = useCallback((input: string) => {
    return validateInput.sanitizeHtml(input);
  }, []);

  const showSecurityError = useCallback((message: string) => {
    toast({
      title: "Security Validation Error",
      description: message,
      variant: "destructive",
    });
  }, [toast]);

  return {
    validationErrors,
    validateBlogContent,
    validateTestimonial,
    validateRewardPoints,
    sanitizeUserInput,
    showSecurityError,
    clearValidationErrors: () => setValidationErrors({})
  };
};
