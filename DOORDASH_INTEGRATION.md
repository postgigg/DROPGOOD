# DoorDash Drive API Integration Guide

## Overview

This integration adds DoorDash Drive as a third delivery provider option alongside Roadie and Uber Direct. The system automatically compares quotes from all enabled providers and selects the cheapest option for each charity location.

## Architecture

### Files Created

1. **Database Migration**
   - `supabase/migrations/20251117020000_doordash_integration.sql`
   - Adds DoorDash fields to `bookings` table
   - Creates `doordash_webhook_logs` table
   - Updates `delivery_provider` constraint to include 'doordash'

2. **Authentication Helper**
   - `supabase/functions/_shared/doordash-auth.ts`
   - Generates JWT tokens with HMAC SHA256 signing
   - Implements DoorDash-specific header: `dd-ver: DD-JWT-V1`
   - Handles API requests with automatic token generation

3. **Edge Functions**
   - `supabase/functions/doordash-quote/index.ts` - Get delivery quotes
   - `supabase/functions/doordash-create-delivery/index.ts` - Create deliveries
   - `supabase/functions/doordash-webhook/index.ts` - Handle status updates

4. **Frontend Integration**
   - `src/lib/pricing.ts` - Added `getDoorDashQuotes()` function
   - `src/components/booking/StepCharities.tsx` - Multi-provider quote comparison

## Setup Instructions

### 1. Get DoorDash Credentials

1. Sign up at [DoorDash Developer Portal](https://developer.doordash.com/)
2. Create a new API key in the Credentials page
3. Save the following credentials:
   - `developer_id`
   - `key_id`
   - `signing_secret` (base64-encoded)

### 2. Configure Environment Variables

Add to your `.env` file (for local development) and Supabase secrets (for production):

```bash
# DoorDash Drive API Configuration
DOORDASH_DEVELOPER_ID=your_developer_id_here
DOORDASH_KEY_ID=your_key_id_here
DOORDASH_SIGNING_SECRET=your_base64_signing_secret_here
DOORDASH_ENVIRONMENT=sandbox  # or 'production' when approved
```

Add to your frontend `.env` file:

```bash
# Enable DoorDash quotes (optional - can enable alongside Roadie/Uber)
VITE_DOORDASH_ENABLED=true
```

### 3. Run Database Migration

```bash
# Run the migration
PGPASSWORD="your_password" psql "postgresql://postgres:your_password@db.your-project.supabase.co:5432/postgres" \
  -f /Users/bubblefreelancer/Desktop/project\ 284/supabase/migrations/20251117020000_doordash_integration.sql
```

### 4. Deploy Edge Functions

```bash
# Deploy all DoorDash functions
supabase functions deploy doordash-quote
supabase functions deploy doordash-create-delivery
supabase functions deploy doordash-webhook

# Set environment secrets
supabase secrets set DOORDASH_DEVELOPER_ID=your_developer_id_here
supabase secrets set DOORDASH_KEY_ID=your_key_id_here
supabase secrets set DOORDASH_SIGNING_SECRET=your_signing_secret_here
supabase secrets set DOORDASH_ENVIRONMENT=sandbox
```

### 5. Configure Webhook (Optional)

To receive delivery status updates:

1. In DoorDash Developer Portal, go to Webhooks
2. Add webhook URL: `https://your-project.supabase.co/functions/v1/doordash-webhook`
3. Subscribe to events:
   - `delivery.created`
   - `delivery.picked_up`
   - `delivery.delivered`
   - `delivery.cancelled`
   - `delivery.updated`

## How It Works

### Quote Flow

1. **User enters pickup address** → Step 1
2. **User uploads photos** → Step 2
3. **System searches for nearby charities** → Step 3
4. **Multi-provider quote comparison**:
   - Requests quotes from all enabled providers in parallel:
     - DoorDash (if `VITE_DOORDASH_ENABLED=true`)
     - Roadie (if `VITE_ROADIE_ENABLED=true`)
     - Uber Direct (if `VITE_UBER_ENABLED=true`)
   - Compares prices for each charity location
   - Selects cheapest provider for each location
   - Displays provider name to user (e.g., "via DoorDash")

5. **User selects charity and schedules pickup** → Step 4 & 5

### Delivery Creation Flow

1. **User completes payment** → Step 5
2. **System creates delivery** with selected provider:
   - If DoorDash was cheapest:
     - Accepts the quote (if created within 5 minutes)
     - Or creates direct delivery
   - Updates booking with DoorDash delivery ID
   - Stores tracking URL for customer

3. **Webhook updates** (automatic):
   - DoorDash sends status updates to webhook
   - System updates booking status
   - Customer receives notifications

## DoorDash Pricing

- **Base Rate**: $9.75 (up to 5 miles)
- **Per Mile**: $0.75/mile (5-15 miles)
- **Maximum Distance**: 15 miles
- **Discount**: $2.75 off if customer tips are enabled (100% goes to Dasher)
- **Vehicle Types**: Bicycle, walker, or car (auto-selected based on bags/boxes)

### Vehicle Selection Logic

```typescript
totalItems = bagsCount + boxesCount

if (totalItems <= 3) {
  allowedVehicles = ['bicycle', 'walker', 'car']  // Small loads
} else if (totalItems <= 6) {
  allowedVehicles = ['car']  // Medium loads
} else {
  allowedVehicles = ['car']  // Large loads
}
```

## Cost Comparison Example

For a 3-mile delivery with 2 bags, 1 box:

| Provider | Base Cost | Per Mile | Total | Winner |
|----------|-----------|----------|-------|--------|
| DoorDash | $9.75 | $0.00 (under 5mi) | **$9.75** | ✅ |
| Roadie | $12.50 | - | $12.50 | |
| Uber | $11.20 | - | $11.20 | |

System automatically selects DoorDash for this location.

## Testing

### 1. Sandbox Testing

DoorDash provides a sandbox environment for testing:

```bash
DOORDASH_ENVIRONMENT=sandbox
```

In sandbox mode:
- No real deliveries are created
- No charges are made
- Webhooks still work for testing

### 2. Test Quote Creation

```bash
curl -X POST https://your-project.supabase.co/functions/v1/doordash-quote \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "external_delivery_id": "test_quote_123",
    "pickup_address": {
      "street": "901 Market Street 6th Floor",
      "city": "San Francisco",
      "state": "CA",
      "zip_code": "94103"
    },
    "dropoff_address": {
      "street": "1 Market Street",
      "city": "San Francisco",
      "state": "CA",
      "zip_code": "94105"
    },
    "order_value": 1000,
    "dasher_allowed_vehicles": ["car"]
  }'
```

### 3. Production Access

⚠️ **Important**: Production access is currently restricted.

To get production access:
1. Complete sandbox testing
2. Apply for production access in DoorDash Developer Portal
3. Provide use case and business details
4. Wait for approval (typically 1-2 weeks)
5. Update environment: `DOORDASH_ENVIRONMENT=production`

## Monitoring

### View Webhook Logs

```sql
SELECT
  event_type,
  delivery_id,
  created_at,
  payload->>'delivery_status' as status
FROM doordash_webhook_logs
ORDER BY created_at DESC
LIMIT 10;
```

### View Bookings with DoorDash Deliveries

```sql
SELECT
  id,
  doordash_delivery_id,
  doordash_status,
  doordash_tracking_url,
  delivery_provider
FROM bookings
WHERE delivery_provider = 'doordash'
ORDER BY created_at DESC;
```

## Troubleshooting

### JWT Token Errors

**Error**: "Invalid JWT signature"
- **Cause**: Signing secret is not base64-decoded correctly
- **Fix**: Ensure `DOORDASH_SIGNING_SECRET` is the exact value from Developer Portal

**Error**: "JWT expired"
- **Cause**: Token older than 5 minutes
- **Fix**: Tokens are auto-regenerated - check system clock sync

### Quote Errors

**Error**: "Address not serviceable"
- **Cause**: Location outside DoorDash coverage area
- **Fix**: DoorDash has limited coverage - system will fall back to other providers

**Error**: "Quote expired"
- **Cause**: More than 5 minutes passed between quote and acceptance
- **Fix**: System handles this by creating direct delivery if quote expired

### Production Access

**Error**: "Production access restricted"
- **Cause**: Not yet approved for production
- **Fix**: Apply for production access in Developer Portal

## Feature Flags

Enable/disable DoorDash alongside other providers:

```bash
# Frontend
VITE_DOORDASH_ENABLED=true   # Enable DoorDash quotes
VITE_ROADIE_ENABLED=true     # Keep Roadie enabled
VITE_UBER_ENABLED=false      # Disable Uber

# Backend (Supabase secrets)
DOORDASH_ENVIRONMENT=sandbox  # sandbox or production
```

## Benefits

1. **Cost Optimization**: Automatically selects cheapest provider
2. **Reliability**: Fallback to other providers if DoorDash unavailable
3. **Coverage**: DoorDash extends delivery coverage area
4. **Competition**: Multiple providers compete on price
5. **Flexibility**: Can enable/disable providers without code changes

## Next Steps

1. **Get Sandbox Credentials** from DoorDash Developer Portal
2. **Configure Environment Variables** in Supabase
3. **Run Database Migration**
4. **Deploy Edge Functions**
5. **Test in Sandbox** with test addresses
6. **Apply for Production Access** when ready
7. **Enable for Customers** with `VITE_DOORDASH_ENABLED=true`

## Support

- DoorDash Developer Docs: https://developer.doordash.com/
- DoorDash Support: https://developer.doordash.com/en-US/support/
- JWT Helper: https://developer.doordash.com/en-US/docs/drive/how_to/JWTs/
