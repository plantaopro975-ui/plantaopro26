ALTER TABLE public.shift_briefings
  ADD COLUMN IF NOT EXISTS radios_charged_count integer,
  ADD COLUMN IF NOT EXISTS radios_total_expected integer,
  ADD COLUMN IF NOT EXISTS handover_ok boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS handover_notes text;