-- Create a safe view exposing only non-sensitive phlebotomist fields
-- and grant select to the authenticated role.

-- Drop view if exists (idempotent)
DROP VIEW IF EXISTS public.phlebotomists_public;

CREATE VIEW public.phlebotomists_public AS
SELECT
  id,
  name,
  photo_url,
  experience_years,
  rating,
  reviews_count,
  is_available,
  created_at
FROM public.phlebotomists;

-- Grant select on the view to authenticated role so clients can query the safe subset
GRANT SELECT ON public.phlebotomists_public TO authenticated;

-- NOTE: Applications should query the view `phlebotomists_public` instead of
-- querying `phlebotomists` directly to avoid exposing phone, verification_id,
-- and exact location coordinates. Sensitive fields should be returned only
-- from authenticated, audited edge functions after explicit authorization.
