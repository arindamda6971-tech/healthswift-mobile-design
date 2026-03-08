-- Fix search_path on generate_order_number and generate_referral_code
CREATE OR REPLACE FUNCTION public.generate_order_number()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.order_number := 'HS' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_referral_code()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.referral_code := 'HEALTH' || UPPER(SUBSTRING(MD5(NEW.user_id::TEXT) FROM 1 FOR 6));
  RETURN NEW;
END;
$function$;

-- Add email length validation to handle_new_user for defense-in-depth
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_full_name TEXT;
  v_phone TEXT;
  v_email TEXT;
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

  v_email := NEW.email;
  IF v_email IS NOT NULL AND LENGTH(v_email) > 255 THEN
    v_email := LEFT(v_email, 255);
  END IF;

  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (
    NEW.id,
    v_full_name,
    v_email,
    v_phone
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;