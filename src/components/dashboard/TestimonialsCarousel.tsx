
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import TestimonialForm from '@/components/TestimonialForm';
import { useAuth } from '@/hooks/useAuth';

const TestimonialsCarousel = () => {
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const { user } = useAuth();

  const { data: testimonials, isLoading } = useQuery({
    queryKey: ['dashboard-testimonials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) {
        console.error('Error fetching testimonials:', error);
        return [];
      }

      return data || [];
    }
  });

  // Check if current user has existing testimonial
  const { data: userTestimonial } = useQuery({
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
    enabled: !!user?.id
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            💬 Community Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-32 bg-muted/50 rounded-lg"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            💬 Community Reviews
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            See what our community is saying
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {!testimonials?.length ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to share your experience!
              </p>
            </div>
          ) : (
            <div className="relative">
              <Carousel className="w-full">
                <CarouselContent>
                  {testimonials.map((testimonial, index) => (
                    <CarouselItem key={testimonial.id}>
                      <div className="p-1">
                        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                          <div className="flex mb-2">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground italic">
                            "{testimonial.content}"
                          </p>
                          <div>
                            <p className="font-semibold text-sm">{testimonial.user_name}</p>
                            {testimonial.user_role && (
                              <p className="text-xs text-muted-foreground">{testimonial.user_role}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {testimonials.length > 1 && (
                  <>
                    <CarouselPrevious />
                    <CarouselNext />
                  </>
                )}
              </Carousel>
            </div>
          )}
          
          <Button 
            className="w-full btn-primary"
            onClick={() => setShowTestimonialForm(true)}
          >
            {userTestimonial ? 'Edit Your Review' : 'Add Your Review'}
          </Button>
        </CardContent>
      </Card>

      <TestimonialForm 
        open={showTestimonialForm}
        onOpenChange={setShowTestimonialForm}
      />
    </>
  );
};

export default TestimonialsCarousel;
