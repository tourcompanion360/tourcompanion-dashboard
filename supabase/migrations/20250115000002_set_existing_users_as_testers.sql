-- Set all existing users as testers to maintain access during billing implementation
-- This allows current users to continue testing while new users require payment

UPDATE public.creators 
SET is_tester = true 
WHERE created_at < NOW();

-- Log this migration event
INSERT INTO public.subscription_events (
  creator_id,
  event_type,
  metadata
) 
SELECT 
  id,
  'trial_started',
  jsonb_build_object(
    'reason', 'Existing user grandfathered as tester',
    'migration_date', NOW(),
    'migration_version', '20250115000002'
  )
FROM public.creators 
WHERE is_tester = true;

-- Add a comment to track this migration
COMMENT ON COLUMN public.creators.is_tester IS 'Tester flag - allows users to bypass subscription requirements. Set to true for existing users during billing migration.';


