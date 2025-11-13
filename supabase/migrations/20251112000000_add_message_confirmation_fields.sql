/*
  # Add Manual Message Confirmation Fields

  ## Summary
  Adds fields to track manual confirmation that text messages were sent to customers.
  This allows admin staff to verify and mark that SMS notifications went out successfully.

  ## Changes

  ### `bookings` table - Added columns
  - `messages_confirmed` (boolean) - Whether admin manually confirmed messages were sent
  - `messages_confirmed_at` (timestamptz) - When the confirmation was made
  - `messages_confirmed_by` (uuid) - Which admin user confirmed the messages
*/

-- Add message confirmation fields to bookings table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'messages_confirmed'
  ) THEN
    ALTER TABLE bookings ADD COLUMN messages_confirmed boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'messages_confirmed_at'
  ) THEN
    ALTER TABLE bookings ADD COLUMN messages_confirmed_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'messages_confirmed_by'
  ) THEN
    ALTER TABLE bookings ADD COLUMN messages_confirmed_by uuid REFERENCES admin_users(id);
  END IF;
END $$;

-- Create index for faster queries on confirmation status
CREATE INDEX IF NOT EXISTS idx_bookings_messages_confirmed ON bookings(messages_confirmed);

COMMENT ON COLUMN bookings.messages_confirmed IS 'Manual confirmation by admin that SMS/email notifications were sent';
COMMENT ON COLUMN bookings.messages_confirmed_at IS 'Timestamp when admin confirmed messages were sent';
COMMENT ON COLUMN bookings.messages_confirmed_by IS 'Admin user who confirmed the messages';
