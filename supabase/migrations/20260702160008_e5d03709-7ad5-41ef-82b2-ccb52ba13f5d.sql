
CREATE TABLE public.shift_checklists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  shift_id UUID NOT NULL REFERENCES public.agent_shifts(id) ON DELETE CASCADE,
  checklist JSONB NOT NULL DEFAULT '{}'::jsonb,
  observations TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (agent_id, shift_id)
);

CREATE INDEX idx_shift_checklists_agent ON public.shift_checklists(agent_id);
CREATE INDEX idx_shift_checklists_shift ON public.shift_checklists(shift_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.shift_checklists TO authenticated;
GRANT ALL ON public.shift_checklists TO service_role;

ALTER TABLE public.shift_checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agent manages own checklist"
  ON public.shift_checklists
  FOR ALL
  USING (public.is_own_agent(agent_id))
  WITH CHECK (public.is_own_agent(agent_id));

CREATE POLICY "Same unit can view checklist"
  ON public.shift_checklists
  FOR SELECT
  USING (public.is_same_unit(agent_id));

CREATE POLICY "Admins manage all checklists"
  ON public.shift_checklists
  FOR ALL
  USING (public.is_admin_or_master(auth.uid()))
  WITH CHECK (public.is_admin_or_master(auth.uid()));

CREATE TRIGGER update_shift_checklists_updated_at
  BEFORE UPDATE ON public.shift_checklists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
