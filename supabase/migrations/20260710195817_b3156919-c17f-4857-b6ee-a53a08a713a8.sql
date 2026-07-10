
-- 1) Upgrade all existing agents to lifetime license
UPDATE public.agents
SET license_status = 'active',
    license_expires_at = (now() + INTERVAL '100 years'),
    is_frozen = false,
    frozen_at = NULL,
    frozen_by = NULL,
    updated_at = now();

-- 2) Update the insert-defaults trigger so new agents also get lifetime license
CREATE OR REPLACE FUNCTION public.agents_force_safe_defaults_on_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Lifetime license for every new agent, regardless of who is inserting
  NEW.license_status := 'active';
  NEW.license_expires_at := COALESCE(NEW.license_expires_at, now() + INTERVAL '100 years');
  IF NEW.license_expires_at < (now() + INTERVAL '10 years') THEN
    NEW.license_expires_at := now() + INTERVAL '100 years';
  END IF;
  NEW.is_frozen := false;

  -- Admin/master can set anything else
  IF public.is_admin_or_master(auth.uid()) THEN
    RETURN NEW;
  END IF;

  -- Non-admins: force safe values on privileged columns
  NEW.role := 'user';
  NEW.approval_status := COALESCE(NEW.approval_status, 'pending');
  RETURN NEW;
END;
$function$;

-- 3) Refresh offline license cache
SELECT public.sync_offline_license_cache();
