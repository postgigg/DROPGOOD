# Roadie Sandbox Testing & Certification Guide

Complete guide for testing your Roadie integration and getting production credentials.

---

## 📋 **Pre-Requisites**

### **1. Get Sandbox Credentials**
- Contact Roadie to request **sandbox API token**
- Email: integrations@roadie.com or your Roadie account manager
- Specify you need sandbox credentials for testing

### **2. Set Environment Variables**
```bash
# Add to .env
ROADIE_API_TOKEN=your_sandbox_token_here
SUPABASE_ANON_KEY=your_anon_key_here
```

### **3. Verify Edge Functions Are Deployed**
```bash
# Check deployed functions
supabase functions list

# Should see:
# - roadie-estimate
# - roadie-create-shipment
# - roadie-get-images
# - roadie-webhook
```

---

## 🧪 **Roadie Sandbox Auto-Delivery**

Roadie's sandbox environment **automatically simulates a full delivery** when you:

### **Trigger Conditions:**
1. Set `deliver_between.start` to **< 30 minutes from now**
2. Use **sandbox API token** (not production)

### **What Happens:**
- **First event:** ~30 seconds after shipment creation
- **Subsequent events:** Every 15 seconds (or custom timing)
- **Total duration:** ~2-3 minutes until delivery complete
- **Webhooks:** Sent to your webhook URL automatically

### **Event Sequence (Happy Path):**
```
1. shipment_created
2. driver_assigned         (~30 sec)
3. en_route_to_pickup      (~45 sec)
4. at_pickup               (~60 sec)
5. pickup_confirmed        (~75 sec)  ← Auto-fetches pickup image
6. en_route_to_delivery    (~90 sec)
7. at_delivery             (~105 sec)
8. delivery_confirmed      (~120 sec) ← Auto-fetches delivery + signature images
```

---

## 🛠️ **Special Testing Commands**

### **1. Return Scenario**
```typescript
delivery_location: {
  notes: "Please return this shipment."  // CASE SENSITIVE!
}
```
**Result:** Simulates delivery failure, driver returns items

### **2. Cancel Scenario**
```typescript
pickup_location: {
  notes: "Please cancel this shipment."  // CASE SENSITIVE!
}
```
**Result:** Simulates shipment cancellation

### **3. Custom Event Timing**
```typescript
description: "Test order --timing 60"
```
**Result:** Events arrive every 60 seconds (instead of 15)

---

## 🚀 **Running Tests**

### **Option 1: Automated Script (Recommended)**

```bash
# Install dependencies
npm install -g ts-node typescript

# Run test script
SUPABASE_ANON_KEY="your_key" ts-node scripts/test-roadie-sandbox.ts
```

**What it does:**
- ✅ Creates 4 test shipments (1 single, 2 multiple, 1 return)
- ✅ Uses Richmond, VA addresses (your service area)
- ✅ Sets immediate delivery window (triggers auto-delivery)
- ✅ Waits for each delivery to complete
- ✅ Outputs shipment IDs for certification

### **Option 2: Manual Testing**

#### **Test 1: Happy Path (Single Order)**

```bash
curl -X POST https://uhtkemafphcegmabyfyj.supabase.co/functions/v1/roadie-create-shipment \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": "TEST-HAPPY-001",
    "description": "Test - Happy Path Single --timing 30",
    "pickup_location": {
      "address": {
        "street": "123 Main St",
        "city": "Richmond",
        "state": "VA",
        "zip_code": "23220"
      },
      "latitude": 37.5407,
      "longitude": -77.4360,
      "contact": {
        "name": "Test Customer",
        "phone": "8045551234"
      }
    },
    "delivery_location": {
      "address": {
        "street": "456 Charity Ln",
        "city": "Richmond",
        "state": "VA",
        "zip_code": "23221"
      },
      "latitude": 37.5500,
      "longitude": -77.4400,
      "contact": {
        "name": "Test Charity",
        "phone": "8045555678"
      }
    },
    "pickup_after": "2025-11-17T15:00:00Z",
    "deliver_between": {
      "start": "2025-11-17T15:00:00Z",
      "end": "2025-11-17T15:30:00Z"
    },
    "bags_count": 5,
    "boxes_count": 3
  }'
```

**Save the `shipment_id` from response!**

#### **Test 2: Multiple Orders**

Create 2-3 shipments using the same command with different `booking_id` values:
- `TEST-MULTI-001`
- `TEST-MULTI-002`
- `TEST-MULTI-003`

#### **Test 3: Return Scenario**

Same as Test 1, but add:
```json
"delivery_location": {
  ...
  "notes": "Please return this shipment."
}
```

---

## 📊 **Monitoring Tests**

### **Check Webhook Logs**

```sql
-- View all webhook events
SELECT
  event_type,
  reference_id,
  shipment_id,
  processed_at,
  payload
FROM roadie_webhook_logs
WHERE reference_id LIKE 'TEST-%'
ORDER BY processed_at DESC;
```

### **Check Images Fetched**

```sql
-- Verify images were auto-fetched
SELECT
  id,
  roadie_shipment_id,
  roadie_pickup_image_url,
  roadie_delivery_image_url,
  roadie_signature_image_url
FROM bookings
WHERE id LIKE 'TEST-%';
```

### **Expected Results:**

After each test completes (~3-5 minutes):

✅ **Webhooks received:**
- `driver_assigned`
- `en_route_to_pickup`
- `pickup_confirmed`
- `en_route_to_delivery`
- `delivery_confirmed`

✅ **Images auto-fetched:**
- `roadie_pickup_image_url` (after pickup_confirmed)
- `roadie_delivery_image_url` (after delivery_confirmed)
- `roadie_signature_image_url` (after delivery_confirmed)

---

## 📝 **Certification Checklist**

### **Before Submitting to Roadie:**

- [ ] All 3 test scenarios completed successfully
- [ ] Webhook events logged in database
- [ ] All 3 images auto-fetched for happy path tests
- [ ] Return scenario handled correctly
- [ ] Collected all `shipment_id` values
- [ ] Verified addresses are realistic (Richmond, VA area)
- [ ] Verified timestamps make sense (not past dates)

### **Submit to Roadie:**

**Email:** integrations@roadie.com

**Subject:** Roadie API Certification - DropGood Integration

**Body:**
```
Hello Roadie Integrations Team,

We have completed end-to-end testing of our Roadie API integration
and are ready for certification review.

Test Shipment IDs:
1. Happy Path (Single): [SHIPMENT_ID_1]
2. Happy Path (Multiple):
   - Order A: [SHIPMENT_ID_2]
   - Order B: [SHIPMENT_ID_3]
3. Return Scenario: [SHIPMENT_ID_4]

Integration Details:
- Company: DropGood
- Service Area: Richmond, VA (expanding to more cities)
- Use Case: Donation pickup and delivery to charities
- Webhook URL: https://uhtkemafphcegmabyfyj.supabase.co/functions/v1/roadie-webhook

All test orders use realistic Richmond, VA addresses and
appropriate timestamps. Our integration includes:
- Automatic vehicle size determination from bags/boxes
- Real-time webhook processing
- Automatic proof photo fetching
- Live tracking URL display to customers

Please review and provide production API credentials.

Thank you,
[Your Name]
DropGood Team
```

---

## 🔄 **After Certification**

### **1. Receive Production Credentials**

Roadie will email you:
- Production API token
- Production webhook URL (if different)
- Any additional configuration

### **2. Update Environment**

```bash
# Replace sandbox token with production
supabase secrets set ROADIE_API_TOKEN=production_token_here

# Update .env
VITE_ROADIE_ENABLED=false  # Keep false until ready to go live
```

### **3. Test in Production (Low Volume)**

- Create 1-2 real test orders in production
- Verify everything works identically
- Monitor for any issues

### **4. Go Live**

```bash
# Enable Roadie in production
VITE_ROADIE_ENABLED=true

# Rebuild frontend
npm run build
```

---

## 🐛 **Troubleshooting**

### **"Auto-delivery not triggering"**
- ✅ Verify delivery window is < 30 mins from now
- ✅ Use sandbox token (not production)
- ✅ Wait ~30 seconds for first event
- ✅ Check webhook logs in database

### **"No webhook events received"**
- ✅ Verify webhook URL is configured in Roadie dashboard
- ✅ Check `roadie_webhook_logs` table exists
- ✅ Verify webhook Edge Function is deployed
- ✅ Check Supabase function logs for errors

### **"Images not auto-fetching"**
- ✅ Verify `roadie-get-images` Edge Function deployed
- ✅ Check storage bucket `delivery-images` exists
- ✅ Verify webhook events include `pickup_confirmed` and `delivery_confirmed`
- ✅ Check Edge Function logs for errors

### **"Return command not working"**
- ✅ Text must be EXACTLY: `"Please return this shipment."`
- ✅ Case sensitive (capital P, period at end)
- ✅ Goes in `delivery_location.notes` field

---

## 📞 **Support Contacts**

**Roadie Integrations Team:**
- Email: integrations@roadie.com
- Docs: https://docs.roadie.com/

**Roadie Account Manager:**
- Contact your assigned account manager
- Or reach out via Roadie dashboard

---

## ✅ **Success Criteria**

Your integration is ready for production when:

✅ All 3 test scenarios pass
✅ Webhooks arrive consistently (every 15 seconds)
✅ All 3 images auto-fetch successfully
✅ Return scenario handled correctly
✅ Database logs show complete event history
✅ Roadie approves your test data
✅ Production credentials received

**Timeline:** Usually 1-2 business days for Roadie review.

Good luck! 🚀
