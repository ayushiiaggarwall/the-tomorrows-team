
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useGDRegistrationCount } from '@/hooks/useGDRegistrationCount';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { ArrowRight, Users, Award, BookOpen, Calendar, Clock, MapPin } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.title = 'Home - The Tomorrows Team';
  }, []);

  const { data: upcomingGDs, isLoading } = useQuery({
    queryKey: ['upcoming-gds-home'],
    queryFn: async () => {
      const { data: gds, error } = await supabase
        .from('group_discussions')
        .select('*')
        .eq('is_active', true)
        .gte('scheduled_date', new Date().toISOString())
        .order('scheduled_date', { ascending: true })
        .limit(3);

      if (error) {
        console.error('Error fetching GDs:', error);
        return [];
      }

      return gds?.map((gd) => {
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
          meetLink: gd.meet_link
        };
      }) || [];
    },
    staleTime: 30000, // 30 seconds
  });

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Build Your Future with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                The Tomorrows Team
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Join engaging group discussions, earn rewards, and grow your skills alongside like-minded individuals. 
              Your journey to personal and professional excellence starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link to="/dashboard">
                  <Button size="lg" className="btn-primary text-lg px-8 py-4">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <Link to="/login">
                  <Button size="lg" className="btn-primary text-lg px-8 py-4">
                    Get Started Today
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              )}
              <Link to="/about">
                <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose The Tomorrows Team?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We provide a comprehensive platform for personal growth through meaningful discussions and community engagement.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="feature-card text-center">
              <CardHeader>
                <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
                <CardTitle className="text-2xl mb-2">Group Discussions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Participate in structured group discussions on diverse topics. 
                  Build confidence, improve communication skills, and learn from others.
                </p>
              </CardContent>
            </Card>
            
            <Card className="feature-card text-center">
              <CardHeader>
                <Award className="w-12 h-12 mx-auto mb-4 text-primary" />
                <CardTitle className="text-2xl mb-2">Reward System</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Earn points for participation and achievements. 
                  Compete on leaderboards and unlock exclusive rewards as you grow.
                </p>
              </CardContent>
            </Card>
            
            <Card className="feature-card text-center">
              <CardHeader>
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-primary" />
                <CardTitle className="text-2xl mb-2">Learning Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Access curated resources, watch recorded sessions, and read insightful blogs 
                  to accelerate your learning journey.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Upcoming GDs Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Upcoming Group Discussions
            </h2>
            <p className="text-xl text-gray-600">
              Join our next sessions and be part of engaging conversations
            </p>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : upcomingGDs && upcomingGDs.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {upcomingGDs.map((gd) => (
                <GDCard key={gd.id} gd={gd} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-2xl font-semibold mb-2">No Upcoming Sessions</h3>
              <p className="text-gray-600 mb-6">
                New group discussions are being planned. Check back soon!
              </p>
            </div>
          )}

          <div className="text-center">
            <Link to="/join-gd">
              <Button size="lg" className="btn-primary">
                View All Sessions
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of learners who are already growing their skills and building their future with us.
          </p>
          {user ? (
            <Link to="/dashboard">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                Go to Your Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                Join The Tomorrows Team
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

// Component for individual GD cards on homepage
const GDCard = ({ gd }: { gd: any }) => {
  const { registrationData } = useGDRegistrationCount(gd.id);
  const { user } = useAuth();

  return (
    <Card className="feature-card">
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">{gd.topic}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{gd.date}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{gd.time}</span>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <Badge variant="secondary" className="mb-2">
            {registrationData 
              ? `${registrationData.spotsLeft} spots left`
              : 'Loading...'
            }
          </Badge>
        </div>

        {user ? (
          <Link to="/join-gd">
            <Button className="w-full btn-primary">
              {registrationData?.isFull ? 'View Details' : 'Register Now'}
            </Button>
          </Link>
        ) : (
          <Link to="/login">
            <Button className="w-full btn-primary">
              Sign In to Register
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
};

export default Index;
