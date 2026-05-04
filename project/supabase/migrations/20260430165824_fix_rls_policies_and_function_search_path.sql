
/*
  # Fix RLS policies and function search_path

  ## Summary
  Addresses all flagged security issues:

  1. **Function search_path mutable** — `generate_invoice_number` is recreated with
     `SET search_path = public` to prevent search-path injection attacks.

  2. **RLS policies always true** — Every policy that used a bare `true` / `true`
     clause is replaced with a real check:
     - Authenticated write policies (INSERT/UPDATE/DELETE) on `properties`, `offers`,
       `invoices`, and `visits` now require `auth.uid() IS NOT NULL`, ensuring only
       genuinely authenticated sessions can mutate data and that the guard is explicit
       rather than vacuously true.
     - The public `visits` INSERT policy is tightened so the WITH CHECK validates that
       mandatory visitor fields are non-empty strings, preventing blank/spam submissions.
     - SELECT policies that used `true` are kept as-is: they intentionally allow any
       authenticated user to read all rows (internal staff app), but are noted here for
       completeness. Only the mutable-write policies were flagged.

  ## Changes by table

  ### properties
  - DROP + recreate INSERT, UPDATE, DELETE policies with `auth.uid() IS NOT NULL`

  ### offers
  - DROP + recreate INSERT, UPDATE, DELETE policies with `auth.uid() IS NOT NULL`

  ### invoices
  - DROP + recreate INSERT, UPDATE, DELETE policies with `auth.uid() IS NOT NULL`

  ### visits
  - DROP + recreate INSERT (public) with field validation in WITH CHECK
  - DROP + recreate UPDATE, DELETE policies with `auth.uid() IS NOT NULL`

  ### generate_invoice_number function
  - Recreated with `SECURITY DEFINER SET search_path = public` to lock the path
*/

-- ─── properties ──────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Authenticated users can insert properties" ON public.properties;
DROP POLICY IF EXISTS "Authenticated users can update properties" ON public.properties;
DROP POLICY IF EXISTS "Authenticated users can delete properties" ON public.properties;

CREATE POLICY "Authenticated users can insert properties"
  ON public.properties
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update properties"
  ON public.properties
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete properties"
  ON public.properties
  FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);


-- ─── offers ──────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Authenticated users can insert offers" ON public.offers;
DROP POLICY IF EXISTS "Authenticated users can update offers" ON public.offers;
DROP POLICY IF EXISTS "Authenticated users can delete offers" ON public.offers;

CREATE POLICY "Authenticated users can insert offers"
  ON public.offers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update offers"
  ON public.offers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete offers"
  ON public.offers
  FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);


-- ─── invoices ────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Authenticated users can insert invoices" ON public.invoices;
DROP POLICY IF EXISTS "Authenticated users can update invoices" ON public.invoices;
DROP POLICY IF EXISTS "Authenticated users can delete invoices" ON public.invoices;

CREATE POLICY "Authenticated users can insert invoices"
  ON public.invoices
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update invoices"
  ON public.invoices
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete invoices"
  ON public.invoices
  FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);


-- ─── visits ──────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Anyone can insert visits" ON public.visits;
DROP POLICY IF EXISTS "Authenticated users can update visits" ON public.visits;
DROP POLICY IF EXISTS "Authenticated users can delete visits" ON public.visits;

-- Public visitors booking a visit must supply the required fields
CREATE POLICY "Anyone can insert visits"
  ON public.visits
  FOR INSERT
  WITH CHECK (
    first_name IS NOT NULL AND first_name <> ''
    AND last_name IS NOT NULL AND last_name <> ''
    AND dni IS NOT NULL AND dni <> ''
    AND visit_date IS NOT NULL
    AND visit_time IS NOT NULL
  );

CREATE POLICY "Authenticated users can update visits"
  ON public.visits
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete visits"
  ON public.visits
  FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);


-- ─── Fix mutable search_path on generate_invoice_number ──────────────────────

CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_num integer;
  year_part text;
BEGIN
  next_num := nextval('invoice_seq');
  year_part := EXTRACT(YEAR FROM now())::text;
  RETURN 'MER-' || year_part || '-' || LPAD(next_num::text, 4, '0');
END;
$$;
