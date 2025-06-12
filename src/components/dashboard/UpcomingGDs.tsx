
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

const UpcomingGDs = () => {
  const { user } = useAuth();

  const { data: upcomingGDs, isLoading } = useQuery({
    queryKey: ['upcoming-gds', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get upcoming GDs
      const { data: gds } = await supabase
        .from('group_discussions')
        .select(`
          id,
          topic_name,
          scheduled_date,
          slot_capacity,
          gd_registrations!inner(user_id)
        `)
        .eq('is_active', true)
        .gte('scheduled_date', new Date().toISOString())
        .order('scheduled_date', { ascending: true });

      if (!gds) return [];

      // Get user's registrations
      const { data: userRegistrations } = await supabase
        .from('gd_registrations')
        .select('gd_id')
        .eq('user_id', user.id);

      const userRegisteredGdIds = new Set(userRegistrations?.map(reg => reg.gd_id) || []);

      return gds.map(gd => {
        const registrationsCount = gd.gd_registrations?.length || 0;
        const isUserRegistered = userRegisteredGdIds.has(gd.id);
        
        return {
          id: gd.id,
          topic: gd.topic_name,
          date: new Date(gd.scheduled_date).toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric' 
          }),
          time: new Date(gd.scheduled_date).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
          }),
          spotsLeft: Math.max(0, gd.slot_capacity - registrationsCount),
          isRegistered: isUserRegistered
        };
      }).slice(0, 3); // Show only next 3 GDs
    },
    enabled: !!user?.id
  });

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
            {[...Array(2)].map((_, i) => (
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
          {upcomingGDs?.length ? "You're registered for the following GDs:" : "No upcoming GDs found"}
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
                      {gd.spotsLeft} spots left
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={gd.isRegistered ? 'default' : 'destructive'}
                    >
                      {gd.isRegistered ? 'Registered ✅' : 'Not Registered ❌'}
                    </Badge>
                    {gd.isRegistered ? (
                      <Button size="sm" className="btn-primary">
                        📩 Join Meeting
                      </Button>
                    ) : (
                      <Link to="/join-gd">
                        <Button size="sm" variant="outline">
                          Register Now
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
