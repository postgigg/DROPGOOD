-- DIAGNOSIS: What's actually broken in the auth system?
-- Run this to see what the real problem is

-- 1. Check if auth schema exists
SELECT 'Auth schema exists:' as check,
       EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth') as result;

-- 2. Check critical auth tables
SELECT 'auth.users table exists:' as check,
       EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') as result
UNION ALL
SELECT 'auth.identities table exists:',
       EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'identities')
UNION ALL
SELECT 'auth.sessions table exists:',
       EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'sessions')
UNION ALL
SELECT 'auth.refresh_tokens table exists:',
       EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'refresh_tokens');

-- 3. Check if auth.users has the expected structure
SELECT 'auth.users column count:' as check,
       COUNT(*)::text as result
FROM information_schema.columns
WHERE table_schema = 'auth' AND table_name = 'users';

-- 4. List all columns in auth.users to see if any are missing
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'auth' AND table_name = 'users'
ORDER BY ordinal_position;

-- 5. Check for any broken triggers on auth.users
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth' AND event_object_table = 'users';

-- 6. Check if there are any RLS policies causing issues
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'auth';

-- 7. Try to count users in auth.users (this might fail and show us the error)
SELECT 'Total users in auth.users:' as info, COUNT(*)::text as count FROM auth.users;
