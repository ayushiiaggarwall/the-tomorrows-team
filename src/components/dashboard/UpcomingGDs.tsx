
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const UpcomingGDs = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: upcomingGDs, isLoading } = useQuery({
    queryKey: ['upcoming-gds', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      console.log('Fetching upcoming GDs for user:', user.id);

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
      console.log('User registered GD IDs:', userRegisteredGdIds);

      // Get registration counts for each GD
      const gdsWithCounts = await Promise.all(
        gds.map(async (gd) => {
          const { count, error: countError } = await supabase
            .from('gd_registrations')
            .select('*', { count: 'exact' })
            .eq('gd_id', gd.id);

          if (countError) {
            console.error('Error counting registrations for GD:', gd.id, countError);
          }

          const registrationsCount = count || 0;
          const spotsLeft = Math.max(0, gd.slot_capacity - registrationsCount);
          const isUserRegistered = userRegisteredGdIds.has(gd.id);
          
          console.log(`GD ${gd.id}: registered=${isUserRegistered}, spots=${spotsLeft}/${gd.slot_capacity}`);
          
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
            spotsLeft,
            totalSpots: gd.slot_capacity,
            isRegistered: isUserRegistered,
            meetLink: gd.meet_link
          };
        })
      );

      return gdsWithCounts.slice(0, 5); // Show top 5 upcoming GDs
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds to keep data fresh
  });

  // Registration mutation
  const registerMutation = useMutation({
    mutationFn: async (gdId: string) => {
      if (!user?.id) {
        throw new Error('User must be authenticated to register');
      }

      console.log('Dashboard registration attempt for GD:', gdId);

      // Check if already registered
      const { data: existingRegistration, error: checkError } = await supabase
        .from('gd_registrations')
        .select('id')
        .eq('gd_id', gdId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing registration:', checkError);
        throw new Error('Failed to check registration status');
      }

      if (existingRegistration) {
        throw new Error('You are already registered for this GD');
      }

      // Register for the GD
      const { data, error } = await supabase
        .from('gd_registrations')
        .insert({
          gd_id: gdId,
          user_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Registration error:', error);
        throw new Error(error.message || 'Failed to register for the GD');
      }

      console.log('Dashboard registration successful:', data);
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Successfully registered for the GD!",
      });
      queryClient.invalidateQueries({ queryKey: ['upcoming-gds'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-gds-for-registration'] });
    },
    onError: (error: any) => {
      console.error('Dashboard registration error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register for the GD. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleRegister = (gdId: string) => {
    console.log('Handle register called for GD:', gdId);
    registerMutation.mutate(gdId);
  };

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
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleRegister(gd.id)}
                        disabled={registerMutation.isPending || gd.spotsLeft === 0}
                      >
                        {registerMutation.isPending ? 'Registering...' : 
                         gd.spotsLeft === 0 ? 'Full' : 'Register'}
                      </Button>
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
