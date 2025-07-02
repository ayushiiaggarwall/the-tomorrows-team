
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
    }
  };

  // Function to manually complete referral when attendance points are awarded
  const completeReferralOnAttendance = async (userId: string) => {
    try {
      console.log('Checking for referral completion for user:', userId);
      
      // Check if this user has any attendance points
      const { data: attendancePoints } = await supabase
        .from('reward_points')
        .select('id')
        .eq('user_id', userId)
        .eq('type', 'attendance');

      if (!attendancePoints || attendancePoints.length === 0) {
        console.log('No attendance points found for user');
        return;
      }

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

      console.log('Found pending referral, completing it:', referral);

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
      const { error: notificationError } = await supabase.rpc('create_notification', {
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

      if (notificationError) {
        console.error('Error creating completion notification:', notificationError);
      } else {
        console.log('Referral completion notification sent successfully');
      }

      console.log('Referral completed successfully for user:', userId);

    } catch (error) {
      console.error('Error completing referral:', error);
    }
  };

  // Function to manually complete referral (for testing)
  const completeReferral = async (userId: string) => {
    await completeReferralOnAttendance(userId);
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

  // Get detailed referral information for the current user
  const getReferralDetails = async () => {
    if (!user?.id) return [];

    try {
      const { data: referrals, error } = await supabase
        .from('user_referrals')
        .select(`
          *,
          referred_profile:profiles!user_referrals_referred_id_fkey(full_name, email)
        `)
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching referral details:', error);
        return [];
      }

      return referrals || [];
    } catch (error) {
      console.error('Error fetching referral details:', error);
      return [];
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
    completeReferralOnAttendance,
    generateReferralCode,
    getReferralStats,
    getReferralDetails,
    checkAndProcessReferral
  };
};
