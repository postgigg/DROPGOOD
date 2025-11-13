# Uber Direct Integration - Quick Start

## ✅ What's Been Built

Your donation platform now has **complete Uber Direct API integration** ready to go!

### 🚀 Edge Functions Created (4 total)

1. **uber-quote** - Get real-time delivery pricing
2. **uber-create-delivery** - Dispatch actual Uber driver
3. **uber-get-delivery** - Track delivery status
4. **uber-webhook** - Receive live status updates

### 📊 Database Updated

- Added Uber tracking columns to `bookings` table
- Created `uber_webhook_logs` table for monitoring
- All with proper RLS security policies

### 💻 Frontend Ready

- Pricing module supports both mock and real Uber API
- Easy toggle: Set `USE_REAL_UBER = true` in `src/lib/pricing.ts`
- Automatic fallback to mock pricing if API fails

## 🎯 Quick Setup (3 Steps)

### Step 1: Get Uber Credentials

1. Sign up: https://developer.uber.com/
2. Create an app for "Uber Direct"
3. Get these 3 values:
   - **Client ID**
   - **Client Secret**
   - **Customer ID**

### Step 2: Add to Supabase

Via Dashboard or CLI:

```bash
# Supabase Dashboard Method:
Project Settings → Edge Functions → Secrets → Add

# Or via CLI:
supabase secrets set UBER_CLIENT_ID=your_id
supabase secrets set UBER_CLIENT_SECRET=your_secret
supabase secrets set UBER_CUSTOMER_ID=your_customer_id
```

### Step 3: Enable Real Pricing

In `src/lib/pricing.ts`, change line 62:

```typescript
const USE_REAL_UBER = true;  // Change from false to true
```

**That's it!** Your platform will now use real Uber Direct API.

## 📱 How It Works

### Current Flow (Mock Pricing)
```
User books donation → Mock price calculation → Shows estimate
```

### With Uber Connected (Real Pricing)
```
User books donation
    ↓
Real Uber quote via Edge Function
    ↓
Shows actual price
    ↓
User confirms
    ↓
Real Uber driver dispatched
    ↓
Live tracking updates via webhooks
    ↓
Delivery completed
```

## 🧪 Testing

### Test Without Uber (Current State)
- Everything works with mock pricing
- No Uber account needed
- Perfect for development

### Test With Uber Sandbox
1. Get Uber **test** credentials
2. Add to Supabase secrets
3. Set `USE_REAL_UBER = true`
4. Test quotes (instant, no charges)
5. Test deliveries (instant completion)

### Production Launch
1. Get Uber **production** credentials
2. Replace test credentials
3. Configure webhook URL
4. Test with real delivery
5. Go live!

## 🔧 Configuration Reference

### Environment Variables Needed

```bash
# Required for Uber Direct
UBER_CLIENT_ID=your_client_id
UBER_CLIENT_SECRET=your_client_secret
UBER_CUSTOMER_ID=your_customer_id

# Already configured (from Supabase)
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### Toggle Real vs Mock Pricing

**File:** `src/lib/pricing.ts`
**Line:** 62

```typescript
// Use mock pricing (current):
const USE_REAL_UBER = false;

// Use real Uber API:
const USE_REAL_UBER = true;
```

## 📋 Webhook Setup (Optional)

For real-time delivery tracking, configure webhook in Uber Dashboard:

**Webhook URL:**
```
https://your-project.supabase.co/functions/v1/uber-webhook
```

**Subscribe to events:**
- delivery.status.updated
- delivery.courier.assigned
- delivery.delivered

## 💡 Pricing Comparison

### Mock Pricing (Current)
- Base: $3.50
- Per mile: $0.85
- Instant calculation
- No API calls needed

### Real Uber Pricing
- Dynamic based on:
  - Distance
  - Time of day
  - Demand
  - Traffic
- Accurate quotes
- Real driver costs

## 🎨 Frontend Integration Examples

### Get Quote
```typescript
const response = await fetch(
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/uber-quote`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pickup_latitude: 40.7589,
      pickup_longitude: -73.9851,
      pickup_address: 'Donor Address',
      dropoff_latitude: 40.7484,
      dropoff_longitude: -73.9857,
      dropoff_address: 'Donation Center Address',
    }),
  }
);

const { fee_cents, quote_id } = await response.json();
console.log(`Price: $${(fee_cents / 100).toFixed(2)}`);
```

### Create Delivery
```typescript
const response = await fetch(
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/uber-create-delivery`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      booking_id: 'uuid',
      quote_id: 'from-previous-quote',
      pickup_name: 'John Doe',
      pickup_address: '123 Main St',
      pickup_latitude: 40.7589,
      pickup_longitude: -73.9851,
      pickup_phone_number: '+15555551234',
      dropoff_name: 'Goodwill NYC',
      dropoff_address: '456 Park Ave',
      dropoff_latitude: 40.7484,
      dropoff_longitude: -73.9857,
      dropoff_phone_number: '+15555555678',
      manifest_reference: 'DONATION-123',
      manifest_items: [
        { name: 'Clothing', quantity: 5, size: 'medium' }
      ],
    }),
  }
);

const { tracking_url, delivery_id } = await response.json();
console.log('Track delivery:', tracking_url);
```

## 🚨 Common Issues

### "Uber credentials not configured"
✅ **Fix:** Add all 3 secrets to Supabase Edge Functions

### Mock pricing still being used
✅ **Fix:** Set `USE_REAL_UBER = true` in pricing.ts and rebuild

### "OAuth failed"
✅ **Fix:** Verify credentials are correct, check scope is `eats.deliveries`

### "Address undeliverable"
✅ **Fix:** Location outside Uber service area, try different address

## 📚 Full Documentation

See `UBER_DIRECT_SETUP.md` for:
- Complete API reference
- All Edge Function details
- Database schema documentation
- Webhook configuration
- Production checklist
- Troubleshooting guide

## 🎯 Next Steps

1. **Now:** Keep using mock pricing for development
2. **When ready:** Get Uber test credentials
3. **Test:** Enable real API with test credentials
4. **Launch:** Switch to production credentials

Your platform is **production-ready** for Uber Direct! 🎉
