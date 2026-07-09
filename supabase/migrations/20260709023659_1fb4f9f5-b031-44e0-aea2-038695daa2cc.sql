
-- ============================================================
-- Fase 1.5: RPCs complementares para fluxo de auth
-- ============================================================

-- 1) Bulk existence check por lista de CPFs
--    Usada para limpar credenciais salvas localmente
CREATE OR REPLACE FUNCTION public.check_existing_cpfs(_cpfs text[])
RETURNS TABLE (cpf text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT a.cpf
  FROM public.agents a
  WHERE a.cpf = ANY(_cpfs);
$$;

REVOKE ALL ON FUNCTION public.check_existing_cpfs(text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_existing_cpfs(text[]) TO anon, authenticated;

-- 2) Existência de matrícula (retorna só id + matricula ou nada)
CREATE OR REPLACE FUNCTION public.check_matricula_exists(_matricula text)
RETURNS TABLE (id uuid, matricula text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT a.id, a.matricula
  FROM public.agents a
  WHERE a.matricula = _matricula
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.check_matricula_exists(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_matricula_exists(text) TO anon, authenticated;
