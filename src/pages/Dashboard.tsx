
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import DashboardSidebar from '@/components/DashboardSidebar';
import ParticipationSummary from '@/components/dashboard/ParticipationSummary';
import UpcomingGDs from '@/components/dashboard/UpcomingGDs';
import Achievements from '@/components/dashboard/Achievements';
import RewardPoints from '@/components/dashboard/RewardPoints';
import RecommendedResources from '@/components/dashboard/RecommendedResources';
import CommunityAnnouncements from '@/components/dashboard/CommunityAnnouncements';

const Dashboard = () => {
  const userName = "Sarah"; // This would come from user authentication

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="flex">
        <DashboardSidebar />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Welcome, {userName} 👋
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
      </div>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
