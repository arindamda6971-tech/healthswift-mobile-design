-- Drop FK constraint on vendor_id since vendor IDs come from the external partner project, not local auth.users
ALTER TABLE public.diagnostic_centers DROP CONSTRAINT diagnostic_centers_vendor_id_fkey;

-- Now set vendor_id on LifeCare Diagnostics
UPDATE public.diagnostic_centers 
SET vendor_id = '6d341cca-d462-46f2-913c-215cfb595b37'
WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';