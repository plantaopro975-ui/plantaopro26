
-- ============================================================
-- 1) access_logs: append-only + delete only for master/admin
-- ============================================================
DROP POLICY IF EXISTS "Users can delete own access logs" ON public.access_logs;

CREATE POLICY "Only admins can delete access logs"
  ON public.access_logs
  FOR DELETE
  TO authenticated
  USING (public.is_admin_or_master(auth.uid()));

-- No UPDATE policy => updates blocked by default (append-only audit)

-- ============================================================
-- 2) activity_logs: append-only (no UPDATE policy exists → good).
--    Ensure DELETE is admin/master only (already is).
-- ============================================================
-- No changes needed; policies already correct.

-- ============================================================
-- 3) login_attempts: restrict SELECT to master/admin only
-- ============================================================
DROP POLICY IF EXISTS "No public access to login attempts" ON public.login_attempts;

CREATE POLICY "Only admins can view login attempts"
  ON public.login_attempts
  FOR SELECT
  TO authenticated
  USING (public.is_admin_or_master(auth.uid()));

CREATE POLICY "Only admins can delete login attempts"
  ON public.login_attempts
  FOR DELETE
  TO authenticated
  USING (public.is_admin_or_master(auth.uid()));

-- No INSERT/UPDATE policies => inserts only happen through
-- SECURITY DEFINER function record_login_attempt(); updates blocked.

-- ============================================================
-- 4) cpf_change_log: no UPDATE / no DELETE policies => append-only.
--    SELECT/INSERT already restricted to admin/master (kept as is).
-- ============================================================

-- ============================================================
-- 5) admin_announcements: reaffirm management is admin/master only.
--    Also block anonymous SELECT explicitly (only authenticated).
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can view active announcements" ON public.admin_announcements;

CREATE POLICY "Authenticated users can view active announcements"
  ON public.admin_announcements
  FOR SELECT
  TO authenticated
  USING (
    is_active = true
    AND starts_at <= now()
    AND (expires_at IS NULL OR expires_at > now())
  );

-- ============================================================
-- 6) Ensure privileged grants are correctly scoped
-- ============================================================
REVOKE ALL ON public.login_attempts FROM anon;
REVOKE ALL ON public.access_logs FROM anon;
REVOKE ALL ON public.activity_logs FROM anon;
REVOKE ALL ON public.cpf_change_log FROM anon;
REVOKE ALL ON public.admin_permissions FROM anon;
REVOKE ALL ON public.user_roles FROM anon;

GRANT SELECT ON public.login_attempts TO authenticated;
GRANT SELECT ON public.access_logs TO authenticated;
GRANT INSERT ON public.access_logs TO authenticated;
GRANT DELETE ON public.access_logs TO authenticated;
GRANT SELECT ON public.activity_logs TO authenticated;
GRANT INSERT ON public.activity_logs TO authenticated;
GRANT DELETE ON public.activity_logs TO authenticated;

-- Service role keeps full access for edge functions
GRANT ALL ON public.login_attempts TO service_role;
GRANT ALL ON public.access_logs TO service_role;
GRANT ALL ON public.activity_logs TO service_role;
GRANT ALL ON public.cpf_change_log TO service_role;
GRANT ALL ON public.admin_permissions TO service_role;
GRANT ALL ON public.user_roles TO service_role;
