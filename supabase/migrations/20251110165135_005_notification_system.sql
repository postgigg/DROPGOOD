/*
  # Notification System Schema

  ## Summary
  Adds comprehensive notification tracking for emails and SMS messages.

  ## Changes
  
  ### 1. Notification Logs Table
  - Creates `notification_logs` table to track all sent notifications
  - Tracks delivery status, timestamps, and recipients
  - Enables debugging and compliance tracking

  ### 2. Security
  - RLS enabled with service role access only
  - User privacy protected
*/

-- Create notification logs table
CREATE TABLE IF NOT EXISTS notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id text REFERENCES bookings(id),
  notification_type text NOT NULL,
  recipient_email text NOT NULL,
  recipient_phone text,
  email_sent boolean DEFAULT false,
  sms_sent boolean DEFAULT false,
  email_error text,
  sms_error text,
  sent_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notification_logs_booking_id_idx ON notification_logs(booking_id);
CREATE INDEX IF NOT EXISTS notification_logs_type_idx ON notification_logs(notification_type);
CREATE INDEX IF NOT EXISTS notification_logs_sent_at_idx ON notification_logs(sent_at DESC);

-- Enable RLS
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Service role only access (internal)
CREATE POLICY "Service role can manage notification logs"
  ON notification_logs
  FOR ALL
  USING (auth.role() = 'service_role');

-- Add notification preferences to bookings (optional)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'notification_preferences'
  ) THEN
    ALTER TABLE bookings ADD COLUMN notification_preferences jsonb DEFAULT '{"email": true, "sms": true}'::jsonb;
  END IF;
END $$;

COMMENT ON TABLE notification_logs IS 'Tracks all email and SMS notifications sent to users';
COMMENT ON COLUMN notification_logs.notification_type IS 'Type: booking_confirmation, pickup_reminder, driver_enroute, delivery_completed, delivery_canceled';
