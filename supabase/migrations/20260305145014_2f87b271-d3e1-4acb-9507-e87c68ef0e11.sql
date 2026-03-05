-- 1. Add length constraint on profiles.full_name
ALTER TABLE public.profiles
ADD CONSTRAINT full_name_length CHECK (LENGTH(full_name) <= 100);

-- 2. Harden handle_new_user with validation and ON CONFLICT
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_full_name TEXT;
BEGIN
  v_full_name := COALESCE(
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'name'
  );
  
  IF v_full_name IS NOT NULL AND LENGTH(v_full_name) > 100 THEN
    v_full_name := LEFT(v_full_name, 100);
  END IF;

  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (
    NEW.id,
    v_full_name,
    NEW.email,
    NEW.phone
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;