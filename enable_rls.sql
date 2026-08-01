-- Enable RLS on all public schema tables to prevent unauthorized direct access via the Supabase Anon Key.
-- This forces all queries to go through the Express backend, which has the necessary bypass capabilities via Prisma.

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
