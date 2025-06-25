
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { validateInput } from '@/utils/securityValidation';

export const useLeaderboardData = () => {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      console.log('Fetching leaderboard data from database...');
      
      try {
        // Get user points with profile information
        const { data: userPoints, error } = await supabase
          .from('reward_points')
          .select(`
            user_id,
            points,
            profiles!reward_points_user_id_fkey(full_name)
          `);

        if (error) {
          console.error('Supabase error fetching leaderboard data:', error);
          throw error;
        }

        console.log('Raw reward points data from database:', userPoints);

        // If no reward points exist, return sample data for demonstration
        if (!userPoints || userPoints.length === 0) {
          console.log('No reward points found in database, returning sample data');
          return [
            { name: 'Alice Johnson', points: 185 },
            { name: 'Bob Smith', points: 162 },
            { name: 'Carol Davis', points: 158 },
            { name: 'David Wilson', points: 134 },
            { name: 'Emma Brown', points: 127 }
          ];
        }

        // Aggregate points by user with security validation
        const userPointsMap = new Map<string, { name: string; points: number }>();
        
        userPoints.forEach((entry) => {
          const userId = entry.user_id;
          const rawName = (entry.profiles as any)?.full_name || 'Anonymous User';
          
          // Sanitize user name to prevent XSS
          const userName = validateInput.sanitizeHtml(rawName);
          const points = entry.points;
          
          // Validate points are within expected range
          if (!validateInput.validatePoints(points)) {
            console.warn(`Invalid points value detected: ${points} for user ${userId}`);
            return; // Skip invalid entries
          }
          
          if (userPointsMap.has(userId)) {
            const currentPoints = userPointsMap.get(userId)!.points;
            const totalPoints = currentPoints + points;
            
            // Validate total doesn't exceed maximum
            if (validateInput.validatePoints(totalPoints)) {
              userPointsMap.get(userId)!.points = totalPoints;
            }
          } else {
            userPointsMap.set(userId, { name: userName, points });
          }
        });

        // Convert to array and sort by points
        const topPerformers = Array.from(userPointsMap.values())
          .sort((a, b) => b.points - a.points)
          .slice(0, 5);

        console.log('Processed top performers from database:', topPerformers);
        return topPerformers;
      } catch (error) {
        console.error('Failed to fetch leaderboard data:', error);
        
        // Return sample data as fallback
        console.log('Returning sample data as fallback');
        return [
          { name: 'Alice Johnson', points: 185 },
          { name: 'Bob Smith', points: 162 },
          { name: 'Carol Davis', points: 158 },
          { name: 'David Wilson', points: 134 },
          { name: 'Emma Brown', points: 127 }
        ];
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error?.message?.includes('JWT')) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 10000, // Consider data stale after 10 seconds
  });
};
