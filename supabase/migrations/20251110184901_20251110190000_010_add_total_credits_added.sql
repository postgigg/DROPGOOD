/*
  # Add Total Credits Added Tracking

  1. Changes to sponsorships table
    - Add `total_credits_added` column to track cumulative funds added
    - Default to 0 for existing records

  2. Purpose
    - Track total amount of funds added to sponsorships over time
    - Used for financial reporting and analytics
*/

-- Add total credits added column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sponsorships' AND column_name = 'total_credits_added'
  ) THEN
    ALTER TABLE sponsorships
    ADD COLUMN total_credits_added DECIMAL(10, 2) DEFAULT 0 NOT NULL;
  END IF;
END $$;
