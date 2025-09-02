-- Create feedback table for user comments and feature requests
CREATE TABLE public.feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('improvement', 'feature_request', 'bug_report', 'general')),
  title text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'in_progress', 'completed', 'dismissed')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Create policies for feedback
CREATE POLICY "Users can create feedback" 
ON public.feedback 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own feedback" 
ON public.feedback 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_feedback_updated_at
BEFORE UPDATE ON public.feedback
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();