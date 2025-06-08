
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CommunityAnnouncements = () => {
  const announcements = [
    "Next GD theme poll is live — vote now!",
    "Top 10 Leaderboard updated – check where you stand!",
    "New podcast episode just dropped!"
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📢 Community Announcements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {announcements.map((announcement, index) => (
          <div key={index} className="p-3 bg-primary/5 border border-primary/10 rounded-lg">
            <div className="text-sm font-medium">{announcement}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default CommunityAnnouncements;
