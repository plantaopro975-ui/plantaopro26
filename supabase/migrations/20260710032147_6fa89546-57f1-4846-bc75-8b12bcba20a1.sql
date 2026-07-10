
CREATE OR REPLACE FUNCTION public.list_units_basic()
RETURNS TABLE(
  id uuid,
  name text,
  municipality text,
  director_name text,
  coordinator_name text,
  address text,
  email text,
  phone text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT u.id, u.name, u.municipality, u.director_name, u.coordinator_name, u.address, u.email, u.phone
  FROM public.units u
  ORDER BY u.municipality, u.name;
$$;

GRANT EXECUTE ON FUNCTION public.list_units_basic() TO anon, authenticated, service_role;
