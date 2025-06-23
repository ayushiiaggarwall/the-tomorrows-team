
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Users, Share, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Leaderboard = () => {
  const { data: topParticipants, isLoading } = useQuery({
    queryKey: ['leaderboard-data'],
    queryFn: async () => {
      console.log('Fetching leaderboard data...');
      
      // Get all users with their total points
      const { data: rewardData, error: rewardError } = await supabase
        .from('reward_points')
        .select(`
          user_id,
          points,
          type,
          profiles!inner(
            id,
            full_name,
            email
          )
        `);

      if (rewardError) {
        console.error('Error fetching reward data:', rewardError);
        return [];
      }

      if (!rewardData || rewardData.length === 0) {
        console.log('No reward data found');
        return [];
      }

      // Group by user and calculate totals
      const userStats = rewardData.reduce((acc: any, curr: any) => {
        const userId = curr.user_id;
        const profile = curr.profiles;
        
        if (!acc[userId]) {
          acc[userId] = {
            user_id: userId,
            name: profile.full_name || profile.email?.split('@')[0] || 'Unknown User',
            email: profile.email,
            totalPoints: 0,
            gdsAttended: 0,
            bestSpeakerAwards: 0,
            badges: []
          };
        }
        
        acc[userId].totalPoints += curr.points;
        
        if (curr.type === 'attendance') {
          acc[userId].gdsAttended += 1;
        }
        
        if (curr.type === 'best_speaker') {
          acc[userId].bestSpeakerAwards += 1;
        }
        
        return acc;
      }, {});

      // Convert to array and add badges
      const participants = Object.values(userStats).map((user: any) => {
        const badges = [];
        
        if (user.bestSpeakerAwards > 0) {
          badges.push('Best Speaker');
        }
        
        if (user.gdsAttended >= 10) {
          badges.push('Most Consistent');
        }
        
        if (user.gdsAttended >= 5) {
          badges.push('Early Bird');
        }
        
        if (user.totalPoints >= 100) {
          badges.push('Team Player');
        }
        
        return {
          ...user,
          badges,
          institution: 'University' // Default since we don't have institution data
        };
      });

      // Sort by total points and add rank
      const rankedParticipants = participants
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .slice(0, 10)
        .map((participant, index) => ({
          ...participant,
          rank: index + 1
        }));

      console.log('Leaderboard data processed:', rankedParticipants);
      return rankedParticipants;
    }
  });

  const pointsSystem = [
    { activity: 'Attend GD', points: 10, icon: <Users className="w-4 h-4" /> },
    { activity: 'Best Speaker Award', points: 20, icon: <Trophy className="w-4 h-4" /> },
    { activity: 'Session Moderator', points: 15, icon: <Medal className="w-4 h-4" /> },
    { activity: 'Refer a Friend', points: 10, icon: <Share className="w-4 h-4" /> },
    { activity: 'Perfect Attendance (Month)', points: 50, icon: <Award className="w-4 h-4" /> }
  ];

  const badgeColors = {
    'Best Speaker': 'bg-yellow-100 text-yellow-800',
    'Most Consistent': 'bg-blue-100 text-blue-800',
    'Early Bird': 'bg-green-100 text-green-800',
    'Team Player': 'bg-purple-100 text-purple-800',
    'Moderator': 'bg-red-100 text-red-800',
    'Critical Thinker': 'bg-indigo-100 text-indigo-800'
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Earn Recognition. Climb the Leaderboard.
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Every GD earns you points. Show up, speak up, and get rewarded. Top participants are recognized monthly!
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Leaderboard */}
          <div className="lg:col-span-2">
            <Card className="feature-card">
              <CardHeader>
                <CardTitle className="text-2xl font-bold flex items-center">
                  <Trophy className="w-6 h-6 mr-2 text-primary" />
                  Top Performers - January 2025
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4 p-4 border border-border rounded-lg animate-pulse">
                        <div className="w-12 h-12 bg-muted rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                        <div className="w-16 h-8 bg-muted rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {!topParticipants || topParticipants.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-4">🏆</div>
                        <h3 className="text-lg font-semibold mb-2">No Participants Yet</h3>
                        <p className="text-muted-foreground">
                          Be the first to participate and earn points!
                        </p>
                      </div>
                    ) : (
                      topParticipants.map((participant) => (
                        <div key={participant.user_id} className="flex items-center space-x-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-center w-12 h-12">
                            {getRankIcon(participant.rank)}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-1">
                              <h3 className="font-semibold">{participant.name}</h3>
                              <span className="text-sm text-muted-foreground">{participant.institution}</span>
                            </div>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {participant.badges.map((badge) => (
                                <Badge key={badge} variant="secondary" className={`text-xs ${badgeColors[badge] || 'bg-gray-100 text-gray-800'}`}>
                                  {badge}
                                </Badge>
                              ))}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {participant.gdsAttended} GDs attended
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">{participant.totalPoints}</div>
                            <div className="text-sm text-muted-foreground">points</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Points System */}
            <Card className="feature-card">
              <CardHeader>
                <CardTitle className="text-xl font-bold">How to Earn Points</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pointsSystem.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-primary">{item.icon}</div>
                      <span className="text-sm">{item.activity}</span>
                    </div>
                    <div className="font-semibold text-success">+{item.points}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Available Badges */}
            <Card className="feature-card">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Available Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(badgeColors).map((badge) => (
                    <Badge key={badge} variant="secondary" className={`text-xs justify-center ${badgeColors[badge]}`}>
                      {badge}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link to="/join-gd">
                <Button className="w-full btn-primary">
                  <Users className="w-4 h-4 mr-2" />
                  Join Next GD
                </Button>
              </Link>
              
              <Button className="w-full btn-secondary">
                <Share className="w-4 h-4 mr-2" />
                Refer a Friend
              </Button>
              
              <Link to="/dashboard">
                <Button className="w-full btn-outline">
                  <User className="w-4 h-4 mr-2" />
                  View My Dashboard
                </Button>
              </Link>
            </div>

            {/* Monthly Recognition */}
            <Card className="feature-card bg-gradient-to-r from-primary/10 to-accent/10">
              <CardContent className="p-6 text-center">
                <Trophy className="w-12 h-12 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Monthly Champion</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Top performer gets featured on our social media and wins exciting prizes!
                </p>
                <div className="text-lg font-bold text-primary">
                  7 days left
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Leaderboard;
