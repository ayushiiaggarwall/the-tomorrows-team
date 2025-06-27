import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

const UpcomingGDs = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: upcomingGDs, isLoading } = useQuery({
    queryKey: ['upcoming-gds', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      console.log('Fetching upcoming GDs for dashboard user:', user.id);

      // Get upcoming GDs
      const { data: gds, error: gdsError } = await supabase
        .from('group_discussions')
        .select('*')
        .eq('is_active', true)
        .gte('scheduled_date', new Date().toISOString())
        .order('scheduled_date', { ascending: true });

      if (gdsError) {
        console.error('Error fetching GDs:', gdsError);
        return [];
      }

      if (!gds) return [];

      // Get user's registrations
      const { data: userRegistrations, error: regError } = await supabase
        .from('gd_registrations')
        .select('gd_id')
        .eq('user_id', user.id);

      if (regError) {
        console.error('Error fetching user registrations:', regError);
      }

      const userRegisteredGdIds = new Set(userRegistrations?.map(reg => reg.gd_id) || []);

      // Count registrations for each GD by querying the database directly
      const gdsWithCounts = await Promise.all(
        gds.map(async (gd) => {
          // Count ALL registrations for this specific GD from database
          const { data: registrations, error: countError } = await supabase
            .from('gd_registrations')
            .select('id')
            .eq('gd_id', gd.id);

          if (countError) {
            console.error('Error counting registrations for GD:', gd.id, countError);
          }

          const totalRegistrations = registrations ? registrations.length : 0;
          const spotsLeft = Math.max(0, gd.slot_capacity - totalRegistrations);
          const isUserRegistered = userRegisteredGdIds.has(gd.id);
          
          console.log(`Dashboard GD ${gd.id}: registered=${isUserRegistered}, totalRegistrations=${totalRegistrations}, spots=${spotsLeft}/${gd.slot_capacity}`);
          
          // Parse the date properly without adding 'Z'
          const scheduledDate = new Date(gd.scheduled_date);
          
          return {
            id: gd.id,
            topic: gd.topic_name,
            date: scheduledDate.toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric' 
            }),
            time: scheduledDate.toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit', 
              hour12: true
            }),
            spotsLeft,
            totalSpots: gd.slot_capacity,
            isRegistered: isUserRegistered,
            meetLink: gd.meet_link
          };
        })
      );

      return gdsWithCounts.slice(0, 5);
    },
    enabled: !!user?.id,
    staleTime: 0, // Always refetch to get latest counts
    gcTime: 0, // Don't cache old data
  });

  // Set up real-time subscription for registration changes
  useEffect(() => {
    if (!user?.id) return;

    console.log('Setting up real-time subscription for dashboard GD updates');
    
    const channel = supabase
      .channel(`dashboard-gd-updates-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gd_registrations'
        },
        (payload) => {
          console.log('Dashboard: GD registration change detected, refetching counts:', payload);
          // Force immediate refetch with fresh data
          queryClient.invalidateQueries({ queryKey: ['upcoming-gds'] });
          queryClient.invalidateQueries({ queryKey: ['upcoming-gds-for-registration'] });
          queryClient.invalidateQueries({ queryKey: ['home-upcoming-gds'] });
          queryClient.refetchQueries({ queryKey: ['upcoming-gds', user.id] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_discussions'
        },
        (payload) => {
          console.log('Dashboard: GD change detected, refetching counts:', payload);
          // Force immediate refetch with fresh data
          queryClient.invalidateQueries({ queryKey: ['upcoming-gds'] });
          queryClient.invalidateQueries({ queryKey: ['upcoming-gds-for-registration'] });
          queryClient.invalidateQueries({ queryKey: ['home-upcoming-gds'] });
          queryClient.refetchQueries({ queryKey: ['upcoming-gds', user.id] });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up dashboard real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🗓️ Upcoming Group Discussions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-muted/50 rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🗓️ Upcoming Group Discussions
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {upcomingGDs?.length ? "Next scheduled sessions:" : "No upcoming GDs found"}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!upcomingGDs?.length ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-lg font-semibold mb-2">No Upcoming GDs</h3>
              <p className="text-muted-foreground mb-4">
                There are no group discussions scheduled at the moment. Check back soon or explore past sessions.
              </p>
              <div className="flex gap-2 justify-center">
                <Link to="/join-gd">
                  <Button className="btn-primary">Browse All Sessions</Button>
                </Link>
                <Link to="/watch-learn">
                  <Button variant="outline">Watch Past GDs</Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {upcomingGDs.map((gd) => (
                <div key={gd.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{gd.topic}</div>
                    <div className="text-sm text-muted-foreground">
                      {gd.date} at {gd.time}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {gd.spotsLeft} spots left out of {gd.totalSpots}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={gd.isRegistered ? 'default' : 'secondary'}
                    >
                      {gd.isRegistered ? 'Registered ✅' : 'Available'}
                    </Badge>
                    {gd.isRegistered ? (
                      gd.meetLink ? (
                        <Button size="sm" className="btn-primary" asChild>
                          <a href={gd.meetLink} target="_blank" rel="noopener noreferrer">
                            📩 Join Meeting
                          </a>
                        </Button>
                      ) : (
                        <Button size="sm" disabled>
                          Link Coming Soon
                        </Button>
                      )
                    ) : (
                      <Link to="/join-gd">
                        <Button size="sm" variant="outline">
                          {gd.spotsLeft === 0 ? 'Full' : 'Register'}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
              
              <div className="mt-6 text-center">
                <Link to="/join-gd">
                  <Button className="btn-primary">
                    🔘 View All Sessions
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingGDs;
