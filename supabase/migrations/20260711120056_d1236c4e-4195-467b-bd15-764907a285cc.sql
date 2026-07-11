CREATE TABLE public.team_round_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid REFERENCES public.units(id) ON DELETE CASCADE,
  team text NOT NULL,
  saved_name text NOT NULL,
  completed_by uuid NOT NULL,
  total_seconds integer,
  agents_count integer,
  completed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, DELETE ON public.team_round_log TO authenticated;
GRANT ALL ON public.team_round_log TO service_role;

ALTER TABLE public.team_round_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Same unit can read team round log"
  ON public.team_round_log
  FOR SELECT TO authenticated
  USING (unit_id IS NOT NULL AND unit_id = public.current_agent_unit_id());

CREATE POLICY "Own user can insert into their unit"
  ON public.team_round_log
  FOR INSERT TO authenticated
  WITH CHECK (
    completed_by = auth.uid()
    AND unit_id = public.current_agent_unit_id()
  );

CREATE POLICY "Same unit users can clear entries"
  ON public.team_round_log
  FOR DELETE TO authenticated
  USING (unit_id IS NOT NULL AND unit_id = public.current_agent_unit_id());

CREATE INDEX team_round_log_unit_completed_idx
  ON public.team_round_log(unit_id, completed_at DESC);