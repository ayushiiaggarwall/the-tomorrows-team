
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, Plus, Edit, Trash, Calendar } from 'lucide-react';

interface Blog {
  id: string;
  title: string;
  content: string;
  featured_image_url: string | null;
  tags: string[] | null;
  status: string;
  scheduled_date: string | null;
  created_at: string;
  author_name?: string;
  author_email?: string;
}

const BlogManager = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    featured_image_url: '',
    tags: '',
    status: 'draft',
    scheduled_date: ''
  });
  const { toast } = useToast();

  const fetchBlogs = async () => {
    try {
      const { data: blogData, error: blogError } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });

      if (blogError) throw blogError;

      // Get author details for each blog
      const blogsWithAuthors = await Promise.all(
        (blogData || []).map(async (blog) => {
          const { data: authorData } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', blog.author_id)
            .single();

          return {
            ...blog,
            author_name: authorData?.full_name || 'Unknown',
            author_email: authorData?.email || ''
          };
        })
      );

      setBlogs(blogsWithAuthors);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const blogData = {
        title: formData.title,
        content: formData.content,
        featured_image_url: formData.featured_image_url || null,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : null,
        status: formData.status,
        scheduled_date: formData.scheduled_date || null
      };

      if (editingId) {
        const { error } = await supabase
          .from('blogs')
          .update(blogData)
          .eq('id', editingId);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Blog updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('blogs')
          .insert([{ ...blogData, author_id: (await supabase.auth.getUser()).data.user?.id }]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Blog created successfully"
        });
      }

      // Reset form
      setFormData({
        title: '',
        content: '',
        featured_image_url: '',
        tags: '',
        status: 'draft',
        scheduled_date: ''
      });
      setEditingId(null);
      fetchBlogs();

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save blog",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (blog: Blog) => {
    setFormData({
      title: blog.title,
      content: blog.content,
      featured_image_url: blog.featured_image_url || '',
      tags: blog.tags?.join(', ') || '',
      status: blog.status,
      scheduled_date: blog.scheduled_date ? new Date(blog.scheduled_date).toISOString().slice(0, 16) : ''
    });
    setEditingId(blog.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;

    try {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Blog deleted successfully"
      });
      
      fetchBlogs();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete blog",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            {editingId ? 'Edit Blog Post' : 'Create New Blog Post'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Blog Title</Label>
              <Input
                id="title"
                placeholder="5 Tips for Better Group Discussions"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="featured_image_url">Featured Image URL</Label>
              <Input
                id="featured_image_url"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={formData.featured_image_url}
                onChange={(e) => setFormData(prev => ({ ...prev, featured_image_url: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Write your blog content here..."
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={10}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  placeholder="GD Tips, Public Speaking, Confidence"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {formData.status === 'scheduled' && (
                <div>
                  <Label htmlFor="scheduled_date">Publish Date</Label>
                  <Input
                    id="scheduled_date"
                    type="datetime-local"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                  />
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                <Plus className="w-4 h-4 mr-2" />
                {editingId ? 'Update Blog' : 'Create Blog'}
              </Button>
              {editingId && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setEditingId(null);
                    setFormData({
                      title: '',
                      content: '',
                      featured_image_url: '',
                      tags: '',
                      status: 'draft',
                      scheduled_date: ''
                    });
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Blog Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blogs.map((blog) => (
                <TableRow key={blog.id}>
                  <TableCell className="font-medium">{blog.title}</TableCell>
                  <TableCell>{blog.author_name || 'Unknown'}</TableCell>
                  <TableCell>
                    <Badge variant={blog.status === 'published' ? "default" : "secondary"}>
                      {blog.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{blog.tags?.join(', ') || 'None'}</TableCell>
                  <TableCell>{new Date(blog.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(blog)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(blog.id)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogManager;
