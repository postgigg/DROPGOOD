/*
  # Add driver tip to bookings

  1. Changes
    - Add `driver_tip` column to bookings table (default $4.00)
    - Update existing records to include driver tip

  2. Notes
    - All new bookings will include the mandatory $4 driver tip
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'driver_tip'
  ) THEN
    ALTER TABLE bookings ADD COLUMN driver_tip decimal(10,2) DEFAULT 4.00 NOT NULL;
  END IF;
END $$;
