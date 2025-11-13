-- Allow anonymous users to submit new donation centers for admin review
-- These charities will be created with is_active = false and require admin approval

CREATE POLICY "Anyone can submit new donation centers for review"
ON donation_centers
FOR INSERT
WITH CHECK (is_active = false);
