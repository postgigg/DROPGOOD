/*
  # Fix Guest Booking Creation

  The security improvements migration accidentally removed the ability for guest users
  to create bookings. This migration restores that capability.

  ## Changes
  - Add policy to allow anyone (authenticated or anon) to create bookings
  - This is necessary for the guest checkout flow where users don't have accounts
*/

-- Drop the old policy if it exists
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;

-- Create a new policy that allows anyone to INSERT bookings
CREATE POLICY "Anyone can create bookings"
  ON public.bookings
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Also allow anon users specifically
CREATE POLICY "Anon users can create bookings"
  ON public.bookings
  FOR INSERT
  TO anon
  WITH CHECK (true);
