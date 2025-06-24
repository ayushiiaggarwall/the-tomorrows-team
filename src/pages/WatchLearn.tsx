
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Play, Search, Calendar, Clock, Users } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const WatchLearn = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch GD videos from media_content table
  const { data: gdVideos, isLoading: videosLoading } = useQuery({
    queryKey: ['gd-videos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('media_content')
        .select('*')
        .eq('media_type', 'video')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching videos:', error);
        return [];
      }

      return data || [];
    }
  });

  // Fetch podcast episodes from media_content table
  const { data: podcastEpisodes, isLoading: podcastsLoading } = useQuery({
    queryKey: ['podcast-episodes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('media_content')
        .select('*')
        .eq('media_type', 'podcast')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching podcasts:', error);
        return [];
      }

      return data || [];
    }
  });

  const topics = ["All", "AI", "Technology", "Society", "Career", "Mental Health", "Environment", "Education"];

  const filteredVideos = gdVideos?.filter(video => 
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const filteredPodcasts = podcastEpisodes?.filter(podcast =>
    podcast.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    podcast.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {topic}
              </Badge>
            ))}
          </div>
        </div>

        {/* Tabs for Content */}
        <Tabs defaultValue="gds" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="gds">Group Discussions</TabsTrigger>
            <TabsTrigger value="podcasts">Podcast Episodes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="gds" className="mt-8">
            {videosLoading ? (
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
            ) : !filteredVideos.length ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🎥</div>
                <h3 className="text-lg font-semibold mb-2">No Videos Available</h3>
                <p className="text-muted-foreground">
                  No group discussion videos have been published yet. Check back soon!
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVideos.map((video) => (
                  <Card key={video.id} className="feature-card overflow-hidden">
                    <div className="relative group">
                      <div className="w-full h-48 bg-muted flex items-center justify-center">
                        <Play className="w-12 h-12 text-muted-foreground" />
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
                    </div>
                    
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
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="podcasts" className="mt-8">
            {podcastsLoading ? (
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
            ) : !filteredPodcasts.length ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🎧</div>
                <h3 className="text-lg font-semibold mb-2">No Podcasts Available</h3>
                <p className="text-muted-foreground">
                  No podcast episodes have been published yet. Check back soon!
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredPodcasts.map((podcast) => (
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
                        <Button size="sm" className="btn-primary ml-4">
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
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Spotify Integration Placeholder */}
        <div className="mt-12">
          <Card className="feature-card bg-gradient-to-r from-success/10 to-primary/10">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Listen on Spotify</h3>
              <p className="text-muted-foreground mb-6">
                Access our complete podcast library and never miss an episode!
              </p>
              <Button className="btn-primary">
                Open on Spotify
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default WatchLearn;
