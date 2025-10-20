-- Add end_client_id column to analytics table for client-specific tracking
ALTER TABLE public.analytics 
ADD COLUMN end_client_id UUID REFERENCES public.end_clients(id) ON DELETE CASCADE;

-- Add index on end_client_id for better query performance
CREATE INDEX idx_analytics_end_client_id ON public.analytics(end_client_id);

-- Add index on the combination of end_client_id and date for efficient client analytics queries
CREATE INDEX idx_analytics_client_date ON public.analytics(end_client_id, date);

-- Update RLS policies to allow clients to see only their own analytics
-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view analytics for their projects" ON public.analytics;
DROP POLICY IF EXISTS "Users can insert analytics for their projects" ON public.analytics;

-- Create new RLS policies for client-specific analytics
CREATE POLICY "Users can view analytics for their clients" ON public.analytics
  FOR SELECT USING (
    end_client_id IN (
      SELECT ec.id 
      FROM public.end_clients ec
      JOIN public.creators c ON ec.creator_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert analytics for their clients" ON public.analytics
  FOR INSERT WITH CHECK (
    end_client_id IN (
      SELECT ec.id 
      FROM public.end_clients ec
      JOIN public.creators c ON ec.creator_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

-- Update the analytics_summary materialized view to include client-specific data
DROP MATERIALIZED VIEW IF EXISTS public.analytics_summary;

CREATE MATERIALIZED VIEW public.analytics_summary AS
SELECT 
  p.id as project_id,
  p.title as project_title,
  ec.id as end_client_id,
  ec.name as client_name,
  c.id as creator_id,
  c.agency_name,
  COUNT(DISTINCT a.id) as total_views,
  COUNT(DISTINCT l.id) as total_leads,
  AVG(a.metric_value) as avg_engagement,
  MAX(a.date) as last_activity,
  -- Add client-specific analytics
  COALESCE(SUM(CASE WHEN a.metric_type = 'view' THEN a.metric_value ELSE 0 END), 0) as total_page_views,
  COALESCE(SUM(CASE WHEN a.metric_type = 'unique_visitor' THEN a.metric_value ELSE 0 END), 0) as total_unique_visitors,
  COALESCE(AVG(CASE WHEN a.metric_type = 'time_spent' THEN a.metric_value ELSE NULL END), 0) as avg_time_spent
FROM public.projects p
JOIN public.end_clients ec ON p.end_client_id = ec.id
JOIN public.creators c ON ec.creator_id = c.id
LEFT JOIN public.analytics a ON p.id = a.project_id
LEFT JOIN public.chatbots cb ON p.id = cb.project_id
LEFT JOIN public.leads l ON cb.id = l.chatbot_id
GROUP BY p.id, p.title, ec.id, ec.name, c.id, c.agency_name;

-- Create function to get client-specific analytics
CREATE OR REPLACE FUNCTION public.get_client_analytics(client_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_views', COALESCE(SUM(CASE WHEN a.metric_type = 'view' THEN a.metric_value ELSE 0 END), 0),
    'total_unique_visitors', COALESCE(SUM(CASE WHEN a.metric_type = 'unique_visitor' THEN a.metric_value ELSE 0 END), 0),
    'avg_time_spent', COALESCE(AVG(CASE WHEN a.metric_type = 'time_spent' THEN a.metric_value ELSE NULL END), 0),
    'total_duration', COALESCE(SUM(CASE WHEN a.metric_type = 'time_spent' THEN a.metric_value ELSE 0 END), 0),
    'total_interactions', COALESCE(SUM(CASE WHEN a.metric_type = 'chatbot_interaction' THEN a.metric_value ELSE 0 END), 0),
    'total_hotspot_clicks', COALESCE(SUM(CASE WHEN a.metric_type = 'hotspot_click' THEN a.metric_value ELSE 0 END), 0),
    'total_leads', COALESCE(SUM(CASE WHEN a.metric_type = 'lead_generated' THEN a.metric_value ELSE 0 END), 0),
    'data_points', COUNT(*),
    'date_range', json_build_object(
      'earliest', MIN(a.date),
      'latest', MAX(a.date)
    )
  ) INTO result
  FROM public.analytics a
  WHERE a.end_client_id = client_uuid;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_client_analytics(UUID) TO anon, authenticated;


