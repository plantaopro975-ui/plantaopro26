-- Atualizar política de upload do bucket ads para ser mais permissiva
-- Permitir qualquer usuário autenticado fazer upload (o controle de acesso é feito na UI)
DROP POLICY IF EXISTS "Admins can upload ads media" ON storage.objects;

CREATE POLICY "Authenticated users can upload ads media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ads');

-- Atualizar política de update
DROP POLICY IF EXISTS "Admins can update ads media" ON storage.objects;

CREATE POLICY "Authenticated users can update ads media"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'ads');

-- Atualizar política de delete  
DROP POLICY IF EXISTS "Admins can delete ads media" ON storage.objects;

CREATE POLICY "Authenticated users can delete ads media"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'ads');