-- Create table to store monthly BH cycles/summaries
CREATE TABLE IF NOT EXISTS public.bh_monthly_cycles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  total_hours NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_entries INTEGER NOT NULL DEFAULT 0,
  credit_hours NUMERIC(10,2) NOT NULL DEFAULT 0,
  debit_hours NUMERIC(10,2) NOT NULL DEFAULT 0,
  fortnight_1_hours NUMERIC(10,2) NOT NULL DEFAULT 0,
  fortnight_2_hours NUMERIC(10,2) NOT NULL DEFAULT 0,
  hourly_rate NUMERIC(10,2) DEFAULT NULL,
  estimated_value NUMERIC(10,2) DEFAULT NULL,
  closed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(agent_id, year, month)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_bh_monthly_cycles_agent ON public.bh_monthly_cycles(agent_id);
CREATE INDEX IF NOT EXISTS idx_bh_monthly_cycles_date ON public.bh_monthly_cycles(year DESC, month DESC);

-- Enable RLS
ALTER TABLE public.bh_monthly_cycles ENABLE ROW LEVEL SECURITY;

-- RLS policies - using same pattern as overtime_bank
CREATE POLICY "Agents view own BH cycles"
ON public.bh_monthly_cycles
FOR SELECT
USING (true);

CREATE POLICY "Agents insert own BH cycles"
ON public.bh_monthly_cycles
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Agents update own BH cycles"
ON public.bh_monthly_cycles
FOR UPDATE
USING (true);

CREATE POLICY "Agents delete own BH cycles"
ON public.bh_monthly_cycles
FOR DELETE
USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_bh_monthly_cycles_updated_at
BEFORE UPDATE ON public.bh_monthly_cycles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to close/summarize a month's BH entries
CREATE OR REPLACE FUNCTION public.close_bh_month(
  p_agent_id UUID,
  p_year INTEGER,
  p_month INTEGER
) RETURNS UUID AS $$
DECLARE
  v_cycle_id UUID;
  v_total_hours NUMERIC(10,2) := 0;
  v_total_entries INTEGER := 0;
  v_credit_hours NUMERIC(10,2) := 0;
  v_debit_hours NUMERIC(10,2) := 0;
  v_fortnight_1 NUMERIC(10,2) := 0;
  v_fortnight_2 NUMERIC(10,2) := 0;
  v_hourly_rate NUMERIC(10,2);
  v_month_str TEXT;
  v_entry RECORD;
BEGIN
  -- Get agent's hourly rate
  SELECT COALESCE(a.bh_hourly_rate, u.bh_hourly_rate_default, 50)
  INTO v_hourly_rate
  FROM public.agents a
  LEFT JOIN public.units u ON a.unit_id = u.id
  WHERE a.id = p_agent_id;

  -- Format month string for pattern matching (MM/YYYY)
  v_month_str := LPAD(p_month::TEXT, 2, '0') || '/' || p_year::TEXT;

  -- Calculate totals from overtime_bank entries
  FOR v_entry IN 
    SELECT hours, description
    FROM public.overtime_bank
    WHERE agent_id = p_agent_id
    AND description LIKE '%' || v_month_str || '%'
  LOOP
    v_total_entries := v_total_entries + 1;
    v_total_hours := v_total_hours + COALESCE(v_entry.hours, 0);
    
    IF v_entry.hours > 0 THEN
      v_credit_hours := v_credit_hours + v_entry.hours;
    ELSE
      v_debit_hours := v_debit_hours + ABS(v_entry.hours);
    END IF;

    -- Check fortnight from description pattern "BH - DD/MM/YYYY"
    IF v_entry.description ~ 'BH - ([0-9]{2})/' THEN
      DECLARE
        v_day INTEGER;
      BEGIN
        v_day := SUBSTRING(v_entry.description FROM 'BH - ([0-9]{2})')::INTEGER;
        IF v_day <= 15 THEN
          v_fortnight_1 := v_fortnight_1 + COALESCE(v_entry.hours, 0);
        ELSE
          v_fortnight_2 := v_fortnight_2 + COALESCE(v_entry.hours, 0);
        END IF;
      END;
    END IF;
  END LOOP;

  -- Insert or update the cycle record
  INSERT INTO public.bh_monthly_cycles (
    agent_id, year, month, total_hours, total_entries,
    credit_hours, debit_hours, fortnight_1_hours, fortnight_2_hours,
    hourly_rate, estimated_value, closed_at
  ) VALUES (
    p_agent_id, p_year, p_month, v_total_hours, v_total_entries,
    v_credit_hours, v_debit_hours, v_fortnight_1, v_fortnight_2,
    v_hourly_rate, v_total_hours * v_hourly_rate, now()
  )
  ON CONFLICT (agent_id, year, month) DO UPDATE SET
    total_hours = EXCLUDED.total_hours,
    total_entries = EXCLUDED.total_entries,
    credit_hours = EXCLUDED.credit_hours,
    debit_hours = EXCLUDED.debit_hours,
    fortnight_1_hours = EXCLUDED.fortnight_1_hours,
    fortnight_2_hours = EXCLUDED.fortnight_2_hours,
    hourly_rate = EXCLUDED.hourly_rate,
    estimated_value = EXCLUDED.estimated_value,
    closed_at = EXCLUDED.closed_at,
    updated_at = now()
  RETURNING id INTO v_cycle_id;

  RETURN v_cycle_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to clean up old BH data (older than 5 years)
CREATE OR REPLACE FUNCTION public.cleanup_old_bh_data(p_agent_id UUID DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE
  v_cutoff_year INTEGER;
  v_cutoff_month INTEGER;
  v_deleted_count INTEGER := 0;
BEGIN
  -- Calculate 5 years ago
  v_cutoff_year := EXTRACT(YEAR FROM CURRENT_DATE) - 5;
  v_cutoff_month := EXTRACT(MONTH FROM CURRENT_DATE);

  -- Delete old cycles
  IF p_agent_id IS NOT NULL THEN
    DELETE FROM public.bh_monthly_cycles
    WHERE agent_id = p_agent_id
    AND (year < v_cutoff_year OR (year = v_cutoff_year AND month < v_cutoff_month));
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  ELSE
    DELETE FROM public.bh_monthly_cycles
    WHERE year < v_cutoff_year OR (year = v_cutoff_year AND month < v_cutoff_month);
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  END IF;

  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;