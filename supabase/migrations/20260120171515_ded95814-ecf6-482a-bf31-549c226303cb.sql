
-- Função auxiliar para verificar se dois agentes são da mesma unidade (via agent_id)
CREATE OR REPLACE FUNCTION public.agents_same_unit(agent_id_1 uuid, agent_id_2 uuid)
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
    WHERE a1.id = agent_id_1 AND a2.id = agent_id_2
  )
$$;

-- Função para obter o agent_id do usuário atual baseado no CPF do email
CREATE OR REPLACE FUNCTION public.current_agent_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM agents WHERE cpf = split_part(auth.email(), '@', 1) LIMIT 1
$$;

-- =====================================================
-- NOTIFICATIONS - Notificações são pessoais, mas com CPF lookup
-- =====================================================
DROP POLICY IF EXISTS "Users can view their notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete their notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated users can create notifications" ON public.notifications;

-- SELECT: Agente vê apenas suas próprias notificações
CREATE POLICY "Agents view own notifications"
ON public.notifications FOR SELECT
USING (
  agent_id = current_agent_id() OR is_admin_or_master(auth.uid())
);

-- UPDATE: Agente atualiza apenas suas próprias notificações (marcar como lida)
CREATE POLICY "Agents update own notifications"
ON public.notifications FOR UPDATE
USING (
  agent_id = current_agent_id() OR is_admin_or_master(auth.uid())
);

-- DELETE: Agente deleta apenas suas próprias notificações
CREATE POLICY "Agents delete own notifications"
ON public.notifications FOR DELETE
USING (
  agent_id = current_agent_id() OR is_admin_or_master(auth.uid())
);

-- INSERT: Sistema/admins podem criar notificações para qualquer agente
CREATE POLICY "System can create notifications"
ON public.notifications FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
);

-- =====================================================
-- OVERTIME_BANK - Visível na mesma unidade, editável apenas próprio
-- =====================================================
DROP POLICY IF EXISTS "Anyone can view overtime" ON public.overtime_bank;
DROP POLICY IF EXISTS "Agents can insert their own overtime" ON public.overtime_bank;
DROP POLICY IF EXISTS "Agents can update their own overtime" ON public.overtime_bank;
DROP POLICY IF EXISTS "Agents can delete their own overtime" ON public.overtime_bank;
DROP POLICY IF EXISTS "Admins can manage overtime" ON public.overtime_bank;

-- SELECT: Agente vê BH da mesma unidade (transparência)
CREATE POLICY "Agents view overtime from same unit"
ON public.overtime_bank FOR SELECT
USING (
  agents_same_unit(agent_id, current_agent_id()) OR is_admin_or_master(auth.uid())
);

-- INSERT: Agente insere apenas seu próprio BH
CREATE POLICY "Agents insert own overtime"
ON public.overtime_bank FOR INSERT
WITH CHECK (
  is_own_agent(agent_id) OR is_admin_or_master(auth.uid())
);

-- UPDATE: Agente atualiza apenas seu próprio BH
CREATE POLICY "Agents update own overtime"
ON public.overtime_bank FOR UPDATE
USING (
  is_own_agent(agent_id) OR is_admin_or_master(auth.uid())
);

-- DELETE: Agente deleta apenas seu próprio BH
CREATE POLICY "Agents delete own overtime"
ON public.overtime_bank FOR DELETE
USING (
  is_own_agent(agent_id) OR is_admin_or_master(auth.uid())
);

-- =====================================================
-- AGENT_LEAVES - Visível na mesma unidade para coordenação
-- =====================================================
DROP POLICY IF EXISTS "Agents can view their own leaves" ON public.agent_leaves;
DROP POLICY IF EXISTS "Agents can create their own leaves" ON public.agent_leaves;
DROP POLICY IF EXISTS "Agents can update their own pending leaves" ON public.agent_leaves;
DROP POLICY IF EXISTS "Agents can delete their own pending leaves" ON public.agent_leaves;

-- SELECT: Agente vê folgas da mesma unidade (coordenação)
CREATE POLICY "Agents view leaves from same unit"
ON public.agent_leaves FOR SELECT
USING (
  agents_same_unit(agent_id, current_agent_id()) OR is_admin_or_master(auth.uid())
);

-- INSERT: Agente cria apenas suas próprias solicitações de folga
CREATE POLICY "Agents create own leaves"
ON public.agent_leaves FOR INSERT
WITH CHECK (
  is_own_agent(agent_id) OR is_admin_or_master(auth.uid())
);

-- UPDATE: Agente atualiza apenas suas próprias folgas pendentes
CREATE POLICY "Agents update own pending leaves"
ON public.agent_leaves FOR UPDATE
USING (
  (is_own_agent(agent_id) AND status = 'pending') OR is_admin_or_master(auth.uid())
);

-- DELETE: Agente deleta apenas suas próprias folgas pendentes
CREATE POLICY "Agents delete own pending leaves"
ON public.agent_leaves FOR DELETE
USING (
  (is_own_agent(agent_id) AND status = 'pending') OR is_admin_or_master(auth.uid())
);
