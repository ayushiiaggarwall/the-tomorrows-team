
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  user_id: string | null;
  title: string;
  message: string;
  type: 'info' | 'reward' | 'gd_update' | 'reminder' | 'announcement';
  is_read: boolean;
  is_global: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  metadata: any;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`user_id.eq.${user.id},is_global.eq.true`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!user?.id
  });

  // Set up real-time subscription for notifications
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('notifications-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          console.log('Notification change:', payload);
          // Invalidate and refetch notifications when changes occur
          queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase.rpc('mark_notification_read', {
        p_notification_id: notificationId
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      
      const { error } = await supabase.rpc('mark_all_notifications_read', {
        p_user_id: user.id
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    }
  });

  const createNotificationMutation = useMutation({
    mutationFn: async (notification: {
      user_id?: string;
      title: string;
      message: string;
      type?: string;
      is_global?: boolean;
      expires_at?: string;
      metadata?: any;
    }) => {
      const { error } = await supabase.rpc('create_notification', {
        p_user_id: notification.user_id || null,
        p_title: notification.title,
        p_message: notification.message,
        p_type: notification.type || 'info',
        p_is_global: notification.is_global || false,
        p_expires_at: notification.expires_at || null,
        p_metadata: notification.metadata || null
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    createNotification: createNotificationMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending
  };
};
