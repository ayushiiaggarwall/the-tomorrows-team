
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSecurityValidation } from '@/hooks/useSecurityValidation';
import { AlertTriangle } from 'lucide-react';

interface SecureInputProps {
  type?: 'text' | 'email' | 'textarea';
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  required?: boolean;
  placeholder?: string;
}

const SecureInput: React.FC<SecureInputProps> = ({
  type = 'text',
  name,
  label,
  value,
  onChange,
  maxLength,
  required = false,
  placeholder
}) => {
  const { sanitizeUserInput } = useSecurityValidation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const sanitizedValue = sanitizeUserInput(e.target.value);
    onChange(sanitizedValue);
  };

  const inputProps = {
    name,
    value,
    onChange: handleChange,
    maxLength,
    required,
    placeholder,
    className: "w-full"
  };

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {type === 'textarea' ? (
        <Textarea {...inputProps} rows={4} />
      ) : (
        <Input {...inputProps} type={type} />
      )}
      {maxLength && (
        <p className="text-xs text-gray-500">
          {value.length}/{maxLength} characters
        </p>
      )}
    </div>
  );
};

interface SecureFormProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  validationErrors?: Record<string, string>;
  isSubmitting?: boolean;
  submitText?: string;
}

const SecureForm: React.FC<SecureFormProps> = ({
  children,
  onSubmit,
  validationErrors = {},
  isSubmitting = false,
  submitText = 'Submit'
}) => {
  const hasErrors = Object.keys(validationErrors).length > 0;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {hasErrors && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please fix the following errors:
            <ul className="mt-2 list-disc list-inside">
              {Object.entries(validationErrors).map(([field, error]) => (
                <li key={field}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      {children}
      
      <Button 
        type="submit" 
        disabled={isSubmitting || hasErrors}
        className="w-full"
      >
        {isSubmitting ? 'Processing...' : submitText}
      </Button>
    </form>
  );
};

export { SecureForm, SecureInput };
