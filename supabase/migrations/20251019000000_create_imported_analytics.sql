-- Create imported_analytics table for virtual tour platform data
-- This table stores analytics data imported from external virtual tour platforms

-- Create the imported_analytics table
CREATE TABLE public.imported_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  end_client_id UUID NOT NULL REFERENCES public.end_clients(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  resource_code TEXT,
  page_views INTEGER DEFAULT 0,
  visitors INTEGER DEFAULT 0,
  total_time INTEGER DEFAULT 0, -- in seconds
  avg_time INTEGER DEFAULT 0    -- in seconds
);

-- Create indexes for performance
CREATE INDEX idx_imported_analytics_project_id ON public.imported_analytics(project_id);
CREATE INDEX idx_imported_analytics_end_client_id ON public.imported_analytics(end_client_id);
CREATE INDEX idx_imported_analytics_creator_id ON public.imported_analytics(creator_id);
CREATE INDEX idx_imported_analytics_date ON public.imported_analytics(date);
CREATE INDEX idx_imported_analytics_client_date ON public.imported_analytics(end_client_id, date);

-- Enable Row Level Security
ALTER TABLE public.imported_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Policy 1: Creators can view their own imported analytics
CREATE POLICY "Creators can view their imported analytics"
ON public.imported_analytics FOR SELECT
TO authenticated
USING (creator_id IN (SELECT id FROM public.creators WHERE user_id = auth.uid()));

-- Policy 2: Creators can insert analytics for their clients
CREATE POLICY "Creators can insert their imported analytics"
ON public.imported_analytics FOR INSERT
TO authenticated
WITH CHECK (creator_id IN (SELECT id FROM public.creators WHERE user_id = auth.uid()));

-- Policy 3: Creators can delete their own imported analytics
CREATE POLICY "Creators can delete their imported analytics"
ON public.imported_analytics FOR DELETE
TO authenticated
USING (creator_id IN (SELECT id FROM public.creators WHERE user_id = auth.uid()));

-- Policy 4: Public can view imported analytics for client portal (filtered by project)
CREATE POLICY "Public can view imported analytics for client portal"
ON public.imported_analytics FOR SELECT
TO public
USING (true);

-- Create function to get combined analytics (both regular and imported)
CREATE OR REPLACE FUNCTION public.get_combined_client_analytics(client_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'regular_analytics', (
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
      )
      FROM public.analytics a
      WHERE a.end_client_id = client_uuid
    ),
    'imported_analytics', (
      SELECT json_build_object(
        'total_page_views', COALESCE(SUM(ia.page_views), 0),
        'total_visitors', COALESCE(SUM(ia.visitors), 0),
        'total_time_spent', COALESCE(SUM(ia.total_time), 0),
        'avg_session_duration', COALESCE(AVG(ia.avg_time), 0),
        'data_points', COUNT(*),
        'date_range', json_build_object(
          'earliest', MIN(ia.date),
          'latest', MAX(ia.date)
        ),
        'resource_codes', (
          SELECT json_agg(DISTINCT ia.resource_code)
          FROM public.imported_analytics ia
          WHERE ia.end_client_id = client_uuid
        )
      )
      FROM public.imported_analytics ia
      WHERE ia.end_client_id = client_uuid
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_combined_client_analytics(UUID) TO anon, authenticated;

-- Create function to get imported analytics data for charts
CREATE OR REPLACE FUNCTION public.get_imported_analytics_chart_data(client_uuid UUID)
RETURNS TABLE (
  date DATE,
  page_views INTEGER,
  visitors INTEGER,
  total_time INTEGER,
  avg_time INTEGER,
  resource_code TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ia.date,
    ia.page_views,
    ia.visitors,
    ia.total_time,
    ia.avg_time,
    ia.resource_code
  FROM public.imported_analytics ia
  WHERE ia.end_client_id = client_uuid
  ORDER BY ia.date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions for chart data function
GRANT EXECUTE ON FUNCTION public.get_imported_analytics_chart_data(UUID) TO anon, authenticated;

