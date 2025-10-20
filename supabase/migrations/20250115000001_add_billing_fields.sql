-- Add billing fields to creators table
ALTER TABLE public.creators 
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_period_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_tester BOOLEAN DEFAULT false;

-- Create subscription_events table for audit logging
CREATE TABLE IF NOT EXISTS public.subscription_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'subscription_created',
    'subscription_updated', 
    'subscription_cancelled',
    'payment_succeeded',
    'payment_failed',
    'trial_started',
    'trial_ended'
  )),
  stripe_event_id TEXT,
  stripe_subscription_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on subscription_events table
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for subscription_events (creators can only see their own events)
CREATE POLICY "Creators can view their own subscription events"
ON public.subscription_events
FOR SELECT
USING (
  creator_id IN (
    SELECT id FROM public.creators 
    WHERE user_id = auth.uid()
  )
);

-- Create RLS policy for subscription_events (service role can insert)
CREATE POLICY "Service role can insert subscription events"
ON public.subscription_events
FOR INSERT
WITH CHECK (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_subscription_events_creator_id ON public.subscription_events(creator_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_event_type ON public.subscription_events(event_type);
CREATE INDEX IF NOT EXISTS idx_subscription_events_created_at ON public.subscription_events(created_at);

-- Create function to log subscription events
CREATE OR REPLACE FUNCTION public.log_subscription_event(
  p_creator_id UUID,
  p_event_type TEXT,
  p_stripe_event_id TEXT DEFAULT NULL,
  p_stripe_subscription_id TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO public.subscription_events (
    creator_id,
    event_type,
    stripe_event_id,
    stripe_subscription_id,
    metadata
  ) VALUES (
    p_creator_id,
    p_event_type,
    p_stripe_event_id,
    p_stripe_subscription_id,
    p_metadata
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$;

-- Create function to check if user has active subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_tester BOOLEAN;
  subscription_status TEXT;
  period_end TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Check if user is a tester (bypasses subscription requirement)
  SELECT c.is_tester, c.subscription_status, c.subscription_period_end
  INTO is_tester, subscription_status, period_end
  FROM public.creators c
  WHERE c.user_id = p_user_id;
  
  -- If user is a tester, they have access
  IF is_tester THEN
    RETURN TRUE;
  END IF;
  
  -- Check if subscription is active and not expired
  IF subscription_status = 'active' AND (period_end IS NULL OR period_end > NOW()) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Update RLS policies to check subscription status
-- Drop existing policies first
DROP POLICY IF EXISTS "Allow anonymous access to projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;

-- Create new RLS policies that check subscription status
CREATE POLICY "Users with active subscription can view their projects"
ON public.projects
FOR SELECT
USING (
  end_client_id IN (
    SELECT ec.id FROM public.end_clients ec
    JOIN public.creators c ON ec.creator_id = c.id
    WHERE c.user_id = auth.uid() 
    AND public.has_active_subscription(auth.uid())
  )
);

CREATE POLICY "Users with active subscription can insert projects"
ON public.projects
FOR INSERT
WITH CHECK (
  end_client_id IN (
    SELECT ec.id FROM public.end_clients ec
    JOIN public.creators c ON ec.creator_id = c.id
    WHERE c.user_id = auth.uid() 
    AND public.has_active_subscription(auth.uid())
  )
);

CREATE POLICY "Users with active subscription can update their projects"
ON public.projects
FOR UPDATE
USING (
  end_client_id IN (
    SELECT ec.id FROM public.end_clients ec
    JOIN public.creators c ON ec.creator_id = c.id
    WHERE c.user_id = auth.uid() 
    AND public.has_active_subscription(auth.uid())
  )
);

CREATE POLICY "Users with active subscription can delete their projects"
ON public.projects
FOR DELETE
USING (
  end_client_id IN (
    SELECT ec.id FROM public.end_clients ec
    JOIN public.creators c ON ec.creator_id = c.id
    WHERE c.user_id = auth.uid() 
    AND public.has_active_subscription(auth.uid())
  )
);

-- Update other table policies to check subscription status
-- End clients
DROP POLICY IF EXISTS "Users can view their own end clients" ON public.end_clients;
DROP POLICY IF EXISTS "Users can insert their own end clients" ON public.end_clients;
DROP POLICY IF EXISTS "Users can update their own end clients" ON public.end_clients;
DROP POLICY IF EXISTS "Users can delete their own end clients" ON public.end_clients;

CREATE POLICY "Users with active subscription can view their end clients"
ON public.end_clients
FOR SELECT
USING (
  creator_id IN (
    SELECT id FROM public.creators 
    WHERE user_id = auth.uid() 
    AND public.has_active_subscription(auth.uid())
  )
);

CREATE POLICY "Users with active subscription can insert end clients"
ON public.end_clients
FOR INSERT
WITH CHECK (
  creator_id IN (
    SELECT id FROM public.creators 
    WHERE user_id = auth.uid() 
    AND public.has_active_subscription(auth.uid())
  )
);

CREATE POLICY "Users with active subscription can update their end clients"
ON public.end_clients
FOR UPDATE
USING (
  creator_id IN (
    SELECT id FROM public.creators 
    WHERE user_id = auth.uid() 
    AND public.has_active_subscription(auth.uid())
  )
);

CREATE POLICY "Users with active subscription can delete their end clients"
ON public.end_clients
FOR DELETE
USING (
  creator_id IN (
    SELECT id FROM public.creators 
    WHERE user_id = auth.uid() 
    AND public.has_active_subscription(auth.uid())
  )
);

-- Chatbots
DROP POLICY IF EXISTS "Users can view their own chatbots" ON public.chatbots;
DROP POLICY IF EXISTS "Users can insert their own chatbots" ON public.chatbots;
DROP POLICY IF EXISTS "Users can update their own chatbots" ON public.chatbots;
DROP POLICY IF EXISTS "Users can delete their own chatbots" ON public.chatbots;

CREATE POLICY "Users with active subscription can view their chatbots"
ON public.chatbots
FOR SELECT
USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.end_clients ec ON p.end_client_id = ec.id
    JOIN public.creators c ON ec.creator_id = c.id
    WHERE c.user_id = auth.uid() 
    AND public.has_active_subscription(auth.uid())
  )
);

CREATE POLICY "Users with active subscription can insert chatbots"
ON public.chatbots
FOR INSERT
WITH CHECK (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.end_clients ec ON p.end_client_id = ec.id
    JOIN public.creators c ON ec.creator_id = c.id
    WHERE c.user_id = auth.uid() 
    AND public.has_active_subscription(auth.uid())
  )
);

CREATE POLICY "Users with active subscription can update their chatbots"
ON public.chatbots
FOR UPDATE
USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.end_clients ec ON p.end_client_id = ec.id
    JOIN public.creators c ON ec.creator_id = c.id
    WHERE c.user_id = auth.uid() 
    AND public.has_active_subscription(auth.uid())
  )
);

CREATE POLICY "Users with active subscription can delete their chatbots"
ON public.chatbots
FOR DELETE
USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.end_clients ec ON p.end_client_id = ec.id
    JOIN public.creators c ON ec.creator_id = c.id
    WHERE c.user_id = auth.uid() 
    AND public.has_active_subscription(auth.uid())
  )
);

-- Analytics
DROP POLICY IF EXISTS "Users can view their own analytics" ON public.analytics;
DROP POLICY IF EXISTS "Users can insert their own analytics" ON public.analytics;
DROP POLICY IF EXISTS "Users can update their own analytics" ON public.analytics;
DROP POLICY IF EXISTS "Users can delete their own analytics" ON public.analytics;

CREATE POLICY "Users with active subscription can view their analytics"
ON public.analytics
FOR SELECT
USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.end_clients ec ON p.end_client_id = ec.id
    JOIN public.creators c ON ec.creator_id = c.id
    WHERE c.user_id = auth.uid() 
    AND public.has_active_subscription(auth.uid())
  )
);

CREATE POLICY "Users with active subscription can insert analytics"
ON public.analytics
FOR INSERT
WITH CHECK (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.end_clients ec ON p.end_client_id = ec.id
    JOIN public.creators c ON ec.creator_id = c.id
    WHERE c.user_id = auth.uid() 
    AND public.has_active_subscription(auth.uid())
  )
);

CREATE POLICY "Users with active subscription can update their analytics"
ON public.analytics
FOR UPDATE
USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.end_clients ec ON p.end_client_id = ec.id
    JOIN public.creators c ON ec.creator_id = c.id
    WHERE c.user_id = auth.uid() 
    AND public.has_active_subscription(auth.uid())
  )
);

CREATE POLICY "Users with active subscription can delete their analytics"
ON public.analytics
FOR DELETE
USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.end_clients ec ON p.end_client_id = ec.id
    JOIN public.creators c ON ec.creator_id = c.id
    WHERE c.user_id = auth.uid() 
    AND public.has_active_subscription(auth.uid())
  )
);

-- Assets
DROP POLICY IF EXISTS "Users can view their own assets" ON public.assets;
DROP POLICY IF EXISTS "Users can insert their own assets" ON public.assets;
DROP POLICY IF EXISTS "Users can update their own assets" ON public.assets;
DROP POLICY IF EXISTS "Users can delete their own assets" ON public.assets;

CREATE POLICY "Users with active subscription can view their assets"
ON public.assets
FOR SELECT
USING (
  creator_id IN (
    SELECT id FROM public.creators 
    WHERE user_id = auth.uid() 
    AND public.has_active_subscription(auth.uid())
  )
);

CREATE POLICY "Users with active subscription can insert assets"
ON public.assets
FOR INSERT
WITH CHECK (
  creator_id IN (
    SELECT id FROM public.creators 
    WHERE user_id = auth.uid() 
    AND public.has_active_subscription(auth.uid())
  )
);

CREATE POLICY "Users with active subscription can update their assets"
ON public.assets
FOR UPDATE
USING (
  creator_id IN (
    SELECT id FROM public.creators 
    WHERE user_id = auth.uid() 
    AND public.has_active_subscription(auth.uid())
  )
);

CREATE POLICY "Users with active subscription can delete their assets"
ON public.assets
FOR DELETE
USING (
  creator_id IN (
    SELECT id FROM public.creators 
    WHERE user_id = auth.uid() 
    AND public.has_active_subscription(auth.uid())
  )
);


