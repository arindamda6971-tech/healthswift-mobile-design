-- Drop health_scores table and related objects
-- This table was created for the Health Score feature which has been removed

-- Drop trigger first
DROP TRIGGER IF EXISTS update_health_scores_updated_at ON public.health_scores;

-- Drop policies
DROP POLICY IF EXISTS "Users can view their own health score" ON public.health_scores;
DROP POLICY IF EXISTS "Users can insert their own health score" ON public.health_scores;
DROP POLICY IF EXISTS "Users can update their own health score" ON public.health_scores;

-- Drop table
DROP TABLE IF EXISTS public.health_scores;
