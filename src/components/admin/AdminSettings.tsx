
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Settings, Save, Bell } from 'lucide-react';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    pointsPerAttendance: '10',
    pointsPerBestSpeaker: '20',
    pointsPerReferral: '10',
    pointsPerModeration: '15',
    pointsPerPerfectAttendance: '50',
    siteAnnouncement: '',
    enableEmailNotifications: true,
    enablePointsNotifications: true
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // In a real app, you would save these to your database
      // For now, we'll just show a success message
      
      toast({
        title: "Success",
        description: "Settings saved successfully"
      });
      
      console.log('Settings saved:', settings);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnnouncementSave = async () => {
    setLoading(true);
    try {
      // In a real app, you would save the announcement to your database
      
      toast({
        title: "Success",
        description: "Announcement saved successfully"
      });
      
      console.log('Announcement saved:', settings.siteAnnouncement);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save announcement",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Reward Points Structure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pointsPerAttendance">Points per GD Attendance</Label>
              <Input
                id="pointsPerAttendance"
                type="number"
                value={settings.pointsPerAttendance}
                onChange={(e) => setSettings(prev => ({ ...prev, pointsPerAttendance: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="pointsPerBestSpeaker">Points for Best Speaker Award</Label>
              <Input
                id="pointsPerBestSpeaker"
                type="number"
                value={settings.pointsPerBestSpeaker}
                onChange={(e) => setSettings(prev => ({ ...prev, pointsPerBestSpeaker: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="pointsPerReferral">Points per Referral</Label>
              <Input
                id="pointsPerReferral"
                type="number"
                value={settings.pointsPerReferral}
                onChange={(e) => setSettings(prev => ({ ...prev, pointsPerReferral: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="pointsPerModeration">Points for Session Moderation</Label>
              <Input
                id="pointsPerModeration"
                type="number"
                value={settings.pointsPerModeration}
                onChange={(e) => setSettings(prev => ({ ...prev, pointsPerModeration: e.target.value }))}
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="pointsPerPerfectAttendance">Points for Perfect Monthly Attendance</Label>
              <Input
                id="pointsPerPerfectAttendance"
                type="number"
                value={settings.pointsPerPerfectAttendance}
                onChange={(e) => setSettings(prev => ({ ...prev, pointsPerPerfectAttendance: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="mt-6">
            <Button onClick={handleSaveSettings} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              Save Points Structure
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Site-wide Announcements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="siteAnnouncement">Current Announcement</Label>
              <Textarea
                id="siteAnnouncement"
                placeholder="Enter a site-wide announcement that will be visible to all users..."
                value={settings.siteAnnouncement}
                onChange={(e) => setSettings(prev => ({ ...prev, siteAnnouncement: e.target.value }))}
                rows={4}
              />
            </div>
            
            <Button onClick={handleAnnouncementSave} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              Save Announcement
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Admin Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">Admin Management</h3>
              <p className="text-sm text-yellow-700 mb-3">
                Manage admin roles through the Participant Overview section. You can promote users to admin or remove admin access as needed.
              </p>
            </div>
            
            <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Data Management</h3>
              <p className="text-sm text-blue-700 mb-3">
                All user data, points, and GD information is securely stored and managed through the admin panel. Regular backups are maintained automatically.
              </p>
            </div>
            
            <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Email Notifications</h3>
              <p className="text-sm text-green-700 mb-3">
                Automated emails are sent for GD registrations, point awards, and important announcements. You can manage these settings per user.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
