CREATE UNIQUE INDEX IF NOT EXISTS round_sessions_user_started_active_unique
  ON public.round_sessions (user_id, server_started_at)
  WHERE is_active = true;