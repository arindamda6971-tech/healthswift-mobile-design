-- Create user_prescriptions table to temporarily store uploaded prescriptions
CREATE TABLE public.user_prescriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  image_url text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'analyzed', 'booked')),
  analysis_result jsonb DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_prescriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own prescriptions"
ON public.user_prescriptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own prescriptions"
ON public.user_prescriptions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prescriptions"
ON public.user_prescriptions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prescriptions"
ON public.user_prescriptions FOR DELETE
USING (auth.uid() = user_id);

-- Add lab_id and lab_name to cart_items for tracking which lab the item is from
ALTER TABLE public.cart_items 
ADD COLUMN IF NOT EXISTS lab_id uuid,
ADD COLUMN IF NOT EXISTS lab_name text,
ADD COLUMN IF NOT EXISTS test_name text,
ADD COLUMN IF NOT EXISTS price numeric;

-- Create trigger for updated_at
CREATE TRIGGER update_user_prescriptions_updated_at
BEFORE UPDATE ON public.user_prescriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();