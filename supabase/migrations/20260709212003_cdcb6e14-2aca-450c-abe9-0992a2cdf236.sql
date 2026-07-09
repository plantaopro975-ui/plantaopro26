
-- =====================================================================
-- Endurecimento de RLS: remove policies "abertas" (qual=true / role=public)
-- que efetivamente expunham dados a usuários anônimos. Mantém as policies
-- granulares já existentes (baseadas em auth.uid(), has_role, current_agent_id).
-- =====================================================================

-- access_logs
DROP POLICY IF EXISTS "escrita_logs" ON public.access_logs;
DROP POLICY IF EXISTS "leitura_logs" ON public.access_logs;

-- ad_views
DROP POLICY IF EXISTS "escrita_views_anuncios" ON public.ad_views;
DROP POLICY IF EXISTS "leitura_views_anuncios" ON public.ad_views;

-- admin_announcements
DROP POLICY IF EXISTS "atualiza_comunicados" ON public.admin_announcements;
DROP POLICY IF EXISTS "deleta_comunicados" ON public.admin_announcements;
DROP POLICY IF EXISTS "escrita_comunicados" ON public.admin_announcements;
DROP POLICY IF EXISTS "leitura_comunicados" ON public.admin_announcements;

-- advertisements
DROP POLICY IF EXISTS "atualiza_anuncios" ON public.advertisements;
DROP POLICY IF EXISTS "escrita_anuncios" ON public.advertisements;
DROP POLICY IF EXISTS "leitura_anuncios" ON public.advertisements;

-- agent_events
DROP POLICY IF EXISTS "atualiza_eventos" ON public.agent_events;
DROP POLICY IF EXISTS "deleta_eventos" ON public.agent_events;
DROP POLICY IF EXISTS "escrita_eventos" ON public.agent_events;
DROP POLICY IF EXISTS "leitura_eventos" ON public.agent_events;

-- agent_leaves
DROP POLICY IF EXISTS "atualiza_folgas" ON public.agent_leaves;
DROP POLICY IF EXISTS "deleta_folgas" ON public.agent_leaves;
DROP POLICY IF EXISTS "escrita_folgas" ON public.agent_leaves;
DROP POLICY IF EXISTS "leitura_folgas" ON public.agent_leaves;

-- agent_shifts
DROP POLICY IF EXISTS "atualiza_escalas" ON public.agent_shifts;
DROP POLICY IF EXISTS "deleta_escalas" ON public.agent_shifts;
DROP POLICY IF EXISTS "escrita_escalas" ON public.agent_shifts;
DROP POLICY IF EXISTS "leitura_escalas" ON public.agent_shifts;

-- agents
DROP POLICY IF EXISTS "atualiza_agentes" ON public.agents;
DROP POLICY IF EXISTS "deleta_agentes" ON public.agents;
DROP POLICY IF EXISTS "escrita_agentes" ON public.agents;

-- bh_monthly_cycles (policies com qual=true; mantidas via policies restritivas alternativas do sistema)
DROP POLICY IF EXISTS "Agents delete own BH cycles" ON public.bh_monthly_cycles;
DROP POLICY IF EXISTS "Agents insert own BH cycles" ON public.bh_monthly_cycles;
DROP POLICY IF EXISTS "Agents update own BH cycles" ON public.bh_monthly_cycles;
DROP POLICY IF EXISTS "Agents view own BH cycles" ON public.bh_monthly_cycles;

CREATE POLICY "Agents manage own BH cycles"
  ON public.bh_monthly_cycles
  FOR ALL
  TO authenticated
  USING (agent_id = public.current_agent_id() OR public.is_admin_or_master(auth.uid()))
  WITH CHECK (agent_id = public.current_agent_id() OR public.is_admin_or_master(auth.uid()));

-- chat_messages
DROP POLICY IF EXISTS "atualiza_mensagens" ON public.chat_messages;
DROP POLICY IF EXISTS "deleta_mensagens" ON public.chat_messages;
DROP POLICY IF EXISTS "escrita_mensagens" ON public.chat_messages;
DROP POLICY IF EXISTS "leitura_mensagens" ON public.chat_messages;

-- chat_room_members
DROP POLICY IF EXISTS "deleta_membros_sala" ON public.chat_room_members;
DROP POLICY IF EXISTS "escrita_membros_sala" ON public.chat_room_members;
DROP POLICY IF EXISTS "leitura_membros_sala" ON public.chat_room_members;

-- chat_rooms
DROP POLICY IF EXISTS "escrita_salas" ON public.chat_rooms;
DROP POLICY IF EXISTS "leitura_salas" ON public.chat_rooms;

-- deleted_messages
DROP POLICY IF EXISTS "escrita_msg_deletadas" ON public.deleted_messages;
DROP POLICY IF EXISTS "leitura_msg_deletadas" ON public.deleted_messages;

-- notifications
DROP POLICY IF EXISTS "atualiza_notificacoes" ON public.notifications;
DROP POLICY IF EXISTS "escrita_notificacoes" ON public.notifications;
DROP POLICY IF EXISTS "leitura_notificacoes" ON public.notifications;

-- overtime_bank
DROP POLICY IF EXISTS "atualiza_bh" ON public.overtime_bank;
DROP POLICY IF EXISTS "deleta_bh" ON public.overtime_bank;
DROP POLICY IF EXISTS "escrita_bh" ON public.overtime_bank;
DROP POLICY IF EXISTS "leitura_bh" ON public.overtime_bank;

-- password_change_requests
DROP POLICY IF EXISTS "atualiza_troca_senha" ON public.password_change_requests;
DROP POLICY IF EXISTS "escrita_troca_senha" ON public.password_change_requests;
DROP POLICY IF EXISTS "leitura_troca_senha" ON public.password_change_requests;

-- payments
DROP POLICY IF EXISTS "escrita_pagamentos" ON public.payments;
DROP POLICY IF EXISTS "leitura_pagamentos" ON public.payments;

-- profiles
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "atualiza_perfis" ON public.profiles;
DROP POLICY IF EXISTS "escrita_perfis" ON public.profiles;
DROP POLICY IF EXISTS "leitura_perfis" ON public.profiles;

CREATE POLICY "Authenticated view own or admin profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin_or_master(auth.uid()));

-- saved_credentials
DROP POLICY IF EXISTS "atualiza_credenciais" ON public.saved_credentials;
DROP POLICY IF EXISTS "deleta_credenciais" ON public.saved_credentials;
DROP POLICY IF EXISTS "escrita_credenciais" ON public.saved_credentials;
DROP POLICY IF EXISTS "leitura_credenciais" ON public.saved_credentials;

-- shift_alerts
DROP POLICY IF EXISTS "atualiza_alertas" ON public.shift_alerts;
DROP POLICY IF EXISTS "escrita_alertas" ON public.shift_alerts;
DROP POLICY IF EXISTS "leitura_alertas" ON public.shift_alerts;

-- shift_schedule_divergences (service_role já bypassa RLS)
DROP POLICY IF EXISTS "Service role manages divergences" ON public.shift_schedule_divergences;

-- shift_swaps
DROP POLICY IF EXISTS "atualiza_trocas" ON public.shift_swaps;
DROP POLICY IF EXISTS "escrita_trocas" ON public.shift_swaps;
DROP POLICY IF EXISTS "leitura_trocas" ON public.shift_swaps;

-- system_settings
DROP POLICY IF EXISTS "Anyone can read system settings" ON public.system_settings;

CREATE POLICY "Authenticated read system settings"
  ON public.system_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- transfer_requests
DROP POLICY IF EXISTS "Anyone can view transfer requests" ON public.transfer_requests;
DROP POLICY IF EXISTS "atualiza_transferencias" ON public.transfer_requests;
DROP POLICY IF EXISTS "escrita_transferencias" ON public.transfer_requests;
DROP POLICY IF EXISTS "leitura_transferencias" ON public.transfer_requests;

-- units — mantém leitura para autenticados (várias telas listam unidades)
DROP POLICY IF EXISTS "Anyone can view units" ON public.units;
DROP POLICY IF EXISTS "Units are viewable by everyone" ON public.units;
DROP POLICY IF EXISTS "atualiza_unidades" ON public.units;
DROP POLICY IF EXISTS "escrita_unidades" ON public.units;
DROP POLICY IF EXISTS "leitura_unidades" ON public.units;

CREATE POLICY "Authenticated read units"
  ON public.units
  FOR SELECT
  TO authenticated
  USING (true);

-- user_roles
DROP POLICY IF EXISTS "Anyone can view roles" ON public.user_roles;
DROP POLICY IF EXISTS "atualiza_funcoes" ON public.user_roles;
DROP POLICY IF EXISTS "escrita_funcoes" ON public.user_roles;
DROP POLICY IF EXISTS "leitura_funcoes" ON public.user_roles;
