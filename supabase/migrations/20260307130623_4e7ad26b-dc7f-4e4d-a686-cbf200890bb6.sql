-- Add RLS policies to the phlebotomists table (RLS enabled but no policies)
-- Authenticated users can SELECT (the phlebotomists_public view filters sensitive columns)
CREATE POLICY "Authenticated users can view phlebotomists"
ON public.phlebotomists
FOR SELECT
TO authenticated
USING (true);