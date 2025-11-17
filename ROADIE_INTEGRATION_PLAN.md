# Roadie Integration - Complete Implementation Plan

## 🎯 Overview

Build complete Roadie API integration as primary delivery provider (with Uber as fallback). Customer enters bags/boxes, backend automatically determines vehicle size, gets real Roadie pricing, adds our fees, displays final price.

**Priority:** MANUAL (default) → ROADIE (primary) → UBER (fallback)

---

## 📋 What We're Building

### **Customer Experience:**
1. Step 2: Enter "10 bags, 5 boxes"
2. Step 3: See charity prices (e.g., "$75.07") - includes ALL our fees
3. Step 5: Pay
4. Automatic: Roadie shipment created with correct vehicle size
5. Automatic: Pickup/delivery/signature images fetched
6. Confirmation: See all 3 photos

### **Backend Magic:**
- 10 bags + 5 boxes → Automatically determines "X-LARGE (hatchback)"
- Calls Roadie with hatchback dimensions
- Roadie returns: $28.00
- We add our fees: delivery markup, service fee, bag/box fees, tax, Stripe
- Customer sees: $75.07 (never knows about vehicle size)

---

## 🚗 Roadie's Size System

Roadie uses 5 predefined categories:
- **Small** - Fits in a shoebox
- **Medium** - Fits in a front seat
- **Large** - Fits in a back seat
- **X-Large** - Fits in a hatchback
- **Huge** - Fits in a pickup truck

### Our Mapping Logic:
```
1-2 bags, 0 boxes     → SMALL
3-5 bags or 1-2 boxes → MEDIUM
6-10 bags or 3-5 boxes → LARGE
11-20 bags or 6-10 boxes → X-LARGE
21+ bags or 11+ boxes → HUGE
```

---

## 💰 Pricing Calculation

**Example: 10 bags, 5 boxes**

1. Backend maps to X-LARGE (hatchback)
2. Roadie API returns: $28.00
3. We calculate:
   - Roadie base: $28.00
   - Delivery fee (15% markup): $28.00 × 1.15 = $32.20
   - Service fee (10%): $3.22
   - Bag fees: 10 × $2.00 = $20.00
   - Box fees: 5 × $3.00 = $15.00
   - Subtotal: $70.42
   - Sales tax (5.3% VA): $3.73
   - Stripe fee: $0.92
   - **TOTAL: $75.07**

4. Customer sees: **$75.07**

---

## 📁 Files to Create

### **Backend - Supabase Edge Functions (6 files):**

#### 1. `supabase/functions/_shared/roadie-size-mapper.ts`
**Purpose:** Convert bags/boxes to Roadie size + dimensions
```typescript
export function mapBagsBoxesToRoadieSize(bagsCount, boxesCount) {
  // Returns: { roadie_size, dimensions, weight }
}

export function buildRoadieItems(bagsCount, boxesCount) {
  // Returns: Roadie items array with proper dimensions
}
```

#### 2. `supabase/functions/_shared/roadie-auth.ts`
**Purpose:** Bearer token authentication helper
```typescript
export async function makeRoadieRequest(endpoint, options) {
  // Handles: Authorization: Bearer <TOKEN>
  // Base URL: https://connect.roadie.com/v1
}
```

#### 3. `supabase/functions/roadie-estimate/index.ts`
**Endpoint:** POST /v1/estimates
**Purpose:** Get quote from Roadie
**Input:** pickup/delivery locations, bags_count, boxes_count
**Process:**
  - Auto-determine vehicle size
  - Call Roadie API
**Output:** `{ roadie_base_price: 28.00, estimated_distance: 12.5 }`

#### 4. `supabase/functions/roadie-create-shipment/index.ts`
**Endpoint:** POST /v1/shipments
**Purpose:** Create actual delivery
**Input:** reference_id (booking ID), locations, bags, boxes
**Process:**
  - Auto-determine vehicle size
  - Create Roadie shipment with idempotency key
**Output:** `{ shipment_id, reference_id, state, tracking_url }`

#### 5. `supabase/functions/roadie-get-images/index.ts`
**Endpoint:** GET /v1/shipments/{id}/images/{type}
**Purpose:** Fetch pickup/delivery/signature images
**Input:** shipment_id, image_type ('pickup', 'delivery', 'signature')
**Process:**
  - Fetch raw image from Roadie
  - Upload to Supabase Storage bucket 'delivery-images'
  - Generate public URL
**Output:** `{ image_url: 'https://...' }`

#### 6. `supabase/functions/roadie-webhook/index.ts`
**Purpose:** Handle Roadie webhook events
**Events:**
  - `driver_assigned`
  - `en_route_to_pickup`
  - `at_pickup`
  - `pickup_confirmed` → **Auto-fetch pickup image**
  - `en_route_to_delivery`
  - `at_delivery`
  - `delivery_confirmed` → **Auto-fetch delivery + signature images**
  - `canceled`
**Process:**
  - Log webhook to roadie_webhook_logs
  - Update booking.roadie_state
  - Auto-fetch images when appropriate
  - Update booking with image URLs

---

## 📝 Files to Modify

### **Frontend Changes:**

#### 1. `src/lib/pricing.ts`

**Add new function:**
```typescript
async function getRoadieEstimates(
  pickupLat, pickupLng, dropoffLocations,
  pickupAddress, bagsCount, boxesCount
) {
  // For each charity:
  // 1. Call roadie-estimate Edge Function
  // 2. Get roadie_base_price
  // 3. Pass through calculateFinalPrice() to add OUR fees
  // 4. Return Map with total price
}
```

**Update priority logic:**
```typescript
export async function getDeliveryQuotes(...) {
  if (MANUAL_MODE) return manualPricing();

  // Try ROADIE first
  if (ROADIE_ENABLED) {
    const roadieQuotes = await getRoadieEstimates(...);
    if (roadieQuotes.size > 0) return roadieQuotes;
  }

  // Fallback to UBER
  if (UBER_ENABLED) {
    return await getUberDirectQuotes(...);
  }

  throw new Error('No delivery service available');
}
```

#### 2. `src/components/booking/StepCharities.tsx`

**Replace:** `getUberDirectQuotes()` call

**With:**
```typescript
const quotes = await getDeliveryQuotes(
  pickupAddress.latitude,
  pickupAddress.longitude,
  locationQuotes,
  pickupAddress,
  bagsCount || 0,
  boxesCount || 0
);
```

**Result:** Customer sees final price (Roadie + our fees)

#### 3. `src/components/booking/StepPayment.tsx`

**Add function:**
```typescript
const createRoadieShipment = async (bookingId) => {
  await fetch('/functions/v1/roadie-create-shipment', {
    method: 'POST',
    body: JSON.stringify({
      reference_id: bookingId,
      description: `Donation pickup for ${charity.name}`,
      pickup_location: { address, contact, notes },
      delivery_location: { address, contact },
      pickup_after: scheduledDateTime,
      deliver_between: { start, end },
      bags_count: bagsCount,
      boxes_count: boxesCount
    })
  });

  // Save shipment_id, tracking_url to database
};
```

**Update completeBooking():**
```typescript
if (recalculatedPricing.provider === 'roadie') {
  await createRoadieShipment(completedBookingId);
} else if (recalculatedPricing.uber_quote_id) {
  await createUberDelivery(completedBookingId);
}
```

#### 4. `src/pages/ConfirmationPage.tsx`

**Add image display:**
```tsx
{booking.roadie_pickup_image_url && (
  <div className="image-section">
    <h4>Pickup Photo</h4>
    <img src={booking.roadie_pickup_image_url} alt="Pickup" />
  </div>
)}

{booking.roadie_delivery_image_url && (
  <div className="image-section">
    <h4>Delivery Photo</h4>
    <img src={booking.roadie_delivery_image_url} alt="Delivery" />
  </div>
)}

{booking.roadie_signature_image_url && (
  <div className="image-section">
    <h4>Signature</h4>
    <img src={booking.roadie_signature_image_url} alt="Signature" />
  </div>
)}
```

---

## 🗄️ Database Changes

### **Migration SQL:**

```sql
-- Add Roadie fields to bookings table
ALTER TABLE bookings
ADD COLUMN roadie_base_price NUMERIC(10,2),
ADD COLUMN roadie_shipment_id INTEGER,
ADD COLUMN roadie_reference_id TEXT,
ADD COLUMN roadie_state TEXT,
ADD COLUMN roadie_tracking_url TEXT,
ADD COLUMN roadie_pickup_image_url TEXT,
ADD COLUMN roadie_delivery_image_url TEXT,
ADD COLUMN roadie_signature_image_url TEXT,
ADD COLUMN delivery_provider TEXT CHECK (delivery_provider IN ('manual', 'roadie', 'uber'));

-- Create webhook logs table
CREATE TABLE roadie_webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  shipment_id INTEGER,
  reference_id TEXT,
  payload JSONB NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_roadie_webhooks_shipment ON roadie_webhook_logs(shipment_id);
CREATE INDEX idx_roadie_webhooks_reference ON roadie_webhook_logs(reference_id);

-- Create Supabase Storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('delivery-images', 'delivery-images', true);

-- Allow public read access to delivery images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'delivery-images' );

-- Allow service role to upload images
CREATE POLICY "Service Role Upload"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK ( bucket_id = 'delivery-images' );
```

---

## 🔧 Environment Variables

### **Add to `.env`:**
```bash
# Roadie API
ROADIE_API_TOKEN=your_bearer_token_here

# Feature flags
VITE_ROADIE_ENABLED=false  # Set true when ready
VITE_UBER_ENABLED=false    # Already exists
VITE_MANUAL_MODE=true      # Keep as default
```

### **Add to Supabase Secrets:**
```bash
supabase secrets set ROADIE_API_TOKEN=your_bearer_token_here
```

---

## 🚀 Deployment Steps

### **Phase 1: Backend**
1. Create `_shared/roadie-size-mapper.ts`
2. Create `_shared/roadie-auth.ts`
3. Create `roadie-estimate/index.ts`
4. Create `roadie-create-shipment/index.ts`
5. Create `roadie-get-images/index.ts`
6. Create `roadie-webhook/index.ts`

**Deploy:**
```bash
supabase functions deploy roadie-estimate
supabase functions deploy roadie-create-shipment
supabase functions deploy roadie-get-images
supabase functions deploy roadie-webhook
```

### **Phase 2: Database**
1. Run migration SQL
2. Verify tables created
3. Verify storage bucket exists

### **Phase 3: Frontend**
1. Update `src/lib/pricing.ts`
2. Update `src/components/booking/StepCharities.tsx`
3. Update `src/components/booking/StepPayment.tsx`
4. Update `src/pages/ConfirmationPage.tsx`

**Build:**
```bash
npm run build
```

### **Phase 4: Configuration**
1. Get Roadie API token from Roadie dashboard
2. Add to `.env` locally
3. Add to Supabase secrets: `supabase secrets set ROADIE_API_TOKEN=...`
4. Configure webhook URL in Roadie dashboard:
   - `https://uhtkemafphcegmabyfyj.supabase.co/functions/v1/roadie-webhook`

### **Phase 5: Enable**
```bash
# When ready to go live:
VITE_ROADIE_ENABLED=true
```

---

## ✅ Testing Checklist

### **Step 1: Test Estimate**
```bash
# Call Edge Function directly
curl -X POST https://uhtkemafphcegmabyfyj.supabase.co/functions/v1/roadie-estimate \
  -H "Authorization: Bearer <ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "pickup_location": {"address": {"street1": "123 Main St", "city": "Richmond", "state": "VA", "zip": "23220"}},
    "delivery_location": {"address": {"street1": "456 Charity Ln", "city": "Richmond", "state": "VA", "zip": "23221"}},
    "pickup_after": "2025-11-18T10:00:00Z",
    "deliver_between": {"start": "2025-11-18T12:00:00Z", "end": "2025-11-18T14:00:00Z"},
    "bags_count": 5,
    "boxes_count": 3
  }'

# Expected: { "roadie_base_price": 25.00, "estimated_distance": 8.5 }
```

### **Step 2: Test Frontend Integration**
1. Navigate to Step 2
2. Enter: 5 bags, 3 boxes
3. Go to Step 3
4. Verify: Prices shown (should be ~$50-60 with all fees)
5. Check console: "✅ Using Roadie prices"

### **Step 3: Test Shipment Creation**
1. Complete booking with Roadie pricing
2. Verify database:
```sql
SELECT
  id,
  roadie_shipment_id,
  roadie_reference_id,
  roadie_state,
  roadie_tracking_url
FROM bookings
WHERE delivery_provider = 'roadie'
ORDER BY created_at DESC LIMIT 1;
```
3. Should have shipment_id populated

### **Step 4: Test Webhooks**
1. Wait for Roadie driver to pick up
2. Check webhook logs:
```sql
SELECT * FROM roadie_webhook_logs
ORDER BY processed_at DESC LIMIT 10;
```
3. Verify pickup_confirmed event logged
4. Verify booking.roadie_pickup_image_url populated

### **Step 5: Test Images**
1. After delivery complete
2. Check booking:
```sql
SELECT
  roadie_pickup_image_url,
  roadie_delivery_image_url,
  roadie_signature_image_url
FROM bookings WHERE id = 'DG-...';
```
3. All 3 URLs should be populated
4. Visit URLs - should load images

---

## 📊 Monitoring

### **Check Quote Success Rate:**
```sql
SELECT
  COUNT(*) as total_bookings,
  COUNT(roadie_shipment_id) as roadie_created,
  ROUND(100.0 * COUNT(roadie_shipment_id) / COUNT(*), 2) as success_rate
FROM bookings
WHERE delivery_provider = 'roadie'
  AND created_at > NOW() - INTERVAL '24 hours';
```

### **Check Webhook Activity:**
```sql
SELECT
  event_type,
  COUNT(*) as count,
  MAX(processed_at) as last_received
FROM roadie_webhook_logs
WHERE processed_at > NOW() - INTERVAL '24 hours'
GROUP BY event_type
ORDER BY count DESC;
```

### **Check Image Fetch Rate:**
```sql
SELECT
  COUNT(*) as deliveries_completed,
  COUNT(roadie_pickup_image_url) as pickup_images,
  COUNT(roadie_delivery_image_url) as delivery_images,
  COUNT(roadie_signature_image_url) as signature_images
FROM bookings
WHERE roadie_state = 'delivered'
  AND created_at > NOW() - INTERVAL '7 days';
```

---

## 🐛 Troubleshooting

### **Issue: "Roadie API error: 401 Unauthorized"**
**Solution:** Check ROADIE_API_TOKEN is set correctly in Supabase secrets

### **Issue: Prices not showing**
**Solution:**
1. Check `VITE_ROADIE_ENABLED=true` in .env
2. Check browser console for errors
3. Verify Edge Function is deployed

### **Issue: Images not appearing**
**Solution:**
1. Check storage bucket 'delivery-images' exists
2. Check bucket is public
3. Check webhook is configured in Roadie dashboard

### **Issue: Wrong vehicle size**
**Solution:** Check `roadie-size-mapper.ts` logic - adjust thresholds if needed

---

## 📚 API Reference

### **Roadie Estimate Request:**
```json
POST https://connect.roadie.com/v1/estimates
Authorization: Bearer <TOKEN>

{
  "items": [{
    "length": 48,
    "width": 36,
    "height": 24,
    "weight": 125,
    "quantity": 1,
    "value": 125
  }],
  "pickup_location": {
    "address": {
      "street1": "123 Main St",
      "city": "Richmond",
      "state": "VA",
      "zip": "23220"
    }
  },
  "delivery_location": {
    "address": {
      "street1": "456 Charity Ln",
      "city": "Richmond",
      "state": "VA",
      "zip": "23221"
    }
  },
  "pickup_after": "2025-11-18T10:00:00Z",
  "deliver_between": {
    "start": "2025-11-18T12:00:00Z",
    "end": "2025-11-18T14:00:00Z"
  }
}
```

**Response:**
```json
{
  "price": 28.50,
  "size": "xlarge",
  "estimated_distance": 8.5
}
```

### **Roadie Shipment Request:**
```json
POST https://connect.roadie.com/v1/shipments
Authorization: Bearer <TOKEN>

{
  "reference_id": "DG-1234567890-ABC123",
  "idempotency_key": "uuid-here",
  "description": "Donation pickup for Charity Name",
  "items": [...],
  "pickup_location": {
    "address": {...},
    "contact": {
      "name": "John Doe",
      "phone": "5551234567"
    },
    "notes": "Ring doorbell"
  },
  "delivery_location": {...},
  "pickup_after": "2025-11-18T10:00:00Z",
  "deliver_between": {...},
  "options": {
    "signature_required": false,
    "notifications_enabled": true,
    "decline_insurance": false
  }
}
```

**Response:**
```json
{
  "id": 152040,
  "reference_id": "DG-1234567890-ABC123",
  "state": "scheduled",
  "tracking_url": "https://..."
}
```

---

## 📦 Summary

**Files to Create:** 6 Edge Functions + 2 Shared modules
**Files to Modify:** 4 Frontend files
**Database:** 8 new columns + 1 new table + 1 storage bucket
**Environment Variables:** 1 new (ROADIE_API_TOKEN)

**Result:**
- Customer enters bags/boxes
- Backend auto-determines vehicle size
- Gets real Roadie pricing
- Adds YOUR fees (markup, service, bags, boxes, tax, Stripe)
- Shows final price
- Auto-creates shipment
- Auto-fetches 3 images
- Everything smooth and integrated!

---

**Ready to start building!** 🚀
