
import { supabase } from '@/integrations/supabase/client';

export const useAutoNotifications = () => {
  const triggerGDRegistrationNotification = async (
    userId: string,
    gdId: string,
    topicName: string,
    scheduledDate: string
  ) => {
    try {
      const { error } = await supabase.functions.invoke('auto-notifications', {
        body: {
          type: 'gd_registration',
          user_id: userId,
          gd_id: gdId,
          topic_name: topicName,
          scheduled_date: scheduledDate
        }
      });

      if (error) {
        console.error('Error triggering GD registration notification:', error);
      }
    } catch (error) {
      console.error('Error in triggerGDRegistrationNotification:', error);
    }
  };

  const triggerRewardPointsNotification = async (
    userId: string,
    points: number,
    reason: string
  ) => {
    try {
      const { error } = await supabase.functions.invoke('auto-notifications', {
        body: {
          type: 'reward_points',
          user_id: userId,
          points,
          reason
        }
      });

      if (error) {
        console.error('Error triggering reward points notification:', error);
      }
    } catch (error) {
      console.error('Error in triggerRewardPointsNotification:', error);
    }
  };

  return {
    triggerGDRegistrationNotification,
    triggerRewardPointsNotification
  };
};
