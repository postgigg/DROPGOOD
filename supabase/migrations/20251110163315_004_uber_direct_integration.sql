/*
  # Uber Direct Integration Schema

  ## Summary
  Adds Uber Direct delivery tracking capabilities to the bookings system.

  ## Changes
  
  ### 1. Bookings Table Updates
  - Adds `uber_delivery_id` - Unique Uber delivery identifier
  - Adds `uber_quote_id` - Quote ID used to create the delivery
  - Adds `uber_tracking_url` - Public tracking URL for customers
  - Adds `uber_status` - Current delivery status (pending, pickup, dropoff, delivered, canceled, returned)
  - Adds `courier_info` - JSON object with courier details (name, phone, location, vehicle)
  - Adds `pickup_eta` - Estimated pickup time from Uber
  - Adds `dropoff_eta` - Estimated dropoff time from Uber

  ### 2. Webhook Logs Table
  - Creates `uber_webhook_logs` table to track all incoming webhooks
  - Stores event details for debugging and auditing
  
  ### 3. Security
  - RLS policies for webhook logs (internal only)
*/

-- Add Uber tracking fields to bookings table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'uber_delivery_id'
  ) THEN
    ALTER TABLE bookings ADD COLUMN uber_delivery_id text;
    ALTER TABLE bookings ADD COLUMN uber_quote_id text;
    ALTER TABLE bookings ADD COLUMN uber_tracking_url text;
    ALTER TABLE bookings ADD COLUMN uber_status text;
    ALTER TABLE bookings ADD COLUMN courier_info jsonb;
    ALTER TABLE bookings ADD COLUMN pickup_eta timestamptz;
    ALTER TABLE bookings ADD COLUMN dropoff_eta timestamptz;
    
    CREATE INDEX IF NOT EXISTS bookings_uber_delivery_id_idx ON bookings(uber_delivery_id);
    CREATE INDEX IF NOT EXISTS bookings_uber_status_idx ON bookings(uber_status);
  END IF;
END $$;

-- Create webhook logs table
CREATE TABLE IF NOT EXISTS uber_webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text NOT NULL,
  event_type text NOT NULL,
  delivery_id text,
  payload jsonb NOT NULL,
  processed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS uber_webhook_logs_delivery_id_idx ON uber_webhook_logs(delivery_id);
CREATE INDEX IF NOT EXISTS uber_webhook_logs_event_id_idx ON uber_webhook_logs(event_id);
CREATE INDEX IF NOT EXISTS uber_webhook_logs_created_at_idx ON uber_webhook_logs(created_at DESC);

-- Enable RLS on webhook logs
ALTER TABLE uber_webhook_logs ENABLE ROW LEVEL SECURITY;

-- Webhook logs are internal only - no public access
CREATE POLICY "Service role can manage webhook logs"
  ON uber_webhook_logs
  FOR ALL
  USING (auth.role() = 'service_role');

-- Add comment
COMMENT ON TABLE uber_webhook_logs IS 'Logs all incoming Uber Direct webhook events for debugging and auditing';
