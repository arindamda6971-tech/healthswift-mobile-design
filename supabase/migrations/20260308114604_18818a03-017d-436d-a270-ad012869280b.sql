-- Create a vendor role for LifeCare Diagnostics
-- Using a deterministic UUID so we can reference it consistently
-- This will be the vendor_id used by the partner app

-- Insert LifeCare Diagnostics as a diagnostic center
INSERT INTO public.diagnostic_centers (
  id,
  name,
  address,
  city,
  state,
  pincode,
  phone,
  email,
  rating,
  reviews_count,
  is_active,
  is_verified,
  home_collection_available,
  opening_time,
  closing_time,
  services,
  ecg_available,
  ecg_price,
  vendor_id,
  available_tests,
  pricing
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'LifeCare Diagnostics',
  '45, Healthcare Avenue',
  'Mumbai',
  'Maharashtra',
  '400001',
  '+91 98765 43210',
  'contact@lifecare.com',
  4.7,
  850,
  true,
  true,
  true,
  '07:00',
  '21:00',
  '["Blood Tests", "Urine Tests", "ECG", "Health Packages", "Home Collection"]'::jsonb,
  true,
  399,
  NULL,
  '["Complete Blood Count", "Lipid Profile", "Thyroid Profile", "Liver Function Test", "Kidney Function Test", "HbA1c", "Vitamin D", "Vitamin B12", "Sugar Fasting", "ESR"]'::jsonb,
  '{"Complete Blood Count": 350, "Lipid Profile": 450, "Thyroid Profile": 550, "Liver Function Test": 600, "Kidney Function Test": 500, "HbA1c": 400, "Vitamin D": 800, "Vitamin B12": 750, "Sugar Fasting": 100, "ESR": 150}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  available_tests = EXCLUDED.available_tests,
  pricing = EXCLUDED.pricing,
  is_active = EXCLUDED.is_active;