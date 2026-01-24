-- ============================================================================
-- PLANTÃO PRO - DADOS DE SEED PARA MIGRAÇÃO
-- Versão Final - Janeiro 2026
-- ============================================================================
-- INSTRUÇÕES DE USO:
-- 1. Execute PRIMEIRO o script de schema (migrations) no novo banco
-- 2. Execute este script APÓS a estrutura estar criada
-- 3. Este script contém dados essenciais para funcionamento do sistema
-- ============================================================================

-- ============================================================================
-- 1. UNIDADES (units) - Centros Socioeducativos do ISE/ACRE
-- ============================================================================
INSERT INTO public.units (id, name, municipality, address, phone, email, director_name, coordinator_name, bh_hourly_rate_default) VALUES
  ('9d3f1986-adc3-449a-a4ac-9e3d2bb3eebc', 'CS Acre', 'Rio Branco', NULL, NULL, NULL, 'Diretor(a) CS Acre', 'Coordenador(a) CS Acre', 15.75),
  ('9aa94f4a-85c4-4c17-a6c6-df194d9db520', 'CS Aquiri', 'Rio Branco', NULL, NULL, NULL, 'Diretor(a) CS Aquiri', 'Coordenador(a) CS Aquiri', 15.75),
  ('1ba8bde6-4c40-4422-bb6c-f5ab91c2837a', 'CS Brasiléia', 'Brasiléia', 'Centro Socioeducativo de Brasiléia', '(68) 3546-1000', 'csbrasileia@sejusp.ac.gov.br', 'Diretor(a) CS Brasiléia', NULL, 15.75),
  ('424b6587-15dd-41ef-823d-f0e706c9df77', 'CS CZS', 'Cruzeiro do Sul', NULL, NULL, NULL, 'Diretor(a) CS CZS', 'Coordenador(a) CS CZS', 15.75),
  ('3f137ad5-ca19-4465-b3d7-81db3a6a0d71', 'CS FEIJÓ', 'Feijó', 'Av. Presidente Médici, S/N - Centro', '(68) 3463-2000', 'csfeijo@sejusp.ac.gov.br', 'Dr. Carlos Eduardo Silva', 'Maria Aparecida Santos', 15.75),
  ('ac8870ee-230c-4890-a0f5-bffb4218efc6', 'CS Mocinha', 'Rio Branco', NULL, NULL, NULL, 'Diretor(a) CS Mocinha', 'Coordenador(a) CS Mocinha', 15.75),
  ('46180fb9-2e34-42af-9bcc-5d6ab73b793e', 'CS Santa Juliana', 'Rio Branco', NULL, NULL, NULL, 'Diretor(a) CS Santa Juliana', 'Coordenador(a) CS Santa Juliana', 15.75),
  ('ec705a62-7df7-4023-90ac-18613d1bbb63', 'CS Sena', 'Sena Madureira', NULL, NULL, NULL, 'Diretor(a) CS Sena', 'Coordenador(a) CS Sena', 15.75),
  ('5a293ec9-ce0c-43de-a19a-ca9f6ff957a6', 'UIP - Rio Branco', 'Rio Branco', NULL, NULL, NULL, 'Diretor(a) UIP', 'Coordenador(a) UIP', 15.75)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  municipality = EXCLUDED.municipality,
  address = EXCLUDED.address,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  director_name = EXCLUDED.director_name,
  coordinator_name = EXCLUDED.coordinator_name,
  bh_hourly_rate_default = EXCLUDED.bh_hourly_rate_default;

-- ============================================================================
-- 2. MASTER ADMIN - Credenciais de Administrador Master
-- ============================================================================
-- IMPORTANTE: As senhas estão hasheadas com bcrypt (pgcrypto)
-- Para criar novas senhas: SELECT extensions.crypt('sua_senha', gen_salt('bf'))
INSERT INTO public.master_admin (id, username, password_hash) VALUES
  ('6398a69d-f6ef-4968-b2ac-f2d53f2b9d6a', 'plantaopro@proton.me', '$2a$06$eYWQ03Y4wSDqThfbK4n/TuX6jFt4uRIBmlL8ktFs7KjxxAhJXT7Wu'),
  ('be4e31bc-b541-4812-b3b2-4bfbb2d21271', 'plantaopro1@proton.me', '$2a$06$IMFU1oU6k9IwEfN0ztc4lu0PgYPasUw71Wt3K7VLNDqXZi5CcEp7C')
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  password_hash = EXCLUDED.password_hash;

-- ============================================================================
-- 3. SALAS DE CHAT - Estrutura de Comunicação
-- ============================================================================
INSERT INTO public.chat_rooms (id, name, type, team, unit_id) VALUES
  -- Sala Global (todas as unidades)
  ('74931768-d676-4e2b-bf97-ca54d4549a6a', 'Sistema ISE/ACRE - Todas as Unidades', 'all', NULL, NULL),
  -- Salas por unidade CS FEIJÓ
  ('9c44c279-a662-4cdf-9700-30374020db8e', 'CS FEIJÓ', 'unit', NULL, '3f137ad5-ca19-4465-b3d7-81db3a6a0d71'),
  ('e318ad55-cb68-406d-bff6-5e804bb0cda5', 'Equipe BRAVO', 'team', 'BRAVO', '3f137ad5-ca19-4465-b3d7-81db3a6a0d71'),
  ('dcea0919-70f5-476a-86a4-582cd884074c', 'Liderança - CS FEIJÓ', 'leaders', NULL, '3f137ad5-ca19-4465-b3d7-81db3a6a0d71')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  team = EXCLUDED.team,
  unit_id = EXCLUDED.unit_id;

-- ============================================================================
-- 4. CÓDIGOS DE ATIVAÇÃO DE LICENÇA
-- ============================================================================
INSERT INTO public.license_activation_codes (code, description, duration_days, max_uses, is_active, created_by) VALUES
  ('PLANTAOPRO2025', 'Código de ativação padrão - 30 dias', 30, NULL, true, 'sistema'),
  ('TRIAL7DIAS', 'Código trial de 7 dias', 7, NULL, true, 'sistema'),
  ('TRIAL30', 'Trial de 30 dias', 30, 500, true, 'sistema'),
  ('VIP90', 'Licença trimestral VIP', 90, 50, true, 'sistema'),
  ('PREMIUM365', 'Licença premium anual', 365, 10, true, 'sistema'),
  ('PLANTAO2026', 'Licença anual PlantãoPro', 365, 100, true, 'sistema')
ON CONFLICT (code) DO UPDATE SET
  description = EXCLUDED.description,
  duration_days = EXCLUDED.duration_days,
  max_uses = EXCLUDED.max_uses,
  is_active = EXCLUDED.is_active;

-- ============================================================================
-- 5. AGENTE EXEMPLO (para testes)
-- ============================================================================
-- NOTA: Este agente precisa existir primeiro no auth.users do Supabase
-- Para criar o usuário auth, use a edge function create-admin ou admin-operations
-- O email do agente é: 69598193268@agent.plantaopro.com
-- A senha padrão deve ser configurada via admin

-- Se o usuário auth já existir, inserir o agente:
INSERT INTO public.agents (
  id, 
  name, 
  cpf, 
  matricula, 
  email, 
  phone, 
  address, 
  team, 
  unit_id, 
  birth_date,
  blood_type,
  first_shift_date,
  is_active, 
  approval_status,
  license_status, 
  license_expires_at,
  bh_limit,
  bh_hourly_rate,
  bh_limit_1st,
  bh_limit_2nd,
  role
) VALUES (
  'fd3ee650-4c48-473e-863d-705d08c345ad',
  'FRANC DENIS',
  '69598193268',
  '22233396',
  'francdenisbr@gmail.com',
  '(68) 99506-1342',
  'Rua Joel Ferreira de Sousa',
  'BRAVO',
  '3f137ad5-ca19-4465-b3d7-81db3a6a0d71',
  '1982-12-25',
  'O+',
  '2026-01-03',
  true,
  'approved',
  'active',
  (NOW() + INTERVAL '1 year')::timestamptz,
  70,
  15.75,
  35,
  35,
  'agent'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  license_status = EXCLUDED.license_status,
  license_expires_at = EXCLUDED.license_expires_at,
  is_active = EXCLUDED.is_active,
  approval_status = EXCLUDED.approval_status;

-- ============================================================================
-- 6. PROFILE E USER_ROLES DO AGENTE
-- ============================================================================
INSERT INTO public.profiles (user_id, full_name) 
VALUES ('fd3ee650-4c48-473e-863d-705d08c345ad', 'FRANC DENIS')
ON CONFLICT (user_id) DO UPDATE SET full_name = EXCLUDED.full_name;

-- Limpar roles existentes e inserir nova
DELETE FROM public.user_roles WHERE user_id = 'fd3ee650-4c48-473e-863d-705d08c345ad';
INSERT INTO public.user_roles (user_id, role) VALUES ('fd3ee650-4c48-473e-863d-705d08c345ad', 'user');

-- ============================================================================
-- 7. MEMBROS DE CHAT DO AGENTE
-- ============================================================================
INSERT INTO public.chat_room_members (agent_id, room_id) VALUES 
  ('fd3ee650-4c48-473e-863d-705d08c345ad', '74931768-d676-4e2b-bf97-ca54d4549a6a'),
  ('fd3ee650-4c48-473e-863d-705d08c345ad', 'e318ad55-cb68-406d-bff6-5e804bb0cda5'),
  ('fd3ee650-4c48-473e-863d-705d08c345ad', '9c44c279-a662-4cdf-9700-30374020db8e')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 8. CACHE OFFLINE DE LICENÇA
-- ============================================================================
INSERT INTO public.offline_license_cache (agent_id, cpf, name, team, unit_id, license_status, license_expires_at)
VALUES (
  'fd3ee650-4c48-473e-863d-705d08c345ad',
  '69598193268',
  'FRANC DENIS',
  'BRAVO',
  '3f137ad5-ca19-4465-b3d7-81db3a6a0d71',
  'active',
  (NOW() + INTERVAL '1 year')::timestamptz
) ON CONFLICT (agent_id) DO UPDATE SET
  license_status = EXCLUDED.license_status,
  license_expires_at = EXCLUDED.license_expires_at,
  last_sync = NOW();

-- ============================================================================
-- 9. HABILITAR REALTIME NAS TABELAS NECESSÁRIAS
-- ============================================================================
-- Estas tabelas precisam estar no realtime para funcionalidades de chat e alertas
-- Execute apenas se a publicação supabase_realtime existir

-- ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.shift_alerts;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.agents;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ============================================================================
-- 10. VERIFICAÇÃO FINAL
-- ============================================================================
-- Execute estas queries para verificar se os dados foram inseridos corretamente:
/*
SELECT 'units' as tabela, COUNT(*) as registros FROM units
UNION ALL SELECT 'agents', COUNT(*) FROM agents
UNION ALL SELECT 'master_admin', COUNT(*) FROM master_admin
UNION ALL SELECT 'chat_rooms', COUNT(*) FROM chat_rooms
UNION ALL SELECT 'chat_room_members', COUNT(*) FROM chat_room_members
UNION ALL SELECT 'user_roles', COUNT(*) FROM user_roles
UNION ALL SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL SELECT 'license_activation_codes', COUNT(*) FROM license_activation_codes
UNION ALL SELECT 'offline_license_cache', COUNT(*) FROM offline_license_cache
ORDER BY tabela;
*/

-- ============================================================================
-- FIM DO SCRIPT DE SEED
-- ============================================================================
