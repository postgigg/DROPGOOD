-- Function to create admin users from the frontend
-- This bypasses RLS issues by using SECURITY DEFINER

CREATE OR REPLACE FUNCTION create_admin_user(
  admin_email text,
  admin_password text,
  admin_name text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  new_user_id := gen_random_uuid();

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
    email_change_sent_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
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
    NOW()
  );

  -- Create admin_users entry
  INSERT INTO admin_users (id, email, name, notification_preferences)
  VALUES (new_user_id, admin_email, admin_name, '{"email": true, "sms": false}'::jsonb);

  RETURN json_build_object('success', true, 'user_id', new_user_id);
END;
$$;
