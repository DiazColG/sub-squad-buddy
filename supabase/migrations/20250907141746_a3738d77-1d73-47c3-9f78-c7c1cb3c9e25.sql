-- Create table for housing services and expenses
CREATE TABLE public.housing_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL,
  cost NUMERIC,
  currency TEXT,
  billing_cycle TEXT,
  next_due_date DATE,
  category TEXT,
  enable_due_alert BOOLEAN DEFAULT false,
  alert_days_before INTEGER DEFAULT 7,
  payment_method TEXT,
  bank_name TEXT,
  card_type TEXT,
  card_last_digits TEXT,
  card_id UUID,
  user_id UUID NOT NULL,
  team_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.housing_services ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can manage their own personal housing services" 
ON public.housing_services 
FOR ALL
USING ((auth.uid() = user_id) AND (team_id IS NULL))
WITH CHECK ((auth.uid() = user_id) AND (team_id IS NULL));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_housing_services_updated_at
BEFORE UPDATE ON public.housing_services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();