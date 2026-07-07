
CREATE TABLE public.shift_briefings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shift_id UUID REFERENCES public.agent_shifts(id) ON DELETE SET NULL,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
  team TEXT,
  shift_date DATE NOT NULL,

  adolescents_expected INTEGER,
  adolescents_counted INTEGER,
  handcuffs_expected INTEGER,
  handcuffs_counted INTEGER,
  handcuff_keys_expected INTEGER,
  handcuff_keys_counted INTEGER,

  radios JSONB NOT NULL DEFAULT '[]'::jsonb,
  schedule_ok BOOLEAN NOT NULL DEFAULT false,
  schedule_notes TEXT,
  book_entry TEXT,
  observations TEXT,

  signature TEXT,
  completed_at TIMESTAMPTZ,

  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_shift_briefings_agent ON public.shift_briefings(agent_id);
CREATE INDEX idx_shift_briefings_unit ON public.shift_briefings(unit_id);
CREATE INDEX idx_shift_briefings_shift ON public.shift_briefings(shift_id);
CREATE INDEX idx_shift_briefings_date ON public.shift_briefings(shift_date DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.shift_briefings TO authenticated;
GRANT ALL ON public.shift_briefings TO service_role;

ALTER TABLE public.shift_briefings ENABLE ROW LEVEL SECURITY;

-- Ver: mesma unidade OU admin/master
CREATE POLICY "briefings_select_same_unit_or_admin"
  ON public.shift_briefings FOR SELECT
  TO authenticated
  USING (
    public.is_admin_or_master(auth.uid())
    OR public.is_same_unit(agent_id)
    OR public.is_own_agent(agent_id)
  );

-- Inserir: apoio/chefe/admin/master da mesma unidade
CREATE POLICY "briefings_insert_leaders"
  ON public.shift_briefings FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_admin_or_master(auth.uid())
    OR (
      public.is_same_unit(agent_id)
      AND EXISTS (
        SELECT 1 FROM public.agents me
        WHERE me.cpf = split_part(auth.email(), '@', 1)
          AND me.role IN ('support','team_leader','chief','apoio','chefe_equipe')
      )
    )
  );

-- Atualizar: mesmas regras do insert
CREATE POLICY "briefings_update_leaders"
  ON public.shift_briefings FOR UPDATE
  TO authenticated
  USING (
    public.is_admin_or_master(auth.uid())
    OR (
      public.is_same_unit(agent_id)
      AND EXISTS (
        SELECT 1 FROM public.agents me
        WHERE me.cpf = split_part(auth.email(), '@', 1)
          AND me.role IN ('support','team_leader','chief','apoio','chefe_equipe')
      )
    )
  );

-- Deletar: apenas admin/master
CREATE POLICY "briefings_delete_admin"
  ON public.shift_briefings FOR DELETE
  TO authenticated
  USING (public.is_admin_or_master(auth.uid()));

CREATE TRIGGER trg_shift_briefings_updated_at
  BEFORE UPDATE ON public.shift_briefings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
