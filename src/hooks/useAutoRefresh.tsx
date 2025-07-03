import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface UseAutoRefreshOptions {
  interval?: number; // in milliseconds, default 60000 (1 minute)
  queryKeys?: string[][]; // specific query keys to refresh
  enabled?: boolean; // whether auto-refresh is enabled
}

export const useAutoRefresh = ({
  interval = 30000, // 30 seconds default for more responsive updates
  queryKeys = [
    ['home-upcoming-gds'],
    ['upcoming-gds'],
    ['upcoming-gds-for-registration'],
    ['community-announcements'],
    ['home-testimonials'],
    ['leaderboard-data'],
    ['gd-registration-count']
  ],
  enabled = true
}: UseAutoRefreshOptions = {}) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    console.log('Setting up auto-refresh every', interval / 1000, 'seconds');
    
    const intervalId = setInterval(() => {
      console.log('Auto-refreshing queries:', queryKeys);
      
      // Force refetch instead of just invalidating
      queryKeys.forEach(queryKey => {
        queryClient.refetchQueries({ queryKey });
      });
      
      // Also refresh any registration-related queries
      queryClient.refetchQueries({ queryKey: ['gd-registration-count'] });
    }, interval);

    return () => {
      console.log('Cleaning up auto-refresh interval');
      clearInterval(intervalId);
    };
  }, [queryClient, interval, enabled, queryKeys]);

  return {
    refreshNow: () => {
      queryKeys.forEach(queryKey => {
        queryClient.refetchQueries({ queryKey });
      });
      queryClient.refetchQueries({ queryKey: ['gd-registration-count'] });
    }
  };
};