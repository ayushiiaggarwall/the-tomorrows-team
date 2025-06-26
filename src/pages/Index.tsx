import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import TestimonialForm from '@/components/TestimonialForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Users, Mic, Trophy, Calendar, Play, Star } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    document.title = 'Home - The Tomorrows Team';
  }, []);

  const [showTestimonialForm, setShowTestimonialForm] = useState(false);

  const features = [{
    icon: <Users className="w-6 h-6" />,
    title: "Group Discussions",
    description: "Join weekly online GDs with like-minded peers and practice your communication skills."
  }, {
    icon: <Mic className="w-6 h-6" />,
    title: "Podcasts & Videos",
    description: "Learn from recorded sessions and expert insights to improve your speaking style."
  }, {
    icon: <Trophy className="w-6 h-6" />,
    title: "Rewards & Recognition",
    description: "Earn points, climb the leaderboard, and get recognized for your participation."
  }];

  // Fetch real upcoming GDs from database
  const { data: upcomingGDs, isLoading: upcomingLoading } = useQuery({
    queryKey: ['home-upcoming-gds', user?.id],
    queryFn: async () => {
      const { data: gds, error } = await supabase
        .from('group_discussions')
        .select(`
          id,
          topic_name,
          scheduled_date,
          slot_capacity
        `)
        .eq('is_active', true)
        .gte('scheduled_date', new Date().toISOString())
        .order('scheduled_date', { ascending: true })
        .limit(3);

      if (error) {
        console.error('Error fetching GDs:', error);
        return [];
      }

      if (!gds) return [];

      // Get user's registrations if logged in
      let userRegisteredGdIds = new Set();
      if (user?.id) {
        const { data: userRegistrations, error: regError } = await supabase
          .from('gd_registrations')
          .select('gd_id')
          .eq('user_id', user.id);

        if (!regError && userRegistrations) {
          userRegisteredGdIds = new Set(userRegistrations.map(reg => reg.gd_id));
        }
      }

      // Get registration counts for each GD
      const gdsWithCounts = await Promise.all(
        gds.map(async (gd) => {
          const { count: registrationsCount, error: countError } = await supabase
            .from('gd_registrations')
            .select('*', { count: 'exact', head: true })
            .eq('gd_id', gd.id);

          if (countError) {
            console.error('Error counting registrations for GD:', gd.id, countError);
          }

          const totalRegistrations = registrationsCount || 0;
          const spotsLeft = Math.max(0, gd.slot_capacity - totalRegistrations);
          const isUserRegistered = userRegisteredGdIds.has(gd.id);

          console.log(`Home GD ${gd.id}: registered=${isUserRegistered}, totalRegistrations=${totalRegistrations}, spots=${spotsLeft}/${gd.slot_capacity}`);

          // Parse the date by adding 'Z' to treat it as UTC, then display in local time
          const utcDate = new Date(gd.scheduled_date + 'Z');

          return {
            id: gd.id,
            date: utcDate.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            }),
            time: utcDate.toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit', 
              hour12: true
            }),
            topic: gd.topic_name,
            spots: spotsLeft,
            isRegistered: isUserRegistered
          };
        })
      );

      return gdsWithCounts;
    },
    refetchInterval: 1000, // More frequent refetch
    staleTime: 0,
  });

  // Set up real-time subscription for registration changes on home page
  useEffect(() => {
    console.log('Setting up real-time subscription for home page GD registrations');
    
    const channel = supabase
      .channel(`home-gd-updates-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gd_registrations'
        },
        (payload) => {
          console.log('Home page GD registration change detected:', payload);
          // Force immediate refetch for all GD-related queries
          queryClient.invalidateQueries({ queryKey: ['home-upcoming-gds'] });
          queryClient.refetchQueries({ queryKey: ['home-upcoming-gds', user?.id] });
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
          console.log('Home page GD change detected:', payload);
          // Force immediate refetch for all GD-related queries
          queryClient.invalidateQueries({ queryKey: ['home-upcoming-gds'] });
          queryClient.refetchQueries({ queryKey: ['home-upcoming-gds', user?.id] });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up home page real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [queryClient, user?.id]);

  // Fetch featured video for sample GD section
  const { data: featuredVideo } = useQuery({
    queryKey: ['featured-video'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('featured_videos')
        .select('*')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching featured video:', error);
        return null;
      }

      return data;
    }
  });

  // Fetch real testimonials from database
  const { data: testimonials } = useQuery({
    queryKey: ['home-testimonials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Error fetching testimonials:', error);
        return [];
      }

      return data || [];
    }
  });

  // Check if current user has existing testimonial
  const { data: userTestimonial } = useQuery({
    queryKey: ['user-testimonial', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user testimonial:', error);
        return null;
      }

      return data;
    },
    enabled: !!user?.id
  });

  return <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="hero-gradient py-24 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
              Speak Up. Stand Out.<br />
              <span className="text-white/90">Shape Tomorrow.</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto animate-fade-in">
              Join a growing community of bold thinkers improving their communication skills through live group discussions, podcasts, and resources that matter.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
              <Link to="/join-gd">
                <Button size="lg" className="btn-join-gd text-lg">
                  Join a Group Discussion
                </Button>
              </Link>
              <Link to="/watch-learn">
                <Button size="lg" className="btn-watch-gd text-lg">
                  <Play className="w-5 h-5 mr-2" />
                  Watch Past GDs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What We Do
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Empowering young minds through structured communication practice and community learning.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => <Card key={index} className="feature-card text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 text-primary">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Upcoming GDs Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Upcoming Group Discussions
            </h2>
            <p className="text-xl text-muted-foreground">
              Reserve your spot in our upcoming sessions
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {upcomingLoading ? (
              // Loading skeleton
              [...Array(3)].map((_, i) => (
                <Card key={i} className="feature-card">
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-muted/50 rounded w-3/4"></div>
                      <div className="h-4 bg-muted/50 rounded w-1/2"></div>
                      <div className="h-8 bg-muted/50 rounded w-full"></div>
                      <div className="flex justify-between">
                        <div className="h-4 bg-muted/50 rounded w-1/3"></div>
                        <div className="h-8 bg-muted/50 rounded w-1/4"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : !upcomingGDs?.length ? (
              <div className="col-span-full text-center py-12">
                <div className="text-4xl mb-4">📅</div>
                <h3 className="text-lg font-semibold mb-2">No Upcoming Sessions</h3>
                <p className="text-muted-foreground mb-4">
                  New group discussions will be scheduled soon. Check back later!
                </p>
                <Link to="/join-gd">
                  <Button className="btn-primary">View All Sessions</Button>
                </Link>
              </div>
            ) : (
              upcomingGDs.map((gd, index) => <Card key={index} className="feature-card">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-3">
                      <Calendar className="w-5 h-5 text-primary mr-2" />
                      <span className="text-sm font-medium text-primary">{gd.date} • {gd.time}</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-3">{gd.topic}</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{gd.spots} spots left</span>
                      {gd.isRegistered ? (
                        <Button size="sm" variant="secondary" disabled>
                          ✅ Registered
                        </Button>
                      ) : (
                        <Link to="/join-gd">
                          <Button size="sm" className="btn-primary">Register</Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>)
            )}
          </div>
          
          {upcomingGDs?.length ? (
            <div className="text-center mt-8">
              <Link to="/join-gd">
                <Button className="btn-secondary">View All Sessions</Button>
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      {/* Sample GD Video */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
            Watch a Sample GD
          </h2>
          {featuredVideo ? (
            <div className="aspect-video rounded-xl overflow-hidden shadow-lg bg-muted">
              <iframe 
                width="100%" 
                height="100%" 
                src={featuredVideo.video_url} 
                title={featuredVideo.title} 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              />
            </div>
          ) : (
            <div className="aspect-video rounded-xl overflow-hidden shadow-lg bg-muted flex items-center justify-center">
              <div className="text-center">
                <Play className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No featured video available</p>
                <p className="text-sm text-muted-foreground mt-2">Admin can add videos from the dashboard</p>
              </div>
            </div>
          )}
          <div className="mt-8">
            <Link to="/watch-learn">
              <Button className="btn-secondary">Explore More Videos</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What Our Community Says
            </h2>
            <p className="text-xl text-muted-foreground">
              Real stories from real participants
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {!testimonials?.length ? (
              <div className="col-span-full text-center py-12">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to share your experience with our community!
                </p>
                <Button 
                  className="btn-primary"
                  onClick={() => setShowTestimonialForm(true)}
                >
                  Share Your Review
                </Button>
              </div>
            ) : (
              testimonials.map((testimonial) => <Card key={testimonial.id} className="feature-card">
                  <CardContent className="p-6">
                    <div className="flex mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                    </div>
                    <p className="text-muted-foreground mb-4 italic">
                      "{testimonial.content}"
                    </p>
                    <div>
                      <p className="font-semibold">{testimonial.user_name}</p>
                      {testimonial.user_role && (
                        <p className="text-sm text-muted-foreground">{testimonial.user_role}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>)
            )}
          </div>

          {testimonials?.length ? (
            <div className="text-center mt-8">
              <Button 
                className="btn-secondary"
                onClick={() => setShowTestimonialForm(true)}
              >
                {userTestimonial ? 'Edit Your Review' : 'Share Your Review'}
              </Button>
            </div>
          ) : null}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Ready to Transform Your Communication Skills?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of young professionals who've already started their journey with us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/join-gd">
              <Button size="lg" className="btn-join-gd text-lg">
                Join Your First GD
              </Button>
            </Link>
            <Link to="/leaderboard">
              <Button size="lg" className="btn-secondary text-lg">
                See Rewards & Leaderboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <TestimonialForm 
        open={showTestimonialForm}
        onOpenChange={setShowTestimonialForm}
      />

      <Footer />
    </div>;
};
export default Index;
