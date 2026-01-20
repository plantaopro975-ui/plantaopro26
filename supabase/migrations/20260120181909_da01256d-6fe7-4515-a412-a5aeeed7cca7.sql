-- Drop conflicting UPDATE policies on agents
DROP POLICY IF EXISTS "Agents can update own record" ON public.agents;
DROP POLICY IF EXISTS "Users can update their own agent record" ON public.agents;

-- Create single, comprehensive UPDATE policy for agents
-- Allows update if: 
-- 1. The agent's ID matches auth.uid() (preferred)
-- 2. OR the agent's CPF matches the email prefix
-- 3. OR user is admin/master
CREATE POLICY "Agents can update own profile" 
ON public.agents 
FOR UPDATE 
USING (
  id = auth.uid() 
  OR cpf = split_part(auth.email(), '@', 1)
  OR is_admin_or_master(auth.uid())
)
WITH CHECK (
  id = auth.uid() 
  OR cpf = split_part(auth.email(), '@', 1)
  OR is_admin_or_master(auth.uid())
);