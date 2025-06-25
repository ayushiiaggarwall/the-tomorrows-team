
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useReferral } from '@/hooks/useReferral';

export const useGDAttendance = () => {
  const { user } = useAuth();
  const { completeReferral } = useReferral();

  const markAttendance = async (gdId: string, userId: string) => {
    try {
      // Update the registration to mark as attended
      const { error } = await supabase
        .from('gd_registrations')
        .update({ attended: true })
        .eq('gd_id', gdId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error marking attendance:', error);
        return;
      }

      // Check if this is the user's first attended GD
      const { data: attendedGDs, error: countError } = await supabase
        .from('gd_registrations')
        .select('id')
        .eq('user_id', userId)
        .eq('attended', true);

      if (countError) {
        console.error('Error checking attendance count:', countError);
        return;
      }

      // If this is their first attended GD, complete any pending referral
      if (attendedGDs && attendedGDs.length === 1) {
        await completeReferral(userId);
      }
    } catch (error) {
      console.error('Error in markAttendance:', error);
    }
  };

  return { markAttendance };
};
