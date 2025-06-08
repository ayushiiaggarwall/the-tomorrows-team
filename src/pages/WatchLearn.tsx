
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Play, Search, Calendar, Clock, Users } from 'lucide-react';
import { useState } from 'react';

const WatchLearn = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const gdVideos = [
    {
      id: 1,
      title: "AI in Education: Boon or Bane?",
      date: "Jan 5, 2025",
      duration: "45 min",
      participants: 18,
      tags: ["AI", "Education", "Technology"],
      thumbnail: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=400&h=225"
    },
    {
      id: 2,
      title: "Mental Health in Modern Workplaces",
      date: "Dec 29, 2024",
      duration: "52 min",
      participants: 16,
      tags: ["Mental Health", "Career", "Society"],
      thumbnail: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&h=225"
    },
    {
      id: 3,
      title: "Social Media: Connecting or Isolating?",
      date: "Dec 22, 2024",
      duration: "38 min",
      participants: 20,
      tags: ["Social Media", "Society", "Technology"],
      thumbnail: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=400&h=225"
    },
    {
      id: 4,
      title: "Climate Change: Individual vs Corporate Action",
      date: "Dec 15, 2024",
      duration: "48 min",
      participants: 19,
      tags: ["Environment", "Society", "Policy"],
      thumbnail: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=400&h=225"
    },
    {
      id: 5,
      title: "The Future of Remote Work",
      date: "Dec 8, 2024",
      duration: "42 min",
      participants: 17,
      tags: ["Career", "Technology", "Society"],
      thumbnail: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=400&h=225"
    },
    {
      id: 6,
      title: "Cryptocurrency: Revolution or Bubble?",
      date: "Dec 1, 2024",
      duration: "55 min",
      participants: 15,
      tags: ["Finance", "Technology", "Economy"],
      thumbnail: "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?auto=format&fit=crop&w=400&h=225"
    }
  ];

  const podcastEpisodes = [
    {
      id: 1,
      title: "Mastering the Art of Persuasion",
      date: "Jan 3, 2025",
      duration: "28 min",
      description: "Learn techniques to make your arguments more compelling and persuasive.",
      tags: ["Communication", "Skills"]
    },
    {
      id: 2,
      title: "Overcoming Speaking Anxiety",
      date: "Dec 27, 2024",
      duration: "24 min",
      description: "Practical tips to build confidence and reduce nervousness in group discussions.",
      tags: ["Confidence", "Mental Health"]
    },
    {
      id: 3,
      title: "The Power of Active Listening",
      date: "Dec 20, 2024",
      duration: "32 min",
      description: "Why listening is just as important as speaking in effective communication.",
      tags: ["Listening", "Communication"]
    },
    {
      id: 4,
      title: "Building Logical Arguments",
      date: "Dec 13, 2024",
      duration: "35 min",
      description: "Structure your thoughts and present evidence-based arguments effectively.",
      tags: ["Logic", "Critical Thinking"]
    }
  ];

  const topics = ["All", "AI", "Technology", "Society", "Career", "Mental Health", "Environment", "Education"];

  const filteredVideos = gdVideos.filter(video => 
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredPodcasts = podcastEpisodes.filter(podcast =>
    podcast.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    podcast.description.toLowerCase().includes(searchTerm.toLowerCase())
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((video) => (
                <Card key={video.id} className="feature-card overflow-hidden">
                  <div className="relative group">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button size="sm" className="btn-primary">
                        <Play className="w-4 h-4 mr-2" />
                        Watch
                      </Button>
                    </div>
                    <div className="absolute top-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2">{video.title}</h3>
                    
                    <div className="flex items-center text-sm text-muted-foreground mb-3 space-x-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {video.date}
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {video.participants}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {video.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="podcasts" className="mt-8">
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
                            {podcast.date}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {podcast.duration}
                          </div>
                        </div>
                      </div>
                      <Button size="sm" className="btn-primary ml-4">
                        <Play className="w-4 h-4 mr-2" />
                        Play
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{podcast.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {podcast.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
