
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const ParticipationHistory = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    document.title = 'Participation History - The Tomorrows Team';
  }, []);

  const { data: participationHistory, isLoading } = useQuery({
    queryKey: ['participation-history', user?.id],
    queryFn: async () => {
      if (!user?.id) return { data: [], total: 0 };

      // Get user's GD registrations with GD details
      const { data: registrations, error, count } = await supabase
        .from('gd_registrations')
        .select(`
          id,
          registered_at,
          attended,
          cancelled_at,
          cancellation_type,
          group_discussions (
            id,
            topic_name,
            scheduled_date,
            description
          )
        `, { count: 'exact' })
        .eq('user_id', user.id)
        .order('registered_at', { ascending: false });

      if (error) {
        console.error('Error fetching participation history:', error);
        return { data: [], total: 0 };
      }

      // Get reward points for each GD
      const { data: rewardPoints } = await supabase
        .from('reward_points')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const processedData = registrations?.map(reg => {
        const gd = reg.group_discussions;
        const gdPoints = rewardPoints?.filter(rp => 
          rp.gd_date && new Date(rp.gd_date).toDateString() === new Date(gd.scheduled_date).toDateString()
        ) || [];

        const totalPoints = gdPoints.reduce((sum, rp) => sum + rp.points, 0);

        return {
          id: reg.id,
          gdId: gd.id,
          topic: gd.topic_name,
          scheduledDate: new Date(gd.scheduled_date),
          registeredAt: new Date(reg.registered_at),
          attended: reg.attended,
          cancelled: !!reg.cancelled_at,
          cancellationType: reg.cancellation_type,
          pointsEarned: totalPoints,
          status: reg.cancelled_at ? 'Cancelled' : reg.attended ? 'Attended' : 'Registered'
        };
      }) || [];

      return { data: processedData, total: count || 0 };
    },
    enabled: !!user?.id
  });

  // Calculate pagination
  const totalItems = participationHistory?.total || 0;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = participationHistory?.data?.slice(startIndex, endIndex) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="p-6">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-muted/50 rounded w-1/3 mb-4"></div>
              <div className="h-64 bg-muted/50 rounded"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              📜 Participation History
            </h1>
            <p className="text-lg text-muted-foreground">
              Your complete journey with The Tomorrows Team
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Group Discussion History</CardTitle>
              <p className="text-sm text-muted-foreground">
                All your past and upcoming group discussions
              </p>
            </CardHeader>
            <CardContent>
              {!participationHistory?.data?.length ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">📅</div>
                  <h3 className="text-lg font-semibold mb-2">No Participation History</h3>
                  <p className="text-muted-foreground">
                    Start participating in group discussions to see your history here!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Topic</TableHead>
                          <TableHead>Scheduled Date</TableHead>
                          <TableHead>Registered On</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Points Earned</TableHead>
                          <TableHead className="text-center">Chat</TableHead>
                        </TableRow>
                      </TableHeader>
                    <TableBody>
                      {paginatedData.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="font-medium">
                            {entry.topic}
                          </TableCell>
                          <TableCell>
                            {format(entry.scheduledDate, 'MMM dd, yyyy • h:mm a')}
                          </TableCell>
                          <TableCell>
                            {format(entry.registeredAt, 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                entry.status === 'Attended' ? 'default' :
                                entry.status === 'Cancelled' ? 'destructive' :
                                'secondary'
                              }
                            >
                              {entry.status}
                            </Badge>
                            {entry.cancellationType === 'dropout' && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                Late Dropout
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className={`text-right font-medium ${
                            entry.pointsEarned > 0 ? 'text-success' : 
                            entry.pointsEarned < 0 ? 'text-destructive' : 
                            'text-muted-foreground'
                          }`}>
                            {entry.pointsEarned > 0 ? `+${entry.pointsEarned}` : entry.pointsEarned || 0}
                          </TableCell>
                          <TableCell className="text-center">
                            {new Date(entry.scheduledDate) < new Date() ? (
                              <Link to={`/gd-chat/${entry.gdId}`}>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  title="View GD Chat"
                                >
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                              </Link>
                            ) : (
                              <span className="text-muted-foreground text-xs">N/A</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  <DataTablePagination
                    totalCount={totalItems}
                    pageSize={pageSize}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(newPageSize) => {
                      setPageSize(newPageSize);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ParticipationHistory;
