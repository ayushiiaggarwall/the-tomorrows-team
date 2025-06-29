
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { validateInput } from '@/utils/securityValidation';
import { useEffect } from 'react';

export const useLeaderboardData = () => {
  const query = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      console.log('Fetching leaderboard data from database...');
      
      try {
        // Get all users first
        const { data: allUsers, error: usersError } = await supabase
          .from('profiles')
          .select('id, full_name, email');

        if (usersError) {
          console.error('Error fetching users:', usersError);
          return [];
        }

        if (!allUsers || allUsers.length === 0) {
          console.log('No users found in database');
          return [];
        }

        // Get all reward points
        const { data: pointsData, error: pointsError } = await supabase
          .from('reward_points')
          .select('user_id, points');

        if (pointsError) {
          console.error('Error fetching reward points:', pointsError);
          // Continue without points data - show users with 0 points
        }

        // Calculate total points for each user
        const userPointsMap = new Map<string, { name: string; points: number }>();

        // Initialize all users with 0 points
        allUsers.forEach(user => {
          const displayName = user.full_name || user.email?.split('@')[0] || `User ${user.id.slice(0, 8)}`;
          const sanitizedName = validateInput.sanitizeHtml(displayName);
          userPointsMap.set(user.id, { name: sanitizedName, points: 0 });
        });

        // Add actual points if available
        if (pointsData && pointsData.length > 0) {
          pointsData.forEach(entry => {
            const userId = entry.user_id;
            const points = entry.points;
            
            if (typeof points !== 'number') {
              console.warn(`Invalid points value detected: ${points} for user ${userId}`);
              return;
            }
            
            if (userPointsMap.has(userId)) {
              const currentPoints = userPointsMap.get(userId)!.points;
              userPointsMap.get(userId)!.points = currentPoints + points;
            }
          });
        }

        // Convert to array and sort by points (highest first, including negative points)
        const topPerformers = Array.from(userPointsMap.values())
          .sort((a, b) => b.points - a.points)
          .slice(0, 10); // Show top 10 instead of 5

        console.log('Processed top performers from database:', topPerformers);
        return topPerformers;
      } catch (error) {
        console.error('Failed to fetch leaderboard data:', error);
        return [];
      }
    },
    refetchInterval: 3000, // Reduced from 5000 to 3000 for more frequent updates
    retry: (failureCount, error) => {
      if (error?.message?.includes('JWT')) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 0, // Changed from 1000 to 0 to ensure fresh data
  });

  // Set up real-time subscription for reward points
  useEffect(() => {
    console.log('Setting up real-time subscription for leaderboard');

    const channel = supabase
      .channel('leaderboard-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reward_points'
        },
        (payload) => {
          console.log('Real-time leaderboard change (reward_points):', payload);
          query.refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('Real-time leaderboard change (profiles):', payload);
          query.refetch();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up leaderboard real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [query]);

  return query;
};
