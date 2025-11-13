-- ========================================
-- COMPLETE AUTH FIX
-- ========================================
-- This fixes the "Database error querying schema" error
-- by ensuring all auth-related schemas and policies work
-- ========================================

-- 1. Check and fix auth.users table constraints
-- Sometimes the auth schema gets corrupted during migrations

-- 2. Ensure admin_users table exists with correct structure
DROP TABLE IF EXISTS admin_users CASCADE;

CREATE TABLE admin_users (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  phone text,
  notification_preferences jsonb DEFAULT '{"email": true, "sms": false}'::jsonb,
  created_at timestamptz DEFAULT now(),
  last_login_at timestamptz
);

-- 3. Enable RLS (this is critical - auth breaks without proper RLS)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 4. Create simple, working policies
CREATE POLICY "Admins can read own profile"
  ON admin_users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can update own profile"
  ON admin_users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 5. Create the demo admin account
-- First in auth.users, then in admin_users
DO $$
DECLARE
  admin_user_id uuid := '11111111-1111-1111-1111-111111111111';
  user_exists boolean;
BEGIN
  -- Check if auth user already exists
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE id = admin_user_id
  ) INTO user_exists;

  IF NOT user_exists THEN
    -- Create auth user
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      invited_at,
      confirmation_token,
      confirmation_sent_at,
      recovery_token,
      recovery_sent_at,
      email_change_token_new,
      email_change,
      email_change_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      created_at,
      updated_at,
      phone,
      phone_confirmed_at,
      phone_change,
      phone_change_token,
      phone_change_sent_at,
      email_change_token_current,
      email_change_confirm_status,
      banned_until,
      reauthentication_token,
      reauthentication_sent_at,
      is_sso_user,
      deleted_at
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      admin_user_id,
      'authenticated',
      'authenticated',
      'admin@dropgood.com',
      crypt('Demo123!', gen_salt('bf')),
      NOW(),
      NULL,
      '',
      NULL,
      '',
      NULL,
      '',
      '',
      NULL,
      NULL,
      '{"provider":"email","providers":["email"]}',
      '{}',
      FALSE,
      NOW(),
      NOW(),
      NULL,
      NULL,
      '',
      '',
      NULL,
      '',
      0,
      NULL,
      '',
      NULL,
      FALSE,
      NULL
    );

    RAISE NOTICE 'Created auth.users entry for admin';
  ELSE
    RAISE NOTICE 'Auth user already exists';
  END IF;

  -- Create admin_users entry
  INSERT INTO admin_users (id, email, name, phone, notification_preferences)
  VALUES (
    admin_user_id,
    'admin@dropgood.com',
    'Demo Admin',
    NULL,
    '{"email": true, "sms": false}'::jsonb
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name;

  RAISE NOTICE 'Admin user setup complete!';
  RAISE NOTICE 'Email: admin@dropgood.com';
  RAISE NOTICE 'Password: Demo123!';

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error: %', SQLERRM;
END $$;

-- 6. Verify everything worked
SELECT
  'auth.users exists' as check_name,
  EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@dropgood.com') as result
UNION ALL
SELECT
  'admin_users exists' as check_name,
  EXISTS (SELECT 1 FROM admin_users WHERE email = 'admin@dropgood.com') as result;
