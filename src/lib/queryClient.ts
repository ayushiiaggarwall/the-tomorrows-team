// React Query configuration for optimal performance
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default cache time and stale time for better performance
      staleTime: 2 * 60 * 1000, // 2 minutes - data considered fresh
      gcTime: 10 * 60 * 1000, // 10 minutes - cache garbage collection time
      refetchOnWindowFocus: false, // Disable refetch on window focus for better UX
      refetchOnMount: true, // Refetch on component mount
      retry: (failureCount, error: any) => {
        // Custom retry logic
        if (error?.status === 404) return false;
        return failureCount < 2;
      },
    },
    mutations: {
      retry: 1,
    },
  },
});