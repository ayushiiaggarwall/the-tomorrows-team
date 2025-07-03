
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Achievements = () => {
  const { user } = useAuth();

  useEffect(() => {
    document.title = 'Achievements - The Tomorrows Team';
  }, []);

  const { data: achievementsData, isLoading } = useQuery({
    queryKey: ['user-achievements-page', user?.id],
    queryFn: async () => {
      if (!user?.id) return { unlocked: [], locked: [], stats: { totalPoints: 0, bestSpeakerAwards: 0, referrals: 0, totalGDs: 0 } };

      // Get user stats
      const { data: rewardPoints } = await supabase
        .from('reward_points')
        .select('type, points, reason, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const { data: gdsAttended } = await supabase
        .from('gd_registrations')
        .select('id, attended, registered_at')
        .eq('user_id', user.id)
        .eq('attended', true);

      if (!rewardPoints) return { unlocked: [], locked: [], stats: { totalPoints: 0, bestSpeakerAwards: 0, referrals: 0, totalGDs: 0 } };

      const totalPoints = rewardPoints.reduce((sum, rp) => sum + rp.points, 0);
      const bestSpeakerAwards = rewardPoints.filter(rp => rp.type.toLowerCase().includes('best speaker')).length;
      const referrals = rewardPoints.filter(rp => rp.type.toLowerCase() === 'referral').length;
      const totalGDs = gdsAttended?.length || 0;

      const stats = {
        totalPoints,
        bestSpeakerAwards,
        referrals,
        totalGDs
      };

      // Define all possible achievements
      const allAchievements = [
        {
          id: 'first_gd',
          title: 'First Steps',
          description: 'Attended your first group discussion',
          icon: '👶',
          unlocked: totalGDs >= 1,
          progress: Math.min(totalGDs, 1),
          target: 1
        },
        {
          id: 'gd_veteran',
          title: 'Discussion Veteran',
          description: 'Attended 5 group discussions',
          icon: '🎓',
          unlocked: totalGDs >= 5,
          progress: totalGDs,
          target: 5
        },
        {
          id: 'gd_expert',
          title: 'Discussion Expert',
          description: 'Attended 10 group discussions',
          icon: '🏆',
          unlocked: totalGDs >= 10,
          progress: totalGDs,
          target: 10
        },
        {
          id: 'first_best_speaker',
          title: 'Rising Star',
          description: 'Awarded Best Speaker for the first time',
          icon: '⭐',
          unlocked: bestSpeakerAwards >= 1,
          progress: Math.min(bestSpeakerAwards, 1),
          target: 1
        },
        {
          id: 'multiple_best_speaker',
          title: 'Eloquent Speaker',
          description: 'Awarded Best Speaker 3 times',
          icon: '🎤',
          unlocked: bestSpeakerAwards >= 3,
          progress: bestSpeakerAwards,
          target: 3
        },
        {
          id: 'points_100',
          title: 'Century Club',
          description: 'Earned 100 total points',
          icon: '💯',
          unlocked: totalPoints >= 100,
          progress: totalPoints,
          target: 100
        },
        {
          id: 'points_250',
          title: 'High Achiever',
          description: 'Earned 250 total points',
          icon: '🚀',
          unlocked: totalPoints >= 250,
          progress: totalPoints,
          target: 250
        },
        {
          id: 'first_referral',
          title: 'Community Builder',
          description: 'Referred your first friend',
          icon: '👥',
          unlocked: referrals >= 1,
          progress: Math.min(referrals, 1),
          target: 1
        },
        {
          id: 'multiple_referrals',
          title: 'Ambassador',
          description: 'Referred 5 friends',
          icon: '🌟',
          unlocked: referrals >= 5,
          progress: referrals,
          target: 5
        }
      ];

      const unlocked = allAchievements.filter(a => a.unlocked);
      const locked = allAchievements.filter(a => !a.unlocked);

      return { unlocked, locked, stats };
    },
    enabled: !!user?.id
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="p-6">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-muted/50 rounded w-1/3 mb-4"></div>
              <div className="h-64 bg-muted/50 rounded"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { unlocked = [], locked = [], stats = { totalPoints: 0, bestSpeakerAwards: 0, referrals: 0, totalGDs: 0 } } = achievementsData || {};

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              🎯 Your Milestones
            </h1>
            <p className="text-lg text-muted-foreground">
              Celebrate your milestones and progress
            </p>
          </div>

          {/* Unlocked Achievements */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl">🌟 Unlocked Achievements ({unlocked.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {unlocked.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🎯</div>
                  <p className="text-muted-foreground">
                    Start participating to unlock your first achievement!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {unlocked.map((achievement) => (
                    <div key={achievement.id} className="p-4 bg-success/10 border border-success/20 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <div className="font-semibold text-success">{achievement.title}</div>
                          <div className="text-sm text-muted-foreground">{achievement.description}</div>
                          <Badge variant="default" className="mt-2">Unlocked</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Locked Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">🔒 Locked Achievements ({locked.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {locked.map((achievement) => (
                  <div key={achievement.id} className="p-4 bg-muted/50 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl opacity-50">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="font-semibold text-muted-foreground">{achievement.title}</div>
                        <div className="text-sm text-muted-foreground">{achievement.description}</div>
                        <div className="mt-2 space-y-2">
                          <Progress 
                            value={(achievement.progress / achievement.target) * 100} 
                            className="h-2"
                          />
                          <div className="text-xs text-muted-foreground">
                            {achievement.progress} / {achievement.target}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Achievements;
