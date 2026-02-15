-- Replace permissive phlebotomists policy with a safe public view
-- - Drop the "Anyone can view phlebotomists" policy
-- - Keep phlebotomists table access restricted to authenticated users only
-- - Expose a view with only non-sensitive fields to the anon role

-- Remove overly-broad policy (if present)
DROP POLICY IF EXISTS "Anyone can view phlebotomists" ON public.phlebotomists;

-- Ensure authenticated users can still SELECT available phlebotomists
DROP POLICY IF EXISTS "Authenticated users can view available phlebotomists" ON public.phlebotomists;
CREATE POLICY "Authenticated users can view available phlebotomists"
  ON public.phlebotomists FOR SELECT
  TO authenticated
  USING (is_available = true);

-- Create an anonymized view that exposes non-sensitive columns only
CREATE OR REPLACE VIEW public.phlebotomists_public AS
SELECT
  id,
  name,
  photo_url,
  is_available,
  rating,
  reviews_count,
  experience_years
FROM public.phlebotomists
WHERE is_available = true;

-- Allow anonymous (frontend) consumers to read the safe view only
GRANT SELECT ON public.phlebotomists_public TO anon;

-- Revoke any direct anon access to the base table (defence in depth)
REVOKE SELECT ON public.phlebotomists FROM anon;
