-- Roadie Integration Database Migration
-- Adds Roadie fields to bookings table and creates webhook logs table

-- Add Roadie fields to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS roadie_base_price NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS roadie_shipment_id INTEGER,
ADD COLUMN IF NOT EXISTS roadie_reference_id TEXT,
ADD COLUMN IF NOT EXISTS roadie_state TEXT,
ADD COLUMN IF NOT EXISTS roadie_tracking_url TEXT,
ADD COLUMN IF NOT EXISTS roadie_pickup_image_url TEXT,
ADD COLUMN IF NOT EXISTS roadie_delivery_image_url TEXT,
ADD COLUMN IF NOT EXISTS roadie_signature_image_url TEXT,
ADD COLUMN IF NOT EXISTS delivery_provider TEXT CHECK (delivery_provider IN ('manual', 'roadie', 'uber'));

-- Create index on delivery_provider for faster queries
CREATE INDEX IF NOT EXISTS idx_bookings_delivery_provider ON bookings(delivery_provider);

-- Create index on roadie_shipment_id for webhook lookups
CREATE INDEX IF NOT EXISTS idx_bookings_roadie_shipment_id ON bookings(roadie_shipment_id);

-- Create Roadie webhook logs table
CREATE TABLE IF NOT EXISTS roadie_webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  shipment_id INTEGER,
  reference_id TEXT,
  payload JSONB NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for webhook logs
CREATE INDEX IF NOT EXISTS idx_roadie_webhooks_shipment ON roadie_webhook_logs(shipment_id);
CREATE INDEX IF NOT EXISTS idx_roadie_webhooks_reference ON roadie_webhook_logs(reference_id);
CREATE INDEX IF NOT EXISTS idx_roadie_webhooks_event_type ON roadie_webhook_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_roadie_webhooks_created ON roadie_webhook_logs(created_at DESC);

-- Create Supabase Storage bucket for delivery images (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('delivery-images', 'delivery-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to delivery images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
    AND policyname = 'Public Access to delivery images'
  ) THEN
    CREATE POLICY "Public Access to delivery images"
    ON storage.objects FOR SELECT
    USING ( bucket_id = 'delivery-images' );
  END IF;
END $$;

-- Allow service role to upload images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
    AND policyname = 'Service Role Upload to delivery images'
  ) THEN
    CREATE POLICY "Service Role Upload to delivery images"
    ON storage.objects FOR INSERT
    TO service_role
    WITH CHECK ( bucket_id = 'delivery-images' );
  END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN bookings.roadie_base_price IS 'Base price from Roadie API before our fees';
COMMENT ON COLUMN bookings.roadie_shipment_id IS 'Roadie shipment ID';
COMMENT ON COLUMN bookings.roadie_reference_id IS 'DropGood booking ID used as Roadie reference';
COMMENT ON COLUMN bookings.roadie_state IS 'Current Roadie shipment state';
COMMENT ON COLUMN bookings.roadie_tracking_url IS 'Roadie tracking URL for customer';
COMMENT ON COLUMN bookings.roadie_pickup_image_url IS 'URL to pickup confirmation photo';
COMMENT ON COLUMN bookings.roadie_delivery_image_url IS 'URL to delivery confirmation photo';
COMMENT ON COLUMN bookings.roadie_signature_image_url IS 'URL to delivery signature photo';
COMMENT ON COLUMN bookings.delivery_provider IS 'Delivery provider: manual, roadie, or uber';

COMMENT ON TABLE roadie_webhook_logs IS 'Logs all Roadie webhook events for debugging and monitoring';
