/*
  # Allow Guest Bookings

  1. Changes to RLS Policies
    - Drop existing restrictive booking INSERT policy
    - Create new policy allowing anyone to create bookings (guest checkout)
    - Maintain READ policies for authenticated users only

  2. Security Notes
    - Guest users can create bookings without authentication
    - Only authenticated users can view their own bookings
    - Customer contact info (phone/email) used for tracking instead of auth
*/

-- Drop the restrictive insert policy
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;

-- Allow anyone (including unauthenticated users) to create bookings
CREATE POLICY "Anyone can create bookings"
  ON bookings
  FOR INSERT
  WITH CHECK (true);

-- Keep the read policy restrictive - only users can view their own bookings
-- (This policy already exists, just documenting it)
