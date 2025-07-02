
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const useReferral = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const processReferral = async (referralCode: string, newUserId: string) => {
    try {
      console.log('Processing referral code:', referralCode, 'for user:', newUserId);
      
      // First try exact match (in case someone enters full UUID)
      const { data: exactMatch, error: exactError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('id', referralCode);
        
      if (exactMatch && exactMatch.length > 0) {
        console.log('Found exact UUID match:', exactMatch[0].id);
        const referrerId = exactMatch[0].id;
        await createReferralRelationship(referrerId, newUserId, referralCode);
        return;
      }
      
      // If no exact match, fetch all profiles and filter client-side for partial UUID match
      console.log('No exact match found, trying client-side filtering...');
      const { data: allProfiles, error: allError } = await supabase
        .from('profiles')
        .select('id, full_name');
        
      if (allError) {
        console.error('Error fetching profiles:', allError);
        return;
      }
      
      // Filter client-side for UUID starting with referral code
      const matchingProfile = allProfiles?.find(profile => 
        profile.id.toLowerCase().startsWith(referralCode.toLowerCase())
      );
      
      if (!matchingProfile) {
        console.log('No referrer found for code:', referralCode);
        return;
      }
      
      console.log('Found referrer via client-side filtering:', matchingProfile.id);
      await createReferralRelationship(matchingProfile.id, newUserId, referralCode);

    } catch (error) {
      console.error('Error processing referral:', error);
    }
  };

  const createReferralRelationship = async (referrerId: string, newUserId: string, referralCode: string) => {
    // Don't allow self-referrals
    if (referrerId === newUserId) {
      console.log('Self-referral attempted, ignoring');
      return;
    }

    // Check if referral relationship already exists
    const { data: existingReferral } = await supabase
      .from('user_referrals')
      .select('id')
      .eq('referred_id', newUserId)
      .single();

    if (existingReferral) {
      console.log('Referral relationship already exists');
      return;
    }

    // Store the referral relationship
    const { error: referralError } = await supabase
      .from('user_referrals')
      .insert({
        referrer_id: referrerId,
        referred_id: newUserId,
        referral_code: referralCode.toUpperCase(),
        status: 'pending'
      });

    if (referralError) {
      console.error('Error storing referral:', referralError);
    } else {
      console.log('Referral relationship stored successfully');
      
      // Manual notification for signup (as backup to trigger)
      try {
        const { data: newUserProfile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', newUserId)
          .single();

        await supabase.rpc('create_notification', {
          p_user_id: referrerId,
          p_title: '👥 Friend Joined!',
          p_message: `${newUserProfile?.full_name || 'Someone'} just signed up using your referral code! They'll need to attend their first GD for you to earn bonus points.`,
          p_type: 'info',
          p_metadata: JSON.stringify({
            referred_user_id: newUserId,
            referred_user_name: newUserProfile?.full_name,
            referral_code: referralCode.toUpperCase()
          })
        });
        
        console.log('Backup signup notification sent');
      } catch (notificationError) {
        console.error('Error sending backup notification:', notificationError);
      }
    }
  };

  // Function to manually complete referral (for testing)
  const completeReferral = async (userId: string) => {
    try {
      console.log('Manually completing referral for user:', userId);
      
      // Find pending referral for this user
      const { data: referral } = await supabase
        .from('user_referrals')
        .select('*')
        .eq('referred_id', userId)
        .eq('status', 'pending')
        .single();

      if (!referral) {
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
          reason: 'Friend Referral Completed',
          type: 'referral'
        });

      if (pointsError) {
        console.error('Error awarding referral points:', pointsError);
        return;
      }

      // Send notification to referrer
      await supabase.rpc('create_notification', {
        p_user_id: referral.referrer_id,
        p_title: '🎉 Referral Bonus Earned!',
        p_message: 'Your referred friend attended their first GD! You\'ve earned +10 bonus points.',
        p_type: 'reward',
        p_metadata: JSON.stringify({
          points: 10,
          reason: 'Friend Referral Completed',
          referred_user_id: userId
        })
      });

      console.log('Referral completed successfully');
      toast({
        title: "Referral Completed",
        description: "Referral bonus has been awarded!"
      });

    } catch (error) {
      console.error('Error completing referral:', error);
    }
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

  // Function to check and process referral for existing user
  const checkAndProcessReferral = async (referralCode: string) => {
    if (!user?.id || !referralCode) return;
    
    console.log('Checking referral for existing user:', user.id, 'with code:', referralCode);
    await processReferral(referralCode, user.id);
  };

  return {
    processReferral,
    completeReferral,
    generateReferralCode,
    getReferralStats,
    checkAndProcessReferral
  };
};
