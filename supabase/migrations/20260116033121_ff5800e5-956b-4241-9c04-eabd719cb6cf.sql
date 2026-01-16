-- Create storage bucket for prescriptions
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('prescriptions', 'prescriptions', false, 5242880, ARRAY['image/jpeg', 'image/jpg']);

-- Create RLS policies for prescriptions bucket
CREATE POLICY "Users can upload their own prescriptions"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'prescriptions' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own prescriptions"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'prescriptions' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own prescriptions"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'prescriptions' AND auth.uid()::text = (storage.foldername(name))[1]);