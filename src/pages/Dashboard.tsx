import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ParticipationSummary from '@/components/dashboard/ParticipationSummary';
import UpcomingGDs from '@/components/dashboard/UpcomingGDs';
import Achievements from '@/components/dashboard/Achievements';
import RewardPoints from '@/components/dashboard/RewardPoints';
import RecommendedResources from '@/components/dashboard/RecommendedResources';
import CommunityAnnouncements from '@/components/dashboard/CommunityAnnouncements';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const { user } = useAuth();

  useEffect(() => {
    document.title = 'Dashboard - The Tomorrows Team';
  }, []);

  const { data: userProfile, isLoading } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single();

      return profile;
    },
    enabled: !!user?.id
  });

  const displayName = userProfile?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Welcome, {displayName} 👋
            </h1>
            <p className="text-lg text-muted-foreground">
              Here's your progress on The Tomorrows Team!
            </p>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <ParticipationSummary />
              <UpcomingGDs />
              <Achievements />
              <RewardPoints />
            </div>

            {/* Right Column - Sidebar Content */}
            <div className="space-y-6">
              <RecommendedResources />
              <CommunityAnnouncements />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
