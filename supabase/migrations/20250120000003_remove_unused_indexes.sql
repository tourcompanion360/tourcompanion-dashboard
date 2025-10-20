-- Remove Unused Indexes Migration
-- Removes 30+ unused indexes to free up database resources and improve write performance
-- Based on Supabase advisor reports - these indexes are confirmed unused

-- ==============================================
-- IMPORTED ANALYTICS INDEXES (Never Used)
-- ==============================================

DROP INDEX IF EXISTS idx_imported_analytics_page_views;
DROP INDEX IF EXISTS idx_imported_analytics_visitors;
DROP INDEX IF EXISTS idx_imported_analytics_total_time;
DROP INDEX IF EXISTS idx_imported_analytics_bounce_rate;
DROP INDEX IF EXISTS idx_imported_analytics_conversion_rate;

-- ==============================================
-- PROJECTS INDEXES (Never Used)
-- ==============================================

DROP INDEX IF EXISTS projects_external_tour_id_idx;
DROP INDEX IF EXISTS idx_projects_status;
DROP INDEX IF EXISTS idx_projects_created_at;
DROP INDEX IF EXISTS idx_projects_updated_at;

-- ==============================================
-- CHATBOT DEPLOYMENTS INDEXES (Just Added, Not Used Yet)
-- ==============================================

DROP INDEX IF EXISTS idx_chatbot_deployments_client_id;
DROP INDEX IF EXISTS idx_chatbot_deployments_deployed_by;
DROP INDEX IF EXISTS idx_chatbot_deployments_project_id;
DROP INDEX IF EXISTS idx_chatbot_deployments_status;
DROP INDEX IF EXISTS idx_chatbot_deployments_created_at;

-- ==============================================
-- FORM SUBMISSIONS INDEXES (Never Used)
-- ==============================================

DROP INDEX IF EXISTS idx_form_submissions_project_id;
DROP INDEX IF EXISTS idx_form_submissions_assigned_to;
DROP INDEX IF EXISTS idx_form_submissions_client_id;
DROP INDEX IF EXISTS idx_form_submissions_status;
DROP INDEX IF EXISTS idx_form_submissions_created_at;

-- ==============================================
-- CHATBOT REQUESTS INDEXES (Never Used)
-- ==============================================

DROP INDEX IF EXISTS idx_chatbot_requests_project_id;
DROP INDEX IF EXISTS idx_chatbot_requests_creator_deleted;
DROP INDEX IF EXISTS idx_chatbot_requests_admin_deleted;
DROP INDEX IF EXISTS idx_chatbot_requests_status;
DROP INDEX IF EXISTS idx_chatbot_requests_created_at;

-- ==============================================
-- SUPPORT REQUESTS INDEXES (Never Used)
-- ==============================================

DROP INDEX IF EXISTS idx_support_requests_resolved_by;
DROP INDEX IF EXISTS idx_support_requests_user_id;
DROP INDEX IF EXISTS idx_support_requests_creator_id;
DROP INDEX IF EXISTS idx_support_requests_status;
DROP INDEX IF EXISTS idx_support_requests_priority;
DROP INDEX IF EXISTS idx_support_requests_created_at;

-- ==============================================
-- CONTACT SUBMISSIONS INDEXES (Never Used)
-- ==============================================

DROP INDEX IF EXISTS idx_contact_submissions_creator_id;
DROP INDEX IF EXISTS idx_contact_submissions_status;
DROP INDEX IF EXISTS idx_contact_submissions_created_at;
DROP INDEX IF EXISTS idx_contact_submissions_updated_at;

-- ==============================================
-- CHATBOT TEMPLATES INDEXES (Never Used)
-- ==============================================

DROP INDEX IF EXISTS idx_chatbot_templates_created_by;
DROP INDEX IF EXISTS idx_chatbot_templates_status;
DROP INDEX IF EXISTS idx_chatbot_templates_created_at;

-- ==============================================
-- ADMIN ACTIVITY LOG INDEXES (Never Used)
-- ==============================================

DROP INDEX IF EXISTS idx_admin_activity_log_admin_id;
DROP INDEX IF EXISTS idx_admin_activity_log_action;
DROP INDEX IF EXISTS idx_admin_activity_log_created_at;

-- ==============================================
-- CONVERSATION MESSAGES INDEXES (Never Used)
-- ==============================================

DROP INDEX IF EXISTS conversation_messages_created_at_idx;
DROP INDEX IF EXISTS idx_conversation_messages_project_id;
DROP INDEX IF EXISTS idx_conversation_messages_user_id;

-- ==============================================
-- MEMORY INSIGHTS INDEXES (Never Used)
-- ==============================================

DROP INDEX IF EXISTS memory_insights_period_idx;
DROP INDEX IF EXISTS idx_memory_insights_project_id;
DROP INDEX IF EXISTS idx_memory_insights_created_at;

-- ==============================================
-- CHATBOTS INDEXES (Never Used)
-- ==============================================

DROP INDEX IF EXISTS idx_chatbots_status;
DROP INDEX IF EXISTS idx_chatbots_created_at;
DROP INDEX IF EXISTS idx_chatbots_updated_at;

-- ==============================================
-- LEADS INDEXES (Never Used)
-- ==============================================

DROP INDEX IF EXISTS idx_leads_status;
DROP INDEX IF EXISTS idx_leads_created_at;
DROP INDEX IF EXISTS idx_leads_updated_at;

-- ==============================================
-- ANALYTICS INDEXES (Never Used)
-- ==============================================

DROP INDEX IF EXISTS idx_analytics_metric_type;
DROP INDEX IF EXISTS idx_analytics_created_at;
DROP INDEX IF EXISTS idx_analytics_updated_at;

-- ==============================================
-- REQUESTS INDEXES (Never Used)
-- ==============================================

DROP INDEX IF EXISTS idx_requests_status;
DROP INDEX IF EXISTS idx_requests_created_at;
DROP INDEX IF EXISTS idx_requests_updated_at;

-- ==============================================
-- ASSETS INDEXES (Never Used)
-- ==============================================

DROP INDEX IF EXISTS idx_assets_file_type;
DROP INDEX IF EXISTS idx_assets_created_at;
DROP INDEX IF EXISTS idx_assets_updated_at;

-- ==============================================
-- END CLIENTS INDEXES (Never Used)
-- ==============================================

DROP INDEX IF EXISTS idx_end_clients_status;
DROP INDEX IF EXISTS idx_end_clients_created_at;
DROP INDEX IF EXISTS idx_end_clients_updated_at;

-- ==============================================
-- CREATORS INDEXES (Never Used)
-- ==============================================

DROP INDEX IF EXISTS idx_creators_created_at;
DROP INDEX IF EXISTS idx_creators_updated_at;

-- ==============================================
-- SUBSCRIPTION EVENTS INDEXES (Keep This One - Actually Used)
-- ==============================================

-- Keep this index as it's actually used for Stripe integration
-- CREATE INDEX IF NOT EXISTS idx_subscription_events_stripe_subscription_id 
-- ON public.subscription_events(stripe_subscription_id);

-- ==============================================
-- KEEP THESE CRITICAL INDEXES (Actually Used)
-- ==============================================

-- These indexes are confirmed to be used and should NOT be dropped:
-- idx_creators_user_id (PRIMARY access pattern)
-- idx_end_clients_creator_id (JOIN queries)
-- idx_projects_end_client_id (JOIN queries)
-- idx_chatbots_project_id (JOIN queries)
-- idx_leads_chatbot_id (JOIN queries)
-- idx_analytics_end_client_id (already added, keep it)
-- idx_analytics_project_id (queries use this)

-- ==============================================
-- ADD ANY MISSING CRITICAL INDEXES
-- ==============================================

-- Add any missing critical indexes that are actually needed
CREATE INDEX IF NOT EXISTS idx_subscription_events_stripe_subscription_id 
ON public.subscription_events(stripe_subscription_id);

-- Add index for admin_users if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id 
ON public.admin_users(user_id);

-- Add index for end_client_users if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_end_client_users_auth_user_id 
ON public.end_client_users(auth_user_id);

-- Add index for end_client_users end_client_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_end_client_users_end_client_id 
ON public.end_client_users(end_client_id);

-- ==============================================
-- MIGRATION COMPLETE
-- ==============================================

-- Log completion
INSERT INTO public.migration_log (migration_name, executed_at, status) 
VALUES ('remove_unused_indexes', NOW(), 'completed')
ON CONFLICT (migration_name) DO UPDATE SET 
  executed_at = NOW(), 
  status = 'completed';

-- ==============================================
-- VERIFICATION QUERIES (Run after migration)
-- ==============================================

-- Check remaining indexes
-- SELECT schemaname, tablename, indexname, idx_scan
-- FROM pg_stat_user_indexes
-- WHERE indexname LIKE 'idx_%'
-- ORDER BY idx_scan DESC;

-- Check for any remaining unused indexes
-- SELECT schemaname, tablename, indexname, idx_scan
-- FROM pg_stat_user_indexes
-- WHERE idx_scan = 0 AND indexname LIKE 'idx_%';

