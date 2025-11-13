-- Create company_transactions table for tracking credit purchases and usage
CREATE TABLE IF NOT EXISTS company_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  amount decimal(10, 2) NOT NULL,
  processing_fee decimal(10, 2) DEFAULT 0,
  total_charged decimal(10, 2) NOT NULL,
  type text NOT NULL CHECK (type IN ('credit_added', 'booking_charge', 'refund', 'adjustment')),
  payment_method text CHECK (payment_method IN ('stripe', 'manual', 'invoice')),
  stripe_payment_intent_id text,
  description text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_company_txns_company_id ON company_transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_company_txns_type ON company_transactions(type);
CREATE INDEX IF NOT EXISTS idx_company_txns_created_at ON company_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_company_txns_stripe_payment ON company_transactions(stripe_payment_intent_id);

-- Enable RLS
ALTER TABLE company_transactions ENABLE ROW LEVEL SECURITY;

-- Company owners can view their own transactions
CREATE POLICY "Company owners can view transactions"
  ON company_transactions FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_user_id = auth.uid()
    )
  );

-- Service role can insert transactions
CREATE POLICY "Service can insert transactions"
  ON company_transactions FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Add comment
COMMENT ON TABLE company_transactions IS 'Tracks all credit purchases, bookings, and adjustments for company accounts';
