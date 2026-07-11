
CREATE OR REPLACE FUNCTION public.current_agent_unit_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT unit_id FROM public.agents
  WHERE cpf = split_part(auth.email(), '@', 1)
  LIMIT 1
$$;

CREATE TABLE IF NOT EXISTS public.team_lock_state (
  unit_id uuid PRIMARY KEY,
  team text NOT NULL,
  team_confirmed boolean NOT NULL DEFAULT false,
  scheduled_for timestamptz,
  updated_by uuid,
  updated_by_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_lock_state TO authenticated;
GRANT ALL ON public.team_lock_state TO service_role;

ALTER TABLE public.team_lock_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "team_lock_state select same unit"
ON public.team_lock_state FOR SELECT
TO authenticated
USING (unit_id = public.current_agent_unit_id() OR public.is_admin_or_master(auth.uid()));

CREATE POLICY "team_lock_state upsert same unit"
ON public.team_lock_state FOR INSERT
TO authenticated
WITH CHECK (unit_id = public.current_agent_unit_id() OR public.is_admin_or_master(auth.uid()));

CREATE POLICY "team_lock_state update same unit"
ON public.team_lock_state FOR UPDATE
TO authenticated
USING (unit_id = public.current_agent_unit_id() OR public.is_admin_or_master(auth.uid()))
WITH CHECK (unit_id = public.current_agent_unit_id() OR public.is_admin_or_master(auth.uid()));

CREATE POLICY "team_lock_state delete same unit"
ON public.team_lock_state FOR DELETE
TO authenticated
USING (unit_id = public.current_agent_unit_id() OR public.is_admin_or_master(auth.uid()));

CREATE TRIGGER team_lock_state_touch
BEFORE UPDATE ON public.team_lock_state
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.team_lock_state;
ALTER TABLE public.team_lock_state REPLICA IDENTITY FULL;
