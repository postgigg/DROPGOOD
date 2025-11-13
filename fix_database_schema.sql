-- ========================================
-- EMERGENCY FIX FOR DATABASE SCHEMA
-- ========================================
-- This script fixes the incomplete schema on the remote Supabase database
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/lyftztgccfslwmdgpslt/sql
--
-- This will:
-- 1. Create the admin_users table if it doesn't exist
-- 2. Create the demo admin account for testing
-- 3. Fix any missing columns in existing tables
-- ========================================

-- Create admin_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  phone text,
  notification_preferences jsonb DEFAULT '{"email": true, "sms": false}'::jsonb,
  created_at timestamptz DEFAULT now(),
  last_login_at timestamptz
);

-- Enable RLS on admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can read own profile" ON admin_users;
DROP POLICY IF EXISTS "Admins can update own profile" ON admin_users;

-- Admin users can read their own profile
CREATE POLICY "Admins can read own profile"
  ON admin_users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Admin users can update their own profile
CREATE POLICY "Admins can update own profile"
  ON admin_users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create demo admin user if it doesn't exist
DO $$
DECLARE
  admin_user_id uuid := '11111111-1111-1111-1111-111111111111';
BEGIN
  -- First, check if the auth user exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = admin_user_id) THEN
    -- Insert into auth.users
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role,
      aud
    )
    VALUES (
      admin_user_id,
      '00000000-0000-0000-0000-000000000000',
      'admin@dropgood.com',
      crypt('Demo123!', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Demo Admin"}',
      false,
      'authenticated',
      'authenticated'
    );
  END IF;

  -- Insert into admin_users table if not exists
  INSERT INTO admin_users (
    id,
    email,
    name,
    notification_preferences
  )
  VALUES (
    admin_user_id,
    'admin@dropgood.com',
    'Demo Admin',
    '{"email": true, "sms": false}'::jsonb
  )
  ON CONFLICT (id) DO NOTHING;

END $$;

-- Fix admin_logs table if needed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_logs' AND column_name = 'admin_user_id'
  ) THEN
    ALTER TABLE admin_logs ADD COLUMN admin_user_id UUID REFERENCES users(id);
  END IF;
END $$;

-- Fix donation_center_users table if needed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'donation_center_users' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE donation_center_users ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes safely
DO $$
BEGIN
  -- admin_logs indexes
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_logs' AND column_name = 'admin_user_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_user_id);
  END IF;

  -- admin_users index
  CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

  -- donation_center_users indexes
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'donation_center_users' AND column_name = 'user_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_dc_users_user_id ON donation_center_users(user_id);
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'donation_center_users' AND column_name = 'email'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_dc_users_email ON donation_center_users(email);
  END IF;
END $$;

-- Verify the setup
DO $$
DECLARE
  admin_count integer;
BEGIN
  SELECT COUNT(*) INTO admin_count FROM admin_users WHERE email = 'admin@dropgood.com';
  RAISE NOTICE 'Admin users created: %', admin_count;

  IF admin_count > 0 THEN
    RAISE NOTICE 'SUCCESS: Demo admin account is ready!';
    RAISE NOTICE 'Email: admin@dropgood.com';
    RAISE NOTICE 'Password: Demo123!';
  ELSE
    RAISE WARNING 'FAILED: Demo admin account was not created';
  END IF;
END $$;
