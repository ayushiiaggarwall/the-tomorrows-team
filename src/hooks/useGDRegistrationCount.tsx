
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useGDRegistrationCount = (gdId?: string) => {
  const queryClient = useQueryClient();

  // Query to get the current registration count for a specific GD
  const { data: registrationData, isLoading } = useQuery({
    queryKey: ['gd-registration-count', gdId],
    queryFn: async () => {
      if (!gdId) return null;

      // Get the GD details
      const { data: gd, error: gdError } = await supabase
        .from('group_discussions')
        .select('slot_capacity')
        .eq('id', gdId)
        .single();

      if (gdError) throw gdError;

      // Count current registrations
      const { count: registrationCount, error: countError } = await supabase
        .from('gd_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('gd_id', gdId);

      if (countError) throw countError;

      const totalRegistrations = registrationCount || 0;
      const spotsLeft = Math.max(0, gd.slot_capacity - totalRegistrations);

      console.log(`GD ${gdId}: ${totalRegistrations}/${gd.slot_capacity} registered, ${spotsLeft} spots left`);

      return {
        gdId,
        totalCapacity: gd.slot_capacity,
        totalRegistrations,
        spotsLeft,
        isFull: spotsLeft === 0
      };
    },
    enabled: !!gdId,
    staleTime: 0,
    gcTime: 0,
  });

  // Set up real-time listener for registration changes
  useEffect(() => {
    if (!gdId) return;

    console.log(`Setting up real-time listener for GD: ${gdId}`);

    const channel = supabase
      .channel(`gd-registration-updates-${gdId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gd_registrations',
          filter: `gd_id=eq.${gdId}`
        },
        (payload) => {
          console.log(`Registration change detected for GD ${gdId}:`, payload);
          // Immediately refetch the count for this specific GD
          queryClient.invalidateQueries({ queryKey: ['gd-registration-count', gdId] });
          queryClient.refetchQueries({ queryKey: ['gd-registration-count', gdId] });
          
          // Also invalidate other related queries
          queryClient.invalidateQueries({ queryKey: ['upcoming-gds'] });
          queryClient.invalidateQueries({ queryKey: ['upcoming-gds-for-registration'] });
          queryClient.invalidateQueries({ queryKey: ['home-upcoming-gds'] });
        }
      )
      .subscribe();

    return () => {
      console.log(`Cleaning up real-time listener for GD: ${gdId}`);
      supabase.removeChannel(channel);
    };
  }, [gdId, queryClient]);

  return {
    registrationData,
    isLoading,
    refetch: () => queryClient.refetchQueries({ queryKey: ['gd-registration-count', gdId] })
  };
};
