
ALTER TABLE public.round_sessions
  ADD COLUMN IF NOT EXISTS notified_indices INTEGER[] NOT NULL DEFAULT '{}'::integer[];

ALTER TABLE public.round_sessions REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'round_sessions'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.round_sessions';
  END IF;
END $$;
