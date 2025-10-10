-- Create support_tickets table
CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'aperto',
  priority TEXT NOT NULL DEFAULT 'normale',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create requests_history table
CREATE TABLE public.requests_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  client_name TEXT,
  request_type TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normale',
  status TEXT NOT NULL DEFAULT 'in_elaborazione',
  hotspots JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for support_tickets
CREATE POLICY "Users can view their own support tickets"
ON public.support_tickets
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own support tickets"
ON public.support_tickets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own support tickets"
ON public.support_tickets
FOR UPDATE
USING (auth.uid() = user_id);

-- Create RLS policies for requests_history
CREATE POLICY "Users can view their own requests history"
ON public.requests_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own requests history"
ON public.requests_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own requests history"
ON public.requests_history
FOR UPDATE
USING (auth.uid() = user_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_requests_history_updated_at
  BEFORE UPDATE ON public.requests_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();