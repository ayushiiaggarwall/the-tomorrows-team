import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Calendar, User, Clock, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Blog = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Blog - The Tomorrows Team';
  }, []);

  // Redirect to login if trying to view a specific blog post without authentication
  useEffect(() => {
    if (id && !user) {
      navigate('/login', { 
        state: { from: { pathname: `/blog/${id}` } }
      });
    }
  }, [id, user, navigate]);

  // Fetch single blog post if ID is provided
  const { data: blogPost, isLoading: blogLoading } = useQuery({
    queryKey: ['blog-post', id],
    queryFn: async () => {
      if (!id) return null;
      
      console.log('Fetching single blog post with ID:', id);
      
      // First get the blog
      const { data: blogData, error: blogError } = await supabase
        .from('blogs')
        .select('id, title, content, featured_image_url, tags, created_at, author_id')
        .eq('id', id)
        .eq('status', 'published')
        .single();

      if (blogError) {
        console.error('Error fetching blog post:', blogError);
        return null;
      }

      if (!blogData) {
        console.log('No blog found with ID:', id);
        return null;
      }

      // Then get author details
      const { data: authorData } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', blogData.author_id)
        .single();

      const result = {
        ...blogData,
        author_name: authorData?.full_name || 'Anonymous'
      };

      console.log('Fetched single blog with author:', result);
      return result;
    },
    enabled: !!id && !!user // Only fetch if user is authenticated
  });

  // Fetch all published blog posts if no ID is provided
  const { data: blogPosts, isLoading: postsLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: async () => {
      console.log('Fetching all blog posts...');
      
      // First get the blogs
      const { data: blogsData, error: blogsError } = await supabase
        .from('blogs')
        .select('id, title, content, featured_image_url, tags, created_at, author_id')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (blogsError) {
        console.error('Error fetching blog posts:', blogsError);
        return [];
      }

      // Then get author details for each blog
      const blogsWithAuthors = await Promise.all(
        (blogsData || []).map(async (blog) => {
          const { data: authorData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', blog.author_id)
            .single();

          return {
            ...blog,
            author_name: authorData?.full_name || 'Anonymous'
          };
        })
      );

      console.log('Fetched all blogs with authors:', blogsWithAuthors);
      return blogsWithAuthors || [];
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
    // Show authentication required message if not logged in
    if (!user) {
      return (
        <div className="min-h-screen bg-background">
          <Navigation />
          <div className="max-w-4xl mx-auto px-4 py-20 text-center">
            <Lock className="w-16 h-16 text-primary mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Sign In Required</h1>
            <p className="text-muted-foreground mb-6 text-lg">
              Please sign in to read our exclusive articles and content.
            </p>
            <div className="space-y-4">
              <Link to="/login" state={{ from: { pathname: `/blog/${id}` } }}>
                <Button className="btn-primary mr-4">
                  Sign In to Read
                </Button>
              </Link>
              <Link to="/blog">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Blog List
                </Button>
              </Link>
            </div>
          </div>
        </div>
      );
    }

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
                <span>{blogPost.author_name}</span>
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

          <div className="prose prose-lg max-w-none dark:prose-invert text-foreground leading-relaxed">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => <h1 className="text-3xl font-bold mb-6 text-foreground">{children}</h1>,
                h2: ({ children }) => <h2 className="text-2xl font-semibold mb-4 mt-8 text-foreground">{children}</h2>,
                h3: ({ children }) => <h3 className="text-xl font-medium mb-3 mt-6 text-foreground">{children}</h3>,
                p: ({ children }) => <p className="mb-4 text-foreground leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="mb-4 list-disc list-inside space-y-2 text-foreground">{children}</ul>,
                ol: ({ children }) => <ol className="mb-4 list-decimal list-inside space-y-2 text-foreground">{children}</ol>,
                li: ({ children }) => <li className="text-foreground">{children}</li>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary pl-4 italic my-6 text-muted-foreground bg-muted/50 py-2 rounded-r">
                    {children}
                  </blockquote>
                ),
                code: ({ children, className }) => {
                  const isInline = !className;
                  return isInline ? (
                    <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground">
                      {children}
                    </code>
                  ) : (
                    <code className="block bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono text-foreground whitespace-pre">
                      {children}
                    </code>
                  );
                },
                a: ({ href, children }) => (
                  <a 
                    href={href} 
                    className="text-primary hover:text-primary/80 underline font-medium"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                em: ({ children }) => <em className="italic text-foreground">{children}</em>,
              }}
            >
              {blogPost.content}
            </ReactMarkdown>
          </div>
        </article>

        <Footer />
      </div>
    );
  }

  // Blog listing view
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Leadership & Communication Blog - The Tomorrows Team"
        description="Read expert insights on leadership development, communication skills, and group discussion strategies. Stay updated with tips and articles from The Tomorrows Team."
        keywords="leadership blog, communication articles, group discussion insights, public speaking tips, professional development blog, leadership skills"
        url="/blog"
        type="website"
      />
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
                        By {post.author_name}
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
