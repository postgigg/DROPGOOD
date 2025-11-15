-- Add customer name fields to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS customer_first_name TEXT,
ADD COLUMN IF NOT EXISTS customer_last_name TEXT;

-- Add index for searching by customer name
CREATE INDEX IF NOT EXISTS idx_bookings_customer_name ON bookings(customer_first_name, customer_last_name);
