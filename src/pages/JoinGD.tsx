
import { useEffect, useState, useMemo } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CalendarDays, Clock, Users, Search, Zap, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useGDRegistrationCount } from '@/hooks/useGDRegistrationCount';
import { format } from 'date-fns';

const JoinGD = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    document.title = 'Join Group Discussion - The Tomorrows Team';
  }, []);

  const { data: upcomingGDs, isLoading } = useQuery({
    queryKey: ['upcoming-gds-for-registration'],
    queryFn: async () => {
      const { data: gds, error } = await supabase
        .from('group_discussions')
        .select('*')
        .eq('is_active', true)
        .gte('scheduled_date', new Date().toISOString())
        .order('scheduled_date', { ascending: true });

      if (error) {
        throw error;
      }

      if (!gds) return [];

      // Get user's registrations if logged in
      let userRegistrations: string[] = [];
      if (user?.id) {
        const { data: registrations } = await supabase
          .from('gd_registrations')
          .select('gd_id')
          .eq('user_id', user.id)
          .is('cancelled_at', null);

        userRegistrations = registrations?.map(reg => reg.gd_id) || [];
      }

      return gds.map((gd) => ({
        ...gd,
        isUserRegistered: userRegistrations.includes(gd.id)
      }));
    },
    staleTime: 0,
    gcTime: 0,
  });

  // Set up real-time subscription for join GD page
  useEffect(() => {
    const channel = supabase
      .channel('join-gd-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_discussions'
        },
        () => {
          // Refetch data when GDs change
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gd_registrations'
        },
        () => {
          // Refetch data when registrations change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Filter GDs based on search term
  const filteredGDs = useMemo(() => {
    if (!upcomingGDs) return [];
    
    if (!searchTerm.trim()) return upcomingGDs;
    
    return upcomingGDs.filter(gd => 
      gd.topic_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (gd.description && gd.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [upcomingGDs, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🗓️ Join Group Discussions
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Participate in engaging discussions and improve your communication skills
            </p>
          </div>

          {/* Search */}
          <div className="mb-8">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Search discussions by topic..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* No GDs Available */}
          {!isLoading && (!filteredGDs || filteredGDs.length === 0) && !searchTerm && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-2xl font-semibold mb-4">No Upcoming Group Discussions</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                We're planning new sessions. Check back soon or explore our past sessions!
              </p>
              <div className="flex gap-4 justify-center">
                <Link to="/watch-learn">
                  <Button className="btn-primary">
                    📺 Watch Past Sessions
                  </Button>
                </Link>
                <Link to="/resources">
                  <Button variant="outline">
                    📚 Browse Resources
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* No Search Results */}
          {!isLoading && searchTerm && filteredGDs.length === 0 && upcomingGDs && upcomingGDs.length > 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-semibold mb-4">No Results Found</h3>
              <p className="text-gray-600 mb-6">
                No discussions match your search. Try different keywords or browse all available sessions.
              </p>
              <Button onClick={() => setSearchTerm('')} variant="outline">
                Clear Search
              </Button>
            </div>
          )}

          {/* GD Cards */}
          {!isLoading && filteredGDs && filteredGDs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGDs.map((gd) => (
                <GDCard key={gd.id} gd={gd} user={user} />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

// Individual GD Card Component
const GDCard = ({ gd, user }: { gd: any; user: any }) => {
  const { registrationData } = useGDRegistrationCount(gd.id);
  
  const scheduledDate = new Date(gd.scheduled_date);
  const formattedDate = format(scheduledDate, 'EEEE, MMMM do');
  const formattedTime = format(scheduledDate, 'h:mm a');

  const isUpcoming = scheduledDate > new Date();
  const isFull = registrationData?.isFull || false;

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-2 hover:border-purple-200">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-lg font-bold text-gray-900 line-clamp-2">
            {gd.topic_name}
          </CardTitle>
          {gd.isUserRegistered && (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              ✅ Registered
            </Badge>
          )}
        </div>
        
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{formattedTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>
              {registrationData 
                ? `${registrationData.spotsLeft} spots left out of ${registrationData.totalCapacity}`
                : `Loading capacity...`
              }
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {gd.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {gd.description}
          </p>
        )}
        
        <div className="flex gap-2">
          {!user ? (
            <Link to="/login" className="flex-1">
              <Button className="w-full btn-primary">
                <Zap className="w-4 h-4 mr-2" />
                Login to Register
              </Button>
            </Link>
          ) : gd.isUserRegistered ? (
            <>
              {gd.meet_link ? (
                <Button asChild className="flex-1 btn-primary">
                  <a href={gd.meet_link} target="_blank" rel="noopener noreferrer">
                    <Star className="w-4 h-4 mr-2" />
                    Join Meeting
                  </a>
                </Button>
              ) : (
                <Button disabled className="flex-1">
                  Link Coming Soon
                </Button>
              )}
              <Link to="/dashboard">
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              </Link>
            </>
          ) : isFull ? (
            <Button disabled className="w-full">
              <Users className="w-4 h-4 mr-2" />
              Session Full
            </Button>
          ) : !isUpcoming ? (
            <Button disabled className="w-full">
              Session Ended
            </Button>
          ) : (
            <Link to={`/register-gd/${gd.id}`} className="flex-1">
              <Button className="w-full btn-primary">
                <Zap className="w-4 h-4 mr-2" />
                Register Now
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default JoinGD;
