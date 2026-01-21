-- Fix Master session creation: token rows should not depend on auth.users
-- The master login is validated via public.master_admin, not via a real auth user.
-- Therefore the FK to auth.users blocks session token creation.

ALTER TABLE public.master_session_tokens
  DROP CONSTRAINT IF EXISTS master_session_tokens_user_id_fkey;

-- Keep user_id as informational only (no FK).