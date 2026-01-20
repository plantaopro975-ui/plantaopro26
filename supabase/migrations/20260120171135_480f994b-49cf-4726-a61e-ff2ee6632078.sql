
-- Função para verificar se o agente pertence à mesma unidade
CREATE OR REPLACE FUNCTION public.is_same_unit(shift_agent_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM agents a1
    JOIN agents a2 ON a1.unit_id = a2.unit_id
    WHERE a1.cpf = split_part(auth.email(), '@', 1)
      AND a2.id = shift_agent_id
  )
$$;

-- Função para verificar se é o próprio agente
CREATE OR REPLACE FUNCTION public.is_own_agent(check_agent_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM agents
    WHERE id = check_agent_id
      AND cpf = split_part(auth.email(), '@', 1)
  )
$$;

-- Remover políticas antigas de agent_shifts
DROP POLICY IF EXISTS "Users can view all shifts" ON public.agent_shifts;
DROP POLICY IF EXISTS "Users can update shifts" ON public.agent_shifts;
DROP POLICY IF EXISTS "Users can delete own shifts" ON public.agent_shifts;
DROP POLICY IF EXISTS "Users can insert shifts" ON public.agent_shifts;
DROP POLICY IF EXISTS "Admins can delete shifts" ON public.agent_shifts;

-- Novas políticas RLS para agent_shifts

-- SELECT: Agentes veem plantões da mesma unidade OU admins veem todos
CREATE POLICY "Agents view shifts from same unit"
ON public.agent_shifts
FOR SELECT
USING (
  is_same_unit(agent_id) OR is_admin_or_master(auth.uid())
);

-- INSERT: Agentes inserem apenas seus próprios plantões OU admins
CREATE POLICY "Agents insert own shifts"
ON public.agent_shifts
FOR INSERT
WITH CHECK (
  is_own_agent(agent_id) OR is_admin_or_master(auth.uid())
);

-- UPDATE: Agentes atualizam apenas seus próprios plantões OU admins
CREATE POLICY "Agents update own shifts"
ON public.agent_shifts
FOR UPDATE
USING (
  is_own_agent(agent_id) OR is_admin_or_master(auth.uid())
);

-- DELETE: Agentes deletam apenas seus próprios plantões OU admins
CREATE POLICY "Agents delete own shifts"
ON public.agent_shifts
FOR DELETE
USING (
  is_own_agent(agent_id) OR is_admin_or_master(auth.uid())
);
