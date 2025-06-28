
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
        // Get user points with profile information using a left join approach
        const { data: userPoints, error } = await supabase
          .from('reward_points')
          .select(`
            user_id,
            points,
            profiles!inner(full_name, email)
          `);

        if (error) {
          console.error('Supabase error fetching leaderboard data:', error);
          // If it's a relationship error, try fetching without the join
          if (error.code === 'PGRST200') {
            console.log('Foreign key relationship not found, fetching reward points only...');
            const { data: pointsOnly, error: pointsError } = await supabase
              .from('reward_points')
              .select('user_id, points');
            
            if (pointsError) {
              console.error('Error fetching reward points:', pointsError);
              return [];
            }
            
            if (!pointsOnly || pointsOnly.length === 0) {
              console.log('No reward points found in database, returning empty array');
              return [];
            }
            
            // Aggregate points by user without profile names
            const userPointsMap = new Map<string, { name: string; points: number }>();
            
            pointsOnly.forEach((entry) => {
              const userId = entry.user_id;
              const points = entry.points;
              
              // Validate points are within expected range
              if (!validateInput.validatePoints(points)) {
                console.warn(`Invalid points value detected: ${points} for user ${userId}`);
                return;
              }
              
              if (userPointsMap.has(userId)) {
                const currentPoints = userPointsMap.get(userId)!.points;
                const totalPoints = currentPoints + points;
                
                if (validateInput.validatePoints(totalPoints)) {
                  userPointsMap.get(userId)!.points = totalPoints;
                }
              } else {
                userPointsMap.set(userId, { name: `User ${userId.slice(0, 8)}`, points });
              }
            });

            const topPerformers = Array.from(userPointsMap.values())
              .sort((a, b) => b.points - a.points)
              .slice(0, 5);

            console.log('Processed top performers without profiles:', topPerformers);
            return topPerformers;
          }
          return [];
        }

        console.log('Raw reward points data from database:', userPoints);

        // If no reward points exist, return empty array
        if (!userPoints || userPoints.length === 0) {
          console.log('No reward points found in database, returning empty array');
          return [];
        }

        // Aggregate points by user with security validation
        const userPointsMap = new Map<string, { name: string; points: number }>();
        
        userPoints.forEach((entry) => {
          const userId = entry.user_id;
          const profile = entry.profiles as any;
          const rawName = profile?.full_name || profile?.email?.split('@')[0] || `User ${userId.slice(0, 8)}`;
          
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
        // Return empty array instead of throwing error to show proper empty state
        return [];
      }
    },
    refetchInterval: 10000, // Refetch every 10 seconds for more frequent updates
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error?.message?.includes('JWT')) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 5000, // Consider data stale after 5 seconds for more realtime feel
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
          console.log('Real-time leaderboard change:', payload);
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
