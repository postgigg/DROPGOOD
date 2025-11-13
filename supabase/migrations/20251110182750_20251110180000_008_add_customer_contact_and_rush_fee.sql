/*
  # Add Customer Contact Fields and Rush Fee

  1. Changes to bookings table
    - Add `customer_phone` (text) - Customer's phone number for SMS notifications
    - Add `customer_email` (text) - Customer's email for receipts
    - Add `rush_fee` (decimal) - Extra fee for same-day delivery ($5)
    - Add `driver_tip` (decimal) - Driver tip amount ($4 default, 100% to driver)

  2. Notes
    - Phone is required for SMS tracking updates
    - Email is optional but recommended for receipts
    - Rush fee applies when pickup is scheduled for same day
    - These fields allow guest checkout without user accounts
*/

-- Add customer contact fields and fees to bookings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'customer_phone'
  ) THEN
    ALTER TABLE bookings ADD COLUMN customer_phone TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'customer_email'
  ) THEN
    ALTER TABLE bookings ADD COLUMN customer_email TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'rush_fee'
  ) THEN
    ALTER TABLE bookings ADD COLUMN rush_fee DECIMAL(10, 2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'driver_tip'
  ) THEN
    ALTER TABLE bookings ADD COLUMN driver_tip DECIMAL(10, 2) DEFAULT 4.00;
  END IF;
END $$;

-- Add indexes for customer contact lookups
CREATE INDEX IF NOT EXISTS idx_bookings_customer_phone ON bookings(customer_phone);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_email ON bookings(customer_email);
