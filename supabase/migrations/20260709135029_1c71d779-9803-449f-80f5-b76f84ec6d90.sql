
CREATE OR REPLACE FUNCTION public.get_public_operational_counts()
RETURNS TABLE(units_count integer, agents_total integer, agents_active integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT COUNT(*)::int FROM public.units),
    (SELECT COUNT(*)::int FROM public.agents),
    (SELECT COUNT(*)::int FROM public.agents WHERE is_active = true);
$$;

GRANT EXECUTE ON FUNCTION public.get_public_operational_counts() TO anon, authenticated;
