
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { validateInput } from '@/utils/securityValidation';
import { useEffect } from 'react';

interface UserPerformance {
  userId: string;
  name: string;
  points: number;
  tags: string[];
}

export const useLeaderboardData = () => {
  const query = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      // Fetching leaderboard data from database...
      
      try {
        // Get only verified users by joining with auth.users table
        const { data: allUsers, error: usersError } = await supabase
          .rpc('get_verified_users_paginated', { start_index: 0, end_index: 10000 });

        if (usersError) {
          // Error fetching verified users
          return [];
        }

        if (!allUsers || allUsers.length === 0) {
          // No users found in database
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
          // Error fetching reward points
          // Continue without points data - show users with 0 points
        }

        // Calculate total points and type-specific stats for each user
        const userPointsMap = new Map<string, UserPerformance>();

        // Initialize all users with 0 points and empty tags
        allUsers.forEach(user => {
          const displayName = user.full_name || user.email?.split('@')[0] || `User ${user.id.slice(0, 8)}`;
          const sanitizedName = validateInput.sanitizeHtml(displayName);
          userPointsMap.set(user.id, { userId: user.id, name: sanitizedName, points: 0, tags: [] });
        });

        // Track stats for tag assignment
        const userStats = new Map<string, {
          totalPoints: number;
          bestSpeakerCount: number;
          attendanceCount: number;
          moderatorCount: number;
          referralCount: number;
          perfectAttendanceCount: number;
          criticalThinkerCount: number;
        }>();

        // Initialize stats
        allUsers.forEach(user => {
          userStats.set(user.id, {
            totalPoints: 0,
            bestSpeakerCount: 0,
            attendanceCount: 0,
            moderatorCount: 0,
            referralCount: 0,
            perfectAttendanceCount: 0,
            criticalThinkerCount: 0
          });
        });

        // Process points data if available
        if (pointsData && pointsData.length > 0) {
          pointsData.forEach(entry => {
            const userId = entry.user_id;
            const points = entry.points;
            const type = entry.type;
            
            if (typeof points !== 'number') {
              // Invalid points value detected
              return;
            }
            
            if (userPointsMap.has(userId) && userStats.has(userId)) {
              // Update total points
              const currentPoints = userPointsMap.get(userId)!.points;
              userPointsMap.get(userId)!.points = currentPoints + points;

              // Update type-specific stats
              const stats = userStats.get(userId)!;
              stats.totalPoints += points;

               // Case-insensitive type matching for consistent behavior
               const typeNormalized = type.toLowerCase();
               switch (typeNormalized) {
                 case 'best speaker':
                 case 'star speaker':
                   stats.bestSpeakerCount++;
                   break;
                case 'attendance':
                  stats.attendanceCount++;
                  break;
                case 'moderator':
                  stats.moderatorCount++;
                  break;
                case 'referral':
                  stats.referralCount++;
                  break;
                case 'perfect attendance':
                case 'perf attendance':
                  stats.perfectAttendanceCount++;
                  break;
                 case 'critical thinker':
                 case 'quality content':
                   stats.criticalThinkerCount++;
                   break;
                 case 'team builder':
                   stats.referralCount++; // Use referralCount for team builder to reuse existing logic
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

        // Find top critical thinker
        const topCriticalThinker = allStats.reduce((max, [userId, stats]) => 
          stats.criticalThinkerCount > max.count ? { userId, count: stats.criticalThinkerCount } : max, 
          { userId: '', count: 0 }
        );

         // Assign tags based on performance
         if (topBestSpeaker.count > 0 && userPointsMap.has(topBestSpeaker.userId)) {
           userPointsMap.get(topBestSpeaker.userId)!.tags.push('Star Speaker');
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
        
         if (topCriticalThinker.count > 0 && userPointsMap.has(topCriticalThinker.userId)) {
           userPointsMap.get(topCriticalThinker.userId)!.tags.push('Quality Content');
         }

        // Find users with perfect attendance (if they have perfect attendance points)
        allStats.forEach(([userId, stats]) => {
          if (stats.perfectAttendanceCount > 0 && userPointsMap.has(userId)) {
            userPointsMap.get(userId)!.tags.push('Perf Attendance');
          }
        });

        // Convert to array and sort by points (highest first, including negative points)
        const allPerformers = Array.from(userPointsMap.values())
          .sort((a, b) => b.points - a.points);

        // Processed all performers from database
        return allPerformers;
      } catch (error) {
        // Failed to fetch leaderboard data
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
    // Setting up real-time subscription for leaderboard

    // Create unique channel name to avoid conflicts when multiple components use this hook
    const channelName = `leaderboard-realtime-${Math.random().toString(36).substr(2, 9)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reward_points'
        },
        (payload) => {
          // Real-time leaderboard change (reward_points)
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
          // Real-time leaderboard change (profiles)
          // Force immediate refetch
          query.refetch();
        }
      )
      .subscribe((status) => {
        // Leaderboard subscription status
      });

    return () => {
      // Cleaning up leaderboard real-time subscription
      supabase.removeChannel(channel);
    };
  }, []); // Remove query.refetch from dependencies to prevent recreation

  return query;
};
