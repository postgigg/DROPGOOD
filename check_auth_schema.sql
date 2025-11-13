-- Check if auth schema exists and what tables are in it
SELECT schemaname, tablename
FROM pg_tables
WHERE schemaname = 'auth'
ORDER BY tablename;

-- Check if admin_users exists
SELECT EXISTS (
  SELECT 1
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'admin_users'
) as admin_users_exists;

-- Check auth.users table structure
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'auth'
AND table_name = 'users'
ORDER BY ordinal_position;
