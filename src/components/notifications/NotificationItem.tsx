
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Gift, Calendar, Info, Megaphone, CheckCircle } from 'lucide-react';
import { Notification } from '@/hooks/useNotifications';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

const NotificationItem = ({ notification, onMarkAsRead }: NotificationItemProps) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'reward':
        return <Gift className="w-4 h-4 text-yellow-500" />;
      case 'gd_update':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'announcement':
        return <Megaphone className="w-4 h-4 text-purple-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'reward':
        return 'Reward';
      case 'gd_update':
        return 'GD Update';
      case 'announcement':
        return 'Announcement';
      case 'reminder':
        return 'Reminder';
      default:
        return 'Info';
    }
  };

  return (
    <Card className={`transition-colors ${notification.is_read ? 'bg-background' : 'bg-muted/50'}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            {getIcon(notification.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm break-words overflow-wrap-anywhere">
                    {notification.title}
                  </h3>
                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                    {getTypeLabel(notification.type)}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-2 break-words overflow-wrap-anywhere">
                  {notification.message}
                </p>
                
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </p>
              </div>
              
              {!notification.is_read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMarkAsRead(notification.id)}
                  className="flex-shrink-0"
                >
                  <CheckCircle className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationItem;
