# Charity Verification System - Implementation Plan

## Overview
A verification system that allows donation centers to claim and verify their listings, resulting in reduced service fees as an incentive.

## Current State (Unverified)
- **Service Fee:** 25% (default)
- **Status:** Any center can be added to the platform
- **Access:** Open signup (no verification)

## Verified State
- **Service Fee:** 15% (10% reduction)
- **Status:** Verified ownership of the donation center
- **Cost:** $99/month verification fee (or one-time fee - TBD)

## Verification Process

### Step 1: Claim Your Center
- Charity signs up and selects their location from existing centers
- If their center doesn't exist, they can add it
- System marks the center as "Verification Pending"

### Step 2: Document Submission
Charity must provide:
1. **501(c)(3) Determination Letter** from IRS
2. **EIN (Tax ID)** verification
3. **Proof of Authority:**
   - Business license
   - Utility bill at the location
   - Official letterhead
   - Board resolution (if applicable)
4. **Contact Verification:**
   - Official email domain (e.g., @goodwill.org)
   - Official phone number on charity website

### Step 3: Video Verification Call
- **30-minute Zoom meeting** with DropGood team
- Verify identity of representative
- Confirm they work at/represent the charity
- Tour of the facility (virtual or show photos)
- Discuss acceptance criteria, hours, special instructions

### Step 4: Background Check
- Cross-reference with IRS Tax Exempt Organization Search
- Check state charity registration
- Verify address matches official records
- Check charity reputation (BBB, Charity Navigator, etc.)

### Step 5: Approval
- DropGood approves verification
- Service fee drops from 25% → 15%
- "Verified" badge appears on center listing
- Access to premium dashboard features

## Database Schema Changes Needed

```sql
-- Add verification fields to donation_centers table
ALTER TABLE donation_centers ADD COLUMN is_verified BOOLEAN DEFAULT false;
ALTER TABLE donation_centers ADD COLUMN verification_status TEXT DEFAULT 'unverified'
  CHECK (verification_status IN ('unverified', 'pending', 'approved', 'rejected'));
ALTER TABLE donation_centers ADD COLUMN verified_at TIMESTAMPTZ;
ALTER TABLE donation_centers ADD COLUMN verification_notes TEXT;
ALTER TABLE donation_centers ADD COLUMN service_fee_percentage DECIMAL(5,2) DEFAULT 25.00;

-- Verification documents table
CREATE TABLE verification_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_center_id UUID REFERENCES donation_centers(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- 'ein', '501c3_letter', 'business_license', 'utility_bill', etc.
  file_url TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  verified_by UUID REFERENCES admin_users(id),
  verified_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT
);

-- Verification meetings table
CREATE TABLE verification_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_center_id UUID REFERENCES donation_centers(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  meeting_url TEXT,
  notes TEXT,
  conducted_by UUID REFERENCES admin_users(id),
  outcome TEXT CHECK (outcome IN ('passed', 'failed', 'rescheduled'))
);
```

## Pricing Options

### Option A: Monthly Subscription
- **$99/month** for verified status
- Service fee: 15% (vs 25% unverified)
- Cancel anytime, reverts to 25%

### Option B: One-Time Fee
- **$499 one-time** for lifetime verification
- Service fee: 15% forever
- Re-verification required if ownership changes

### Option C: Volume-Based
- Free verification if >50 pickups/month
- Otherwise $99/month
- Incentivizes high-volume centers

## Benefits of Verification

### For Charities:
1. **Lower fees:** Save 10% on every pickup (25% → 15%)
2. **Trust badge:** "Verified" badge on listings
3. **Higher visibility:** Verified centers ranked higher in search
4. **Priority support:** Dedicated account manager
5. **Advanced analytics:** Better dashboard insights
6. **Direct deposits:** Faster payout processing

### For DropGood:
1. **Quality control:** Ensure legitimate charities
2. **Reduced fraud risk:** Verified identities
3. **Recurring revenue:** $99/month per verified center
4. **Better relationships:** Direct contact with real charities
5. **Marketing opportunity:** "X verified charities" credibility

### For Donors:
1. **Trust:** Know they're donating to legitimate organizations
2. **Transparency:** See verified status before booking
3. **Better service:** Verified centers tend to be more professional

## UI/UX Changes

### Donation Center Auth Page
- Hide signup for now ("Coming Soon")
- Add "Get Verified" CTA for existing centers
- Link to verification information page

### Charity Cards (Selection)
- Add "✓ Verified" badge for verified centers
- Show "25% service fee" vs "15% service fee"
- Filter: "Show verified only"
- Sort by: "Verified first"

### Verification Dashboard
- Upload documents
- Schedule Zoom call
- Track verification status
- See fee savings calculator

## Timeline

### Phase 1: Hide Signup (Now)
- Set donation center pages to "Coming Soon"
- Document verification plan
- Gather feedback

### Phase 2: Build Verification System (2-4 weeks)
- Database schema updates
- Document upload system
- Scheduling integration (Calendly?)
- Admin review dashboard

### Phase 3: Soft Launch (Beta)
- Manually verify 3-5 charities
- Refine process based on feedback
- Test fee reduction logic

### Phase 4: Public Launch
- Open verification to all centers
- Marketing campaign
- "Get Verified" CTAs throughout platform

## Open Questions

1. **Pricing:** Monthly ($99) vs One-time ($499) vs Volume-based?
2. **Re-verification:** How often? Annually? When ownership changes?
3. **Rejection:** What happens if verification fails? Can they retry?
4. **Existing centers:** Grandfather in manually added centers?
5. **International:** How to verify non-US charities?
6. **Group verification:** One verification for multiple locations (e.g., all Goodwills)?

## Notes
- Keep unverified centers active (don't remove them)
- Verification is optional, not required to appear on platform
- Focus on high-volume centers first for beta testing
- Consider partnerships with charity databases (GuideStar, Charity Navigator)
