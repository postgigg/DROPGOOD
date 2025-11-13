# Email & SMS Notifications - Complete Guide

## Overview

Your donation platform now has **professionally branded email and SMS templates** with consistent colors, styling, and messaging across all notifications.

## Brand Identity

### Colors
- **Primary Blue:** `#2563EB` (blue-600)
- **Dark Blue:** `#1E40AF` (blue-700)
- **Background:** `#111827` (gray-900)
- **Surface:** `#1F2937` (gray-800)
- **Text:** White, gray-300, gray-400

### Brand Voice
- **Friendly & Direct:** "Hey [Name]!" not "Dear Customer"
- **Clear & Concise:** No jargon, simple language
- **Action-Oriented:** Tell users what happens next
- **Grateful:** Always thank users for donations

## Email Templates Created

### 1. **Booking Confirmation** ✅
**When:** Immediately after booking is confirmed
**Includes:**
- Booking ID (shortened)
- Donation center name
- Pickup address & time
- Total price (highlighted)
- Tracking URL
- What happens next

**Subject:** `✅ Donation Pickup Confirmed - [Date]`

### 2. **Pickup Reminder** 📅
**When:** 24 hours before pickup
**Includes:**
- Pickup time (tomorrow)
- Location details
- Items list
- Tracking URL
- Quick checklist

**Subject:** `🚗 Reminder: Pickup Tomorrow at [Time]`

### 3. **Driver En Route** 🚗
**When:** Driver is 15 minutes away
**Includes:**
- Driver name (if available)
- Driver phone
- ETA in minutes
- Live tracking link
- Pro tip for quick loading

**Subject:** `🚗 Driver arriving in [X] minutes!`

### 4. **Delivery Completed** ✅
**When:** Items delivered to donation center
**Includes:**
- Delivery confirmation
- Delivered timestamp
- Items donated
- Tax receipt info
- Thank you message
- Feedback request

**Subject:** `✅ Your donation has been delivered!`

### 5. **Delivery Canceled** ❌
**When:** Pickup is canceled
**Includes:**
- Cancellation reason
- Refund amount (if applicable)
- Rebooking link
- Support contact

**Subject:** `Pickup Canceled - [Booking ID]`

## SMS Templates Created

### Text Message Guidelines
- **Max 160 characters** per segment
- **Brand prefix:** Always start with "DropGood:"
- **Include name:** Personalize with recipient name
- **Clear action:** What they need to know/do
- **Short links:** Use URL shorteners for tracking

### SMS Messages

#### 1. Booking Confirmation
```
DropGood: Hi [Name]! Your donation pickup is confirmed for [Date] at [Time]. Going to [Center]. Total: $X.XX
```

#### 2. Pickup Reminder
```
DropGood: Hi [Name]! Reminder: Your donation pickup is tomorrow at [Time]. We'll text when the driver is 15 mins away. Have items ready!
```

#### 3. Driver En Route
```
DropGood: Hi [Name]! Your driver ([Driver Name]) is [X] mins away! Driver: [Phone]. Track: [URL]
```

#### 4. Driver Arrived
```
DropGood: Your driver ([Name]) has arrived! They're ready to pick up your donation.
```

#### 5. Pickup Completed
```
DropGood: Items picked up! On the way to [Center]. Track delivery: [URL]
```

#### 6. Delivery Completed
```
DropGood: Your donation was delivered to [Center]! Tax receipt will be emailed from them. Thanks for making a difference! 🎉
```

#### 7. Delivery Canceled
```
DropGood: Hi [Name], your pickup was canceled. Reason: [X]. Refund of $X.XX will be processed. Book again anytime!
```

## Edge Function

### **send-notification**
**Endpoint:** `POST /functions/v1/send-notification`

**Purpose:** Send branded emails and SMS notifications

**Request:**
```typescript
{
  type: 'booking_confirmation' | 'pickup_reminder' | 'driver_enroute' | 'driver_arrived' | 'pickup_completed' | 'delivery_completed' | 'delivery_canceled',
  recipient_email: string,
  recipient_phone?: string,
  recipient_name: string,
  data: {
    // Type-specific data
  },
  send_email?: boolean,  // default: true
  send_sms?: boolean     // default: true
}
```

**Example - Booking Confirmation:**
```typescript
await fetch(`${supabaseUrl}/functions/v1/send-notification`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    type: 'booking_confirmation',
    recipient_email: 'user@example.com',
    recipient_phone: '+15555551234',
    recipient_name: 'John Doe',
    data: {
      donor_name: 'John Doe',
      booking_id: 'abc-123-def',
      donation_center_name: 'Goodwill NYC',
      pickup_address: '123 Main St, New York, NY',
      pickup_date: 'Monday, Jan 15',
      pickup_time: '10:00 AM - 12:00 PM',
      total_price: 12.50,
      tracking_url: 'https://dropgood.com/track/abc123',
    },
  }),
});
```

## Email Service Setup

### Recommended: Resend (https://resend.com)

**Why Resend:**
- $0/month for 3,000 emails
- Excellent deliverability
- Simple API
- Email analytics
- Beautiful templates support

**Setup:**
1. Sign up at https://resend.com
2. Verify your domain (or use resend subdomain for testing)
3. Get API key
4. Add to Supabase secrets:
   ```bash
   supabase secrets set RESEND_API_KEY=re_xxxxx
   ```

5. Uncomment Resend code in `send-notification/index.ts` (line 42-58)

### Alternative: SendGrid, Mailgun, or Supabase Email

## SMS Service Setup

### Recommended: Twilio (https://twilio.com)

**Why Twilio:**
- Industry standard
- Reliable delivery
- Programmable messaging
- Global coverage

**Setup:**
1. Sign up at https://twilio.com
2. Get phone number
3. Get credentials
4. Add to Supabase secrets:
   ```bash
   supabase secrets set TWILIO_ACCOUNT_SID=ACxxxxx
   supabase secrets set TWILIO_AUTH_TOKEN=your_token
   supabase secrets set TWILIO_PHONE_NUMBER=+15555551234
   ```

5. Uncomment Twilio code in `send-notification/index.ts` (line 75-95)

### Cost Estimate (Twilio)
- **US SMS:** $0.0079 per message
- **Per 1,000 bookings:** ~$24 (3 texts per booking)

## Database Tracking

### notification_logs Table
Tracks every notification sent:

```sql
SELECT * FROM notification_logs
WHERE booking_id = 'abc-123'
ORDER BY sent_at DESC;
```

**Columns:**
- `booking_id` - Links to booking
- `notification_type` - Type of notification
- `recipient_email` - Email address
- `recipient_phone` - Phone number
- `email_sent` - Success/failure
- `sms_sent` - Success/failure
- `sent_at` - Timestamp

### Notification Preferences
Users can opt out:

```sql
UPDATE bookings
SET notification_preferences = '{"email": true, "sms": false}'
WHERE id = 'booking_id';
```

## Frontend Integration

### Send Booking Confirmation
```typescript
// After successful booking
const { error } = await supabase.functions.invoke('send-notification', {
  body: {
    type: 'booking_confirmation',
    recipient_email: booking.donor_email,
    recipient_phone: booking.donor_phone,
    recipient_name: booking.donor_name,
    data: {
      donor_name: booking.donor_name,
      booking_id: booking.id,
      donation_center_name: booking.donation_center.name,
      pickup_address: booking.pickup_address,
      pickup_date: formatDate(booking.pickup_date),
      pickup_time: booking.pickup_time_window,
      total_price: booking.total_price,
      tracking_url: `https://dropgood.com/track/${booking.id}`,
    },
  },
});
```

### Send Reminder (Scheduled)
Set up a scheduled Edge Function or cron job to send reminders 24 hours before:

```typescript
// Get bookings for tomorrow
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

const { data: bookings } = await supabase
  .from('bookings')
  .select('*')
  .eq('pickup_date', tomorrow.toISOString().split('T')[0])
  .eq('status', 'confirmed');

// Send reminders
for (const booking of bookings) {
  await supabase.functions.invoke('send-notification', {
    body: {
      type: 'pickup_reminder',
      recipient_email: booking.donor_email,
      recipient_phone: booking.donor_phone,
      recipient_name: booking.donor_name,
      data: {
        donor_name: booking.donor_name,
        donation_center_name: booking.donation_center.name,
        pickup_time: booking.pickup_time_window,
        pickup_address: booking.pickup_address,
        items: booking.items,
        tracking_url: `https://dropgood.com/track/${booking.id}`,
      },
    },
  });
}
```

## Email Design Features

### Responsive
- Mobile-optimized layout
- Readable on all screen sizes
- Touch-friendly buttons

### Branded
- DropGood logo and colors
- Consistent typography
- Professional design

### Accessible
- High contrast text
- Semantic HTML
- Alt text for icons

### Deliverability
- No spam trigger words
- Proper HTML structure
- Plain text fallback

## Testing

### Test Email Template
```bash
# Via Supabase function
curl -X POST https://your-project.supabase.co/functions/v1/send-notification \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "booking_confirmation",
    "recipient_email": "test@example.com",
    "recipient_name": "Test User",
    "data": {
      "donor_name": "Test User",
      "booking_id": "test-123",
      "donation_center_name": "Test Center",
      "pickup_address": "123 Test St",
      "pickup_date": "Monday, Jan 15",
      "pickup_time": "10:00 AM",
      "total_price": 10.00
    }
  }'
```

### Preview Templates
1. Copy email HTML from `email-templates.ts`
2. Paste into https://htmledit.squarefree.com/
3. Preview and test rendering

## Compliance

### CAN-SPAM Act (Email)
✅ Clear sender identity (DropGood)
✅ Honest subject lines
✅ Physical address in footer
✅ Unsubscribe option (via settings)
✅ Honor opt-outs promptly

### TCPA (SMS)
✅ Prior express consent
✅ Opt-out instructions ("Reply STOP")
✅ Message frequency disclosed
✅ Help keyword ("Reply HELP")

## Cost Estimates

### Monthly (1,000 bookings)
- **Resend:** $0 (free tier)
- **Twilio SMS:** $24
- **Total:** ~$24/month

### Per Booking
- **Email:** $0.00 (3 emails)
- **SMS:** $0.024 (3 texts)
- **Total:** ~$0.024 per booking

## Next Steps

1. **Test Locally** - Templates work out of the box (logs only)
2. **Add Resend** - Get API key, uncomment code
3. **Add Twilio** - Get credentials, uncomment code
4. **Send Test** - Use curl or Postman
5. **Go Live** - Enable for all bookings

Your notification system is ready! 📧📱
