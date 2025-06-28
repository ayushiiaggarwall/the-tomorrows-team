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

  const handleResourceClick = (anchor: string) => {
    navigate(`/resources#${anchor}`);
  };

  // Find the Ultimate Guide resource for download
  const ultimateGuideResource = resources?.find(resource => 
    resource.title.toLowerCase().includes('ultimate guide')
  );

  const featuredResources = [
    {
      type: 'guide',
      icon: '📋',
      title: 'GD Tips from Resources Section',
      description: 'Essential tips for group discussions',
      anchor: 'gd-tips'
    },
    {
      type: 'guide',
      icon: '📖',
      title: 'The Ultimate Guide for Group Discussion',
      description: 'Complete guide to excel in GDs',
      anchor: 'ultimate-guide',
      hasDownload: true
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
        {/* Featured resource links */}
        {featuredResources.map((resource, index) => (
          <div 
            key={index} 
            className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="text-lg">{resource.icon}</div>
            <div className="flex-1">
              <div 
                className="font-medium text-sm text-primary hover:underline cursor-pointer"
                onClick={() => handleResourceClick(resource.anchor)}
              >
                {resource.title}
              </div>
              <div className="text-xs text-muted-foreground">{resource.description}</div>
              {resource.hasDownload && ultimateGuideResource && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1 h-6 px-2 text-xs"
                  onClick={() => handleDownload(ultimateGuideResource.id)}
                  disabled={downloadResource.isPending}
                >
                  {downloadResource.isPending ? 'Downloading...' : 'Download'}
                </Button>
              )}
            </div>
          </div>
        ))}

        {/* Other downloadable resources - exclude the Ultimate Guide since it's now featured above */}
        {resources && resources
          .filter(resource => !resource.title.toLowerCase().includes('ultimate guide'))
          .slice(0, 1)
          .map((resource) => (
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
        
        <Button 
          variant="outline" 
          className="w-full mt-4" 
          onClick={() => navigate('/resources')}
        >
          🔍 Explore All Resources
        </Button>
      </CardContent>
    </Card>
  );
};

export default RecommendedResources;
