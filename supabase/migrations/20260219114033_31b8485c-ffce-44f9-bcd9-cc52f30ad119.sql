-- Recreate the phlebotomists_public view with SECURITY INVOKER
-- to enforce the querying user's permissions rather than the view creator's
CREATE OR REPLACE VIEW public.phlebotomists_public
WITH (security_invoker = true) AS
SELECT
  id,
  name,
  photo_url,
  experience_years,
  rating,
  reviews_count,
  is_available
FROM public.phlebotomists
WHERE is_available = true;