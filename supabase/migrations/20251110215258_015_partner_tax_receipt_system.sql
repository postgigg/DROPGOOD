/*
  # Partner Tax Receipt System

  1. Changes to donation_centers table
    - Add `is_partner` boolean - whether center has partnership agreement
    - Add `can_auto_issue_receipts` boolean - whether we can auto-generate receipts
    - Add `ein` text - Federal EIN for tax receipts
    - Add `authorized_signer_name` text - Name of authorized representative
    - Add `partnership_agreement_signed_date` date - When agreement was signed
    - Add `receipt_email` text - Email to CC on receipts or for manual receipt requests
    - Add `receipt_logo_url` text - Logo to use on tax receipts
    
  2. Notes
    - Partner centers: is_partner=true, can_auto_issue_receipts=true
    - Non-partner centers: is_partner=false, can_auto_issue_receipts=false
    - All new fields are optional for existing centers
*/

-- Add partner and tax receipt fields to donation_centers
DO $$
BEGIN
  -- Partner status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'donation_centers' AND column_name = 'is_partner'
  ) THEN
    ALTER TABLE donation_centers
    ADD COLUMN is_partner boolean DEFAULT false NOT NULL;
  END IF;

  -- Auto-issue receipts capability
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'donation_centers' AND column_name = 'can_auto_issue_receipts'
  ) THEN
    ALTER TABLE donation_centers
    ADD COLUMN can_auto_issue_receipts boolean DEFAULT false NOT NULL;
  END IF;

  -- Federal EIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'donation_centers' AND column_name = 'ein'
  ) THEN
    ALTER TABLE donation_centers
    ADD COLUMN ein text;
  END IF;

  -- Authorized signer name
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'donation_centers' AND column_name = 'authorized_signer_name'
  ) THEN
    ALTER TABLE donation_centers
    ADD COLUMN authorized_signer_name text;
  END IF;

  -- Partnership agreement date
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'donation_centers' AND column_name = 'partnership_agreement_signed_date'
  ) THEN
    ALTER TABLE donation_centers
    ADD COLUMN partnership_agreement_signed_date date;
  END IF;

  -- Receipt email
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'donation_centers' AND column_name = 'receipt_email'
  ) THEN
    ALTER TABLE donation_centers
    ADD COLUMN receipt_email text;
  END IF;

  -- Receipt logo URL
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'donation_centers' AND column_name = 'receipt_logo_url'
  ) THEN
    ALTER TABLE donation_centers
    ADD COLUMN receipt_logo_url text;
  END IF;
END $$;

-- Add constraint: if can_auto_issue_receipts is true, must have EIN and authorized signer
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'auto_receipt_requires_ein_and_signer'
  ) THEN
    ALTER TABLE donation_centers
    ADD CONSTRAINT auto_receipt_requires_ein_and_signer
    CHECK (
      can_auto_issue_receipts = false OR 
      (ein IS NOT NULL AND authorized_signer_name IS NOT NULL)
    );
  END IF;
END $$;

-- Add index for filtering partner centers
CREATE INDEX IF NOT EXISTS idx_donation_centers_partner_status 
ON donation_centers(is_partner, can_auto_issue_receipts) 
WHERE is_partner = true;