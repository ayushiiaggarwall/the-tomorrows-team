
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/notifications');
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="relative h-8 w-8 rounded-full"
      onClick={handleClick}
    >
      <Bell className="h-4 w-4" />
      {unreadCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </Button>
  );
};

export default NotificationBell;
