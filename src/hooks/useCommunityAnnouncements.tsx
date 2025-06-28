
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export const useCommunityAnnouncements = () => {
  const { data: announcements, refetch } = useQuery({
    queryKey: ['community-announcements'],
    queryFn: async () => {
      console.log('Fetching community announcements...');
      const { data, error } = await supabase
        .from('community_announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('Error fetching announcements:', error);
        throw error;
      }
      
      console.log('Fetched announcements:', data);
      return data;
    },
    staleTime: 0, // Always fetch fresh data
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  // Set up real-time subscription
  useEffect(() => {
    console.log('Setting up real-time subscription for community announcements');
    
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
          console.log('Real-time announcement change:', payload);
          refetch();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up announcements real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  return { announcements };
};
