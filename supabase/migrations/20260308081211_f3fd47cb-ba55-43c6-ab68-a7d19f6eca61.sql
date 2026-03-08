
-- Fix: Remove overly permissive SELECT policy on phlebotomists base table
DROP POLICY IF EXISTS "Authenticated users can view phlebotomists" ON public.phlebotomists;

-- Recreate the view as SECURITY DEFINER so the view owner can read the base table
-- without granting end-users direct table access
DROP VIEW IF EXISTS public.phlebotomists_public;
CREATE VIEW public.phlebotomists_public
WITH (security_invoker = false) AS
SELECT id, name, photo_url, experience_years, rating, reviews_count, is_available
FROM public.phlebotomists
WHERE is_available = true;

-- Grant view access to authenticated users only
GRANT SELECT ON public.phlebotomists_public TO authenticated;
REVOKE SELECT ON public.phlebotomists_public FROM anon;
