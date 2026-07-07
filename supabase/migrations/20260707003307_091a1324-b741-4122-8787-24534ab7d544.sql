
-- 1. Nova tabela scheduled_rounds
CREATE TABLE public.scheduled_rounds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE,
  team TEXT NOT NULL, -- 'ALFA' | 'BRAVO' | 'CHARLIE' | 'DELTA' | 'ALL'
  name TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('once','recurring','interval')),
  scheduled_at TIMESTAMPTZ,               -- para mode='once'
  recur_times TEXT[] DEFAULT '{}',        -- HH:MM (recurring)
  recur_weekdays INT[] DEFAULT '{0,1,2,3,4,5,6}', -- 0=domingo
  interval_minutes INT,                   -- para mode='interval'
  active_from TIMESTAMPTZ,
  active_until TIMESTAMPTZ,
  ronda_duration_min INT NOT NULL DEFAULT 60,
  round_mode TEXT NOT NULL DEFAULT 'interval', -- mode do round_sessions
  round_start_time TEXT NOT NULL DEFAULT '07:00',
  round_end_time TEXT NOT NULL DEFAULT '19:00',
  round_interval_min INT NOT NULL DEFAULT 60,
  require_confirmation_to_stop BOOLEAN NOT NULL DEFAULT true,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  next_trigger_at TIMESTAMPTZ,
  last_triggered_at TIMESTAMPTZ,
  created_by UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.scheduled_rounds TO authenticated;
GRANT ALL ON public.scheduled_rounds TO service_role;

ALTER TABLE public.scheduled_rounds ENABLE ROW LEVEL SECURITY;

-- Agentes da mesma unidade podem visualizar agendamentos da própria unidade
CREATE POLICY "Agents see rounds of their unit"
  ON public.scheduled_rounds FOR SELECT
  TO authenticated
  USING (
    unit_id IS NULL
    OR EXISTS (
      SELECT 1 FROM public.agents a
      WHERE a.cpf = split_part(auth.email(), '@', 1)
        AND a.unit_id = scheduled_rounds.unit_id
    )
    OR public.is_admin_or_master(auth.uid())
  );

-- Apenas admin/master pode inserir/alterar/excluir
CREATE POLICY "Admins manage scheduled rounds"
  ON public.scheduled_rounds FOR ALL
  TO authenticated
  USING (public.is_admin_or_master(auth.uid()))
  WITH CHECK (public.is_admin_or_master(auth.uid()));

CREATE INDEX scheduled_rounds_next_trigger_idx
  ON public.scheduled_rounds (next_trigger_at)
  WHERE is_enabled = true;

CREATE INDEX scheduled_rounds_unit_team_idx
  ON public.scheduled_rounds (unit_id, team);

CREATE TRIGGER scheduled_rounds_set_updated_at
  BEFORE UPDATE ON public.scheduled_rounds
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Extensão em round_sessions
ALTER TABLE public.round_sessions
  ADD COLUMN IF NOT EXISTS scheduled_round_id UUID REFERENCES public.scheduled_rounds(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS auto_started BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS require_confirmation_to_stop BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stop_confirmed_by UUID,
  ADD COLUMN IF NOT EXISTS stop_confirmed_at TIMESTAMPTZ;

-- 3. Função para calcular próximo trigger
CREATE OR REPLACE FUNCTION public.calc_next_scheduled_round_trigger(
  p_mode TEXT,
  p_scheduled_at TIMESTAMPTZ,
  p_recur_times TEXT[],
  p_recur_weekdays INT[],
  p_interval_minutes INT,
  p_last_triggered_at TIMESTAMPTZ,
  p_active_from TIMESTAMPTZ,
  p_active_until TIMESTAMPTZ
)
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  v_now TIMESTAMPTZ := now();
  v_base TIMESTAMPTZ;
  v_candidate TIMESTAMPTZ;
  v_best TIMESTAMPTZ;
  v_day DATE;
  v_hh_mm TEXT;
  v_i INT;
  v_dow INT;
BEGIN
  IF p_active_until IS NOT NULL AND p_active_until < v_now THEN
    RETURN NULL;
  END IF;

  v_base := GREATEST(COALESCE(p_active_from, v_now), v_now);

  IF p_mode = 'once' THEN
    IF p_scheduled_at IS NULL OR p_scheduled_at <= COALESCE(p_last_triggered_at, 'epoch'::timestamptz) THEN
      RETURN NULL;
    END IF;
    RETURN p_scheduled_at;

  ELSIF p_mode = 'interval' THEN
    IF p_interval_minutes IS NULL OR p_interval_minutes <= 0 THEN
      RETURN NULL;
    END IF;
    v_candidate := COALESCE(p_last_triggered_at + (p_interval_minutes || ' minutes')::interval, v_base);
    IF v_candidate < v_base THEN
      v_candidate := v_base;
    END IF;
    IF p_active_until IS NOT NULL AND v_candidate > p_active_until THEN
      RETURN NULL;
    END IF;
    RETURN v_candidate;

  ELSIF p_mode = 'recurring' THEN
    IF p_recur_times IS NULL OR array_length(p_recur_times, 1) IS NULL THEN
      RETURN NULL;
    END IF;
    v_best := NULL;
    FOR v_i IN 0..14 LOOP
      v_day := (v_base::date) + v_i;
      v_dow := EXTRACT(DOW FROM v_day)::INT;
      IF NOT (v_dow = ANY(p_recur_weekdays)) THEN
        CONTINUE;
      END IF;
      FOREACH v_hh_mm IN ARRAY p_recur_times LOOP
        BEGIN
          v_candidate := (v_day::text || ' ' || v_hh_mm || ':00')::timestamptz;
        EXCEPTION WHEN OTHERS THEN
          CONTINUE;
        END;
        IF v_candidate > COALESCE(p_last_triggered_at, 'epoch'::timestamptz)
          AND v_candidate > v_now
          AND (p_active_until IS NULL OR v_candidate <= p_active_until) THEN
          IF v_best IS NULL OR v_candidate < v_best THEN
            v_best := v_candidate;
          END IF;
        END IF;
      END LOOP;
      IF v_best IS NOT NULL THEN
        RETURN v_best;
      END IF;
    END LOOP;
    RETURN v_best;
  END IF;
  RETURN NULL;
END;
$$;

-- 4. Trigger para preencher next_trigger_at automaticamente
CREATE OR REPLACE FUNCTION public.scheduled_rounds_recalc_next()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.next_trigger_at := public.calc_next_scheduled_round_trigger(
    NEW.mode, NEW.scheduled_at, NEW.recur_times, NEW.recur_weekdays,
    NEW.interval_minutes, NEW.last_triggered_at,
    NEW.active_from, NEW.active_until
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER scheduled_rounds_recalc_next_trg
  BEFORE INSERT OR UPDATE ON public.scheduled_rounds
  FOR EACH ROW EXECUTE FUNCTION public.scheduled_rounds_recalc_next();
