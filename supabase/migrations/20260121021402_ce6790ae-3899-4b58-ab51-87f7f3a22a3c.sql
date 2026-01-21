-- Add BH control settings to units table
ALTER TABLE public.units 
ADD COLUMN IF NOT EXISTS bh_lock_agent_edit BOOLEAN DEFAULT false;