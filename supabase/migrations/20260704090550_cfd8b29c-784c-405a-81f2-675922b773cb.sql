
CREATE TABLE public.round_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team TEXT NOT NULL,
  mode TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  interval_min INTEGER NOT NULL DEFAULT 0,
  rows JSONB NOT NULL DEFAULT '[]'::jsonb,
  server_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.round_sessions TO authenticated;
GRANT ALL ON public.round_sessions TO service_role;

ALTER TABLE public.round_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own round sessions"
  ON public.round_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX round_sessions_user_active_idx
  ON public.round_sessions (user_id, is_active, server_started_at DESC);

CREATE TRIGGER round_sessions_set_updated_at
  BEFORE UPDATE ON public.round_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.get_server_now()
RETURNS TIMESTAMPTZ
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$ SELECT now(); $$;

GRANT EXECUTE ON FUNCTION public.get_server_now() TO anon, authenticated, service_role;
