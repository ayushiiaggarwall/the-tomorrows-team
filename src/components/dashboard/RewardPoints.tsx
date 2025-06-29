
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

      console.log('Fetching reward points for user:', user.id);

      // Get reward points with awarded_by user information
      const { data: rewardPoints, error: rewardError } = await supabase
        .from('reward_points')
        .select(`
          id,
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

      if (rewardError) {
        console.error('Error fetching reward points:', rewardError);
        return { totalPoints: 0, history: [] };
      }

      if (!rewardPoints || rewardPoints.length === 0) {
        console.log('No reward points found for user');
        return { totalPoints: 0, history: [] };
      }

      console.log('Reward points fetched:', rewardPoints);

      const totalPoints = rewardPoints.reduce((sum, entry) => sum + entry.points, 0);
      
      // Get unique awarded_by user IDs to fetch their profiles
      const awardedByIds = [...new Set(rewardPoints.map(entry => entry.awarded_by).filter(Boolean))];
      
      let awardedByProfiles: any[] = [];
      if (awardedByIds.length > 0) {
        console.log('Fetching profiles for awarded_by IDs:', awardedByIds);
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', awardedByIds);
        
        if (profileError) {
          console.error('Error fetching profiles:', profileError);
        } else {
          console.log('Profiles fetched:', profiles);
          awardedByProfiles = profiles || [];
        }
      }

      const history = rewardPoints.map(entry => {
        const awardedByProfile = awardedByProfiles.find(profile => profile.id === entry.awarded_by);
        const awardedByName = awardedByProfile?.full_name || 
                              awardedByProfile?.email?.split('@')[0] || 
                              (entry.awarded_by ? 'Unknown User' : 'System');
        
        console.log(`Entry ${entry.id}: awarded_by=${entry.awarded_by}, profile found=${!!awardedByProfile}, name=${awardedByName}`);
        
        return {
          date: new Date(entry.created_at).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          }),
          activity: entry.reason,
          points: entry.points > 0 ? `+${entry.points}` : entry.points.toString(),
          awardedBy: awardedByName,
          type: entry.type
        };
      });

      console.log('Final history data:', history);
      return { totalPoints, history };
    },
    enabled: !!user?.id,
    refetchInterval: 2000, // Refetch every 2 seconds for real-time updates
    staleTime: 0 // Always fetch fresh data
  });

  // Set up real-time subscription for reward points
  useEffect(() => {
    if (!user?.id) return;

    console.log('Setting up real-time subscription for user reward points:', user.id);

    const channel = supabase
      .channel(`user-reward-points-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reward_points',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time reward points change:', payload);
          // Force immediate refetch
          refetch();
        }
      )
      .subscribe((status) => {
        console.log('User reward points subscription status:', status);
      });

    return () => {
      console.log('Cleaning up user reward points real-time subscription');
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
                    <TableCell className={`text-right font-medium ${
                      entry.points.toString().startsWith('+') ? 'text-success' : 
                      entry.points.toString().startsWith('-') ? 'text-destructive' : 
                      'text-muted-foreground'
                    }`}>
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
