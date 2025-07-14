import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import TestimonialForm from '@/components/TestimonialForm';
import FeaturedVideo from '@/components/FeaturedVideo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Mic, Trophy, Calendar, Play, Star, LogIn, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useGDRegistrationCount } from '@/hooks/useGDRegistrationCount';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import HomeGDCard from '@/components/HomeGDCard';


const Index = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Auto-refresh every 30 seconds for live updates
  useAutoRefresh({
    interval: 30000, // 30 seconds for more responsive updates
    enabled: true
  });

  useEffect(() => {
    document.title = 'Home - The Tomorrows Team';
  }, []);

  const [showTestimonialForm, setShowTestimonialForm] = useState(false);

  const features = [{
    icon: <Users className="w-6 h-6" />,
    title: "Online Group Discussions",
    description: "Join weekly public speaking group discussions with like-minded peers and improve communication skills with live discussions."
  }, {
    icon: <Mic className="w-6 h-6" />,
    title: "Communication Podcasts & Resources",
    description: "Access podcasts and resources for communication skills - learn from recorded sessions and expert insights."
  }, {
    icon: <Trophy className="w-6 h-6" />,
    title: "Rewards & Recognition",
    description: "Earn points through critical thinking community activities, climb the leaderboard, and get recognized for your participation."
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
        return [];
      }

      if (!gds) return [];

      // Get user's registrations if logged in - only active ones (not cancelled)
      let userRegistrations = [];
      if (user?.id) {
        const { data: registrations, error: regError } = await supabase
          .from('gd_registrations')
          .select('gd_id, cancelled_at')
          .eq('user_id', user.id);

        if (!regError && registrations) {
          userRegistrations = registrations;
        }
      }

      const gdsWithUserStatus = gds.map((gd) => {
        // Check if user has any registration for this GD
        const userReg = userRegistrations.find(reg => reg.gd_id === gd.id);
        // User is registered if they have a registration that is NOT cancelled
        const isUserRegistered = userReg && !userReg.cancelled_at;

        // Parse the date properly without adding 'Z'
        const scheduledDate = new Date(gd.scheduled_date);

        return {
          id: gd.id,
          date: scheduledDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          }),
          time: scheduledDate.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true
          }),
          topic: gd.topic_name,
          totalCapacity: gd.slot_capacity,
          isRegistered: isUserRegistered
        };
      });

      return gdsWithUserStatus;
    },
    staleTime: 0,
    gcTime: 0,
  });

  // Set up real-time subscription for registration changes on home page
  useEffect(() => {
    const channel = supabase
      .channel(`home-gd-updates`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gd_registrations'
        },
        (payload) => {
          // Force immediate refetch with fresh data
          queryClient.invalidateQueries({ queryKey: ['home-upcoming-gds'] });
          queryClient.invalidateQueries({ queryKey: ['upcoming-gds'] });
          queryClient.invalidateQueries({ queryKey: ['upcoming-gds-for-registration'] });
          // Force refetch with the current user ID
          queryClient.refetchQueries({ queryKey: ['home-upcoming-gds', user?.id] });
          // Also refetch all GD registration counts
          queryClient.refetchQueries({ queryKey: ['gd-registration-count'] });
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
          // Force immediate refetch with fresh data
          queryClient.invalidateQueries({ queryKey: ['home-upcoming-gds'] });
          queryClient.invalidateQueries({ queryKey: ['upcoming-gds'] });
          queryClient.invalidateQueries({ queryKey: ['upcoming-gds-for-registration'] });
          queryClient.refetchQueries({ queryKey: ['home-upcoming-gds', user?.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, user?.id]);

  // Fetch featured video from media_content table with optimized caching
  const { data: featuredVideo } = useQuery({
    queryKey: ['featured-video'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('media_content')
        .select('*')
        .eq('is_featured', true)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        return null;
      }

      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch real testimonials from database with optimized caching
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
        return [];
      }

      return data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
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
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        return null;
      }

      return data;
    },
    enabled: !!user?.id
  });

  const handleJoinGDClick = () => {
    if (user) {
      navigate('/join-gd');
    } else {
      navigate('/login');
    }
  };

  const handleTestimonialClick = () => {
    setShowTestimonialForm(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="The Tomorrows Team - Leadership Through Group Discussions"
        description="Join engaging group discussions, earn reward points, and develop leadership skills with The Tomorrows Team. Participate in structured debates and build your communication expertise."
        keywords="group discussions, leadership development, communication skills, debate, reward points, team building, professional development, public speaking, career growth"
        url="/"
        type="website"
      />
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="hero-gradient py-24 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm mb-6 animate-fade-in">
              <Users className="w-4 h-4 mr-2" />
              Join our growing community of professionals
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
              Master Public Speaking &<br />
              <span className="text-white/90">Land Your Dream Job</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto animate-fade-in">
              Join live group discussions, practice presentations, and build confidence that gets you noticed in interviews and meetings. <span className="font-semibold">100% FREE sessions!</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
              <Button size="lg" className="btn-join-gd text-lg shadow-xl" onClick={handleJoinGDClick}>
                {user ? 'Book Your Session Now' : 'Start FREE with US'}
              </Button>
              <Link to="/watch-learn">
                <Button size="lg" className="btn-watch-gd text-lg border-white/30 hover:border-white/50">
                  <Play className="w-5 h-5 mr-2" />
                  Watch Past Sessions
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center gap-6 mt-8 text-white/70 text-sm animate-fade-in">
              <div className="flex items-center">
                <Trophy className="w-4 h-4 mr-1" />
                Earn rewards for participation
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Weekly sessions available
              </div>
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
              Book Sessions Online
            </h2>
            <p className="text-xl text-muted-foreground">
              Join our live discussion community - reserve your spot in upcoming sessions
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
              upcomingGDs.map((gd, index) => <HomeGDCard key={index} gd={gd} />)
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

      {/* Featured Video */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
            Featured Video
          </h2>
          {featuredVideo ? (
            <FeaturedVideo video={featuredVideo} />
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
                  onClick={handleTestimonialClick}
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
                    <p className="text-muted-foreground mb-4 italic break-words overflow-wrap-anywhere">
                      "{testimonial.content}"
                    </p>
                    <div>
                      <p className="font-semibold break-words">{testimonial.user_name}</p>
                      {testimonial.user_role && (
                        <p className="text-sm text-muted-foreground break-words">{testimonial.user_role}</p>
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
                onClick={handleTestimonialClick}
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
            <Button size="lg" className="btn-join-gd text-lg" onClick={handleJoinGDClick}>
              Join Your First GD
            </Button>
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
    </div>
  );
};

export default Index;
