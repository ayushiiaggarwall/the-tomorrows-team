import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mic, Plus, Edit, Trash, Video, Upload, Image } from 'lucide-react';

interface MediaContent {
  id: string;
  title: string;
  description: string | null;
  media_url: string;
  media_type: string;
  tags: string[] | null;
  is_published: boolean;
  created_at: string;
  thumbnail_url: string | null;
}

const MediaManager = () => {
  const [mediaContent, setMediaContent] = useState<MediaContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    media_url: '',
    media_type: 'video',
    tags: '',
    is_published: false,
    add_to_podcast: false,
    add_to_past_gd: false,
    thumbnail_url: ''
  });
  const { toast } = useToast();

  const fetchMediaContent = async () => {
    try {
      const { data, error } = await supabase
        .from('media_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMediaContent(data || []);
    } catch (error) {
      console.error('Error fetching media content:', error);
    }
  };

  useEffect(() => {
    fetchMediaContent();
  }, []);

  const handleThumbnailUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingThumbnail(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `thumbnails/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media-thumbnails')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media-thumbnails')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, thumbnail_url: publicUrl }));

      toast({
        title: "Success",
        description: "Thumbnail uploaded successfully"
      });
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      toast({
        title: "Error",
        description: "Failed to upload thumbnail",
        variant: "destructive"
      });
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let mediaType = formData.media_type;
      if (formData.add_to_podcast) mediaType = 'podcast';
      if (formData.add_to_past_gd) mediaType = 'past_gd';

      const mediaData = {
        title: formData.title,
        description: formData.description || null,
        media_url: formData.media_url,
        media_type: mediaType,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : null,
        is_published: formData.is_published,
        thumbnail_url: formData.thumbnail_url || null
      };

      if (editingId) {
        const { error } = await supabase
          .from('media_content')
          .update(mediaData)
          .eq('id', editingId);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Media content updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('media_content')
          .insert([{ ...mediaData, created_by: (await supabase.auth.getUser()).data.user?.id }]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Media content added successfully"
        });
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        media_url: '',
        media_type: 'video',
        tags: '',
        is_published: false,
        add_to_podcast: false,
        add_to_past_gd: false,
        thumbnail_url: ''
      });
      setEditingId(null);
      fetchMediaContent();

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save media content",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (media: MediaContent) => {
    setFormData({
      title: media.title,
      description: media.description || '',
      media_url: media.media_url,
      media_type: media.media_type,
      tags: media.tags?.join(', ') || '',
      is_published: media.is_published,
      add_to_podcast: media.media_type === 'podcast',
      add_to_past_gd: media.media_type === 'past_gd',
      thumbnail_url: media.thumbnail_url || ''
    });
    setEditingId(media.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media content?')) return;

    try {
      const { error } = await supabase
        .from('media_content')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Media content deleted successfully"
      });
      
      fetchMediaContent();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete media content",
        variant: "destructive"
      });
    }
  };

  const togglePublishStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('media_content')
        .update({ is_published: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Media ${!currentStatus ? 'published' : 'unpublished'} successfully`
      });
      
      fetchMediaContent();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update publish status",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5" />
            {editingId ? 'Edit Media Content' : 'Add New Media Content'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="GD Session: AI in Healthcare"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="media_url">Video/Podcast Link</Label>
              <Input
                id="media_url"
                type="url"
                placeholder="https://youtube.com/watch?v=... or https://open.spotify.com/..."
                value={formData.media_url}
                onChange={(e) => setFormData(prev => ({ ...prev, media_url: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="thumbnail">Thumbnail Image</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    id="thumbnail-file"
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    disabled={uploadingThumbnail}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('thumbnail-file')?.click()}
                    disabled={uploadingThumbnail}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadingThumbnail ? 'Uploading...' : 'Upload Thumbnail'}
                  </Button>
                </div>
                {formData.thumbnail_url && (
                  <div className="flex items-center gap-2">
                    <img 
                      src={formData.thumbnail_url} 
                      alt="Thumbnail preview" 
                      className="w-20 h-12 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, thumbnail_url: '' }))}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the content..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  placeholder="AI, Healthcare, Technology"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="media_type">Media Type</Label>
                <Select value={formData.media_type} onValueChange={(value) => setFormData(prev => ({ ...prev, media_type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="podcast">Podcast</SelectItem>
                    <SelectItem value="past_gd">Past GD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked as boolean }))}
                />
                <Label htmlFor="is_published">Publish immediately</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="add_to_podcast"
                  checked={formData.add_to_podcast}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, add_to_podcast: checked as boolean }))}
                />
                <Label htmlFor="add_to_podcast">Add to Podcast Section</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="add_to_past_gd"
                  checked={formData.add_to_past_gd}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, add_to_past_gd: checked as boolean }))}
                />
                <Label htmlFor="add_to_past_gd">Add to Past GD Section</Label>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                <Plus className="w-4 h-4 mr-2" />
                {editingId ? 'Update Media' : 'Add Media'}
              </Button>
              {editingId && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setEditingId(null);
                    setFormData({
                      title: '',
                      description: '',
                      media_url: '',
                      media_type: 'video',
                      tags: '',
                      is_published: false,
                      add_to_podcast: false,
                      add_to_past_gd: false,
                      thumbnail_url: ''
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
          <CardTitle>All Media Content</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mediaContent.map((media) => (
                <TableRow key={media.id}>
                  <TableCell className="font-medium">{media.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {media.media_type}
                    </Badge>
                  </TableCell>
                  <TableCell>{media.tags?.join(', ') || 'None'}</TableCell>
                  <TableCell>
                    <Badge variant={media.is_published ? "default" : "secondary"}>
                      {media.is_published ? 'Published' : 'Draft'}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(media.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePublishStatus(media.id, media.is_published)}
                      >
                        {media.is_published ? 'Unpublish' : 'Publish'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(media)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(media.id)}
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

export default MediaManager;
