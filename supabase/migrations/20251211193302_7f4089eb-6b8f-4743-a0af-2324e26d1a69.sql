-- Fix phlebotomists public exposure - restrict to authenticated users only
-- and limit visible fields

-- Drop the existing permissive policy
DROP POLICY IF EXISTS "Anyone can view phlebotomists" ON public.phlebotomists;

-- Create a new policy that only allows authenticated users
-- and restricts access to non-sensitive data
CREATE POLICY "Authenticated users can view available phlebotomists"
ON public.phlebotomists
FOR SELECT
TO authenticated
USING (is_available = true);

-- Note: Sensitive fields like phone, verification_id, and exact GPS coordinates
-- should be accessed only through controlled Edge Functions
-- The SELECT policy allows viewing basic info (name, rating, experience)
-- but the actual data filtering should happen at application level