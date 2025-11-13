# 🔥 URGENT DATABASE FIX - READ THIS NOW

## The Problem
Your Supabase database is **missing the `admin_users` table**, which is causing the 500 error when trying to log in.

## The Solution (Takes 2 minutes)

### Option 1: Use Supabase SQL Editor (RECOMMENDED - EASIEST)

1. **Open your Supabase SQL Editor**:
   👉 https://supabase.com/dashboard/project/lyftztgccfslwmdgpslt/sql/new

2. **Copy ALL the code from `fix_database_schema.sql`** (it's in this same folder)

3. **Paste it into the SQL editor**

4. **Click the "Run" button** (or press Cmd+Enter)

5. **Refresh your admin login page** and try logging in again with:
   - Email: `admin@dropgood.com`
   - Password: `Demo123!`

---

### Option 2: Quick Copy-Paste (if you can't open the file)

Just copy this entire block and paste it into the Supabase SQL Editor:

\`\`\`sql
-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  phone text,
  notification_preferences jsonb DEFAULT '{"email": true, "sms": false}'::jsonb,
  created_at timestamptz DEFAULT now(),
  last_login_at timestamptz
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Admins can read own profile" ON admin_users;
DROP POLICY IF EXISTS "Admins can update own profile" ON admin_users;

CREATE POLICY "Admins can read own profile"
  ON admin_users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can update own profile"
  ON admin_users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create demo admin
DO $$
DECLARE
  admin_user_id uuid := '11111111-1111-1111-1111-111111111111';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = admin_user_id) THEN
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
\`\`\`

---

## After Running the SQL

1. Go back to your app: http://localhost:5173/admin/login
2. Log in with:
   - Email: `admin@dropgood.com`
   - Password: `Demo123!`

**The error should be GONE!**

---

## Why This Happened

Your remote Supabase database had incomplete migrations. The CLI commands were timing out, so we need to apply this critical fix manually through the web dashboard.
