
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const useDownloadableResources = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: resources, isLoading } = useQuery({
    queryKey: ['downloadable-resources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('downloadable_resources')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const uploadResource = useMutation({
    mutationFn: async ({ file, title, description }: { 
      file: File; 
      title: string; 
      description?: string; 
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Upload file to storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resources')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Create resource record
      const { data, error } = await supabase
        .from('downloadable_resources')
        .insert({
          title,
          description,
          file_path: uploadData.path,
          file_size: file.size,
          file_type: file.type
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['downloadable-resources'] });
      toast.success('Resource uploaded successfully');
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast.error('Failed to upload resource');
    }
  });

  const downloadResource = useMutation({
    mutationFn: async (resourceId: string) => {
      if (!user) {
        throw new Error('Authentication required');
      }

      // Get resource details
      const { data: resource, error: resourceError } = await supabase
        .from('downloadable_resources')
        .select('*')
        .eq('id', resourceId)
        .single();

      if (resourceError) throw resourceError;

      // Download file from storage
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('resources')
        .download(resource.file_path);

      if (downloadError) throw downloadError;

      // Increment download count
      await supabase.rpc('increment_download_count', { resource_id: resourceId });

      // Create download link
      const url = URL.createObjectURL(fileData);
      const a = document.createElement('a');
      a.href = url;
      a.download = resource.title;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return resource;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['downloadable-resources'] });
      toast.success('Download started');
    },
    onError: (error: any) => {
      console.error('Download error:', error);
      if (error.message === 'Authentication required') {
        toast.error('Please log in to download resources');
      } else {
        toast.error('Failed to download resource');
      }
    }
  });

  return {
    resources,
    isLoading,
    uploadResource,
    downloadResource
  };
};
