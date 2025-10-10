import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ClientProjectCard from '@/components/ClientProjectCard';
import NewProjectModal from '@/components/NewProjectModal';
import ChatbotRequestForm from '@/components/ChatbotRequestForm';
import { useCreatorDashboard } from '@/hooks/useCreatorDashboard';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ShareClientPortal from './ShareClientPortal';
import { 
  Plus, 
  Search, 
  BarChart3, 
  Users, 
  TrendingUp,
  Activity,
  Bot,
  Eye,
  MessageSquare,
  Calendar,
  Settings,
  Loader2
} from 'lucide-react';
import { TEXT } from '@/constants/text';

interface TourVirtualiProps {
  onPageChange?: (page: string) => void;
  onCreateRequest?: (requestData: any) => void;
  onClientClick?: (client: any) => void;
}

const TourVirtuali = ({
  onPageChange,
  onCreateRequest,
  onClientClick
}: TourVirtualiProps) => {
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [selectedProjectForSharing, setSelectedProjectForSharing] = useState<any>(null);
  
  // Use authentication and data fetching hooks
  const { user } = useAuth();
  const { clients, projects, chatbots, analytics, isLoading, error, refreshData } = useCreatorDashboard(user?.id || '');
  
  // Transform database data to match the expected format
  const [clientProjects, setClientProjects] = useState<any[]>([]);

  // Production ready - No demo data
  // Users start with a clean slate


  // Transform database data to match the expected format
  useEffect(() => {
    try {
      if (!isLoading) {
        if (projects && projects.length > 0) {
          // Use real database data
          const transformedProjects = projects.map(project => {
            const client = clients?.find(c => c.id === project.end_client_id);
            const projectChatbots = chatbots?.filter(cb => cb.project_id === project.id) || [];
            const projectAnalytics = analytics?.filter(a => a.project_id === project.id) || [];
            
            // Calculate analytics totals with safety checks
            const totalViews = projectAnalytics
              .filter(a => a.metric_type === 'view')
              .reduce((sum, a) => sum + (a.metric_value || 0), 0);
            
            const uniqueVisitors = projectAnalytics
              .filter(a => a.metric_type === 'unique_visitor')
              .reduce((sum, a) => sum + (a.metric_value || 0), 0);
            
            const sessionDurationRecords = projectAnalytics.filter(a => a.metric_type === 'session_duration');
            const avgSessionDuration = sessionDurationRecords.length > 0 
              ? sessionDurationRecords.reduce((sum, a) => sum + (a.metric_value || 0), 0) / sessionDurationRecords.length
              : 0;
            
            const conversionRecords = projectAnalytics.filter(a => a.metric_type === 'conversion');
            const conversionRate = totalViews > 0 && conversionRecords.length > 0
              ? (conversionRecords.reduce((sum, a) => sum + (a.metric_value || 0), 0) / totalViews) * 100
              : 0;
            
            // Get the primary chatbot for this project
            const primaryChatbot = projectChatbots[0];
            
            return {
              id: project.id,
              client: {
                name: client?.name || 'Unknown Client',
                email: client?.email || '',
                company: client?.company || 'Unknown Company',
                avatar: '',
                phone: client?.phone || '',
                website: client?.website || ''
              },
              project: {
                title: project.title || 'Untitled Project',
                description: project.description || `A ${project.project_type || 'virtual_tour'} project`,
                type: project.project_type || 'virtual_tour',
                category: project.category || 'other',
                status: project.status || 'setup',
                thumbnail_url: project.thumbnail_url || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
                created_at: project.created_at || new Date().toISOString(),
                updated_at: project.updated_at || new Date().toISOString()
              },
              chatbot: primaryChatbot ? {
                name: primaryChatbot.name || 'Assistant',
                isActive: primaryChatbot.is_active || false,
                conversations: primaryChatbot.total_conversations || 0,
                satisfaction: primaryChatbot.satisfaction_score || 0,
                language: primaryChatbot.language || 'en',
                welcomeMessage: primaryChatbot.welcome_message || 'Hello! How can I help you today?',
                fallbackMessage: primaryChatbot.fallback_message || 'I apologize, but I need more information to help you.'
              } : null,
              analytics: {
                totalViews: totalViews || 0,
                uniqueVisitors: uniqueVisitors || 0,
                avgSessionDuration: isNaN(avgSessionDuration) ? '0m 0s' : `${Math.floor(avgSessionDuration / 60)}m ${Math.floor(avgSessionDuration % 60)}s`,
                conversionRate: isNaN(conversionRate) ? 0 : Math.round(conversionRate * 100) / 100,
                lastActivity: project.updated_at || new Date().toISOString(),
                pageViews: totalViews * 1.8, // Estimate
                bounceRate: 0, // Production ready - no random data
                avgPagesPerSession: 0 // Production ready - no random data
              },
              createdAt: project.created_at || new Date().toISOString(),
              lastActivity: project.updated_at || new Date().toISOString()
            };
          });
          
          setClientProjects(transformedProjects);
        } else {
          // Show empty state for new users - production ready
          setClientProjects([]);
        }
      }
    } catch (error) {
      console.error('Error transforming project data:', error);
      // Show empty state on error - production ready
      setClientProjects([]);
    }
  }, [isLoading, clients, projects, chatbots, analytics]);

  const handleCreateRequest = (project: any) => {
    if (onCreateRequest) {
      onCreateRequest({
        title: `Request for ${project.title}`,
        description: `I would like to request modifications for the project: ${project.title}`,
        type: 'MODIFY',
        priority: 'normal',
        clientName: project.client_name,
        hotspotData: {
          name: project.title,
          position: 'Main area',
          type: 'Information'
        }
      });
    }
  };

  const handleNewProjectCreated = async (newProject: any) => {
    // Refresh data from database to get the latest projects
    await refreshData();
    // Close modal
    setIsNewProjectModalOpen(false);
  };

  const handleSharePortal = (project: any) => {
    setSelectedProjectForSharing(project);
  };

  const handleViewDetails = (project: any) => {
    // Navigate to client dashboard
    onClientClick?.(project.client);
  };

  const handleManageProject = (project: any) => {
    // Navigate to project management
    console.log('Manage project:', project);
  };

  const handleEditProject = (project: any) => {
    // Open edit modal or navigate to edit page
    console.log('Edit project:', project);
    // For demo purposes, we'll just show an alert
    alert(`Edit project: ${project.project.title}\nClient: ${project.client.name}\nCompany: ${project.client.company}`);
  };


  const { toast } = useToast();

  const handleDeleteProject = async (project: any) => {
    const confirmed = window.confirm(
      `Delete project "${project.project?.title || 'Untitled'}" for ${project.client?.name || 'this client'}? This will remove associated chatbots, analytics, requests, and assets.`
    );
    if (!confirmed) return;

    try {
      setDeletingProjectId(project.id);
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id);

      if (error) throw error;

      toast({
        title: 'Project deleted',
        description: 'The project and its related data were removed successfully.'
      });

      await refreshData();
    } catch (err) {
      console.error('Error deleting project:', err);
      toast({
        title: 'Delete failed',
        description: 'We could not delete this project. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setDeletingProjectId(null);
    }
  };

  const handleStatusChange = (projectId: string, newStatus: string) => {
    setClientProjects(prev => prev.map(p => 
      p.id === projectId 
        ? { ...p, project: { ...p.project, status: newStatus } }
        : p
    ));
    console.log(`Status changed to ${newStatus} for project ${projectId}`);
  };

  const filteredProjects = clientProjects.filter(project => {
    const matchesSearch = (project.client?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (project.client?.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (project.project?.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || project.project?.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalViews = clientProjects.reduce((sum, project) => sum + (project.analytics?.totalViews || 0), 0);
  const totalVisitors = clientProjects.reduce((sum, project) => sum + (project.analytics?.uniqueVisitors || 0), 0);
  const activeProjects = clientProjects.filter(project => project.project?.status === 'active').length;
  const totalChatbots = clientProjects.filter(project => project.chatbot?.isActive).length;

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

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Client Projects Hub</h1>
          <p className="text-foreground-secondary text-sm sm:text-base">
            Manage all your client projects and track their performance
          </p>
        </div>
          
          <Button 
          className="bg-primary hover:bg-primary-hover"
          onClick={() => setIsNewProjectModalOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Project
                </Button>
                            </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientProjects.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeProjects} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {totalVisitors.toLocaleString()} unique visitors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Chatbots</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{totalChatbots}</div>
            <p className="text-xs text-muted-foreground">
              {clientProjects.length - totalChatbots} pending setup
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Satisfaction</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.0/5</div>
            <p className="text-xs text-muted-foreground">
              Based on chatbot interactions
            </p>
        </CardContent>
      </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects, clients, or companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="setup">Setup</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Client Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-8 bg-muted rounded"></div>
                    <div className="h-8 bg-muted rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ClientProjectCard
              key={project.id}
              project={project}
              onViewDetails={handleViewDetails}
              onManageProject={handleManageProject}
              onEditProject={handleEditProject}
              onDeleteProject={handleDeleteProject}
              onStatusChange={handleStatusChange}
              onSharePortal={handleSharePortal}
            />
          ))}
        </div>
      )}

      {!isLoading && filteredProjects.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No projects found'
                  : 'Welcome to your Client Projects Hub'
                }
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters to find projects'
                  : 'Start building your virtual tour business by creating your first client project. You can manage projects, track analytics, and set up chatbots all from here.'
                }
              </p>
              {(!searchTerm && statusFilter === 'all') && (
                <div className="space-y-2">
                  <Button onClick={() => setIsNewProjectModalOpen(true)} className="mr-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Project
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Need help getting started? Check out our documentation or contact support.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onProjectCreated={handleNewProjectCreated}
      />

      {/* Share Client Portal Modal */}
      {selectedProjectForSharing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Share Client Portal</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedProjectForSharing(null)}
                >
                  ×
                </Button>
              </div>
              <ShareClientPortal
                projectId={selectedProjectForSharing.id}
                projectTitle={selectedProjectForSharing.project.title}
                clientName={selectedProjectForSharing.client.name}
                clientEmail={selectedProjectForSharing.client.email}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TourVirtuali;
