
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
          <div className="w-full overflow-x-auto mb-8">
            <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground min-w-max">
              <TabsTrigger value="overview" className="whitespace-nowrap">Overview</TabsTrigger>
              <TabsTrigger value="gds" className="whitespace-nowrap">GDs</TabsTrigger>
              <TabsTrigger value="attendance" className="whitespace-nowrap">Attendance</TabsTrigger>
              <TabsTrigger value="points" className="whitespace-nowrap">Points</TabsTrigger>
              <TabsTrigger value="notifications" className="whitespace-nowrap">Notifications</TabsTrigger>
              <TabsTrigger value="media" className="whitespace-nowrap">Media</TabsTrigger>
              <TabsTrigger value="blog" className="whitespace-nowrap">Blog</TabsTrigger>
              <TabsTrigger value="resources" className="whitespace-nowrap">Resources</TabsTrigger>
              <TabsTrigger value="announcements" className="whitespace-nowrap">Announcements</TabsTrigger>
              <TabsTrigger value="deletions" className="whitespace-nowrap">Account Deletions</TabsTrigger>
              <TabsTrigger value="security" className="whitespace-nowrap">Security</TabsTrigger>
              <TabsTrigger value="settings" className="whitespace-nowrap">Settings</TabsTrigger>
            </TabsList>
          </div>

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
