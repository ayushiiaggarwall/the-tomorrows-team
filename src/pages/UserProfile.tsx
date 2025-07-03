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
  
  // Very first log to see if component loads at all
  console.log('UserProfile component mounted with userId:', userId);

  useEffect(() => {
    document.title = 'User Profile - The Tomorrows Team';
  }, []);

  // Get user profile data
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      console.log('Fetching profile for userId:', userId);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      console.log('Profile query result:', { profile, error });
      console.log('Profile object details:', profile);
      return profile;
    },
    enabled: !!userId,
    staleTime: 0 // Force fresh data
  });

  // Get user stats
  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ['user-stats', userId],
    queryFn: async () => {
      if (!userId) return null;

      // Get reward points
      const { data: pointsData } = await supabase
        .from('reward_points')
        .select('points, type, created_at')
        .eq('user_id', userId);

      // Get GD registrations  
      const { data: gdsData } = await supabase
        .from('gd_registrations')
        .select('id, attended')
        .eq('user_id', userId)
        .eq('attended', true);

      const totalPoints = pointsData?.reduce((sum, point) => sum + point.points, 0) || 0;
      const attendanceCount = pointsData?.filter(p => p.type.toLowerCase() === 'attendance').length || 0;
      const bestSpeakerCount = pointsData?.filter(p => p.type === 'Best Speaker').length || 0;
      const moderatorCount = pointsData?.filter(p => p.type === 'Moderator').length || 0;
      const perfectAttendanceCount = pointsData?.filter(p => p.type === 'Perfect Attendance').length || 0;
      const referralCount = pointsData?.filter(p => p.type === 'referral').length || 0;
      const totalGDs = gdsData?.length || 0;

      // Calculate milestone achievements
      const milestoneAchievements = [
        {
          id: 'first_gd',
          title: 'First Steps',
          description: 'Attended your first group discussion',
          icon: '👶',
          unlocked: totalGDs >= 1
        },
        {
          id: 'gd_veteran',
          title: 'Discussion Veteran',
          description: 'Attended 5 group discussions',
          icon: '🎓',
          unlocked: totalGDs >= 5
        },
        {
          id: 'gd_expert',
          title: 'Discussion Expert',
          description: 'Attended 10 group discussions',
          icon: '🏆',
          unlocked: totalGDs >= 10
        },
        {
          id: 'first_best_speaker',
          title: 'Rising Star',
          description: 'Awarded Best Speaker for the first time',
          icon: '⭐',
          unlocked: bestSpeakerCount >= 1
        },
        {
          id: 'multiple_best_speaker',
          title: 'Eloquent Speaker',
          description: 'Awarded Best Speaker 3 times',
          icon: '🎤',
          unlocked: bestSpeakerCount >= 3
        },
        {
          id: 'points_100',
          title: 'Century Club',
          description: 'Earned 100 total points',
          icon: '💯',
          unlocked: totalPoints >= 100
        },
        {
          id: 'points_250',
          title: 'High Achiever',
          description: 'Earned 250 total points',
          icon: '🚀',
          unlocked: totalPoints >= 250
        },
        {
          id: 'first_referral',
          title: 'Community Builder',
          description: 'Referred your first friend',
          icon: '👥',
          unlocked: referralCount >= 1
        },
        {
          id: 'multiple_referrals',
          title: 'Ambassador',
          description: 'Referred 5 friends',
          icon: '🌟',
          unlocked: referralCount >= 5
        }
      ].filter(achievement => achievement.unlocked);

      return {
        totalPoints,
        attendanceCount,
        achievements: {
          bestSpeaker: bestSpeakerCount,
          moderator: moderatorCount,
          perfectAttendance: perfectAttendanceCount
        },
        milestoneAchievements
      };
    },
    enabled: !!userId
  });

  // Get leaderboard data to find rank and tags
  const { data: leaderboardData } = useLeaderboardData();
  
  // Basic debug - this should always show
  console.log('UserProfile component loaded, userId from URL:', userId);
  console.log('Profile data loaded:', !!profile, profile?.id);
  console.log('Raw profile object:', profile);
  console.log('Leaderboard data loaded:', !!leaderboardData, leaderboardData?.length);
  
  const userLeaderboardEntry = leaderboardData?.find(performer => 
    performer.userId === profile?.id
  );
  const userIndex = leaderboardData?.findIndex(performer => 
    performer.userId === profile?.id
  ) ?? -1;
  const userRank = userIndex >= 0 ? userIndex + 1 : 0;
  const userLeaderboardTags = userLeaderboardEntry?.tags || [];
  
  console.log('Final rank calculation - Index:', userIndex, 'Rank:', userRank);
  console.log('Leaderboard tags for user:', userLeaderboardTags);

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
  const hasLeaderboardAchievements = userStats?.achievements && (
    userStats.achievements.bestSpeaker > 0 || 
    userStats.achievements.moderator > 0 || 
    userStats.achievements.perfectAttendance > 0
  );
  const hasMilestoneAchievements = userStats?.milestoneAchievements && userStats.milestoneAchievements.length > 0;

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

                {/* Leaderboard Tags */}
                {userLeaderboardTags && userLeaderboardTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {userLeaderboardTags.map((tag, index) => (
                      <Badge 
                        key={index} 
                        className={`text-sm ${
                          tag === 'Star Speaker' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                          tag === 'Quality Content' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' :
                          tag === 'Most Consistent' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          tag === 'Top Moderator' ? 'bg-red-100 text-red-800 border-red-200' :
                          tag === 'Top Referrer' ? 'bg-green-100 text-green-800 border-green-200' :
                          tag === 'Perf Attendance' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                          'bg-gray-100 text-gray-800 border-gray-200'
                        }`}
                      >
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

          {/* Leaderboard Tags Section */}
          {userLeaderboardTags && userLeaderboardTags.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  Leaderboard Recognition
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Current month's leaderboard achievements
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userLeaderboardTags.map((tag, index) => {
                    const tagConfig = {
                      'Star Speaker': { icon: '⭐', color: 'yellow', description: 'Top performer in speaking' },
                      'Quality Content': { icon: '🧠', color: 'indigo', description: 'Excellent content contribution' },
                      'Most Consistent': { icon: '🎯', color: 'blue', description: 'Highest attendance record' },
                      'Top Moderator': { icon: '👨‍💼', color: 'red', description: 'Leading session facilitation' },
                      'Top Referrer': { icon: '👥', color: 'green', description: 'Most successful referrals' },
                      'Perf Attendance': { icon: '💯', color: 'purple', description: 'Perfect attendance record' }
                    };
                    
                    const config = tagConfig[tag as keyof typeof tagConfig] || { icon: '🏆', color: 'gray', description: 'Recognition earned' };
                    
                    return (
                      <div key={index} className={`bg-${config.color}-50 border border-${config.color}-200 rounded-lg p-4`}>
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{config.icon}</div>
                          <div>
                            <div className={`font-semibold text-${config.color}-800`}>{tag}</div>
                            <div className={`text-sm text-${config.color}-700`}>{config.description}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Performance Recognition Section */}
          {hasLeaderboardAchievements && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  Performance Recognition
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Achievement history based on participation
                </p>
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

          {/* Milestone Achievements Section */}
          {hasMilestoneAchievements && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-purple-600" />
                  Unlocked Achievements
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Milestone achievements earned through participation
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userStats?.milestoneAchievements.map((achievement) => (
                    <div key={achievement.id} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{achievement.icon}</div>
                        <div>
                          <div className="font-semibold text-purple-800">{achievement.title}</div>
                          <div className="text-sm text-purple-700">{achievement.description}</div>
                        </div>
                      </div>
                    </div>
                  ))}
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