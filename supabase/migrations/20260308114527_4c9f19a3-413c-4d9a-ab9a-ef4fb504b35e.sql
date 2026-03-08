-- Add test_id and category columns to products table for vendor test sync
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS test_id uuid,
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS name text;

-- Create index for vendor test lookups
CREATE INDEX IF NOT EXISTS idx_products_vendor_test 
ON public.products(vendor_id, test_id);

-- Create a unique constraint to prevent duplicate test entries per vendor
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_vendor_test_unique 
ON public.products(vendor_id, test_id) WHERE test_id IS NOT NULL;