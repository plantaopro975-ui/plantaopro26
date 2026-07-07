-- 1) Tabela para registrar divergências detectadas na escala do agente
CREATE TABLE IF NOT EXISTS public.shift_schedule_divergences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  divergence_type text NOT NULL, -- 'unexpected_shift' | 'missing_shift'
  shift_date date NOT NULL,
  expected_date date,
  first_shift_date date,
  local_today date,
  notes text,
  detected_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.shift_schedule_divergences TO authenticated;
GRANT ALL ON public.shift_schedule_divergences TO service_role;

ALTER TABLE public.shift_schedule_divergences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view own divergences"
  ON public.shift_schedule_divergences
  FOR SELECT
  TO authenticated
  USING (
    public.is_own_agent(agent_id)
    OR public.is_admin_or_master(auth.uid())
  );

CREATE POLICY "Service role manages divergences"
  ON public.shift_schedule_divergences
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_shift_div_agent_date
  ON public.shift_schedule_divergences (agent_id, shift_date);

-- 2) Função de validação: compara first_shift_date com plantões cadastrados
--    usando o "hoje" no fuso do Acre e registra divergências.
CREATE OR REPLACE FUNCTION public.check_agent_shift_divergences(
  p_agent_id uuid,
  p_months_ahead int DEFAULT 3
)
RETURNS TABLE (
  divergence_type text,
  shift_date date,
  expected_date date,
  notes text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_first date;
  v_local_today date := (now() AT TIME ZONE 'America/Rio_Branco')::date;
  v_end date;
  v_expected date;
  v_expected_dates date[] := ARRAY[]::date[];
BEGIN
  SELECT first_shift_date INTO v_first
  FROM public.agents WHERE id = p_agent_id;

  IF v_first IS NULL THEN
    RETURN;
  END IF;

  -- Janela: do primeiro plantão até N meses à frente do "hoje local"
  v_end := (v_local_today + (p_months_ahead || ' months')::interval)::date;
  v_expected := v_first;

  WHILE v_expected <= v_end LOOP
    v_expected_dates := array_append(v_expected_dates, v_expected);
    v_expected := (v_expected + INTERVAL '4 days')::date;
  END LOOP;

  -- Limpa divergências anteriores dentro da janela para o agente
  DELETE FROM public.shift_schedule_divergences
   WHERE agent_id = p_agent_id
     AND shift_date BETWEEN (v_first - INTERVAL '90 days')::date AND v_end;

  -- (a) Plantões cadastrados FORA do ciclo esperado
  RETURN QUERY
  WITH unexpected AS (
    SELECT s.shift_date AS d
    FROM public.agent_shifts s
    WHERE s.agent_id = p_agent_id
      AND COALESCE(s.is_vacation, false) = false
      AND s.shift_date <> ALL (v_expected_dates)
      AND s.shift_date BETWEEN (v_first - INTERVAL '90 days')::date AND v_end
  ),
  ins_un AS (
    INSERT INTO public.shift_schedule_divergences
      (agent_id, divergence_type, shift_date, expected_date, first_shift_date, local_today, notes)
    SELECT p_agent_id,
           'unexpected_shift',
           u.d,
           NULL,
           v_first,
           v_local_today,
           'Plantão fora do ciclo esperado (base ' || v_first::text || ', a cada 4 dias)'
    FROM unexpected u
    RETURNING divergence_type, shift_date, expected_date, notes
  )
  SELECT * FROM ins_un;

  -- (b) Datas esperadas do ciclo (a partir de hoje) SEM plantão cadastrado
  RETURN QUERY
  WITH missing AS (
    SELECT ed AS d
    FROM unnest(v_expected_dates) AS ed
    WHERE ed >= v_local_today
      AND NOT EXISTS (
        SELECT 1 FROM public.agent_shifts s
         WHERE s.agent_id = p_agent_id
           AND s.shift_date = ed
           AND COALESCE(s.is_vacation, false) = false
      )
  ),
  ins_mi AS (
    INSERT INTO public.shift_schedule_divergences
      (agent_id, divergence_type, shift_date, expected_date, first_shift_date, local_today, notes)
    SELECT p_agent_id,
           'missing_shift',
           m.d,
           m.d,
           v_first,
           v_local_today,
           'Data esperada do ciclo sem plantão cadastrado'
    FROM missing m
    RETURNING divergence_type, shift_date, expected_date, notes
  )
  SELECT * FROM ins_mi;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_agent_shift_divergences(uuid, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_agent_shift_divergences(uuid, int) TO service_role;