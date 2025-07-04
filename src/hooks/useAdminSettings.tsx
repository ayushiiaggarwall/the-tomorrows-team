
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

interface AdminSettings {
  id?: string;
  points_per_attendance: number;
  points_per_best_speaker: number;
  points_per_referral: number;
  points_per_moderation: number;
  points_per_perfect_attendance: number;
  site_announcement: string;
}

const defaultSettings: AdminSettings = {
  points_per_attendance: 10,
  points_per_best_speaker: 20,
  points_per_referral: 10,
  points_per_moderation: 15,
  points_per_perfect_attendance: 50,
  site_announcement: ''
};

export const useAdminSettings = () => {
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const { data: settings, isLoading, refetch } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      // Fetching admin settings...
      
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .limit(1);

      if (error) {
        // Error fetching admin settings
        throw error;
      }

      if (!data || data.length === 0) {
        // No admin settings found, using defaults
        return defaultSettings;
      }

      const settings = data[0];

      // Admin settings fetched
      return {
        id: settings.id,
        points_per_attendance: settings.points_per_attendance,
        points_per_best_speaker: settings.points_per_best_speaker,
        points_per_referral: settings.points_per_referral,
        points_per_moderation: settings.points_per_moderation,
        points_per_perfect_attendance: settings.points_per_perfect_attendance,
        site_announcement: settings.site_announcement || ''
      };
    },
    staleTime: 1 * 60 * 1000, // Reduced to 1 minute for faster updates
    gcTime: 5 * 60 * 1000, // Reduced to 5 minutes  
    refetchInterval: 30000, // Refetch every 30 seconds to ensure all users get updates
  });

  // Set up real-time subscription for admin settings (for all authenticated users)
  useEffect(() => {
    // Setting up real-time subscription for admin settings

    const channel = supabase
      .channel('admin-settings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_settings'
        },
        (payload) => {
          // Real-time admin settings change detected
          // Force immediate refetch for all users
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
          }, 100);
        }
      )
      .subscribe((status) => {
        // Admin settings subscription status
      });

    return () => {
      // Cleaning up admin settings real-time subscription
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<AdminSettings>) => {
      // Saving admin settings

      // Only allow admins to save settings
      if (!isAdmin) {
        throw new Error('Only administrators can modify settings');
      }

      const settingsData = {
        points_per_attendance: newSettings.points_per_attendance ?? defaultSettings.points_per_attendance,
        points_per_best_speaker: newSettings.points_per_best_speaker ?? defaultSettings.points_per_best_speaker,
        points_per_referral: newSettings.points_per_referral ?? defaultSettings.points_per_referral,
        points_per_moderation: newSettings.points_per_moderation ?? defaultSettings.points_per_moderation,
        points_per_perfect_attendance: newSettings.points_per_perfect_attendance ?? defaultSettings.points_per_perfect_attendance,
        site_announcement: newSettings.site_announcement ?? defaultSettings.site_announcement
      };

      // First try to update existing settings
      const { data: existingSettings } = await supabase
        .from('admin_settings')
        .select('id')
        .single();

      let result;
      if (existingSettings) {
        // Update existing settings
        const { data, error } = await supabase
          .from('admin_settings')
          .update(settingsData)
          .eq('id', existingSettings.id)
          .select()
          .single();
        
        result = { data, error };
      } else {
        // Insert new settings
        const { data, error } = await supabase
          .from('admin_settings')
          .insert(settingsData)
          .select()
          .single();
        
        result = { data, error };
      }

      if (result.error) {
        // Error saving admin settings
        throw result.error;
      }

      // Admin settings saved successfully
      return result.data;
    },
    onSuccess: (data) => {
      // Settings saved successfully, updating cache
      
      // Update the cache immediately with the new data
      const updatedSettings = {
        id: data.id,
        points_per_attendance: data.points_per_attendance,
        points_per_best_speaker: data.points_per_best_speaker,
        points_per_referral: data.points_per_referral,
        points_per_moderation: data.points_per_moderation,
        points_per_perfect_attendance: data.points_per_perfect_attendance,
        site_announcement: data.site_announcement || ''
      };
      
      // Set the data in cache immediately
      queryClient.setQueryData(['admin-settings'], updatedSettings);
      
      toast({
        title: "Success",
        description: "Settings saved successfully"
      });
    },
    onError: (error) => {
      // Failed to save admin settings
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      });
    }
  });

  return {
    settings: settings || defaultSettings,
    isLoading,
    saveSettings: saveSettingsMutation.mutate,
    isSaving: saveSettingsMutation.isPending
  };
};
