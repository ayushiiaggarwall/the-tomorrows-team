
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const UpcomingGDs = () => {
  const upcomingGDs = [
    {
      date: 'June 15',
      topic: 'Is Remote Work the Future?',
      time: '6:00 PM',
      status: 'registered',
    },
    {
      date: 'June 22',
      topic: 'AI & Human Creativity',
      time: '7:00 PM',
      status: 'not-joined',
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🗓️ Upcoming Group Discussions
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          You're registered for the following GDs:
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingGDs.map((gd, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="font-medium">{gd.topic}</div>
                <div className="text-sm text-muted-foreground">
                  {gd.date} at {gd.time}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge 
                  variant={gd.status === 'registered' ? 'default' : 'destructive'}
                >
                  {gd.status === 'registered' ? 'Registered ✅' : 'Not Joined ❌'}
                </Badge>
                {gd.status === 'registered' && (
                  <Button size="sm" className="btn-primary">
                    📩 Join Meeting
                  </Button>
                )}
              </div>
            </div>
          ))}
          
          <div className="mt-6 p-4 bg-success/10 border border-success/20 rounded-lg">
            <div className="text-sm font-medium text-success mb-2">
              🟢 You haven't registered for the next GD yet!
            </div>
            <Button className="btn-primary">
              🔘 Register Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingGDs;
