
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const useReferral = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const processReferral = async (referralCode: string, newUserId: string) => {
    try {
      // Find the referrer by matching the referral code (first 8 chars of user_id)
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .ilike('id', `${referralCode.toLowerCase()}%`);

      if (profileError) {
        console.error('Error finding referrer:', profileError);
        return;
      }

      if (!profiles || profiles.length === 0) {
        console.log('No referrer found for code:', referralCode);
        return;
      }

      const referrerId = profiles[0].id;

      // Don't allow self-referrals
      if (referrerId === newUserId) {
        console.log('Self-referral attempted, ignoring');
        return;
      }

      // Store the referral relationship
      const { error: referralError } = await supabase
        .from('user_referrals')
        .insert({
          referrer_id: referrerId,
          referred_id: newUserId,
          referral_code: referralCode,
          status: 'pending'
        });

      if (referralError) {
        console.error('Error storing referral:', referralError);
      } else {
        console.log('Referral relationship stored successfully');
        // The signup notification will be sent automatically by the database trigger
      }
    } catch (error) {
      console.error('Error processing referral:', error);
    }
  };

  // This function is now handled automatically by database triggers
  // but kept for backward compatibility if needed
  const completeReferral = async (userId: string) => {
    console.log('Referral completion is now handled automatically by database triggers');
    // The database trigger will automatically:
    // 1. Find pending referrals for the user
    // 2. Mark them as completed when they get their first attendance points
    // 3. Award 10 points to the referrer
    // 4. Send notification to the referrer
  };

  const generateReferralCode = () => {
    if (!user) return '';
    return user.id.slice(0, 8).toUpperCase();
  };

  // Get referral stats for the current user
  const getReferralStats = async () => {
    if (!user?.id) return { totalReferrals: 0, completedReferrals: 0, pendingReferrals: 0 };

    try {
      const { data: referrals, error } = await supabase
        .from('user_referrals')
        .select('status')
        .eq('referrer_id', user.id);

      if (error) {
        console.error('Error fetching referral stats:', error);
        return { totalReferrals: 0, completedReferrals: 0, pendingReferrals: 0 };
      }

      const totalReferrals = referrals?.length || 0;
      const completedReferrals = referrals?.filter(r => r.status === 'completed').length || 0;
      const pendingReferrals = referrals?.filter(r => r.status === 'pending').length || 0;

      return { totalReferrals, completedReferrals, pendingReferrals };
    } catch (error) {
      console.error('Error calculating referral stats:', error);
      return { totalReferrals: 0, completedReferrals: 0, pendingReferrals: 0 };
    }
  };

  return {
    processReferral,
    completeReferral,
    generateReferralCode,
    getReferralStats
  };
};
