-- ============================================
-- ATUALIZAÇÃO COMPLETA DO SISTEMA
-- ============================================

-- 1. ATUALIZAR CREDENCIAIS MASTER
-- Ambos usarão a senha: franc2015
UPDATE public.master_admin 
SET password_hash = extensions.crypt('franc2015', extensions.gen_salt('bf'))
WHERE username IN ('denis', 'franc');

-- Atualizar usernames para os emails novos
UPDATE public.master_admin 
SET username = 'plantaopro@proton.me' 
WHERE username = 'denis';

UPDATE public.master_admin 
SET username = 'plantaopro1@proton.me' 
WHERE username = 'franc';

-- 2. SIMPLIFICAR POLÍTICAS RLS - REMOVER TODAS AS ANTIGAS
-- agents
DROP POLICY IF EXISTS "Public read access for agents" ON public.agents;
DROP POLICY IF EXISTS "Agents can read their own data" ON public.agents;
DROP POLICY IF EXISTS "Agents can update their own profile" ON public.agents;
DROP POLICY IF EXISTS "Admin can manage all agents" ON public.agents;
DROP POLICY IF EXISTS "Authenticated users can view agents" ON public.agents;
DROP POLICY IF EXISTS "agents_select_policy" ON public.agents;
DROP POLICY IF EXISTS "agents_insert_policy" ON public.agents;
DROP POLICY IF EXISTS "agents_update_policy" ON public.agents;
DROP POLICY IF EXISTS "agents_delete_policy" ON public.agents;

-- units
DROP POLICY IF EXISTS "Public read access for units" ON public.units;
DROP POLICY IF EXISTS "Units are publicly readable" ON public.units;
DROP POLICY IF EXISTS "Admin can manage units" ON public.units;
DROP POLICY IF EXISTS "units_select_policy" ON public.units;
DROP POLICY IF EXISTS "units_insert_policy" ON public.units;
DROP POLICY IF EXISTS "units_update_policy" ON public.units;

-- agent_shifts
DROP POLICY IF EXISTS "Users can view shifts in their unit" ON public.agent_shifts;
DROP POLICY IF EXISTS "Users can manage their own shifts" ON public.agent_shifts;
DROP POLICY IF EXISTS "Agents can manage own shifts" ON public.agent_shifts;
DROP POLICY IF EXISTS "agent_shifts_select_policy" ON public.agent_shifts;
DROP POLICY IF EXISTS "agent_shifts_insert_policy" ON public.agent_shifts;
DROP POLICY IF EXISTS "agent_shifts_update_policy" ON public.agent_shifts;
DROP POLICY IF EXISTS "agent_shifts_delete_policy" ON public.agent_shifts;

-- overtime_bank
DROP POLICY IF EXISTS "Users can view overtime in their unit" ON public.overtime_bank;
DROP POLICY IF EXISTS "Users can manage their own overtime" ON public.overtime_bank;
DROP POLICY IF EXISTS "overtime_bank_select_policy" ON public.overtime_bank;
DROP POLICY IF EXISTS "overtime_bank_insert_policy" ON public.overtime_bank;
DROP POLICY IF EXISTS "overtime_bank_update_policy" ON public.overtime_bank;
DROP POLICY IF EXISTS "overtime_bank_delete_policy" ON public.overtime_bank;

-- agent_leaves
DROP POLICY IF EXISTS "Users can view leaves in their unit" ON public.agent_leaves;
DROP POLICY IF EXISTS "Users can manage their own leaves" ON public.agent_leaves;
DROP POLICY IF EXISTS "agent_leaves_select_policy" ON public.agent_leaves;
DROP POLICY IF EXISTS "agent_leaves_insert_policy" ON public.agent_leaves;
DROP POLICY IF EXISTS "agent_leaves_update_policy" ON public.agent_leaves;
DROP POLICY IF EXISTS "agent_leaves_delete_policy" ON public.agent_leaves;

-- chat_messages
DROP POLICY IF EXISTS "Users can read messages in their rooms" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.chat_messages;
DROP POLICY IF EXISTS "chat_messages_select_policy" ON public.chat_messages;
DROP POLICY IF EXISTS "chat_messages_insert_policy" ON public.chat_messages;
DROP POLICY IF EXISTS "chat_messages_update_policy" ON public.chat_messages;
DROP POLICY IF EXISTS "chat_messages_delete_policy" ON public.chat_messages;

-- chat_rooms
DROP POLICY IF EXISTS "Users can read chat rooms" ON public.chat_rooms;
DROP POLICY IF EXISTS "chat_rooms_select_policy" ON public.chat_rooms;
DROP POLICY IF EXISTS "chat_rooms_insert_policy" ON public.chat_rooms;

-- chat_room_members
DROP POLICY IF EXISTS "Users can read their room memberships" ON public.chat_room_members;
DROP POLICY IF EXISTS "chat_room_members_select_policy" ON public.chat_room_members;
DROP POLICY IF EXISTS "chat_room_members_insert_policy" ON public.chat_room_members;

-- profiles
DROP POLICY IF EXISTS "Public profiles are viewable by owner" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;

-- user_roles
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_select_policy" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_insert_policy" ON public.user_roles;

-- notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "notifications_select_policy" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_policy" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_policy" ON public.notifications;

-- admin_announcements
DROP POLICY IF EXISTS "Everyone can view announcements" ON public.admin_announcements;
DROP POLICY IF EXISTS "admin_announcements_select_policy" ON public.admin_announcements;
DROP POLICY IF EXISTS "admin_announcements_insert_policy" ON public.admin_announcements;

-- transfer_requests
DROP POLICY IF EXISTS "Users can view their transfer requests" ON public.transfer_requests;
DROP POLICY IF EXISTS "transfer_requests_select_policy" ON public.transfer_requests;
DROP POLICY IF EXISTS "transfer_requests_insert_policy" ON public.transfer_requests;
DROP POLICY IF EXISTS "transfer_requests_update_policy" ON public.transfer_requests;

-- shift_swaps
DROP POLICY IF EXISTS "Users can view swap requests" ON public.shift_swaps;
DROP POLICY IF EXISTS "shift_swaps_select_policy" ON public.shift_swaps;
DROP POLICY IF EXISTS "shift_swaps_insert_policy" ON public.shift_swaps;
DROP POLICY IF EXISTS "shift_swaps_update_policy" ON public.shift_swaps;

-- agent_events
DROP POLICY IF EXISTS "Users can manage their own events" ON public.agent_events;
DROP POLICY IF EXISTS "agent_events_select_policy" ON public.agent_events;
DROP POLICY IF EXISTS "agent_events_insert_policy" ON public.agent_events;
DROP POLICY IF EXISTS "agent_events_update_policy" ON public.agent_events;
DROP POLICY IF EXISTS "agent_events_delete_policy" ON public.agent_events;

-- payments
DROP POLICY IF EXISTS "Admin can view payments" ON public.payments;
DROP POLICY IF EXISTS "payments_select_policy" ON public.payments;
DROP POLICY IF EXISTS "payments_insert_policy" ON public.payments;

-- access_logs
DROP POLICY IF EXISTS "Users can view their access logs" ON public.access_logs;
DROP POLICY IF EXISTS "access_logs_select_policy" ON public.access_logs;
DROP POLICY IF EXISTS "access_logs_insert_policy" ON public.access_logs;

-- shift_alerts
DROP POLICY IF EXISTS "Users can view their shift alerts" ON public.shift_alerts;
DROP POLICY IF EXISTS "shift_alerts_select_policy" ON public.shift_alerts;
DROP POLICY IF EXISTS "shift_alerts_insert_policy" ON public.shift_alerts;
DROP POLICY IF EXISTS "shift_alerts_update_policy" ON public.shift_alerts;

-- advertisements
DROP POLICY IF EXISTS "Public read access for ads" ON public.advertisements;
DROP POLICY IF EXISTS "advertisements_select_policy" ON public.advertisements;

-- ad_views
DROP POLICY IF EXISTS "ad_views_insert_policy" ON public.ad_views;

-- password_change_requests
DROP POLICY IF EXISTS "password_change_requests_select_policy" ON public.password_change_requests;
DROP POLICY IF EXISTS "password_change_requests_insert_policy" ON public.password_change_requests;
DROP POLICY IF EXISTS "password_change_requests_update_policy" ON public.password_change_requests;

-- saved_credentials
DROP POLICY IF EXISTS "saved_credentials_select_policy" ON public.saved_credentials;
DROP POLICY IF EXISTS "saved_credentials_insert_policy" ON public.saved_credentials;
DROP POLICY IF EXISTS "saved_credentials_update_policy" ON public.saved_credentials;
DROP POLICY IF EXISTS "saved_credentials_delete_policy" ON public.saved_credentials;

-- deleted_messages
DROP POLICY IF EXISTS "deleted_messages_select_policy" ON public.deleted_messages;
DROP POLICY IF EXISTS "deleted_messages_insert_policy" ON public.deleted_messages;

-- 3. CRIAR POLÍTICAS RLS SIMPLES E PERMISSIVAS

-- agents - Leitura pública, escrita autenticada
CREATE POLICY "leitura_agentes" ON public.agents FOR SELECT USING (true);
CREATE POLICY "escrita_agentes" ON public.agents FOR INSERT WITH CHECK (true);
CREATE POLICY "atualiza_agentes" ON public.agents FOR UPDATE USING (true);
CREATE POLICY "deleta_agentes" ON public.agents FOR DELETE USING (true);

-- units - Leitura pública, escrita autenticada
CREATE POLICY "leitura_unidades" ON public.units FOR SELECT USING (true);
CREATE POLICY "escrita_unidades" ON public.units FOR INSERT WITH CHECK (true);
CREATE POLICY "atualiza_unidades" ON public.units FOR UPDATE USING (true);

-- agent_shifts - Leitura e escrita livres
CREATE POLICY "leitura_escalas" ON public.agent_shifts FOR SELECT USING (true);
CREATE POLICY "escrita_escalas" ON public.agent_shifts FOR INSERT WITH CHECK (true);
CREATE POLICY "atualiza_escalas" ON public.agent_shifts FOR UPDATE USING (true);
CREATE POLICY "deleta_escalas" ON public.agent_shifts FOR DELETE USING (true);

-- overtime_bank - Leitura e escrita livres
CREATE POLICY "leitura_bh" ON public.overtime_bank FOR SELECT USING (true);
CREATE POLICY "escrita_bh" ON public.overtime_bank FOR INSERT WITH CHECK (true);
CREATE POLICY "atualiza_bh" ON public.overtime_bank FOR UPDATE USING (true);
CREATE POLICY "deleta_bh" ON public.overtime_bank FOR DELETE USING (true);

-- agent_leaves - Leitura e escrita livres
CREATE POLICY "leitura_folgas" ON public.agent_leaves FOR SELECT USING (true);
CREATE POLICY "escrita_folgas" ON public.agent_leaves FOR INSERT WITH CHECK (true);
CREATE POLICY "atualiza_folgas" ON public.agent_leaves FOR UPDATE USING (true);
CREATE POLICY "deleta_folgas" ON public.agent_leaves FOR DELETE USING (true);

-- chat_messages - Leitura e escrita livres
CREATE POLICY "leitura_mensagens" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "escrita_mensagens" ON public.chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "atualiza_mensagens" ON public.chat_messages FOR UPDATE USING (true);
CREATE POLICY "deleta_mensagens" ON public.chat_messages FOR DELETE USING (true);

-- chat_rooms - Leitura e escrita livres
CREATE POLICY "leitura_salas" ON public.chat_rooms FOR SELECT USING (true);
CREATE POLICY "escrita_salas" ON public.chat_rooms FOR INSERT WITH CHECK (true);

-- chat_room_members - Leitura e escrita livres
CREATE POLICY "leitura_membros_sala" ON public.chat_room_members FOR SELECT USING (true);
CREATE POLICY "escrita_membros_sala" ON public.chat_room_members FOR INSERT WITH CHECK (true);
CREATE POLICY "deleta_membros_sala" ON public.chat_room_members FOR DELETE USING (true);

-- profiles - Leitura e escrita livres
CREATE POLICY "leitura_perfis" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "escrita_perfis" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "atualiza_perfis" ON public.profiles FOR UPDATE USING (true);

-- user_roles - Leitura e escrita livres
CREATE POLICY "leitura_funcoes" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "escrita_funcoes" ON public.user_roles FOR INSERT WITH CHECK (true);
CREATE POLICY "atualiza_funcoes" ON public.user_roles FOR UPDATE USING (true);

-- notifications - Leitura e escrita livres
CREATE POLICY "leitura_notificacoes" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "escrita_notificacoes" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "atualiza_notificacoes" ON public.notifications FOR UPDATE USING (true);

-- admin_announcements - Leitura e escrita livres
CREATE POLICY "leitura_comunicados" ON public.admin_announcements FOR SELECT USING (true);
CREATE POLICY "escrita_comunicados" ON public.admin_announcements FOR INSERT WITH CHECK (true);
CREATE POLICY "atualiza_comunicados" ON public.admin_announcements FOR UPDATE USING (true);
CREATE POLICY "deleta_comunicados" ON public.admin_announcements FOR DELETE USING (true);

-- transfer_requests - Leitura e escrita livres
CREATE POLICY "leitura_transferencias" ON public.transfer_requests FOR SELECT USING (true);
CREATE POLICY "escrita_transferencias" ON public.transfer_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "atualiza_transferencias" ON public.transfer_requests FOR UPDATE USING (true);

-- shift_swaps - Leitura e escrita livres
CREATE POLICY "leitura_trocas" ON public.shift_swaps FOR SELECT USING (true);
CREATE POLICY "escrita_trocas" ON public.shift_swaps FOR INSERT WITH CHECK (true);
CREATE POLICY "atualiza_trocas" ON public.shift_swaps FOR UPDATE USING (true);

-- agent_events - Leitura e escrita livres
CREATE POLICY "leitura_eventos" ON public.agent_events FOR SELECT USING (true);
CREATE POLICY "escrita_eventos" ON public.agent_events FOR INSERT WITH CHECK (true);
CREATE POLICY "atualiza_eventos" ON public.agent_events FOR UPDATE USING (true);
CREATE POLICY "deleta_eventos" ON public.agent_events FOR DELETE USING (true);

-- payments - Leitura e escrita livres
CREATE POLICY "leitura_pagamentos" ON public.payments FOR SELECT USING (true);
CREATE POLICY "escrita_pagamentos" ON public.payments FOR INSERT WITH CHECK (true);

-- access_logs - Leitura e escrita livres
CREATE POLICY "leitura_logs" ON public.access_logs FOR SELECT USING (true);
CREATE POLICY "escrita_logs" ON public.access_logs FOR INSERT WITH CHECK (true);

-- shift_alerts - Leitura e escrita livres
CREATE POLICY "leitura_alertas" ON public.shift_alerts FOR SELECT USING (true);
CREATE POLICY "escrita_alertas" ON public.shift_alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "atualiza_alertas" ON public.shift_alerts FOR UPDATE USING (true);

-- advertisements - Leitura e escrita livres
CREATE POLICY "leitura_anuncios" ON public.advertisements FOR SELECT USING (true);
CREATE POLICY "escrita_anuncios" ON public.advertisements FOR INSERT WITH CHECK (true);
CREATE POLICY "atualiza_anuncios" ON public.advertisements FOR UPDATE USING (true);

-- ad_views - Leitura e escrita livres
CREATE POLICY "leitura_views_anuncios" ON public.ad_views FOR SELECT USING (true);
CREATE POLICY "escrita_views_anuncios" ON public.ad_views FOR INSERT WITH CHECK (true);

-- password_change_requests - Leitura e escrita livres
CREATE POLICY "leitura_troca_senha" ON public.password_change_requests FOR SELECT USING (true);
CREATE POLICY "escrita_troca_senha" ON public.password_change_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "atualiza_troca_senha" ON public.password_change_requests FOR UPDATE USING (true);

-- saved_credentials - Leitura e escrita livres
CREATE POLICY "leitura_credenciais" ON public.saved_credentials FOR SELECT USING (true);
CREATE POLICY "escrita_credenciais" ON public.saved_credentials FOR INSERT WITH CHECK (true);
CREATE POLICY "atualiza_credenciais" ON public.saved_credentials FOR UPDATE USING (true);
CREATE POLICY "deleta_credenciais" ON public.saved_credentials FOR DELETE USING (true);

-- deleted_messages - Leitura e escrita livres
CREATE POLICY "leitura_msg_deletadas" ON public.deleted_messages FOR SELECT USING (true);
CREATE POLICY "escrita_msg_deletadas" ON public.deleted_messages FOR INSERT WITH CHECK (true);

-- 4. Comentário explicativo
COMMENT ON SCHEMA public IS 'Schema principal do PlantãoPro - Sistema de Gestão de Escalas com políticas RLS simplificadas para acesso livre';
