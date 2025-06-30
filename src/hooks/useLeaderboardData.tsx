
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { validateInput } from '@/utils/securityValidation';
import { useEffect } from 'react';

interface UserPerformance {
  name: string;
  points: number;
  tags: string[];
}

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

        // Get current month's start and end
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        // Get all reward points for current month
        const { data: pointsData, error: pointsError } = await supabase
          .from('reward_points')
          .select('user_id, points, type')
          .gte('created_at', monthStart.toISOString())
          .lte('created_at', monthEnd.toISOString());

        if (pointsError) {
          console.error('Error fetching reward points:', pointsError);
          // Continue without points data - show users with 0 points
        }

        // Calculate total points and type-specific stats for each user
        const userPointsMap = new Map<string, UserPerformance>();

        // Initialize all users with 0 points and empty tags
        allUsers.forEach(user => {
          const displayName = user.full_name || user.email?.split('@')[0] || `User ${user.id.slice(0, 8)}`;
          const sanitizedName = validateInput.sanitizeHtml(displayName);
          userPointsMap.set(user.id, { name: sanitizedName, points: 0, tags: [] });
        });

        // Track stats for tag assignment
        const userStats = new Map<string, {
          totalPoints: number;
          bestSpeakerCount: number;
          attendanceCount: number;
          moderatorCount: number;
          referralCount: number;
          perfectAttendanceCount: number;
        }>();

        // Initialize stats
        allUsers.forEach(user => {
          userStats.set(user.id, {
            totalPoints: 0,
            bestSpeakerCount: 0,
            attendanceCount: 0,
            moderatorCount: 0,
            referralCount: 0,
            perfectAttendanceCount: 0
          });
        });

        // Process points data if available
        if (pointsData && pointsData.length > 0) {
          pointsData.forEach(entry => {
            const userId = entry.user_id;
            const points = entry.points;
            const type = entry.type;
            
            if (typeof points !== 'number') {
              console.warn(`Invalid points value detected: ${points} for user ${userId}`);
              return;
            }
            
            if (userPointsMap.has(userId) && userStats.has(userId)) {
              // Update total points
              const currentPoints = userPointsMap.get(userId)!.points;
              userPointsMap.get(userId)!.points = currentPoints + points;

              // Update type-specific stats
              const stats = userStats.get(userId)!;
              stats.totalPoints += points;

              switch (type) {
                case 'Best Speaker':
                  stats.bestSpeakerCount++;
                  break;
                case 'Attendance':
                  stats.attendanceCount++;
                  break;
                case 'Moderator':
                  stats.moderatorCount++;
                  break;
                case 'Referral':
                  stats.referralCount++;
                  break;
                case 'Perfect Attendance':
                  stats.perfectAttendanceCount++;
                  break;
              }
            }
          });
        }

        // Find top performers in each category for tag assignment
        const allStats = Array.from(userStats.entries());
        
        // Find user with most Best Speaker awards
        const topBestSpeaker = allStats.reduce((max, [userId, stats]) => 
          stats.bestSpeakerCount > max.count ? { userId, count: stats.bestSpeakerCount } : max, 
          { userId: '', count: 0 }
        );

        // Find most consistent user (highest attendance)
        const mostConsistent = allStats.reduce((max, [userId, stats]) => 
          stats.attendanceCount > max.count ? { userId, count: stats.attendanceCount } : max, 
          { userId: '', count: 0 }
        );

        // Find top moderator
        const topModerator = allStats.reduce((max, [userId, stats]) => 
          stats.moderatorCount > max.count ? { userId, count: stats.moderatorCount } : max, 
          { userId: '', count: 0 }
        );

        // Find top referrer
        const topReferrer = allStats.reduce((max, [userId, stats]) => 
          stats.referralCount > max.count ? { userId, count: stats.referralCount } : max, 
          { userId: '', count: 0 }
        );

        // Assign tags based on performance
        if (topBestSpeaker.count > 0 && userPointsMap.has(topBestSpeaker.userId)) {
          userPointsMap.get(topBestSpeaker.userId)!.tags.push('Best Speaker');
        }
        
        if (mostConsistent.count > 0 && userPointsMap.has(mostConsistent.userId)) {
          userPointsMap.get(mostConsistent.userId)!.tags.push('Most Consistent');
        }
        
        if (topModerator.count > 0 && userPointsMap.has(topModerator.userId)) {
          userPointsMap.get(topModerator.userId)!.tags.push('Top Moderator');
        }
        
        if (topReferrer.count > 0 && userPointsMap.has(topReferrer.userId)) {
          userPointsMap.get(topReferrer.userId)!.tags.push('Top Referrer');
        }

        // Find users with perfect attendance (if they have perfect attendance points)
        allStats.forEach(([userId, stats]) => {
          if (stats.perfectAttendanceCount > 0 && userPointsMap.has(userId)) {
            userPointsMap.get(userId)!.tags.push('Perfect Attendance');
          }
        });

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
    refetchInterval: 2000, // Reduced to 2 seconds for faster updates
    retry: (failureCount, error) => {
      if (error?.message?.includes('JWT')) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 0, // Always fetch fresh data
  });

  // Set up real-time subscription for reward points and profiles
  useEffect(() => {
    console.log('Setting up real-time subscription for leaderboard');

    const channel = supabase
      .channel('leaderboard-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reward_points'
        },
        (payload) => {
          console.log('Real-time leaderboard change (reward_points):', payload);
          // Force immediate refetch
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
          // Force immediate refetch
          query.refetch();
        }
      )
      .subscribe((status) => {
        console.log('Leaderboard subscription status:', status);
      });

    return () => {
      console.log('Cleaning up leaderboard real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [query.refetch]); // Add refetch to dependencies

  return query;
};
