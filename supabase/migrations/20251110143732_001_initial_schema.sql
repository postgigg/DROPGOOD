/*
  # DropGood Initial Schema
  
  1. New Tables
    - `users` - User authentication and profile data
    - `donation_centers` - Charity locations with PostGIS
    - `bookings` - Pickup/delivery requests with pricing breakdown
    - `ratings` - Driver and service ratings
    - `referrals` - Referral code system
    - `admin_logs` - Admin action tracking
  
  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
    - Public read access for active donation centers
*/

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "postgis" SCHEMA extensions;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  phone_verified BOOLEAN DEFAULT false,
  first_name TEXT,
  last_name TEXT,
  stripe_customer_id TEXT UNIQUE,
  default_pickup_address JSONB,
  notification_preferences JSONB DEFAULT '{"sms": true, "email": true}'::jsonb,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES users(id),
  referral_credits DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);

CREATE TABLE IF NOT EXISTS donation_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  location GEOGRAPHY(POINT, 4326),
  phone TEXT,
  email TEXT,
  website TEXT,
  accepted_items TEXT[] DEFAULT ARRAY['clothing', 'books', 'household'],
  hours JSONB,
  special_instructions TEXT,
  tax_id TEXT,
  is_501c3 BOOLEAN DEFAULT true,
  is_sponsored BOOLEAN DEFAULT false,
  sponsorship_tier TEXT CHECK (sponsorship_tier IN ('basic', 'featured', 'premium')),
  sponsored_until DATE,
  monthly_sponsorship_fee DECIMAL(10, 2),
  logo_url TEXT,
  photos TEXT[],
  rating DECIMAL(3, 2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_ratings INTEGER DEFAULT 0,
  total_donations_received INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

UPDATE donation_centers SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326) WHERE location IS NULL;

CREATE INDEX IF NOT EXISTS idx_donation_centers_location ON donation_centers USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_donation_centers_sponsored ON donation_centers(is_sponsored, is_active);
CREATE INDEX IF NOT EXISTS idx_donation_centers_city ON donation_centers(city, state);

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  donation_center_id UUID REFERENCES donation_centers(id),
  pickup_street_address TEXT NOT NULL,
  pickup_city TEXT NOT NULL,
  pickup_state TEXT NOT NULL,
  pickup_zip_code TEXT NOT NULL,
  pickup_latitude DECIMAL(10, 8) NOT NULL,
  pickup_longitude DECIMAL(11, 8) NOT NULL,
  pickup_instructions TEXT,
  pickup_location_type TEXT CHECK (pickup_location_type IN ('front_door', 'garage', 'side_of_house', 'other')),
  dropoff_street_address TEXT NOT NULL,
  dropoff_city TEXT NOT NULL,
  dropoff_state TEXT NOT NULL,
  dropoff_zip_code TEXT NOT NULL,
  dropoff_latitude DECIMAL(10, 8) NOT NULL,
  dropoff_longitude DECIMAL(11, 8) NOT NULL,
  distance_miles DECIMAL(5, 2),
  duration_minutes INTEGER,
  scheduled_date DATE NOT NULL,
  scheduled_time_start TIME NOT NULL,
  scheduled_time_end TIME NOT NULL,
  items_count INTEGER NOT NULL,
  items_types TEXT[] NOT NULL,
  items_description TEXT,
  photo_urls TEXT[],
  estimated_value DECIMAL(10, 2),
  uber_cost DECIMAL(10, 2) NOT NULL,
  our_markup DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  stripe_fee DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  stripe_payment_intent_id TEXT,
  payment_completed_at TIMESTAMP,
  refund_amount DECIMAL(10, 2),
  refund_reason TEXT,
  uber_delivery_id TEXT UNIQUE,
  tracking_url TEXT,
  driver_name TEXT,
  driver_phone TEXT,
  driver_vehicle TEXT,
  driver_photo_url TEXT,
  driver_rating DECIMAL(3, 2),
  eta_to_pickup INTEGER,
  status TEXT NOT NULL DEFAULT 'payment_pending' CHECK (status IN (
    'payment_pending', 'scheduled', 'pending_driver', 'driver_assigned',
    'driver_arrived', 'picked_up', 'in_transit', 'completed', 'cancelled', 'failed'
  )),
  picked_up_at TIMESTAMP,
  delivered_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  proof_photo_url TEXT,
  tax_receipt_sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_center_id ON bookings(donation_center_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_date ON bookings(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_bookings_uber_delivery_id ON bookings(uber_delivery_id);

CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id TEXT REFERENCES bookings(id) NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  driver_rating INTEGER CHECK (driver_rating >= 1 AND driver_rating <= 5),
  service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
  feedback TEXT,
  tip_amount DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ratings_booking_id ON ratings(booking_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON ratings(user_id);

CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id UUID REFERENCES users(id) NOT NULL,
  referral_code TEXT NOT NULL,
  referee_user_id UUID REFERENCES users(id),
  referee_email TEXT,
  booking_id TEXT REFERENCES bookings(id),
  referrer_credit_amount DECIMAL(10, 2) DEFAULT 5.00,
  referee_credit_amount DECIMAL(10, 2) DEFAULT 5.00,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referee ON referrals(referee_user_id);

CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Only create index if column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_logs' AND column_name = 'admin_user_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at DESC);

CREATE OR REPLACE FUNCTION find_nearby_charities(
  user_lat DECIMAL,
  user_lng DECIMAL,
  radius_miles INTEGER DEFAULT 15
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  street_address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  distance_miles DECIMAL,
  is_sponsored BOOLEAN,
  accepted_items TEXT[],
  hours JSONB,
  rating DECIMAL,
  total_donations_received INTEGER,
  logo_url TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.name,
    dc.street_address,
    dc.city,
    dc.state,
    dc.zip_code,
    dc.latitude,
    dc.longitude,
    ROUND(
      (ST_Distance(
        ST_SetSRID(ST_MakePoint(dc.longitude, dc.latitude), 4326)::geography,
        ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
      ) * 0.000621371)::numeric,
      1
    ) AS distance_miles,
    dc.is_sponsored,
    dc.accepted_items,
    dc.hours,
    dc.rating,
    dc.total_donations_received,
    dc.logo_url
  FROM donation_centers dc
  WHERE
    dc.is_active = true
    AND ST_DWithin(
      ST_SetSRID(ST_MakePoint(dc.longitude, dc.latitude), 4326)::geography,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      radius_miles * 1609.34
    )
  ORDER BY
    dc.is_sponsored DESC,
    distance_miles ASC;
END;
$$;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_donation_centers_updated_at ON donation_centers;
CREATE TRIGGER update_donation_centers_updated_at BEFORE UPDATE ON donation_centers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can view own data') THEN
    CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can update own data') THEN
    CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'donation_centers' AND policyname = 'Anyone can view active charities') THEN
    CREATE POLICY "Anyone can view active charities" ON donation_centers FOR SELECT USING (is_active = true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Users can view own bookings') THEN
    CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Users can create bookings') THEN
    CREATE POLICY "Users can create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ratings' AND policyname = 'Users can view own ratings') THEN
    CREATE POLICY "Users can view own ratings" ON ratings FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ratings' AND policyname = 'Users can create ratings') THEN
    CREATE POLICY "Users can create ratings" ON ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'referrals' AND policyname = 'Users can view own referrals') THEN
    CREATE POLICY "Users can view own referrals" ON referrals FOR SELECT USING (auth.uid() = referrer_user_id OR auth.uid() = referee_user_id);
  END IF;
END $$;