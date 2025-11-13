# Donation Centers & Uber Direct Integration

## Current Status

### ✅ What's Working NOW
1. **Donation center database** - Fully functional
2. **Add location page** - Donation centers can add themselves
3. **Mock pricing** - Distance-based pricing estimates
4. **Booking flow** - Complete end-to-end flow
5. **Sponsorships** - Subsidized pricing system

### ❌ What's NOT Working
1. **Mapbox POI Search** - Mapbox does NOT support business/POI search
2. **Uber Direct API** - Not connected (mock pricing only)

## How to Populate Donation Centers

### Option 1: Via Donation Center Dashboard (RECOMMENDED)
1. Go to `/donation-center`
2. Sign up with email/password
3. Click "Add Location"
4. Fill in center details (name, address, accepted items)
5. Center appears in database immediately
6. Donors can now book pickups to this center

### Option 2: Direct Database Insert
```sql
INSERT INTO donation_centers (
  name, street_address, city, state, zip_code,
  latitude, longitude, accepted_items, is_active, is_verified
) VALUES (
  'Goodwill Austin', '1015 Norwood Park Blvd', 'Austin', 'TX', '78753',
  30.3572, -97.6847, ARRAY['Clothing', 'Furniture', 'Books'], true, true
);
```

### Option 3: Use Google Places API (Requires separate key)
- Mapbox does NOT work for POI/business search
- Would need Google Places API key
- Implementation would require new API integration

## Uber Direct API Integration

### Is Uber Direct Required?

**NO** - The app works fully without Uber Direct:
- ✅ Donors can book pickups
- ✅ Select donation centers
- ✅ See pricing (mock estimates)
- ✅ Enter payment info
- ✅ Receive confirmation

**Uber Direct is ONLY needed for:**
- Real-time delivery quotes (instead of mock estimates)
- Actual driver dispatch and delivery
- Live tracking of donations
- Production pricing accuracy

### Current Pricing (WITHOUT Uber)

**Mock Formula:**
```
Base fee: $3.50
Per mile: $0.85
Service fee: 25% markup
Driver tip: $4.00 (mandatory)
Stripe fee: 2.9% + $0.30
```

**Example:**
```
5 mile donation:
Uber cost: $3.50 + (5 × $0.85) = $7.75
Service fee: $1.94
Driver tip: $4.00
Subtotal: $13.69
Stripe fee: $0.52
Total: $14.21
```

This works fine for:
- Development/testing
- MVP/demo
- User experience testing
- Proof of concept

### To Connect Real Uber Direct API

**1. Get Uber Direct Credentials:**
- Sign up at https://developer.uber.com/
- Create app in dashboard
- Get: Client ID, Client Secret, Customer ID

**2. Add to .env:**
```env
VITE_UBER_CLIENT_ID=your_client_id
VITE_UBER_CLIENT_SECRET=your_client_secret
VITE_UBER_CUSTOMER_ID=your_customer_id
```

**3. Create Supabase Edge Function:**
```typescript
// supabase/functions/get-uber-quote/index.ts

// Handle OAuth authentication
// Call Uber API:
POST https://api.uber.com/v1/customers/{customer_id}/delivery_quotes

// Return pricing to client
```

**4. Update pricing.ts:**
```typescript
// Replace mockUberQuote with real API call:
const response = await fetch(
  `${supabaseUrl}/functions/v1/get-uber-quote`,
  {
    method: 'POST',
    body: JSON.stringify({ pickup, dropoff })
  }
);
```

### Why Edge Function?

Uber Direct requires:
- OAuth 2.0 authentication
- Server-side client secret
- Secure API requests
- Rate limiting management

Cannot be done from browser (security risk).

## Summary

### To Use the App Right Now:
1. **Add donation centers** via `/donation-center` dashboard
2. **Book donations** with mock pricing
3. **Test full flow** end-to-end
4. Uber Direct NOT required for testing/demo

### To Get Real Uber Pricing:
1. Get Uber Direct API credentials
2. Create Edge Function for secure API calls
3. Update pricing logic
4. Test with real quotes

### Database is the Key:
- App relies on `donation_centers` table
- Mapbox cannot find POI/businesses
- Must populate manually or via dashboard
- Once centers exist, everything else works
