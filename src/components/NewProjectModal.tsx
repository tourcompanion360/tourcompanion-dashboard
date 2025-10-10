import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Plus, 
  User, 
  Building, 
  Mail, 
  Phone, 
  Bot, 
  Settings, 
  Globe,
  MessageSquare,
  Zap,
  CheckCircle,
  X
} from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: any) => void;
}

const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose, onProjectCreated }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    // Client Information
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientCompany: '',
    clientWebsite: '',
    
    // Project Information
    projectTitle: '',
    projectDescription: '',
    projectType: 'virtual_tour',
    projectCategory: 'real_estate',
    
    // Chatbot Configuration
    enableChatbot: true,
    chatbotName: '',
    chatbotLanguage: 'en',
    chatbotWelcomeMessage: 'Hello! How can I help you today?',
    chatbotFallbackMessage: 'I apologize, but I need more information to help you. Please contact us directly.',
    
    // Advanced Settings
    enableAnalytics: true,
    enableNotifications: true,
    customDomain: '',
    branding: {
      primaryColor: '#3B82F6',
      logo: '',
      companyName: ''
    }
  });

  const projectTypes = [
    { value: 'virtual_tour', label: 'Virtual Tour' },
    { value: '3d_scan', label: '3D Scan' },
    { value: 'interactive_media', label: 'Interactive Media' },
    { value: 'product_showcase', label: 'Product Showcase' }
  ];

  const projectCategories = [
    { value: 'real_estate', label: 'Real Estate' },
    { value: 'hospitality', label: 'Hospitality' },
    { value: 'retail', label: 'Retail' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'education', label: 'Education' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'other', label: 'Other' }
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'pt', label: 'Portuguese' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Validate required fields
      if (!formData.clientName || !formData.clientEmail || !formData.projectTitle) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          variant: "destructive"
        });
        return;
      }

      if (!user) {
        console.error('No user found in authentication context');
        toast({
          title: "Authentication Required",
          description: "Please sign in to create a project.",
          variant: "destructive"
        });
        return;
      }

      console.log('Creating project for user:', user.id);

      // Get creator ID from user
      const { data: creator, error: creatorError } = await supabase
        .from('creators')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (creatorError || !creator) {
        console.error('Error finding creator:', creatorError);
        toast({
          title: "Error Creating Project",
          description: "Creator profile not found. Please contact support.",
          variant: "destructive"
        });
        return;
      }

      // Step 1: Create end client
      const { data: endClient, error: clientError } = await supabase
        .from('end_clients')
        .insert({
          creator_id: creator.id,
          name: formData.clientName,
          email: formData.clientEmail,
          company: formData.clientCompany || 'Individual Client',
          phone: formData.clientPhone || null,
          website: formData.clientWebsite || null,
        })
        .select('id, name, email')
        .single();

      if (clientError) {
        console.error('Error creating client:', clientError);
        toast({
          title: "Error Creating Client",
          description: clientError.message,
          variant: "destructive"
        });
        return;
      }

      // Step 2: Create project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          end_client_id: endClient.id,
          title: formData.projectTitle,
          description: formData.projectDescription || null,
          project_type: formData.projectType,
          status: 'active',
        })
        .select('id, title, description, project_type, status, created_at')
        .single();

      if (projectError) {
        console.error('Error creating project:', projectError);
        toast({
          title: "Error Creating Project",
          description: projectError.message,
          variant: "destructive"
        });
        return;
      }

      // Step 3: Create chatbot (if enabled)
      let chatbot = null;
      if (formData.enableChatbot) {
        const { data: chatbotData, error: chatbotError } = await supabase
          .from('chatbots')
          .insert({
            project_id: project.id,
            name: formData.chatbotName || `${formData.projectTitle} Assistant`,
            language: formData.chatbotLanguage,
            welcome_message: formData.chatbotWelcomeMessage,
            status: 'active',
          })
          .select('id, name, status')
          .single();

        if (chatbotError) {
          console.error('Error creating chatbot:', chatbotError);
          // Don't fail the whole process if chatbot creation fails
        } else {
          chatbot = chatbotData;
        }
      }

      console.log('Project created successfully:', { project, endClient, chatbot });

      // Show success message
      toast({
        title: "Project Created Successfully",
        description: `New project "${project.title}" has been created for ${endClient.name}.`,
      });

      // Pass the project data back to parent for refresh
      onProjectCreated({
        id: project.id,
        title: project.title,
        description: project.description,
        project_type: project.project_type,
        status: project.status,
        created_at: project.created_at,
        end_client: endClient,
        chatbot: chatbot,
      });
      handleClose();
      
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: "Error Creating Project",
        description: "There was an unexpected error. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFormData({
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      clientCompany: '',
      clientWebsite: '',
      projectTitle: '',
      projectDescription: '',
      projectType: 'virtual_tour',
      projectCategory: 'real_estate',
      enableChatbot: true,
      chatbotName: '',
      chatbotLanguage: 'en',
      chatbotWelcomeMessage: 'Hello! How can I help you today?',
      chatbotFallbackMessage: 'I apologize, but I need more information to help you. Please contact us directly.',
      enableAnalytics: true,
      enableNotifications: true,
      customDomain: '',
      branding: {
        primaryColor: '#3B82F6',
        logo: '',
        companyName: ''
      }
    });
    onClose();
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center py-4">
              <h3 className="text-lg font-semibold text-foreground">Tell us about your client</h3>
              <p className="text-sm text-muted-foreground mt-1">We'll use this information to personalize their experience</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name *</Label>
                <Input
                  id="clientName"
                  placeholder="Enter client name"
                  value={formData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Email *</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  placeholder="client@company.com"
                  value={formData.clientEmail}
                  onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clientPhone">Phone</Label>
                <Input
                  id="clientPhone"
                  placeholder="+1 (555) 123-4567"
                  value={formData.clientPhone}
                  onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clientCompany">Company</Label>
                <Input
                  id="clientCompany"
                  placeholder="Company Name"
                  value={formData.clientCompany}
                  onChange={(e) => handleInputChange('clientCompany', e.target.value)}
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="clientWebsite">Website</Label>
                <Input
                  id="clientWebsite"
                  placeholder="https://company.com"
                  value={formData.clientWebsite}
                  onChange={(e) => handleInputChange('clientWebsite', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center py-4">
              <h3 className="text-lg font-semibold text-foreground">Configure your project</h3>
              <p className="text-sm text-muted-foreground mt-1">Set up the details for your virtual tour or interactive experience</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="projectTitle">Project Title *</Label>
                <Input
                  id="projectTitle"
                  placeholder="Enter project title"
                  value={formData.projectTitle}
                  onChange={(e) => handleInputChange('projectTitle', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="projectDescription">Description</Label>
                <Textarea
                  id="projectDescription"
                  placeholder="Describe the project..."
                  value={formData.projectDescription}
                  onChange={(e) => handleInputChange('projectDescription', e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Project Type</Label>
                  <Select value={formData.projectType} onValueChange={(value) => handleInputChange('projectType', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {projectTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.projectCategory} onValueChange={(value) => handleInputChange('projectCategory', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {projectCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center py-4">
              <h3 className="text-lg font-semibold text-foreground">Set up your AI assistant</h3>
              <p className="text-sm text-muted-foreground mt-1">Configure the chatbot and final settings for your client</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Enable Chatbot</CardTitle>
                    <CardDescription>Create an AI assistant for this client</CardDescription>
                  </div>
                  <Switch
                    checked={formData.enableChatbot}
                    onCheckedChange={(checked) => handleInputChange('enableChatbot', checked)}
                  />
                </div>
              </CardHeader>
              
              {formData.enableChatbot && (
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="chatbotName">Chatbot Name</Label>
                      <Input
                        id="chatbotName"
                        placeholder="Assistant Name"
                        value={formData.chatbotName}
                        onChange={(e) => handleInputChange('chatbotName', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Language</Label>
                      <Select value={formData.chatbotLanguage} onValueChange={(value) => handleInputChange('chatbotLanguage', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value}>
                              {lang.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="welcomeMessage">Welcome Message</Label>
                    <Textarea
                      id="welcomeMessage"
                      placeholder="Hello! How can I help you today?"
                      value={formData.chatbotWelcomeMessage}
                      onChange={(e) => handleInputChange('chatbotWelcomeMessage', e.target.value)}
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fallbackMessage">Fallback Message</Label>
                    <Textarea
                      id="fallbackMessage"
                      placeholder="I apologize, but I need more information..."
                      value={formData.chatbotFallbackMessage}
                      onChange={(e) => handleInputChange('chatbotFallbackMessage', e.target.value)}
                      rows={2}
                    />
                  </div>
                </CardContent>
              )}
            </Card>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Analytics</Label>
                  <p className="text-sm text-muted-foreground">Track project performance</p>
                </div>
                <Switch
                  checked={formData.enableAnalytics}
                  onCheckedChange={(checked) => handleInputChange('enableAnalytics', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get updates on client activity</p>
                </div>
                <Switch
                  checked={formData.enableNotifications}
                  onCheckedChange={(checked) => handleInputChange('enableNotifications', checked)}
                />
              </div>
            </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            New Client Project Setup
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 overflow-y-auto max-h-[calc(95vh-200px)]">
          {/* Progress Steps - Clean Design */}
          <div className="w-full">
            <div className="flex items-center justify-center space-x-8">
              {[
                { step: 1, label: 'Client Info', icon: User },
                { step: 2, label: 'Project Setup', icon: Settings },
                { step: 3, label: 'Chatbot Config', icon: Bot }
              ].map(({ step, label, icon: Icon }, index) => (
                <div key={step} className="flex items-center">
                  {/* Step Circle */}
                  <div className="flex flex-col items-center">
                    <div className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      step < currentStep 
                        ? 'bg-green-500 text-white shadow-lg' 
                        : step === currentStep 
                        ? 'bg-primary text-primary-foreground shadow-lg ring-4 ring-primary/20' 
                        : 'bg-muted text-muted-foreground border-2 border-muted-foreground/30'
                    }`}>
                      {step < currentStep ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <div className={`text-xs font-medium transition-colors ${
                        step <= currentStep ? 'text-primary' : 'text-muted-foreground'
                      }`}>
                        {label}
                      </div>
                    </div>
                  </div>
                  
                  {/* Connector Line */}
                  {index < 2 && (
                    <div className="flex-1 mx-4">
                      <div className="h-0.5 bg-muted relative">
                        <div 
                          className={`h-full bg-primary transition-all duration-500 ease-out ${
                            step < currentStep ? 'w-full' : 'w-0'
                          }`}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Step Content */}
          {renderStepContent()}
          
          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6 border-t">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="text-muted-foreground hover:text-foreground"
            >
              ← Previous
            </Button>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleClose} className="text-muted-foreground">
                Cancel
              </Button>
              {currentStep < 3 ? (
                <Button onClick={nextStep} className="min-w-24">
                  Next →
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting} className="min-w-32">
                  {isSubmitting ? (
                    <>
                      <Zap className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Project
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewProjectModal;

