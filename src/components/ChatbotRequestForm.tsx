import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Upload, 
  FileText, 
  Bot, 
  Send, 
  CheckCircle,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';

interface ChatbotRequestFormProps {
  projectId: string;
  projectTitle: string;
  clientName: string;
  onRequestSubmitted?: () => void;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

const ChatbotRequestForm: React.FC<ChatbotRequestFormProps> = ({
  projectId,
  projectTitle,
  clientName,
  onRequestSubmitted
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    // Basic Information
    chatbotName: '',
    chatbotPurpose: '',
    targetAudience: '',
    language: 'en',
    
    // Content & Knowledge
    websiteUrl: '',
    existingContent: '',
    specificQuestions: '',
    businessInfo: '',
    
    // Behavior & Style
    tone: 'professional',
    responseStyle: 'helpful',
    specialInstructions: '',
    
    // Contact & Timeline
    priority: 'medium',
    preferredContactMethod: 'email',
    timeline: '',
    additionalNotes: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newFiles: UploadedFile[] = [];

    try {
      for (const file of Array.from(files)) {
        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `chatbot-requests/${projectId}/${fileName}`;

        const { data, error } = await supabase.storage
          .from('chatbot-files')
          .upload(filePath, file);

        if (error) {
          console.error('Upload error:', error);
          toast({
            title: 'Upload Failed',
            description: `Failed to upload ${file.name}`,
            variant: 'destructive'
          });
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('chatbot-files')
          .getPublicUrl(filePath);

        newFiles.push({
          id: fileName,
          name: file.name,
          size: file.size,
          type: file.type,
          url: urlData.publicUrl
        });
      }

      setUploadedFiles(prev => [...prev, ...newFiles]);
      toast({
        title: 'Files Uploaded',
        description: `${newFiles.length} file(s) uploaded successfully`
      });
    } catch (error) {
      console.error('File upload error:', error);
      toast({
        title: 'Upload Error',
        description: 'Failed to upload files',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = async (fileId: string) => {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (!file) return;

    try {
      // Remove from storage
      const filePath = `chatbot-requests/${projectId}/${fileId}`;
      await supabase.storage.from('chatbot-files').remove([filePath]);

      // Remove from state
      setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
      
      toast({
        title: 'File Removed',
        description: `${file.name} has been removed`
      });
    } catch (error) {
      console.error('Error removing file:', error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.chatbotName || !formData.chatbotPurpose) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in the chatbot name and purpose',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Create chatbot request record
      const { data, error } = await supabase
        .from('chatbot_requests')
        .insert({
          project_id: projectId,
          chatbot_name: formData.chatbotName,
          chatbot_purpose: formData.chatbotPurpose,
          target_audience: formData.targetAudience,
          language: formData.language,
          website_url: formData.websiteUrl,
          existing_content: formData.existingContent,
          specific_questions: formData.specificQuestions,
          business_info: formData.businessInfo,
          tone: formData.tone,
          response_style: formData.responseStyle,
          special_instructions: formData.specialInstructions,
          priority: formData.priority,
          preferred_contact_method: formData.preferredContactMethod,
          timeline: formData.timeline,
          additional_notes: formData.additionalNotes,
          uploaded_files: uploadedFiles,
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Request Submitted Successfully',
        description: 'Your chatbot request has been sent. We\'ll review it and get back to you soon!'
      });

      // Reset form
      setFormData({
        chatbotName: '',
        chatbotPurpose: '',
        targetAudience: '',
        language: 'en',
        websiteUrl: '',
        existingContent: '',
        specificQuestions: '',
        businessInfo: '',
        tone: 'professional',
        responseStyle: 'helpful',
        specialInstructions: '',
        priority: 'medium',
        preferredContactMethod: 'email',
        timeline: '',
        additionalNotes: ''
      });
      setUploadedFiles([]);

      onRequestSubmitted?.();
    } catch (error: any) {
      console.error('Error submitting request:', error);
      toast({
        title: 'Submission Failed',
        description: error.message || 'Failed to submit chatbot request',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Chatbot Creation Request
        </CardTitle>
        <CardDescription>
          Submit your requirements and files for custom chatbot creation for <strong>{projectTitle}</strong> (Client: {clientName})
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="chatbotName">Chatbot Name *</Label>
              <Input
                id="chatbotName"
                placeholder="e.g., Property Assistant, Tour Guide Bot"
                value={formData.chatbotName}
                onChange={(e) => handleInputChange('chatbotName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="it">Italian</SelectItem>
                  <SelectItem value="pt">Portuguese</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="chatbotPurpose">Chatbot Purpose *</Label>
            <Textarea
              id="chatbotPurpose"
              placeholder="Describe what the chatbot should help visitors with (e.g., answer property questions, provide tour information, collect leads)"
              value={formData.chatbotPurpose}
              onChange={(e) => handleInputChange('chatbotPurpose', e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetAudience">Target Audience</Label>
            <Input
              id="targetAudience"
              placeholder="e.g., Property buyers, Tour visitors, Potential customers"
              value={formData.targetAudience}
              onChange={(e) => handleInputChange('targetAudience', e.target.value)}
            />
          </div>
        </div>

        {/* Content & Knowledge */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Content & Knowledge Base</h3>
          <div className="space-y-2">
            <Label htmlFor="websiteUrl">Website URL</Label>
            <Input
              id="websiteUrl"
              placeholder="https://your-website.com"
              value={formData.websiteUrl}
              onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="existingContent">Existing Content/Information</Label>
            <Textarea
              id="existingContent"
              placeholder="Paste any existing content, FAQs, property details, or information the chatbot should know"
              value={formData.existingContent}
              onChange={(e) => handleInputChange('existingContent', e.target.value)}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="specificQuestions">Specific Questions to Handle</Label>
            <Textarea
              id="specificQuestions"
              placeholder="List common questions visitors ask (e.g., What are the property dimensions? How much does it cost? What are the amenities?)"
              value={formData.specificQuestions}
              onChange={(e) => handleInputChange('specificQuestions', e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessInfo">Business Information</Label>
            <Textarea
              id="businessInfo"
              placeholder="Company details, contact information, services offered, etc."
              value={formData.businessInfo}
              onChange={(e) => handleInputChange('businessInfo', e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* File Upload */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Upload Files</h3>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
            <div className="text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Upload documents, images, or other files for the chatbot
              </p>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Files
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <Label>Uploaded Files</Label>
              <div className="space-y-2">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Behavior & Style */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Behavior & Style</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select value={formData.tone} onValueChange={(value) => handleInputChange('tone', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="responseStyle">Response Style</Label>
              <Select value={formData.responseStyle} onValueChange={(value) => handleInputChange('responseStyle', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="helpful">Helpful & Informative</SelectItem>
                  <SelectItem value="concise">Concise & Direct</SelectItem>
                  <SelectItem value="detailed">Detailed & Comprehensive</SelectItem>
                  <SelectItem value="conversational">Conversational</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="specialInstructions">Special Instructions</Label>
            <Textarea
              id="specialInstructions"
              placeholder="Any specific behavior, responses, or features you want the chatbot to have"
              value={formData.specialInstructions}
              onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* Contact & Timeline */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Contact & Timeline</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferredContactMethod">Preferred Contact Method</Label>
              <Select value={formData.preferredContactMethod} onValueChange={(value) => handleInputChange('preferredContactMethod', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="dashboard">Dashboard Message</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="timeline">Timeline</Label>
            <Input
              id="timeline"
              placeholder="e.g., Within 1 week, ASAP, No rush"
              value={formData.timeline}
              onChange={(e) => handleInputChange('timeline', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="additionalNotes">Additional Notes</Label>
            <Textarea
              id="additionalNotes"
              placeholder="Any other information or special requirements"
              value={formData.additionalNotes}
              onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            <p>Your request will be reviewed and you'll be contacted with updates.</p>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.chatbotName || !formData.chatbotPurpose}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Request
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatbotRequestForm;


