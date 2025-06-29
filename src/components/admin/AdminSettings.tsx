
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Save, Bell } from 'lucide-react';
import { useAdminSettings } from '@/hooks/useAdminSettings';

const AdminSettings = () => {
  const { settings, isLoading, saveSettings, isSaving } = useAdminSettings();
  const [formData, setFormData] = useState({
    pointsPerAttendance: '10',
    pointsPerBestSpeaker: '20',
    pointsPerReferral: '10',
    pointsPerModeration: '15',
    pointsPerPerfectAttendance: '50',
    siteAnnouncement: ''
  });

  // Update form data when settings load
  useEffect(() => {
    if (settings) {
      setFormData({
        pointsPerAttendance: settings.points_per_attendance.toString(),
        pointsPerBestSpeaker: settings.points_per_best_speaker.toString(),
        pointsPerReferral: settings.points_per_referral.toString(),
        pointsPerModeration: settings.points_per_moderation.toString(),
        pointsPerPerfectAttendance: settings.points_per_perfect_attendance.toString(),
        siteAnnouncement: settings.site_announcement
      });
    }
  }, [settings]);

  const handleSaveSettings = async () => {
    const settingsToSave = {
      points_per_attendance: parseInt(formData.pointsPerAttendance),
      points_per_best_speaker: parseInt(formData.pointsPerBestSpeaker),
      points_per_referral: parseInt(formData.pointsPerReferral),
      points_per_moderation: parseInt(formData.pointsPerModeration),
      points_per_perfect_attendance: parseInt(formData.pointsPerPerfectAttendance),
      site_announcement: formData.siteAnnouncement
    };

    saveSettings(settingsToSave);
  };

  const handleAnnouncementSave = async () => {
    saveSettings({ site_announcement: formData.siteAnnouncement });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                value={formData.pointsPerAttendance}
                onChange={(e) => setFormData(prev => ({ ...prev, pointsPerAttendance: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="pointsPerBestSpeaker">Points for Best Speaker Award</Label>
              <Input
                id="pointsPerBestSpeaker"
                type="number"
                value={formData.pointsPerBestSpeaker}
                onChange={(e) => setFormData(prev => ({ ...prev, pointsPerBestSpeaker: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="pointsPerReferral">Points per Referral</Label>
              <Input
                id="pointsPerReferral"
                type="number"
                value={formData.pointsPerReferral}
                onChange={(e) => setFormData(prev => ({ ...prev, pointsPerReferral: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="pointsPerModeration">Points for Session Moderation</Label>
              <Input
                id="pointsPerModeration"
                type="number"
                value={formData.pointsPerModeration}
                onChange={(e) => setFormData(prev => ({ ...prev, pointsPerModeration: e.target.value }))}
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="pointsPerPerfectAttendance">Points for Perfect Monthly Attendance</Label>
              <Input
                id="pointsPerPerfectAttendance"
                type="number"
                value={formData.pointsPerPerfectAttendance}
                onChange={(e) => setFormData(prev => ({ ...prev, pointsPerPerfectAttendance: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="mt-6">
            <Button onClick={handleSaveSettings} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Points Structure'}
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
                value={formData.siteAnnouncement}
                onChange={(e) => setFormData(prev => ({ ...prev, siteAnnouncement: e.target.value }))}
                rows={4}
              />
            </div>
            
            <Button onClick={handleAnnouncementSave} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Announcement'}
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
