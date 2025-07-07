import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAnalytics } from '@/hooks/useAnalytics';
import { TrendingUp, Users, Eye, UserPlus, RotateCcw } from 'lucide-react';

const AnalyticsOverview = () => {
  const { analytics, isLoading, error, refetch } = useAnalytics();

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-destructive mb-4">Failed to load analytics</p>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const metrics = [
    {
      title: 'Total Visits',
      value: analytics?.total_visits || 0,
      todayValue: analytics?.today_visits || 0,
      icon: Eye,
      color: 'bg-blue-100 text-blue-800',
    },
    {
      title: 'Unique Visitors',
      value: analytics?.unique_visitors || 0,
      icon: Users,
      color: 'bg-green-100 text-green-800',
    },
    {
      title: 'Total Signups',
      value: analytics?.total_signups || 0,
      todayValue: analytics?.today_signups || 0,
      icon: UserPlus,
      color: 'bg-purple-100 text-purple-800',
    },
    {
      title: 'Growth',
      value: `${Math.round(((analytics?.today_visits || 0) / Math.max(analytics?.total_visits || 1, 1)) * 100)}%`,
      subtitle: 'Today vs Total',
      icon: TrendingUp,
      color: 'bg-orange-100 text-orange-800',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Site Analytics</h2>
          <p className="text-muted-foreground">Track your site performance and user engagement</p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm" disabled={isLoading}>
          <RotateCcw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <div className={`p-2 rounded-full ${metric.color}`}>
                <metric.icon className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '...' : metric.value.toLocaleString()}
              </div>
              {metric.todayValue !== undefined && (
                <div className="flex items-center mt-2">
                  <Badge variant="secondary" className="text-xs">
                    Today: {isLoading ? '...' : metric.todayValue}
                  </Badge>
                </div>
              )}
              {metric.subtitle && (
                <p className="text-xs text-muted-foreground mt-1">
                  {metric.subtitle}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {analytics && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Conversion Rate:</span>
                <div className="font-semibold">
                  {analytics.total_visits > 0 
                    ? `${Math.round((analytics.total_signups / analytics.total_visits) * 100)}%`
                    : '0%'
                  }
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Today's Activity:</span>
                <div className="font-semibold">
                  {analytics.today_visits} visits, {analytics.today_signups} signups
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Avg. Visits/User:</span>
                <div className="font-semibold">
                  {analytics.unique_visitors > 0 
                    ? Math.round(analytics.total_visits / analytics.unique_visitors)
                    : 0
                  }
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalyticsOverview;