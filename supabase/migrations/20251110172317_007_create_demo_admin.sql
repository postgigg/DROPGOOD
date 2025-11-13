/*
  # Create Demo Admin Account

  ## Overview
  Creates a demo admin user for testing the manual operations system.

  ## Details
  - Email: admin@dropgood.com
  - Password: Demo123!
  - Name: Demo Admin

  ## Security Note
  This is a demo account for testing purposes. In production, change this password immediately.
*/

-- Create auth user (using raw_user_meta_data to set initial values)
-- Note: We need to use a specific user ID that we can reference
DO $$
DECLARE
  admin_user_id uuid := '11111111-1111-1111-1111-111111111111';
BEGIN
  -- Insert into auth.users if not exists
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
  )
  ON CONFLICT (id) DO NOTHING;

  -- Insert into admin_users table
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