
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Users, Share, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const Leaderboard = () => {
  const topParticipants = [
    {
      rank: 1,
      name: 'Arjun Mehta',
      points: 485,
      badges: ['Best Speaker', 'Most Consistent'],
      gdsAttended: 24,
      institution: 'IIM Bangalore'
    },
    {
      rank: 2,
      name: 'Priya Sharma',
      points: 470,
      badges: ['Early Bird', 'Team Player'],
      gdsAttended: 22,
      institution: 'BITS Pilani'
    },
    {
      rank: 3,
      name: 'Rahul Gupta',
      points: 445,
      badges: ['Moderator', 'Critical Thinker'],
      gdsAttended: 21,
      institution: 'NIT Trichy'
    },
    {
      rank: 4,
      name: 'Sneha Patel',
      points: 420,
      badges: ['Best Speaker'],
      gdsAttended: 20,
      institution: 'Delhi University'
    },
    {
      rank: 5,
      name: 'Vikram Singh',
      points: 395,
      badges: ['Most Consistent', 'Early Bird'],
      gdsAttended: 19,
      institution: 'IIT Delhi'
    },
    {
      rank: 6,
      name: 'Ananya Reddy',
      points: 380,
      badges: ['Team Player'],
      gdsAttended: 18,
      institution: 'IIIT Hyderabad'
    },
    {
      rank: 7,
      name: 'Karthik Nair',
      points: 365,
      badges: ['Critical Thinker'],
      gdsAttended: 17,
      institution: 'VIT Vellore'
    },
    {
      rank: 8,
      name: 'Divya Joshi',
      points: 350,
      badges: ['Moderator'],
      gdsAttended: 16,
      institution: 'Pune University'
    },
    {
      rank: 9,
      name: 'Rohit Kumar',
      points: 335,
      badges: ['Early Bird'],
      gdsAttended: 15,
      institution: 'Jadavpur University'
    },
    {
      rank: 10,
      name: 'Meera Agarwal',
      points: 320,
      badges: ['Team Player'],
      gdsAttended: 14,
      institution: 'Christ University'
    }
  ];

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
                <div className="space-y-4">
                  {topParticipants.map((participant) => (
                    <div key={participant.rank} className="flex items-center space-x-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
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
                        <div className="text-2xl font-bold text-primary">{participant.points}</div>
                        <div className="text-sm text-muted-foreground">points</div>
                      </div>
                    </div>
                  ))}
                </div>
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
              
              <Button className="w-full btn-outline">
                <User className="w-4 h-4 mr-2" />
                View My Dashboard
              </Button>
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
