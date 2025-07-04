
import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Star, Users, Target, Medal, Crown, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLeaderboardData } from '@/hooks/useLeaderboardData';
import { useAdminSettings } from '@/hooks/useAdminSettings';

const Leaderboard = () => {
  const { data: leaderboardData, isLoading } = useLeaderboardData();
  const { settings } = useAdminSettings();
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    document.title = 'Leaderboard - The Tomorrows Team';
  }, []);

  const displayData = showAll ? leaderboardData : leaderboardData?.slice(0, 10);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-amber-600" />;
      default: return <Trophy className="w-5 h-5 text-gray-400" />;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2: return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3: return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="h-10 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
            </div>
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-5 bg-gray-200 rounded w-48 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                      </div>
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
              <Trophy className="w-10 h-10 text-yellow-500" />
              Monthly Leaderboard
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              See how our community members are performing this month. Points reset every month for fresh competition!
            </p>
          </div>

          {/* Point System Info */}
          {settings && (
            <Card className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700">
                  <Star className="w-5 h-5" />
                  Point System
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-blue-600">+{settings.points_per_attendance}</div>
                    <div className="text-gray-600">Attendance</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-yellow-600">+{settings.points_per_best_speaker}</div>
                    <div className="text-gray-600">Star Speaker</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-green-600">+{settings.points_per_referral}</div>
                    <div className="text-gray-600">Referral</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-purple-600">+{settings.points_per_moderation}</div>
                    <div className="text-gray-600">Moderation</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-red-600">+{settings.points_per_perfect_attendance}</div>
                    <div className="text-gray-600">Perfect Month</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top 3 Podium */}
          {leaderboardData && leaderboardData.length >= 3 && (
            <div className="mb-8">
              <div className="flex justify-center items-end space-x-4">
                {/* Second Place */}
                <Link to={`/user-profile/${leaderboardData[1].userId}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-b from-gray-50 to-gray-100 w-32">
                    <CardContent className="p-4 text-center">
                      <div className="mb-2">
                        <Medal className="w-8 h-8 text-gray-400 mx-auto" />
                      </div>
                      <Avatar className="w-16 h-16 mx-auto mb-2">
                        <AvatarImage src={""} alt={leaderboardData[1].name} />
                        <AvatarFallback>
                          {leaderboardData[1].name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="font-semibold text-sm text-gray-900 truncate">
                        {leaderboardData[1].name}
                      </div>
                      <div className="text-2xl font-bold text-gray-600">
                        {leaderboardData[1].points}
                      </div>
                      <Badge className="text-xs bg-gray-200 text-gray-700">#2</Badge>
                    </CardContent>
                  </Card>
                </Link>

                {/* First Place */}
                <Link to={`/user-profile/${leaderboardData[0].userId}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-b from-yellow-50 to-yellow-100 w-36">
                    <CardContent className="p-4 text-center">
                      <div className="mb-2">
                        <Crown className="w-10 h-10 text-yellow-500 mx-auto" />
                      </div>
                      <Avatar className="w-20 h-20 mx-auto mb-2 ring-4 ring-yellow-400">
                        <AvatarImage src={""} alt={leaderboardData[0].name} />
                        <AvatarFallback>
                          {leaderboardData[0].name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="font-semibold text-gray-900 truncate">
                        {leaderboardData[0].name}
                      </div>
                      <div className="text-3xl font-bold text-yellow-600">
                        {leaderboardData[0].points}
                      </div>
                      <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">#1</Badge>
                    </CardContent>
                  </Card>
                </Link>

                {/* Third Place */}
                <Link to={`/user-profile/${leaderboardData[2].userId}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-b from-amber-50 to-amber-100 w-32">
                    <CardContent className="p-4 text-center">
                      <div className="mb-2">
                        <Award className="w-8 h-8 text-amber-600 mx-auto" />
                      </div>
                      <Avatar className="w-16 h-16 mx-auto mb-2">
                        <AvatarImage src={""} alt={leaderboardData[2].name} />
                        <AvatarFallback>
                          {leaderboardData[2].name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="font-semibold text-sm text-gray-900 truncate">
                        {leaderboardData[2].name}
                      </div>
                      <div className="text-2xl font-bold text-amber-600">
                        {leaderboardData[2].points}
                      </div>
                      <Badge className="text-xs bg-amber-200 text-amber-700">#3</Badge>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>
          )}

          {/* Full Leaderboard */}
          {!leaderboardData || leaderboardData.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Data Yet</h3>
                <p className="text-gray-500">
                  The leaderboard will populate as members participate in group discussions.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-3">
                {displayData?.map((performer, index) => (
                  <Link key={performer.userId} to={`/user-profile/${performer.userId}`}>
                    <Card className={`hover:shadow-md transition-all duration-200 cursor-pointer ${
                      index < 3 ? 'ring-2 ring-yellow-200' : ''
                    }`}>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          {/* Rank */}
                          <div className="flex items-center space-x-3">
                            <Badge className={`px-3 py-1 font-bold ${getRankBadgeColor(index + 1)}`}>
                              #{index + 1}
                            </Badge>
                            {getRankIcon(index + 1)}
                          </div>

                          {/* Avatar */}
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={""} alt={performer.name} />
                            <AvatarFallback>
                              {performer.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          {/* Name and Tags */}
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 mb-1">
                              {performer.name}
                            </div>
                            {performer.tags && performer.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {performer.tags.map((tag, tagIndex) => (
                                  <Badge 
                                    key={tagIndex} 
                                    variant="secondary" 
                                    className={`text-xs ${
                                      tag === 'Star Speaker' ? 'bg-yellow-100 text-yellow-800' :
                                      tag === 'Quality Content' ? 'bg-indigo-100 text-indigo-800' :
                                      tag === 'Most Consistent' ? 'bg-blue-100 text-blue-800' :
                                      tag === 'Top Moderator' ? 'bg-red-100 text-red-800' :
                                      tag === 'Top Referrer' ? 'bg-green-100 text-green-800' :
                                      tag === 'Perf Attendance' ? 'bg-purple-100 text-purple-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Points */}
                          <div className="text-right">
                            <div className="text-2xl font-bold text-purple-600">
                              {performer.points}
                            </div>
                            <div className="text-sm text-gray-500">points</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Show More/Less Button */}
              {leaderboardData && leaderboardData.length > 10 && (
                <div className="text-center mt-8">
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    {showAll ? 'Show Less' : `Show All ${leaderboardData.length} Members`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Leaderboard;
