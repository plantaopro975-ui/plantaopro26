CREATE OR REPLACE FUNCTION public.list_agents_system()
RETURNS TABLE (
  id uuid, name text, team text, "position" text, matricula text,
  avatar_url text, is_active boolean, is_frozen boolean,
  approval_status text, license_status text,
  unit_name text, unit_municipality text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    a.id, a.name, a.team, a."position", a.matricula, a.avatar_url,
    a.is_active, a.is_frozen, a.approval_status, a.license_status,
    u.name, u.municipality
  FROM public.agents a
  LEFT JOIN public.units u ON u.id = a.unit_id
  WHERE a.approval_status = 'approved' AND COALESCE(a.is_active, false) = true
  ORDER BY u.municipality NULLS LAST, u.name NULLS LAST, a.team NULLS LAST, a.name;
$$;

REVOKE ALL ON FUNCTION public.list_agents_system() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.list_agents_system() FROM anon;
GRANT EXECUTE ON FUNCTION public.list_agents_system() TO authenticated;