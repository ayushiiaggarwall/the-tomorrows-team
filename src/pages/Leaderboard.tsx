import { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Medal, Award, Star, Users, Calendar, UserPlus, Target } from 'lucide-react';
import { useLeaderboardData } from '@/hooks/useLeaderboardData';

const Leaderboard = () => {
  useEffect(() => {
    document.title = 'Leaderboard - The Tomorrows Team';
  }, []);

  const { data: topPerformers = [], isLoading, error } = useLeaderboardData();

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
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Earn Recognition. Climb the Leaderboard.
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Every GD earns you points. Show up, speak up, and get rewarded. Top participants are recognized monthly!
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* Left Column - Top Performers */}
            <div className="lg:col-span-2">
              <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                    🏆 Top Performers – {currentMonth}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-16">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading leaderboard...</p>
                    </div>
                  ) : error ? (
                    <div className="text-center py-16">
                      <Trophy className="w-16 h-16 text-red-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Data</h3>
                      <p className="text-gray-600">
                        Please try refreshing the page or check back later.
                      </p>
                    </div>
                  ) : topPerformers.length > 0 ? (
                    <div className="space-y-3">
                      {topPerformers.map((performer, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{getMedalEmoji(index)}</span>
                            <div>
                              <div className="font-medium text-gray-900">{performer.name}</div>
                              <div className="text-sm text-gray-500">Rank #{index + 1}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-blue-600">{performer.points}</div>
                            <div className="text-sm text-gray-500">points</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Participants Yet</h3>
                      <p className="text-gray-600">
                        Be the first to participate and earn points!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Cards */}
            <div className="space-y-6">
              
              {/* How to Earn Points */}
              <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">How to Earn Points</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="flex items-center text-gray-700">
                      <Users className="w-4 h-4 mr-3 text-gray-500" />
                      Attend GD
                    </span>
                    <span className="text-green-600 font-semibold">+10</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="flex items-center text-gray-700">
                      <Trophy className="w-4 h-4 mr-3 text-gray-500" />
                      Best Speaker Award
                    </span>
                    <span className="text-green-600 font-semibold">+20</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="flex items-center text-gray-700">
                      <Target className="w-4 h-4 mr-3 text-gray-500" />
                      Session Moderator
                    </span>
                    <span className="text-green-600 font-semibold">+15</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="flex items-center text-gray-700">
                      <UserPlus className="w-4 h-4 mr-3 text-gray-500" />
                      Refer a Friend
                    </span>
                    <span className="text-green-600 font-semibold">+10</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="flex items-center text-gray-700">
                      <Calendar className="w-4 h-4 mr-3 text-gray-500" />
                      Perfect Attendance (Month)
                    </span>
                    <span className="text-green-600 font-semibold">+50</span>
                  </div>
                </CardContent>
              </Card>

              {/* Available Badges */}
              <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">Available Badges</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100 justify-center py-2">
                      Best Speaker
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100 justify-center py-2">
                      Most Consistent
                    </Badge>
                    <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100 justify-center py-2">
                      Early Bird
                    </Badge>
                    <Badge className="bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-100 justify-center py-2">
                      Team Player
                    </Badge>
                    <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100 justify-center py-2">
                      Moderator
                    </Badge>
                    <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-100 justify-center py-2">
                      Critical Thinker
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Champion Countdown */}
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-blue-900 flex items-center">
                    <Trophy className="w-5 h-5 mr-2 text-blue-600" />
                    Monthly Champion
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-blue-700 mb-4">
                    Top performer gets featured on our social media and wins exciting prizes!
                  </p>
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="text-3xl font-bold text-blue-600 mb-1">{daysLeft}</div>
                    <div className="text-sm text-blue-700">days left</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium flex items-center justify-center"
            >
              <Users className="w-4 h-4 mr-2" />
              Join Next GD
            </Button>
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium flex items-center justify-center"
            >
              <UserPlus className="w-4 h-4 mr-2" />
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
