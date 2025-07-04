import { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Play, Search, Calendar, Clock } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import VideoCard from '@/components/VideoCard';


const WatchLearn = () => {
  useEffect(() => {
    document.title = 'Watch & Learn - The Tomorrows Team';
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['All']);

  // Fetch all media content
  const { data: allMedia, isLoading: mediaLoading } = useQuery({
    queryKey: ['all-media'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('media_content')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) {
        return [];
      }

      return data || [];
    }
  });

  const topics = ["All", "AI", "Technology", "Society", "Career", "Mental Health", "Environment", "Education"];

  const handleTopicClick = (topic: string) => {
    if (topic === 'All') {
      setSelectedTopics(['All']);
    } else {
      setSelectedTopics(prev => {
        const newTopics = prev.filter(t => t !== 'All');
        if (newTopics.includes(topic)) {
          const filtered = newTopics.filter(t => t !== topic);
          return filtered.length === 0 ? ['All'] : filtered;
        } else {
          return [...newTopics, topic];
        }
      });
    }
  };

  // Filter content based on search term and selected topics
  const filteredAllMedia = allMedia?.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTopics = selectedTopics.includes('All') || 
      item.tags?.some((tag: string) => selectedTopics.includes(tag));

    return matchesSearch && matchesTopics;
  }) || [];

  // Separate content by type
  const groupDiscussions = filteredAllMedia.filter(item => 
    item.media_type === 'video' || item.media_type === 'past_gd'
  );

  const podcasts = filteredAllMedia.filter(item => 
    item.media_type === 'podcast'
  );

  const renderVideoCard = (video: any) => (
    <VideoCard key={video.id} video={video} />
  );

  const renderPodcastCard = (podcast: any) => (
    <Card key={podcast.id} className="feature-card">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{podcast.title}</CardTitle>
            <div className="flex items-center text-sm text-muted-foreground space-x-4">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(podcast.created_at).toLocaleDateString()}
              </div>
              {podcast.video_duration && (
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {podcast.video_duration}
                </div>
              )}
            </div>
          </div>
          <Button 
            size="sm" 
            className="btn-primary ml-4"
            onClick={() => window.open(podcast.media_url, '_blank')}
          >
            <Play className="w-4 h-4 mr-2" />
            Play
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {podcast.description && (
          <p className="text-muted-foreground mb-4">{podcast.description}</p>
        )}
        <div className="flex flex-wrap gap-1">
          {podcast.tags?.map((tag: string) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderEmptyState = (type: string) => (
    <div className="text-center py-12">
      <div className="text-4xl mb-4">{type === 'podcast' ? '🎧' : '🎥'}</div>
      <h3 className="text-lg font-semibold mb-2">No {type === 'podcast' ? 'Podcasts' : 'Videos'} Available</h3>
      <p className="text-muted-foreground">
        No {type === 'podcast' ? 'podcast episodes' : 'group discussion videos'} have been published yet. Check back soon!
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Watch. Learn. Reflect.
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Missed a discussion? Want to learn how to improve your speaking style? Explore our GD recordings and insightful podcast episodes.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        {/* Search and Filter */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto mb-6">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search videos and podcasts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap justify-center gap-2">
            {topics.map((topic) => (
              <Badge
                key={topic}
                variant={selectedTopics.includes(topic) ? "default" : "secondary"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => handleTopicClick(topic)}
              >
                {topic}
              </Badge>
            ))}
          </div>
        </div>

        {/* Tabs for Content */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="gds">Group Discussions</TabsTrigger>
            <TabsTrigger value="podcasts">Podcasts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-8">
            {mediaLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="feature-card overflow-hidden">
                    <div className="animate-pulse">
                      <div className="w-full h-48 bg-muted/50"></div>
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-muted/50 rounded w-3/4"></div>
                        <div className="h-3 bg-muted/50 rounded w-1/2"></div>
                        <div className="flex gap-2">
                          <div className="h-6 bg-muted/50 rounded w-16"></div>
                          <div className="h-6 bg-muted/50 rounded w-20"></div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : !filteredAllMedia.length ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-lg font-semibold mb-2">No Content Available</h3>
                <p className="text-muted-foreground">
                  No content matches your selected filters. Try adjusting your search or topic selection.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Group Discussions Section */}
                {groupDiscussions.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Group Discussions</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {groupDiscussions.map(renderVideoCard)}
                    </div>
                  </div>
                )}
                
                {/* Podcasts Section */}
                {podcasts.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Podcasts</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      {podcasts.map(renderPodcastCard)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="gds" className="mt-8">
            {mediaLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="feature-card overflow-hidden">
                    <div className="animate-pulse">
                      <div className="w-full h-48 bg-muted/50"></div>
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-muted/50 rounded w-3/4"></div>
                        <div className="h-3 bg-muted/50 rounded w-1/2"></div>
                        <div className="flex gap-2">
                          <div className="h-6 bg-muted/50 rounded w-16"></div>
                          <div className="h-6 bg-muted/50 rounded w-20"></div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : !groupDiscussions.length ? (
              renderEmptyState('video')
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupDiscussions.map(renderVideoCard)}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="podcasts" className="mt-8">
            {mediaLoading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="feature-card">
                    <div className="animate-pulse p-6 space-y-4">
                      <div className="h-6 bg-muted/50 rounded w-3/4"></div>
                      <div className="h-4 bg-muted/50 rounded w-1/2"></div>
                      <div className="h-16 bg-muted/50 rounded w-full"></div>
                      <div className="flex gap-2">
                        <div className="h-6 bg-muted/50 rounded w-16"></div>
                        <div className="h-6 bg-muted/50 rounded w-20"></div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : !podcasts.length ? (
              renderEmptyState('podcast')
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {podcasts.map(renderPodcastCard)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default WatchLearn;