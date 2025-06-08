
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const RewardPoints = () => {
  const pointsHistory = [
    { date: 'June 1', activity: 'Attended GD', points: '+10' },
    { date: 'June 1', activity: 'Voted Best Speaker', points: '+20' },
    { date: 'June 5', activity: 'Referred a Friend', points: '+10' },
    { date: 'June 7', activity: 'Participated in Feedback', points: '+5' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🎁 Reward Points Breakdown
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          See how you earned your points
        </p>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-4 bg-success/10 border border-success/20 rounded-lg text-center">
          <div className="text-2xl font-bold text-success">285</div>
          <div className="text-sm text-muted-foreground">🏆 Total Points</div>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead className="text-right">Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pointsHistory.map((entry, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{entry.date}</TableCell>
                <TableCell>{entry.activity}</TableCell>
                <TableCell className="text-right text-success font-medium">
                  {entry.points}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <div className="mt-4">
          <Button variant="outline" disabled>
            📤 Redeem Rewards (Coming Soon)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RewardPoints;
