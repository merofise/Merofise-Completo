
/*
  # Revoke public EXECUTE on generate_invoice_number

  The function `generate_invoice_number()` is a SECURITY DEFINER function intended
  for internal database use only. It must not be callable via the PostgREST REST API
  by anonymous or authenticated clients.

  ## Changes
  - Revoke EXECUTE on `generate_invoice_number()` from `anon` role
  - Revoke EXECUTE on `generate_invoice_number()` from `authenticated` role

  The function remains callable by `postgres` / service-role internally.
*/

REVOKE EXECUTE ON FUNCTION public.generate_invoice_number() FROM anon;
REVOKE EXECUTE ON FUNCTION public.generate_invoice_number() FROM authenticated;
