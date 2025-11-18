-- DoorDash Drive API Integration Database Migration
-- Adds DoorDash fields to bookings table and creates webhook logs table

-- Add DoorDash fields to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS doordash_delivery_id TEXT,
ADD COLUMN IF NOT EXISTS doordash_quote_id TEXT,
ADD COLUMN IF NOT EXISTS doordash_tracking_url TEXT,
ADD COLUMN IF NOT EXISTS doordash_status TEXT,
ADD COLUMN IF NOT EXISTS doordash_dasher_info JSONB,
ADD COLUMN IF NOT EXISTS doordash_pickup_eta TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS doordash_dropoff_eta TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS doordash_fee_cents INTEGER;

-- Create indexes for DoorDash fields for faster queries
CREATE INDEX IF NOT EXISTS idx_bookings_doordash_delivery_id ON bookings(doordash_delivery_id);
CREATE INDEX IF NOT EXISTS idx_bookings_doordash_quote_id ON bookings(doordash_quote_id);
CREATE INDEX IF NOT EXISTS idx_bookings_doordash_status ON bookings(doordash_status);

-- Update delivery_provider CHECK constraint to include 'doordash'
DO $$
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'bookings_delivery_provider_check'
    AND conrelid = 'bookings'::regclass
  ) THEN
    ALTER TABLE bookings DROP CONSTRAINT bookings_delivery_provider_check;
  END IF;

  -- Add updated constraint with 'doordash' option
  ALTER TABLE bookings ADD CONSTRAINT bookings_delivery_provider_check
    CHECK (delivery_provider IN ('manual', 'roadie', 'uber', 'doordash'));
END $$;

-- Create DoorDash webhook logs table
CREATE TABLE IF NOT EXISTS doordash_webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  delivery_id TEXT,
  external_delivery_id TEXT,
  payload JSONB NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for webhook logs
CREATE INDEX IF NOT EXISTS idx_doordash_webhooks_delivery_id ON doordash_webhook_logs(delivery_id);
CREATE INDEX IF NOT EXISTS idx_doordash_webhooks_external_id ON doordash_webhook_logs(external_delivery_id);
CREATE INDEX IF NOT EXISTS idx_doordash_webhooks_event_type ON doordash_webhook_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_doordash_webhooks_event_id ON doordash_webhook_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_doordash_webhooks_created ON doordash_webhook_logs(created_at DESC);

-- Enable RLS on webhook logs
ALTER TABLE doordash_webhook_logs ENABLE ROW LEVEL SECURITY;

-- Webhook logs are internal only - service role access
CREATE POLICY "Service role can manage DoorDash webhook logs"
  ON doordash_webhook_logs
  FOR ALL
  TO service_role
  USING (true);

-- Add comments for documentation
COMMENT ON COLUMN bookings.doordash_delivery_id IS 'DoorDash delivery ID returned from API';
COMMENT ON COLUMN bookings.doordash_quote_id IS 'DoorDash quote ID used to create delivery';
COMMENT ON COLUMN bookings.doordash_tracking_url IS 'DoorDash tracking URL for customer';
COMMENT ON COLUMN bookings.doordash_status IS 'Current DoorDash delivery status';
COMMENT ON COLUMN bookings.doordash_dasher_info IS 'JSON with Dasher details (name, phone, location, vehicle)';
COMMENT ON COLUMN bookings.doordash_pickup_eta IS 'Estimated pickup time from DoorDash';
COMMENT ON COLUMN bookings.doordash_dropoff_eta IS 'Estimated dropoff time from DoorDash';
COMMENT ON COLUMN bookings.doordash_fee_cents IS 'DoorDash delivery fee in cents';

COMMENT ON TABLE doordash_webhook_logs IS 'Logs all DoorDash Drive webhook events for debugging and monitoring';
