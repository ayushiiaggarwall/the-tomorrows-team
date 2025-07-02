import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useReferral } from '@/hooks/useReferral';
import { Trash2, Plus } from 'lucide-react';

interface RewardPoint {
  id: string;
  user_id: string;
  points: number;
  reason: string;
  type: string;
  gd_date: string | null;
  awarded_by: string | null;
  created_at: string;
  profiles: {
    full_name: string | null;
    email: string;
  } | null;
}

const RewardPointsManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { completeReferralOnAttendance } = useReferral();
  
  const [formData, setFormData] = useState({
    userId: '',
    points: '',
    reason: '',
    type: 'attendance',
    gdDate: ''
  });

  const { data: rewardPoints, isLoading, refetch } = useQuery({
    queryKey: ['reward-points'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reward_points')
        .select(`
          *,
          profiles (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as RewardPoint[];
    }
  });

  const { data: users, isLoading: isUsersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .order('full_name', { ascending: true });

      if (error) throw error;
      return data;
    }
  });

  const addPointsMutation = useMutation({
    mutationFn: async (data: {
      userId: string;
      points: number;
      reason: string;
      type: string;
      gdDate?: string;
    }) => {
      const { error } = await supabase
        .from('reward_points')
        .insert({
          user_id: data.userId,
          points: data.points,
          reason: data.reason,
          type: data.type,
          gd_date: data.gdDate || null
        });

      if (error) throw error;

      // If this is attendance points, check for referral completion
      if (data.type === 'attendance') {
        console.log('Attendance points awarded, checking for referral completion');
        await completeReferralOnAttendance(data.userId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reward-points'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Success",
        description: "Reward points added successfully"
      });
      setFormData({
        userId: '',
        points: '',
        reason: '',
        type: 'attendance',
        gdDate: ''
      });
    },
    onError: (error: any) => {
      console.error('Error adding points:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add reward points",
        variant: "destructive"
      });
    }
  });

  const deletePointsMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('reward_points')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reward-points'] });
      toast({
        title: "Success",
        description: "Reward points deleted successfully"
      });
    },
    onError: (error: any) => {
      console.error('Error deleting points:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete reward points",
        variant: "destructive"
      });
    }
  });

  const handleDelete = (id: string) => {
    deletePointsMutation.mutate(id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.userId || !formData.points || !formData.reason) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    addPointsMutation.mutate({
      userId: formData.userId,
      points: parseInt(formData.points),
      reason: formData.reason,
      type: formData.type,
      gdDate: formData.gdDate || undefined
    });
  };

  if (isLoading || isUsersLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Add Reward Points</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="userId">User</Label>
                <Select
                  onValueChange={(value) => setFormData({ ...formData, userId: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users?.map((user: any) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="points">Points</Label>
                <Input
                  type="number"
                  id="points"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reason">Reason</Label>
                <Input
                  type="text"
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="attendance">Attendance</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {formData.type === 'attendance' && (
              <div>
                <Label htmlFor="gdDate">GD Date (Optional)</Label>
                <Input
                  type="date"
                  id="gdDate"
                  value={formData.gdDate}
                  onChange={(e) => setFormData({ ...formData, gdDate: e.target.value })}
                />
              </div>
            )}
            <Button disabled={addPointsMutation.isPending} type="submit">
              {addPointsMutation.isPending ? "Adding..." : "Add Points"}
              <Plus className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Reward Points List</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>GD Date</TableHead>
                <TableHead>Awarded By</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rewardPoints?.map((point) => (
                <TableRow key={point.id}>
                  <TableCell>{point.profiles?.full_name} ({point.profiles?.email})</TableCell>
                  <TableCell>{point.points}</TableCell>
                  <TableCell>{point.reason}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{point.type}</Badge>
                  </TableCell>
                  <TableCell>{point.gd_date}</TableCell>
                  <TableCell>{point.awarded_by}</TableCell>
                  <TableCell>{new Date(point.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(point.id)}
                      disabled={deletePointsMutation.isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
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
