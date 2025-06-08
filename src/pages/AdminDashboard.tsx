
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import RewardPointsManager from '@/components/admin/RewardPointsManager';
import GroupDiscussionManager from '@/components/admin/GroupDiscussionManager';
import BlogManager from '@/components/admin/BlogManager';
import MediaManager from '@/components/admin/MediaManager';
import ParticipantOverview from '@/components/admin/ParticipantOverview';
import AdminSettings from '@/components/admin/AdminSettings';
import { Users, Calendar, Trophy, BookOpen, Mic, Settings } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('rewards');

  const adminName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin';

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Welcome Admin 👨‍💼
            </h1>
            <p className="text-lg text-muted-foreground">
              Manage discussions, content, and participants in one place.
            </p>
            <p className="text-sm text-muted-foreground">
              Logged in as: {adminName}
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="rewards" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Rewards
              </TabsTrigger>
              <TabsTrigger value="discussions" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                GDs
              </TabsTrigger>
              <TabsTrigger value="blogs" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Blogs
              </TabsTrigger>
              <TabsTrigger value="media" className="flex items-center gap-2">
                <Mic className="w-4 h-4" />
                Media
              </TabsTrigger>
              <TabsTrigger value="participants" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="rewards">
              <RewardPointsManager />
            </TabsContent>

            <TabsContent value="discussions">
              <GroupDiscussionManager />
            </TabsContent>

            <TabsContent value="blogs">
              <BlogManager />
            </TabsContent>

            <TabsContent value="media">
              <MediaManager />
            </TabsContent>

            <TabsContent value="participants">
              <ParticipantOverview />
            </TabsContent>

            <TabsContent value="settings">
              <AdminSettings />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
