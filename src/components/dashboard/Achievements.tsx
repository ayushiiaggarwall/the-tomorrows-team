
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLeaderboardData } from '@/hooks/useLeaderboardData';
import { useEffect } from 'react';

const Achievements = () => {
  const { user } = useAuth();
  const { data: leaderboardData } = useLeaderboardData();

  const { data: achievements, isLoading, refetch } = useQuery({
    queryKey: ['user-achievements', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data: rewardPoints } = await supabase
        .from('reward_points')
        .select('type, points, reason, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!rewardPoints) return [];

      const achievementsList = [];

      // Best Speaker achievements (case-insensitive)
      const bestSpeakerAwards = rewardPoints.filter(rp => rp.type.toLowerCase() === 'best speaker');
      if (bestSpeakerAwards.length > 0) {
        achievementsList.push({
          icon: '🥇',
          title: `Best Speaker – ${bestSpeakerAwards.length} Award${bestSpeakerAwards.length > 1 ? 's' : ''}`,
          description: 'Outstanding performance in group discussions'
        });
      }

      // Points milestone achievements
      const totalPoints = rewardPoints.reduce((sum, rp) => sum + rp.points, 0);
      if (totalPoints >= 100) {
        achievementsList.push({
          icon: '🧠',
          title: `Top Thinker – ${totalPoints} Points Earned`,
          description: 'Reached significant participation milestones'
        });
      }

      // Participation streak achievements (case-insensitive)
      const gdsAttended = rewardPoints.filter(rp => rp.type.toLowerCase() === 'attendance').length;
      if (gdsAttended >= 3) {
        achievementsList.push({
          icon: '🎯',
          title: `${gdsAttended} GDs Attended`,
          description: 'Consistent participation in group discussions'
        });
      }

      // Referral achievements (case-insensitive)
      const referrals = rewardPoints.filter(rp => rp.type.toLowerCase() === 'referral');
      if (referrals.length > 0) {
        achievementsList.push({
          icon: '👥',
          title: `Referred ${referrals.length} New Participant${referrals.length > 1 ? 's' : ''}`,
          description: 'Growing the community through referrals'
        });
      }

      // Critical Thinker achievements (case-insensitive)
      const criticalThinkerAwards = rewardPoints.filter(rp => rp.type.toLowerCase() === 'critical thinker');
      if (criticalThinkerAwards.length > 0) {
        achievementsList.push({
          icon: '🧠',
          title: `Critical Thinker – ${criticalThinkerAwards.length} Award${criticalThinkerAwards.length > 1 ? 's' : ''}`,
          description: 'Exceptional analytical thinking and insights'
        });
      }

      // Add leaderboard tags as achievements
      const userLeaderboardData = leaderboardData?.find(userData => userData.userId === user.id);
      if (userLeaderboardData?.tags && userLeaderboardData.tags.length > 0) {
        userLeaderboardData.tags.forEach(tag => {
          const tagIcons: { [key: string]: string } = {
            'Star Speaker': '⭐',
            'Most Consistent': '🎯',
            'Top Moderator': '👨‍💼',
            'Top Referrer': '👥',
            'Quality Content': '🧠',
            'Perf Attendance': '💯'
          };
          
          achievementsList.push({
            icon: tagIcons[tag] || '🏆',
            title: tag,
            description: 'Recognized for outstanding performance in the community'
          });
        });
      }

      return achievementsList;
    },
    enabled: !!user?.id && !!leaderboardData
  });

  // Set up real-time subscription for achievements (based on reward points changes)
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('achievements-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reward_points',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, refetch]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🏅 Your Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-muted/50 rounded-lg"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🏅 Performance Recognition
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {achievements?.length ? "Special recognition based on your leaderboard performance!" : "Start participating to earn performance recognition!"}
        </p>
      </CardHeader>
      <CardContent>
        {!achievements?.length ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-lg font-semibold mb-2">No Achievements Yet</h3>
            <p className="text-muted-foreground mb-4">
              Participate in group discussions, earn points, and refer friends to unlock achievements!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{achievement.title}</div>
                  <div className="text-xs text-muted-foreground">{achievement.description}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Achievements;
