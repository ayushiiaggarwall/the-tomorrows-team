import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AnalyticsSummary {
  total_visits: number;
  today_visits: number;
  total_signups: number;
  today_signups: number;
  unique_visitors: number;
}

export const usePageTracking = () => {
  const { user } = useAuth();

  const trackPageView = async (pagePath: string) => {
    try {
      await supabase.rpc('track_page_view', {
        p_page_path: pagePath,
        p_user_id: user?.id || null,
        p_ip_address: null, // Could be enhanced with actual IP
        p_user_agent: navigator.userAgent
      });
    } catch (error) {
      // Silent fail for analytics
      console.debug('Analytics tracking failed:', error);
    }
  };

  return { trackPageView };
};

export const useAnalytics = () => {
  const { isAdmin } = useAuth();

  const { data: analytics, isLoading, error, refetch } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: async (): Promise<AnalyticsSummary> => {
      const { data, error } = await supabase.rpc('get_analytics_summary');
      
      if (error) throw error;
      return data as unknown as AnalyticsSummary;
    },
    enabled: isAdmin,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  return {
    analytics,
    isLoading,
    error,
    refetch
  };
};