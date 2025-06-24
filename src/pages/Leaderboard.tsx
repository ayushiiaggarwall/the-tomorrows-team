import { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Medal, Award, Star } from 'lucide-react';

const Leaderboard = () => {
  useEffect(() => {
    document.title = 'Leaderboard - The Tomorrows Team';
  }, []);

  // Mock data for leaderboard
  const leaderboardData = [
    { rank: 1, name: "Arjun Sharma", points: 2450, gdParticipated: 28, achievements: 12, level: "Expert" },
    { rank: 2, name: "Priya Patel", points: 2380, gdParticipated: 26, achievements: 11, level: "Expert" },
    { rank: 3, name: "Rahul Kumar", points: 2250, gdParticipated: 24, achievements: 10, level: "Advanced" },
    { rank: 4, name: "Sneha Gupta", points: 2100, gdParticipated: 22, achievements: 9, level: "Advanced" },
    { rank: 5, name: "Vikram Singh", points: 1950, gdParticipated: 20, achievements: 8, level: "Advanced" },
    { rank: 6, name: "Ananya Reddy", points: 1800, gdParticipated: 18, achievements: 7, level: "Intermediate" },
    { rank: 7, name: "Karthik Nair", points: 1650, gdParticipated: 16, achievements: 6, level: "Intermediate" },
    { rank: 8, name: "Meera Joshi", points: 1500, gdParticipated: 15, achievements: 5, level: "Intermediate" },
    { rank: 9, name: "Rohit Agarwal", points: 1350, gdParticipated: 13, achievements: 4, level: "Beginner" },
    { rank: 10, name: "Kavya Menon", points: 1200, gdParticipated: 12, achievements: 3, level: "Beginner" },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <Star className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case "Expert":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Advanced":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Intermediate":
        return "bg-green-100 text-green-800 border-green-200";
      case "Beginner":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <Trophy className="w-12 h-12 text-primary mr-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Leaderboard
            </h1>
          </div>
          <p className="text-xl text-muted-foreground mb-8">
            See how you rank among our community of communicators
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Trophy className="w-4 h-4 mr-2 text-yellow-500" />
              Top Performers
            </div>
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-2 text-primary" />
              Points & Achievements
            </div>
            <div className="flex items-center">
              <Award className="w-4 h-4 mr-2 text-amber-600" />
              Recognition System
            </div>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <Card className="feature-card text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary mb-2">2,450</div>
                <div className="text-sm text-muted-foreground">Highest Score</div>
              </CardContent>
            </Card>
            <Card className="feature-card text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary mb-2">847</div>
                <div className="text-sm text-muted-foreground">Active Members</div>
              </CardContent>
            </Card>
            <Card className="feature-card text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary mb-2">156</div>
                <div className="text-sm text-muted-foreground">Total GDs</div>
              </CardContent>
            </Card>
            <Card className="feature-card text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary mb-2">1,250</div>
                <div className="text-sm text-muted-foreground">Avg. Points</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Leaderboard */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <Card className="feature-card">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center">
                <Trophy className="w-6 h-6 mr-3 text-primary" />
                Top Performers
              </CardTitle>
              <p className="text-muted-foreground">
                Rankings based on participation, performance, and community contribution
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Rank</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-center">Points</TableHead>
                      <TableHead className="text-center">GDs</TableHead>
                      <TableHead className="text-center">Achievements</TableHead>
                      <TableHead className="text-center">Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboardData.map((participant) => (
                      <TableRow key={participant.rank} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center justify-center">
                            {getRankIcon(participant.rank)}
                            <span className="ml-2 font-semibold">#{participant.rank}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{participant.name}</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="font-bold text-primary">{participant.points.toLocaleString()}</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="font-medium">{participant.gdParticipated}</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center">
                            <Award className="w-4 h-4 mr-1 text-amber-500" />
                            <span className="font-medium">{participant.achievements}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={getLevelBadgeColor(participant.level)}>
                            {participant.level}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How Points Work */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              How Points Work
            </h2>
            <p className="text-lg text-muted-foreground">
              Understanding our reward and recognition system
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="feature-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="w-5 h-5 mr-2 text-primary" />
                  Earning Points
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>GD Participation</span>
                  <span className="font-semibold text-primary">+50 points</span>
                </div>
                <div className="flex justify-between">
                  <span>Quality Contribution</span>
                  <span className="font-semibold text-primary">+25 points</span>
                </div>
                <div className="flex justify-between">
                  <span>Helping Others</span>
                  <span className="font-semibold text-primary">+15 points</span>
                </div>
                <div className="flex justify-between">
                  <span>Regular Attendance</span>
                  <span className="font-semibold text-primary">+10 points</span>
                </div>
                <div className="flex justify-between">
                  <span>Resource Sharing</span>
                  <span className="font-semibold text-primary">+20 points</span>
                </div>
              </CardContent>
            </Card>

            <Card className="feature-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 mr-2 text-amber-500" />
                  Level System
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Beginner</span>
                  <Badge className="bg-orange-100 text-orange-800 border-orange-200">0-500 pts</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Intermediate</span>
                  <Badge className="bg-green-100 text-green-800 border-green-200">501-1500 pts</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Advanced</span>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">1501-2500 pts</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Expert</span>
                  <Badge className="bg-purple-100 text-purple-800 border-purple-200">2500+ pts</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Leaderboard;
