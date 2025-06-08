
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const ParticipationSummary = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          ✅ Your Participation Summary
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Track how active you've been in group discussions and how you're growing.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">12</div>
            <div className="text-sm text-muted-foreground">Total GDs Attended</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-accent">3</div>
            <div className="text-sm text-muted-foreground">Best Speaker Awards</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-success">285</div>
            <div className="text-sm text-muted-foreground">Points Earned</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">#7</div>
            <div className="text-sm text-muted-foreground">Rank on Leaderboard</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-accent">5</div>
            <div className="text-sm text-muted-foreground">Total Referrals</div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 pt-4">
          <Button className="btn-secondary">
            🔄 Update My Profile
          </Button>
          <Button variant="outline">
            📜 View Full Participation History
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ParticipationSummary;
