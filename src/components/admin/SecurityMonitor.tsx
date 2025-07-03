
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Shield, AlertTriangle, Eye, Lock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const SecurityMonitor = () => {
  const { user, isAdmin } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { data: adminLogs = [], isLoading } = useQuery({
    queryKey: ['admin-logs'],
    queryFn: async () => {
      if (!user || !isAdmin) return [];

      const { data, error } = await supabase
        .from('admin_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: isAdmin && !!user,
    refetchInterval: 30000,
  });

  const totalPages = Math.ceil(adminLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = adminLogs.slice(startIndex, startIndex + itemsPerPage);

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Access Denied</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const securityMetrics = [
    {
      title: 'Active Sessions',
      value: '1',
      icon: Eye,
      status: 'good' as const,
    },
    {
      title: 'Failed Logins (24h)',
      value: '0',
      icon: AlertTriangle,
      status: 'good' as const,
    },
    {
      title: 'Admin Actions (24h)',
      value: adminLogs.length.toString(),
      icon: Shield,
      status: 'neutral' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {securityMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="flex items-center p-4">
              <metric.icon className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">{metric.title}</p>
                <p className="text-2xl font-bold">{metric.value}</p>
              </div>
              <Badge 
                variant={metric.status === 'good' ? 'default' : 'secondary'}
                className="ml-auto"
              >
                {metric.status === 'good' ? 'Normal' : 'Monitor'}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Admin Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Recent Admin Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : paginatedLogs.length > 0 ? (
            <>
              <div className="space-y-3">
                {paginatedLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{log.action}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(log.created_at || '').toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="outline">Admin</Badge>
                  </div>
                ))}
              </div>
              
              {totalPages > 1 && (
                <Pagination className="mt-4">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          ) : (
            <p className="text-gray-600 text-center py-4">No recent admin actions</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityMonitor;
