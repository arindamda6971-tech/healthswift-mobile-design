-- Fix INPUT_VALIDATION: Add database constraints for input validation

-- Address validation constraints
ALTER TABLE addresses ADD CONSTRAINT pincode_format 
  CHECK (pincode ~ '^[0-9]{5,6}$');

ALTER TABLE addresses ADD CONSTRAINT latitude_range 
  CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90);

ALTER TABLE addresses ADD CONSTRAINT longitude_range 
  CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180);

-- Order validation constraints
ALTER TABLE orders ADD CONSTRAINT instructions_length 
  CHECK (special_instructions IS NULL OR LENGTH(special_instructions) <= 1000);

-- Family member validation constraints  
ALTER TABLE family_members ADD CONSTRAINT medical_conditions_size 
  CHECK (medical_conditions IS NULL OR array_length(medical_conditions, 1) <= 50);

ALTER TABLE family_members ADD CONSTRAINT name_length
  CHECK (LENGTH(name) <= 100);

ALTER TABLE family_members ADD CONSTRAINT phone_format
  CHECK (phone IS NULL OR phone ~ '^\+?[0-9]{10,15}$');

-- Reports validation constraints
ALTER TABLE reports ADD CONSTRAINT ai_summary_length 
  CHECK (ai_summary IS NULL OR LENGTH(ai_summary) <= 10000);

-- Fix MISSING_RLS: Add write policies for reports table
-- Reports should be system-generated, so users cannot INSERT directly
-- But system (via service role in Edge Functions) can create reports

-- Allow authenticated users to see processing status updates
CREATE POLICY "Users can view their processing reports"
ON public.reports
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);