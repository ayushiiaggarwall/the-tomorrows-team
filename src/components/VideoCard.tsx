import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Calendar, Users } from 'lucide-react';

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

interface VideoCardProps {
  video: {
    id: string;
    title: string;
    media_url: string;
    thumbnail_url?: string;
    video_duration?: string;
    created_at: string;
    participant_count?: number;
    tags?: string[];
  };
}

const VideoCard = ({ video }: VideoCardProps) => {
  const [showVideo, setShowVideo] = useState(false);
  
  return (
    <Card className="feature-card overflow-hidden">
      {showVideo ? (
        <div className="w-full h-48 bg-muted">
          <iframe 
            width="100%" 
            height="100%" 
            src={getEmbeddableUrl(video.media_url)} 
            title={video.title} 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          />
        </div>
      ) : (
        <div className="relative group cursor-pointer" onClick={() => setShowVideo(true)}>
          <div className="w-full h-48 bg-muted flex items-center justify-center overflow-hidden">
            {video.thumbnail_url ? (
              <img 
                src={video.thumbnail_url} 
                alt={video.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <Play className="w-12 h-12 text-muted-foreground" />
            )}
          </div>
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button size="sm" className="btn-primary">
              <Play className="w-4 h-4 mr-2" />
              Watch
            </Button>
          </div>
          {video.video_duration && (
            <div className="absolute top-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {video.video_duration}
            </div>
          )}
          <div className="absolute top-3 left-3 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded">
            Group Discussion
          </div>
        </div>
      )}
      
      <CardContent className="p-4">
        <h3 className="font-semibold mb-2 line-clamp-2">{video.title}</h3>
        
        <div className="flex items-center text-sm text-muted-foreground mb-3 space-x-4">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            {new Date(video.created_at).toLocaleDateString()}
          </div>
          {video.participant_count && (
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {video.participant_count}
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-1">
          {video.tags?.map((tag: string) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoCard;