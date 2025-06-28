
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Search, Users, Award } from 'lucide-react';

interface Participant {
  id: string;
  full_name: string;
  email: string;
  is_admin: boolean;
  created_at: string;
  total_points: number;
  gds_attended: number;
  best_speaker_count: number;
}

const ParticipantOverview = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const itemsPerPage = 5;
  const { toast } = useToast();

  const fetchParticipants = async (page = 1) => {
    try {
      const start = (page - 1) * itemsPerPage;
      const end = start + itemsPerPage - 1;

      // Get total count first
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      setTotalParticipants(count || 0);

      // Get paginated data
      const { data: profilesData, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .range(start, end);

      if (error) throw error;

      // Process each participant to get their stats
      const processedData = await Promise.all(
        (profilesData || []).map(async (participant) => {
          // Get total points
          const { data: pointsData } = await supabase
            .from('reward_points')
            .select('points')
            .eq('user_id', participant.id);
          
          const totalPoints = pointsData?.reduce((sum, entry) => sum + entry.points, 0) || 0;

          // Get GDs attended count (where attended = true)
          const { count: gdsCount } = await supabase
            .from('gd_registrations')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', participant.id)
            .eq('attended', true);

          // Get best speaker count
          const { count: bestSpeakerCount } = await supabase
            .from('reward_points')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', participant.id)
            .eq('type', 'Best Speaker');

          return {
            ...participant,
            total_points: totalPoints,
            gds_attended: gdsCount || 0,
            best_speaker_count: bestSpeakerCount || 0
          };
        })
      );

      setParticipants(processedData);
    } catch (error) {
      console.error('Error fetching participants:', error);
      toast({
        title: "Error",
        description: "Failed to fetch participant data",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchParticipants(currentPage);
  }, [currentPage]);

  const handleToggleAdmin = async (userId: string, currentAdminStatus: boolean) => {
    if (!confirm(`Are you sure you want to ${currentAdminStatus ? 'remove admin access from' : 'grant admin access to'} this user?`)) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !currentAdminStatus })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `User ${currentAdminStatus ? 'removed from' : 'granted'} admin access`
      });
      
      fetchParticipants(currentPage);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user permissions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredParticipants = participants.filter(participant =>
    participant.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    participant.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(totalParticipants / itemsPerPage);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Participant Overview ({totalParticipants} total)
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>GDs Attended</TableHead>
                <TableHead>Best Speaker</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParticipants.map((participant) => (
                <TableRow key={participant.id}>
                  <TableCell className="font-medium">
                    {participant.full_name || 'N/A'}
                  </TableCell>
                  <TableCell>{participant.email}</TableCell>
                  <TableCell>
                    <span className={`font-semibold ${participant.total_points >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {participant.total_points >= 0 ? '+' : ''}{participant.total_points}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {participant.gds_attended}
                    </span>
                  </TableCell>
                  <TableCell>
                    {participant.best_speaker_count > 0 ? (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        <Award className="w-3 h-3 mr-1" />
                        {participant.best_speaker_count}x
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={participant.is_admin ? "default" : "secondary"}>
                      {participant.is_admin ? 'Admin' : 'User'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(participant.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleAdmin(participant.id, participant.is_admin)}
                        disabled={loading}
                      >
                        {participant.is_admin ? 'Remove Admin' : 'Make Admin'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{totalParticipants}</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {participants.filter(p => p.is_admin).length}
            </div>
            <div className="text-sm text-muted-foreground">Admins</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {participants.reduce((sum, p) => sum + p.total_points, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Points Awarded</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {participants.reduce((sum, p) => sum + p.gds_attended, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total GD Attendances</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ParticipantOverview;
