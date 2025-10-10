-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  client TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration INTEGER NOT NULL DEFAULT 60, -- duration in minutes
  location TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('sopralluogo', 'consegna', 'presentazione', 'altro')),
  status TEXT NOT NULL DEFAULT 'da_confermare' CHECK (status IN ('confermato', 'da_confermare', 'completato', 'annullato')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own appointments" 
ON public.appointments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own appointments" 
ON public.appointments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own appointments" 
ON public.appointments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own appointments" 
ON public.appointments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance on user queries
CREATE INDEX idx_appointments_user_id ON public.appointments(user_id);
CREATE INDEX idx_appointments_date ON public.appointments(date);