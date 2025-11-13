-- Run this in Supabase SQL Editor to diagnose auth issues
-- https://supabase.com/dashboard/project/uhtkemafphcegmabyfyj/sql/new

-- Check if auth schema exists
SELECT 'Auth schema exists' as check_name,
       EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth') as result;

-- Check auth tables
SELECT 'Auth tables' as check_name, tablename
FROM pg_tables
WHERE schemaname = 'auth'
ORDER BY tablename;

-- Check auth.users columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'auth' AND table_name = 'users'
ORDER BY ordinal_position;

-- Try to count users
SELECT 'User count' as check_name, COUNT(*)::text as result FROM auth.users;

-- Check for any auth users
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
LIMIT 5;

-- Check extensions
SELECT extname, extversion
FROM pg_extension
WHERE extname IN ('pgcrypto', 'uuid-ossp', 'pgjwt');
