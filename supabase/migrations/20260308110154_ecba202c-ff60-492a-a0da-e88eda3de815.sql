-- Add vendor_id to diagnostic_centers table to link with vendor accounts
ALTER TABLE public.diagnostic_centers
ADD COLUMN IF NOT EXISTS vendor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add available_tests column for tests offered by the center
ALTER TABLE public.diagnostic_centers
ADD COLUMN IF NOT EXISTS available_tests jsonb DEFAULT '[]'::jsonb;

-- Add pricing column for custom pricing information
ALTER TABLE public.diagnostic_centers
ADD COLUMN IF NOT EXISTS pricing jsonb DEFAULT '{}'::jsonb;

-- Enable real-time on diagnostic_centers
ALTER PUBLICATION supabase_realtime ADD TABLE public.diagnostic_centers;

-- RLS policy: Vendors can view and update their own diagnostic centers
CREATE POLICY "Vendors can update own diagnostic centers"
ON public.diagnostic_centers
FOR UPDATE
TO authenticated
USING (vendor_id = auth.uid() AND has_role(auth.uid(), 'vendor'::app_role))
WITH CHECK (vendor_id = auth.uid() AND has_role(auth.uid(), 'vendor'::app_role));

CREATE POLICY "Vendors can insert own diagnostic centers"
ON public.diagnostic_centers
FOR INSERT
TO authenticated
WITH CHECK (vendor_id = auth.uid() AND has_role(auth.uid(), 'vendor'::app_role));