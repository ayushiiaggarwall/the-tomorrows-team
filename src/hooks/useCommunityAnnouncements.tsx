
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export const useCommunityAnnouncements = () => {
  const { data: announcements, refetch } = useQuery({
    queryKey: ['community-announcements'],
    queryFn: async () => {
      // Fetching community announcements...
      const { data, error } = await supabase
        .from('community_announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        // Error fetching announcements
        throw error;
      }
      
      // Fetched announcements
      return data;
    },
    staleTime: 0, // Always fetch fresh data
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  // Set up real-time subscription
  useEffect(() => {
    // Setting up real-time subscription for community announcements
    
    const channel = supabase
      .channel('community-announcements-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_announcements'
        },
        (payload) => {
          // Real-time announcement change
          refetch();
        }
      )
      .subscribe();

    return () => {
      // Cleaning up announcements real-time subscription
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  return { announcements };
};
