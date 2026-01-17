-- 1) Add per-fortnight BH limits to agents (keeps legacy bh_limit for backwards compatibility)
ALTER TABLE public.agents
  ADD COLUMN IF NOT EXISTS bh_limit_1st numeric,
  ADD COLUMN IF NOT EXISTS bh_limit_2nd numeric;

-- Backfill: if new columns are null, inherit legacy bh_limit
UPDATE public.agents
SET
  bh_limit_1st = COALESCE(bh_limit_1st, bh_limit),
  bh_limit_2nd = COALESCE(bh_limit_2nd, bh_limit)
WHERE bh_limit_1st IS NULL OR bh_limit_2nd IS NULL;

-- Optional defaults for new rows
ALTER TABLE public.agents
  ALTER COLUMN bh_limit_1st SET DEFAULT 0,
  ALTER COLUMN bh_limit_2nd SET DEFAULT 0;

-- 2) Team leave notification fan-out (creates in-app notifications for all teammates)
-- NOTE: This enables front-end realtime/local notifications without requiring external push providers.
CREATE OR REPLACE FUNCTION public.notify_team_leave()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_team text;
  v_unit_id uuid;
  v_agent_name text;
  v_title text;
  v_body text;
BEGIN
  -- Only notify when a leave becomes approved
  IF NEW.status IS DISTINCT FROM 'approved' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status = 'approved' THEN
    -- already approved before; avoid duplicate spam
    RETURN NEW;
  END IF;

  SELECT a.team, a.unit_id, a.name
    INTO v_team, v_unit_id, v_agent_name
  FROM public.agents a
  WHERE a.id = NEW.agent_id;

  IF v_team IS NULL OR v_unit_id IS NULL THEN
    RETURN NEW;
  END IF;

  v_title := 'Folga na equipe';
  v_body := COALESCE(v_agent_name, 'Um colega') || ' estará de folga (' || NEW.leave_type || ') de ' || NEW.start_date || ' até ' || NEW.end_date || '.';

  INSERT INTO public.notifications (agent_id, title, content, type, is_read)
  SELECT a2.id, v_title, v_body, 'leave', false
  FROM public.agents a2
  WHERE a2.is_active IS DISTINCT FROM false
    AND a2.team = v_team
    AND a2.unit_id = v_unit_id
    AND a2.id <> NEW.agent_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_team_leave_insert ON public.agent_leaves;
CREATE TRIGGER trg_notify_team_leave_insert
AFTER INSERT ON public.agent_leaves
FOR EACH ROW
EXECUTE FUNCTION public.notify_team_leave();

DROP TRIGGER IF EXISTS trg_notify_team_leave_update ON public.agent_leaves;
CREATE TRIGGER trg_notify_team_leave_update
AFTER UPDATE OF status ON public.agent_leaves
FOR EACH ROW
EXECUTE FUNCTION public.notify_team_leave();
