
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export const useCommunityAnnouncements = () => {
  const { data: announcements, refetch } = useQuery({
    queryKey: ['community-announcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    }
  });

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('community-announcements-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_announcements'
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  return { announcements };
};
