
-- Create serviceable_pincodes table
CREATE TABLE public.serviceable_pincodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pincode text NOT NULL UNIQUE,
  city text,
  state text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.serviceable_pincodes ENABLE ROW LEVEL SECURITY;

-- Anyone can read serviceable pincodes (public data)
CREATE POLICY "Anyone can view serviceable pincodes"
  ON public.serviceable_pincodes
  FOR SELECT
  USING (is_active = true);

-- Insert demo pincode
INSERT INTO public.serviceable_pincodes (pincode, city, state) VALUES ('721101', 'Midnapore', 'West Bengal');
