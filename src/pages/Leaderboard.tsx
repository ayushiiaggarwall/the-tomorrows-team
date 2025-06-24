
import { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Medal, Award, Star, Users, Calendar, UserPlus, Target } from 'lucide-react';

const Leaderboard = () => {
  useEffect(() => {
    document.title = 'Leaderboard - The Tomorrows Team';
  }, []);

  // Mock data for top performers (this would come from your database)
  const topPerformers = [
    { name: "Arjun Sharma", points: 185 },
    { name: "Priya Patel", points: 165 },
    { name: "Rahul Kumar", points: 145 },
    { name: "Sneha Gupta", points: 120 },
    { name: "Vikram Singh", points: 95 },
  ];

  // Calculate days left in current month
  const today = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysLeft = Math.ceil((lastDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const currentMonth = today.toLocaleString('default', { month: 'long', year: 'numeric' });

  const getMedalEmoji = (index: number) => {
    switch (index) {
      case 0: return "🥇";
      case 1: return "🥈";
      case 2: return "🥉";
      default: return "🏅";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Earn Recognition. Climb the Leaderboard.
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Every GD earns you points. Show up, speak up, and get rewarded. Top participants are recognized monthly!
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Left Column - Top Performers */}
            <div className="lg:col-span-2">
              <Card className="feature-card">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold flex items-center">
                    🏆 Top Performers – {currentMonth}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {topPerformers.length > 0 ? (
                    <div className="space-y-4">
                      {topPerformers.slice(0, 5).map((performer, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{getMedalEmoji(index)}</span>
                            <div>
                              <div className="font-semibold text-foreground">{performer.name}</div>
                              <div className="text-sm text-muted-foreground">Rank #{index + 1}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">{performer.points}</div>
                            <div className="text-sm text-muted-foreground">points</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg text-muted-foreground">
                        No Participants Yet. Be the first to participate and earn points!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Cards */}
            <div className="space-y-6">
              
              {/* How to Earn Points */}
              <Card className="feature-card">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">How to Earn Points</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center"><Users className="w-4 h-4 mr-2" />Attend GD</span>
                    <span className="text-green-600 font-semibold">+10</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center"><Trophy className="w-4 h-4 mr-2" />Best Speaker Award</span>
                    <span className="text-green-600 font-semibold">+20</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center"><Target className="w-4 h-4 mr-2" />Session Moderator</span>
                    <span className="text-green-600 font-semibold">+15</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center"><UserPlus className="w-4 h-4 mr-2" />Refer a Friend</span>
                    <span className="text-green-600 font-semibold">+10</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center"><Calendar className="w-4 h-4 mr-2" />Perfect Attendance (Month)</span>
                    <span className="text-green-600 font-semibold">+50</span>
                  </div>
                </CardContent>
              </Card>

              {/* Available Badges */}
              <Card className="feature-card">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Available Badges</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Best Speaker</Badge>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">Most Consistent</Badge>
                    <Badge className="bg-green-100 text-green-800 border-green-200">Early Bird</Badge>
                    <Badge className="bg-purple-100 text-purple-800 border-purple-200">Team Player</Badge>
                    <Badge className="bg-red-100 text-red-800 border-red-200">Moderator</Badge>
                    <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">Critical Thinker</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Champion Countdown */}
              <Card className="feature-card">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Monthly Champion</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Top performer gets featured on our social media and wins exciting prizes!
                  </p>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">{daysLeft}</div>
                    <div className="text-sm text-muted-foreground">days left this month</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            >
              Join Next GD
            </Button>
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            >
              Refer a Friend
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Leaderboard;
