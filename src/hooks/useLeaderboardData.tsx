
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useLeaderboardData = () => {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      // Get user points with profile information
      const { data: userPoints, error } = await supabase
        .from('reward_points')
        .select(`
          user_id,
          points,
          profiles!inner(full_name)
        `)
        .order('points', { ascending: false });

      if (error) {
        console.error('Error fetching leaderboard data:', error);
        throw error;
      }

      // Aggregate points by user
      const userPointsMap = new Map<string, { name: string; points: number }>();
      
      userPoints?.forEach((entry) => {
        const userId = entry.user_id;
        const userName = entry.profiles?.full_name || 'Anonymous User';
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

      return topPerformers;
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });
};
