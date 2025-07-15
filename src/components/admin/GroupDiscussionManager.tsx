
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, Plus, Edit, Trash2, Search, Link, UserCheck } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { DataTablePagination } from '@/components/ui/data-table-pagination';

// Helper function to convert UTC datetime to local datetime-local format
const convertUTCToLocal = (utcDateString: string) => {
  const date = new Date(utcDateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Helper function to convert local datetime-local to UTC for database storage
const convertLocalToUTC = (localDateString: string) => {
  const date = new Date(localDateString);
  return date.toISOString();
};

const GroupDiscussionManager = () => {
  console.log('🎯 GroupDiscussionManager component mounting');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingGD, setEditingGD] = useState<any>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [newGD, setNewGD] = useState({
    topic_name: '',
    description: '',
    scheduled_date: '',
    slot_capacity: 10,
    meet_link: '',
    is_active: true,
    session_type: 'Group Discussion'
  });
  const [emailOption, setEmailOption] = useState<'all' | 'none' | 'selected'>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  console.log('🔍 Current state:', { searchTerm, filterStatus, showCreateForm, editingGD });

  // Fetch group discussions
  const { data: discussions, isLoading, error } = useQuery({
    queryKey: ['admin-group-discussions'],
    queryFn: async () => {
      console.log('📊 Fetching group discussions...');
      const { data, error } = await supabase
        .from('group_discussions')
        .select('*')
        .order('scheduled_date', { ascending: false });

      if (error) {
        throw error;
      }
      
      return data || [];
    }
  });

  // Fetch all users for the user selector
  const { data: allUsers } = useQuery({
    queryKey: ['all-users-for-email'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .neq('email', '');
      
      if (error) throw error;
      return data || [];
    },
    enabled: emailOption === 'selected'
  });
  
console.log('📋 Query results:', { discussions, isLoading, error });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (gdData: any) => {
      console.log('➕ Creating new GD:', gdData);
      
      if (!user?.id) {
        throw new Error('User must be authenticated to create group discussions');
      }

      // Convert local time to UTC for storage
      const gdDataWithUTC = {
        ...gdData,
        scheduled_date: convertLocalToUTC(gdData.scheduled_date),
        created_by: user.id
      };

      const { data, error } = await supabase
        .from('group_discussions')
        .insert([gdDataWithUTC])
        .select()
        .single();

      if (error) {
        throw error;
      }
      
      return data;
    },
    onSuccess: async (newSession) => {
      console.log('🎉 GD created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-group-discussions'] });
      setShowCreateForm(false);
      setNewGD({
        topic_name: '',
        description: '',
        scheduled_date: '',
        slot_capacity: 10,
        meet_link: '',
        is_active: true,
        session_type: 'Group Discussion'
      });
      setEmailOption('all');
      setSelectedUsers([]);
      
      // Send email notifications based on user choice
      if (emailOption !== 'none') {
        try {
          console.log('📧 Sending session notification emails...');
          const { error: emailError } = await supabase.functions.invoke('send-session-notification', {
            body: {
              sessionId: newSession.id,
              topicName: newSession.topic_name,
              description: newSession.description,
              scheduledDate: newSession.scheduled_date,
              sessionType: newSession.session_type,
              emailOption,
              selectedUsers: emailOption === 'selected' ? selectedUsers : undefined
            }
          });
          
          if (emailError) {
            console.error('Email notification error:', emailError);
            toast({
              title: "Session Created",
              description: "Session created successfully! Email notifications are being sent.",
            });
          } else {
            const emailMessage = emailOption === 'all' 
              ? "Session created and email notifications sent to all users!"
              : `Session created and email notifications sent to ${selectedUsers.length} selected users!`;
            toast({
              title: "Success",
              description: emailMessage,
            });
          }
        } catch (error) {
          console.error('Error sending email notifications:', error);
          toast({
            title: "Success",
            description: "Session created successfully! Email notifications are being processed.",
          });
        }
      } else {
        toast({
          title: "Success",
          description: "Session created successfully!",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create session. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      console.log('📝 Updating GD:', id, updates);
      
      // Convert local time to UTC for storage
      const updatesWithUTC = {
        ...updates,
        scheduled_date: convertLocalToUTC(updates.scheduled_date)
      };
      
      const { data, error } = await supabase
        .from('group_discussions')
        .update(updatesWithUTC)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      console.log('🎉 GD updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-group-discussions'] });
      setEditingGD(null);
      toast({
        title: "Success",
        description: "Session updated successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update session. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('🗑️ Deleting GD:', id);
      const { error } = await supabase
        .from('group_discussions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting GD:', error);
        throw error;
      }

      console.log('✅ Deleted GD:', id);
    },
    onSuccess: () => {
      console.log('🎉 GD deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-group-discussions'] });
      toast({
        title: "Success",
        description: "Session deleted successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete session. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 Submitting create form:', newGD);
    
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to create sessions.",
        variant: "destructive",
      });
      return;
    }
    
    createMutation.mutate(newGD);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGD) {
      console.log('🚀 Submitting update form:', editingGD);
      updateMutation.mutate({ id: editingGD.id, updates: editingGD });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this session?')) {
      console.log('🚀 Confirming delete:', id);
      deleteMutation.mutate(id);
    }
  };

  // Filter discussions
  const allFilteredDiscussions = discussions?.filter(discussion => {
    const matchesSearch = discussion.topic_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         discussion.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && discussion.is_active) ||
                         (filterStatus === 'inactive' && !discussion.is_active);
    
    return matchesSearch && matchesFilter;
  }) || [];

  // Paginate filtered discussions
  const totalCount = allFilteredDiscussions.length;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const filteredDiscussions = allFilteredDiscussions.slice(startIndex, endIndex);

  console.log('🔽 About to render UI with filtered discussions:', filteredDiscussions.length);

  if (error) {
    console.error('🚨 Rendering error state:', error);
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-red-500 mb-4">❌ Error loading discussions</div>
          <p className="text-muted-foreground">{error.message}</p>
          <Button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-group-discussions'] })}
            className="mt-4"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Debug Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="py-4">
          <p className="text-sm text-blue-800">
            <strong>Debug:</strong> Loading: {isLoading ? 'Yes' : 'No'} | 
            Discussions: {discussions?.length || 0} | 
            Filtered: {filteredDiscussions.length} | 
            Time: {new Date().toLocaleTimeString()}
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Sessions</h2>
        <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create New Session
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search">Search Sessions</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by topic or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="filter">Filter by Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Session</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="topic">Topic Name</Label>
                  <Input
                    id="topic"
                    value={newGD.topic_name}
                    onChange={(e) => setNewGD({ ...newGD, topic_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="session_type">Session Type</Label>
                  <Select value={newGD.session_type} onValueChange={(value) => setNewGD({ ...newGD, session_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Group Discussion">Group Discussion</SelectItem>
                      <SelectItem value="Debate">Debate</SelectItem>
                      <SelectItem value="Model United Nations">Model United Nations</SelectItem>
                      <SelectItem value="Workshop">Workshop</SelectItem>
                      <SelectItem value="Seminar">Seminar</SelectItem>
                      <SelectItem value="Panel Discussion">Panel Discussion</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="scheduled_date">Scheduled Date & Time</Label>
                  <Input
                    id="scheduled_date"
                    type="datetime-local"
                    value={newGD.scheduled_date}
                    onChange={(e) => setNewGD({ ...newGD, scheduled_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="capacity">Slot Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={newGD.slot_capacity}
                    onChange={(e) => setNewGD({ ...newGD, slot_capacity: parseInt(e.target.value) })}
                    min="2"
                    max="20"
                  />
                </div>
                <div>
                  <Label htmlFor="meet_link">Meet Link (Optional)</Label>
                  <div className="relative">
                    <Link className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="meet_link"
                      type="url"
                      placeholder="https://meet.google.com/..."
                      value={newGD.meet_link}
                      onChange={(e) => setNewGD({ ...newGD, meet_link: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newGD.description}
                  onChange={(e) => setNewGD({ ...newGD, description: e.target.value })}
                  rows={3}
                />
              </div>
              
              {/* Email Notification Options */}
              <div className="space-y-3">
                <Label>Email Notifications</Label>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="emailOption"
                      value="all"
                      checked={emailOption === 'all'}
                      onChange={(e) => setEmailOption(e.target.value as 'all')}
                      className="text-primary"
                    />
                    <span className="text-sm">Send to all users</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="emailOption"
                      value="selected"
                      checked={emailOption === 'selected'}
                      onChange={(e) => setEmailOption(e.target.value as 'selected')}
                      className="text-primary"
                    />
                    <span className="text-sm">Send to selected users</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="emailOption"
                      value="none"
                      checked={emailOption === 'none'}
                      onChange={(e) => setEmailOption(e.target.value as 'none')}
                      className="text-primary"
                    />
                    <span className="text-sm">Don't send emails</span>
                  </label>
                </div>
                
                {/* User Selection when "selected" is chosen */}
                {emailOption === 'selected' && (
                  <div className="mt-4 space-y-2">
                    <Label className="text-sm font-medium">Select Users to Notify</Label>
                    <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                      {allUsers && allUsers.length > 0 ? (
                        <div className="space-y-2">
                          {allUsers.map((user) => (
                            <label key={user.id} className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 p-2 rounded">
                              <input
                                type="checkbox"
                                checked={selectedUsers.includes(user.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedUsers([...selectedUsers, user.id]);
                                  } else {
                                    setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                                  }
                                }}
                                className="text-primary"
                              />
                              <UserCheck className="h-4 w-4 text-muted-foreground" />
                              <div className="flex-1">
                                <span className="text-sm font-medium">{user.full_name || 'Unknown'}</span>
                                <br />
                                <span className="text-xs text-muted-foreground">{user.email}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Loading users...</p>
                      )}
                    </div>
                    {selectedUsers.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {selectedUsers.length} user(s) selected
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Session'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Edit Form */}
      {editingGD && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Session</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_topic">Topic Name</Label>
                  <Input
                    id="edit_topic"
                    value={editingGD.topic_name}
                    onChange={(e) => setEditingGD({ ...editingGD, topic_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit_session_type">Session Type</Label>
                  <Select value={editingGD.session_type || 'Group Discussion'} onValueChange={(value) => setEditingGD({ ...editingGD, session_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Group Discussion">Group Discussion</SelectItem>
                      <SelectItem value="Debate">Debate</SelectItem>
                      <SelectItem value="Model United Nations">Model United Nations</SelectItem>
                      <SelectItem value="Workshop">Workshop</SelectItem>
                      <SelectItem value="Seminar">Seminar</SelectItem>
                      <SelectItem value="Panel Discussion">Panel Discussion</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit_scheduled_date">Scheduled Date & Time</Label>
                  <Input
                    id="edit_scheduled_date"
                    type="datetime-local"
                    value={convertUTCToLocal(editingGD.scheduled_date)}
                    onChange={(e) => setEditingGD({ ...editingGD, scheduled_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit_capacity">Slot Capacity</Label>
                  <Input
                    id="edit_capacity"
                    type="number"
                    value={editingGD.slot_capacity}
                    onChange={(e) => setEditingGD({ ...editingGD, slot_capacity: parseInt(e.target.value) })}
                    min="2"
                    max="20"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_meet_link">Meet Link (Optional)</Label>
                  <div className="relative">
                    <Link className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="edit_meet_link"
                      type="url"
                      placeholder="https://meet.google.com/..."
                      value={editingGD.meet_link || ''}
                      onChange={(e) => setEditingGD({ ...editingGD, meet_link: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="edit_description">Description</Label>
                <Textarea
                  id="edit_description"
                  value={editingGD.description}
                  onChange={(e) => setEditingGD({ ...editingGD, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Updating...' : 'Update Session'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditingGD(null)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Discussions List */}
      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">⏳ Loading sessions...</div>
          </CardContent>
        </Card>
      ) : filteredDiscussions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground mb-4">📋 No sessions found</div>
            {discussions?.length === 0 ? (
              <p className="text-sm text-muted-foreground">Create your first session to get started!</p>
            ) : (
              <p className="text-sm text-muted-foreground">Try adjusting your search or filter criteria.</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredDiscussions.map((discussion) => (
            <Card key={discussion.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{discussion.topic_name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {discussion.session_type || 'Group Discussion'}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm mb-3">{discussion.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(discussion.scheduled_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(discussion.scheduled_date).toLocaleTimeString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {discussion.slot_capacity} slots
                      </div>
                      {discussion.meet_link && (
                        <div className="flex items-center gap-1">
                          <Link className="w-4 h-4" />
                          <a 
                            href={discussion.meet_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Meet Link
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={discussion.is_active ? "default" : "secondary"}>
                      {discussion.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingGD(discussion)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(discussion.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalCount > pageSize && (
        <Card>
          <CardContent className="py-4">
            <DataTablePagination
              totalCount={totalCount}
              pageSize={pageSize}
              currentPage={currentPage}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GroupDiscussionManager;
