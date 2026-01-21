-- Enable realtime updates for admin announcements (so agents see new notices instantly)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_announcements;
EXCEPTION
  WHEN duplicate_object THEN
    -- already added
    NULL;
END $$;
