
CREATE OR REPLACE FUNCTION public.insert_round_session_override(
  p_reason TEXT,
  p_team TEXT,
  p_mode TEXT,
  p_start_time TEXT,
  p_end_time TEXT,
  p_interval_min INT,
  p_rows JSONB,
  p_server_started_at TIMESTAMPTZ
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
  v_uid UUID := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Autenticação obrigatória.' USING ERRCODE = 'insufficient_privilege';
  END IF;
  -- Sets GUC visible to the enforce trigger in this same transaction
  PERFORM public.set_night_override_reason(p_reason);

  -- Deactivate previous active sessions of same user
  UPDATE public.round_sessions
    SET is_active = false, ended_at = now()
    WHERE user_id = v_uid AND is_active = true;

  INSERT INTO public.round_sessions (
    user_id, team, mode, start_time, end_time,
    interval_min, rows, server_started_at, is_active
  ) VALUES (
    v_uid, p_team, p_mode, p_start_time, p_end_time,
    p_interval_min, p_rows, p_server_started_at, true
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.insert_round_session_override(TEXT, TEXT, TEXT, TEXT, TEXT, INT, JSONB, TIMESTAMPTZ) TO authenticated;
