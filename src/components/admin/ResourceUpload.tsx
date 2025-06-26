
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, FileText } from 'lucide-react';
import { useDownloadableResources } from '@/hooks/useDownloadableResources';

const ResourceUpload = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const { uploadResource } = useDownloadableResources();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) return;

    uploadResource.mutate({
      file,
      title: title.trim(),
      description: description.trim() || undefined
    });

    // Reset form
    setTitle('');
    setDescription('');
    setFile(null);
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload Resource
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter resource title"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter resource description"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="file-upload">File *</Label>
            <Input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt"
              required
            />
            {file && (
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="w-4 h-4" />
                <span>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            disabled={uploadResource.isPending || !file || !title.trim()}
            className="w-full"
          >
            {uploadResource.isPending ? 'Uploading...' : 'Upload Resource'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ResourceUpload;
