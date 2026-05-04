
/*
  # Revoke EXECUTE on generate_invoice_number from PUBLIC

  The previous migration revoked from `anon` and `authenticated` directly, but
  Postgres also grants EXECUTE to the PUBLIC pseudo-role by default on new functions,
  which implicitly grants access to every role including `anon` and `authenticated`.

  ## Changes
  - Revoke EXECUTE on `generate_invoice_number()` from PUBLIC
  - `postgres` and `service_role` retain their explicit EXECUTE grants
*/

REVOKE EXECUTE ON FUNCTION public.generate_invoice_number() FROM PUBLIC;
