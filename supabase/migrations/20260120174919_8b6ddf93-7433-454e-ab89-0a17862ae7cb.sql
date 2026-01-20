
-- Corrigir política RLS permissiva na tabela password_change_requests
-- A política atual usa USING (true) que permite qualquer usuário autenticado gerenciar todas as solicitações

DROP POLICY IF EXISTS "Admins can manage all password requests" ON public.password_change_requests;

-- Recriar com verificação adequada de role admin/master
CREATE POLICY "Admins can manage all password requests" 
ON public.password_change_requests 
FOR ALL 
TO authenticated
USING (is_admin_or_master(auth.uid()))
WITH CHECK (is_admin_or_master(auth.uid()));
