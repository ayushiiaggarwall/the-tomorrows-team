
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDownloadableResources } from '@/hooks/useDownloadableResources';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const RecommendedResources = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { resources, downloadResource } = useDownloadableResources();

  const handleDownload = (resourceId: string) => {
    if (!user) {
      toast.error('Please log in to download resources');
      navigate('/login');
      return;
    }
    downloadResource.mutate(resourceId);
  };

  const staticResources = [
    {
      type: 'video',
      icon: '🎥',
      title: 'How to Open Strong in a GD',
      description: 'Learn effective opening techniques'
    },
    {
      type: 'article',
      icon: '📝',
      title: '5 Smart Phrases to Use in Debates',
      description: 'Enhance your vocabulary for discussions'
    },
    {
      type: 'podcast',
      icon: '🎙️',
      title: 'Building Confidence as a Speaker',
      description: 'Overcome speaking anxiety'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🎓 Recommended Resources
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Based on your recent GDs and activity
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Static resources */}
        {staticResources.map((resource, index) => (
          <div key={index} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
            <div className="text-lg">{resource.icon}</div>
            <div className="flex-1">
              <div className="font-medium text-sm">{resource.title}</div>
              <div className="text-xs text-muted-foreground">{resource.description}</div>
            </div>
          </div>
        ))}

        {/* Downloadable resources */}
        {resources && resources.slice(0, 2).map((resource) => (
          <div key={resource.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="text-lg">📄</div>
            <div className="flex-1">
              <div className="font-medium text-sm">{resource.title}</div>
              <div className="text-xs text-muted-foreground">{resource.description}</div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-1 h-6 px-2 text-xs"
                onClick={() => handleDownload(resource.id)}
                disabled={downloadResource.isPending}
              >
                {downloadResource.isPending ? 'Downloading...' : 'Download'}
              </Button>
            </div>
          </div>
        ))}
        
        <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/resources')}>
          🔍 Explore All Resources
        </Button>
      </CardContent>
    </Card>
  );
};

export default RecommendedResources;
