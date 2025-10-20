-- Consolidate Duplicate Policies Migration
-- Merges 50+ duplicate permissive policies to reduce redundant evaluations
-- This improves performance by reducing policy evaluation overhead

-- ==============================================
-- CREATORS TABLE - Consolidate 3 SELECT policies into 1
-- ==============================================

-- Drop existing duplicate policies
DROP POLICY IF EXISTS "Creators can view their own data" ON public.creators;
DROP POLICY IF EXISTS "Public can view creators" ON public.creators;
DROP POLICY IF EXISTS "Admin can view all creators" ON public.creators;

-- Create unified policy
CREATE POLICY "Unified creators access policy" ON public.creators
FOR SELECT USING (
  -- Creators can view their own data
  user_id = (select auth.uid())
  OR
  -- Public can view (for public profiles)
  true
  OR
  -- Admin users can view all (if admin_users table exists and user is admin)
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = (select auth.uid())
  )
);

-- ==============================================
-- END_CLIENTS TABLE - Consolidate 3 DELETE policies into 1
-- ==============================================

-- Drop existing duplicate policies
DROP POLICY IF EXISTS "Creators can delete their end clients" ON public.end_clients;
DROP POLICY IF EXISTS "Admin can delete end clients" ON public.end_clients;
DROP POLICY IF EXISTS "System can delete end clients" ON public.end_clients;

-- Create unified policy
CREATE POLICY "Unified end clients delete policy" ON public.end_clients
FOR DELETE USING (
  -- Creators can delete their end clients
  creator_id IN (
    SELECT id FROM public.creators WHERE user_id = (select auth.uid())
  )
  OR
  -- Admin users can delete any
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = (select auth.uid())
  )
  OR
  -- System operations (for cleanup, etc.)
  false -- Disabled for safety, enable if needed
);

-- ==============================================
-- PROJECTS TABLE - Consolidate 4 SELECT policies into 1
-- ==============================================

-- Drop existing duplicate policies
DROP POLICY IF EXISTS "Creators can view projects of their clients" ON public.projects;
DROP POLICY IF EXISTS "End clients can view their projects" ON public.projects;
DROP POLICY IF EXISTS "Public can view published projects" ON public.projects;
DROP POLICY IF EXISTS "Admin can view all projects" ON public.projects;

-- Create unified policy
CREATE POLICY "Unified projects access policy" ON public.projects
FOR SELECT USING (
  -- Creators can view projects of their clients
  end_client_id IN (
    SELECT id FROM public.end_clients 
    WHERE creator_id IN (
      SELECT id FROM public.creators WHERE user_id = (select auth.uid())
    )
  )
  OR
  -- End clients can view their projects
  end_client_id IN (
    SELECT end_client_id FROM public.end_client_users 
    WHERE auth_user_id = (select auth.uid())
  )
  OR
  -- Public can view published projects
  status = 'published'
  OR
  -- Admin users can view all
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = (select auth.uid())
  )
);

-- ==============================================
-- REQUESTS TABLE - Consolidate 4 policies (SELECT/INSERT/UPDATE/DELETE)
-- ==============================================

-- Drop existing duplicate policies
DROP POLICY IF EXISTS "Creators can view requests for their projects" ON public.requests;
DROP POLICY IF EXISTS "End clients can view requests for their projects" ON public.requests;
DROP POLICY IF EXISTS "Public can view requests" ON public.requests;
DROP POLICY IF EXISTS "Admin can view all requests" ON public.requests;

DROP POLICY IF EXISTS "Public can insert requests" ON public.requests;
DROP POLICY IF EXISTS "Creators can insert requests for their projects" ON public.requests;

DROP POLICY IF EXISTS "Creators can update requests for their projects" ON public.requests;
DROP POLICY IF EXISTS "Admin can update all requests" ON public.requests;

DROP POLICY IF EXISTS "Creators can delete requests for their projects" ON public.requests;
DROP POLICY IF EXISTS "Admin can delete all requests" ON public.requests;

-- Create unified policies
CREATE POLICY "Unified requests select policy" ON public.requests
FOR SELECT USING (
  -- Creators can view requests for their projects
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.end_clients ec ON p.end_client_id = ec.id
    WHERE ec.creator_id IN (
      SELECT id FROM public.creators WHERE user_id = (select auth.uid())
    )
  )
  OR
  -- End clients can view requests for their projects
  project_id IN (
    SELECT p.id FROM public.projects p
    WHERE p.end_client_id IN (
      SELECT end_client_id FROM public.end_client_users 
      WHERE auth_user_id = (select auth.uid())
    )
  )
  OR
  -- Public can view (for public requests)
  true
  OR
  -- Admin users can view all
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = (select auth.uid())
  )
);

CREATE POLICY "Unified requests insert policy" ON public.requests
FOR INSERT WITH CHECK (
  -- Public can insert requests
  true
  OR
  -- Creators can insert requests for their projects
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.end_clients ec ON p.end_client_id = ec.id
    WHERE ec.creator_id IN (
      SELECT id FROM public.creators WHERE user_id = (select auth.uid())
    )
  )
);

CREATE POLICY "Unified requests update policy" ON public.requests
FOR UPDATE USING (
  -- Creators can update requests for their projects
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.end_clients ec ON p.end_client_id = ec.id
    WHERE ec.creator_id IN (
      SELECT id FROM public.creators WHERE user_id = (select auth.uid())
    )
  )
  OR
  -- Admin users can update all
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = (select auth.uid())
  )
);

CREATE POLICY "Unified requests delete policy" ON public.requests
FOR DELETE USING (
  -- Creators can delete requests for their projects
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.end_clients ec ON p.end_client_id = ec.id
    WHERE ec.creator_id IN (
      SELECT id FROM public.creators WHERE user_id = (select auth.uid())
    )
  )
  OR
  -- Admin users can delete all
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = (select auth.uid())
  )
);

-- ==============================================
-- CHATBOT_REQUESTS TABLE - Consolidate 3 SELECT policies into 1
-- ==============================================

-- Drop existing duplicate policies
DROP POLICY IF EXISTS "Creators can view chatbot requests for their projects" ON public.chatbot_requests;
DROP POLICY IF EXISTS "End clients can view chatbot requests for their projects" ON public.chatbot_requests;
DROP POLICY IF EXISTS "Admin can view all chatbot requests" ON public.chatbot_requests;

-- Create unified policy
CREATE POLICY "Unified chatbot requests select policy" ON public.chatbot_requests
FOR SELECT USING (
  -- Creators can view chatbot requests for their projects
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.end_clients ec ON p.end_client_id = ec.id
    WHERE ec.creator_id IN (
      SELECT id FROM public.creators WHERE user_id = (select auth.uid())
    )
  )
  OR
  -- End clients can view chatbot requests for their projects
  project_id IN (
    SELECT p.id FROM public.projects p
    WHERE p.end_client_id IN (
      SELECT end_client_id FROM public.end_client_users 
      WHERE auth_user_id = (select auth.uid())
    )
  )
  OR
  -- Admin users can view all
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = (select auth.uid())
  )
);

-- ==============================================
-- SUPPORT_REQUESTS TABLE - Consolidate 2 policies for each operation
-- ==============================================

-- Drop existing duplicate policies
DROP POLICY IF EXISTS "Creators can view support requests for their projects" ON public.support_requests;
DROP POLICY IF EXISTS "Admin can view all support requests" ON public.support_requests;

DROP POLICY IF EXISTS "Public can insert support requests" ON public.support_requests;
DROP POLICY IF EXISTS "Creators can insert support requests for their projects" ON public.support_requests;

DROP POLICY IF EXISTS "Creators can update support requests for their projects" ON public.support_requests;
DROP POLICY IF EXISTS "Admin can update all support requests" ON public.support_requests;

-- Create unified policies
CREATE POLICY "Unified support requests select policy" ON public.support_requests
FOR SELECT USING (
  -- Creators can view support requests for their projects
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.end_clients ec ON p.end_client_id = ec.id
    WHERE ec.creator_id IN (
      SELECT id FROM public.creators WHERE user_id = (select auth.uid())
    )
  )
  OR
  -- Admin users can view all
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = (select auth.uid())
  )
);

CREATE POLICY "Unified support requests insert policy" ON public.support_requests
FOR INSERT WITH CHECK (
  -- Public can insert support requests
  true
  OR
  -- Creators can insert support requests for their projects
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.end_clients ec ON p.end_client_id = ec.id
    WHERE ec.creator_id IN (
      SELECT id FROM public.creators WHERE user_id = (select auth.uid())
    )
  )
);

CREATE POLICY "Unified support requests update policy" ON public.support_requests
FOR UPDATE USING (
  -- Creators can update support requests for their projects
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.end_clients ec ON p.end_client_id = ec.id
    WHERE ec.creator_id IN (
      SELECT id FROM public.creators WHERE user_id = (select auth.uid())
    )
  )
  OR
  -- Admin users can update all
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = (select auth.uid())
  )
);

-- ==============================================
-- CONTACT_SUBMISSIONS TABLE - Consolidate 2 policies for each operation
-- ==============================================

-- Drop existing duplicate policies
DROP POLICY IF EXISTS "Creators can view contact submissions for their projects" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admin can view all contact submissions" ON public.contact_submissions;

DROP POLICY IF EXISTS "Public can insert contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Creators can insert contact submissions for their projects" ON public.contact_submissions;

DROP POLICY IF EXISTS "Creators can update contact submissions for their projects" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admin can update all contact submissions" ON public.contact_submissions;

-- Create unified policies
CREATE POLICY "Unified contact submissions select policy" ON public.contact_submissions
FOR SELECT USING (
  -- Creators can view contact submissions for their projects
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.end_clients ec ON p.end_client_id = ec.id
    WHERE ec.creator_id IN (
      SELECT id FROM public.creators WHERE user_id = (select auth.uid())
    )
  )
  OR
  -- Admin users can view all
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = (select auth.uid())
  )
);

CREATE POLICY "Unified contact submissions insert policy" ON public.contact_submissions
FOR INSERT WITH CHECK (
  -- Public can insert contact submissions
  true
  OR
  -- Creators can insert contact submissions for their projects
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.end_clients ec ON p.end_client_id = ec.id
    WHERE ec.creator_id IN (
      SELECT id FROM public.creators WHERE user_id = (select auth.uid())
    )
  )
);

CREATE POLICY "Unified contact submissions update policy" ON public.contact_submissions
FOR UPDATE USING (
  -- Creators can update contact submissions for their projects
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.end_clients ec ON p.end_client_id = ec.id
    WHERE ec.creator_id IN (
      SELECT id FROM public.creators WHERE user_id = (select auth.uid())
    )
  )
  OR
  -- Admin users can update all
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = (select auth.uid())
  )
);

-- ==============================================
-- ANALYTICS TABLE - Consolidate 2 policies into 1
-- ==============================================

-- Drop existing duplicate policies
DROP POLICY IF EXISTS "Creators can view analytics for their end clients" ON public.analytics;
DROP POLICY IF EXISTS "Admin can view all analytics" ON public.analytics;

-- Create unified policy
CREATE POLICY "Unified analytics access policy" ON public.analytics
FOR SELECT USING (
  -- Creators can view analytics for their end clients
  end_client_id IN (
    SELECT id FROM public.end_clients 
    WHERE creator_id IN (
      SELECT id FROM public.creators WHERE user_id = (select auth.uid())
    )
  )
  OR
  -- Admin users can view all
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = (select auth.uid())
  )
);

-- ==============================================
-- IMPORTED_ANALYTICS TABLE - Consolidate 2 policies for each operation
-- ==============================================

-- Drop existing duplicate policies
DROP POLICY IF EXISTS "Creators can view imported analytics for their end clients" ON public.imported_analytics;
DROP POLICY IF EXISTS "Admin can view all imported analytics" ON public.imported_analytics;

DROP POLICY IF EXISTS "Creators can insert imported analytics for their end clients" ON public.imported_analytics;
DROP POLICY IF EXISTS "Admin can insert imported analytics" ON public.imported_analytics;

DROP POLICY IF EXISTS "Creators can update imported analytics for their end clients" ON public.imported_analytics;
DROP POLICY IF EXISTS "Admin can update all imported analytics" ON public.imported_analytics;

-- Create unified policies
CREATE POLICY "Unified imported analytics select policy" ON public.imported_analytics
FOR SELECT USING (
  -- Creators can view imported analytics for their end clients
  end_client_id IN (
    SELECT id FROM public.end_clients 
    WHERE creator_id IN (
      SELECT id FROM public.creators WHERE user_id = (select auth.uid())
    )
  )
  OR
  -- Admin users can view all
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = (select auth.uid())
  )
);

CREATE POLICY "Unified imported analytics insert policy" ON public.imported_analytics
FOR INSERT WITH CHECK (
  -- Creators can insert imported analytics for their end clients
  end_client_id IN (
    SELECT id FROM public.end_clients 
    WHERE creator_id IN (
      SELECT id FROM public.creators WHERE user_id = (select auth.uid())
    )
  )
  OR
  -- Admin users can insert any
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = (select auth.uid())
  )
);

CREATE POLICY "Unified imported analytics update policy" ON public.imported_analytics
FOR UPDATE USING (
  -- Creators can update imported analytics for their end clients
  end_client_id IN (
    SELECT id FROM public.end_clients 
    WHERE creator_id IN (
      SELECT id FROM public.creators WHERE user_id = (select auth.uid())
    )
  )
  OR
  -- Admin users can update all
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = (select auth.uid())
  )
);

-- ==============================================
-- ANALYTICS_SUMMARY_SECURE TABLE - Consolidate 2 policies into 1
-- ==============================================

-- Drop existing duplicate policies
DROP POLICY IF EXISTS "Creators can view analytics summary for their end clients" ON public.analytics_summary_secure;
DROP POLICY IF EXISTS "Admin can view all analytics summary" ON public.analytics_summary_secure;

-- Create unified policy
CREATE POLICY "Unified analytics summary access policy" ON public.analytics_summary_secure
FOR SELECT USING (
  -- Creators can view analytics summary for their end clients
  end_client_id IN (
    SELECT id FROM public.end_clients 
    WHERE creator_id IN (
      SELECT id FROM public.creators WHERE user_id = (select auth.uid())
    )
  )
  OR
  -- Admin users can view all
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = (select auth.uid())
  )
);

-- ==============================================
-- MIGRATION COMPLETE
-- ==============================================

-- Log completion
INSERT INTO public.migration_log (migration_name, executed_at, status) 
VALUES ('consolidate_duplicate_policies', NOW(), 'completed')
ON CONFLICT (migration_name) DO UPDATE SET 
  executed_at = NOW(), 
  status = 'completed';

