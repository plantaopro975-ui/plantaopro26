
-- 1) CPF change audit table
CREATE TABLE IF NOT EXISTS public.cpf_change_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL,
  agent_name TEXT,
  old_cpf TEXT,
  new_cpf TEXT NOT NULL,
  changed_by UUID,
  changed_by_email TEXT,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT','UPDATE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.cpf_change_log TO authenticated;
GRANT ALL ON public.cpf_change_log TO service_role;

ALTER TABLE public.cpf_change_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins/master can read cpf log" ON public.cpf_change_log;
CREATE POLICY "Admins/master can read cpf log"
  ON public.cpf_change_log FOR SELECT
  TO authenticated
  USING (public.is_admin_or_master(auth.uid()));

DROP POLICY IF EXISTS "Admins/master can insert cpf log" ON public.cpf_change_log;
CREATE POLICY "Admins/master can insert cpf log"
  ON public.cpf_change_log FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin_or_master(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_cpf_change_log_agent ON public.cpf_change_log(agent_id);
CREATE INDEX IF NOT EXISTS idx_cpf_change_log_created ON public.cpf_change_log(created_at DESC);

-- 2) Normalization + validation + audit trigger on agents
CREATE OR REPLACE FUNCTION public.agents_normalize_and_validate_cpf()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_normalized TEXT;
  v_existing_name TEXT;
BEGIN
  IF NEW.cpf IS NULL THEN
    RAISE EXCEPTION 'CPF é obrigatório para cadastrar/editar um agente.'
      USING ERRCODE = 'check_violation';
  END IF;

  -- Normalize: keep only digits
  v_normalized := regexp_replace(NEW.cpf, '\D', '', 'g');

  IF length(v_normalized) <> 11 THEN
    RAISE EXCEPTION 'CPF inválido: deve conter exatamente 11 dígitos (informado: %).', NEW.cpf
      USING ERRCODE = 'check_violation';
  END IF;

  IF v_normalized ~ '^(\d)\1+$' THEN
    RAISE EXCEPTION 'CPF inválido: sequência repetida não é permitida.'
      USING ERRCODE = 'check_violation';
  END IF;

  NEW.cpf := v_normalized;

  -- Duplicate check with a friendly message
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.cpf IS DISTINCT FROM OLD.cpf) THEN
    SELECT name INTO v_existing_name
    FROM public.agents
    WHERE cpf = NEW.cpf
      AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    LIMIT 1;

    IF v_existing_name IS NOT NULL THEN
      RAISE EXCEPTION 'Este CPF já está cadastrado para o agente "%". Verifique se o número está correto ou solicite ao administrador a correção do cadastro anterior antes de prosseguir.', v_existing_name
        USING ERRCODE = 'unique_violation';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_agents_normalize_cpf ON public.agents;
CREATE TRIGGER trg_agents_normalize_cpf
  BEFORE INSERT OR UPDATE OF cpf ON public.agents
  FOR EACH ROW
  EXECUTE FUNCTION public.agents_normalize_and_validate_cpf();

-- 3) Audit trigger — logs INSERT and CPF changes
CREATE OR REPLACE FUNCTION public.agents_log_cpf_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor UUID := auth.uid();
  v_email TEXT := auth.email();
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.cpf_change_log
      (agent_id, agent_name, old_cpf, new_cpf, changed_by, changed_by_email, operation)
    VALUES (NEW.id, NEW.name, NULL, NEW.cpf, v_actor, v_email, 'INSERT');
  ELSIF TG_OP = 'UPDATE' AND NEW.cpf IS DISTINCT FROM OLD.cpf THEN
    INSERT INTO public.cpf_change_log
      (agent_id, agent_name, old_cpf, new_cpf, changed_by, changed_by_email, operation)
    VALUES (NEW.id, NEW.name, OLD.cpf, NEW.cpf, v_actor, v_email, 'UPDATE');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_agents_log_cpf_change ON public.agents;
CREATE TRIGGER trg_agents_log_cpf_change
  AFTER INSERT OR UPDATE OF cpf ON public.agents
  FOR EACH ROW
  EXECUTE FUNCTION public.agents_log_cpf_change();
