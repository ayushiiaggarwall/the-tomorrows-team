
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Search, Plus, Undo } from 'lucide-react';

interface RewardEntry {
  id: string;
  user_id: string;
  points: number;
  reason: string;
  type: string;
  gd_date: string | null;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

const RewardPointsManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [rewardEntries, setRewardEntries] = useState<RewardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    points: '',
    reason: '',
    type: 'Attendance',
    gdDate: ''
  });
  const { toast } = useToast();

  const fetchRewardEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('reward_points')
        .select(`
          *,
          profiles (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setRewardEntries(data || []);
    } catch (error) {
      console.error('Error fetching reward entries:', error);
    }
  };

  useEffect(() => {
    fetchRewardEntries();
  }, []);

  const handleAddPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, find the user by email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', formData.email)
        .single();

      if (userError || !userData) {
        toast({
          title: "Error",
          description: "User not found with that email",
          variant: "destructive"
        });
        return;
      }

      // Add the reward points
      const { error } = await supabase
        .from('reward_points')
        .insert([{
          user_id: userData.id,
          points: parseInt(formData.points),
          reason: formData.reason,
          type: formData.type,
          gd_date: formData.gdDate || null
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Points added successfully"
      });

      // Reset form and refresh data
      setFormData({
        email: '',
        points: '',
        reason: '',
        type: 'Attendance',
        gdDate: ''
      });
      fetchRewardEntries();

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add points",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reward_points')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Points entry removed"
      });
      
      fetchRewardEntries();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove entry",
        variant: "destructive"
      });
    }
  };

  const filteredEntries = rewardEntries.filter(entry =>
    entry.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Reward Points Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddPoints} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <Label htmlFor="email">Participant Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="points">Points</Label>
              <Input
                id="points"
                type="number"
                placeholder="10"
                value={formData.points}
                onChange={(e) => setFormData(prev => ({ ...prev, points: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Attendance">Attendance</SelectItem>
                  <SelectItem value="Best Speaker">Best Speaker</SelectItem>
                  <SelectItem value="Referral">Referral</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="gdDate">GD Date (Optional)</Label>
              <Input
                id="gdDate"
                type="date"
                value={formData.gdDate}
                onChange={(e) => setFormData(prev => ({ ...prev, gdDate: e.target.value }))}
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="reason">Reason</Label>
              <Input
                id="reason"
                placeholder="Attended GD on AI in Education"
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                required
              />
            </div>
            
            <div className="flex items-end">
              <Button type="submit" disabled={loading} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Points
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Point Awards</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email or name..."
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
                <TableHead>Participant</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.profiles?.full_name || 'N/A'}</TableCell>
                  <TableCell>{entry.profiles?.email}</TableCell>
                  <TableCell className="font-semibold text-green-600">+{entry.points}</TableCell>
                  <TableCell>{entry.type}</TableCell>
                  <TableCell>{entry.reason}</TableCell>
                  <TableCell>{new Date(entry.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUndo(entry.id)}
                    >
                      <Undo className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default RewardPointsManager;
