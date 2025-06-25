
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
      }
    } catch (error) {
      console.error('Error processing referral:', error);
    }
  };

  const completeReferral = async (userId: string) => {
    try {
      // Find pending referral for this user
      const { data: referral, error: findError } = await supabase
        .from('user_referrals')
        .select('*')
        .eq('referred_id', userId)
        .eq('status', 'pending')
        .maybeSingle();

      if (findError || !referral) {
        console.log('No pending referral found for user:', userId);
        return;
      }

      // Mark referral as completed
      const { error: updateError } = await supabase
        .from('user_referrals')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', referral.id);

      if (updateError) {
        console.error('Error updating referral status:', updateError);
        return;
      }

      // Award points to referrer
      const { error: pointsError } = await supabase
        .from('reward_points')
        .insert({
          user_id: referral.referrer_id,
          points: 10,
          reason: 'Friend Referral',
          type: 'referral'
        });

      if (pointsError) {
        console.error('Error awarding referral points:', pointsError);
      } else {
        console.log('Referral completed and points awarded');
      }
    } catch (error) {
      console.error('Error completing referral:', error);
    }
  };

  const generateReferralCode = () => {
    if (!user) return '';
    return user.id.slice(0, 8).toUpperCase();
  };

  return {
    processReferral,
    completeReferral,
    generateReferralCode
  };
};
