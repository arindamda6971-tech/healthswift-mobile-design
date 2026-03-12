ALTER TABLE public.subscriptions 
  ADD COLUMN IF NOT EXISTS subscriber_type text NOT NULL DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS subscriber_name text;