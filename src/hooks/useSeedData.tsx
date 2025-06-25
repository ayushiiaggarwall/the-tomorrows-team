
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const useSeedData = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();

  const seedLeaderboardData = async () => {
    if (!user || !isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only admins can seed data.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Seeding sample leaderboard data...');

      // First, create sample profiles if they don't exist
      const sampleProfiles = [
        { id: '11111111-1111-1111-1111-111111111111', full_name: 'Alice Johnson', email: 'alice@example.com' },
        { id: '22222222-2222-2222-2222-222222222222', full_name: 'Bob Smith', email: 'bob@example.com' },
        { id: '33333333-3333-3333-3333-333333333333', full_name: 'Carol Davis', email: 'carol@example.com' },
        { id: '44444444-4444-4444-4444-444444444444', full_name: 'David Wilson', email: 'david@example.com' },
        { id: '55555555-5555-5555-5555-555555555555', full_name: 'Emma Brown', email: 'emma@example.com' },
      ];

      // Insert profiles (ignore conflicts)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(sampleProfiles, { onConflict: 'id' });

      if (profileError) {
        console.warn('Profile creation warning (expected):', profileError);
      }

      // Sample reward points data
      const sampleRewardPoints = [
        { user_id: '11111111-1111-1111-1111-111111111111', points: 85, reason: 'Best Speaker Award', type: 'achievement' },
        { user_id: '11111111-1111-1111-1111-111111111111', points: 50, reason: 'Perfect Attendance', type: 'attendance' },
        { user_id: '11111111-1111-1111-1111-111111111111', points: 50, reason: 'GD Participation', type: 'participation' },
        
        { user_id: '22222222-2222-2222-2222-222222222222', points: 72, reason: 'Session Moderator', type: 'moderation' },
        { user_id: '22222222-2222-2222-2222-222222222222', points: 90, reason: 'Multiple GD Attendance', type: 'participation' },
        
        { user_id: '33333333-3333-3333-3333-333333333333', points: 68, reason: 'GD Participation', type: 'participation' },
        { user_id: '33333333-3333-3333-3333-333333333333', points: 90, reason: 'Consistent Participation', type: 'consistency' },
        
        { user_id: '44444444-4444-4444-4444-444444444444', points: 64, reason: 'GD Participation', type: 'participation' },
        { user_id: '44444444-4444-4444-4444-444444444444', points: 70, reason: 'Referral Bonus', type: 'referral' },
        
        { user_id: '55555555-5555-5555-5555-555555555555', points: 57, reason: 'GD Participation', type: 'participation' },
        { user_id: '55555555-5555-5555-5555-555555555555', points: 70, reason: 'Early Bird Bonus', type: 'bonus' },
      ];

      // Insert reward points
      const { error: pointsError } = await supabase
        .from('reward_points')
        .insert(sampleRewardPoints);

      if (pointsError) {
        console.error('Error inserting reward points:', pointsError);
        throw pointsError;
      }

      toast({
        title: "Success",
        description: "Sample leaderboard data has been seeded successfully!",
      });

      console.log('Sample data seeded successfully');
    } catch (error) {
      console.error('Error seeding data:', error);
      toast({
        title: "Error",
        description: "Failed to seed sample data. Check console for details.",
        variant: "destructive",
      });
    }
  };

  return { seedLeaderboardData };
};
