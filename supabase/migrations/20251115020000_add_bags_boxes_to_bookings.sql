-- Add bags and boxes tracking to bookings table
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS bags_count INTEGER DEFAULT 0 CHECK (bags_count >= 0),
  ADD COLUMN IF NOT EXISTS boxes_count INTEGER DEFAULT 0 CHECK (boxes_count >= 0);

-- Add index for analytics queries
CREATE INDEX IF NOT EXISTS idx_bookings_donation_center_analytics
  ON bookings(donation_center_id, status)
  WHERE status = 'completed';

-- Add comment
COMMENT ON COLUMN bookings.bags_count IS 'Number of bags in this booking';
COMMENT ON COLUMN bookings.boxes_count IS 'Number of boxes in this booking';
