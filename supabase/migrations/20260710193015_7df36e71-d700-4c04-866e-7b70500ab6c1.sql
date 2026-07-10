
-- ============================================================
-- SECURITY HARDENING MIGRATION
-- Fixes ERROR-level and high-impact WARN findings from security scan.
-- ============================================================

-- 1) agents self-registration: force safe defaults for privileged columns
CREATE OR REPLACE FUNCTION public.agents_force_safe_defaults_on_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Admin/master can set anything
  IF public.is_admin_or_master(auth.uid()) THEN
    RETURN NEW;
  END IF;
  -- Everyone else: force safe values on privileged columns
  NEW.role := 'user';
  NEW.approval_status := 'pending';
  NEW.license_status := COALESCE(NEW.license_status, 'pending');
  IF NEW.license_status NOT IN ('pending','trial') THEN
    NEW.license_status := 'pending';
  END IF;
  NEW.is_frozen := false;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_agents_force_safe_defaults ON public.agents;
CREATE TRIGGER trg_agents_force_safe_defaults
  BEFORE INSERT ON public.agents
  FOR EACH ROW EXECUTE FUNCTION public.agents_force_safe_defaults_on_insert();

-- 2) shift_alerts: tighten to owner
DROP POLICY IF EXISTS "Agents can view their own alerts" ON public.shift_alerts;
DROP POLICY IF EXISTS "Agents can update their own alerts" ON public.shift_alerts;

CREATE POLICY "Agents can view their own alerts"
  ON public.shift_alerts FOR SELECT
  USING (public.is_own_agent(agent_id) OR public.is_admin_or_master(auth.uid()));

CREATE POLICY "Agents can update their own alerts"
  ON public.shift_alerts FOR UPDATE
  USING (public.is_own_agent(agent_id) OR public.is_admin_or_master(auth.uid()))
  WITH CHECK (public.is_own_agent(agent_id) OR public.is_admin_or_master(auth.uid()));

-- 3) agent_events: tighten to owner
DROP POLICY IF EXISTS "Users can view their own events" ON public.agent_events;
DROP POLICY IF EXISTS "Users can insert their own events" ON public.agent_events;
DROP POLICY IF EXISTS "Users can update their own events" ON public.agent_events;
DROP POLICY IF EXISTS "Users can delete their own events" ON public.agent_events;

CREATE POLICY "Users can view their own events"
  ON public.agent_events FOR SELECT
  USING (public.is_own_agent(agent_id) OR public.is_admin_or_master(auth.uid()));
CREATE POLICY "Users can insert their own events"
  ON public.agent_events FOR INSERT
  WITH CHECK (public.is_own_agent(agent_id) OR public.is_admin_or_master(auth.uid()));
CREATE POLICY "Users can update their own events"
  ON public.agent_events FOR UPDATE
  USING (public.is_own_agent(agent_id) OR public.is_admin_or_master(auth.uid()))
  WITH CHECK (public.is_own_agent(agent_id) OR public.is_admin_or_master(auth.uid()));
CREATE POLICY "Users can delete their own events"
  ON public.agent_events FOR DELETE
  USING (public.is_own_agent(agent_id) OR public.is_admin_or_master(auth.uid()));

-- 4) shift_planner_configs: tighten to owner
DROP POLICY IF EXISTS "Users can view planner configs" ON public.shift_planner_configs;
DROP POLICY IF EXISTS "Users can create planner configs" ON public.shift_planner_configs;
DROP POLICY IF EXISTS "Users can update planner configs" ON public.shift_planner_configs;
DROP POLICY IF EXISTS "Users can delete planner configs" ON public.shift_planner_configs;

CREATE POLICY "Users can view planner configs"
  ON public.shift_planner_configs FOR SELECT
  USING (public.is_own_agent(agent_id) OR public.is_admin_or_master(auth.uid()));
CREATE POLICY "Users can create planner configs"
  ON public.shift_planner_configs FOR INSERT
  WITH CHECK (public.is_own_agent(agent_id) OR public.is_admin_or_master(auth.uid()));
CREATE POLICY "Users can update planner configs"
  ON public.shift_planner_configs FOR UPDATE
  USING (public.is_own_agent(agent_id) OR public.is_admin_or_master(auth.uid()))
  WITH CHECK (public.is_own_agent(agent_id) OR public.is_admin_or_master(auth.uid()));
CREATE POLICY "Users can delete planner configs"
  ON public.shift_planner_configs FOR DELETE
  USING (public.is_own_agent(agent_id) OR public.is_admin_or_master(auth.uid()));

-- 5) shifts: same-unit visibility, owner-only delete
DROP POLICY IF EXISTS "Authenticated users can view shifts" ON public.shifts;
DROP POLICY IF EXISTS "Users can delete own shifts" ON public.shifts;

CREATE POLICY "Same unit can view shifts"
  ON public.shifts FOR SELECT
  USING (public.is_same_unit(agent_id) OR public.is_own_agent(agent_id) OR public.is_admin_or_master(auth.uid()));

CREATE POLICY "Users can delete own shifts"
  ON public.shifts FOR DELETE
  USING (public.is_own_agent(agent_id) OR public.is_admin_or_master(auth.uid()));

-- 6) password_change_requests: tighten to owner
DROP POLICY IF EXISTS "Agents can view their own password requests" ON public.password_change_requests;
DROP POLICY IF EXISTS "Agents can create password requests" ON public.password_change_requests;

CREATE POLICY "Agents can view their own password requests"
  ON public.password_change_requests FOR SELECT
  USING (public.is_own_agent(agent_id) OR public.is_admin_or_master(auth.uid()));
CREATE POLICY "Agents can create password requests"
  ON public.password_change_requests FOR INSERT
  WITH CHECK (public.is_own_agent(agent_id) OR public.is_admin_or_master(auth.uid()));

-- 7) chat_room_members: self-only join/leave
DROP POLICY IF EXISTS "Users can join chat rooms" ON public.chat_room_members;
DROP POLICY IF EXISTS "Users can leave chat rooms" ON public.chat_room_members;

CREATE POLICY "Users can join chat rooms"
  ON public.chat_room_members FOR INSERT
  WITH CHECK (public.is_own_agent(agent_id) OR public.is_admin_or_master(auth.uid()));
CREATE POLICY "Users can leave chat rooms"
  ON public.chat_room_members FOR DELETE
  USING (public.is_own_agent(agent_id) OR public.is_admin_or_master(auth.uid()));

-- 8) transfer_requests: only for own agent (INSERT)
DROP POLICY IF EXISTS "Authenticated users can create transfer requests" ON public.transfer_requests;
CREATE POLICY "Authenticated users can create transfer requests"
  ON public.transfer_requests FOR INSERT
  WITH CHECK (public.is_own_agent(agent_id) OR public.is_admin_or_master(auth.uid()));

-- 9) storage.avatars: drop broad duplicate policies
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
-- keep 'Users can upload their own avatar', 'Users can update their own avatar', 'Users can delete their own avatar' (folder-scoped)
-- keep 'Avatar images are publicly accessible' / 'Public can read avatars'

-- 10) storage.ads: restrict writes to admins with manage_ads permission
DROP POLICY IF EXISTS "Authenticated users can upload ads media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update ads media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete ads media" ON storage.objects;

CREATE POLICY "Admins can upload ads media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'ads'
    AND (public.is_admin_or_master(auth.uid()) OR public.has_admin_permission(auth.uid(), 'manage_ads'))
  );
CREATE POLICY "Admins can update ads media"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'ads'
    AND (public.is_admin_or_master(auth.uid()) OR public.has_admin_permission(auth.uid(), 'manage_ads'))
  );
CREATE POLICY "Admins can delete ads media"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'ads'
    AND (public.is_admin_or_master(auth.uid()) OR public.has_admin_permission(auth.uid(), 'manage_ads'))
  );
