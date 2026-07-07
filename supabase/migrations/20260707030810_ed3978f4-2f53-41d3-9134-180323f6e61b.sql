
-- 1) Audit table for night shift overrides
CREATE TABLE IF NOT EXISTS public.night_shift_overrides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NULL REFERENCES public.round_sessions(id) ON DELETE SET NULL,
  original_start_time TEXT NOT NULL,
  original_end_time TEXT NOT NULL,
  applied_start_time TEXT NOT NULL,
  applied_end_time TEXT NOT NULL,
  reason TEXT NOT NULL,
  server_time_at_override TIMESTAMPTZ NOT NULL DEFAULT now(),
  local_time_acre TEXT NOT NULL DEFAULT to_char((now() AT TIME ZONE 'America/Rio_Branco'), 'YYYY-MM-DD HH24:MI:SS'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.night_shift_overrides TO authenticated;
GRANT ALL ON public.night_shift_overrides TO service_role;

ALTER TABLE public.night_shift_overrides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Master can view all night overrides" ON public.night_shift_overrides;
CREATE POLICY "Master can view all night overrides"
  ON public.night_shift_overrides FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'master'));

DROP POLICY IF EXISTS "System inserts night overrides" ON public.night_shift_overrides;
CREATE POLICY "System inserts night overrides"
  ON public.night_shift_overrides FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 2) Helper: is current server time in night window (Acre timezone)
CREATE OR REPLACE FUNCTION public.is_night_window(p_ts TIMESTAMPTZ DEFAULT now())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT EXTRACT(HOUR FROM (p_ts AT TIME ZONE 'America/Rio_Branco'))::int >= 22
      OR EXTRACT(HOUR FROM (p_ts AT TIME ZONE 'America/Rio_Branco'))::int <  6;
$$;

-- 3) Enforce night shift rules on round_sessions writes
CREATE OR REPLACE FUNCTION public.enforce_night_shift_rules()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_night BOOLEAN;
  v_is_master BOOLEAN;
  v_override_reason TEXT;
BEGIN
  v_is_night := public.is_night_window(now());

  IF NOT v_is_night THEN
    RETURN NEW;
  END IF;

  -- Values are fine
  IF NEW.start_time = '22:00' AND NEW.end_time = '06:00' THEN
    RETURN NEW;
  END IF;

  -- Master override path (reason must be set via GUC by RPC)
  v_is_master := public.has_role(auth.uid(), 'master');
  BEGIN
    v_override_reason := current_setting('app.night_override_reason', true);
  EXCEPTION WHEN OTHERS THEN
    v_override_reason := NULL;
  END;

  IF v_is_master AND v_override_reason IS NOT NULL AND length(trim(v_override_reason)) >= 5 THEN
    -- Log audit row
    INSERT INTO public.night_shift_overrides (
      user_id, session_id,
      original_start_time, original_end_time,
      applied_start_time, applied_end_time,
      reason
    ) VALUES (
      auth.uid(), NEW.id,
      '22:00', '06:00',
      NEW.start_time, NEW.end_time,
      trim(v_override_reason)
    );
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'NIGHT_SHIFT_LOCK: Durante o turno noturno (22:00–06:00 America/Rio_Branco) o horário deve ser 22:00→06:00. Somente o usuário master pode sobrescrever, informando um motivo.'
    USING ERRCODE = 'check_violation';
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_night_shift ON public.round_sessions;
CREATE TRIGGER trg_enforce_night_shift
  BEFORE INSERT OR UPDATE OF start_time, end_time
  ON public.round_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_night_shift_rules();

-- 4) RPC: master sets override reason for the current transaction
CREATE OR REPLACE FUNCTION public.set_night_override_reason(p_reason TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'master') THEN
    RAISE EXCEPTION 'Somente o usuário master pode registrar override de turno noturno.'
      USING ERRCODE = 'insufficient_privilege';
  END IF;
  IF p_reason IS NULL OR length(trim(p_reason)) < 5 THEN
    RAISE EXCEPTION 'Motivo do override deve ter ao menos 5 caracteres.'
      USING ERRCODE = 'check_violation';
  END IF;
  PERFORM set_config('app.night_override_reason', trim(p_reason), true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_night_override_reason(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_night_window(TIMESTAMPTZ) TO authenticated, anon;
