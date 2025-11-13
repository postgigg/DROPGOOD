/*
  # Add Payment Status Field to Bookings

  1. Changes
    - Add `payment_status` field to track payment state separately from booking status
    - Supports values: 'pending', 'completed', 'failed', 'refunded'
    - Defaults to 'pending' for new bookings

  2. Notes
    - This allows tracking payment state independently from booking workflow
    - Existing bookings will have NULL payment_status (can be backfilled if needed)
*/

-- Add payment_status column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE bookings ADD COLUMN payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded'));
  END IF;
END $$;

-- Create index for payment status queries
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
