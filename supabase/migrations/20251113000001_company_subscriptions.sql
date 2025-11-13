/*
  # Company B2B Subscription System

  ## Overview
  This migration creates a B2B company subscription system where companies can:
  - Subscribe to provide employee wellness benefits
  - Pay annual/monthly fees for unlimited or capped employee usage
  - Subsidize donation pickup costs for their employees (0-100%)
  - Stack subsidies with charity sponsorships (charity + company = up to 100%+ discount)

  ## New Tables

  ### `companies`
  - Company account management
  - Subscription details (tier, pricing, duration)
  - Subsidy percentage for employees
  - Usage tracking and limits

  ### `company_employees`
  - Links employees to companies
  - Tracks employee usage and benefits received
  - Supports both registered users and guest users (email-based)

  ### `company_subscription_transactions`
  - Tracks each company subsidy deduction
  - Links to bookings for audit trail
  - Records stacked subsidies (charity + company)

  ## Modified Tables

  ### `bookings`
  - Add company_id, company_subsidy_amount, company_subsidy_percentage
  - Rename subsidy fields to clarify charity vs company
  - Add total_subsidy_amount for combined discounts

  ## Security
  - RLS enabled on all company tables
  - Companies can only access their own data
  - Employees can view their company benefits
  - Public can check employee eligibility during booking
*/

-- ============================================================================
-- CREATE TABLES
-- ============================================================================

-- Companies table - Corporate accounts that provide employee benefits
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Company information
  name text NOT NULL,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text NOT NULL,
  logo_url text,
  website text,

  -- Account status
  account_status text NOT NULL DEFAULT 'active' CHECK (account_status IN ('active', 'inactive', 'suspended')),

  -- Employee tracking (unlimited)
  current_employee_count integer DEFAULT 0,

  -- Subsidy configuration
  subsidy_percentage integer NOT NULL CHECK (subsidy_percentage >= 0 AND subsidy_percentage <= 100) DEFAULT 50,

  -- Credit balance (similar to donation center sponsorships)
  current_credit_balance decimal(10, 2) DEFAULT 0 CHECK (current_credit_balance >= 0),
  total_credits_added decimal(10, 2) DEFAULT 0,
  total_credits_used decimal(10, 2) DEFAULT 0,
  low_balance_threshold decimal(10, 2) DEFAULT 100.00, -- Alert when balance hits this
  auto_recharge_enabled boolean DEFAULT false,
  auto_recharge_amount decimal(10, 2) DEFAULT 500.00,
  auto_recharge_threshold decimal(10, 2) DEFAULT 250.00,

  -- Usage tracking
  monthly_usage_limit decimal(10, 2), -- NULL = unlimited, optional spending cap per month
  current_month_spent decimal(10, 2) DEFAULT 0,
  total_lifetime_spent decimal(10, 2) DEFAULT 0,
  total_bookings_count integer DEFAULT 0,

  -- Employee access
  employee_access_code text UNIQUE NOT NULL, -- Unique code employees use to join
  require_email_domain boolean DEFAULT false, -- If true, only emails matching allowed_email_domains can join
  allowed_email_domains text[], -- e.g., ['@company.com', '@subsidiary.com']
  require_approval boolean DEFAULT false, -- If true, employees need company approval before joining

  -- Metadata
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Auth link (which auth.user created this company)
  owner_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Company employees table - Links employees to company benefits
CREATE TABLE IF NOT EXISTS company_employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,

  -- Employee identification
  user_id uuid REFERENCES users(id) ON DELETE SET NULL, -- NULL for guest users
  email text NOT NULL,
  first_name text,
  last_name text,

  -- Status
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'removed')),

  -- Tracking
  invited_at timestamptz DEFAULT now(),
  joined_at timestamptz,
  last_booking_at timestamptz,
  total_bookings_count integer DEFAULT 0,
  total_subsidy_received decimal(10, 2) DEFAULT 0,

  -- Metadata
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Unique constraint: one employee per company per email
  UNIQUE(company_id, email)
);

-- Company subscription transactions - Audit trail of company subsidies
CREATE TABLE IF NOT EXISTS company_subscription_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  booking_id text REFERENCES bookings(id) ON DELETE SET NULL,
  employee_id uuid REFERENCES company_employees(id) ON DELETE SET NULL,

  -- Pricing breakdown
  original_price decimal(10, 2) NOT NULL, -- Base price before any subsidies
  charity_subsidy_amount decimal(10, 2) DEFAULT 0, -- Charity's contribution
  company_subsidy_amount decimal(10, 2) NOT NULL, -- Company's contribution
  customer_paid_amount decimal(10, 2) NOT NULL, -- What customer actually paid

  -- Subsidy percentages
  charity_subsidy_percentage integer DEFAULT 0,
  company_subsidy_percentage integer NOT NULL,

  -- Metadata
  created_at timestamptz DEFAULT now(),

  -- Constraints
  CHECK (charity_subsidy_amount >= 0),
  CHECK (company_subsidy_amount >= 0),
  CHECK (customer_paid_amount >= 0),
  CHECK (original_price = charity_subsidy_amount + company_subsidy_amount + customer_paid_amount)
);

-- ============================================================================
-- MODIFY EXISTING TABLES
-- ============================================================================

-- Add company subsidy fields to bookings table
DO $$
BEGIN
  -- Add company_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE bookings
    ADD COLUMN company_id uuid REFERENCES companies(id) ON DELETE SET NULL;
  END IF;

  -- Add company_employee_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'company_employee_id'
  ) THEN
    ALTER TABLE bookings
    ADD COLUMN company_employee_id uuid REFERENCES company_employees(id) ON DELETE SET NULL;
  END IF;

  -- Add company_subsidy_amount
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'company_subsidy_amount'
  ) THEN
    ALTER TABLE bookings
    ADD COLUMN company_subsidy_amount decimal(10, 2) DEFAULT 0;
  END IF;

  -- Add company_subsidy_percentage
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'company_subsidy_percentage'
  ) THEN
    ALTER TABLE bookings
    ADD COLUMN company_subsidy_percentage integer DEFAULT 0;
  END IF;

  -- Rename subsidy_amount to charity_subsidy_amount (if exists and not already renamed)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'subsidy_amount'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'charity_subsidy_amount'
  ) THEN
    ALTER TABLE bookings
    RENAME COLUMN subsidy_amount TO charity_subsidy_amount;
  END IF;

  -- Add charity_subsidy_amount if it doesn't exist (for fresh installs)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'charity_subsidy_amount'
  ) THEN
    ALTER TABLE bookings
    ADD COLUMN charity_subsidy_amount decimal(10, 2) DEFAULT 0;
  END IF;

  -- Rename subsidy_percentage to charity_subsidy_percentage (if exists and not already renamed)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'subsidy_percentage'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'charity_subsidy_percentage'
  ) THEN
    ALTER TABLE bookings
    RENAME COLUMN subsidy_percentage TO charity_subsidy_percentage;
  END IF;

  -- Add charity_subsidy_percentage if it doesn't exist (for fresh installs)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'charity_subsidy_percentage'
  ) THEN
    ALTER TABLE bookings
    ADD COLUMN charity_subsidy_percentage integer DEFAULT 0;
  END IF;

  -- Add total_subsidy_amount (charity + company combined)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'total_subsidy_amount'
  ) THEN
    ALTER TABLE bookings
    ADD COLUMN total_subsidy_amount decimal(10, 2) DEFAULT 0;
  END IF;
END $$;

-- ============================================================================
-- CREATE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(subscription_status) WHERE subscription_status = 'active';
CREATE INDEX IF NOT EXISTS idx_companies_access_code ON companies(employee_access_code);
CREATE INDEX IF NOT EXISTS idx_companies_owner ON companies(owner_user_id);

CREATE INDEX IF NOT EXISTS idx_company_employees_company ON company_employees(company_id);
CREATE INDEX IF NOT EXISTS idx_company_employees_user ON company_employees(user_id);
CREATE INDEX IF NOT EXISTS idx_company_employees_email ON company_employees(email);
CREATE INDEX IF NOT EXISTS idx_company_employees_status ON company_employees(status) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_company_txns_company ON company_subscription_transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_company_txns_booking ON company_subscription_transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_company_txns_employee ON company_subscription_transactions(employee_id);

CREATE INDEX IF NOT EXISTS idx_bookings_company ON bookings(company_id);
CREATE INDEX IF NOT EXISTS idx_bookings_company_employee ON bookings(company_employee_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_subscription_transactions ENABLE ROW LEVEL SECURITY;

-- Companies policies
CREATE POLICY "Companies can view own data"
  ON companies FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Companies can update own data"
  ON companies FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_user_id)
  WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Anyone can create company account"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Public can check company by access code"
  ON companies FOR SELECT
  TO public
  USING (account_status = 'active');

-- Company employees policies
CREATE POLICY "Companies can view their employees"
  ON company_employees FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_user_id = auth.uid()
    )
  );

CREATE POLICY "Companies can manage their employees"
  ON company_employees FOR ALL
  TO authenticated
  USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_user_id = auth.uid()
    )
  );

CREATE POLICY "Employees can view their own record"
  ON company_employees FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Public can check employee eligibility"
  ON company_employees FOR SELECT
  TO public
  USING (status = 'active');

CREATE POLICY "Anyone can create employee record (join company)"
  ON company_employees FOR INSERT
  TO public
  WITH CHECK (true);

-- Company transactions policies
CREATE POLICY "Companies can view their transactions"
  ON company_subscription_transactions FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT id FROM companies WHERE owner_user_id = auth.uid()
    )
  );

CREATE POLICY "Employees can view their transactions"
  ON company_subscription_transactions FOR SELECT
  TO authenticated
  USING (
    employee_id IN (
      SELECT id FROM company_employees WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can create company transactions"
  ON company_subscription_transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================================
-- SQL FUNCTIONS
-- ============================================================================

-- Function to check if employee is eligible for company subsidy
CREATE OR REPLACE FUNCTION check_employee_company_eligibility(
  p_email text,
  p_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  company_id uuid,
  company_name text,
  subsidy_percentage integer,
  employee_id uuid,
  is_eligible boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.name,
    c.subsidy_percentage,
    ce.id,
    CASE
      WHEN c.account_status = 'active'
        AND ce.status = 'active'
        AND c.current_credit_balance > 0
        AND (c.monthly_usage_limit IS NULL OR c.current_month_spent < c.monthly_usage_limit)
      THEN true
      ELSE false
    END as is_eligible
  FROM company_employees ce
  JOIN companies c ON c.id = ce.company_id
  WHERE ce.email = p_email
    AND (p_user_id IS NULL OR ce.user_id = p_user_id)
    AND ce.status = 'active'
  ORDER BY c.subsidy_percentage DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate stacked subsidies (charity + company)
CREATE OR REPLACE FUNCTION calculate_stacked_subsidies(
  p_base_price decimal,
  p_charity_subsidy_percentage integer DEFAULT 0,
  p_company_subsidy_percentage integer DEFAULT 0
)
RETURNS TABLE (
  charity_subsidy_amount decimal,
  company_subsidy_amount decimal,
  total_subsidy_amount decimal,
  customer_pays_amount decimal
) AS $$
DECLARE
  v_charity_subsidy decimal;
  v_remaining_price decimal;
  v_company_subsidy decimal;
  v_total_subsidy decimal;
  v_customer_pays decimal;
BEGIN
  -- Step 1: Apply charity subsidy to full price
  v_charity_subsidy := p_base_price * (p_charity_subsidy_percentage::decimal / 100);

  -- Step 2: Calculate remaining price after charity subsidy
  v_remaining_price := p_base_price - v_charity_subsidy;

  -- Step 3: Apply company subsidy to remaining price
  v_company_subsidy := v_remaining_price * (p_company_subsidy_percentage::decimal / 100);

  -- Step 4: Calculate totals
  v_total_subsidy := v_charity_subsidy + v_company_subsidy;
  v_customer_pays := GREATEST(0, p_base_price - v_total_subsidy);

  RETURN QUERY
  SELECT
    ROUND(v_charity_subsidy, 2),
    ROUND(v_company_subsidy, 2),
    ROUND(v_total_subsidy, 2),
    ROUND(v_customer_pays, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to deduct company subsidy and create transaction
CREATE OR REPLACE FUNCTION deduct_company_subsidy(
  p_company_id uuid,
  p_employee_id uuid,
  p_booking_id text,
  p_original_price decimal,
  p_charity_subsidy_amount decimal,
  p_company_subsidy_amount decimal,
  p_customer_paid_amount decimal,
  p_charity_subsidy_percentage integer,
  p_company_subsidy_percentage integer
)
RETURNS boolean AS $$
DECLARE
  v_monthly_limit decimal;
  v_current_spent decimal;
  v_current_balance decimal;
BEGIN
  -- Check current credit balance
  SELECT current_credit_balance
  INTO v_current_balance
  FROM companies
  WHERE id = p_company_id;

  IF v_current_balance < p_company_subsidy_amount THEN
    RAISE EXCEPTION 'Insufficient credit balance. Company needs to add funds.';
    RETURN false;
  END IF;

  -- Check monthly usage limit (if set)
  SELECT monthly_usage_limit, current_month_spent
  INTO v_monthly_limit, v_current_spent
  FROM companies
  WHERE id = p_company_id;

  IF v_monthly_limit IS NOT NULL THEN
    IF (v_current_spent + p_company_subsidy_amount) > v_monthly_limit THEN
      RAISE EXCEPTION 'Company monthly usage limit exceeded';
      RETURN false;
    END IF;
  END IF;

  -- Deduct from credit balance and update spending
  UPDATE companies
  SET
    current_credit_balance = current_credit_balance - p_company_subsidy_amount,
    total_credits_used = total_credits_used + p_company_subsidy_amount,
    current_month_spent = current_month_spent + p_company_subsidy_amount,
    total_lifetime_spent = total_lifetime_spent + p_company_subsidy_amount,
    total_bookings_count = total_bookings_count + 1,
    updated_at = now()
  WHERE id = p_company_id;

  -- Update employee stats
  UPDATE company_employees
  SET
    total_bookings_count = total_bookings_count + 1,
    total_subsidy_received = total_subsidy_received + p_company_subsidy_amount,
    last_booking_at = now(),
    updated_at = now()
  WHERE id = p_employee_id;

  -- Create transaction record
  INSERT INTO company_subscription_transactions (
    company_id,
    employee_id,
    booking_id,
    original_price,
    charity_subsidy_amount,
    company_subsidy_amount,
    customer_paid_amount,
    charity_subsidy_percentage,
    company_subsidy_percentage
  ) VALUES (
    p_company_id,
    p_employee_id,
    p_booking_id,
    p_original_price,
    p_charity_subsidy_amount,
    p_company_subsidy_amount,
    p_customer_paid_amount,
    p_charity_subsidy_percentage,
    p_company_subsidy_percentage
  );

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add credits to company account
CREATE OR REPLACE FUNCTION add_company_credits(
  p_company_id uuid,
  p_amount decimal,
  p_payment_method text DEFAULT 'stripe',
  p_transaction_id text DEFAULT NULL
)
RETURNS boolean AS $$
BEGIN
  UPDATE companies
  SET
    current_credit_balance = current_credit_balance + p_amount,
    total_credits_added = total_credits_added + p_amount,
    updated_at = now()
  WHERE id = p_company_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if company needs recharge (low balance alert)
CREATE OR REPLACE FUNCTION check_company_low_balance(
  p_company_id uuid
)
RETURNS boolean AS $$
DECLARE
  v_balance decimal;
  v_threshold decimal;
BEGIN
  SELECT current_credit_balance, low_balance_threshold
  INTO v_balance, v_threshold
  FROM companies
  WHERE id = p_company_id;

  RETURN v_balance < v_threshold;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique access code for companies
CREATE OR REPLACE FUNCTION generate_company_access_code()
RETURNS text AS $$
DECLARE
  v_code text;
  v_exists boolean;
BEGIN
  LOOP
    -- Generate random 8-character code (uppercase letters and numbers)
    v_code := UPPER(substr(md5(random()::text), 1, 8));

    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM companies WHERE employee_access_code = v_code) INTO v_exists;

    EXIT WHEN NOT v_exists;
  END LOOP;

  RETURN v_code;
END;
$$ LANGUAGE plpgsql;

-- Function to reset monthly spending (run via cron job on 1st of each month)
CREATE OR REPLACE FUNCTION reset_monthly_company_spending()
RETURNS void AS $$
BEGIN
  UPDATE companies
  SET current_month_spent = 0
  WHERE account_status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp for companies
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at timestamp for company_employees
DROP TRIGGER IF EXISTS update_company_employees_updated_at ON company_employees;
CREATE TRIGGER update_company_employees_updated_at
  BEFORE UPDATE ON company_employees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update company employee count when employee is added/removed
CREATE OR REPLACE FUNCTION update_company_employee_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE companies
    SET current_employee_count = current_employee_count + 1
    WHERE id = NEW.company_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE companies
    SET current_employee_count = GREATEST(0, current_employee_count - 1)
    WHERE id = OLD.company_id;
  ELSIF TG_OP = 'UPDATE' THEN
    -- If status changed to inactive/removed, decrement count
    IF OLD.status = 'active' AND NEW.status IN ('inactive', 'removed') THEN
      UPDATE companies
      SET current_employee_count = GREATEST(0, current_employee_count - 1)
      WHERE id = NEW.company_id;
    -- If status changed to active, increment count
    ELSIF OLD.status IN ('inactive', 'removed', 'pending') AND NEW.status = 'active' THEN
      UPDATE companies
      SET current_employee_count = current_employee_count + 1
      WHERE id = NEW.company_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_company_employee_count ON company_employees;
CREATE TRIGGER trigger_update_company_employee_count
  AFTER INSERT OR UPDATE OR DELETE ON company_employees
  FOR EACH ROW
  EXECUTE FUNCTION update_company_employee_count();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE companies IS 'Corporate accounts that subscribe to provide employee wellness benefits';
COMMENT ON TABLE company_employees IS 'Employees linked to companies who receive subsidized pickup services';
COMMENT ON TABLE company_subscription_transactions IS 'Audit trail of all company subsidy deductions';

COMMENT ON COLUMN companies.subsidy_percentage IS 'Percentage of pickup cost company subsidizes for employees (0-100%)';
COMMENT ON COLUMN companies.monthly_usage_limit IS 'Optional monthly spending cap (NULL = unlimited)';
COMMENT ON COLUMN companies.employee_access_code IS 'Unique code employees use to join company benefits program';

COMMENT ON FUNCTION calculate_stacked_subsidies IS 'Calculates stacked subsidies: charity subsidy applied first, then company subsidy on remaining amount';
COMMENT ON FUNCTION check_employee_company_eligibility IS 'Checks if employee email is eligible for company subsidy benefits';
COMMENT ON FUNCTION deduct_company_subsidy IS 'Deducts company subsidy amount and creates audit transaction record';
