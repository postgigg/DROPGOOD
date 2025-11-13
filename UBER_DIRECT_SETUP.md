# Uber Direct Integration - Complete Setup Guide

## Overview

This platform now has **complete Uber Direct API integration** with OAuth authentication, real-time quotes, delivery creation, and webhook support for live tracking.

## Architecture

```
Frontend → Supabase Edge Functions → Uber Direct API
                                  ↓
                             Database Updates
                                  ↓
                          Webhook Notifications
```

## Edge Functions Created

### 1. **uber-quote** - Get Real-Time Pricing
**Endpoint:** `POST /functions/v1/uber-quote`

**Purpose:** Gets actual delivery quotes from Uber Direct API

**Request:**
```typescript
{
  pickup_latitude: number,
  pickup_longitude: number,
  pickup_address: string,
  dropoff_latitude: number,
  dropoff_longitude: number,
  dropoff_address: string,
  pickup_phone_number?: string,  // Optional
  dropoff_phone_number?: string  // Optional
}
```

**Response:**
```typescript
{
  quote_id: string,           // Use this to create delivery
  fee_cents: number,          // Uber's fee in cents
  currency: string,           // "USD"
  dropoff_eta: string,        // ISO timestamp
  duration_minutes: number,   // Total delivery time
  pickup_duration_minutes: number,
  expires: string,            // Quote expiration time
  created: string
}
```

### 2. **uber-create-delivery** - Dispatch Real Driver
**Endpoint:** `POST /functions/v1/uber-create-delivery`

**Purpose:** Creates actual Uber delivery and dispatches driver

**Request:**
```typescript
{
  booking_id: string,
  quote_id: string,
  pickup_name: string,
  pickup_address: string,
  pickup_latitude: number,
  pickup_longitude: number,
  pickup_phone_number: string,
  dropoff_name: string,
  dropoff_address: string,
  dropoff_latitude: number,
  dropoff_longitude: number,
  dropoff_phone_number: string,
  dropoff_notes?: string,
  manifest_reference: string,
  manifest_items: Array<{
    name: string,
    quantity: number,
    size?: 'small' | 'medium' | 'large' | 'xlarge'
  }>
}
```

**Response:**
```typescript
{
  delivery_id: string,        // Uber delivery ID
  tracking_url: string,       // Public tracking URL
  status: string,             // "pending", "pickup", etc.
  pickup_eta: string,
  dropoff_eta: string,
  courier: {                  // null until assigned
    name: string,
    phone_number: string,
    vehicle_type: string,
    location: { lat: number, lng: number }
  }
}
```

### 3. **uber-get-delivery** - Track Delivery Status
**Endpoint:** `POST /functions/v1/uber-get-delivery`

**Purpose:** Get current delivery status and courier info

**Request:**
```typescript
{
  delivery_id: string
}
```

**Response:**
```typescript
{
  id: string,
  status: string,
  tracking_url: string,
  courier: object,
  pickup_eta: string,
  dropoff_eta: string,
  pickup: object,
  dropoff: object,
  complete: boolean
}
```

### 4. **uber-webhook** - Receive Live Updates
**Endpoint:** `POST /functions/v1/uber-webhook`

**Purpose:** Receives real-time updates from Uber (courier assigned, picked up, delivered, etc.)

**Automatically updates database with:**
- Delivery status changes
- Courier information
- Location updates
- ETA changes

## Required Environment Variables

You **MUST** add these to your Supabase project:

```bash
UBER_CLIENT_ID=your_uber_client_id
UBER_CLIENT_SECRET=your_uber_client_secret
UBER_CUSTOMER_ID=your_uber_customer_id
```

### How to Get Uber Credentials

1. **Sign up for Uber Direct**
   - Go to: https://developer.uber.com/
   - Click "Get Started" → "Uber Direct"
   - Complete business verification

2. **Create App in Uber Developer Dashboard**
   - Navigate to: https://developer.uber.com/dashboard/
   - Click "Create App"
   - Select "Uber Direct" product
   - Note your **Client ID** and **Client Secret**

3. **Get Customer ID**
   - In dashboard, go to "Organization"
   - Copy your **Customer ID** (starts with `cus_` or is a UUID)

4. **Add to Supabase**
   ```bash
   # Via Supabase Dashboard:
   Project Settings → Edge Functions → Add secret

   # Or via CLI:
   supabase secrets set UBER_CLIENT_ID=your_id
   supabase secrets set UBER_CLIENT_SECRET=your_secret
   supabase secrets set UBER_CUSTOMER_ID=your_customer_id
   ```

## Database Schema Updates

### Bookings Table - New Columns
```sql
uber_delivery_id text          -- Uber's delivery identifier
uber_quote_id text             -- Quote used to create delivery
uber_tracking_url text         -- Public tracking URL
uber_status text               -- pending, pickup, dropoff, delivered, canceled, returned
courier_info jsonb             -- Courier details
pickup_eta timestamptz         -- When courier will arrive at pickup
dropoff_eta timestamptz        -- When delivery will be completed
```

### New Table: uber_webhook_logs
Stores all incoming webhook events for debugging and auditing.

## Frontend Integration Example

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
      pickup_address: '123 Main St, New York, NY',
      dropoff_latitude: 40.7484,
      dropoff_longitude: -73.9857,
      dropoff_address: '456 Park Ave, New York, NY',
    }),
  }
);

const quote = await response.json();
console.log('Uber quote:', quote.fee_cents / 100, quote.currency);
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
      booking_id: 'booking_uuid',
      quote_id: quote.quote_id,
      pickup_name: 'Donor Name',
      pickup_address: '123 Main St, New York, NY',
      pickup_latitude: 40.7589,
      pickup_longitude: -73.9851,
      pickup_phone_number: '+15555551234',
      dropoff_name: 'Goodwill NYC',
      dropoff_address: '456 Park Ave, New York, NY',
      dropoff_latitude: 40.7484,
      dropoff_longitude: -73.9857,
      dropoff_phone_number: '+15555555678',
      dropoff_notes: 'Call when arriving',
      manifest_reference: 'DONATION-001',
      manifest_items: [
        { name: 'Clothing', quantity: 5, size: 'medium' },
        { name: 'Books', quantity: 10, size: 'small' },
      ],
    }),
  }
);

const delivery = await response.json();
console.log('Tracking URL:', delivery.tracking_url);
```

## Webhook Setup

### Configure in Uber Dashboard

1. Go to: https://developer.uber.com/dashboard/
2. Select your app
3. Navigate to "Webhooks"
4. Add webhook URL: `https://your-project.supabase.co/functions/v1/uber-webhook`
5. Subscribe to events:
   - `delivery.status.updated`
   - `delivery.courier.assigned`
   - `delivery.en_route_to_pickup`
   - `delivery.arrived_at_pickup`
   - `delivery.picked_up`
   - `delivery.en_route_to_dropoff`
   - `delivery.arrived_at_dropoff`
   - `delivery.delivered`
   - `delivery.canceled`
   - `delivery.returned`

### Webhook Events Received

Every time delivery status changes, Uber sends a webhook to your Edge Function, which automatically:
1. Updates the `bookings` table with new status
2. Updates courier information
3. Updates ETAs
4. Logs the event in `uber_webhook_logs`

## Delivery Status Flow

```
pending          → Delivery created, waiting for courier
↓
pickup          → Courier assigned and heading to pickup
↓
pickup_complete → Items picked up from donor
↓
dropoff         → Courier heading to donation center
↓
delivered       → Items delivered successfully
```

**Alternative statuses:**
- `canceled` - Delivery was canceled
- `returned` - Items couldn't be delivered and were returned

## Cost Structure

### Uber Direct Pricing (Estimates)
- **Base fee**: ~$3-5
- **Per mile**: ~$0.85-1.50
- **Time-based**: Peak hours cost more
- **Distance**: Longer trips cost more

**Your Platform Markup:**
- 25% service fee on Uber cost
- $4.00 mandatory driver tip
- Stripe processing fee (2.9% + $0.30)

**Example:**
```
Uber cost:    $10.00
Service fee:   $2.50 (25%)
Driver tip:    $4.00
Subtotal:     $16.50
Stripe fee:    $0.57
─────────────────────
Total:        $17.07
```

## Testing

### Test Mode
Uber provides a sandbox environment for testing without real deliveries.

**Add test credentials:**
```bash
UBER_CLIENT_ID=test_client_id
UBER_CLIENT_SECRET=test_client_secret
UBER_CUSTOMER_ID=test_customer_id
```

### Test Deliveries
- Use test coordinates
- Deliveries complete instantly
- No real couriers dispatched
- No charges applied

## Production Checklist

- [ ] Get Uber Direct production credentials
- [ ] Add credentials to Supabase secrets
- [ ] Deploy all Edge Functions
- [ ] Configure webhook URL in Uber dashboard
- [ ] Test quote generation
- [ ] Test delivery creation
- [ ] Verify webhook updates
- [ ] Test with real pickup/delivery
- [ ] Monitor webhook logs table
- [ ] Set up error alerts

## Troubleshooting

### "Uber credentials not configured"
- Check that all 3 environment variables are set
- Verify they're deployed to Edge Functions
- Restart Edge Functions after adding secrets

### "OAuth failed"
- Verify Client ID and Client Secret are correct
- Check that scope `eats.deliveries` is enabled
- Try generating new credentials

### "Address undeliverable"
- Location is outside Uber Direct coverage area
- Try a different address
- Check Uber Direct service area map

### Webhooks not received
- Verify webhook URL is correct
- Check webhook subscriptions in Uber dashboard
- Review `uber_webhook_logs` table
- Test with Uber's webhook testing tool

## Support

**Uber Direct Documentation:**
- https://developer.uber.com/docs/deliveries/overview
- https://developer.uber.com/docs/deliveries/guides/webhooks

**API Reference:**
- https://developer.uber.com/docs/deliveries/api-reference

**Support:**
- Uber Developer Forums: https://developer.uber.com/community
- Email: direct-api-support@uber.com

## Next Steps

1. **Get Uber Direct Credentials** (see above)
2. **Add to Supabase Secrets**
3. **Update Frontend** to use real API instead of mock pricing
4. **Test End-to-End** with test credentials
5. **Go Live** with production credentials

Your platform is now ready for real Uber Direct integration! 🚀
