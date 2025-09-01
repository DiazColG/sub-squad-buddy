-- Add payment method fields to subscriptions table
ALTER TABLE public.subscriptions 
ADD COLUMN payment_method TEXT,
ADD COLUMN bank_name TEXT,
ADD COLUMN card_type TEXT,
ADD COLUMN card_last_digits TEXT;