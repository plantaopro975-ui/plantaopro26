DO $$
DECLARE
  v_id uuid := gen_random_uuid();
  v_email text := '12345678909@agent.plantaopro.com';
BEGIN
  -- Remove qualquer resíduo anterior com este CPF/email
  DELETE FROM public.agents WHERE cpf = '12345678909';
  DELETE FROM auth.users WHERE email = v_email;

  -- Cria usuário de autenticação
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    is_super_admin, is_sso_user
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_id, 'authenticated', 'authenticated', v_email,
    extensions.crypt('TesteQA@2026', extensions.gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Agente QA Teste"}'::jsonb,
    false, false
  );

  -- Cria agente
  INSERT INTO public.agents (id, name, cpf, team, unit_id, matricula, email)
  VALUES (
    v_id, 'Agente QA Teste', '12345678909', 'ALFA',
    '9d3f1986-adc3-449a-a4ac-9e3d2bb3eebc', '99999999', v_email
  );

  -- Aprova/ativa (o trigger de defaults força pending; ajustamos aqui)
  UPDATE public.agents
     SET approval_status = 'approved',
         is_active = true,
         is_frozen = false,
         role = 'user',
         license_status = 'active',
         license_expires_at = now() + interval '1 year'
   WHERE id = v_id;
END $$;