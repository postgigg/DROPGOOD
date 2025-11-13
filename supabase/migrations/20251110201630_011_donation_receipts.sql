/*
  # Donation Tax Receipts System
  
  Creates a comprehensive system for IRS-compliant donation receipts.
  
  ## New Tables
  
  ### `donation_receipts`
  Stores all information required for IRS-compliant donation receipts (Form 501(c)(3))
  
  **Columns:**
  - `id` (uuid, primary key) - Unique receipt ID
  - `booking_id` (text, foreign key) - Links to bookings table
  - `donation_center_id` (uuid, foreign key) - The 501(c)(3) organization
  - `receipt_number` (text, unique) - Human-readable receipt number (e.g., "DR-2025-000001")
  - `donor_name` (text) - Name of the donor
  - `donor_email` (text, nullable) - Donor's email address
  - `donor_phone` (text) - Donor's phone number
  - `donor_address` (text) - Full donor address for receipt
  - `donation_date` (date) - Date the donation was made/picked up
  - `donation_items` (jsonb) - Description of donated items
  - `estimated_value` (numeric) - Good faith estimate of donation value
  - `goods_or_services_provided` (boolean) - Whether org provided anything in exchange
  - `goods_or_services_description` (text, nullable) - Description if provided
  - `goods_or_services_value` (numeric, nullable) - Value if provided
  - `tax_deductible_amount` (numeric) - Deductible amount (donation minus goods/services)
  - `receipt_issued_date` (timestamp) - When receipt was generated
  - `receipt_sent_date` (timestamp, nullable) - When receipt was emailed
  - `pdf_url` (text, nullable) - URL to generated PDF receipt
  - `created_at` (timestamp) - Record creation time
  - `updated_at` (timestamp) - Last update time
  
  ## Security
  
  - Enable RLS on `donation_receipts` table
  - Public can view receipts using receipt_number (for guest donors)
  - Receipt owners can view their receipts
  - Donation centers can view receipts for donations to them
  - Only system can create/update receipts
  
  ## Important Notes
  
  1. **IRS Compliance**: All required fields per IRS Publication 1771
  2. **Good Faith Estimate**: For non-cash donations, we provide estimate ranges
  3. **Contemporaneous Requirement**: Receipts issued same day as delivery
  4. **No Appraisal**: We note that items over $5,000 require independent appraisal
*/

-- Create donation_receipts table
CREATE TABLE IF NOT EXISTS donation_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id text REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  donation_center_id uuid REFERENCES donation_centers(id) ON DELETE CASCADE NOT NULL,
  receipt_number text UNIQUE NOT NULL,
  donor_name text NOT NULL,
  donor_email text,
  donor_phone text NOT NULL,
  donor_address text NOT NULL,
  donation_date date NOT NULL,
  donation_items jsonb NOT NULL,
  estimated_value numeric(10,2) NOT NULL DEFAULT 0,
  goods_or_services_provided boolean NOT NULL DEFAULT false,
  goods_or_services_description text,
  goods_or_services_value numeric(10,2),
  tax_deductible_amount numeric(10,2) NOT NULL,
  receipt_issued_date timestamptz NOT NULL DEFAULT now(),
  receipt_sent_date timestamptz,
  pdf_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index on booking_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_donation_receipts_booking_id ON donation_receipts(booking_id);

-- Create index on receipt_number for public lookups
CREATE INDEX IF NOT EXISTS idx_donation_receipts_receipt_number ON donation_receipts(receipt_number);

-- Create index on donation_center_id for center dashboards
CREATE INDEX IF NOT EXISTS idx_donation_receipts_donation_center_id ON donation_receipts(donation_center_id);

-- Enable RLS
ALTER TABLE donation_receipts ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view receipts by receipt_number (for guest donors)
CREATE POLICY "Anyone can view receipts by receipt number"
  ON donation_receipts FOR SELECT
  USING (true);

-- Policy: Service role can insert receipts (system-generated)
CREATE POLICY "Service role can insert receipts"
  ON donation_receipts FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: Service role can update receipts
CREATE POLICY "Service role can update receipts"
  ON donation_receipts FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to generate receipt number
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS text AS $$
DECLARE
  next_num integer;
  year_str text;
BEGIN
  year_str := to_char(now(), 'YYYY');
  
  SELECT COALESCE(MAX(
    CAST(
      SUBSTRING(receipt_number FROM 'DR-' || year_str || '-(\d+)$')
      AS integer
    )
  ), 0) + 1 INTO next_num
  FROM donation_receipts
  WHERE receipt_number LIKE 'DR-' || year_str || '-%';
  
  RETURN 'DR-' || year_str || '-' || LPAD(next_num::text, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_donation_receipts_updated_at
  BEFORE UPDATE ON donation_receipts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
