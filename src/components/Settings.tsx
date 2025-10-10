import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  User, 
  Mail, 
  Building, 
  CreditCard, 
  Key, 
  Shield, 
  Link, 
  Calendar,
  Settings as SettingsIcon,
  Upload,
  Eye,
  EyeOff,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Loader2,
  Phone,
  Globe,
  MapPin,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAgency } from '@/contexts/AgencyContext';
import { supabase } from '@/integrations/supabase/client';
import { TEXT } from '@/constants/text';

interface ProfileSettings {
  agency_name: string;
  agency_logo: string;
  contact_email: string;
  phone: string;
  website: string;
  address: string;
  description: string;
}

interface IntegrationSettings {
  google_calendar: boolean;
  realsee_oauth: boolean;
  stripe_connected: boolean;
  webhook_url: string;
}

interface APIKey {
  id: string;
  name: string;
  key: string;
  user_id: string;
  created_at: string;
  last_used: string;
  permissions: string[];
}

const Settings: React.FC = () => {
  const { toast } = useToast();
  const { agencySettings, updateAgencySettings } = useAgency();
  
  const [profileSettings, setProfileSettings] = useState<ProfileSettings>({
    agency_name: agencySettings.agency_name,
    agency_logo: agencySettings.agency_logo,
    contact_email: agencySettings.current_user_email,
    phone: '',
    website: '',
    address: '',
    description: ''
  });

  const [integrationSettings, setIntegrationSettings] = useState<IntegrationSettings>({
    google_calendar: false,
    realsee_oauth: false,
    stripe_connected: false,
    webhook_url: ''
  });

  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [showApiKey, setShowApiKey] = useState<{ [key: string]: boolean }>({});
  const [newApiKeyName, setNewApiKeyName] = useState('');
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load profile settings
      const { data: profileData, error: profileError } = await supabase
        .from('agency_settings')
        .select('*')
        .eq('user_id', 'anonymous')
        .single();

      if (profileData && !profileError) {
        setProfileSettings(prev => ({ ...prev, ...profileData }));
      }

      // Load integration settings
      const { data: integrationData, error: integrationError } = await supabase
        .from('integration_settings')
        .select('*')
        .eq('user_id', 'anonymous')
        .single();

      if (integrationData && !integrationError) {
        setIntegrationSettings(prev => ({ ...prev, ...integrationData }));
      }

      // Load API keys
      const { data: keysData, error: keysError } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', 'anonymous')
        .order('created_at', { ascending: false });

      if (keysData && !keysError) {
        setApiKeys(keysData);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setError(TEXT.SETTINGS_PAGE.ERROR_SAVING_PROFILE);
      toast({
        title: TEXT.TOAST.ERROR,
        description: TEXT.SETTINGS_PAGE.ERROR_SAVING_PROFILE,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);

      await updateAgencySettings({
        agency_name: profileSettings.agency_name,
        agency_logo: profileSettings.agency_logo,
        current_user_email: profileSettings.contact_email
      });

      // Save to Supabase
      const { error } = await supabase
        .from('agency_settings')
        .upsert({
          ...profileSettings,
          user_id: 'anonymous',
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: TEXT.SETTINGS_PAGE.PROFILE_UPDATED,
        description: TEXT.SETTINGS_PAGE.PROFILE_UPDATED_DESCRIPTION
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: TEXT.TOAST.ERROR,
        description: TEXT.SETTINGS_PAGE.ERROR_SAVING_PROFILE,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveIntegrations = async () => {
    try {
      setIsSaving(true);

      const { error } = await supabase
        .from('integration_settings')
        .upsert({
          ...integrationSettings,
          user_id: 'anonymous',
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: TEXT.SETTINGS_PAGE.INTEGRATIONS_UPDATED,
        description: TEXT.SETTINGS_PAGE.INTEGRATIONS_UPDATED_DESCRIPTION
      });
    } catch (error) {
      console.error('Error saving integrations:', error);
      toast({
        title: TEXT.TOAST.ERROR,
        description: TEXT.SETTINGS_PAGE.ERROR_SAVING_INTEGRATIONS,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConnectGoogleCalendar = async () => {
    try {
      setIsSaving(true);
      
      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIntegrationSettings(prev => ({ ...prev, google_calendar: true }));
      
      toast({
        title: TEXT.SETTINGS_PAGE.GOOGLE_CALENDAR_CONNECTED,
        description: TEXT.SETTINGS_PAGE.GOOGLE_CALENDAR_CONNECTED_DESCRIPTION
      });
    } catch (error) {
      console.error('Error connecting Google Calendar:', error);
      toast({
        title: TEXT.TOAST.ERROR,
        description: TEXT.SETTINGS_PAGE.ERROR_CONNECTING_GOOGLE,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConnectRealsee = async () => {
    try {
      setIsSaving(true);
      
      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIntegrationSettings(prev => ({ ...prev, realsee_oauth: true }));
      
      toast({
        title: TEXT.SETTINGS_PAGE.REALSEE_CONNECTED,
        description: TEXT.SETTINGS_PAGE.REALSEE_CONNECTED_DESCRIPTION
      });
    } catch (error) {
      console.error('Error connecting Realsee:', error);
      toast({
        title: TEXT.TOAST.ERROR,
        description: TEXT.SETTINGS_PAGE.ERROR_CONNECTING_REALSEE,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConnectStripe = async () => {
    try {
      setIsSaving(true);
      
      // Simulate Stripe connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIntegrationSettings(prev => ({ ...prev, stripe_connected: true }));
      
      toast({
        title: TEXT.SETTINGS_PAGE.STRIPE_CONNECTED,
        description: TEXT.SETTINGS_PAGE.STRIPE_CONNECTED_DESCRIPTION
      });
    } catch (error) {
      console.error('Error connecting Stripe:', error);
      toast({
        title: TEXT.TOAST.ERROR,
        description: TEXT.SETTINGS_PAGE.ERROR_CONNECTING_STRIPE,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const generateApiKey = async () => {
    if (!newApiKeyName.trim()) {
      toast({
        title: TEXT.TOAST.ERROR,
        description: TEXT.SETTINGS_PAGE.ENTER_API_KEY_NAME_ERROR,
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingKey(true);
    try {
      const newKey = `sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      
      const newApiKey: APIKey = {
        id: Date.now().toString(),
        name: newApiKeyName,
        key: newKey,
        user_id: 'anonymous',
        created_at: new Date().toISOString(),
        last_used: '',
        permissions: ['read', 'write']
      };

      const { error } = await supabase
        .from('api_keys')
        .insert(newApiKey);

      if (error) throw error;

      setApiKeys(prev => [newApiKey, ...prev]);
      setNewApiKeyName('');
      
      toast({
        title: TEXT.SETTINGS_PAGE.API_KEY_GENERATED,
        description: TEXT.SETTINGS_PAGE.API_KEY_GENERATED_DESCRIPTION
      });
    } catch (error) {
      console.error('Error generating API key:', error);
      toast({
        title: TEXT.TOAST.ERROR,
        description: TEXT.SETTINGS_PAGE.ERROR_GENERATING_KEY,
        variant: "destructive"
      });
    } finally {
      setIsGeneratingKey(false);
    }
  };

  const deleteApiKey = async (keyId: string) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId);

      if (error) throw error;

      setApiKeys(prev => prev.filter(key => key.id !== keyId));
      
      toast({
        title: TEXT.SETTINGS_PAGE.API_KEY_DELETED,
        description: TEXT.SETTINGS_PAGE.API_KEY_DELETED_DESCRIPTION
      });
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast({
        title: TEXT.TOAST.ERROR,
        description: TEXT.SETTINGS_PAGE.ERROR_DELETING_KEY,
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in-up">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{TEXT.SETTINGS_PAGE.SETTINGS}</h1>
          <p className="text-foreground-secondary text-sm sm:text-base">{TEXT.SETTINGS_PAGE.MANAGE_ACCOUNT}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 animate-fade-in-up">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{TEXT.SETTINGS_PAGE.SETTINGS}</h1>
          <p className="text-foreground-secondary text-sm sm:text-base">{TEXT.SETTINGS_PAGE.MANAGE_ACCOUNT}</p>
        </div>
        
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-destructive mb-2">{error}</div>
              <Button onClick={loadSettings} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{TEXT.SETTINGS_PAGE.SETTINGS}</h1>
        <p className="text-foreground-secondary text-sm sm:text-base">{TEXT.SETTINGS_PAGE.MANAGE_ACCOUNT}</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="profile" className="text-xs sm:text-sm">{TEXT.SETTINGS_PAGE.PROFILE}</TabsTrigger>
          <TabsTrigger value="billing" className="text-xs sm:text-sm">{TEXT.SETTINGS_PAGE.BILLING}</TabsTrigger>
          <TabsTrigger value="integrations" className="text-xs sm:text-sm">{TEXT.SETTINGS_PAGE.INTEGRATIONS}</TabsTrigger>
          <TabsTrigger value="security" className="text-xs sm:text-sm">{TEXT.SETTINGS_PAGE.SECURITY}</TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {TEXT.SETTINGS_PAGE.AGENCY_PROFILE}
              </CardTitle>
              <CardDescription>
                {TEXT.SETTINGS_PAGE.MANAGE_AGENCY_INFO}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="agency_name">{TEXT.SETTINGS_PAGE.AGENCY_NAME} *</Label>
                  <Input
                    id="agency_name"
                    value={profileSettings.agency_name}
                    onChange={(e) => setProfileSettings(prev => ({ ...prev, agency_name: e.target.value }))}
                    placeholder={TEXT.SETTINGS_PAGE.ENTER_AGENCY_NAME}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_email">{TEXT.SETTINGS_PAGE.CONTACT_EMAIL} *</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={profileSettings.contact_email}
                    onChange={(e) => setProfileSettings(prev => ({ ...prev, contact_email: e.target.value }))}
                    placeholder={TEXT.SETTINGS_PAGE.ENTER_CONTACT_EMAIL}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{TEXT.SETTINGS_PAGE.PHONE}</Label>
                  <Input
                    id="phone"
                    value={profileSettings.phone}
                    onChange={(e) => setProfileSettings(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder={TEXT.SETTINGS_PAGE.ENTER_PHONE}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">{TEXT.SETTINGS_PAGE.WEBSITE}</Label>
                  <Input
                    id="website"
                    value={profileSettings.website}
                    onChange={(e) => setProfileSettings(prev => ({ ...prev, website: e.target.value }))}
                    placeholder={TEXT.SETTINGS_PAGE.ENTER_WEBSITE}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="agency_logo">{TEXT.SETTINGS_PAGE.AGENCY_LOGO}</Label>
                <Input
                  id="agency_logo"
                  value={profileSettings.agency_logo}
                  onChange={(e) => setProfileSettings(prev => ({ ...prev, agency_logo: e.target.value }))}
                  placeholder={TEXT.SETTINGS_PAGE.ENTER_LOGO_URL}
                />
                {profileSettings.agency_logo && (
                  <div className="mt-2">
                    <img 
                      src={profileSettings.agency_logo} 
                      alt="Agency Logo" 
                      className="w-16 h-16 object-contain border rounded"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">{TEXT.SETTINGS_PAGE.ADDRESS}</Label>
                <Textarea
                  id="address"
                  value={profileSettings.address}
                  onChange={(e) => setProfileSettings(prev => ({ ...prev, address: e.target.value }))}
                  placeholder={TEXT.SETTINGS_PAGE.ENTER_ADDRESS}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{TEXT.SETTINGS_PAGE.DESCRIPTION}</Label>
                <Textarea
                  id="description"
                  value={profileSettings.description}
                  onChange={(e) => setProfileSettings(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={TEXT.SETTINGS_PAGE.ENTER_DESCRIPTION}
                  rows={4}
                />
              </div>

              <Button onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <SettingsIcon className="h-4 w-4 mr-2" />
                    {TEXT.SETTINGS_PAGE.SAVE_PROFILE}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing & Subscription */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                {TEXT.SETTINGS_PAGE.BILLING_SUBSCRIPTION}
              </CardTitle>
              <CardDescription>
                {TEXT.SETTINGS_PAGE.MANAGE_SUBSCRIPTION}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{TEXT.SETTINGS_PAGE.CURRENT_PLAN}</h3>
                  <p className="text-sm text-muted-foreground">{TEXT.SETTINGS_PAGE.PROFESSIONAL_PLAN}</p>
                </div>
                <Badge variant="default">{TEXT.SETTINGS_PAGE.ACTIVE}</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-20">
                  <CreditCard className="h-5 w-5 mr-2" />
                  {TEXT.SETTINGS_PAGE.MANAGE_PAYMENT_METHODS}
                </Button>
                <Button variant="outline" className="h-20">
                  <ExternalLink className="h-5 w-5 mr-2" />
                  {TEXT.SETTINGS_PAGE.VIEW_BILLING_HISTORY}
                </Button>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">{TEXT.SETTINGS_PAGE.USAGE_THIS_MONTH}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>{TEXT.SETTINGS_PAGE.PROJECTS}</span>
                    <span>12 / 50</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{TEXT.SETTINGS_PAGE.STORAGE}</span>
                    <span>2.3 GB / 10 GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{TEXT.SETTINGS_PAGE.API_CALLS}</span>
                    <span>1,234 / 10,000</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                {TEXT.SETTINGS_PAGE.INTEGRATIONS_TITLE}
              </CardTitle>
              <CardDescription>
                {TEXT.SETTINGS_PAGE.CONNECT_SERVICES}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-8 w-8 text-blue-600" />
                    <div>
                      <h3 className="font-medium">{TEXT.SETTINGS_PAGE.GOOGLE_CALENDAR}</h3>
                      <p className="text-sm text-muted-foreground">{TEXT.SETTINGS_PAGE.SYNC_APPOINTMENTS}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {integrationSettings.google_calendar ? (
                      <Badge variant="default" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        {TEXT.SETTINGS_PAGE.CONNECTED}
                      </Badge>
                    ) : (
                      <Button size="sm" onClick={handleConnectGoogleCalendar} disabled={isSaving}>
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : TEXT.SETTINGS_PAGE.CONNECT}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="h-8 w-8 text-green-600" />
                    <div>
                      <h3 className="font-medium">{TEXT.SETTINGS_PAGE.REALSEE_OAUTH}</h3>
                      <p className="text-sm text-muted-foreground">{TEXT.SETTINGS_PAGE.SECURE_CONNECTION}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {integrationSettings.realsee_oauth ? (
                      <Badge variant="default" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        {TEXT.SETTINGS_PAGE.CONNECTED}
                      </Badge>
                    ) : (
                      <Button size="sm" onClick={handleConnectRealsee} disabled={isSaving}>
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : TEXT.SETTINGS_PAGE.CONNECT}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-8 w-8 text-purple-600" />
                    <div>
                      <h3 className="font-medium">{TEXT.SETTINGS_PAGE.STRIPE}</h3>
                      <p className="text-sm text-muted-foreground">{TEXT.SETTINGS_PAGE.PAYMENT_PROCESSING}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {integrationSettings.stripe_connected ? (
                      <Badge variant="default" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        {TEXT.SETTINGS_PAGE.CONNECTED}
                      </Badge>
                    ) : (
                      <Button size="sm" onClick={handleConnectStripe} disabled={isSaving}>
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : TEXT.SETTINGS_PAGE.CONNECT}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhook_url">{TEXT.SETTINGS_PAGE.WEBHOOK_URL}</Label>
                <Input
                  id="webhook_url"
                  value={integrationSettings.webhook_url}
                  onChange={(e) => setIntegrationSettings(prev => ({ ...prev, webhook_url: e.target.value }))}
                  placeholder={TEXT.SETTINGS_PAGE.ENTER_WEBHOOK_URL}
                />
              </div>

              <Button onClick={handleSaveIntegrations} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <SettingsIcon className="h-4 w-4 mr-2" />
                    {TEXT.SETTINGS_PAGE.SAVE_INTEGRATIONS}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                {TEXT.SETTINGS_PAGE.API_KEYS}
              </CardTitle>
              <CardDescription>
                {TEXT.SETTINGS_PAGE.MANAGE_API_KEYS}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-2">
                <Input
                  placeholder={TEXT.SETTINGS_PAGE.ENTER_API_KEY_NAME}
                  value={newApiKeyName}
                  onChange={(e) => setNewApiKeyName(e.target.value)}
                />
                <Button onClick={generateApiKey} disabled={isGeneratingKey}>
                  {isGeneratingKey ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {TEXT.SETTINGS_PAGE.GENERATING}
                    </>
                  ) : (
                    TEXT.SETTINGS_PAGE.GENERATE_KEY
                  )}
                </Button>
              </div>

              <div className="space-y-3">
                {apiKeys.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{TEXT.SETTINGS_PAGE.NO_API_KEYS}</p>
                  </div>
                ) : (
                  apiKeys.map((key) => (
                    <div key={key.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{key.name}</h4>
                          <Badge variant="outline">{key.permissions.join(', ')}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{TEXT.SETTINGS_PAGE.CREATED}: {new Date(key.created_at).toLocaleDateString()}</span>
                          {key.last_used && (
                            <span>{TEXT.SETTINGS_PAGE.LAST_USED}: {new Date(key.last_used).toLocaleDateString()}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                            {showApiKey[key.id] ? key.key : '••••••••••••••••'}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowApiKey(prev => ({ ...prev, [key.id]: !prev[key.id] }))}
                          >
                            {showApiKey[key.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </Button>
                        </div>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            {TEXT.SETTINGS_PAGE.DELETE}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{key.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deleteApiKey(key.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;