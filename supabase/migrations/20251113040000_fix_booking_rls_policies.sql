/*
  # Fix Bookings RLS Policies

  Issue: Authenticated users were getting "new row violates row-level security policy"
  when trying to create bookings.

  Solution: Add INSERT policy for authenticated users and company booking visibility.

  Policies added:
  1. Authenticated users can create bookings
  2. Company owners can view employee bookings
*/

-- Allow authenticated users to create bookings
CREATE POLICY IF NOT EXISTS "Authenticated users can create bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow company owners to view bookings from their employees
CREATE POLICY IF NOT EXISTS "Company owners can view employee bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_user_id = auth.uid()
    )
  );

-- Add comment
COMMENT ON TABLE bookings IS 'Donation pickup bookings with RLS policies for guest, authenticated, company, and admin access';
