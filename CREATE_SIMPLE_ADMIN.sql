-- ==================================================
-- CREATE ADMIN WITH SIMPLE PASSWORD
-- Run in: https://supabase.com/dashboard/project/uhtkemafphcegmabyfyj/sql/new
-- ==================================================

-- First make sure admin_users table exists
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  phone text,
  notification_preferences jsonb DEFAULT '{"email": true, "sms": false}'::jsonb,
  created_at timestamptz DEFAULT now(),
  last_login_at timestamptz
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read own profile" ON admin_users;
CREATE POLICY "Admins can read own profile" ON admin_users FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update own profile" ON admin_users;
CREATE POLICY "Admins can update own profile" ON admin_users FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Create admin user
DO $$
DECLARE
  admin_user_id uuid := gen_random_uuid();
BEGIN
  -- Clean up any existing
  DELETE FROM auth.users WHERE email = 'admin@example.com';
  DELETE FROM admin_users WHERE email = 'admin@example.com';

  -- Create in auth.users
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin,
    confirmation_sent_at, recovery_sent_at, email_change_sent_at, is_sso_user
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    admin_user_id,
    'authenticated',
    'authenticated',
    'admin@example.com',
    crypt('admin123456', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    FALSE,
    NOW(), NOW(), NOW(), FALSE
  );

  -- Create in admin_users
  INSERT INTO admin_users (id, email, name)
  VALUES (admin_user_id, 'admin@example.com', 'Admin User');

  RAISE NOTICE '========================================';
  RAISE NOTICE 'SUCCESS!';
  RAISE NOTICE 'Email: admin@example.com';
  RAISE NOTICE 'Password: admin123456';
  RAISE NOTICE 'User ID: %', admin_user_id;
  RAISE NOTICE '========================================';
END $$;
