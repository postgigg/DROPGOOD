# Create Admin Account

Since Supabase Auth requires proper password hashing, you'll need to create the admin account through one of these methods:

## Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **Authentication > Users**
3. Click **Add User**
4. Fill in:
   - Email: `admin@dropgood.com`
   - Password: `Demo123!`
   - Check "Auto Confirm User"
5. Click **Create User**
6. Copy the User ID from the created user
7. Go to **SQL Editor** and run:

```sql
-- Replace USER_ID_HERE with the actual UUID from step 6
INSERT INTO admin_users (id, email, name, phone, notification_preferences)
VALUES (
  'USER_ID_HERE',
  'admin@dropgood.com',
  'Demo Admin',
  '+15555551234',
  '{"email": true, "sms": false}'::jsonb
);
```

## Option 2: Using the App Signup Flow

1. Go to `/admin/login` in your app
2. Unfortunately, there's no signup page yet. Let me create one for you...

## Option 3: Direct SQL (Advanced)

Run this in your Supabase SQL Editor:

```sql
-- This creates a user with a known UUID
DO $$
DECLARE
  admin_user_id uuid := gen_random_uuid();
  hashed_password text;
BEGIN
  -- Hash the password (Demo123!)
  hashed_password := crypt('Demo123!', gen_salt('bf'));

  -- Insert into auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_sent_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    admin_user_id,
    'authenticated',
    'authenticated',
    'admin@dropgood.com',
    hashed_password,
    NOW(),
    '',
    '',
    '',
    '',
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{}'::jsonb,
    false,
    NOW()
  );

  -- Insert into admin_users
  INSERT INTO admin_users (
    id,
    email,
    name,
    phone,
    notification_preferences
  ) VALUES (
    admin_user_id,
    'admin@dropgood.com',
    'Demo Admin',
    '+15555551234',
    '{"email": true, "sms": false}'::jsonb
  );

  -- Output the user ID for reference
  RAISE NOTICE 'Admin user created with ID: %', admin_user_id;
END $$;
```

After running this, you can login with:
- Email: `admin@dropgood.com`
- Password: `Demo123!`
