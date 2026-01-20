
-- Corrigir política de INSERT para agents - permitir que usuários criem seu próprio registro
-- A política atual só permite INSERT se id = auth.uid(), mas após signup imediato o id pode não corresponder

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow agent registration" ON public.agents;

-- Create a more permissive INSERT policy for authenticated users during registration
CREATE POLICY "Allow agent registration" 
ON public.agents 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- User can insert their own agent record (id matches auth.uid())
  id = auth.uid()
  -- OR admin/master can insert any agent
  OR is_admin_or_master(auth.uid())
);

-- Also ensure the INSERT works right after signup when session is fresh
DROP POLICY IF EXISTS "Allow self registration after signup" ON public.agents;
CREATE POLICY "Allow self registration after signup" 
ON public.agents 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- Allow insert if this is the user's own registration (email matches CPF pattern)
  cpf = split_part(auth.email(), '@', 1)
);
