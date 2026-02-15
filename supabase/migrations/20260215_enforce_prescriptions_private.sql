-- Ensure prescriptions storage bucket is private and policies are restrictive
-- (idempotent migration to remediate scanner warning)

-- Make bucket private (safe if already false)
UPDATE storage.buckets
SET public = false
WHERE id = 'prescriptions';

-- Remove any permissive policies and recreate strict policies scoped to authenticated users
DROP POLICY IF EXISTS "Users can upload their own prescriptions" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own prescriptions" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own prescriptions" ON storage.objects;

CREATE POLICY IF NOT EXISTS "Users can upload their own prescriptions"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'prescriptions' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY IF NOT EXISTS "Users can view their own prescriptions"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'prescriptions' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY IF NOT EXISTS "Users can delete their own prescriptions"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'prescriptions' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Ensure public role cannot directly SELECT the storage.objects table (defence in depth)
REVOKE ALL ON storage.objects FROM public;
REVOKE ALL ON storage.buckets FROM public;
