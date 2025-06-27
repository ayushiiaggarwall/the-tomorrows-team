import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useGDRegistrationCount } from '@/hooks/useGDRegistrationCount';
import { Link } from 'react-router-dom';

const UpcomingGDs = () => {
  const { user } = useAuth();

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

      const gdsWithUserStatus = gds.map((gd) => {
        const isUserRegistered = userRegisteredGdIds.has(gd.id);
        
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
          totalSpots: gd.slot_capacity,
          isRegistered: isUserRegistered,
          meetLink: gd.meet_link
        };
      });

      return gdsWithUserStatus.slice(0, 5);
    },
    enabled: !!user?.id,
    staleTime: 0,
    gcTime: 0,
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
                <GDCard key={gd.id} gd={gd} />
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

// Separate component for each GD card to manage its own registration count
const GDCard = ({ gd }: { gd: any }) => {
  const { registrationData } = useGDRegistrationCount(gd.id);
  const { user } = useAuth();

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex-1">
        <div className="font-medium">{gd.topic}</div>
        <div className="text-sm text-muted-foreground">
          {gd.date} at {gd.time}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {registrationData 
            ? `${registrationData.spotsLeft} spots left out of ${registrationData.totalCapacity}`
            : `Loading spots...`
          }
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
          <Link to={user ? "/join-gd" : "/login"}>
            <Button size="sm" variant="outline">
              {registrationData?.isFull ? 'Full' : 'Register'}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default UpcomingGDs;
