import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Calendar, User, Clock } from 'lucide-react';

const Blog = () => {
  const { id } = useParams();

  useEffect(() => {
    document.title = 'Blog - The Tomorrows Team';
  }, []);

  // Fetch single blog post if ID is provided
  const { data: blogPost, isLoading: blogLoading } = useQuery({
    queryKey: ['blog-post', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('blogs')
        .select(`
          *,
          profiles!blogs_author_id_fkey(full_name)
        `)
        .eq('id', id)
        .eq('status', 'published')
        .single();

      if (error) {
        console.error('Error fetching blog post:', error);
        return null;
      }

      return data;
    },
    enabled: !!id
  });

  // Fetch all published blog posts if no ID is provided
  const { data: blogPosts, isLoading: postsLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select(`
          *,
          profiles!blogs_author_id_fkey(full_name)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching blog posts:', error);
        return [];
      }

      return data || [];
    },
    enabled: !id
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const estimateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readTime} min read`;
  };

  // Single blog post view
  if (id) {
    if (blogLoading) {
      return (
        <div className="min-h-screen bg-background">
          <Navigation />
          <div className="max-w-4xl mx-auto px-4 py-20">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-muted/50 rounded w-3/4"></div>
              <div className="h-4 bg-muted/50 rounded w-1/2"></div>
              <div className="h-64 bg-muted/50 rounded"></div>
            </div>
          </div>
        </div>
      );
    }

    if (!blogPost) {
      return (
        <div className="min-h-screen bg-background">
          <Navigation />
          <div className="max-w-4xl mx-auto px-4 py-20 text-center">
            <h1 className="text-2xl font-bold mb-4">Blog Post Not Found</h1>
            <p className="text-muted-foreground mb-6">The blog post you're looking for doesn't exist or has been removed.</p>
            <Link to="/blog">
              <Button className="btn-primary">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <article className="max-w-4xl mx-auto px-4 py-20">
          <div className="mb-8">
            <Link to="/blog">
              <Button variant="ghost" className="mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
            
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              {blogPost.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-8">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{blogPost.profiles?.full_name || 'Anonymous'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(blogPost.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{estimateReadTime(blogPost.content)}</span>
              </div>
            </div>

            {blogPost.tags && blogPost.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {blogPost.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {blogPost.featured_image_url && (
              <img 
                src={blogPost.featured_image_url} 
                alt={blogPost.title}
                className="w-full h-64 md:h-96 object-cover rounded-lg mb-8"
              />
            )}
          </div>

          <div className="prose prose-lg max-w-none">
            <div 
              className="text-foreground leading-relaxed"
              style={{ whiteSpace: 'pre-wrap' }}
            >
              {blogPost.content}
            </div>
          </div>
        </article>

        <Footer />
      </div>
    );
  }

  // Blog listing view
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Our Blog
          </h1>
          <p className="text-xl text-muted-foreground">
            Insights, tips, and stories to help you master communication skills
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {postsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6 space-y-4">
                    <div className="h-4 bg-muted/50 rounded w-3/4"></div>
                    <div className="h-4 bg-muted/50 rounded w-1/2"></div>
                    <div className="h-20 bg-muted/50 rounded"></div>
                    <div className="h-8 bg-muted/50 rounded w-1/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !blogPosts?.length ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-semibold mb-2">No Blog Posts Yet</h3>
              <p className="text-muted-foreground mb-4">
                Check back soon for new articles and insights!
              </p>
              <Link to="/resources">
                <Button className="btn-primary">Explore Resources</Button>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <Card key={post.id} className="feature-card group hover:shadow-lg transition-shadow">
                  <CardHeader>
                    {post.featured_image_url && (
                      <img 
                        src={post.featured_image_url} 
                        alt={post.title}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    )}
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {post.title}
                    </CardTitle>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{formatDate(post.created_at)}</span>
                      <span>{estimateReadTime(post.content)}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {post.content.substring(0, 150)}...
                    </p>
                    
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {post.tags.slice(0, 3).map((tag: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        By {post.profiles?.full_name || 'Anonymous'}
                      </span>
                      <Link to={`/blog/${post.id}`}>
                        <Button variant="outline" size="sm">
                          Read More
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
