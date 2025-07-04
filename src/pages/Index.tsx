
import { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import HomeGDCard from '@/components/HomeGDCard';
import TestimonialsCarousel from '@/components/dashboard/TestimonialsCarousel';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';

const Index = () => {
  const { user } = useAuth();
  
  // Set up auto-refresh for the home page
  useAutoRefresh('home-page');

  useEffect(() => {
    document.title = 'The Tomorrows Team - Skill Building Through Group Discussions';
  }, []);

  // Query to get upcoming group discussions
  const { data: upcomingGDs, isLoading: gdsLoading } = useQuery({
    queryKey: ['home-upcoming-gds'],
    queryFn: async () => {
      const { data: gds, error } = await supabase
        .from('group_discussions')
        .select('*')
        .eq('is_active', true)
        .gte('scheduled_date', new Date().toISOString())
        .order('scheduled_date', { ascending: true })
        .limit(6);

      if (error) {
        throw error;
      }

      return gds || [];
    },
    staleTime: 0,
    gcTime: 0,
  });

  // Set up real-time listener for GD changes on home page
  useEffect(() => {
    const channel = supabase
      .channel('home-gd-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'group_discussions' },
        () => {
          // Invalidate and refetch GD data when there are changes
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'gd_registrations' },
        () => {
          // Invalidate and refetch when registrations change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Build Skills Through <br />
            <span className="text-purple-600">Group Discussions</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Join our vibrant community of learners and professionals. Participate in engaging group discussions, 
            earn points, and climb the leaderboard while building valuable communication skills.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to={user ? "/join-gd" : "/login"}>
              <Button size="lg" className="btn-primary text-lg px-8 py-4">
                🚀 Join Discussion
              </Button>
            </Link>
            <Link to="/watch-learn">
              <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                📺 Watch & Learn
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">500+</div>
              <div className="text-gray-600">Active Members</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">100+</div>
              <div className="text-gray-600">Discussions Held</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">95%</div>
              <div className="text-gray-600">Satisfaction Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">24/7</div>
              <div className="text-gray-600">Community Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming GDs Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              🗓️ Upcoming Group Discussions
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join our next sessions and start your journey to better communication
            </p>
          </div>
          
          {gdsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !upcomingGDs?.length ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-2xl font-semibold mb-4">No Upcoming Discussions</h3>
              <p className="text-gray-600 mb-6">
                We're planning exciting new sessions. Check back soon or explore our resources!
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
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {upcomingGDs.slice(0, 6).map((gd) => (
                  <HomeGDCard key={gd.id} gd={gd} />
                ))}
              </div>
              
              <div className="text-center">
                <Link to="/join-gd">
                  <Button size="lg" className="btn-primary">
                    🔘 View All Sessions
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              ✨ Why Choose Us?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover what makes our community special
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-2 border-purple-100 hover:border-purple-200 transition-colors">
              <CardHeader>
                <div className="text-4xl mb-2">🏆</div>
                <CardTitle className="text-purple-600">Gamified Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Earn points, badges, and climb the leaderboard while improving your communication skills.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-blue-100 hover:border-blue-200 transition-colors">
              <CardHeader>
                <div className="text-4xl mb-2">👥</div>
                <CardTitle className="text-blue-600">Diverse Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Connect with students, professionals, and experts from various backgrounds and industries.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-green-100 hover:border-green-200 transition-colors">
              <CardHeader>
                <div className="text-4xl mb-2">📈</div>
                <CardTitle className="text-green-600">Skill Development</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Practice public speaking, critical thinking, and leadership in a supportive environment.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              💬 What Our Members Say
            </h2>
            <p className="text-xl text-gray-600">
              Real stories from our amazing community
            </p>
          </div>
          
          <TestimonialsCarousel />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of learners who are already improving their communication skills and building meaningful connections.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={user ? "/join-gd" : "/login"}>
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-4">
                🚀 Get Started Now
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-gray-900">
                📖 Learn More
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
