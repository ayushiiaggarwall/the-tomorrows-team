
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { toast } from 'sonner';

export const useAdminSettings = () => {
  const queryClient = useQueryClient();
  
  const { data: settings, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return data;
    },
    staleTime: 30000, // Cache for 30 seconds
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<{
      points_per_attendance: number;
      points_per_best_speaker: number;
      points_per_referral: number;
      points_per_moderation: number;
      points_per_perfect_attendance: number;
      site_announcement: string;
    }>) => {
      if (settings?.id) {
        // Update existing settings
        const { data, error } = await supabase
          .from('admin_settings')
          .update(newSettings)
          .eq('id', settings.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Create new settings
        const { data, error } = await supabase
          .from('admin_settings')
          .insert(newSettings)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      toast.success('Settings saved successfully!');
    },
    onError: (error) => {
      toast.error('Failed to save settings');
    },
  });

  // Set up real-time listener for admin settings changes
  useEffect(() => {
    const channel = supabase
      .channel('admin-settings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_settings'
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  return {
    settings,
    isLoading,
    error,
    refetch,
    saveSettings: saveSettingsMutation.mutate,
    isSaving: saveSettingsMutation.isPending
  };
};
