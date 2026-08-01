-- 1. Create the custom role type
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'shipper', 'transporter', 'customer');

-- 2. Create the profiles table linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  role user_role default 'customer'::user_role not null,
  full_name text,
  phone_number text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable Row Level Security (RLS) on the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for the profiles table

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING ( auth.uid() = id );

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING ( auth.uid() = id );

-- 5. Create a secure function to check if the current user is an owner
-- This avoids needing to join the profiles table repeatedly in other RLS policies
CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'owner'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Example: Restricting an Admin or Analytics table to Owners ONLY
-- Assume you have a table `system_analytics`
-- ALTER TABLE public.system_analytics ENABLE ROW LEVEL SECURITY;
-- 
-- CREATE POLICY "Only owners can view system analytics"
-- ON system_analytics FOR SELECT
-- USING ( public.is_owner() );
-- 
-- CREATE POLICY "Only owners can insert system analytics"
-- ON system_analytics FOR INSERT
-- WITH CHECK ( public.is_owner() );

-- 7. Trigger to automatically create a profile record when a new Supabase user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'customer');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if trigger exists before creating
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 8. Enable RLS on all Prisma tables to prevent direct access via Supabase REST API
-- The Express API uses Prisma with the postgres user, which bypasses RLS.
-- This ensures the frontend Anon Key cannot read/write sensitive data.
DO $$
DECLARE
    table_name text;
BEGIN
    FOR table_name IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename != 'spatial_ref_sys'
        AND tablename NOT LIKE 'pg_%'
        AND tablename NOT LIKE 'sql_%'
    )
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', table_name);
    END LOOP;
END
$$;
