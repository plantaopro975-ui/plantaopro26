CREATE OR REPLACE FUNCTION public.list_agents_same_team()
RETURNS TABLE(
  id uuid, name text, team text, "position" text, role text,
  matricula text, avatar_url text, is_active boolean, is_frozen boolean,
  approval_status text, license_status text, unit_name text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH me AS (
    SELECT unit_id, team
    FROM public.agents
    WHERE cpf = split_part(auth.email(), '@', 1)
    LIMIT 1
  )
  SELECT
    a.id, a.name, a.team, a."position", a.role, a.matricula, a.avatar_url,
    a.is_active, a.is_frozen, a.approval_status, a.license_status,
    u.name AS unit_name
  FROM public.agents a
  LEFT JOIN public.units u ON u.id = a.unit_id
  WHERE a.unit_id = (SELECT unit_id FROM me)
    AND a.team = (SELECT team FROM me)
    AND (SELECT unit_id FROM me) IS NOT NULL
    AND (SELECT team FROM me) IS NOT NULL
  ORDER BY a.name;
$$;

GRANT EXECUTE ON FUNCTION public.list_agents_same_team() TO authenticated;