-- ==================================================
-- CREATE NEW ADMIN USER
-- Run this in: https://supabase.com/dashboard/project/uhtkemafphcegmabyfyj/sql/new
-- ==================================================

DO $$
DECLARE
  admin_user_id uuid := gen_random_uuid();
  admin_email text := 'superadmin@dropgood.app';
  admin_password text := 'DropGood2024Admin!';
BEGIN
  -- Delete if exists
  DELETE FROM auth.users WHERE email = admin_email;
  DELETE FROM admin_users WHERE email = admin_email;

  -- Create auth user
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_sent_at,
    recovery_sent_at,
    email_change_sent_at,
    is_sso_user
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    admin_user_id,
    'authenticated',
    'authenticated',
    admin_email,
    crypt(admin_password, gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    FALSE,
    NOW(),
    NOW(),
    NOW(),
    FALSE
  );

  -- Create admin_users entry
  INSERT INTO admin_users (id, email, name, notification_preferences)
  VALUES (
    admin_user_id,
    admin_email,
    'Super Admin',
    '{"email": true, "sms": false}'::jsonb
  );

  RAISE NOTICE '==============================================';
  RAISE NOTICE 'NEW ADMIN CREATED!';
  RAISE NOTICE 'Email: %', admin_email;
  RAISE NOTICE 'Password: %', admin_password;
  RAISE NOTICE 'User ID: %', admin_user_id;
  RAISE NOTICE '==============================================';
END $$;
