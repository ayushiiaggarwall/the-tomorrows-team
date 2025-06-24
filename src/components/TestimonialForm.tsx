
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Star } from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface TestimonialFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TestimonialForm = ({ open, onOpenChange }: TestimonialFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    content: '',
    rating: 0,
    userName: '',
    userRole: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [existingTestimonialId, setExistingTestimonialId] = useState<string | null>(null);

  // Check if user has existing testimonial
  const { data: existingTestimonial } = useQuery({
    queryKey: ['user-testimonial', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user testimonial:', error);
        return null;
      }

      return data;
    },
    enabled: !!user?.id && open
  });

  // Update form when dialog opens or existing testimonial is loaded
  useEffect(() => {
    if (open && existingTestimonial) {
      setFormData({
        content: existingTestimonial.content,
        rating: existingTestimonial.rating,
        userName: existingTestimonial.user_name,
        userRole: existingTestimonial.user_role || ''
      });
      setIsEditing(true);
      setExistingTestimonialId(existingTestimonial.id);
    } else if (open && !existingTestimonial) {
      setFormData({
        content: '',
        rating: 0,
        userName: '',
        userRole: ''
      });
      setIsEditing(false);
      setExistingTestimonialId(null);
    }
  }, [open, existingTestimonial]);

  const submitTestimonial = useMutation({
    mutationFn: async (testimonialData: any) => {
      console.log('Submitting testimonial with data:', testimonialData);
      console.log('Current user:', user);
      console.log('Is editing:', isEditing);
      
      if (!user || !user.id) {
        throw new Error('User not authenticated');
      }

      if (isEditing && existingTestimonialId) {
        // Update existing testimonial
        const { data, error } = await supabase
          .from('testimonials')
          .update({
            content: testimonialData.content,
            rating: testimonialData.rating,
            user_name: testimonialData.userName,
            user_role: testimonialData.userRole,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingTestimonialId)
          .select()
          .single();

        console.log('Update result:', { data, error });

        if (error) {
          console.error('Supabase update error:', error);
          throw error;
        }
        return data;
      } else {
        // Create new testimonial
        const { data, error } = await supabase
          .from('testimonials')
          .insert({
            user_id: user.id,
            content: testimonialData.content,
            rating: testimonialData.rating,
            user_name: testimonialData.userName,
            user_role: testimonialData.userRole,
            is_approved: true // Auto-approve testimonials
          })
          .select()
          .single();

        console.log('Insert result:', { data, error });

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        return data;
      }
    },
    onSuccess: () => {
      toast({
        title: isEditing ? "Review Updated!" : "Review Submitted!",
        description: isEditing 
          ? "Your review has been successfully updated." 
          : "Thank you for your feedback. Your review has been published.",
      });
      
      onOpenChange(false);
      
      // Invalidate testimonials queries
      queryClient.invalidateQueries({ queryKey: ['home-testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['user-testimonial'] });
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      toast({
        title: isEditing ? "Update Failed" : "Submission Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted, user:', user);
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit a review.",
        variant: "destructive"
      });
      return;
    }

    if (formData.rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a star rating.",
        variant: "destructive"
      });
      return;
    }

    submitTestimonial.mutate({
      content: formData.content,
      rating: formData.rating,
      userName: formData.userName,
      userRole: formData.userRole
    });
  };

  const handleStarClick = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Your Review' : 'Share Your Review'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update your experience with our group discussions.'
              : 'Tell us about your experience with our group discussions.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Rating *</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-6 h-6 cursor-pointer transition-colors ${
                    star <= formData.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300 hover:text-yellow-300'
                  }`}
                  onClick={() => handleStarClick(star)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="userName">Your Name *</Label>
            <Input
              id="userName"
              value={formData.userName}
              onChange={(e) => setFormData(prev => ({ ...prev, userName: e.target.value }))}
              required
              placeholder="Enter your name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="userRole">Your Role (Optional)</Label>
            <Input
              id="userRole"
              value={formData.userRole}
              onChange={(e) => setFormData(prev => ({ ...prev, userRole: e.target.value }))}
              placeholder="e.g., Student, Professional, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Your Review *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              required
              placeholder="Share your experience with our group discussions..."
              rows={4}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitTestimonial.isPending}
              className="flex-1"
            >
              {submitTestimonial.isPending 
                ? (isEditing ? 'Updating...' : 'Submitting...') 
                : (isEditing ? 'Update Review' : 'Submit Review')
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TestimonialForm;
