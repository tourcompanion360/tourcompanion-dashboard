-- Rollback RLS Optimization Migration
-- Emergency rollback script to revert RLS performance optimizations
-- Use this ONLY if issues occur after running the optimization migrations

-- ==============================================
-- WARNING: This rollback will revert performance improvements
-- Only use if there are critical issues with the optimized policies
-- ==============================================

-- ==============================================
-- ROLLBACK CREATORS TABLE POLICIES
-- ==============================================

-- Drop optimized policies
DROP POLICY IF EXISTS "Creators can view their own data" ON public.creators;
DROP POLICY IF EXISTS "Creators can update their own data" ON public.creators;
DROP POLICY IF EXISTS "Creators can delete their own data" ON public.creators;
DROP POLICY IF EXISTS "Unified creators access policy" ON public.creators;

-- Restore original policies (slow but working)
CREATE POLICY "Creators can view their own data" ON public.creators
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Creators can update their own data" ON public.creators
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Creators can delete their own data" ON public.creators
FOR DELETE USING (user_id = auth.uid());

-- ==============================================
-- ROLLBACK PROJECTS TABLE POLICIES
-- ==============================================

-- Drop optimized policies
DROP POLICY IF EXISTS "Creators can manage projects of their clients" ON public.projects;
DROP POLICY IF EXISTS "End clients can view their projects" ON public.projects;
DROP POLICY IF EXISTS "Public can view published projects" ON public.projects;
DROP POLICY IF EXISTS "Creators can insert projects for their clients" ON public.projects;
DROP POLICY IF EXISTS "Unified projects access policy" ON public.projects;

-- Restore original policies
CREATE POLICY "Creators can manage projects of their clients" ON public.projects
FOR ALL USING (
  end_client_id IN (
    SELECT id FROM public.end_clients 
    WHERE creator_id IN (
      SELECT id FROM public.creators WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "End clients can view their projects" ON public.projects
FOR SELECT USING (
  end_client_id IN (
    SELECT end_client_id FROM public.end_client_users 
    WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "Public can view published projects" ON public.projects
FOR SELECT USING (status = 'published');

CREATE POLICY "Creators can insert projects for their clients" ON public.projects
FOR INSERT WITH CHECK (
  end_client_id IN (
    SELECT id FROM public.end_clients 
    WHERE creator_id IN (
      SELECT id FROM public.creators WHERE user_id = auth.uid()
    )
  )
);

-- ==============================================
-- ROLLBACK END_CLIENTS TABLE POLICIES
-- ==============================================

-- Drop optimized policies
DROP POLICY IF EXISTS "Creators can manage their end clients" ON public.end_clients;
DROP POLICY IF EXISTS "End clients can view their own data" ON public.end_clients;
DROP POLICY IF EXISTS "Creators can delete their end clients" ON public.end_clients;
DROP POLICY IF EXISTS "Unified end clients delete policy" ON public.end_clients;

-- Restore original policies
CREATE POLICY "Creators can manage their end clients" ON public.end_clients
FOR ALL USING (
  creator_id IN (
    SELECT id FROM public.creators WHERE user_id = auth.uid()
  )
);

CREATE POLICY "End clients can view their own data" ON public.end_clients
FOR SELECT USING (
  id IN (
    SELECT end_client_id FROM public.end_client_users 
    WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "Creators can delete their end clients" ON public.end_clients
FOR DELETE USING (
  creator_id IN (
    SELECT id FROM public.creators WHERE user_id = auth.uid()
  )
);

-- ==============================================
-- ROLLBACK CHATBOTS TABLE POLICIES
-- ==============================================

-- Drop optimized policies
DROP POLICY IF EXISTS "Creators can manage chatbots for their projects" ON public.chatbots;
DROP POLICY IF EXISTS "End clients can view their chatbots" ON public.chatbots;
DROP POLICY IF EXISTS "Public can view published chatbots" ON public.chatbots;

-- Restore original policies
CREATE POLICY "Creators can manage chatbots for their projects" ON public.chatbots
FOR ALL USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.end_clients ec ON p.end_client_id = ec.id
    WHERE ec.creator_id IN (
      SELECT id FROM public.creators WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "End clients can view their chatbots" ON public.chatbots
FOR SELECT USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    WHERE p.end_client_id IN (
      SELECT end_client_id FROM public.end_client_users 
      WHERE auth_user_id = auth.uid()
    )
  )
);

CREATE POLICY "Public can view published chatbots" ON public.chatbots
FOR SELECT USING (status = 'published');

-- ==============================================
-- ROLLBACK REQUESTS TABLE POLICIES
-- ==============================================

-- Drop optimized policies
DROP POLICY IF EXISTS "Creators can view requests for their projects" ON public.requests;
DROP POLICY IF EXISTS "End clients can view requests for their projects" ON public.requests;
DROP POLICY IF EXISTS "Public can insert requests" ON public.requests;
DROP POLICY IF EXISTS "Creators can update requests for their projects" ON public.requests;
DROP POLICY IF EXISTS "Unified requests select policy" ON public.requests;
DROP POLICY IF EXISTS "Unified requests insert policy" ON public.requests;
DROP POLICY IF EXISTS "Unified requests update policy" ON public.requests;
DROP POLICY IF EXISTS "Unified requests delete policy" ON public.requests;

-- Restore original policies
CREATE POLICY "Creators can view requests for their projects" ON public.requests
FOR SELECT USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.end_clients ec ON p.end_client_id = ec.id
    WHERE ec.creator_id IN (
      SELECT id FROM public.creators WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "End clients can view requests for their projects" ON public.requests
FOR SELECT USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    WHERE p.end_client_id IN (
      SELECT end_client_id FROM public.end_client_users 
      WHERE auth_user_id = auth.uid()
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
      SELECT id FROM public.creators WHERE user_id = auth.uid()
    )
  )
);

-- ==============================================
-- ROLLBACK LEADS TABLE POLICIES
-- ==============================================

-- Drop optimized policies
DROP POLICY IF EXISTS "Creators can view leads for their projects" ON public.leads;
DROP POLICY IF EXISTS "End clients can view leads for their projects" ON public.leads;

-- Restore original policies
CREATE POLICY "Creators can view leads for their projects" ON public.leads
FOR SELECT USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.end_clients ec ON p.end_client_id = ec.id
    WHERE ec.creator_id IN (
      SELECT id FROM public.creators WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "End clients can view leads for their projects" ON public.leads
FOR SELECT USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    WHERE p.end_client_id IN (
      SELECT end_client_id FROM public.end_client_users 
      WHERE auth_user_id = auth.uid()
    )
  )
);

-- ==============================================
-- ROLLBACK ASSETS TABLE POLICIES
-- ==============================================

-- Drop optimized policies
DROP POLICY IF EXISTS "Creators can manage assets for their projects" ON public.assets;
DROP POLICY IF EXISTS "End clients can view assets for their projects" ON public.assets;

-- Restore original policies
CREATE POLICY "Creators can manage assets for their projects" ON public.assets
FOR ALL USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.end_clients ec ON p.end_client_id = ec.id
    WHERE ec.creator_id IN (
      SELECT id FROM public.creators WHERE user_id = auth.uid()
    )
  )
);

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

-- ==============================================
-- ROLLBACK CHATBOT_REQUESTS TABLE POLICIES
-- ==============================================

-- Drop optimized policies
DROP POLICY IF EXISTS "Creators can view chatbot requests for their projects" ON public.chatbot_requests;
DROP POLICY IF EXISTS "End clients can view chatbot requests for their projects" ON public.chatbot_requests;
DROP POLICY IF EXISTS "Public can insert chatbot requests" ON public.chatbot_requests;
DROP POLICY IF EXISTS "Creators can update chatbot requests for their projects" ON public.chatbot_requests;
DROP POLICY IF EXISTS "Creators can delete chatbot requests for their projects" ON public.chatbot_requests;
DROP POLICY IF EXISTS "Unified chatbot requests select policy" ON public.chatbot_requests;

-- Restore original policies
CREATE POLICY "Creators can view chatbot requests for their projects" ON public.chatbot_requests
FOR SELECT USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.end_clients ec ON p.end_client_id = ec.id
    WHERE ec.creator_id IN (
      SELECT id FROM public.creators WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "End clients can view chatbot requests for their projects" ON public.chatbot_requests
FOR SELECT USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    WHERE p.end_client_id IN (
      SELECT end_client_id FROM public.end_client_users 
      WHERE auth_user_id = auth.uid()
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
      SELECT id FROM public.creators WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Creators can delete chatbot requests for their projects" ON public.chatbot_requests
FOR DELETE USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.end_clients ec ON p.end_client_id = ec.id
    WHERE ec.creator_id IN (
      SELECT id FROM public.creators WHERE user_id = auth.uid()
    )
  )
);

-- ==============================================
-- ROLLBACK CONTACT_SUBMISSIONS TABLE POLICIES
-- ==============================================

-- Drop optimized policies
DROP POLICY IF EXISTS "Creators can view contact submissions for their projects" ON public.contact_submissions;
DROP POLICY IF EXISTS "Public can insert contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Creators can update contact submissions for their projects" ON public.contact_submissions;
DROP POLICY IF EXISTS "Unified contact submissions select policy" ON public.contact_submissions;
DROP POLICY IF EXISTS "Unified contact submissions insert policy" ON public.contact_submissions;
DROP POLICY IF EXISTS "Unified contact submissions update policy" ON public.contact_submissions;

-- Restore original policies
CREATE POLICY "Creators can view contact submissions for their projects" ON public.contact_submissions
FOR SELECT USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.end_clients ec ON p.end_client_id = ec.id
    WHERE ec.creator_id IN (
      SELECT id FROM public.creators WHERE user_id = auth.uid()
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
      SELECT id FROM public.creators WHERE user_id = auth.uid()
    )
  )
);

-- ==============================================
-- ROLLBACK SUPPORT_REQUESTS TABLE POLICIES
-- ==============================================

-- Drop optimized policies
DROP POLICY IF EXISTS "Creators can view support requests for their projects" ON public.support_requests;
DROP POLICY IF EXISTS "Public can insert support requests" ON public.support_requests;
DROP POLICY IF EXISTS "Creators can update support requests for their projects" ON public.support_requests;
DROP POLICY IF EXISTS "Creators can delete support requests for their projects" ON public.support_requests;
DROP POLICY IF EXISTS "Unified support requests select policy" ON public.support_requests;
DROP POLICY IF EXISTS "Unified support requests insert policy" ON public.support_requests;
DROP POLICY IF EXISTS "Unified support requests update policy" ON public.support_requests;

-- Restore original policies
CREATE POLICY "Creators can view support requests for their projects" ON public.support_requests
FOR SELECT USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.end_clients ec ON p.end_client_id = ec.id
    WHERE ec.creator_id IN (
      SELECT id FROM public.creators WHERE user_id = auth.uid()
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
      SELECT id FROM public.creators WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Creators can delete support requests for their projects" ON public.support_requests
FOR DELETE USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.end_clients ec ON p.end_client_id = ec.id
    WHERE ec.creator_id IN (
      SELECT id FROM public.creators WHERE user_id = auth.uid()
    )
  )
);

-- ==============================================
-- ROLLBACK ANALYTICS TABLE POLICIES
-- ==============================================

-- Drop optimized policies
DROP POLICY IF EXISTS "Creators can view analytics for their end clients" ON public.analytics;
DROP POLICY IF EXISTS "Unified analytics access policy" ON public.analytics;

-- Restore original policies
CREATE POLICY "Creators can view analytics for their end clients" ON public.analytics
FOR SELECT USING (
  end_client_id IN (
    SELECT id FROM public.end_clients 
    WHERE creator_id IN (
      SELECT id FROM public.creators WHERE user_id = auth.uid()
    )
  )
);

-- ==============================================
-- ROLLBACK IMPORTED_ANALYTICS TABLE POLICIES
-- ==============================================

-- Drop optimized policies
DROP POLICY IF EXISTS "Creators can view imported analytics for their end clients" ON public.imported_analytics;
DROP POLICY IF EXISTS "Creators can insert imported analytics for their end clients" ON public.imported_analytics;
DROP POLICY IF EXISTS "Creators can update imported analytics for their end clients" ON public.imported_analytics;
DROP POLICY IF EXISTS "Unified imported analytics select policy" ON public.imported_analytics;
DROP POLICY IF EXISTS "Unified imported analytics insert policy" ON public.imported_analytics;
DROP POLICY IF EXISTS "Unified imported analytics update policy" ON public.imported_analytics;

-- Restore original policies
CREATE POLICY "Creators can view imported analytics for their end clients" ON public.imported_analytics
FOR SELECT USING (
  end_client_id IN (
    SELECT id FROM public.end_clients 
    WHERE creator_id IN (
      SELECT id FROM public.creators WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Creators can insert imported analytics for their end clients" ON public.imported_analytics
FOR INSERT WITH CHECK (
  end_client_id IN (
    SELECT id FROM public.end_clients 
    WHERE creator_id IN (
      SELECT id FROM public.creators WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Creators can update imported analytics for their end clients" ON public.imported_analytics
FOR UPDATE USING (
  end_client_id IN (
    SELECT id FROM public.end_clients 
    WHERE creator_id IN (
      SELECT id FROM public.creators WHERE user_id = auth.uid()
    )
  )
);

-- ==============================================
-- ROLLBACK ANALYTICS_SUMMARY_SECURE TABLE POLICIES
-- ==============================================

-- Drop optimized policies
DROP POLICY IF EXISTS "Creators can view analytics summary for their end clients" ON public.analytics_summary_secure;
DROP POLICY IF EXISTS "Unified analytics summary access policy" ON public.analytics_summary_secure;

-- Restore original policies
CREATE POLICY "Creators can view analytics summary for their end clients" ON public.analytics_summary_secure
FOR SELECT USING (
  end_client_id IN (
    SELECT id FROM public.end_clients 
    WHERE creator_id IN (
      SELECT id FROM public.creators WHERE user_id = auth.uid()
    )
  )
);

-- ==============================================
-- ROLLBACK ADMIN_USERS TABLE POLICIES
-- ==============================================

-- Drop optimized policies
DROP POLICY IF EXISTS "Admin users can manage their own data" ON public.admin_users;

-- Restore original policies
CREATE POLICY "Admin users can manage their own data" ON public.admin_users
FOR ALL USING (user_id = auth.uid());

-- ==============================================
-- ROLLBACK END_CLIENT_USERS TABLE POLICIES
-- ==============================================

-- Drop optimized policies
DROP POLICY IF EXISTS "End client users can manage their own data" ON public.end_client_users;

-- Restore original policies
CREATE POLICY "End client users can manage their own data" ON public.end_client_users
FOR ALL USING (auth_user_id = auth.uid());

-- ==============================================
-- ROLLBACK KB_CHUNKS TABLE POLICIES
-- ==============================================

-- Drop optimized policies
DROP POLICY IF EXISTS "Creators can manage kb chunks for their projects" ON public.kb_chunks;

-- Restore original policies
CREATE POLICY "Creators can manage kb chunks for their projects" ON public.kb_chunks
FOR ALL USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.end_clients ec ON p.end_client_id = ec.id
    WHERE ec.creator_id IN (
      SELECT id FROM public.creators WHERE user_id = auth.uid()
    )
  )
);

-- ==============================================
-- ROLLBACK CONVERSATION_MESSAGES TABLE POLICIES
-- ==============================================

-- Drop optimized policies
DROP POLICY IF EXISTS "Creators can view conversation messages for their projects" ON public.conversation_messages;

-- Restore original policies
CREATE POLICY "Creators can view conversation messages for their projects" ON public.conversation_messages
FOR SELECT USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.end_clients ec ON p.end_client_id = ec.id
    WHERE ec.creator_id IN (
      SELECT id FROM public.creators WHERE user_id = auth.uid()
    )
  )
);

-- ==============================================
-- ROLLBACK MEMORY_INSIGHTS TABLE POLICIES
-- ==============================================

-- Drop optimized policies
DROP POLICY IF EXISTS "Creators can view memory insights for their projects" ON public.memory_insights;

-- Restore original policies
CREATE POLICY "Creators can view memory insights for their projects" ON public.memory_insights
FOR SELECT USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.end_clients ec ON p.end_client_id = ec.id
    WHERE ec.creator_id IN (
      SELECT id FROM public.creators WHERE user_id = auth.uid()
    )
  )
);

-- ==============================================
-- ROLLBACK COMPLETE
-- ==============================================

-- Log rollback completion
INSERT INTO public.migration_log (migration_name, executed_at, status) 
VALUES ('rollback_rls_optimization', NOW(), 'completed')
ON CONFLICT (migration_name) DO UPDATE SET 
  executed_at = NOW(), 
  status = 'completed';

-- ==============================================
-- POST-ROLLBACK VERIFICATION
-- ==============================================

-- Verify all policies are back to original (slow) versions
-- SELECT schemaname, tablename, policyname, qual
-- FROM pg_policies
-- WHERE qual LIKE '%auth.uid()%' AND qual NOT LIKE '%(select auth.uid())%';
-- Should show all policies are back to original format

