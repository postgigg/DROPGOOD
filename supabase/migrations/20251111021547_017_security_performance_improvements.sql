/*
  # Security and Performance Improvements

  This migration addresses multiple security and performance issues identified by Supabase:

  ## 1. Foreign Key Indexes
  - Add missing indexes on foreign key columns to improve query performance

  ## 2. RLS Policy Optimization
  - Optimize all RLS policies by wrapping auth functions in SELECT to prevent re-evaluation per row

  ## 3. Remove Unused Indexes
  - Remove indexes that are not being used to reduce overhead

  ## 4. Enable RLS on admin_logs
  - Enable RLS on admin_logs table and create appropriate policies

  ## 5. Fix Function Search Paths
  - Set immutable search paths for all custom functions
*/

-- =====================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_bookings_sponsorship_id ON public.bookings(sponsorship_id);
CREATE INDEX IF NOT EXISTS idx_manual_operations_admin_user_id ON public.manual_operations(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_manual_operations_booking_id ON public.manual_operations(booking_id);
CREATE INDEX IF NOT EXISTS idx_referrals_booking_id ON public.referrals(booking_id);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON public.users(referred_by);

-- =====================================================
-- 2. REMOVE UNUSED INDEXES
-- =====================================================

DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_phone;
DROP INDEX IF EXISTS idx_users_referral_code;
DROP INDEX IF EXISTS idx_donation_centers_location;
DROP INDEX IF EXISTS idx_donation_centers_city;
DROP INDEX IF EXISTS idx_bookings_center_id;
DROP INDEX IF EXISTS idx_bookings_status;
DROP INDEX IF EXISTS idx_bookings_scheduled_date;
DROP INDEX IF EXISTS idx_bookings_uber_delivery_id;
DROP INDEX IF EXISTS uber_webhook_logs_delivery_id_idx;
DROP INDEX IF EXISTS idx_ratings_booking_id;
DROP INDEX IF EXISTS idx_ratings_user_id;
DROP INDEX IF EXISTS uber_webhook_logs_event_id_idx;
DROP INDEX IF EXISTS uber_webhook_logs_created_at_idx;
DROP INDEX IF EXISTS idx_referrals_code;
DROP INDEX IF EXISTS idx_referrals_referrer;
DROP INDEX IF EXISTS idx_referrals_referee;
DROP INDEX IF EXISTS idx_bookings_customer_phone;
DROP INDEX IF EXISTS idx_bookings_customer_email;
DROP INDEX IF EXISTS idx_admin_logs_admin_id;
DROP INDEX IF EXISTS idx_admin_logs_created_at;
DROP INDEX IF EXISTS idx_sponsorship_txns_booking;
DROP INDEX IF EXISTS idx_sponsorship_recharges_sponsorship;
DROP INDEX IF EXISTS idx_dc_users_email;
DROP INDEX IF EXISTS idx_dc_owner;
DROP INDEX IF EXISTS idx_sponsorships_dc;
DROP INDEX IF EXISTS idx_sponsorships_active;
DROP INDEX IF EXISTS idx_sponsorship_txns_sponsorship;
DROP INDEX IF EXISTS notification_logs_booking_id_idx;
DROP INDEX IF EXISTS notification_logs_type_idx;
DROP INDEX IF EXISTS notification_logs_sent_at_idx;
DROP INDEX IF EXISTS idx_donation_centers_partner_status;
DROP INDEX IF EXISTS idx_donation_receipts_donation_center_id;

-- =====================================================
-- 3. OPTIMIZE RLS POLICIES (users table)
-- =====================================================

DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;

CREATE POLICY "Users can view own data"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (id = (SELECT auth.uid()));

CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- =====================================================
-- 4. OPTIMIZE RLS POLICIES (ratings table)
-- =====================================================

DROP POLICY IF EXISTS "Users can view own ratings" ON public.ratings;
DROP POLICY IF EXISTS "Users can create ratings" ON public.ratings;

CREATE POLICY "Users can view own ratings"
  ON public.ratings
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can create ratings"
  ON public.ratings
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- =====================================================
-- 5. OPTIMIZE RLS POLICIES (referrals table)
-- =====================================================

DROP POLICY IF EXISTS "Users can view own referrals" ON public.referrals;

CREATE POLICY "Users can view own referrals"
  ON public.referrals
  FOR SELECT
  TO authenticated
  USING (referrer_user_id = (SELECT auth.uid()) OR referee_user_id = (SELECT auth.uid()));

-- =====================================================
-- 6. OPTIMIZE RLS POLICIES (donation_centers table)
-- =====================================================

DROP POLICY IF EXISTS "Owners can manage their donation centers" ON public.donation_centers;

CREATE POLICY "Owners can manage their donation centers"
  ON public.donation_centers
  FOR ALL
  TO authenticated
  USING (owner_user_id = (SELECT auth.uid()));

-- =====================================================
-- 7. OPTIMIZE RLS POLICIES (sponsorships table)
-- =====================================================

DROP POLICY IF EXISTS "Owners can view their sponsorships" ON public.sponsorships;
DROP POLICY IF EXISTS "Owners can create sponsorships" ON public.sponsorships;
DROP POLICY IF EXISTS "Owners can update their sponsorships" ON public.sponsorships;
DROP POLICY IF EXISTS "Owners can delete their sponsorships" ON public.sponsorships;

CREATE POLICY "Owners can view their sponsorships"
  ON public.sponsorships
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM donation_centers dc
      WHERE sponsorships.donation_center_id = dc.id
      AND dc.owner_user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Owners can create sponsorships"
  ON public.sponsorships
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM donation_centers dc
      WHERE sponsorships.donation_center_id = dc.id
      AND dc.owner_user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Owners can update their sponsorships"
  ON public.sponsorships
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM donation_centers dc
      WHERE sponsorships.donation_center_id = dc.id
      AND dc.owner_user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM donation_centers dc
      WHERE sponsorships.donation_center_id = dc.id
      AND dc.owner_user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Owners can delete their sponsorships"
  ON public.sponsorships
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM donation_centers dc
      WHERE sponsorships.donation_center_id = dc.id
      AND dc.owner_user_id = (SELECT auth.uid())
    )
  );

-- =====================================================
-- 8. OPTIMIZE RLS POLICIES (donation_center_users table)
-- =====================================================

DROP POLICY IF EXISTS "Donation center users can view own profile" ON public.donation_center_users;
DROP POLICY IF EXISTS "Donation center users can update own profile" ON public.donation_center_users;
DROP POLICY IF EXISTS "Anyone can create donation center user account" ON public.donation_center_users;

CREATE POLICY "Donation center users can view own profile"
  ON public.donation_center_users
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Donation center users can update own profile"
  ON public.donation_center_users
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Anyone can create donation center user account"
  ON public.donation_center_users
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- =====================================================
-- 9. OPTIMIZE RLS POLICIES (sponsorship_transactions table)
-- =====================================================

DROP POLICY IF EXISTS "Owners can view their sponsorship transactions" ON public.sponsorship_transactions;

CREATE POLICY "Owners can view their sponsorship transactions"
  ON public.sponsorship_transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sponsorships s
      JOIN donation_centers dc ON dc.id = s.donation_center_id
      WHERE sponsorship_transactions.sponsorship_id = s.id
      AND dc.owner_user_id = (SELECT auth.uid())
    )
  );

-- =====================================================
-- 10. OPTIMIZE RLS POLICIES (sponsorship_recharges table)
-- =====================================================

DROP POLICY IF EXISTS "Owners can view their recharges" ON public.sponsorship_recharges;
DROP POLICY IF EXISTS "Owners can create recharges" ON public.sponsorship_recharges;

CREATE POLICY "Owners can view their recharges"
  ON public.sponsorship_recharges
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sponsorships s
      JOIN donation_centers dc ON dc.id = s.donation_center_id
      WHERE sponsorship_recharges.sponsorship_id = s.id
      AND dc.owner_user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Owners can create recharges"
  ON public.sponsorship_recharges
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sponsorships s
      JOIN donation_centers dc ON dc.id = s.donation_center_id
      WHERE sponsorship_recharges.sponsorship_id = s.id
      AND dc.owner_user_id = (SELECT auth.uid())
    )
  );

-- =====================================================
-- 11. OPTIMIZE RLS POLICIES (notification_logs table)
-- =====================================================

DROP POLICY IF EXISTS "Service role can manage notification logs" ON public.notification_logs;

CREATE POLICY "Service role can manage notification logs"
  ON public.notification_logs
  FOR ALL
  TO authenticated
  USING ((SELECT auth.jwt()->>'role') = 'service_role')
  WITH CHECK ((SELECT auth.jwt()->>'role') = 'service_role');

-- =====================================================
-- 12. OPTIMIZE RLS POLICIES (uber_webhook_logs table)
-- =====================================================

DROP POLICY IF EXISTS "Service role can manage webhook logs" ON public.uber_webhook_logs;

CREATE POLICY "Service role can manage webhook logs"
  ON public.uber_webhook_logs
  FOR ALL
  TO authenticated
  USING ((SELECT auth.jwt()->>'role') = 'service_role')
  WITH CHECK ((SELECT auth.jwt()->>'role') = 'service_role');

-- =====================================================
-- 13. OPTIMIZE RLS POLICIES (admin_users table)
-- =====================================================

DROP POLICY IF EXISTS "Admins can read own profile" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can update own profile" ON public.admin_users;

CREATE POLICY "Admins can read own profile"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (id = (SELECT auth.uid()));

CREATE POLICY "Admins can update own profile"
  ON public.admin_users
  FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- =====================================================
-- 14. OPTIMIZE RLS POLICIES (manual_operations table)
-- =====================================================

DROP POLICY IF EXISTS "Admins can view all operations" ON public.manual_operations;
DROP POLICY IF EXISTS "Admins can insert operations" ON public.manual_operations;

CREATE POLICY "Admins can view all operations"
  ON public.manual_operations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Admins can insert operations"
  ON public.manual_operations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (SELECT auth.uid())
    )
  );

-- =====================================================
-- 15. OPTIMIZE RLS POLICIES (bookings table)
-- =====================================================

DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can update all bookings" ON public.bookings;

CREATE POLICY "Users can view own bookings"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Admins can view all bookings"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Admins can update all bookings"
  ON public.bookings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (SELECT auth.uid())
    )
  );

-- =====================================================
-- 16. ENABLE RLS ON admin_logs
-- =====================================================

ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all logs"
  ON public.admin_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Admins can insert logs"
  ON public.admin_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (SELECT auth.uid())
      AND admin_users.id = admin_logs.admin_user_id
    )
  );

-- =====================================================
-- 17. FIX FUNCTION SEARCH PATHS
-- =====================================================

CREATE OR REPLACE FUNCTION public.find_nearby_charities(
  lat double precision,
  lon double precision,
  radius_miles integer DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  name text,
  address text,
  city text,
  state text,
  zip_code text,
  phone text,
  email text,
  website text,
  accepts_furniture boolean,
  accepts_clothing boolean,
  accepts_electronics boolean,
  accepts_household boolean,
  distance_miles double precision
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.name,
    dc.street_address as address,
    dc.city,
    dc.state,
    dc.zip_code,
    dc.phone,
    dc.email,
    dc.website,
    true as accepts_furniture,
    true as accepts_clothing,
    true as accepts_electronics,
    true as accepts_household,
    ST_Distance(
      dc.location::geography,
      ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography
    ) / 1609.34 as distance_miles
  FROM donation_centers dc
  WHERE dc.is_active = true
    AND ST_DWithin(
      dc.location::geography,
      ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography,
      radius_miles * 1609.34
    )
  ORDER BY distance_miles;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.deduct_sponsorship_credit(
  p_sponsorship_id uuid,
  p_booking_id uuid,
  p_amount numeric
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_current_balance numeric;
BEGIN
  SELECT available_credits INTO v_current_balance
  FROM sponsorships
  WHERE id = p_sponsorship_id
  FOR UPDATE;

  IF v_current_balance >= p_amount THEN
    UPDATE sponsorships
    SET available_credits = available_credits - p_amount
    WHERE id = p_sponsorship_id;

    INSERT INTO sponsorship_transactions (
      sponsorship_id,
      booking_id,
      amount,
      transaction_type,
      balance_after
    ) VALUES (
      p_sponsorship_id,
      p_booking_id,
      p_amount,
      'deduction',
      v_current_balance - p_amount
    );

    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.find_applicable_sponsorship(
  p_donation_center_id uuid,
  p_booking_amount numeric
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_sponsorship_id uuid;
BEGIN
  SELECT id INTO v_sponsorship_id
  FROM sponsorships
  WHERE donation_center_id = p_donation_center_id
    AND is_active = true
    AND available_credits >= p_booking_amount
  ORDER BY created_at ASC
  LIMIT 1;

  RETURN v_sponsorship_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_unread_count(p_booking_id uuid, p_user_type text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_count integer;
BEGIN
  IF p_user_type = 'customer' THEN
    SELECT COUNT(*) INTO v_count
    FROM booking_messages
    WHERE booking_id = p_booking_id
      AND sender_type != 'customer'
      AND read_by_customer = false;
  ELSIF p_user_type = 'admin' THEN
    SELECT COUNT(*) INTO v_count
    FROM booking_messages
    WHERE booking_id = p_booking_id
      AND sender_type != 'admin'
      AND read_by_admin = false;
  ELSE
    v_count := 0;
  END IF;

  RETURN v_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_messages_read(p_booking_id uuid, p_user_type text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF p_user_type = 'customer' THEN
    UPDATE booking_messages
    SET read_by_customer = true
    WHERE booking_id = p_booking_id
      AND sender_type != 'customer'
      AND read_by_customer = false;
  ELSIF p_user_type = 'admin' THEN
    UPDATE booking_messages
    SET read_by_admin = true
    WHERE booking_id = p_booking_id
      AND sender_type != 'admin'
      AND read_by_admin = false;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_receipt_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_year text;
  v_sequence integer;
  v_receipt_number text;
BEGIN
  v_year := to_char(CURRENT_DATE, 'YYYY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(receipt_number FROM 6) AS integer)), 0) + 1
  INTO v_sequence
  FROM donation_receipts
  WHERE receipt_number LIKE v_year || '-%';
  
  v_receipt_number := v_year || '-' || LPAD(v_sequence::text, 6, '0');
  
  RETURN v_receipt_number;
END;
$$;
