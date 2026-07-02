ALTER TABLE public.agent_leaves DROP CONSTRAINT IF EXISTS agent_leaves_period_check;
ALTER TABLE public.agent_leaves ADD CONSTRAINT agent_leaves_period_check CHECK (period = ANY (ARRAY['manha','tarde','noite','integral','24h','12h','dia']));
ALTER TABLE public.agent_leaves ADD COLUMN IF NOT EXISTS start_time TIME;
ALTER TABLE public.agent_leaves ADD COLUMN IF NOT EXISTS end_time TIME;
ALTER TABLE public.agent_leaves ADD COLUMN IF NOT EXISTS hours_count NUMERIC(5,2);