-- Create subscriptions table to track user memberships
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_plan VARCHAR(50) NOT NULL CHECK (subscription_plan IN ('monthly', 'yearly')),
  membership_type VARCHAR(50) NOT NULL CHECK (membership_type IN ('gold', 'silver', 'bronze')) DEFAULT 'gold',
  start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'expired', 'cancelled')) DEFAULT 'active',
  amount_paid DECIMAL(10, 2) NOT NULL,
  is_auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id) -- Only one active subscription per user at a time
);

-- Create index for better query performance
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_end_date ON public.subscriptions(end_date);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add subscription_type column to profiles table if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN subscription_type VARCHAR(50) DEFAULT 'none' CHECK (subscription_type IN ('none', 'gold', 'silver', 'bronze'));

CREATE INDEX idx_profiles_subscription_type ON public.profiles(subscription_type);
