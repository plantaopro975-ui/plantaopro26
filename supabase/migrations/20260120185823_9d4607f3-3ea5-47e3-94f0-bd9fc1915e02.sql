-- Add default BH limits per fortnight to units table
ALTER TABLE public.units
ADD COLUMN IF NOT EXISTS bh_limit_1st_default INTEGER DEFAULT 70,
ADD COLUMN IF NOT EXISTS bh_limit_2nd_default INTEGER DEFAULT 70,
ADD COLUMN IF NOT EXISTS bh_hourly_rate_default NUMERIC(10,2) DEFAULT 15.75;

-- Add comment for documentation
COMMENT ON COLUMN public.units.bh_limit_1st_default IS 'Default BH limit for 1st fortnight (days 1-15) for all agents in this unit';
COMMENT ON COLUMN public.units.bh_limit_2nd_default IS 'Default BH limit for 2nd fortnight (days 16-31) for all agents in this unit';
COMMENT ON COLUMN public.units.bh_hourly_rate_default IS 'Default hourly rate for BH calculations for all agents in this unit';