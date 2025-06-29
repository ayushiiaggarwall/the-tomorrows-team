
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNotifications } from '@/hooks/useNotifications';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CalendarIcon, Send, Users, User } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
}

const NotificationManager = () => {
  const { createNotification } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'announcement',
    target: 'global', // 'global' or 'user'
    user_id: '',
    expires_at: undefined as Date | undefined
  });

  // Fetch users for the dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .order('full_name');

        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.target === 'user' && !formData.user_id) {
      toast.error('Please select a user');
      return;
    }

    setIsLoading(true);
    try {
      const isGlobal = formData.target === 'global';
      const targetUserId = isGlobal ? null : formData.user_id;

      createNotification({
        user_id: targetUserId,
        title: formData.title,
        message: formData.message,
        type: formData.type,
        is_global: isGlobal,
        expires_at: formData.expires_at?.toISOString()
      });
      
      const targetUser = users.find(u => u.id === formData.user_id);
      const successMessage = isGlobal 
        ? 'Global notification created successfully!'
        : `Notification sent to ${targetUser?.full_name || 'selected user'} successfully!`;
      
      toast.success(successMessage);
      setFormData({
        title: '',
        message: '',
        type: 'announcement',
        target: 'global',
        user_id: '',
        expires_at: undefined
      });
    } catch (error) {
      console.error('Error creating notification:', error);
      toast.error('Failed to create notification');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5" />
          Send Notification
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="target">Send To</Label>
            <Select
              value={formData.target}
              onValueChange={(value) => setFormData(prev => ({ 
                ...prev, 
                target: value,
                user_id: value === 'global' ? '' : prev.user_id
              }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    All Users (Global)
                  </div>
                </SelectItem>
                <SelectItem value="user">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Specific User
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.target === 'user' && (
            <div>
              <Label htmlFor="user_id">Select User</Label>
              <Select
                value={formData.user_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, user_id: value }))}
                disabled={loadingUsers}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingUsers ? "Loading users..." : "Select a user"} />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.full_name || 'No name'}</span>
                        <span className="text-sm text-muted-foreground">{user.email}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter notification title"
              required
            />
          </div>

          <div>
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Enter notification message"
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="type">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="announcement">Announcement</SelectItem>
                <SelectItem value="info">Information</SelectItem>
                <SelectItem value="reminder">Reminder</SelectItem>
                <SelectItem value="gd_update">GD Update</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Expiry Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.expires_at ? format(formData.expires_at, "PPP") : "No expiry"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.expires_at}
                  onSelect={(date) => setFormData(prev => ({ ...prev, expires_at: date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button type="submit" disabled={isLoading || loadingUsers} className="w-full">
            {isLoading ? 'Sending...' : 
             formData.target === 'global' ? 'Send Global Notification' : 'Send to User'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default NotificationManager;
