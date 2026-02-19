-- Create a restricted view exposing only safe phlebotomist columns
-- This prevents sensitive fields (phone, verification_id, GPS coordinates) from
-- being accessible to authenticated users via direct table queries.
CREATE OR REPLACE VIEW public.phlebotomists_public AS
SELECT
  id,
  name,
  photo_url,
  experience_years,
  rating,
  reviews_count,
  is_available
FROM public.phlebotomists;

-- Grant SELECT on the restricted view to authenticated users
GRANT SELECT ON public.phlebotomists_public TO authenticated;

-- Drop the overly-permissive direct table SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view available phlebotomists" ON public.phlebotomists;

-- The phlebotomists table now has no SELECT policy for regular users,
-- meaning all access must go through the phlebotomists_public view.