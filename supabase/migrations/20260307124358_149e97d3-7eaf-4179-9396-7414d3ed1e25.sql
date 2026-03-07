-- Harden handle_new_user: add phone length check, revoke public execute
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  v_full_name TEXT;
  v_phone TEXT;
BEGIN
  v_full_name := COALESCE(
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'name'
  );
  
  IF v_full_name IS NOT NULL AND LENGTH(v_full_name) > 100 THEN
    v_full_name := LEFT(v_full_name, 100);
  END IF;

  v_phone := NEW.phone;
  IF v_phone IS NOT NULL AND LENGTH(v_phone) > 20 THEN
    v_phone := LEFT(v_phone, 20);
  END IF;

  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (
    NEW.id,
    v_full_name,
    NEW.email,
    v_phone
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Revoke execute from public to limit attack surface
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;