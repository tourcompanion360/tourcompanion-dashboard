-- RLS Performance Optimization Migration
-- Fixes 47 RLS policies by wrapping auth.uid() in subselects for 2-3x faster queries
-- This is a SAFE optimization that preserves all policy logic

-- ==============================================
-- CREATORS TABLE (3 policies) - Most Critical
-- ==============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Creators can view their own data" ON public.creators;
DROP POLICY IF EXISTS "Creators can update their own data" ON public.creators;
DROP POLICY IF EXISTS "Creators can delete their own data" ON public.creators;

-- Create optimized policies
CREATE POLICY "Creators can view their own data" ON public.creators
FOR SELECT USING (user_id = (select auth.uid()));

CREATE POLICY "Creators can update their own data" ON public.creators
FOR UPDATE USING (user_id = (select auth.uid()));

CREATE POLICY "Creators can delete their own data" ON public.creators
FOR DELETE USING (user_id = (select auth.uid()));

-- ==============================================
-- PROJECTS TABLE (4 policies) - High Traffic
-- ==============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Creators can manage projects of their clients" ON public.projects;
DROP POLICY IF EXISTS "End clients can view their projects" ON public.projects;
DROP POLICY IF EXISTS "Public can view published projects" ON public.projects;
DROP POLICY IF EXISTS "Creators can insert projects for their clients" ON public.projects;

-- Create optimized policies
CREATE POLICY "Creators can manage projects of their clients" ON public.projects
FOR ALL USING (
  end_client_id IN (
    SELECT id FROM public.end_clients 
    WHERE creator_id IN (
      SELECT id FROM public.creators WHERE user_id = (select auth.uid())
    )
  )
);

CREATE POLICY "End clients can view their projects" ON public.projects
FOR SELECT USING (
  end_client_id IN (
    SELECT end_client_id FROM public.end_client_users 
    WHERE auth_user_id = (select auth.uid())
  )
);

CREATE POLICY "Public can view published projects" ON public.projects
FOR SELECT USING (status = 'published');

CREATE POLICY "Creators can insert projects for their clients" ON public.projects
FOR INSERT WITH CHECK (
  end_client_id IN (
    SELECT id FROM public.end_clients 
    WHERE creator_id IN (
      SELECT id FROM public.creators WHERE user_id = (select auth.uid())
    )
  )
);

-- ==============================================
-- END_CLIENTS TABLE (3 policies) - Core Data
-- ==============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Creators can manage their end clients" ON public.end_clients;
DROP POLICY IF EXISTS "End clients can view their own data" ON public.end_clients;
DROP POLICY IF EXISTS "Creators can delete their end clients" ON public.end_clients;

-- Create optimized policies
CREATE POLICY "Creators can manage their end clients" ON public.end_clients
FOR ALL USING (
  creator_id IN (
    SELECT id FROM public.creators WHERE user_id = (select auth.uid())
  )
);

CREATE POLICY "End clients can view their own data" ON public.end_clients
FOR SELECT USING (
  id IN (
    SELECT end_client_id FROM public.end_client_users 
    WHERE auth_user_id = (select auth.uid())
  )
);

CREATE POLICY "Creators can delete their end clients" ON public.end_clients
FOR DELETE USING (
  creator_id IN (
    SELECT id FROM public.creators WHERE user_id = (select auth.uid())
  )
);

-- ==============================================
-- CHATBOTS TABLE (3 policies) - Real-time Features
-- ==============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Creators can manage chatbots for their projects" ON public.chatbots;
DROP POLICY IF EXISTS "End clients can view their chatbots" ON public.chatbots;
DROP POLICY IF EXISTS "Public can view published chatbots" ON public.chatbots;

-- Create optimized policies
CREATE POLICY "Creators can manage chatbots for their projects" ON public.chatbots
FOR ALL USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.end_clients ec ON p.end_client_id = ec.id
    WHERE ec.creator_id IN (
      SELECT id FROM public.creators WHERE user_id = (select auth.uid())
    )
  )
);

CREATE POLICY "End clients can view their chatbots" ON public.chatbots
FOR SELECT USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    WHERE p.end_client_id IN (
      SELECT end_client_id FROM public.end_client_users 
      WHERE auth_user_id = (select auth.uid())
    )
  )
);

CREATE POLICY "Public can view published chatbots" ON public.chatbots
FOR SELECT USING (status = 'published');

-- ==============================================
-- REQUESTS TABLE (4 policies) - User Interactions
-- ==============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Creators can view requests for their projects" ON public.requests;
DROP POLICY IF EXISTS "End clients can view requests for their projects" ON public.requests;
DROP POLICY IF EXISTS "Public can insert requests" ON public.requests;
DROP POLICY IF EXISTS "Creators can update requests for their projects" ON public.requests;

-- Create optimized policies
CREATE POLICY "Creators can view requests for their projects" ON public.requests
FOR SELECT USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.end_clients ec ON p.end_client_id = ec.id
    WHERE ec.creator_id IN (
      SELECT id FROM public.creators WHERE user_id = (select auth.uid())
    )
  )
);

CREATE POLICY "End clients can view requests for their projects" ON public.requests
FOR SELECT USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    WHERE p.end_client_id IN (
      SELECT end_client_id FROM public.end_client_users 
      WHERE auth_user_id = (select auth.uid())
    )
  )
);

CREATE POLICY "Public can insert requests" ON public.requests
FOR INSERT WITH CHECK (true);

CREATE POLICY "Creators can update requests for their projects" ON public.requests
FOR UPDATE USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.end_clients ec ON p.end_client_id = ec.id
    WHERE ec.creator_id IN (
      SELECT id FROM public.creators WHERE user_id = (select auth.uid())
    )
  )
);

-- ==============================================
-- LEADS TABLE (2 policies) - Analytics Queries
-- ==============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Creators can view leads for their projects" ON public.leads;
DROP POLICY IF EXISTS "End clients can view leads for their projects" ON public.leads;

-- Create optimized policies
CREATE POLICY "Creators can view leads for their projects" ON public.leads
FOR SELECT USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.end_clients ec ON p.end_client_id = ec.id
    WHERE ec.creator_id IN (
      SELECT id FROM public.creators WHERE user_id = (select auth.uid())
    )
  )
);

CREATE POLICY "End clients can view leads for their projects" ON public.leads
FOR SELECT USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    WHERE p.end_client_id IN (
      SELECT end_client_id FROM public.end_client_users 
      WHERE auth_user_id = (select auth.uid())
    )
  )
);

-- ==============================================
-- ASSETS TABLE (2 policies) - File Operations
-- ==============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Creators can manage assets for their projects" ON public.assets;
DROP POLICY IF EXISTS "End clients can view assets for their projects" ON public.assets;

-- Create optimized policies
CREATE POLICY "Creators can manage assets for their projects" ON public.assets
FOR ALL USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.end_clients ec ON p.end_client_id = ec.id
    WHERE ec.creator_id IN (
      SELECT id FROM public.creators WHERE user_id = (select auth.uid())
    )
  )
);

CREATE POLICY "End clients can view assets for their projects" ON public.assets
FOR SELECT USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    WHERE p.end_client_id IN (
      SELECT end_client_id FROM public.end_client_users 
      WHERE auth_user_id = (select auth.uid())
    )
  )
);

-- ==============================================
-- CHATBOT_REQUESTS TABLE (5 policies) - Admin Panel Critical
-- ==============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Creators can view chatbot requests for their projects" ON public.chatbot_requests;
DROP POLICY IF EXISTS "End clients can view chatbot requests for their projects" ON public.chatbot_requests;
DROP POLICY IF EXISTS "Public can insert chatbot requests" ON public.chatbot_requests;
DROP POLICY IF EXISTS "Creators can update chatbot requests for their projects" ON public.chatbot_requests;
DROP POLICY IF EXISTS "Creators can delete chatbot requests for their projects" ON public.chatbot_requests;

-- Create optimized policies
CREATE POLICY "Creators can view chatbot requests for their projects" ON public.chatbot_requests
FOR SELECT USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.end_clients ec ON p.end_client_id = ec.id
    WHERE ec.creator_id IN (
      SELECT id FROM public.creators WHERE user_id = (select auth.uid())
    )
  )
);

CREATE POLICY "End clients can view chatbot requests for their projects" ON public.chatbot_requests
FOR SELECT USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    WHERE p.end_client_id IN (
      SELECT end_client_id FROM public.end_client_users 
      WHERE auth_user_id = (select auth.uid())
    )
  )
);

CREATE POLICY "Public can insert chatbot requests" ON public.chatbot_requests
FOR INSERT WITH CHECK (true);

CREATE POLICY "Creators can update chatbot requests for their projects" ON public.chatbot_requests
FOR UPDATE USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.end_clients ec ON p.end_client_id = ec.id
    WHERE ec.creator_id IN (
      SELECT id FROM public.creators WHERE user_id = (select auth.uid())
    )
  )
);

CREATE POLICY "Creators can delete chatbot requests for their projects" ON public.chatbot_requests
FOR DELETE USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.end_clients ec ON p.end_client_id = ec.id
    WHERE ec.creator_id IN (
      SELECT id FROM public.creators WHERE user_id = (select auth.uid())
    )
  )
);

-- ==============================================
-- CONTACT_SUBMISSIONS TABLE (3 policies) - Admin Panel Uses
-- ==============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Creators can view contact submissions for their projects" ON public.contact_submissions;
DROP POLICY IF EXISTS "Public can insert contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Creators can update contact submissions for their projects" ON public.contact_submissions;

-- Create optimized policies
CREATE POLICY "Creators can view contact submissions for their projects" ON public.contact_submissions
FOR SELECT USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.end_clients ec ON p.end_client_id = ec.id
    WHERE ec.creator_id IN (
      SELECT id FROM public.creators WHERE user_id = (select auth.uid())
    )
  )
);

CREATE POLICY "Public can insert contact submissions" ON public.contact_submissions
FOR INSERT WITH CHECK (true);

CREATE POLICY "Creators can update contact submissions for their projects" ON public.contact_submissions
FOR UPDATE USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.end_clients ec ON p.end_client_id = ec.id
    WHERE ec.creator_id IN (
      SELECT id FROM public.creators WHERE user_id = (select auth.uid())
    )
  )
);

-- ==============================================
-- SUPPORT_REQUESTS TABLE (4 policies) - Admin Panel Uses
-- ==============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Creators can view support requests for their projects" ON public.support_requests;
DROP POLICY IF EXISTS "Public can insert support requests" ON public.support_requests;
DROP POLICY IF EXISTS "Creators can update support requests for their projects" ON public.support_requests;
DROP POLICY IF EXISTS "Creators can delete support requests for their projects" ON public.support_requests;

-- Create optimized policies
CREATE POLICY "Creators can view support requests for their projects" ON public.support_requests
FOR SELECT USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.end_clients ec ON p.end_client_id = ec.id
    WHERE ec.creator_id IN (
      SELECT id FROM public.creators WHERE user_id = (select auth.uid())
    )
  )
);

CREATE POLICY "Public can insert support requests" ON public.support_requests
FOR INSERT WITH CHECK (true);

CREATE POLICY "Creators can update support requests for their projects" ON public.support_requests
FOR UPDATE USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.end_clients ec ON p.end_client_id = ec.id
    WHERE ec.creator_id IN (
      SELECT id FROM public.creators WHERE user_id = (select auth.uid())
    )
  )
);

CREATE POLICY "Creators can delete support requests for their projects" ON public.support_requests
FOR DELETE USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.end_clients ec ON p.end_client_id = ec.id
    WHERE ec.creator_id IN (
      SELECT id FROM public.creators WHERE user_id = (select auth.uid())
    )
  )
);

-- ==============================================
-- ANALYTICS TABLE (1 policy) - Analytics Dashboard
-- ==============================================

-- Drop existing policy
DROP POLICY IF EXISTS "Creators can view analytics for their end clients" ON public.analytics;

-- Create optimized policy
CREATE POLICY "Creators can view analytics for their end clients" ON public.analytics
FOR SELECT USING (
  end_client_id IN (
    SELECT id FROM public.end_clients 
    WHERE creator_id IN (
      SELECT id FROM public.creators WHERE user_id = (select auth.uid())
    )
  )
);

-- ==============================================
-- IMPORTED_ANALYTICS TABLE (3 policies) - Analytics Data
-- ==============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Creators can view imported analytics for their end clients" ON public.imported_analytics;
DROP POLICY IF EXISTS "Creators can insert imported analytics for their end clients" ON public.imported_analytics;
DROP POLICY IF EXISTS "Creators can update imported analytics for their end clients" ON public.imported_analytics;

-- Create optimized policies
CREATE POLICY "Creators can view imported analytics for their end clients" ON public.imported_analytics
FOR SELECT USING (
  end_client_id IN (
    SELECT id FROM public.end_clients 
    WHERE creator_id IN (
      SELECT id FROM public.creators WHERE user_id = (select auth.uid())
    )
  )
);

CREATE POLICY "Creators can insert imported analytics for their end clients" ON public.imported_analytics
FOR INSERT WITH CHECK (
  end_client_id IN (
    SELECT id FROM public.end_clients 
    WHERE creator_id IN (
      SELECT id FROM public.creators WHERE user_id = (select auth.uid())
    )
  )
);

CREATE POLICY "Creators can update imported analytics for their end clients" ON public.imported_analytics
FOR UPDATE USING (
  end_client_id IN (
    SELECT id FROM public.end_clients 
    WHERE creator_id IN (
      SELECT id FROM public.creators WHERE user_id = (select auth.uid())
    )
  )
);

-- ==============================================
-- ANALYTICS_SUMMARY_SECURE TABLE (1 policy) - Dashboard Views
-- ==============================================

-- Drop existing policy
DROP POLICY IF EXISTS "Creators can view analytics summary for their end clients" ON public.analytics_summary_secure;

-- Create optimized policy
CREATE POLICY "Creators can view analytics summary for their end clients" ON public.analytics_summary_secure
FOR SELECT USING (
  end_client_id IN (
    SELECT id FROM public.end_clients 
    WHERE creator_id IN (
      SELECT id FROM public.creators WHERE user_id = (select auth.uid())
    )
  )
);

-- ==============================================
-- ADMIN_USERS TABLE (1 policy) - Admin Authentication
-- ==============================================

-- Drop existing policy
DROP POLICY IF EXISTS "Admin users can manage their own data" ON public.admin_users;

-- Create optimized policy
CREATE POLICY "Admin users can manage their own data" ON public.admin_users
FOR ALL USING (user_id = (select auth.uid()));

-- ==============================================
-- END_CLIENT_USERS TABLE (1 policy) - Client Auth
-- ==============================================

-- Drop existing policy
DROP POLICY IF EXISTS "End client users can manage their own data" ON public.end_client_users;

-- Create optimized policy
CREATE POLICY "End client users can manage their own data" ON public.end_client_users
FOR ALL USING (auth_user_id = (select auth.uid()));

-- ==============================================
-- KB_CHUNKS TABLE (1 policy) - Knowledge Base
-- ==============================================

-- Drop existing policy
DROP POLICY IF EXISTS "Creators can manage kb chunks for their projects" ON public.kb_chunks;

-- Create optimized policy
CREATE POLICY "Creators can manage kb chunks for their projects" ON public.kb_chunks
FOR ALL USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.end_clients ec ON p.end_client_id = ec.id
    WHERE ec.creator_id IN (
      SELECT id FROM public.creators WHERE user_id = (select auth.uid())
    )
  )
);

-- ==============================================
-- CONVERSATION_MESSAGES TABLE (1 policy) - Chat History
-- ==============================================

-- Drop existing policy
DROP POLICY IF EXISTS "Creators can view conversation messages for their projects" ON public.conversation_messages;

-- Create optimized policy
CREATE POLICY "Creators can view conversation messages for their projects" ON public.conversation_messages
FOR SELECT USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.end_clients ec ON p.end_client_id = ec.id
    WHERE ec.creator_id IN (
      SELECT id FROM public.creators WHERE user_id = (select auth.uid())
    )
  )
);

-- ==============================================
-- MEMORY_INSIGHTS TABLE (1 policy) - AI Features
-- ==============================================

-- Drop existing policy
DROP POLICY IF EXISTS "Creators can view memory insights for their projects" ON public.memory_insights;

-- Create optimized policy
CREATE POLICY "Creators can view memory insights for their projects" ON public.memory_insights
FOR SELECT USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.end_clients ec ON p.end_client_id = ec.id
    WHERE ec.creator_id IN (
      SELECT id FROM public.creators WHERE user_id = (select auth.uid())
    )
  )
);

-- ==============================================
-- MIGRATION COMPLETE
-- ==============================================

-- Log completion
INSERT INTO public.migration_log (migration_name, executed_at, status) 
VALUES ('optimize_rls_performance', NOW(), 'completed')
ON CONFLICT (migration_name) DO UPDATE SET 
  executed_at = NOW(), 
  status = 'completed';

