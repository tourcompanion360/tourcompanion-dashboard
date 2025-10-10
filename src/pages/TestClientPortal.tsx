import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ExternalLink, Plus } from 'lucide-react';

const TestClientPortal = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');

  const [formData, setFormData] = useState({
    clientName: 'Test Client',
    clientEmail: 'test@example.com',
    clientCompany: 'Test Company',
    projectTitle: 'Test Virtual Tour',
    projectDescription: 'A test virtual tour for demonstration',
    projectType: 'virtual_tour',
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: creator } = await supabase
        .from('creators')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!creator) return;

      const { data: projectsData } = await supabase
        .from('projects')
        .select(`
          id,
          title,
          description,
          project_type,
          status,
          created_at,
          end_clients (
            id,
            name,
            email,
            company
          )
        `)
        .eq('end_clients.creator_id', creator.id)
        .order('created_at', { ascending: false });

      setProjects(projectsData || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const createTestProject = async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to create a test project.',
          variant: 'destructive',
        });
        return;
      }

      // Get creator ID
      const { data: creator, error: creatorError } = await supabase
        .from('creators')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (creatorError || !creator) {
        toast({
          title: 'Error',
          description: 'Creator profile not found.',
          variant: 'destructive',
        });
        return;
      }

      // Create end client
      const { data: endClient, error: clientError } = await supabase
        .from('end_clients')
        .insert({
          creator_id: creator.id,
          name: formData.clientName,
          email: formData.clientEmail,
          company: formData.clientCompany,
        })
        .select('id, name, email')
        .single();

      if (clientError) {
        toast({
          title: 'Error Creating Client',
          description: clientError.message,
          variant: 'destructive',
        });
        return;
      }

      // Create project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          end_client_id: endClient.id,
          title: formData.projectTitle,
          description: formData.projectDescription,
          project_type: formData.projectType,
          status: 'active',
        })
        .select('id, title, description, project_type, status, created_at')
        .single();

      if (projectError) {
        toast({
          title: 'Error Creating Project',
          description: projectError.message,
          variant: 'destructive',
        });
        return;
      }

      // Create chatbot
      const { data: chatbot } = await supabase
        .from('chatbots')
        .insert({
          project_id: project.id,
          name: `${formData.projectTitle} Assistant`,
          language: 'en',
          welcome_message: 'Hello! How can I help you today?',
          status: 'active',
        })
        .select('id, name, status')
        .single();

      toast({
        title: 'Test Project Created',
        description: `Project "${project.title}" created successfully!`,
      });

      // Refresh projects list
      loadProjects();
      
      // Auto-select the new project
      setSelectedProject(project.id);

    } catch (error) {
      console.error('Error creating test project:', error);
      toast({
        title: 'Error',
        description: 'Failed to create test project.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openClientPortal = () => {
    if (!selectedProject) {
      toast({
        title: 'No Project Selected',
        description: 'Please select a project to view the client portal.',
        variant: 'destructive',
      });
      return;
    }

    // Open client portal in new tab
    const portalUrl = `/test-client/${selectedProject}`;
    window.open(portalUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Test Client Portal</h1>
          <p className="text-muted-foreground">
            Create a test project and access the client portal to see how it works
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create Test Project */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create Test Project
              </CardTitle>
              <CardDescription>
                Create a test project with a client to see the client portal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientEmail">Client Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientCompany">Company</Label>
                <Input
                  id="clientCompany"
                  value={formData.clientCompany}
                  onChange={(e) => setFormData({ ...formData, clientCompany: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectTitle">Project Title</Label>
                <Input
                  id="projectTitle"
                  value={formData.projectTitle}
                  onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectDescription">Description</Label>
                <Textarea
                  id="projectDescription"
                  value={formData.projectDescription}
                  onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectType">Project Type</Label>
                <Select
                  value={formData.projectType}
                  onValueChange={(value) => setFormData({ ...formData, projectType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="virtual_tour">Virtual Tour</SelectItem>
                    <SelectItem value="3d_showcase">3D Showcase</SelectItem>
                    <SelectItem value="interactive_map">Interactive Map</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={createTestProject} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Test Project
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Access Client Portal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Access Client Portal
              </CardTitle>
              <CardDescription>
                Select a project and open the client portal to see how clients view their data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {projects.length > 0 ? (
                <>
                  <div className="space-y-2">
                    <Label>Select Project</Label>
                    <Select value={selectedProject} onValueChange={setSelectedProject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.title} - {project.end_clients?.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={openClientPortal}
                    disabled={!selectedProject}
                    className="w-full"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Client Portal
                  </Button>

                  <div className="text-sm text-muted-foreground">
                    <p>This will open the client portal in a new tab where you can see:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Project overview and stats</li>
                      <li>Analytics dashboard</li>
                      <li>Media library</li>
                      <li>Request submission form</li>
                      <li>Chatbot interface</li>
                    </ul>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    No projects found. Create a test project first.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>How This Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <span className="text-primary font-bold">1</span>
                </div>
                <h3 className="font-semibold mb-1">Create Project</h3>
                <p className="text-sm text-muted-foreground">
                  Create a test project with client information
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <span className="text-primary font-bold">2</span>
                </div>
                <h3 className="font-semibold mb-1">Select Project</h3>
                <p className="text-sm text-muted-foreground">
                  Choose which project to view in the client portal
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <span className="text-primary font-bold">3</span>
                </div>
                <h3 className="font-semibold mb-1">View Portal</h3>
                <p className="text-sm text-muted-foreground">
                  See exactly what your clients see in their portal
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestClientPortal;
