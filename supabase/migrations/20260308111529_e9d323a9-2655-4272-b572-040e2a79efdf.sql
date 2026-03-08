-- Create a function to call the partner-hub-webhook edge function
CREATE OR REPLACE FUNCTION public.notify_partner_hub_on_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  payload jsonb;
  request_id bigint;
BEGIN
  -- Build the webhook payload
  payload := jsonb_build_object(
    'type', TG_OP,
    'table', TG_TABLE_NAME,
    'schema', TG_TABLE_SCHEMA,
    'record', row_to_json(NEW),
    'old_record', CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END
  );

  -- Call the edge function using pg_net extension
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url', true) || '/functions/v1/partner-hub-webhook',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := payload
  ) INTO request_id;

  RETURN NEW;
END;
$$;

-- Create the trigger on the orders table
DROP TRIGGER IF EXISTS on_order_insert_notify_partner ON public.orders;

CREATE TRIGGER on_order_insert_notify_partner
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_partner_hub_on_order();