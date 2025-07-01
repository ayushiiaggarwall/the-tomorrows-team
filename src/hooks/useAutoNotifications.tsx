
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

  // Note: Referral notifications are now handled automatically by database triggers
  // This ensures they fire reliably whenever:
  // 1. Someone signs up with a referral code (signup notification)
  // 2. Someone earns their first attendance points (completion notification + points award)
  const triggerReferralNotifications = () => {
    console.log('Referral notifications are now handled automatically by database triggers');
  };

  return {
    triggerGDRegistrationNotification,
    triggerRewardPointsNotification,
    triggerReferralNotifications
  };
};
