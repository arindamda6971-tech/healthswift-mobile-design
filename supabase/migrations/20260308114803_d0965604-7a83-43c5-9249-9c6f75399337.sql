-- Update LifeCare Diagnostics rating to show prominently
UPDATE public.diagnostic_centers 
SET rating = 4.75, reviews_count = 950
WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';