-- Extensões necessárias para o cron
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Fonte única de verdade: status do plantão AGORA para um agente
CREATE OR REPLACE FUNCTION public.get_agent_shift_status(_agent_id uuid)
RETURNS TABLE(
  is_on_duty boolean,
  shift_id uuid,
  shift_date date,
  start_time time,
  end_time time,
  shift_start_ts timestamptz,
  shift_end_ts timestamptz,
  seconds_remaining bigint
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_now timestamptz := now();
  v_tz text := 'America/Rio_Branco';
  v_row record;
  v_start_ts timestamptz;
  v_end_ts timestamptz;
BEGIN
  -- Procura o plantão candidato: de ontem ou hoje (janela suficiente para 24h + fuso)
  FOR v_row IN
    SELECT s.id, s.shift_date, s.start_time, s.end_time
    FROM public.agent_shifts s
    WHERE s.agent_id = _agent_id
      AND COALESCE(s.is_vacation, false) = false
      AND s.status <> 'vacation'
      AND s.shift_date BETWEEN ((v_now AT TIME ZONE v_tz)::date - 1)
                           AND ((v_now AT TIME ZONE v_tz)::date + 1)
    ORDER BY s.shift_date DESC
  LOOP
    -- Constrói timestamps no fuso local
    v_start_ts := (v_row.shift_date + v_row.start_time) AT TIME ZONE v_tz;

    IF v_row.end_time IS NULL OR v_row.end_time = v_row.start_time THEN
      -- Convenção legada: 24h
      v_end_ts := v_start_ts + INTERVAL '24 hours';
    ELSIF v_row.end_time > v_row.start_time THEN
      v_end_ts := (v_row.shift_date + v_row.end_time) AT TIME ZONE v_tz;
    ELSE
      -- Cruza meia-noite (ex.: 19:00 → 07:00 = 12h)
      v_end_ts := ((v_row.shift_date + 1) + v_row.end_time) AT TIME ZONE v_tz;
    END IF;

    IF v_now >= v_start_ts AND v_now < v_end_ts THEN
      is_on_duty := true;
      shift_id := v_row.id;
      shift_date := v_row.shift_date;
      start_time := v_row.start_time;
      end_time := v_row.end_time;
      shift_start_ts := v_start_ts;
      shift_end_ts := v_end_ts;
      seconds_remaining := GREATEST(0, EXTRACT(EPOCH FROM (v_end_ts - v_now))::bigint);
      RETURN NEXT;
      RETURN;
    END IF;
  END LOOP;

  -- Sem plantão ativo
  is_on_duty := false;
  shift_id := NULL;
  shift_date := NULL;
  start_time := NULL;
  end_time := NULL;
  shift_start_ts := NULL;
  shift_end_ts := NULL;
  seconds_remaining := 0;
  RETURN NEXT;
  RETURN;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_agent_shift_status(uuid) TO authenticated, service_role;

-- Recalcula plantões cujo fim já passou mas continuam 'scheduled'
CREATE OR REPLACE FUNCTION public.recalc_stale_shift_statuses()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_updated int := 0;
  v_tz text := 'America/Rio_Branco';
BEGIN
  WITH candidates AS (
    SELECT s.id,
      CASE
        WHEN s.end_time IS NULL OR s.end_time = s.start_time THEN
          (s.shift_date + s.start_time) AT TIME ZONE v_tz + INTERVAL '24 hours'
        WHEN s.end_time > s.start_time THEN
          (s.shift_date + s.end_time) AT TIME ZONE v_tz
        ELSE
          ((s.shift_date + 1) + s.end_time) AT TIME ZONE v_tz
      END AS end_ts
    FROM public.agent_shifts s
    WHERE s.status = 'scheduled'
      AND COALESCE(s.is_vacation, false) = false
      AND s.shift_date BETWEEN (CURRENT_DATE - 30) AND (CURRENT_DATE + 1)
  )
  UPDATE public.agent_shifts s
  SET status = 'completed', updated_at = now()
  FROM candidates c
  WHERE s.id = c.id
    AND c.end_ts < now();

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END;
$$;

GRANT EXECUTE ON FUNCTION public.recalc_stale_shift_statuses() TO service_role;

-- Job periódico: a cada 15 minutos recalcula plantões vencidos
DO $$
BEGIN
  -- Remove agendamento anterior se existir
  PERFORM cron.unschedule('recalc-stale-shift-statuses')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'recalc-stale-shift-statuses');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'recalc-stale-shift-statuses',
  '*/15 * * * *',
  $$ SELECT public.recalc_stale_shift_statuses(); $$
);

-- Executa uma vez agora para corrigir registros já salvos
SELECT public.recalc_stale_shift_statuses();