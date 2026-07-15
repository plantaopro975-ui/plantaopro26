DROP TRIGGER IF EXISTS trg_enforce_night_shift ON public.round_sessions;

CREATE OR REPLACE FUNCTION public.enforce_night_shift_rules()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Bloqueio noturno desativado: horários de rondas podem ser personalizados manualmente.
  RETURN NEW;
END;
$$;