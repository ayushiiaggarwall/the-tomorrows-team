
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const RewardPoints = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Query for total points and count
  const { data: totalData } = useQuery({
    queryKey: ['user-total-points', user?.id],
    queryFn: async () => {
      if (!user?.id) return { totalPoints: 0, totalCount: 0 };

      const { data: allPoints } = await supabase
        .from('reward_points')
        .select('points')
        .eq('user_id', user.id);

      const totalPoints = allPoints?.reduce((sum, entry) => sum + entry.points, 0) || 0;
      const totalCount = allPoints?.length || 0;

      return { totalPoints, totalCount };
    },
    enabled: !!user?.id,
  });

  const { data: pointsData, isLoading, refetch } = useQuery({
    queryKey: ['user-reward-points', user?.id, currentPage, pageSize],
    queryFn: async () => {
      if (!user?.id) return { history: [] };

      // Fetching reward points for user

      const offset = (currentPage - 1) * pageSize;

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
        .range(offset, offset + pageSize - 1);

      if (rewardError) {
        // Error fetching reward points
        return { history: [] };
      }

      if (!rewardPoints || rewardPoints.length === 0) {
        // No reward points found for user
        return { history: [] };
      }

      // Reward points fetched
      
      // Get unique awarded_by user IDs to fetch their profiles
      const awardedByIds = [...new Set(rewardPoints.map(entry => entry.awarded_by).filter(Boolean))];
      
      let awardedByProfiles: any[] = [];
      if (awardedByIds.length > 0) {
        // Fetching profiles for awarded_by IDs
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', awardedByIds);
        
        if (profileError) {
          // Error fetching profiles
        } else {
          // Profiles fetched
          awardedByProfiles = profiles || [];
        }
      }

      const history = rewardPoints.map(entry => {
        const awardedByProfile = awardedByProfiles.find(profile => profile.id === entry.awarded_by);
        const awardedByName = awardedByProfile?.full_name || 
                              awardedByProfile?.email?.split('@')[0] || 
                              (entry.awarded_by ? 'Unknown User' : 'System');
        
        // Entry processing completed
        
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

      // Final history data prepared
      return { history };
    },
    enabled: !!user?.id,
    refetchInterval: 2000, // Refetch every 2 seconds for real-time updates
    staleTime: 0 // Always fetch fresh data
  });

  // Set up real-time subscription for reward points
  useEffect(() => {
    if (!user?.id) return;

    // Setting up real-time subscription for user reward points

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
          // Real-time reward points change
          // Force immediate refetch
          refetch();
        }
      )
      .subscribe((status) => {
        // User reward points subscription status
      });

    return () => {
      // Cleaning up user reward points real-time subscription
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

  const { totalPoints = 0, totalCount = 0 } = totalData || {};
  const { history = [] } = pointsData || {};

  const truncateText = (text: string, maxLength: number = 30) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

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
            <TooltipProvider>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Awarded By</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{entry.date}</TableCell>
                      <TableCell>
                        {entry.activity.length > 30 ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-help">{truncateText(entry.activity)}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">{entry.activity}</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          entry.activity
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs px-2 py-1 bg-muted rounded-full capitalize">
                          {entry.type}
                        </span>
                      </TableCell>
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
            </TooltipProvider>

            {totalCount > pageSize && (
              <div className="mt-4">
                <DataTablePagination
                  totalCount={totalCount}
                  pageSize={pageSize}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={(newPageSize) => {
                    setPageSize(newPageSize);
                    setCurrentPage(1);
                  }}
                />
              </div>
            )}
            
            <div className="mt-6 flex flex-col gap-3">
              <Button variant="outline" disabled className="w-full">
                📤 Redeem Rewards (Coming Soon)
              </Button>
              <Link to="/milestones">
                <Button variant="outline" className="w-full">
                  🏆 View Milestone Awards
                </Button>
              </Link>
              <Button variant="outline" disabled className="w-full">
                📊 Detailed Analytics (Coming Soon)
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default RewardPoints;
