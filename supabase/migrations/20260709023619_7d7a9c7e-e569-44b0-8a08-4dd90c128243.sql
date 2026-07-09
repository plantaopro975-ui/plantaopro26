
-- ============================================================
-- FASE 1: Endurecimento da RLS de public.agents (fix: "position" reservado)
-- ============================================================

-- ---------- 1. RPC de login por CPF ----------
CREATE OR REPLACE FUNCTION public.lookup_agent_for_login(_cpf text)
RETURNS TABLE (
  id uuid,
  name text,
  team text,
  email text,
  matricula text,
  is_active boolean,
  is_frozen boolean,
  license_status text,
  license_expires_at timestamptz,
  unit_name text,
  unit_municipality text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    a.id,
    a.name,
    a.team,
    a.email,
    a.matricula,
    a.is_active,
    a.is_frozen,
    a.license_status,
    a.license_expires_at,
    u.name,
    u.municipality
  FROM public.agents a
  LEFT JOIN public.units u ON u.id = a.unit_id
  WHERE a.cpf = regexp_replace(coalesce(_cpf, ''), '\D', '', 'g')
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.lookup_agent_for_login(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.lookup_agent_for_login(text) TO anon, authenticated;

-- ---------- 2. RPC do diretório (mesma unidade) ----------
CREATE OR REPLACE FUNCTION public.list_agents_same_unit()
RETURNS TABLE (
  id uuid,
  name text,
  team text,
  "position" text,
  role text,
  matricula text,
  avatar_url text,
  is_active boolean,
  is_frozen boolean,
  approval_status text,
  license_status text,
  unit_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH me AS (
    SELECT unit_id
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
    AND (SELECT unit_id FROM me) IS NOT NULL
  ORDER BY a.name;
$$;

REVOKE ALL ON FUNCTION public.list_agents_same_unit() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_agents_same_unit() TO authenticated;

-- ---------- 3. Remover policies abertas ----------
DROP POLICY IF EXISTS "leitura_agentes"             ON public.agents;
DROP POLICY IF EXISTS "Public CPF lookup for login" ON public.agents;

-- ---------- 4. Novas policies restritas ----------
CREATE POLICY "Own agent read"
ON public.agents
FOR SELECT
TO authenticated
USING (
  id = auth.uid()
  OR cpf = split_part(auth.email(), '@', 1)
);

CREATE POLICY "Same unit read"
ON public.agents
FOR SELECT
TO authenticated
USING (public.is_same_unit(id));
