import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useCreatorDashboard } from '@/hooks/useCreatorDashboard';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  Plus,
  Upload,
  Link,
  Image,
  FileText,
  Video,
  Music,
  Send,
  Users,
  CheckCircle,
  Clock,
  Eye,
  Download,
  Trash2,
  Edit,
  Mail,
  Folder,
  ExternalLink,
  Loader2
} from 'lucide-react';

interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  status: 'active' | 'inactive' | 'pending';
}

export default function MediaLibrary() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'media' | 'clients'>('media');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // Form state for new media
  const [newMedia, setNewMedia] = useState({
    title: '',
    description: '',
    type: 'link' as 'image' | 'video' | 'document' | 'link' | 'audio',
    url: '',
    file: null as File | null
  });
  
  // Use authentication and data fetching hooks
  const { user } = useAuth();
  const { clients, assets, isLoading, refreshData, error } = useCreatorDashboard(user?.id || '');
  const { toast } = useToast();
  const handleDeleteAsset = async (assetId: string) => {
    const confirmed = window.confirm('Delete this media from your library?');
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', assetId);

      if (error) throw error;

      toast({ title: 'Media deleted', description: 'The item was removed from your library.' });
      await refreshData();
    } catch (err) {
      console.error('Error deleting asset:', err);
      toast({ title: 'Delete failed', description: 'Could not delete the media.', variant: 'destructive' });
    }
  };

  // Show error state if there's an error
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️ Error loading data</div>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading media library...</p>
        </div>
      </div>
    );
  }

  // Safety check for assets
  const safeAssets = assets || [];
  const safeClients = clients || [];

  const handleClientToggle = (clientId: string) => {
    setSelectedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleSendMedia = async () => {
    if (!newMedia.title || !newMedia.url) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Here you would normally save to database
      // For now, just show success message
      toast({
        title: "Success",
        description: `Media sent to ${selectedClients.length} client(s)`,
      });
      
      setIsUploadDialogOpen(false);
      setNewMedia({ title: '', description: '', type: 'link', url: '', file: null });
      setSelectedClients([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send media",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClientClick = (client: Client) => {
    setSelectedClient(client);
    setViewMode('clients');
  };

  const handleBackToMedia = () => {
    setSelectedClient(null);
    setViewMode('media');
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-5 w-5" />;
    if (fileType.startsWith('video/')) return <Video className="h-5 w-5" />;
    if (fileType.startsWith('audio/')) return <Music className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-4">
          {viewMode === 'clients' && selectedClient && (
            <Button
              variant="outline"
              onClick={handleBackToMedia}
              className="flex items-center gap-2"
            >
              ← Back to Media Library
            </Button>
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              {viewMode === 'clients' && selectedClient 
                ? `${selectedClient.name} - Media Dashboard` 
                : 'Media Library'
              }
            </h1>
            <p className="text-foreground-secondary text-sm sm:text-base">
              {viewMode === 'clients' && selectedClient
                ? `View all media shared with ${selectedClient.name} and their end user dashboard`
                : 'Manage and distribute media content to your clients'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!selectedClient && (
            <>
              <Button
                variant={viewMode === 'media' ? 'default' : 'outline'}
                onClick={() => setViewMode('media')}
                size="sm"
              >
                Media View
              </Button>
              <Button
                variant={viewMode === 'clients' ? 'default' : 'outline'}
                onClick={() => setViewMode('clients')}
                size="sm"
              >
                Clients View
              </Button>
            </>
          )}
          <Button 
            className="bg-primary hover:bg-primary-hover"
            onClick={() => setIsUploadDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Media
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Media Items</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeAssets.length}</div>
            <p className="text-xs text-muted-foreground">
              Media items in library
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeClients.length}</div>
            <p className="text-xs text-muted-foreground">
              Active clients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(safeAssets.reduce((sum, asset) => sum + (asset.file_size || 0), 0) / 1024 / 1024)}MB
            </div>
            <p className="text-xs text-muted-foreground">
              Total storage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'media' ? (
        /* Media Grid */
        safeAssets.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <Folder className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No Media Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by adding your first media item to share with clients
              </p>
              <Button onClick={() => setIsUploadDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Media
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {safeAssets.map((asset) => (
              <Card key={asset.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {getFileIcon(asset.file_type || '')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-medium truncate">
                          {asset.original_filename || asset.filename}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {asset.file_type}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {Math.round((asset.file_size || 0) / 1024)}KB
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Uploaded {new Date(asset.created_at).toLocaleDateString()}</span>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>0 views</span>
                      </div>
                    </div>
                    
                    {asset.tags && asset.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {asset.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Send className="h-3 w-3 mr-1" />
                        Send
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteAsset(asset.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : viewMode === 'clients' && selectedClient ? (
        /* Client Detail View */
        <div className="space-y-6">
          {/* Client Info Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold">
                  {selectedClient.name.charAt(0)}
                </div>
                <div>
                  <CardTitle className="text-2xl">{selectedClient.name}</CardTitle>
                  <CardDescription className="text-lg">{selectedClient.company}</CardDescription>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={selectedClient.status === 'active' ? 'default' : 'secondary'}>
                      {selectedClient.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{selectedClient.email}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Client's Media */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Media Shared with {selectedClient.name}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {safeAssets.map((asset) => (
                <Card key={asset.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          {getFileIcon(asset.file_type || '')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm font-medium truncate">
                            {asset.original_filename || asset.filename}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {asset.file_type}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Shared {new Date(asset.created_at).toLocaleDateString()}</span>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>0 views</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Clients List View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeClients.map((client) => (
            <Card 
              key={client.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleClientClick(client)}
            >
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold">
                    {client.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{client.name}</CardTitle>
                    <CardDescription>{client.company}</CardDescription>
                  </div>
                  <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                    {client.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Media shared:</span>
                    <span className="font-medium">0 items</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Media</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={newMedia.title}
                onChange={(e) => setNewMedia(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter media title"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newMedia.description}
                onChange={(e) => setNewMedia(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter media description"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={newMedia.type} onValueChange={(value: any) => setNewMedia(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="link">Link</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="url">URL *</Label>
              <Input
                id="url"
                value={newMedia.url}
                onChange={(e) => setNewMedia(prev => ({ ...prev, url: e.target.value }))}
                placeholder="Enter media URL"
              />
            </div>

            <div>
              <Label>Send to Clients</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-3">
                {safeClients.map((client) => (
                  <div key={client.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={client.id}
                      checked={selectedClients.includes(client.id)}
                      onCheckedChange={() => handleClientToggle(client.id)}
                    />
                    <Label htmlFor={client.id} className="text-sm">
                      {client.name} ({client.company})
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendMedia} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Media
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}