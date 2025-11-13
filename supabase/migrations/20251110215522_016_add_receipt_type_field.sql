/*
  # Add receipt_type field to donation_receipts

  1. Changes to donation_receipts table
    - Add `receipt_type` text field - either 'tax_receipt' or 'donation_summary'
    - Default to 'tax_receipt' for backward compatibility
  
  2. Notes
    - 'tax_receipt' = Full IRS-compliant tax receipt for partner centers
    - 'donation_summary' = Summary document for non-partner centers
*/

-- Add receipt_type field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'donation_receipts' AND column_name = 'receipt_type'
  ) THEN
    ALTER TABLE donation_receipts
    ADD COLUMN receipt_type text DEFAULT 'tax_receipt' NOT NULL;
  END IF;
END $$;

-- Add check constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'valid_receipt_type'
  ) THEN
    ALTER TABLE donation_receipts
    ADD CONSTRAINT valid_receipt_type
    CHECK (receipt_type IN ('tax_receipt', 'donation_summary'));
  END IF;
END $$;