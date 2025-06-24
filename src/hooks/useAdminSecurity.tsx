
import { useAuth } from '@/hooks/useAuth';
import { useAuditLog } from '@/hooks/useAuditLog';
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useAdminSecurity = () => {
  const { user, isAdmin } = useAuth();
  const { logAdminAction } = useAuditLog();
  const { toast } = useToast();

  const requireAdmin = useCallback((action: string): boolean => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to perform this action.",
        variant: "destructive",
      });
      return false;
    }

    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to perform this action.",
        variant: "destructive",
      });
      
      // Log unauthorized access attempt
      console.warn(`Unauthorized admin access attempt: ${action}`, {
        userId: user.id,
        action,
        timestamp: new Date().toISOString()
      });
      
      return false;
    }

    return true;
  }, [user, isAdmin, toast]);

  const executeAdminAction = useCallback(async (
    action: string,
    operation: () => Promise<any>,
    details?: any
  ) => {
    if (!requireAdmin(action)) {
      return { success: false, error: 'Unauthorized' };
    }

    try {
      const result = await operation();
      
      // Log successful admin action
      await logAdminAction(action, {
        ...details,
        result: 'success',
        timestamp: new Date().toISOString()
      });

      return { success: true, data: result };
    } catch (error) {
      console.error(`Admin action failed: ${action}`, error);
      
      // Log failed admin action
      await logAdminAction(action, {
        ...details,
        result: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });

      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }, [requireAdmin, logAdminAction]);

  const validateAdminOperation = useCallback((operation: string, data: any): boolean => {
    // Additional validation for admin operations
    switch (operation) {
      case 'award_points':
        if (!data.userId || !data.points || !data.reason) {
          toast({
            title: "Validation Error",
            description: "Missing required fields for point award.",
            variant: "destructive",
          });
          return false;
        }
        if (data.points < 0 || data.points > 10000) {
          toast({
            title: "Validation Error",
            description: "Points must be between 0 and 10,000.",
            variant: "destructive",
          });
          return false;
        }
        break;
      
      case 'manage_user':
        if (!data.userId) {
          toast({
            title: "Validation Error",
            description: "User ID is required.",
            variant: "destructive",
          });
          return false;
        }
        break;
      
      default:
        break;
    }

    return true;
  }, [toast]);

  return {
    requireAdmin,
    executeAdminAction,
    validateAdminOperation,
    isAuthorized: isAdmin && !!user
  };
};
