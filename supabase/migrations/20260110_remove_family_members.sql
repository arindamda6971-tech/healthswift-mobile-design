-- Remove family_members table and related foreign keys

-- Drop foreign key constraints that reference family_members
ALTER TABLE IF EXISTS public.orders DROP CONSTRAINT IF EXISTS orders_family_member_id_fkey;
ALTER TABLE IF EXISTS public.order_items DROP CONSTRAINT IF EXISTS order_items_family_member_id_fkey;
ALTER TABLE IF EXISTS public.cart_items DROP CONSTRAINT IF EXISTS cart_items_family_member_id_fkey;
ALTER TABLE IF EXISTS public.reports DROP CONSTRAINT IF EXISTS reports_family_member_id_fkey;

-- Remove family_member_id columns from tables
ALTER TABLE IF EXISTS public.orders DROP COLUMN IF EXISTS family_member_id;
ALTER TABLE IF EXISTS public.order_items DROP COLUMN IF EXISTS family_member_id;
ALTER TABLE IF EXISTS public.cart_items DROP COLUMN IF EXISTS family_member_id;
ALTER TABLE IF EXISTS public.reports DROP COLUMN IF EXISTS family_member_id;

-- Drop the family_members table
DROP TABLE IF EXISTS public.family_members CASCADE;
