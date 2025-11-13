/*
  # Fix incomplete schema from previous deployments

  ## Problem
  Several tables exist on the remote database but are missing columns,
  causing migration failures when trying to create indexes or foreign keys.

  ## Solution
  Add all missing columns if they don't exist and ensure indexes are created safely.
*/

-- Fix admin_logs table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_logs' AND column_name = 'admin_user_id'
  ) THEN
    ALTER TABLE admin_logs ADD COLUMN admin_user_id UUID REFERENCES users(id);
  END IF;
END $$;

-- Fix donation_center_users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'donation_center_users' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE donation_center_users ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes safely (only if columns exist)
DO $$
BEGIN
  -- admin_logs indexes
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_logs' AND column_name = 'admin_user_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_user_id);
  END IF;

  CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at DESC);

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
