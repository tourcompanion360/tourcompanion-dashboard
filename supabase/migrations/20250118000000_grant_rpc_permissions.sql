-- Grant execute permissions on get_client_analytics function to anon role
-- This allows the client portal to access analytics data without authentication

-- Ensure the function exists and is SECURITY DEFINER
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

-- Grant execute permissions to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.get_client_analytics(UUID) TO anon, authenticated;

-- Ensure the function is accessible
ALTER FUNCTION public.get_client_analytics(UUID) OWNER TO postgres;


