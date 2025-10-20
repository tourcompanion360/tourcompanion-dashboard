-- Fix Critical Security Issues - RLS Policies
-- This migration replaces anonymous access with proper authentication
-- while maintaining app functionality

-- =============================================
-- 1. FIX PROJECTS TABLE - Remove anonymous access
-- =============================================

-- Drop the dangerous anonymous access policy
DROP POLICY IF EXISTS "Allow anonymous access to projects" ON public.projects;

-- Add secure policies for different user types
-- Authenticated users can view projects (for creators and clients)
CREATE POLICY "Authenticated users can view projects" ON public.projects
  FOR SELECT USING (auth.role() = 'authenticated');

-- Creators can manage projects of their clients
CREATE POLICY "Creators can manage their clients' projects" ON public.projects
  FOR ALL USING (
    end_client_id IN (
      SELECT id FROM public.end_clients 
      WHERE creator_id IN (
        SELECT id FROM public.creators WHERE user_id = auth.uid()
      )
    )
  );

-- End clients can view their own projects
CREATE POLICY "End clients can view their own projects" ON public.projects
  FOR SELECT USING (
    end_client_id IN (
      SELECT end_client_id FROM public.end_client_users 
      WHERE auth_user_id = auth.uid()
    )
  );

-- =============================================
-- 2. FIX CHATBOTS TABLE - Remove anonymous access
-- =============================================

-- Drop the dangerous anonymous access policy
DROP POLICY IF EXISTS "Allow anonymous access to chatbots" ON public.chatbots;

-- Authenticated users can view chatbots
CREATE POLICY "Authenticated users can view chatbots" ON public.chatbots
  FOR SELECT USING (auth.role() = 'authenticated');

-- Creators can manage chatbots of their clients
CREATE POLICY "Creators can manage their clients' chatbots" ON public.chatbots
  FOR ALL USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      WHERE p.end_client_id IN (
        SELECT id FROM public.end_clients 
        WHERE creator_id IN (
          SELECT id FROM public.creators WHERE user_id = auth.uid()
        )
      )
    )
  );

-- End clients can view their own chatbots
CREATE POLICY "End clients can view their own chatbots" ON public.chatbots
  FOR SELECT USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      WHERE p.end_client_id IN (
        SELECT end_client_id FROM public.end_client_users 
        WHERE auth_user_id = auth.uid()
      )
    )
  );

-- =============================================
-- 3. FIX AGENCY_SETTINGS TABLE - Remove anonymous access
-- =============================================

-- Drop the dangerous anonymous access policy
DROP POLICY IF EXISTS "Allow anonymous access to agency_settings" ON public.agency_settings;

-- Only authenticated users can view agency settings
CREATE POLICY "Authenticated users can view agency settings" ON public.agency_settings
  FOR SELECT USING (auth.role() = 'authenticated');

-- Creators can manage their agency settings
CREATE POLICY "Creators can manage agency settings" ON public.agency_settings
  FOR ALL USING (
    creator_id IN (
      SELECT id FROM public.creators WHERE user_id = auth.uid()
    )
  );

-- =============================================
-- 4. FIX INTEGRATION_SETTINGS TABLE - Remove anonymous access
-- =============================================

-- Drop the dangerous anonymous access policy
DROP POLICY IF EXISTS "Allow anonymous access to integration_settings" ON public.integration_settings;

-- Only authenticated users can view integration settings
CREATE POLICY "Authenticated users can view integration settings" ON public.integration_settings
  FOR SELECT USING (auth.role() = 'authenticated');

-- Creators can manage their integration settings
CREATE POLICY "Creators can manage integration settings" ON public.integration_settings
  FOR ALL USING (
    creator_id IN (
      SELECT id FROM public.creators WHERE user_id = auth.uid()
    )
  );

-- =============================================
-- 5. FIX API_KEYS TABLE - Remove anonymous access
-- =============================================

-- Drop the dangerous anonymous access policy
DROP POLICY IF EXISTS "Allow anonymous access to api_keys" ON public.api_keys;

-- Only authenticated users can view API keys
CREATE POLICY "Authenticated users can view API keys" ON public.api_keys
  FOR SELECT USING (auth.role() = 'authenticated');

-- Creators can manage their API keys
CREATE POLICY "Creators can manage their API keys" ON public.api_keys
  FOR ALL USING (
    creator_id IN (
      SELECT id FROM public.creators WHERE user_id = auth.uid()
    )
  );

-- =============================================
-- 6. ENSURE OTHER TABLES HAVE PROPER POLICIES
-- =============================================

-- Make sure creators table has proper policies
DROP POLICY IF EXISTS "Creators can manage their own data" ON public.creators;
CREATE POLICY "Creators can manage their own data" ON public.creators
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Make sure end_clients table has proper policies
DROP POLICY IF EXISTS "Creators can manage their end clients" ON public.end_clients;
CREATE POLICY "Creators can manage their end clients" ON public.end_clients
  FOR ALL USING (
    creator_id IN (
      SELECT id FROM public.creators WHERE user_id = auth.uid()
    )
  );

-- Make sure end_client_users table has proper policies
DROP POLICY IF EXISTS "Creators can manage mappings for their clients" ON public.end_client_users;
CREATE POLICY "Creators can manage mappings for their clients" ON public.end_client_users
  FOR ALL USING (
    end_client_id IN (
      SELECT id FROM public.end_clients 
      WHERE creator_id IN (
        SELECT id FROM public.creators WHERE user_id = auth.uid()
      )
    )
  );

-- =============================================
-- 7. ADD POLICIES FOR OTHER CRITICAL TABLES
-- =============================================

-- Analytics table
DROP POLICY IF EXISTS "Creators can manage analytics of their clients" ON public.analytics;
CREATE POLICY "Creators can manage analytics of their clients" ON public.analytics
  FOR ALL USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      WHERE p.end_client_id IN (
        SELECT id FROM public.end_clients 
        WHERE creator_id IN (
          SELECT id FROM public.creators WHERE user_id = auth.uid()
        )
      )
    )
  );

-- End clients can view their own analytics
CREATE POLICY "End clients can view their own analytics" ON public.analytics
  FOR SELECT USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      WHERE p.end_client_id IN (
        SELECT end_client_id FROM public.end_client_users 
        WHERE auth_user_id = auth.uid()
      )
    )
  );

-- Leads table
DROP POLICY IF EXISTS "Creators can manage leads from their clients" ON public.leads;
CREATE POLICY "Creators can manage leads from their clients" ON public.leads
  FOR ALL USING (
    chatbot_id IN (
      SELECT cb.id FROM public.chatbots cb
      JOIN public.projects p ON cb.project_id = p.id
      WHERE p.end_client_id IN (
        SELECT id FROM public.end_clients 
        WHERE creator_id IN (
          SELECT id FROM public.creators WHERE user_id = auth.uid()
        )
      )
    )
  );

-- End clients can view their own leads
CREATE POLICY "End clients can view their own leads" ON public.leads
  FOR SELECT USING (
    chatbot_id IN (
      SELECT cb.id FROM public.chatbots cb
      JOIN public.projects p ON cb.project_id = p.id
      WHERE p.end_client_id IN (
        SELECT end_client_id FROM public.end_client_users 
        WHERE auth_user_id = auth.uid()
      )
    )
  );

-- Requests table
DROP POLICY IF EXISTS "Creators can manage requests from their clients" ON public.requests;
CREATE POLICY "Creators can manage requests from their clients" ON public.requests
  FOR ALL USING (
    end_client_id IN (
      SELECT id FROM public.end_clients 
      WHERE creator_id IN (
        SELECT id FROM public.creators WHERE user_id = auth.uid()
      )
    )
  );

-- Assets table
DROP POLICY IF EXISTS "Creators can manage their own assets" ON public.assets;
CREATE POLICY "Creators can manage their own assets" ON public.assets
  FOR ALL USING (
    creator_id IN (
      SELECT id FROM public.creators WHERE user_id = auth.uid()
    )
  );

-- End clients can view assets for their projects
CREATE POLICY "End clients can view assets for their projects" ON public.assets
  FOR SELECT USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      WHERE p.end_client_id IN (
        SELECT end_client_id FROM public.end_client_users 
        WHERE auth_user_id = auth.uid()
      )
    )
  );

-- =============================================
-- 8. ADD COMMENT FOR DOCUMENTATION
-- =============================================

COMMENT ON TABLE public.projects IS 'Projects table - secured with proper RLS policies for creators and end clients';
COMMENT ON TABLE public.chatbots IS 'Chatbots table - secured with proper RLS policies for creators and end clients';
COMMENT ON TABLE public.agency_settings IS 'Agency settings - secured with proper RLS policies for creators only';
COMMENT ON TABLE public.integration_settings IS 'Integration settings - secured with proper RLS policies for creators only';
COMMENT ON TABLE public.api_keys IS 'API keys - secured with proper RLS policies for creators only';

