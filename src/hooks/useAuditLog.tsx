
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { createSafeError } from '@/utils/errorHandler';

interface AdminLogEntry {
  action: string;
  details: any;
  admin_id: string;
}

export const useAuditLog = () => {
  const { user, isAdmin } = useAuth();
  const [isLogging, setIsLogging] = useState(false);

  const logAdminAction = async (action: string, details: any) => {
    if (!user || !isAdmin) {
      throw createSafeError(
        new Error('Unauthorized admin action'),
        'permission'
      );
    }

    setIsLogging(true);
    try {
      const logEntry: AdminLogEntry = {
        action,
        details: typeof details === 'object' ? details : { message: details },
        admin_id: user.id
      };

      const { error } = await supabase
        .from('admin_logs')
        .insert([logEntry]);

      if (error) {
        throw error;
      }

      console.log(`Admin action logged: ${action}`, details);
    } catch (error) {
      console.error('Failed to log admin action:', error);
      throw createSafeError(error, 'database');
    } finally {
      setIsLogging(false);
    }
  };

  const getAdminLogs = async (limit: number = 50) => {
    if (!user || !isAdmin) {
      throw createSafeError(
        new Error('Unauthorized access to admin logs'),
        'permission'
      );
    }

    try {
      const { data, error } = await supabase
        .from('admin_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      throw createSafeError(error, 'database');
    }
  };

  return {
    logAdminAction,
    getAdminLogs,
    isLogging
  };
};
