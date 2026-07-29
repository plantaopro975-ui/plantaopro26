
CREATE OR REPLACE FUNCTION public.get_public_team_counts()
RETURNS TABLE(team text, total int, active int)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  WITH teams(name) AS (
    VALUES ('ALFA'),('BRAVO'),('CHARLIE'),('DELTA')
  )
  SELECT
    t.name,
    COALESCE(COUNT(a.id), 0)::int,
    COALESCE(COUNT(a.id) FILTER (
      WHERE a.is_active = true AND a.approval_status = 'approved'
    ), 0)::int
  FROM teams t
  LEFT JOIN public.agents a
    ON UPPER(a.team) = t.name
  GROUP BY t.name
  ORDER BY t.name;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_team_counts() TO anon, authenticated;
