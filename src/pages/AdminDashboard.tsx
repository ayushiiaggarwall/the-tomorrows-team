
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ParticipantOverview from '@/components/admin/ParticipantOverview';
import GroupDiscussionManager from '@/components/admin/GroupDiscussionManager';
import RewardPointsManager from '@/components/admin/RewardPointsManager';
import NotificationManager from '@/components/admin/NotificationManager';
import MediaManager from '@/components/admin/MediaManager';
import BlogManager from '@/components/admin/BlogManager';
import ResourceManager from '@/components/admin/ResourceManager';
import AdminSettings from '@/components/admin/AdminSettings';
import AnnouncementManager from '@/components/admin/AnnouncementManager';
import SecurityMonitor from '@/components/admin/SecurityMonitor';
import ReferralTestingPanel from '@/components/admin/ReferralTestingPanel';
import AccountDeletionManager from '@/components/admin/AccountDeletionManager';
import AttendanceManager from '@/components/admin/AttendanceManager';

const AdminDashboard = () => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Admin Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your community and content
          </p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6 lg:grid-cols-12 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="gds">GDs</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="points">Points</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="deletions">Account Deletions</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <ParticipantOverview />
            <ReferralTestingPanel />
          </TabsContent>

          <TabsContent value="gds">
            <GroupDiscussionManager />
          </TabsContent>

          <TabsContent value="attendance">
            <AttendanceManager />
          </TabsContent>

          <TabsContent value="points">
            <RewardPointsManager />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationManager />
          </TabsContent>

          <TabsContent value="media">
            <MediaManager />
          </TabsContent>

          <TabsContent value="blog">
            <BlogManager />
          </TabsContent>

          <TabsContent value="resources">
            <ResourceManager />
          </TabsContent>

          <TabsContent value="announcements">
            <AnnouncementManager />
          </TabsContent>

          <TabsContent value="deletions">
            <AccountDeletionManager />
          </TabsContent>

          <TabsContent value="security">
            <SecurityMonitor />
          </TabsContent>

          <TabsContent value="settings">
            <AdminSettings />
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;
