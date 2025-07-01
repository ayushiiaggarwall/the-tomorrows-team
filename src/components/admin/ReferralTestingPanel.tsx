
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useReferral } from '@/hooks/useReferral';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ReferralTestingPanel = () => {
  const [userId, setUserId] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { completeReferral, processReferral } = useReferral();

  const handleCompleteReferral = async () => {
    if (!userId) {
      toast.error('Please enter a user ID');
      return;
    }

    setIsLoading(true);
    try {
      await completeReferral(userId);
      toast.success('Referral completion attempted - check console for details');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to complete referral');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessReferral = async () => {
    if (!userId || !referralCode) {
      toast.error('Please enter both user ID and referral code');
      return;
    }

    setIsLoading(true);
    try {
      await processReferral(referralCode, userId);
      toast.success('Referral processing attempted - check console for details');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to process referral');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestTrigger = async () => {
    if (!userId) {
      toast.error('Please enter a user ID');
      return;
    }

    setIsLoading(true);
    try {
      // Add test attendance points to trigger the referral completion
      const { error } = await supabase
        .from('reward_points')
        .insert({
          user_id: userId,
          points: 10,
          reason: 'Test GD Attendance',
          type: 'attendance'
        });

      if (error) {
        console.error('Error adding test points:', error);
        toast.error('Failed to add test points');
      } else {
        toast.success('Test attendance points added - check if referral trigger fired');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to test trigger');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Referral System Testing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="userId">User ID</Label>
          <Input
            id="userId"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter user ID to test"
          />
        </div>
        
        <div>
          <Label htmlFor="referralCode">Referral Code (for processing)</Label>
          <Input
            id="referralCode"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
            placeholder="Enter referral code"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={handleProcessReferral}
            disabled={isLoading}
            variant="outline"
          >
            Process Referral
          </Button>
          
          <Button
            onClick={handleCompleteReferral}
            disabled={isLoading}
            variant="outline"
          >
            Complete Referral
          </Button>
          
          <Button
            onClick={handleTestTrigger}
            disabled={isLoading}
            variant="outline"
          >
            Test Trigger (Add Attendance Points)
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          <p><strong>Process Referral:</strong> Creates a referral relationship</p>
          <p><strong>Complete Referral:</strong> Manually completes a pending referral</p>
          <p><strong>Test Trigger:</strong> Adds attendance points to test automatic trigger</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReferralTestingPanel;
