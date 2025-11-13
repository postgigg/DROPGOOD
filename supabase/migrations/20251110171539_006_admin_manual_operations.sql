/*
  # Admin Manual Operations System

  ## Overview
  This migration adds support for manual operations mode while preserving Uber Direct integration.
  Allows admin staff to manually manage bookings, input driver details, and track delivery progress.

  ## New Tables
  
  ### `admin_users`
  - `id` (uuid, primary key) - Unique admin identifier
  - `email` (text, unique) - Admin email for authentication
  - `name` (text) - Admin full name
  - `phone` (text, nullable) - Admin phone for notifications
  - `notification_preferences` (jsonb) - Preferences for booking alerts
  - `created_at` (timestamptz) - Account creation timestamp
  - `last_login_at` (timestamptz, nullable) - Last login timestamp
  
  ### `manual_operations`
  - `id` (uuid, primary key) - Unique operation record
  - `booking_id` (text, foreign key) - Reference to booking
  - `admin_user_id` (uuid, foreign key) - Admin who performed action
  - `action_type` (text) - Type of manual action taken
  - `action_data` (jsonb) - Data related to the action
  - `notes` (text, nullable) - Optional notes from admin
  - `created_at` (timestamptz) - When action was performed

  ## Modified Tables
  
  ### `bookings` - Added columns
  - `manual_mode` (boolean) - Whether booking uses manual operations
  - `driver_name` (text, nullable) - Manually entered driver name
  - `driver_phone` (text, nullable) - Manually entered driver phone
  - `vehicle_make` (text, nullable) - Vehicle make/model
  - `vehicle_color` (text, nullable) - Vehicle color
  - `license_plate` (text, nullable) - Vehicle license plate
  - `manual_eta` (timestamptz, nullable) - Manually set ETA
  - `delivery_photo_url` (text, nullable) - URL to delivery proof photo
  - `actual_cost` (decimal, nullable) - Actual Uber cost (if different from estimate)
  - `cost_adjustment` (decimal, nullable) - Refund/additional charge amount

  ## Storage
  - Creates `delivery-photos` bucket for delivery proof images

  ## Security
  - Enable RLS on all new tables
  - Admin users can only read their own profile
  - Admin users can view all bookings and manual operations
  - Only authenticated admins can insert manual operations
  - Public bucket policy for delivery photos (read-only after upload)

  ## Notes
  1. Manual mode is controlled by application environment variable
  2. All Uber Direct code remains intact, just conditionally executed
  3. Admin notifications configured via environment variables
  4. Delivery photos stored in Supabase Storage for easy access
*/

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

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

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

-- Create manual_operations table (booking_id is text to match bookings table)
CREATE TABLE IF NOT EXISTS manual_operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id text NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  admin_user_id uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  action_data jsonb DEFAULT '{}'::jsonb,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE manual_operations ENABLE ROW LEVEL SECURITY;

-- Admins can view all manual operations
CREATE POLICY "Admins can view all operations"
  ON manual_operations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  );

-- Admins can insert manual operations
CREATE POLICY "Admins can insert operations"
  ON manual_operations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  );

-- Add manual operations columns to bookings table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'manual_mode'
  ) THEN
    ALTER TABLE bookings ADD COLUMN manual_mode boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'driver_name'
  ) THEN
    ALTER TABLE bookings ADD COLUMN driver_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'driver_phone'
  ) THEN
    ALTER TABLE bookings ADD COLUMN driver_phone text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'vehicle_make'
  ) THEN
    ALTER TABLE bookings ADD COLUMN vehicle_make text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'vehicle_color'
  ) THEN
    ALTER TABLE bookings ADD COLUMN vehicle_color text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'license_plate'
  ) THEN
    ALTER TABLE bookings ADD COLUMN license_plate text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'manual_eta'
  ) THEN
    ALTER TABLE bookings ADD COLUMN manual_eta timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'delivery_photo_url'
  ) THEN
    ALTER TABLE bookings ADD COLUMN delivery_photo_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'actual_cost'
  ) THEN
    ALTER TABLE bookings ADD COLUMN actual_cost decimal(10,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'cost_adjustment'
  ) THEN
    ALTER TABLE bookings ADD COLUMN cost_adjustment decimal(10,2);
  END IF;
END $$;

-- Create storage bucket for delivery photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('delivery-photos', 'delivery-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated admins to upload delivery photos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Admins can upload delivery photos'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can upload delivery photos"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = ''delivery-photos'' AND
        EXISTS (
          SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
        )
      )';
  END IF;
END $$;

-- Allow public read access to delivery photos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Public can view delivery photos'
  ) THEN
    EXECUTE 'CREATE POLICY "Public can view delivery photos"
      ON storage.objects FOR SELECT
      TO public
      USING (bucket_id = ''delivery-photos'')';
  END IF;
END $$;