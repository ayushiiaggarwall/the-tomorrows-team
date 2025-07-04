import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminSecurity } from '@/hooks/useAdminSecurity';
import { useToast } from '@/hooks/use-toast';
import { Users, Calendar, Phone, Mail, Building, GraduationCap, Briefcase, Check, X } from 'lucide-react';

const AttendanceManager = () => {
  const { requireAdmin } = useAdminSecurity();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedGdId, setSelectedGdId] = useState<string>('');

  // Fetch all group discussions
  const { data: groupDiscussions } = useQuery({
    queryKey: ['admin-gd-list'],
    queryFn: async () => {
      if (!requireAdmin('view_gd_registrations')) return [];

      const { data, error } = await supabase
        .from('group_discussions')
        .select('*')
        .order('scheduled_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: requireAdmin('view_gd_registrations')
  });

  // Fetch registrations for selected GD - only active ones (not cancelled)
  const { data: registrations, isLoading } = useQuery({
    queryKey: ['gd-registrations-attendance', selectedGdId],
    queryFn: async () => {
      if (!selectedGdId || !requireAdmin('view_gd_registrations')) return [];

      const { data, error } = await supabase
        .from('gd_registrations')
        .select(`
          *,
          group_discussions(topic_name, scheduled_date, slot_capacity)
        `)
        .eq('gd_id', selectedGdId)
        .is('cancelled_at', null)
        .order('registered_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedGdId && requireAdmin('view_gd_registrations')
  });

  // Mutation for marking attendance
  const markAttendanceMutation = useMutation({
    mutationFn: async ({ registrationId, userId, attended }: { registrationId: string; userId: string; attended: boolean }) => {
      const { data, error } = await supabase.functions.invoke('gd-management', {
        body: {
          action: 'mark_attendance',
          gd_id: selectedGdId,
          attendance_data: {
            user_id: userId,
            attended: attended
          }
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gd-registrations-attendance', selectedGdId] });
      queryClient.invalidateQueries({ queryKey: ['user-reward-points'] });
      
      toast({
        title: "Success",
        description: variables.attended 
          ? "Attendance marked and points awarded!" 
          : "Attendance removed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update attendance. Please try again.",
        variant: "destructive",
      });
    }
  });

  const selectedGd = groupDiscussions?.find(gd => gd.id === selectedGdId);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getOccupationDetails = (registration: any) => {
    switch (registration.participant_occupation) {
      case 'Student':
        return `${registration.student_institution} - ${registration.student_year}`;
      case 'Working Professional':
        return `${registration.professional_role} at ${registration.professional_company}`;
      case 'Self Employed':
        return registration.self_employed_profession;
      case 'Others':
        return registration.participant_occupation_other;
      default:
        return registration.participant_occupation;
    }
  };

  const getOccupationIcon = (occupation: string) => {
    switch (occupation) {
      case 'Student':
        return <GraduationCap className="w-4 h-4" />;
      case 'Working Professional':
        return <Briefcase className="w-4 h-4" />;
      case 'Self Employed':
        return <Building className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const handleAttendanceToggle = (registrationId: string, userId: string, currentAttended: boolean) => {
    markAttendanceMutation.mutate({
      registrationId,
      userId,
      attended: !currentAttended
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="w-5 h-5" />
            Attendance Management
          </CardTitle>
          <p className="text-muted-foreground">
            Mark attendance for participants and automatically award points
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Group Discussion</label>
              <Select value={selectedGdId} onValueChange={setSelectedGdId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a group discussion to manage attendance" />
                </SelectTrigger>
                <SelectContent>
                  {groupDiscussions?.map((gd) => (
                    <SelectItem key={gd.id} value={gd.id}>
                      {gd.topic_name} - {formatDate(gd.scheduled_date)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedGd && (
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <strong>Topic:</strong> {selectedGd.topic_name}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(selectedGd.scheduled_date)}</span>
                    </div>
                    <div>
                      <Badge variant="secondary">
                        {registrations?.length || 0} / {selectedGd.slot_capacity} registered
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedGdId && (
        <Card>
          <CardHeader>
            <CardTitle>Participant Attendance</CardTitle>
            {registrations && (
              <p className="text-muted-foreground">
                Mark attendance and automatically award 10 points per participant
              </p>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : !registrations?.length ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Active Registrations</h3>
                <p className="text-muted-foreground">
                  No participants are currently registered for this group discussion.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Participant</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Occupation</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead>Attendance</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrations.map((registration) => (
                      <TableRow key={registration.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{registration.participant_name}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <Mail className="w-3 h-3" />
                              <span>{registration.participant_email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-3 h-3" />
                              <span>{registration.participant_phone}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getOccupationIcon(registration.participant_occupation)}
                            <div>
                              <div className="font-medium text-sm">
                                {registration.participant_occupation}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {getOccupationDetails(registration)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(registration.registered_at)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={registration.attended ? "default" : "secondary"}>
                            {registration.attended ? "Attended" : "Not Attended"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={registration.attended || false}
                              onCheckedChange={() => handleAttendanceToggle(
                                registration.id, 
                                registration.user_id, 
                                registration.attended || false
                              )}
                              disabled={markAttendanceMutation.isPending}
                            />
                            <span className="text-xs text-muted-foreground">
                              {registration.attended ? 'Present' : 'Absent'}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AttendanceManager;