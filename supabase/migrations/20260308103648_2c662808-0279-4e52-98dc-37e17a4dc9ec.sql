
-- 1. Create app_role enum and user_roles table (per security best practices)
CREATE TYPE public.app_role AS ENUM ('admin', 'vendor', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Users can view their own roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 2. Add vendor columns to existing orders table
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS vendor_id UUID,
  ADD COLUMN IF NOT EXISTS lab_name TEXT,
  ADD COLUMN IF NOT EXISTS test_name TEXT;

-- Vendor RLS: vendors can read orders assigned to them
CREATE POLICY "Vendors can view assigned orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (
    vendor_id = auth.uid()
    AND public.has_role(auth.uid(), 'vendor')
  );

-- 3. Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  availability BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Anyone can view available products
CREATE POLICY "Anyone can view available products"
  ON public.products FOR SELECT
  TO authenticated
  USING (availability = true);

-- Vendors can insert their own products
CREATE POLICY "Vendors can insert own products"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = vendor_id
    AND public.has_role(auth.uid(), 'vendor')
  );

-- Vendors can update their own products
CREATE POLICY "Vendors can update own products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = vendor_id
    AND public.has_role(auth.uid(), 'vendor')
  );

-- Vendors can delete their own products
CREATE POLICY "Vendors can delete own products"
  ON public.products FOR DELETE
  TO authenticated
  USING (
    auth.uid() = vendor_id
    AND public.has_role(auth.uid(), 'vendor')
  );

-- Updated_at trigger for products
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Enable realtime on both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
