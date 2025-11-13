/*
  # Donation Center Dashboard & Sponsorship System

  ## Overview
  This migration enables donation centers to:
  - Create their own accounts
  - Manage their locations
  - Create sponsorship campaigns to subsidize pickup costs for users
  - Track credit usage and auto-recharge when threshold is met

  ## New Tables

  ### `donation_center_users`
  - User accounts for donation center administrators
  - Links to auth.users table
  - Can manage one or multiple donation centers

  ### `sponsorships`
  - Campaign details for subsidizing pickup costs
  - Geographic targeting (center point + radius)
  - Subsidy percentage (0-100%)
  - Budget tracking (initial amount, remaining credit)
  - Auto-recharge settings

  ### `sponsorship_transactions`
  - Tracks each deduction from sponsorship credit
  - Links to bookings
  - Records amount deducted and timestamp

  ### `sponsorship_recharges`
  - Records automatic and manual recharges
  - Tracks payment method and status

  ## Security
  - RLS enabled on all tables
  - Donation centers can only manage their own data
  - Users can view active sponsorships for pricing calculation
*/

-- Create donation center users table
CREATE TABLE IF NOT EXISTS donation_center_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  organization_name text NOT NULL,
  contact_name text NOT NULL,
  phone text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  UNIQUE(user_id)
);

-- Add owner tracking to donation_centers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'donation_centers' AND column_name = 'owner_user_id'
  ) THEN
    ALTER TABLE donation_centers 
    ADD COLUMN owner_user_id uuid REFERENCES donation_center_users(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'donation_centers' AND column_name = 'is_verified'
  ) THEN
    ALTER TABLE donation_centers 
    ADD COLUMN is_verified boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'donation_centers' AND column_name = 'created_by_owner'
  ) THEN
    ALTER TABLE donation_centers 
    ADD COLUMN created_by_owner boolean DEFAULT false;
  END IF;
END $$;

-- Create sponsorships table
CREATE TABLE IF NOT EXISTS sponsorships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_center_id uuid REFERENCES donation_centers(id) ON DELETE CASCADE NOT NULL,
  owner_user_id uuid REFERENCES donation_center_users(id) ON DELETE CASCADE NOT NULL,
  
  -- Campaign details
  name text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  
  -- Geographic targeting
  target_latitude decimal(10, 8) NOT NULL,
  target_longitude decimal(11, 8) NOT NULL,
  target_radius_miles decimal(5, 2) NOT NULL CHECK (target_radius_miles > 0),
  
  -- Subsidy details
  subsidy_percentage integer NOT NULL CHECK (subsidy_percentage >= 0 AND subsidy_percentage <= 100),
  
  -- Budget tracking
  initial_credit_amount decimal(10, 2) NOT NULL CHECK (initial_credit_amount > 0),
  current_credit_balance decimal(10, 2) NOT NULL DEFAULT 0,
  total_spent decimal(10, 2) DEFAULT 0,
  
  -- Auto-recharge settings
  auto_recharge_enabled boolean DEFAULT false,
  auto_recharge_threshold decimal(10, 2) DEFAULT 250,
  auto_recharge_amount decimal(10, 2),
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  starts_at timestamptz DEFAULT now(),
  ends_at timestamptz,
  
  -- Constraints
  CHECK (current_credit_balance >= 0),
  CHECK (auto_recharge_amount IS NULL OR auto_recharge_amount > 0)
);

-- Create sponsorship transactions table
CREATE TABLE IF NOT EXISTS sponsorship_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsorship_id uuid REFERENCES sponsorships(id) ON DELETE CASCADE NOT NULL,
  booking_id text REFERENCES bookings(id) ON DELETE SET NULL,
  
  -- Transaction details
  original_price decimal(10, 2) NOT NULL,
  subsidy_amount decimal(10, 2) NOT NULL,
  customer_paid_amount decimal(10, 2) NOT NULL,
  subsidy_percentage integer NOT NULL,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  
  -- Constraints
  CHECK (subsidy_amount >= 0),
  CHECK (customer_paid_amount >= 0),
  CHECK (original_price = subsidy_amount + customer_paid_amount)
);

-- Create sponsorship recharges table
CREATE TABLE IF NOT EXISTS sponsorship_recharges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsorship_id uuid REFERENCES sponsorships(id) ON DELETE CASCADE NOT NULL,
  
  -- Recharge details
  amount decimal(10, 2) NOT NULL CHECK (amount > 0),
  is_automatic boolean DEFAULT false,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  
  -- Payment tracking
  stripe_payment_intent_id text,
  payment_method text,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  notes text
);

-- Create indexes for performance (only if columns exist)
DO $$
BEGIN
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

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'donation_centers' AND column_name = 'owner_user_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_dc_owner ON donation_centers(owner_user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_sponsorships_dc ON sponsorships(donation_center_id);
CREATE INDEX IF NOT EXISTS idx_sponsorships_owner ON sponsorships(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_sponsorships_active ON sponsorships(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_sponsorship_txns_sponsorship ON sponsorship_transactions(sponsorship_id);
CREATE INDEX IF NOT EXISTS idx_sponsorship_txns_booking ON sponsorship_transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_sponsorship_recharges_sponsorship ON sponsorship_recharges(sponsorship_id);

-- Enable Row Level Security
ALTER TABLE donation_center_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsorship_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsorship_recharges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for donation_center_users
CREATE POLICY "Donation center users can view own profile"
  ON donation_center_users FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Donation center users can update own profile"
  ON donation_center_users FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can create donation center user account"
  ON donation_center_users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for donation_centers (updated for ownership)
CREATE POLICY "Owners can manage their donation centers"
  ON donation_centers FOR ALL
  TO authenticated
  USING (
    owner_user_id IN (
      SELECT id FROM donation_center_users WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for sponsorships
CREATE POLICY "Owners can view their sponsorships"
  ON sponsorships FOR SELECT
  TO authenticated
  USING (
    owner_user_id IN (
      SELECT id FROM donation_center_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can create sponsorships"
  ON sponsorships FOR INSERT
  TO authenticated
  WITH CHECK (
    owner_user_id IN (
      SELECT id FROM donation_center_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update their sponsorships"
  ON sponsorships FOR UPDATE
  TO authenticated
  USING (
    owner_user_id IN (
      SELECT id FROM donation_center_users WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    owner_user_id IN (
      SELECT id FROM donation_center_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can delete their sponsorships"
  ON sponsorships FOR DELETE
  TO authenticated
  USING (
    owner_user_id IN (
      SELECT id FROM donation_center_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view active sponsorships for pricing"
  ON sponsorships FOR SELECT
  TO public
  USING (is_active = true AND current_credit_balance > 0);

-- RLS Policies for sponsorship_transactions
CREATE POLICY "Owners can view their sponsorship transactions"
  ON sponsorship_transactions FOR SELECT
  TO authenticated
  USING (
    sponsorship_id IN (
      SELECT id FROM sponsorships 
      WHERE owner_user_id IN (
        SELECT id FROM donation_center_users WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "System can create sponsorship transactions"
  ON sponsorship_transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for sponsorship_recharges
CREATE POLICY "Owners can view their recharges"
  ON sponsorship_recharges FOR SELECT
  TO authenticated
  USING (
    sponsorship_id IN (
      SELECT id FROM sponsorships 
      WHERE owner_user_id IN (
        SELECT id FROM donation_center_users WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Owners can create recharges"
  ON sponsorship_recharges FOR INSERT
  TO authenticated
  WITH CHECK (
    sponsorship_id IN (
      SELECT id FROM sponsorships 
      WHERE owner_user_id IN (
        SELECT id FROM donation_center_users WHERE user_id = auth.uid()
      )
    )
  );

-- Function to find applicable sponsorship for a booking
CREATE OR REPLACE FUNCTION find_applicable_sponsorship(
  p_donation_center_id uuid,
  p_user_latitude decimal,
  p_user_longitude decimal
)
RETURNS TABLE (
  sponsorship_id uuid,
  subsidy_percentage integer,
  current_credit_balance decimal
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.subsidy_percentage,
    s.current_credit_balance
  FROM sponsorships s
  WHERE 
    s.donation_center_id = p_donation_center_id
    AND s.is_active = true
    AND s.current_credit_balance > 0
    AND (s.ends_at IS NULL OR s.ends_at > now())
    AND s.starts_at <= now()
    -- Check if user location is within sponsorship radius
    AND (
      3959 * acos(
        cos(radians(p_user_latitude)) * 
        cos(radians(s.target_latitude)) * 
        cos(radians(s.target_longitude) - radians(p_user_longitude)) + 
        sin(radians(p_user_latitude)) * 
        sin(radians(s.target_latitude))
      )
    ) <= s.target_radius_miles
  ORDER BY s.subsidy_percentage DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to deduct sponsorship credit
CREATE OR REPLACE FUNCTION deduct_sponsorship_credit(
  p_sponsorship_id uuid,
  p_booking_id text,
  p_original_price decimal,
  p_subsidy_amount decimal,
  p_customer_paid_amount decimal,
  p_subsidy_percentage integer
)
RETURNS boolean AS $$
DECLARE
  v_current_balance decimal;
  v_new_balance decimal;
BEGIN
  SELECT current_credit_balance INTO v_current_balance
  FROM sponsorships
  WHERE id = p_sponsorship_id
  FOR UPDATE;
  
  IF v_current_balance < p_subsidy_amount THEN
    RETURN false;
  END IF;
  
  v_new_balance := v_current_balance - p_subsidy_amount;
  
  UPDATE sponsorships
  SET 
    current_credit_balance = v_new_balance,
    total_spent = total_spent + p_subsidy_amount,
    updated_at = now()
  WHERE id = p_sponsorship_id;
  
  INSERT INTO sponsorship_transactions (
    sponsorship_id,
    booking_id,
    original_price,
    subsidy_amount,
    customer_paid_amount,
    subsidy_percentage
  ) VALUES (
    p_sponsorship_id,
    p_booking_id,
    p_original_price,
    p_subsidy_amount,
    p_customer_paid_amount,
    p_subsidy_percentage
  );
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add sponsorship tracking to bookings table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'sponsorship_id'
  ) THEN
    ALTER TABLE bookings
    ADD COLUMN sponsorship_id uuid REFERENCES sponsorships(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'original_price'
  ) THEN
    ALTER TABLE bookings
    ADD COLUMN original_price decimal(10, 2);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'subsidy_amount'
  ) THEN
    ALTER TABLE bookings
    ADD COLUMN subsidy_amount decimal(10, 2) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'subsidy_percentage'
  ) THEN
    ALTER TABLE bookings
    ADD COLUMN subsidy_percentage integer DEFAULT 0;
  END IF;
END $$;