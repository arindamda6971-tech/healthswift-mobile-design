-- Enable RLS for addresses table
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- Add phone column if it doesn't exist
ALTER TABLE public.addresses 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS lat DECIMAL(10,8),
ADD COLUMN IF NOT EXISTS lon DECIMAL(11,8);

-- RLS Policies for addresses
-- Users can view their own addresses
CREATE POLICY "Users can view their own addresses"
ON public.addresses FOR SELECT
USING (auth.uid()::text = user_id::text);

-- Users can insert their own addresses
CREATE POLICY "Users can insert their own addresses"
ON public.addresses FOR INSERT
WITH CHECK (auth.uid()::text = user_id::text);

-- Users can update their own addresses
CREATE POLICY "Users can update their own addresses"
ON public.addresses FOR UPDATE
USING (auth.uid()::text = user_id::text);

-- Users can delete their own addresses
CREATE POLICY "Users can delete their own addresses"
ON public.addresses FOR DELETE
USING (auth.uid()::text = user_id::text);

-- Add updated_at trigger if not exists
CREATE TRIGGER update_addresses_updated_at
  BEFORE UPDATE ON public.addresses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
