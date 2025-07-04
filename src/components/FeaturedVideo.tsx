import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

// Helper function to convert video URLs to embeddable format
const getEmbeddableUrl = (url: string): string => {
  // YouTube URLs
  if (url.includes('youtube.com/watch?v=')) {
    const videoId = url.split('v=')[1]?.split('&')[0];
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&origin=${window.location.origin}`;
  }
  
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&origin=${window.location.origin}`;
  }
  
  // Already an embed URL
  if (url.includes('youtube.com/embed/')) {
    return url;
  }
  
  // Vimeo URLs
  if (url.includes('vimeo.com/')) {
    const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
    return `https://player.vimeo.com/video/${videoId}`;
  }
  
  // For other platforms or already embeddable URLs, return as-is
  return url;
};

interface FeaturedVideoProps {
  video: {
    title: string;
    media_url: string;
    thumbnail_url?: string;
  };
}

const FeaturedVideo = ({ video }: FeaturedVideoProps) => {
  const [showVideo, setShowVideo] = useState(false);
  
  return (
    <div className="aspect-video rounded-xl overflow-hidden shadow-lg bg-muted">
      {showVideo ? (
        <iframe 
          width="100%" 
          height="100%" 
          src={getEmbeddableUrl(video.media_url)} 
          title={video.title} 
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen
        />
      ) : (
        <div className="relative group cursor-pointer h-full" onClick={() => setShowVideo(true)}>
          <div className="w-full h-full bg-muted flex items-center justify-center overflow-hidden">
            {video.thumbnail_url ? (
              <img 
                src={video.thumbnail_url} 
                alt={video.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <Play className="w-16 h-16 text-muted-foreground" />
            )}
          </div>
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button size="lg" className="btn-primary">
              <Play className="w-6 h-6 mr-2" />
              Play Video
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturedVideo;