
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLeaderboardData } from '@/hooks/useLeaderboardData';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

const ParticipationSummary = () => {
  const { user } = useAuth();
  const { data: leaderboardData } = useLeaderboardData();
  const queryClient = useQueryClient();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['user-participation-stats', user?.id, leaderboardData?.length],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get GDs attended count
      const { data: gdsAttended } = await supabase
        .from('gd_registrations')
        .select('id')
        .eq('user_id', user.id)
        .eq('attended', true);

      // Get total points
      const { data: pointsData } = await supabase
        .from('reward_points')
        .select('points')
        .eq('user_id', user.id);

      const totalPoints = pointsData?.reduce((sum, entry) => sum + entry.points, 0) || 0;

      // Get star speaker awards (including both Best Speaker and Star Speaker for backward compatibility)
      const { data: bestSpeakerAwards } = await supabase
        .from('reward_points')
        .select('id')
        .eq('user_id', user.id)
        .or('type.ilike.best speaker,type.ilike.star speaker');

      // Get referrals count from user_referrals table
      const { data: referrals } = await supabase
        .from('user_referrals')
        .select('id, status')
        .eq('referrer_id', user.id);

      // Get user rank from leaderboard data (consistent with other components)
      const userIndex = leaderboardData?.findIndex(performer => 
        performer.userId === user.id
      ) ?? -1;
      const userRank = userIndex >= 0 ? userIndex + 1 : 0;

      return {
        totalGDs: gdsAttended?.length || 0,
        bestSpeakerAwards: bestSpeakerAwards?.length || 0,
        totalPoints,
        userRank: userRank || 'N/A',
        totalReferrals: referrals?.length || 0
      };
    },
    enabled: !!user?.id
  });

  // Set up real-time subscription for updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('participation-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_referrals',
          filter: `referrer_id=eq.${user.id}`
        },
        () => {
          // Invalidate and refetch the stats when referrals change
          queryClient.invalidateQueries({ queryKey: ['user-participation-stats', user.id] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reward_points',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Invalidate and refetch the stats when points change
          queryClient.invalidateQueries({ queryKey: ['user-participation-stats', user.id] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gd_registrations',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Invalidate and refetch the stats when GD registrations change
          queryClient.invalidateQueries({ queryKey: ['user-participation-stats', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ✅ Your Participation Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-muted/50 rounded-lg"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasActivity = stats && (stats.totalGDs > 0 || stats.totalPoints > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          ✅ Your Participation Summary
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Track how active you've been in group discussions and how you're growing.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasActivity ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🌟</div>
            <h3 className="text-lg font-semibold mb-2">Welcome to The Tomorrows Team!</h3>
            <p className="text-muted-foreground mb-4">
              Start your journey by joining your first group discussion. Your participation stats will appear here.
            </p>
            <Link to="/join-gd">
              <Button className="btn-primary">Join Your First GD</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{stats.totalGDs}</div>
                <div className="text-sm text-muted-foreground">Total GDs Attended</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-accent">{stats.bestSpeakerAwards}</div>
                <div className="text-sm text-muted-foreground">Star Speaker Awards</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-success">{stats.totalPoints}</div>
                <div className="text-sm text-muted-foreground">Points Earned</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">#{stats.userRank}</div>
                <div className="text-sm text-muted-foreground">Rank on Leaderboard</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-accent">{stats.totalReferrals}</div>
                <div className="text-sm text-muted-foreground">Total Referrals</div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 pt-4">
              <Link to="/dashboard/profile">
                <Button className="btn-secondary">
                  🔄 Update My Profile
                </Button>
              </Link>
              <Link to="/participation-history">
                <Button variant="outline">
                  📜 View Full Participation History
                </Button>
              </Link>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ParticipationSummary;
