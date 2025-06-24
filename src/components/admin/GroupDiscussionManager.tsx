
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Plus, Edit, Trash, Loader2, AlertCircle } from 'lucide-react';

interface GroupDiscussion {
  id: string;
  topic_name: string;
  description: string;
  scheduled_date: string;
  meet_link: string;
  slot_capacity: number;
  is_active: boolean;
  created_at: string;
  moderator_name?: string;
  moderator_email?: string;
  registrations_count: number;
}

interface Moderator {
  id: string;
  full_name: string;
  email: string;
}

const GroupDiscussionManager = () => {
  const [discussions, setDiscussions] = useState<GroupDiscussion[]>([]);
  const [moderators, setModerators] = useState<Moderator[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    topic_name: '',
    description: '',
    scheduled_date: '',
    meet_link: '',
    slot_capacity: '20',
    moderator_id: ''
  });
  const { toast } = useToast();

  const fetchDiscussions = async () => {
    try {
      console.log('Fetching discussions...');
      setError(null);
      
      const { data: gdData, error: gdError } = await supabase
        .from('group_discussions')
        .select('*')
        .order('scheduled_date', { ascending: false });

      if (gdError) {
        console.error('Error fetching discussions:', gdError);
        throw gdError;
      }

      console.log('Discussions fetched:', gdData?.length || 0);

      if (!gdData) {
        setDiscussions([]);
        return;
      }

      // Get moderator details and registration counts
      const discussionsWithDetails = await Promise.all(
        gdData.map(async (discussion) => {
          try {
            // Get moderator details if moderator_id exists
            let moderatorData = null;
            if (discussion.moderator_id) {
              const { data } = await supabase
                .from('profiles')
                .select('full_name, email')
                .eq('id', discussion.moderator_id)
                .single();
              moderatorData = data;
            }

            // Get registration count
            const { count } = await supabase
              .from('gd_registrations')
              .select('*', { count: 'exact' })
              .eq('gd_id', discussion.id);
            
            return {
              ...discussion,
              moderator_name: moderatorData?.full_name || '',
              moderator_email: moderatorData?.email || '',
              registrations_count: count || 0
            };
          } catch (error) {
            console.error('Error processing discussion:', discussion.id, error);
            return {
              ...discussion,
              moderator_name: '',
              moderator_email: '',
              registrations_count: 0
            };
          }
        })
      );

      setDiscussions(discussionsWithDetails);
    } catch (error) {
      console.error('Error in fetchDiscussions:', error);
      setError('Failed to fetch group discussions');
      toast({
        title: "Error",
        description: "Failed to fetch group discussions",
        variant: "destructive"
      });
    }
  };

  const fetchModerators = async () => {
    try {
      console.log('Fetching moderators...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('is_admin', true);

      if (error) {
        console.error('Error fetching moderators:', error);
        // Don't throw error for moderators as it's not critical
        setModerators([]);
        return;
      }

      console.log('Moderators fetched:', data?.length || 0);
      setModerators(data || []);
    } catch (error) {
      console.error('Error in fetchModerators:', error);
      setModerators([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Starting to load GD data...');
        
        await Promise.all([fetchDiscussions(), fetchModerators()]);
        
        console.log('GD data loaded successfully');
      } catch (error) {
        console.error('Error loading GD data:', error);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const gdData = {
        topic_name: formData.topic_name,
        description: formData.description,
        scheduled_date: formData.scheduled_date,
        meet_link: formData.meet_link,
        slot_capacity: parseInt(formData.slot_capacity),
        moderator_id: formData.moderator_id || null
      };

      if (editingId) {
        const { error } = await supabase
          .from('group_discussions')
          .update(gdData)
          .eq('id', editingId);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Group discussion updated successfully"
        });
      } else {
        const { data: user } = await supabase.auth.getUser();
        
        const { error } = await supabase
          .from('group_discussions')
          .insert([{ ...gdData, created_by: user.user?.id }]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Group discussion created successfully"
        });
      }

      // Reset form
      setFormData({
        topic_name: '',
        description: '',
        scheduled_date: '',
        meet_link: '',
        slot_capacity: '20',
        moderator_id: ''
      });
      setEditingId(null);
      fetchDiscussions();

    } catch (error) {
      console.error('Error saving discussion:', error);
      toast({
        title: "Error",
        description: "Failed to save group discussion",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (discussion: GroupDiscussion) => {
    setFormData({
      topic_name: discussion.topic_name,
      description: discussion.description || '',
      scheduled_date: new Date(discussion.scheduled_date).toISOString().slice(0, 16),
      meet_link: discussion.meet_link || '',
      slot_capacity: discussion.slot_capacity.toString(),
      moderator_id: discussion.moderator_email || ''
    });
    setEditingId(discussion.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this group discussion?')) return;

    try {
      const { error } = await supabase
        .from('group_discussions')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Group discussion cancelled"
      });
      
      fetchDiscussions();
    } catch (error) {
      console.error('Error cancelling discussion:', error);
      toast({
        title: "Error",
        description: "Failed to cancel group discussion",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      topic_name: '',
      description: '',
      scheduled_date: '',
      meet_link: '',
      slot_capacity: '20',
      moderator_id: ''
    });
  };

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <h3 className="text-lg font-medium mb-2">Error Loading Group Discussions</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading group discussions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {editingId ? 'Edit Group Discussion' : 'Add New Group Discussion'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="topic_name">Topic Name *</Label>
              <Input
                id="topic_name"
                placeholder="AI in Education: Boon or Bane?"
                value={formData.topic_name}
                onChange={(e) => setFormData(prev => ({ ...prev, topic_name: e.target.value }))}
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the discussion topic..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="scheduled_date">Date & Time *</Label>
              <Input
                id="scheduled_date"
                type="datetime-local"
                value={formData.scheduled_date}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="slot_capacity">Slot Capacity *</Label>
              <Input
                id="slot_capacity"
                type="number"
                min="1"
                max="50"
                value={formData.slot_capacity}
                onChange={(e) => setFormData(prev => ({ ...prev, slot_capacity: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="meet_link">Meet/Zoom Link</Label>
              <Input
                id="meet_link"
                type="url"
                placeholder="https://meet.google.com/..."
                value={formData.meet_link}
                onChange={(e) => setFormData(prev => ({ ...prev, meet_link: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="moderator_id">Moderator (Optional)</Label>
              <Select value={formData.moderator_id} onValueChange={(value) => setFormData(prev => ({ ...prev, moderator_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select moderator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No moderator</SelectItem>
                  {moderators.map((mod) => (
                    <SelectItem key={mod.id} value={mod.id}>
                      {mod.full_name} ({mod.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-2 flex gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                {editingId ? 'Update GD' : 'Add GD'}
              </Button>
              {editingId && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scheduled Group Discussions ({discussions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {discussions.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Group Discussions</h3>
              <p className="text-muted-foreground">Create your first group discussion using the form above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Topic</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Moderator</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {discussions.map((discussion) => (
                    <TableRow key={discussion.id}>
                      <TableCell className="font-medium">{discussion.topic_name}</TableCell>
                      <TableCell>{new Date(discussion.scheduled_date).toLocaleString()}</TableCell>
                      <TableCell>{discussion.slot_capacity}</TableCell>
                      <TableCell>{discussion.registrations_count || 0}</TableCell>
                      <TableCell>{discussion.moderator_name || 'None'}</TableCell>
                      <TableCell>
                        <Badge variant={discussion.is_active ? "default" : "secondary"}>
                          {discussion.is_active ? 'Active' : 'Cancelled'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(discussion)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(discussion.id)}
                            disabled={!discussion.is_active}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupDiscussionManager;
