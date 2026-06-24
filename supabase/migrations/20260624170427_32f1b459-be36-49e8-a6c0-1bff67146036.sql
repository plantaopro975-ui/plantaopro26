-- Wipe old master sessions and master admin accounts
DELETE FROM public.master_session_tokens;
DELETE FROM public.master_admin;

-- Insert unified super-user account (bcrypt via pgcrypto in extensions schema)
INSERT INTO public.master_admin (username, password_hash)
VALUES (
  'francdenisbr@gmail.com',
  extensions.crypt('FrancDnis@2026', extensions.gen_salt('bf', 10))
);