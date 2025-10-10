import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Image as ImageIcon, FileText, Download, Video, File, FileImage } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ClientPortalMediaProps {
  projectId: string;
}

const ClientPortalMedia: React.FC<ClientPortalMediaProps> = ({ projectId }) => {
  const [loading, setLoading] = useState(true);
  const [media, setMedia] = useState<any[]>([]);

  useEffect(() => {
    loadMedia();
  }, [projectId]);

  const loadMedia = async () => {
    try {
      setLoading(true);

      // Get assets for this project (RLS will automatically filter by project_id)
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMedia(data || []);
    } catch (error) {
      console.error('Error loading media:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (media.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No media files yet</h3>
            <p className="text-muted-foreground">
              Media assets for your virtual tour will appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Media Library</CardTitle>
          <CardDescription>
            View and download media assets for your virtual tour
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {media.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="aspect-video bg-muted flex items-center justify-center">
                  {item.file_type.startsWith('image/') ? (
                    <img
                      src={item.thumbnail_url || item.file_url}
                      alt={item.original_filename}
                      className="w-full h-full object-cover"
                    />
                  ) : item.file_type.startsWith('video/') ? (
                    <Video className="h-12 w-12 text-muted-foreground" />
                  ) : item.file_type.startsWith('application/pdf') ? (
                    <FileText className="h-12 w-12 text-muted-foreground" />
                  ) : (
                    <File className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                <CardContent className="p-4">
                  <h4 className="font-semibold text-sm truncate mb-2">
                    {item.original_filename}
                  </h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    {(item.file_size / 1024).toFixed(1)} KB
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    asChild
                  >
                    <a href={item.file_url} download={item.original_filename}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientPortalMedia;



