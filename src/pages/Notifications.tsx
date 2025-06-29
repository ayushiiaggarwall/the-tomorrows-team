
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import NotificationItem from '@/components/notifications/NotificationItem';
import { useNotifications } from '@/hooks/useNotifications';
import { CheckCheck, Bell } from 'lucide-react';

const Notifications = () => {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications();

  useEffect(() => {
    document.title = 'Notifications - The Tomorrows Team';
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-4 h-4 bg-muted rounded"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-8 h-8 text-primary" />
                <div>
                  <h1 className="text-4xl font-bold text-foreground">
                    Notifications
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Stay updated with your latest activities
                  </p>
                </div>
              </div>
              
              {unreadCount > 0 && (
                <Button onClick={() => markAllAsRead()} className="flex items-center gap-2">
                  <CheckCheck className="w-4 h-4" />
                  Mark All as Read ({unreadCount})
                </Button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No notifications yet</h3>
                  <p className="text-muted-foreground">
                    When you have notifications, they'll appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                />
              ))
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Notifications;
