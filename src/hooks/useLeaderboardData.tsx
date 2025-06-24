
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useLeaderboardData = () => {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      console.log('Fetching leaderboard data...');
      
      // Get user points with profile information
      const { data: userPoints, error } = await supabase
        .from('reward_points')
        .select(`
          user_id,
          points,
          profiles!reward_points_user_id_fkey(full_name)
        `);

      if (error) {
        console.error('Error fetching leaderboard data:', error);
        throw error;
      }

      console.log('Raw reward points data:', userPoints);

      // If no reward points exist, return empty array
      if (!userPoints || userPoints.length === 0) {
        console.log('No reward points found in database');
        return [];
      }

      // Aggregate points by user
      const userPointsMap = new Map<string, { name: string; points: number }>();
      
      userPoints.forEach((entry) => {
        const userId = entry.user_id;
        const userName = (entry.profiles as any)?.full_name || 'Anonymous User';
        const points = entry.points;
        
        if (userPointsMap.has(userId)) {
          userPointsMap.get(userId)!.points += points;
        } else {
          userPointsMap.set(userId, { name: userName, points });
        }
      });

      // Convert to array and sort by points
      const topPerformers = Array.from(userPointsMap.values())
        .sort((a, b) => b.points - a.points)
        .slice(0, 5);

      console.log('Processed top performers:', topPerformers);
      return topPerformers;
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });
};
