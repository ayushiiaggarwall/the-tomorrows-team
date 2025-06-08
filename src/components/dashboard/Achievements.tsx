
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Achievements = () => {
  const achievements = [
    {
      icon: '🥇',
      title: 'Best Speaker – March 2025',
      description: 'Outstanding performance in group discussion'
    },
    {
      icon: '🧠',
      title: 'Top Thinker – 100 Points Earned',
      description: 'Reached the century mark in participation points'
    },
    {
      icon: '🎯',
      title: '3 GDs Back-to-Back',
      description: 'Consistent participation streak'
    },
    {
      icon: '👥',
      title: 'Referred 5 New Participants',
      description: 'Growing the community through referrals'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🏅 Your Achievements
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          You're doing great. Let's celebrate it!
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl">{achievement.icon}</div>
              <div className="flex-1">
                <div className="font-medium text-sm">{achievement.title}</div>
                <div className="text-xs text-muted-foreground">{achievement.description}</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4">
          <Button variant="outline" size="sm">
            📎 Download Certificate
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Achievements;
