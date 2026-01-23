
-- =============================================================================
-- DOCUMENTAÇÃO EM PORTUGUÊS - COMENTÁRIOS NAS TABELAS
-- =============================================================================

-- TABELA: agents (Agentes)
COMMENT ON TABLE public.agents IS 'Agentes - Tabela de funcionários/agentes do sistema';
COMMENT ON COLUMN public.agents.id IS 'Identificador único do agente';
COMMENT ON COLUMN public.agents.name IS 'Nome completo do agente';
COMMENT ON COLUMN public.agents.cpf IS 'CPF do agente (apenas números)';
COMMENT ON COLUMN public.agents.matricula IS 'Matrícula funcional';
COMMENT ON COLUMN public.agents.team IS 'Equipe/Time (ALFA, BRAVO, CHARLIE, DELTA)';
COMMENT ON COLUMN public.agents.unit_id IS 'Unidade de lotação';
COMMENT ON COLUMN public.agents.role IS 'Cargo/Função';
COMMENT ON COLUMN public.agents.phone IS 'Telefone';
COMMENT ON COLUMN public.agents.blood_type IS 'Tipo sanguíneo';
COMMENT ON COLUMN public.agents.birth_date IS 'Data de nascimento';
COMMENT ON COLUMN public.agents.avatar_url IS 'URL da foto do perfil';
COMMENT ON COLUMN public.agents.is_active IS 'Se o agente está ativo';
COMMENT ON COLUMN public.agents.is_frozen IS 'Se a licença está congelada';
COMMENT ON COLUMN public.agents.license_status IS 'Status da licença';
COMMENT ON COLUMN public.agents.license_expires_at IS 'Data de expiração da licença';
COMMENT ON COLUMN public.agents.first_shift_date IS 'Data do primeiro plantão';
COMMENT ON COLUMN public.agents.created_at IS 'Data de criação';
COMMENT ON COLUMN public.agents.updated_at IS 'Data de atualização';

-- TABELA: units (Unidades)
COMMENT ON TABLE public.units IS 'Unidades - Unidades socioeducativas';
COMMENT ON COLUMN public.units.id IS 'Identificador único da unidade';
COMMENT ON COLUMN public.units.name IS 'Nome da unidade';
COMMENT ON COLUMN public.units.municipality IS 'Município';
COMMENT ON COLUMN public.units.address IS 'Endereço';
COMMENT ON COLUMN public.units.phone IS 'Telefone';
COMMENT ON COLUMN public.units.email IS 'E-mail';
COMMENT ON COLUMN public.units.director_name IS 'Nome do diretor';
COMMENT ON COLUMN public.units.coordinator_name IS 'Nome do coordenador';

-- TABELA: agent_shifts (Plantões)
COMMENT ON TABLE public.agent_shifts IS 'Plantões - Escalas de plantão dos agentes';
COMMENT ON COLUMN public.agent_shifts.id IS 'Identificador único do plantão';
COMMENT ON COLUMN public.agent_shifts.agent_id IS 'Agente responsável';
COMMENT ON COLUMN public.agent_shifts.shift_date IS 'Data do plantão';
COMMENT ON COLUMN public.agent_shifts.start_time IS 'Hora de início';
COMMENT ON COLUMN public.agent_shifts.end_time IS 'Hora de término';
COMMENT ON COLUMN public.agent_shifts.shift_type IS 'Tipo de plantão';
COMMENT ON COLUMN public.agent_shifts.status IS 'Status (agendado, confirmado, cancelado)';
COMMENT ON COLUMN public.agent_shifts.notes IS 'Observações';

-- TABELA: agent_leaves (Folgas)
COMMENT ON TABLE public.agent_leaves IS 'Folgas - Solicitações de folga dos agentes';
COMMENT ON COLUMN public.agent_leaves.id IS 'Identificador único';
COMMENT ON COLUMN public.agent_leaves.agent_id IS 'Agente solicitante';
COMMENT ON COLUMN public.agent_leaves.leave_type IS 'Tipo de folga';
COMMENT ON COLUMN public.agent_leaves.start_date IS 'Data de início';
COMMENT ON COLUMN public.agent_leaves.end_date IS 'Data de término';
COMMENT ON COLUMN public.agent_leaves.status IS 'Status (pendente, aprovado, recusado)';
COMMENT ON COLUMN public.agent_leaves.reason IS 'Motivo';

-- TABELA: overtime_bank (Banco de Horas)
COMMENT ON TABLE public.overtime_bank IS 'Banco de Horas - Controle de horas extras';
COMMENT ON COLUMN public.overtime_bank.id IS 'Identificador único';
COMMENT ON COLUMN public.overtime_bank.agent_id IS 'Agente';
COMMENT ON COLUMN public.overtime_bank.hours IS 'Quantidade de horas';
COMMENT ON COLUMN public.overtime_bank.operation_type IS 'Tipo de operação (crédito/débito)';
COMMENT ON COLUMN public.overtime_bank.description IS 'Descrição';
COMMENT ON COLUMN public.overtime_bank.created_at IS 'Data de criação';

-- TABELA: chat_messages (Mensagens)
COMMENT ON TABLE public.chat_messages IS 'Mensagens - Mensagens do chat';
COMMENT ON COLUMN public.chat_messages.id IS 'Identificador único';
COMMENT ON COLUMN public.chat_messages.room_id IS 'Sala de chat';
COMMENT ON COLUMN public.chat_messages.sender_id IS 'Remetente';
COMMENT ON COLUMN public.chat_messages.content IS 'Conteúdo da mensagem';
COMMENT ON COLUMN public.chat_messages.is_deleted IS 'Se foi deletada';
COMMENT ON COLUMN public.chat_messages.created_at IS 'Data de criação';

-- TABELA: chat_rooms (Salas de Chat)
COMMENT ON TABLE public.chat_rooms IS 'Salas de Chat - Salas de conversa';
COMMENT ON COLUMN public.chat_rooms.id IS 'Identificador único';
COMMENT ON COLUMN public.chat_rooms.name IS 'Nome da sala';
COMMENT ON COLUMN public.chat_rooms.type IS 'Tipo (equipe, unidade, todos)';
COMMENT ON COLUMN public.chat_rooms.unit_id IS 'Unidade (se aplicável)';
COMMENT ON COLUMN public.chat_rooms.team IS 'Equipe (se aplicável)';

-- TABELA: notifications (Notificações)
COMMENT ON TABLE public.notifications IS 'Notificações - Notificações do sistema';
COMMENT ON COLUMN public.notifications.id IS 'Identificador único';
COMMENT ON COLUMN public.notifications.agent_id IS 'Agente destinatário';
COMMENT ON COLUMN public.notifications.title IS 'Título';
COMMENT ON COLUMN public.notifications.content IS 'Conteúdo';
COMMENT ON COLUMN public.notifications.type IS 'Tipo de notificação';
COMMENT ON COLUMN public.notifications.is_read IS 'Se foi lida';
COMMENT ON COLUMN public.notifications.created_at IS 'Data de criação';

-- TABELA: transfer_requests (Transferências)
COMMENT ON TABLE public.transfer_requests IS 'Transferências - Solicitações de transferência';
COMMENT ON COLUMN public.transfer_requests.id IS 'Identificador único';
COMMENT ON COLUMN public.transfer_requests.agent_id IS 'Agente solicitante';
COMMENT ON COLUMN public.transfer_requests.from_unit_id IS 'Unidade de origem';
COMMENT ON COLUMN public.transfer_requests.to_unit_id IS 'Unidade de destino';
COMMENT ON COLUMN public.transfer_requests.from_team IS 'Equipe de origem';
COMMENT ON COLUMN public.transfer_requests.to_team IS 'Equipe de destino';
COMMENT ON COLUMN public.transfer_requests.status IS 'Status (pendente, aprovado, recusado)';
COMMENT ON COLUMN public.transfer_requests.reason IS 'Motivo';
COMMENT ON COLUMN public.transfer_requests.created_at IS 'Data de criação';
COMMENT ON COLUMN public.transfer_requests.updated_at IS 'Data de atualização';
COMMENT ON COLUMN public.transfer_requests.reviewed_at IS 'Data de análise';
COMMENT ON COLUMN public.transfer_requests.reviewed_by IS 'Analisado por';

-- TABELA: user_roles (Permissões)
COMMENT ON TABLE public.user_roles IS 'Permissões - Papéis/roles dos usuários';
COMMENT ON COLUMN public.user_roles.id IS 'Identificador único';
COMMENT ON COLUMN public.user_roles.user_id IS 'Identificador do usuário';
COMMENT ON COLUMN public.user_roles.role IS 'Papel (admin, user, master)';

-- TABELA: profiles (Perfis)
COMMENT ON TABLE public.profiles IS 'Perfis - Perfis de usuário';
COMMENT ON COLUMN public.profiles.id IS 'Identificador único';
COMMENT ON COLUMN public.profiles.user_id IS 'Identificador do usuário';
COMMENT ON COLUMN public.profiles.full_name IS 'Nome completo';

-- OUTRAS TABELAS
COMMENT ON TABLE public.license_activation_codes IS 'Códigos de Ativação - Códigos para ativar licenças';
COMMENT ON TABLE public.advertisements IS 'Anúncios - Propagandas do sistema';
COMMENT ON TABLE public.admin_announcements IS 'Comunicados - Avisos administrativos';
COMMENT ON TABLE public.shift_alerts IS 'Alertas de Plantão - Lembretes de plantão';
COMMENT ON TABLE public.payments IS 'Pagamentos - Registro de pagamentos';
COMMENT ON TABLE public.access_logs IS 'Logs de Acesso - Registro de acessos';
COMMENT ON TABLE public.activity_logs IS 'Logs de Atividade - Registro de atividades';
COMMENT ON TABLE public.master_admin IS 'Administrador Master - Credenciais do admin master';
COMMENT ON TABLE public.saved_credentials IS 'Credenciais Salvas - Login rápido';
COMMENT ON TABLE public.dynamic_screens IS 'Telas Dinâmicas - Telas personalizadas';
COMMENT ON TABLE public.shift_swaps IS 'Trocas de Plantão - Solicitações de troca';
COMMENT ON TABLE public.agent_events IS 'Eventos de Agente - Eventos relacionados a agentes';
