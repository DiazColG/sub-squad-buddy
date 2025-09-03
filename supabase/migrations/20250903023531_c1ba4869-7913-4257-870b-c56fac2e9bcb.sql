-- Create cards table to manage user credit/debit cards
CREATE TABLE public.cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Card details
  card_last_digits TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  card_type TEXT NOT NULL, -- 'credit' or 'debit'
  card_brand TEXT, -- 'visa', 'mastercard', 'amex', etc.
  expiry_date DATE NOT NULL,
  cardholder_name TEXT,
  
  -- Alert settings
  enable_expiry_alert BOOLEAN DEFAULT true,
  alert_days_before INTEGER DEFAULT 30,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  CONSTRAINT cards_user_card_unique UNIQUE (user_id, card_last_digits, bank_name)
);

-- Enable Row Level Security
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own cards" 
ON public.cards 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cards" 
ON public.cards 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cards" 
ON public.cards 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cards" 
ON public.cards 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_cards_updated_at
BEFORE UPDATE ON public.cards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add card_id foreign key to subscriptions table
ALTER TABLE public.subscriptions 
ADD COLUMN card_id UUID REFERENCES public.cards(id);

-- Create index for better performance
CREATE INDEX idx_cards_user_id ON public.cards(user_id);
CREATE INDEX idx_cards_expiry_date ON public.cards(expiry_date);
CREATE INDEX idx_subscriptions_card_id ON public.subscriptions(card_id);