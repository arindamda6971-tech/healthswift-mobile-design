-- Drop permissive UPDATE policy if it exists
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;

-- Allow users to cancel only their own pending/confirmed orders
CREATE POLICY "Users can cancel their own orders"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status IN ('pending', 'confirmed'))
  WITH CHECK (auth.uid() = user_id AND status = 'cancelled');