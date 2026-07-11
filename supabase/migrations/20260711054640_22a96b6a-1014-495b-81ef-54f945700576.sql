ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS reminder_settings jsonb NOT NULL DEFAULT '{"enabled": true, "intervalMin": 30}'::jsonb;