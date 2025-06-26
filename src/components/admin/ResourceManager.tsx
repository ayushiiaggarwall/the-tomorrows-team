
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Trash2 } from 'lucide-react';
import { useDownloadableResources } from '@/hooks/useDownloadableResources';
import ResourceUpload from './ResourceUpload';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ResourceManager = () => {
  const { resources, isLoading } = useDownloadableResources();

  const handleDelete = async (resourceId: string, filePath: string) => {
    try {
      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('resources')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete record from database
      const { error: dbError } = await supabase
        .from('downloadable_resources')
        .delete()
        .eq('id', resourceId);

      if (dbError) throw dbError;

      toast.success('Resource deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete resource');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <ResourceUpload />
      
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Resources</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading resources...</div>
          ) : resources && resources.length > 0 ? (
            <div className="space-y-4">
              {resources.map((resource) => (
                <div key={resource.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <div>
                      <h4 className="font-medium">{resource.title}</h4>
                      {resource.description && (
                        <p className="text-sm text-muted-foreground">{resource.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {resource.file_type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {resource.file_size ? formatFileSize(resource.file_size) : 'Unknown size'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Download className="w-4 h-4" />
                      <span>{resource.download_count}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(resource.id, resource.file_path)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No resources uploaded yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResourceManager;
