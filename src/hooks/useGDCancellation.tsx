
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CancellationResponse {
  success: boolean;
  cancellation_type: string;
  hours_until_gd: number;
  points_deducted: number;
  message: string;
}

export const useGDCancellation = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const cancelRegistration = useMutation({
    mutationFn: async ({ gdId, userId }: { gdId: string; userId: string }) => {
      console.log('Cancelling registration for GD:', gdId, 'User:', userId);

      const { data, error } = await supabase.rpc('cancel_gd_registration', {
        p_gd_id: gdId,
        p_user_id: userId,
      });

      if (error) {
        console.error('Cancellation error:', error);
        throw error;
      }

      console.log('Cancellation successful:', data);
      return data as unknown as CancellationResponse;
    },
    onSuccess: (data) => {
      const message = data?.message || 'Registration cancelled successfully';
      const isDropout = data?.cancellation_type === 'dropout';
      
      toast({
        title: isDropout ? "Dropped Out" : "De-registered",
        description: message,
        variant: isDropout ? "destructive" : "default"
      });
      
      // Invalidate and refetch all related queries
      queryClient.invalidateQueries({ queryKey: ['upcoming-gds'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-gds-for-registration'] });
      queryClient.invalidateQueries({ queryKey: ['gd-registration-count'] });
      queryClient.invalidateQueries({ queryKey: ['home-upcoming-gds'] });
    },
    onError: (error: any) => {
      console.error('Cancellation mutation error:', error);
      
      if (error.message?.includes('REGISTRATION_NOT_FOUND')) {
        toast({
          title: "Registration Not Found",
          description: "No active registration found for this group discussion.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Cancellation Failed",
          description: error.message || "Something went wrong. Please try again.",
          variant: "destructive"
        });
      }
    }
  });

  return cancelRegistration;
};
