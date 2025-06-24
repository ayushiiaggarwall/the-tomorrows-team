
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { validateTextLength, sanitizeText, validateRating } from '@/utils/validation';
import { createSafeError } from '@/utils/errorHandler';

const SecureTestimonialForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    content: '',
    rating: 5,
    userRole: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!validateTextLength(formData.content, 1000)) {
      newErrors.content = 'Content must be between 1 and 1000 characters';
    }

    if (!validateRating(formData.rating)) {
      newErrors.rating = 'Rating must be between 1 and 5';
    }

    if (!validateTextLength(formData.userRole, 100)) {
      newErrors.userRole = 'Role must be between 1 and 100 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit a testimonial.",
        variant: "destructive"
      });
      return;
    }

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const sanitizedData = {
        user_id: user.id,
        user_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous',
        user_role: sanitizeText(formData.userRole),
        content: sanitizeText(formData.content),
        rating: formData.rating,
        is_approved: false
      };

      const { error } = await supabase
        .from('testimonials')
        .insert([sanitizedData]);

      if (error) {
        if (error.code === '42501') {
          throw createSafeError(
            new Error('You have already submitted a testimonial'),
            'validation'
          );
        }
        throw error;
      }

      toast({
        title: "Success!",
        description: "Your testimonial has been submitted for review.",
      });

      // Reset form
      setFormData({ content: '', rating: 5, userRole: '' });
      setErrors({});

    } catch (error: any) {
      const safeError = createSafeError(error, 'database');
      toast({
        title: "Submission Failed",
        description: safeError.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Share Your Experience</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="userRole">Your Role/Position</Label>
            <Input
              id="userRole"
              value={formData.userRole}
              onChange={(e) => setFormData(prev => ({ ...prev, userRole: e.target.value }))}
              placeholder="e.g., Student, Professional, etc."
              maxLength={100}
              className={errors.userRole ? 'border-destructive' : ''}
            />
            {errors.userRole && (
              <p className="text-sm text-destructive mt-1">{errors.userRole}</p>
            )}
          </div>

          <div>
            <Label htmlFor="content">Your Testimonial</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Share your experience with The Tomorrows Team..."
              maxLength={1000}
              rows={4}
              className={errors.content ? 'border-destructive' : ''}
            />
            <div className="flex justify-between mt-1">
              {errors.content && (
                <p className="text-sm text-destructive">{errors.content}</p>
              )}
              <p className="text-sm text-muted-foreground ml-auto">
                {formData.content.length}/1000
              </p>
            </div>
          </div>

          <div>
            <Label>Rating</Label>
            <RadioGroup
              value={formData.rating.toString()}
              onValueChange={(value) => setFormData(prev => ({ ...prev, rating: parseInt(value) }))}
            >
              <div className="flex space-x-6">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <div key={rating} className="flex items-center space-x-2">
                    <RadioGroupItem value={rating.toString()} id={`rating-${rating}`} />
                    <Label htmlFor={`rating-${rating}`}>
                      {rating} Star{rating !== 1 ? 's' : ''}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
            {errors.rating && (
              <p className="text-sm text-destructive mt-1">{errors.rating}</p>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Submitting...' : 'Submit Testimonial'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SecureTestimonialForm;
