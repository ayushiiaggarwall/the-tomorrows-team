
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

const RewardPoints = () => {
  const { user } = useAuth();

  const { data: pointsData, isLoading, refetch } = useQuery({
    queryKey: ['user-reward-points', user?.id],
    queryFn: async () => {
      if (!user?.id) return { totalPoints: 0, history: [] };

      // Get reward points with awarded_by user information
      const { data: rewardPoints } = await supabase
        .from('reward_points')
        .select(`
          points, 
          reason, 
          created_at, 
          type,
          awarded_by,
          gd_date
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!rewardPoints) return { totalPoints: 0, history: [] };

      const totalPoints = rewardPoints.reduce((sum, entry) => sum + entry.points, 0);
      
      // Get unique awarded_by user IDs to fetch their profiles
      const awardedByIds = [...new Set(rewardPoints.map(entry => entry.awarded_by).filter(Boolean))];
      
      let awardedByProfiles: any[] = [];
      if (awardedByIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', awardedByIds);
        
        awardedByProfiles = profiles || [];
      }

      const history = rewardPoints.map(entry => {
        const awardedByProfile = awardedByProfiles.find(profile => profile.id === entry.awarded_by);
        const awardedByName = awardedByProfile?.full_name || awardedByProfile?.email?.split('@')[0] || 'System';
        
        return {
          date: new Date(entry.created_at).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          }),
          activity: entry.reason,
          points: `+${entry.points}`,
          awardedBy: awardedByName,
          type: entry.type
        };
      });

      return { totalPoints, history };
    },
    enabled: !!user?.id
  });

  // Set up real-time subscription for reward points
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('reward-points-changes')
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
            🎁 Reward Points Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-16 bg-muted/50 rounded-lg mb-4"></div>
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-8 bg-muted/50 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { totalPoints, history } = pointsData || { totalPoints: 0, history: [] };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🎁 Reward Points Breakdown
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {history.length ? "See how you earned your points" : "Start participating to earn points!"}
        </p>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-4 bg-success/10 border border-success/20 rounded-lg text-center">
          <div className="text-2xl font-bold text-success">{totalPoints}</div>
          <div className="text-sm text-muted-foreground">🏆 Total Points</div>
        </div>
        
        {!history.length ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold mb-2">No Points Yet</h3>
            <p className="text-muted-foreground mb-4">
              Participate in group discussions, vote for best speakers, and refer friends to start earning points!
            </p>
            <Button className="btn-primary">Join Your First GD</Button>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Awarded By</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{entry.date}</TableCell>
                    <TableCell>{entry.activity}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{entry.awardedBy}</TableCell>
                    <TableCell className="text-right text-success font-medium">
                      {entry.points}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <div className="mt-6 flex flex-col gap-3">
              <Button variant="outline" disabled className="w-full">
                📤 Redeem Rewards (Coming Soon)
              </Button>
              <Button variant="outline" disabled className="w-full">
                🏆 View All Achievements
              </Button>
              <Button variant="outline" disabled className="w-full">
                📊 Detailed Analytics
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default RewardPoints;
