-- Create chatbots table
CREATE TABLE public.chatbots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'anonymous',
  client_id TEXT,
  client_name TEXT NOT NULL,
  client_website TEXT,
  description TEXT,
  language TEXT NOT NULL DEFAULT 'english',
  welcome_message TEXT NOT NULL DEFAULT 'Hello! How can I help you today?',
  fallback_message TEXT NOT NULL DEFAULT 'I apologize, but I don''t understand. Could you please rephrase your question?',
  primary_color TEXT NOT NULL DEFAULT '#3b82f6',
  widget_style TEXT NOT NULL DEFAULT 'modern',
  position TEXT NOT NULL DEFAULT 'bottom_right',
  avatar_url TEXT,
  brand_logo_url TEXT,
  response_style TEXT NOT NULL DEFAULT 'friendly',
  max_questions INTEGER NOT NULL DEFAULT 10,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'inactive', 'draft')),
  knowledge_base_text TEXT,
  knowledge_base_files JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create agency_settings table
CREATE TABLE public.agency_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'anonymous',
  agency_name TEXT NOT NULL,
  agency_logo TEXT,
  contact_email TEXT,
  phone TEXT,
  website TEXT,
  address TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create integration_settings table
CREATE TABLE public.integration_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'anonymous',
  google_calendar BOOLEAN DEFAULT false,
  realsee_oauth BOOLEAN DEFAULT false,
  stripe_connected BOOLEAN DEFAULT false,
  webhook_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create api_keys table
CREATE TABLE public.api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'anonymous',
  name TEXT NOT NULL,
  key TEXT NOT NULL,
  last_used TIMESTAMP WITH TIME ZONE,
  permissions JSONB DEFAULT '["read", "write"]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'anonymous',
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  views INTEGER NOT NULL DEFAULT 0,
  client_name TEXT,
  project_type TEXT NOT NULL DEFAULT 'virtual_tour',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.chatbots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for chatbots (allow anonymous access)
CREATE POLICY "Allow anonymous access to chatbots"
ON public.chatbots
FOR ALL
USING (true);

-- Create RLS policies for agency_settings (allow anonymous access)
CREATE POLICY "Allow anonymous access to agency_settings"
ON public.agency_settings
FOR ALL
USING (true);

-- Create RLS policies for integration_settings (allow anonymous access)
CREATE POLICY "Allow anonymous access to integration_settings"
ON public.integration_settings
FOR ALL
USING (true);

-- Create RLS policies for api_keys (allow anonymous access)
CREATE POLICY "Allow anonymous access to api_keys"
ON public.api_keys
FOR ALL
USING (true);

-- Create RLS policies for projects (allow anonymous access)
CREATE POLICY "Allow anonymous access to projects"
ON public.projects
FOR ALL
USING (true);

-- Create triggers for updated_at columns
CREATE TRIGGER update_chatbots_updated_at
  BEFORE UPDATE ON public.chatbots
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agency_settings_updated_at
  BEFORE UPDATE ON public.agency_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_integration_settings_updated_at
  BEFORE UPDATE ON public.integration_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
