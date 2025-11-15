/*
  # Driver Job Board System

  ## Summary
  Creates tables and policies for driver job board where couriers can sign up for
  email notifications about available delivery jobs near their location.

  ## Changes

  ### 1. Driver Signups Table
  - Stores driver email registrations with location preferences
  - Allows drivers to receive job notifications within their radius

  ### 2. Driver Job Notifications Table
  - Tracks which drivers were notified about which jobs
  - Prevents duplicate notifications

  ### 3. Security
  - Public INSERT allowed for driver signups (with validation)
  - RLS policies for data protection
*/

-- Create driver signups table
CREATE TABLE IF NOT EXISTS driver_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location GEOGRAPHY(POINT, 4326),
  notification_radius_miles INTEGER DEFAULT 15 CHECK (notification_radius_miles >= 5 AND notification_radius_miles <= 50),
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  unsubscribed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_driver_signups_email ON driver_signups(email);
CREATE INDEX IF NOT EXISTS idx_driver_signups_location ON driver_signups USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_driver_signups_active ON driver_signups(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_driver_signups_city_state ON driver_signups(city, state);

-- Create driver job notifications table
CREATE TABLE IF NOT EXISTS driver_job_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_signup_id UUID REFERENCES driver_signups(id) ON DELETE CASCADE NOT NULL,
  booking_id TEXT REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  distance_miles DECIMAL(5, 2),
  email_sent BOOLEAN DEFAULT false,
  email_error TEXT,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(driver_signup_id, booking_id)
);

CREATE INDEX IF NOT EXISTS idx_driver_notifications_driver ON driver_job_notifications(driver_signup_id);
CREATE INDEX IF NOT EXISTS idx_driver_notifications_booking ON driver_job_notifications(booking_id);
CREATE INDEX IF NOT EXISTS idx_driver_notifications_sent ON driver_job_notifications(sent_at DESC);

-- Enable RLS
ALTER TABLE driver_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_job_notifications ENABLE ROW LEVEL SECURITY;

-- Driver signups policies
-- Anyone can insert (for signup form)
CREATE POLICY "Anyone can sign up as driver"
  ON driver_signups
  FOR INSERT
  WITH CHECK (true);

-- Anyone can view active driver signups (for public job board stats)
CREATE POLICY "Anyone can view active driver signups"
  ON driver_signups
  FOR SELECT
  USING (is_active = true AND unsubscribed_at IS NULL);

-- Service role has full access
CREATE POLICY "Service role can manage driver signups"
  ON driver_signups
  FOR ALL
  USING (auth.role() = 'service_role');

-- Driver can update their own record via email
CREATE POLICY "Drivers can update own record"
  ON driver_signups
  FOR UPDATE
  USING (email = current_setting('request.jwt.claims', true)::json->>'email')
  WITH CHECK (email = current_setting('request.jwt.claims', true)::json->>'email');

-- Job notifications policies (internal only)
CREATE POLICY "Service role can manage driver notifications"
  ON driver_job_notifications
  FOR ALL
  USING (auth.role() = 'service_role');

-- Function to update driver location based on city/state
CREATE OR REPLACE FUNCTION update_driver_location()
RETURNS TRIGGER AS $$
BEGIN
  -- This is a placeholder - in production you'd geocode the city/state
  -- For now, we'll leave location NULL and match by city/state text
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER driver_signups_update_location
  BEFORE INSERT OR UPDATE ON driver_signups
  FOR EACH ROW
  EXECUTE FUNCTION update_driver_location();

-- Function to find nearby drivers for a booking
CREATE OR REPLACE FUNCTION find_nearby_drivers(
  booking_city TEXT,
  booking_state TEXT,
  booking_lat DECIMAL,
  booking_lng DECIMAL,
  radius_miles INTEGER DEFAULT 15
)
RETURNS TABLE (
  driver_id UUID,
  driver_email TEXT,
  driver_name TEXT,
  driver_city TEXT,
  driver_state TEXT,
  distance_miles DECIMAL
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ds.id as driver_id,
    ds.email as driver_email,
    ds.name as driver_name,
    ds.city as driver_city,
    ds.state as driver_state,
    0.0::DECIMAL as distance_miles  -- Placeholder, can be calculated if we geocode cities
  FROM driver_signups ds
  WHERE
    ds.is_active = true
    AND ds.unsubscribed_at IS NULL
    AND ds.email_verified = true
    AND (
      -- Match same city and state
      (LOWER(ds.city) = LOWER(booking_city) AND LOWER(ds.state) = LOWER(booking_state))
      OR
      -- If we have location data, use radius
      (ds.location IS NOT NULL AND booking_lat IS NOT NULL AND booking_lng IS NOT NULL
       AND ST_DWithin(
         ds.location,
         ST_SetSRID(ST_MakePoint(booking_lng, booking_lat), 4326)::geography,
         ds.notification_radius_miles * 1609.34  -- Convert miles to meters
       ))
    );
END;
$$;

-- Comments
COMMENT ON TABLE driver_signups IS 'Drivers who have signed up to receive job notifications';
COMMENT ON TABLE driver_job_notifications IS 'Tracks which drivers were notified about which jobs';
COMMENT ON COLUMN driver_signups.notification_radius_miles IS 'How far from their location they want to receive job alerts (5-50 miles)';
COMMENT ON COLUMN driver_signups.email_verified IS 'Whether the driver has verified their email address';
COMMENT ON COLUMN driver_signups.unsubscribed_at IS 'When the driver unsubscribed from notifications';
