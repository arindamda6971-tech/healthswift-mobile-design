-- Drop rewards and referrals tables as feature is no longer needed

-- Drop triggers first
DROP TRIGGER IF EXISTS update_rewards_updated_at ON public.rewards;
DROP TRIGGER IF EXISTS set_referral_code ON public.rewards;

-- Drop the tables
DROP TABLE IF EXISTS public.referrals CASCADE;
DROP TABLE IF EXISTS public.rewards CASCADE;
