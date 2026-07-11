ALTER TABLE public.shift_briefings
  ADD COLUMN IF NOT EXISTS tonfas_counted INTEGER,
  ADD COLUMN IF NOT EXISTS tonfas_expected INTEGER;