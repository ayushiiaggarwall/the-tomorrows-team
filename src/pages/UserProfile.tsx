import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Trophy, Users, Star, Target } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLeaderboardData } from '@/hooks/useLeaderboardData';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'User Profile - The Tomorrows Team';
  }, []);

  // Get user profile data
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      return profile;
    },
    enabled: !!userId
  });

  // Get user stats
  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ['user-stats', userId],
    queryFn: async () => {
      if (!userId) return null;

      // Get total points
      const { data: pointsData } = await supabase
        .from('reward_points')
        .select('points, type, created_at')
        .eq('user_id', userId);

      const totalPoints = pointsData?.reduce((sum, point) => sum + point.points, 0) || 0;

      // Get GD attendance count
      const attendanceCount = pointsData?.filter(p => p.type.toLowerCase() === 'attendance').length || 0;

      // Get achievements
      const bestSpeakerCount = pointsData?.filter(p => p.type === 'Best Speaker').length || 0;
      const moderatorCount = pointsData?.filter(p => p.type === 'Moderator').length || 0;
      const perfectAttendanceCount = pointsData?.filter(p => p.type === 'Perfect Attendance').length || 0;

      return {
        totalPoints,
        attendanceCount,
        achievements: {
          bestSpeaker: bestSpeakerCount,
          moderator: moderatorCount,
          perfectAttendance: perfectAttendanceCount
        }
      };
    },
    enabled: !!userId
  });

  // Get leaderboard data to find rank
  const { data: leaderboardData } = useLeaderboardData();
  
  // Basic debug - this should always show
  console.log('UserProfile component loaded, userId from URL:', userId);
  console.log('Profile data loaded:', !!profile, profile?.id);
  console.log('Leaderboard data loaded:', !!leaderboardData, leaderboardData?.length);
  
  const userIndex = leaderboardData?.findIndex(performer => 
    performer.userId === profile?.id
  ) ?? -1;
  const userRank = userIndex >= 0 ? userIndex + 1 : 0;
  
  console.log('Final rank calculation - Index:', userIndex, 'Rank:', userRank);

  if (profileLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
              <div className="bg-white rounded-lg p-8">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
                  <div className="h-6 bg-gray-200 rounded w-48"></div>
                  <div className="flex gap-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="h-6 bg-gray-200 rounded w-20"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h1>
            <Button onClick={() => navigate('/leaderboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Leaderboard
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const displayName = profile.full_name || profile.email?.split('@')[0] || `User ${profile.id?.slice(0, 8)}`;
  const hasAchievements = userStats?.achievements && (
    userStats.achievements.bestSpeaker > 0 || 
    userStats.achievements.moderator > 0 || 
    userStats.achievements.perfectAttendance > 0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <Button 
            variant="outline" 
            onClick={() => navigate('/leaderboard')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Leaderboard
          </Button>

          {/* Profile Header */}
          <Card className="mb-6">
            <CardContent className="pt-8">
              <div className="flex flex-col items-center space-y-4">
                {/* Profile Picture */}
                <Avatar className="w-32 h-32">
                  <AvatarImage 
                    src={profile.profile_picture_url || ''} 
                    alt={displayName}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-2xl font-semibold">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Name */}
                <h1 className="text-3xl font-bold text-gray-900">{displayName}</h1>

                {/* Tags */}
                {profile.tags && profile.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {profile.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* GDs Attended */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center space-x-3">
                  <Users className="w-8 h-8 text-blue-600" />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {userStats?.attendanceCount || 0}
                    </div>
                    <div className="text-sm text-gray-600">GDs Attended</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Points */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center space-x-3">
                  <Star className="w-8 h-8 text-yellow-600" />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {userStats?.totalPoints || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Points</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard Rank */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center space-x-3">
                  <Trophy className="w-8 h-8 text-purple-600" />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {userRank > 0 ? `#${userRank}` : 'Unranked'}
                    </div>
                    <div className="text-sm text-gray-600">Leaderboard Rank</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Achievements Section */}
          {hasAchievements && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userStats?.achievements.bestSpeaker > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <Trophy className="w-6 h-6 text-yellow-600" />
                        <div>
                          <div className="font-semibold text-yellow-800">Best Speaker</div>
                          <div className="text-sm text-yellow-700">
                            {userStats.achievements.bestSpeaker} time{userStats.achievements.bestSpeaker > 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {userStats?.achievements.moderator > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <Target className="w-6 h-6 text-blue-600" />
                        <div>
                          <div className="font-semibold text-blue-800">Session Moderator</div>
                          <div className="text-sm text-blue-700">
                            {userStats.achievements.moderator} time{userStats.achievements.moderator > 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {userStats?.achievements.perfectAttendance > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <Star className="w-6 h-6 text-green-600" />
                        <div>
                          <div className="font-semibold text-green-800">Perfect Attendance</div>
                          <div className="text-sm text-green-700">
                            {userStats.achievements.perfectAttendance} time{userStats.achievements.perfectAttendance > 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default UserProfile;