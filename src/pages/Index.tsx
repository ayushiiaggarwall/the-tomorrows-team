import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, TrendingUp, BookOpen, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '@/components/Footer';

const Index = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Set document title
  useEffect(() => {
    document.title = 'Home - The Tomorrows Team';
  }, []);

  // Fetch upcoming GDs for home page
  const { data: upcomingGDs, isLoading: gdLoading } = useQuery({
    queryKey: ['home-upcoming-gds', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      console.log('Fetching upcoming GDs for home page user:', user.id);

      // Get upcoming GDs
      const { data: gds, error: gdsError } = await supabase
        .from('group_discussions')
        .select('*')
        .eq('is_active', true)
        .gte('scheduled_date', new Date().toISOString())
        .order('scheduled_date', { ascending: true })
        .limit(3);

      if (gdsError) {
        console.error('Error fetching GDs for home:', gdsError);
        return [];
      }

      if (!gds) return [];

      // Get user's registrations
      const { data: userRegistrations, error: regError } = await supabase
        .from('gd_registrations')
        .select('gd_id')
        .eq('user_id', user.id);

      if (regError) {
        console.error('Error fetching user registrations for home:', regError);
      }

      const userRegisteredGdIds = new Set(userRegistrations?.map(reg => reg.gd_id) || []);

      // Get registration counts for each GD
      const gdsWithCounts = await Promise.all(
        gds.map(async (gd) => {
          const { count: registrationsCount, error: countError } = await supabase
            .from('gd_registrations')
            .select('*', { count: 'exact', head: true })
            .eq('gd_id', gd.id);

          if (countError) {
            console.error('Error counting registrations for home GD:', gd.id, countError);
          }

          const totalRegistrations = registrationsCount || 0;
          const spotsLeft = Math.max(0, gd.slot_capacity - totalRegistrations);
          const isUserRegistered = userRegisteredGdIds.has(gd.id);
          
          console.log(`Home GD ${gd.id}: registered=${isUserRegistered}, totalRegistrations=${totalRegistrations}, spots=${spotsLeft}/${gd.slot_capacity}`);
          
          // Parse the date properly - treat stored date as UTC and convert to local
          const scheduledDate = new Date(gd.scheduled_date + 'Z');
          
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

      return gdsWithCounts;
    },
    enabled: !!user?.id,
    refetchInterval: 5000, // Refetch every 5 seconds
    staleTime: 0,
  });

  // Set up real-time subscription for home page
  useEffect(() => {
    if (!user?.id) return;

    console.log('Setting up real-time subscription for home page GD updates');
    
    const channel = supabase
      .channel(`home-gd-updates-${user.id}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gd_registrations'
        },
        (payload) => {
          console.log('Home: GD registration change detected:', payload);
          // Force immediate refetch for all GD-related queries
          queryClient.invalidateQueries({ queryKey: ['home-upcoming-gds'] });
          queryClient.invalidateQueries({ queryKey: ['upcoming-gds'] });
          queryClient.invalidateQueries({ queryKey: ['upcoming-gds-for-registration'] });
          queryClient.refetchQueries({ queryKey: ['home-upcoming-gds', user.id] });
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
          console.log('Home: GD change detected:', payload);
          // Force immediate refetch for all GD-related queries
          queryClient.invalidateQueries({ queryKey: ['home-upcoming-gds'] });
          queryClient.invalidateQueries({ queryKey: ['upcoming-gds'] });
          queryClient.invalidateQueries({ queryKey: ['upcoming-gds-for-registration'] });
          queryClient.refetchQueries({ queryKey: ['home-upcoming-gds', user.id] });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up home page real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  const { data: testimonials, isLoading: testimonialsLoading } = useQuery({
    queryKey: ['approved-testimonials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data || [];
    },
  });

  const { data: featuredVideos, isLoading: videosLoading } = useQuery({
    queryKey: ['featured-videos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('featured_videos')
        .select('*')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Shape Tomorrow's Leaders
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Join group discussions, share ideas, and build skills that matter for your future career.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/join-gd">
              <Button size="lg" className="text-lg px-8 py-3">
                Join a Discussion
              </Button>
            </Link>
            <Link to="/watch-learn">
              <Button size="lg" variant="outline" className="text-lg px-8 py-3">
                Watch & Learn
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-2">500+</h3>
              <p className="text-muted-foreground">Active Participants</p>
            </div>
            <div className="text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-2">50+</h3>
              <p className="text-muted-foreground">Discussion Topics</p>
            </div>
            <div className="text-center">
              <Award className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-2">98%</h3>
              <p className="text-muted-foreground">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming GDs Section */}
      {user && (
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Upcoming Group Discussions</h2>
            
            {gdLoading ? (
              <div className="grid md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="h-4 bg-muted/50 rounded w-3/4"></div>
                        <div className="h-4 bg-muted/50 rounded w-1/2"></div>
                        <div className="h-8 bg-muted/50 rounded w-full"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : !upcomingGDs?.length ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="text-4xl mb-4">📅</div>
                  <h3 className="text-lg font-semibold mb-2">No Upcoming Sessions</h3>
                  <p className="text-muted-foreground mb-4">
                    New group discussions will be scheduled soon. Check back later!
                  </p>
                  <Link to="/join-gd">
                    <Button>Browse All Sessions</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  {upcomingGDs.map((gd) => (
                    <Card key={gd.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{gd.topic}</CardTitle>
                          <Badge variant={gd.isRegistered ? 'default' : 'secondary'}>
                            {gd.isRegistered ? 'Registered' : `${gd.spotsLeft} spots left`}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{gd.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{gd.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{gd.totalSpots} total spots</span>
                          </div>
                        </div>
                        {gd.isRegistered ? (
                          gd.meetLink ? (
                            <Button className="w-full" asChild>
                              <a href={gd.meetLink} target="_blank" rel="noopener noreferrer">
                                Join Meeting
                              </a>
                            </Button>
                          ) : (
                            <Button className="w-full" disabled>
                              Meeting Link Coming Soon
                            </Button>
                          )
                        ) : (
                          <Link to="/join-gd">
                            <Button className="w-full" variant="outline">
                              {gd.spotsLeft === 0 ? 'Session Full' : 'Register Now'}
                            </Button>
                          </Link>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="text-center">
                  <Link to="/join-gd">
                    <Button size="lg">View All Sessions</Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* Featured Videos Section */}
      {featuredVideos && featuredVideos.length > 0 && (
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Featured Videos</h2>
            
            {videosLoading ? (
              <div className="grid md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-muted/50 rounded-t-lg"></div>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="h-4 bg-muted/50 rounded w-3/4"></div>
                        <div className="h-4 bg-muted/50 rounded w-1/2"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {featuredVideos.map((video) => (
                  <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-muted relative">
                      {video.thumbnail_url ? (
                        <img 
                          src={video.thumbnail_url} 
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          📹 Video Thumbnail
                        </div>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-2">{video.title}</h3>
                      {video.description && (
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {video.description}
                        </p>
                      )}
                      <Button variant="outline" className="w-full" asChild>
                        <a href={video.video_url} target="_blank" rel="noopener noreferrer">
                          Watch Video
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      {testimonials && testimonials.length > 0 && (
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">What Our Community Says</h2>
            
            {testimonialsLoading ? (
              <div className="grid md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="h-4 bg-muted/50 rounded w-full"></div>
                        <div className="h-4 bg-muted/50 rounded w-3/4"></div>
                        <div className="h-4 bg-muted/50 rounded w-1/2"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {testimonials.slice(0, 3).map((testimonial) => (
                  <Card key={testimonial.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <span key={i} className="text-yellow-400">⭐</span>
                        ))}
                      </div>
                      <p className="text-muted-foreground mb-4 italic">
                        "{testimonial.content}"
                      </p>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{testimonial.user_name}</p>
                          {testimonial.user_role && (
                            <p className="text-sm text-muted-foreground">{testimonial.user_role}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of students and professionals who are building their future through meaningful discussions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/join-gd">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                Join a Discussion Today
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Learn More About Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
