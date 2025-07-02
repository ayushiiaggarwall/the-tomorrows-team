
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useReferral } from '@/hooks/useReferral';
import { Users, Award, TestTube } from 'lucide-react';

const ReferralTestingPanel = () => {
  const { toast } = useToast();
  const { completeReferral } = useReferral();
  const [testUserId, setTestUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTestReferralCompletion = async () => {
    if (!testUserId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a user ID to test",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Award test attendance points to trigger referral completion
      const { error: pointsError } = await supabase
        .from('reward_points')
        .insert({
          user_id: testUserId,
          points: 10,
          reason: 'Test GD Attendance - Referral System Test',
          type: 'attendance'
        });

      if (pointsError) {
        console.error('Error awarding test points:', pointsError);
        toast({
          title: "Error",
          description: "Failed to award test points: " + pointsError.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Test Points Awarded",
        description: "Test attendance points have been awarded. Check if referral completion was triggered.",
      });

    } catch (error: any) {
      console.error('Error in referral test:', error);
      toast({
        title: "Test Failed",
        description: error.message || "An error occurred during testing",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualReferralCompletion = async () => {
    if (!testUserId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a user ID to test",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await completeReferral(testUserId);
    } finally {
      setIsLoading(false);
    }
  };

  const checkReferralTriggers = async () => {
    setIsLoading(true);
    try {
      // Check if the trigger functions exist by querying the database
      const { data: triggers, error } = await supabase
        .from('information_schema.triggers')
        .select('*')
        .eq('trigger_name', 'reward_points_referral_trigger');

      if (error) {
        toast({
          title: "Trigger Check",
          description: "Could not verify trigger functions. They may not be installed.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Trigger Check",
          description: "Referral trigger functions appear to be installed correctly.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Trigger Check Failed",
        description: "Could not check trigger status: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="w-5 h-5" />
          Referral System Testing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="testUserId">Test User ID</Label>
          <Input
            id="testUserId"
            placeholder="Enter user ID to test referral completion"
            value={testUserId}
            onChange={(e) => setTestUserId(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleTestReferralCompletion}
            disabled={isLoading || !testUserId.trim()}
            className="flex items-center gap-2"
          >
            <Award className="w-4 h-4" />
            Test Auto Completion (Award Points)
          </Button>

          <Button
            onClick={handleManualReferralCompletion}
            disabled={isLoading || !testUserId.trim()}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Manual Completion Test
          </Button>

          <Button
            onClick={checkReferralTriggers}
            disabled={isLoading}
            variant="secondary"
          >
            Check Triggers
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          <p><strong>Test Auto Completion:</strong> Awards attendance points to trigger the database trigger that should complete referrals automatically.</p>
          <p><strong>Manual Completion:</strong> Manually completes any pending referrals for the specified user.</p>
          <p><strong>Check Triggers:</strong> Verifies that the database triggers are properly installed.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReferralTestingPanel;
