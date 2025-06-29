
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
  const queryClient = useQueryClient();

  const { data: settings, isLoading, refetch } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      console.log('Fetching admin settings...');
      
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching admin settings:', error);
        throw error;
      }

      if (!data) {
        console.log('No admin settings found, using defaults');
        return defaultSettings;
      }

      console.log('Admin settings fetched:', data);
      return {
        id: data.id,
        points_per_attendance: data.points_per_attendance,
        points_per_best_speaker: data.points_per_best_speaker,
        points_per_referral: data.points_per_referral,
        points_per_moderation: data.points_per_moderation,
        points_per_perfect_attendance: data.points_per_perfect_attendance,
        site_announcement: data.site_announcement || ''
      };
    },
    staleTime: 0,
    refetchInterval: false, // Remove automatic polling
  });

  // Set up real-time subscription for admin settings
  useEffect(() => {
    console.log('Setting up real-time subscription for admin settings');

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
          console.log('Real-time admin settings change detected:', payload);
          // Force immediate refetch and cache invalidation
          queryClient.removeQueries({ queryKey: ['admin-settings'] });
          refetch();
        }
      )
      .subscribe((status) => {
        console.log('Admin settings subscription status:', status);
      });

    return () => {
      console.log('Cleaning up admin settings real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [queryClient, refetch]);

  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<AdminSettings>) => {
      console.log('Saving admin settings:', newSettings);

      const settingsData = {
        points_per_attendance: newSettings.points_per_attendance || defaultSettings.points_per_attendance,
        points_per_best_speaker: newSettings.points_per_best_speaker || defaultSettings.points_per_best_speaker,
        points_per_referral: newSettings.points_per_referral || defaultSettings.points_per_referral,
        points_per_moderation: newSettings.points_per_moderation || defaultSettings.points_per_moderation,
        points_per_perfect_attendance: newSettings.points_per_perfect_attendance || defaultSettings.points_per_perfect_attendance,
        site_announcement: newSettings.site_announcement || defaultSettings.site_announcement
      };

      const { data, error } = await supabase
        .from('admin_settings')
        .upsert(settingsData, { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        console.error('Error saving admin settings:', error);
        throw error;
      }

      console.log('Admin settings saved successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Settings saved, updating cache:', data);
      // Update the cache immediately with the new data
      queryClient.setQueryData(['admin-settings'], {
        id: data.id,
        points_per_attendance: data.points_per_attendance,
        points_per_best_speaker: data.points_per_best_speaker,
        points_per_referral: data.points_per_referral,
        points_per_moderation: data.points_per_moderation,
        points_per_perfect_attendance: data.points_per_perfect_attendance,
        site_announcement: data.site_announcement || ''
      });
      
      toast({
        title: "Success",
        description: "Settings saved successfully"
      });
    },
    onError: (error) => {
      console.error('Failed to save admin settings:', error);
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
