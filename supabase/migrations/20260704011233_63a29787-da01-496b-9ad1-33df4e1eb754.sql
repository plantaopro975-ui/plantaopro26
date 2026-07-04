INSERT INTO public.master_admin (username, password_hash)
VALUES ('franc', extensions.crypt('franc1982', extensions.gen_salt('bf', 10)))
ON CONFLICT (username) DO UPDATE
  SET password_hash = extensions.crypt('franc1982', extensions.gen_salt('bf', 10));