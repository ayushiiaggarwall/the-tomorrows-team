
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCommunityAnnouncements } from '@/hooks/useCommunityAnnouncements';
import { format } from 'date-fns';

const CommunityAnnouncements = () => {
  const { announcements } = useCommunityAnnouncements();

  if (!announcements || announcements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📢 Community Announcements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-4">
            No announcements available at the moment.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📢 Community Announcements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {announcements.map((announcement) => (
          <div key={announcement.id} className="p-3 bg-primary/5 border border-primary/10 rounded-lg">
            <div className="text-sm font-medium">{announcement.title}</div>
            {announcement.content && (
              <div className="text-xs text-muted-foreground mt-1">{announcement.content}</div>
            )}
            <div className="text-xs text-muted-foreground mt-2">
              {format(new Date(announcement.created_at), 'MMM dd, yyyy')}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default CommunityAnnouncements;
