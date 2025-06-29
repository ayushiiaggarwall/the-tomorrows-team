
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNotifications } from '@/hooks/useNotifications';
import { toast } from 'sonner';
import { CalendarIcon, Send } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

const NotificationManager = () => {
  const { createNotification } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'announcement',
    expires_at: undefined as Date | undefined
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      createNotification({
        title: formData.title,
        message: formData.message,
        type: formData.type,
        is_global: true,
        expires_at: formData.expires_at?.toISOString()
      });
      
      toast.success('Global notification created successfully!');
      setFormData({
        title: '',
        message: '',
        type: 'announcement',
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
          Create Global Notification
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Creating...' : 'Create Global Notification'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default NotificationManager;
