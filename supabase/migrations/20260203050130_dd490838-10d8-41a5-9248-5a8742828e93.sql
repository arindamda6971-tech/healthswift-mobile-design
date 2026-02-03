-- Add diagnostic_center_id column to test_packages table
ALTER TABLE public.test_packages 
ADD COLUMN diagnostic_center_id uuid REFERENCES public.diagnostic_centers(id);

-- Create index for better query performance
CREATE INDEX idx_test_packages_diagnostic_center ON public.test_packages(diagnostic_center_id);

-- Insert health packages for existing diagnostic centers
INSERT INTO public.test_packages (name, description, price, original_price, discount_percent, tests_count, is_active, is_popular, icon, color, diagnostic_center_id)
VALUES 
  -- Apollo Diagnostics packages
  ('Apollo Full Body Checkup', 'Comprehensive health screening with 70+ parameters', 1999, 3499, 43, 70, true, true, 'HeartPulse', 'from-primary to-primary/60', '03f0648e-3af7-450e-908d-10911961a9ca'),
  ('Apollo Wellness Package', 'Essential wellness tests for preventive care', 1299, 1999, 35, 45, true, false, 'Activity', 'from-success to-success/60', '03f0648e-3af7-450e-908d-10911961a9ca'),
  
  -- Dr. Lal PathLabs packages
  ('Lal PathLabs Complete Health', 'Complete health assessment with vital organ tests', 1799, 2999, 40, 65, true, true, 'HeartPulse', 'from-blue-500 to-blue-400', '98ab4535-6d65-4a02-a505-f8f0cac2f744'),
  ('Lal PathLabs Senior Citizen Package', 'Specialized tests for senior health monitoring', 2499, 3999, 38, 80, true, false, 'Shield', 'from-purple-500 to-purple-400', '98ab4535-6d65-4a02-a505-f8f0cac2f744'),
  
  -- Metropolis Healthcare packages
  ('Metropolis Executive Health', 'Executive health checkup with advanced tests', 2299, 3999, 42, 75, true, true, 'HeartPulse', 'from-teal-500 to-teal-400', '58a7715b-3437-4b3f-8bc9-61c1a9925570'),
  ('Metropolis Women Wellness', 'Comprehensive womens health package', 1899, 2999, 37, 55, true, false, 'Activity', 'from-pink-500 to-pink-400', '58a7715b-3437-4b3f-8bc9-61c1a9925570'),
  
  -- Thyrocare packages
  ('Thyrocare Aarogyam Full Body', 'Popular full body checkup with thyroid focus', 1499, 2499, 40, 60, true, true, 'HeartPulse', 'from-orange-500 to-orange-400', 'fb24702e-934a-49dc-9c27-434cbd475350'),
  ('Thyrocare Diabetes Screening', 'Complete diabetes risk assessment', 899, 1499, 40, 25, true, false, 'Activity', 'from-amber-500 to-amber-400', 'fb24702e-934a-49dc-9c27-434cbd475350'),
  
  -- SRL Diagnostics packages
  ('SRL Comprehensive Checkup', 'Full body health assessment', 1699, 2799, 39, 68, true, true, 'HeartPulse', 'from-indigo-500 to-indigo-400', 'd2a60f5e-022d-4993-81cc-58cef1b295dc'),
  ('SRL Heart Care Package', 'Cardiac health monitoring package', 1999, 3299, 39, 40, true, false, 'Shield', 'from-red-500 to-red-400', 'd2a60f5e-022d-4993-81cc-58cef1b295dc');