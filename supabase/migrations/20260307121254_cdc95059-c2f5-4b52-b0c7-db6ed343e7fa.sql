
-- 1. Drop dangerous INSERT/UPDATE policies on subscriptions
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.subscriptions;

-- 2. Drop dangerous INSERT/UPDATE policies on orders
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;

-- 3. Drop dangerous INSERT policy on order_items
DROP POLICY IF EXISTS "Users can insert their own order items" ON public.order_items;
