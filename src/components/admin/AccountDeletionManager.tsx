
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminSecurity } from '@/hooks/useAdminSecurity';
import { Trash2, Clock, CheckCircle, X } from 'lucide-react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

interface DeletionRequest {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  requested_at: string;
  status: 'pending' | 'completed';
  admin_notes?: string;
}

const AccountDeletionManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { executeAdminAction } = useAdminSecurity();
  const [selectedRequest, setSelectedRequest] = useState<DeletionRequest | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDismissDialog, setShowDismissDialog] = useState(false);

  const { data: deletionRequests = [], isLoading } = useQuery({
    queryKey: ['account-deletion-requests'],
    queryFn: async () => {
      // Get the deletion requests directly from the table
      const { data: requests, error: requestsError } = await supabase
        .from('account_deletion_requests')
        .select('*')
        .order('requested_at', { ascending: false });

      if (requestsError) throw requestsError;

      if (!requests || requests.length === 0) {
        return [];
      }

      // Get user profiles for the requests
      const userIds = requests.map((req: any) => req.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);

      // Combine the data
      return requests.map((request: any) => {
        const profile = profiles?.find(p => p.id === request.user_id);
        return {
          id: request.id,
          user_id: request.user_id,
          user_email: profile?.email || 'Unknown',
          user_name: profile?.full_name || 'Unknown',
          requested_at: request.requested_at,
          status: request.status,
          admin_notes: request.admin_notes
        };
      }) as DeletionRequest[];
    }
  });

  const dismissRequestMutation = useMutation({
    mutationFn: async (request: DeletionRequest) => {
      const { error } = await supabase
        .from('account_deletion_requests')
        .delete()
        .eq('id', request.id);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Request Dismissed",
        description: "The account deletion request has been dismissed.",
      });
      queryClient.invalidateQueries({ queryKey: ['account-deletion-requests'] });
      setShowDismissDialog(false);
      setSelectedRequest(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error Dismissing Request",
        description: error.message || "Failed to dismiss request. Please try again.",
        variant: "destructive",
      });
    }
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async (request: DeletionRequest) => {
      const result = await executeAdminAction(
        'delete_user_account',
        async () => {
          // Use the edge function to delete the user
          const { data, error } = await supabase.functions.invoke('delete-user-account', {
            body: {
              userId: request.user_id,
              userEmail: request.user_email,
              userName: request.user_name
            }
          });

          if (error) throw error;
          if (!data?.success) throw new Error(data?.error || 'Failed to delete user');

          // Mark deletion request as completed
          const { error: updateError } = await supabase
            .from('account_deletion_requests')
            .update({ 
              status: 'completed',
              admin_notes: 'Account permanently deleted by admin'
            })
            .eq('id', request.id);

          if (updateError) throw updateError;

          // Send final confirmation email to user
          await supabase.functions.invoke('send-contact-email', {
            body: {
              name: 'The Tomorrows Team',
              email: request.user_email,
              topic: 'Account Deletion Completed',
              message: `Dear ${request.user_name || 'User'},

Your account deletion request has been processed and your account has been permanently deleted from The Tomorrows Team platform.

All your data including:
- Profile information
- Group discussion registrations  
- Reward points
- Participation history

Has been permanently removed from our systems and cannot be recovered.

Thank you for being part of The Tomorrows Team community. We're sorry to see you go and hope our paths cross again in the future.

If you have any questions or concerns, please contact us at thetomorrowsteam@gmail.com.

Best regards,
The Tomorrows Team`
            }
          });

          // Send notification to admin team
          await supabase.functions.invoke('send-contact-email', {
            body: {
              name: 'Admin Team',
              email: 'thetomorrowsteam@gmail.com',
              topic: 'Account Deletion Completed',
              message: `User account has been permanently deleted:
              
User: ${request.user_name} (${request.user_email})
User ID: ${request.user_id}
Requested: ${new Date(request.requested_at).toLocaleString()}
Deleted: ${new Date().toLocaleString()}

This action was completed by an administrator.`
            }
          });

          return { success: true };
        },
        {
          userId: request.user_id,
          userEmail: request.user_email,
          userName: request.user_name
        }
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete account');
      }

      return result;
    },
    onSuccess: () => {
      toast({
        title: "Account Deleted Successfully",
        description: "The user account has been permanently deleted and confirmation emails have been sent.",
      });
      queryClient.invalidateQueries({ queryKey: ['account-deletion-requests'] });
      setShowDeleteDialog(false);
      setSelectedRequest(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error Deleting Account",
        description: error.message || "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleDeleteRequest = (request: DeletionRequest) => {
    setSelectedRequest(request);
    setShowDeleteDialog(true);
  };

  const handleDismissRequest = (request: DeletionRequest) => {
    setSelectedRequest(request);
    setShowDismissDialog(true);
  };

  const confirmDelete = () => {
    if (selectedRequest) {
      deleteAccountMutation.mutate(selectedRequest);
    }
  };

  const confirmDismiss = () => {
    if (selectedRequest) {
      dismissRequestMutation.mutate(selectedRequest);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Account Deletion Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {deletionRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No account deletion requests pending.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deletionRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      {request.user_name}
                    </TableCell>
                    <TableCell>{request.user_email}</TableCell>
                    <TableCell>
                      {new Date(request.requested_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={request.status === 'completed' ? 'default' : 'secondary'}
                        className="flex items-center gap-1 w-fit"
                      >
                        {request.status === 'completed' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {request.status === 'completed' ? 'Completed' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {request.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteRequest(request)}
                            disabled={deleteAccountMutation.isPending || dismissRequestMutation.isPending}
                            className="flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete Account
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDismissRequest(request)}
                            disabled={deleteAccountMutation.isPending || dismissRequestMutation.isPending}
                            className="flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Permanently Delete User Account"
        description={`Are you sure you want to permanently delete the account for ${selectedRequest?.user_name} (${selectedRequest?.user_email})? This action cannot be undone and will remove all user data including profile, registrations, and points.`}
        confirmText="Delete Account"
        cancelText="Cancel"
        variant="destructive"
      />

      <ConfirmationDialog
        isOpen={showDismissDialog}
        onClose={() => setShowDismissDialog(false)}
        onConfirm={confirmDismiss}
        title="Dismiss Account Deletion Request"
        description={`Are you sure you want to dismiss the account deletion request for ${selectedRequest?.user_name} (${selectedRequest?.user_email})? This will remove the request without deleting the account.`}
        confirmText="Dismiss Request"
        cancelText="Cancel"
        variant="default"
      />
    </div>
  );
};

export default AccountDeletionManager;
