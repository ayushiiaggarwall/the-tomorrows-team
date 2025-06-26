import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, CheckCircle, Lightbulb, MessageSquare, Download, ExternalLink } from 'lucide-react';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDownloadableResources } from '@/hooks/useDownloadableResources';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Resources = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { resources, downloadResource } = useDownloadableResources();

  useEffect(() => {
    document.title = 'Resources - The Tomorrows Team';
  }, []);

  const handleDownload = (resourceId: string) => {
    if (!user) {
      toast.error('Please log in to download resources');
      navigate('/login');
      return;
    }
    downloadResource.mutate(resourceId);
  };

  // Fetch latest blog posts
  const { data: latestBlogs } = useQuery({
    queryKey: ['latest-blogs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select(`
          *,
          profiles!blogs_author_id_fkey(full_name)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Error fetching latest blogs:', error);
        return [];
      }

      return data || [];
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const estimateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readTime} min read`;
  };

  const gdDosDonts = {
    dos: [
      "Listen actively to other participants",
      "Speak clearly and at moderate pace",
      "Support your points with examples or data",
      "Maintain eye contact and confident body language",
      "Give others a chance to speak",
      "Stay relevant to the topic",
      "Be respectful of different viewpoints",
      "Conclude your points effectively"
    ],
    donts: [
      "Don't interrupt others while they're speaking",
      "Don't make personal attacks or use offensive language",
      "Don't dominate the entire discussion",
      "Don't go off-topic or digress too much",
      "Don't be overly aggressive or confrontational",
      "Don't remain completely silent",
      "Don't fidget or show disinterest",
      "Don't make statements without backing them up"
    ]
  };

  const sampleAnswers = [
    {
      topic: "Should social media platforms be regulated?",
      answer: "I believe social media regulation is necessary but should be balanced. Platforms like Facebook and Twitter have immense influence on public opinion, as we saw during elections and the pandemic. However, over-regulation could stifle free speech. A middle ground would be requiring transparency in algorithms and fact-checking mechanisms while preserving the right to express opinions."
    },
    {
      topic: "Is remote work the future of employment?",
      answer: "Remote work is definitely part of the future, but not the complete picture. The pandemic proved that many jobs can be done effectively from home, increasing productivity and work-life balance. However, collaboration, mentorship, and company culture benefit from in-person interactions. I think a hybrid model combining remote flexibility with periodic office presence will become the new normal."
    },
    {
      topic: "Should college education be free?",
      answer: "Free college education has merits but also challenges. Countries like Germany and Norway show it can increase access to higher education and reduce inequality. However, funding such programs requires significant public investment. Perhaps a compromise like income-based repayment plans or free community college could provide benefits while maintaining sustainability. The key is ensuring quality education remains accessible to all economic backgrounds."
    }
  ];

  const interviewTips = [
    {
      title: "Structure Your Responses",
      content: "Use the STAR method (Situation, Task, Action, Result) for behavioral questions. This gives your answers a clear beginning, middle, and end."
    },
    {
      title: "Research Thoroughly",
      content: "Know the company's values, recent news, and industry trends. This shows genuine interest and helps you ask thoughtful questions."
    },
    {
      title: "Practice Active Listening",
      content: "Listen carefully to the complete question before responding. It's okay to take a moment to think before answering."
    },
    {
      title: "Prepare Questions",
      content: "Have thoughtful questions ready about the role, team dynamics, and company culture. This demonstrates your serious interest."
    }
  ];

  const speakingTips = [
    {
      title: "Control Your Pace",
      content: "Speak slowly and clearly. Nervousness often makes us rush, but deliberate pacing shows confidence and helps your audience follow your thoughts."
    },
    {
      title: "Use the Power of Pause",
      content: "Strategic pauses give you time to think and emphasize important points. They're more effective than filler words like 'um' or 'like'."
    },
    {
      title: "Tell Stories",
      content: "Humans connect with narratives. Frame your points as brief stories or examples to make them more memorable and engaging."
    },
    {
      title: "Practice Breathing",
      content: "Deep breathing before speaking calms nerves and provides steady airflow for strong vocal projection. Practice diaphragmatic breathing."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Master the Art of Speaking
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Explore tips, techniques, and templates to improve your communication skills. Learn how to structure responses, think on your feet, and lead discussions.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        <Tabs defaultValue="gd-tips" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="gd-tips">GD Tips</TabsTrigger>
            <TabsTrigger value="sample-answers">Sample Answers</TabsTrigger>
            <TabsTrigger value="interview-prep">Interview Prep</TabsTrigger>
            <TabsTrigger value="speaking-tips">Speaking Tips</TabsTrigger>
          </TabsList>
          
          {/* GD Do's & Don'ts */}
          <TabsContent value="gd-tips" className="mt-8">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="feature-card">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-success flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Do's for Group Discussions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {gdDosDonts.dos.map((item, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <CheckCircle className="w-4 h-4 text-success mt-1 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="feature-card">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-destructive flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Don'ts for Group Discussions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {gdDosDonts.donts.map((item, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-4 h-4 border-2 border-destructive rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                          <div className="w-2 h-0.5 bg-destructive"></div>
                        </div>
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="feature-card mt-8">
              <CardHeader>
                <CardTitle className="text-xl font-bold">GD Structure Template</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-primary font-bold">1</span>
                    </div>
                    <h4 className="font-semibold mb-2">Opening</h4>
                    <p className="text-sm text-muted-foreground">State your position clearly and provide a brief overview of your main points.</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-primary font-bold">2</span>
                    </div>
                    <h4 className="font-semibold mb-2">Supporting Points</h4>
                    <p className="text-sm text-muted-foreground">Present 2-3 strong arguments with examples, data, or real-world evidence.</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-primary font-bold">3</span>
                    </div>
                    <h4 className="font-semibold mb-2">Conclusion</h4>
                    <p className="text-sm text-muted-foreground">Summarize your stance and acknowledge valid counterpoints if appropriate.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sample Answers */}
          <TabsContent value="sample-answers" className="mt-8">
            <div className="space-y-6">
              {sampleAnswers.map((sample, index) => (
                <Card key={index} className="feature-card">
                  <CardHeader>
                    <CardTitle className="text-lg">{sample.topic}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed italic">
                      "{sample.answer}"
                    </p>
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm font-medium mb-1">Analysis:</p>
                      <p className="text-sm text-muted-foreground">
                        This answer demonstrates balanced thinking, uses specific examples, acknowledges multiple perspectives, and provides a practical solution.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Interview Prep */}
          <TabsContent value="interview-prep" className="mt-8">
            <div className="grid md:grid-cols-2 gap-6">
              {interviewTips.map((tip, index) => (
                <Card key={index} className="feature-card">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Lightbulb className="w-5 h-5 mr-2 text-primary" />
                      {tip.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{tip.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="feature-card mt-8">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Common Interview Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-3">Behavioral Questions</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Tell me about a time you faced a challenge</li>
                      <li>• Describe a situation where you worked in a team</li>
                      <li>• Give an example of when you showed leadership</li>
                      <li>• How do you handle conflicts at work?</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Technical/Role-specific</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• What are your greatest strengths?</li>
                      <li>• Why do you want this position?</li>
                      <li>• Where do you see yourself in 5 years?</li>
                      <li>• Why should we hire you?</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Speaking Tips */}
          <TabsContent value="speaking-tips" className="mt-8">
            <div className="grid md:grid-cols-2 gap-6">
              {speakingTips.map((tip, index) => (
                <Card key={index} className="feature-card">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <BookOpen className="w-5 h-5 mr-2 text-primary" />
                      {tip.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{tip.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="feature-card mt-8">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Voice Training Exercises</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Breathing Exercise</h4>
                    <p className="text-sm text-muted-foreground">Practice 4-7-8 breathing: Inhale for 4 counts, hold for 7, exhale for 8. Repeat 3-4 times before speaking.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Tongue Twisters</h4>
                    <p className="text-sm text-muted-foreground">Practice "Red leather, yellow leather" and "She sells seashells" to improve articulation and clarity.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Volume Control</h4>
                    <p className="text-sm text-muted-foreground">Practice speaking at different volumes while maintaining clarity. Record yourself to monitor consistency.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Latest Blog Posts Section - Now with real data */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Latest Articles</h2>
            <Link to="/blog">
              <Button variant="outline">View All Articles</Button>
            </Link>
          </div>
          
          {!latestBlogs?.length ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-semibold mb-2">No Articles Yet</h3>
              <p className="text-muted-foreground mb-4">
                Check back soon for new articles and insights!
              </p>
              <Link to="/blog">
                <Button className="btn-primary">Visit Blog</Button>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {latestBlogs.map((post) => (
                <Card key={post.id} className="feature-card">
                  <CardHeader>
                    <CardTitle className="text-lg">{post.title}</CardTitle>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{formatDate(post.created_at)}</span>
                      <span>{estimateReadTime(post.content)}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {post.content.substring(0, 100)}...
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        By {(post.profiles as any)?.full_name || 'Anonymous'}
                      </span>
                      <Link to={`/blog/${post.id}`}>
                        <Button variant="outline" size="sm">
                          Read More
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Download Resources Section */}
        {resources && resources.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center mb-8">Download Resources</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((resource) => (
                <Card key={resource.id} className="feature-card">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Download className="w-8 h-8 text-primary" />
                      <div>
                        <h3 className="font-semibold">{resource.title}</h3>
                        {resource.description && (
                          <p className="text-sm text-muted-foreground">{resource.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {resource.download_count} downloads
                      </span>
                      <Button 
                        onClick={() => handleDownload(resource.id)}
                        disabled={downloadResource.isPending}
                        size="sm"
                      >
                        {downloadResource.isPending ? 'Downloading...' : 'Download'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Default Download Guide (fallback when no resources are uploaded) */}
        {(!resources || resources.length === 0) && (
          <Card className="feature-card mt-12 bg-gradient-to-r from-primary/10 to-accent/10">
            <CardContent className="p-8 text-center">
              <Download className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">Download Our Complete Guide</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Get our comprehensive PDF guide with all GD tips, sample answers, and speaking techniques in one convenient document.
              </p>
              <Button 
                className="btn-primary"
                onClick={() => {
                  if (!user) {
                    toast.error('Please log in to download resources');
                    navigate('/login');
                  } else {
                    toast.info('No resources available for download at the moment');
                  }
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Free Guide
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Resources;
