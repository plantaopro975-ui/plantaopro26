-- Fix overly-permissive policy on external_database_configs
-- Replace `USING (true)` with a strict master-only check.

DROP POLICY IF EXISTS "Only masters can view external configs" ON public.external_database_configs;

CREATE POLICY "Only masters can view external configs"
ON public.external_database_configs
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'master'::public.app_role
  )
);
