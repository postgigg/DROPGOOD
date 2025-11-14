# Security Quick Start Guide

This guide will help you quickly implement the security features in your application.

## Step 1: Run Database Migration

First, apply the security migration to create the security logs table:

```bash
# Using Supabase CLI
supabase db push

# Or run directly with psql
psql "postgresql://postgres:py3lESQ67tuNsFpr@db.uhtkemafphcegmabyfyj.supabase.co:5432/postgres" \
  -f supabase/migrations/20251115000000_security_enhancements.sql
```

## Step 2: Set Environment Variables

Add these secrets to your Supabase project:

```bash
# Navigate to Supabase Dashboard > Edge Functions > Settings > Secrets

# Required (you should already have these)
STRIPE_SECRET_KEY=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
UBER_CLIENT_ID=xxx
UBER_CLIENT_SECRET=xxx

# Add new ones
UBER_WEBHOOK_SECRET=xxx  # Get from Uber Direct dashboard
ALLOWED_ORIGINS=http://localhost:5173,https://dropgood.co
PRODUCTION_DOMAIN=dropgood.co

# Optional but recommended for production
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

### Setting up Upstash Redis (Optional, Production Recommended)

1. Sign up at [upstash.com](https://upstash.com)
2. Create a new Redis database
3. Copy the REST URL and Token
4. Add them as environment variables

## Step 3: Secure Your Existing Edge Functions

Update your existing edge functions to use the security features. Here's a template:

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { handleCors } from '../_shared/cors-config.ts';
import { secureResponse, secureErrorResponse } from '../_shared/security-headers.ts';
import { validateInput } from '../_shared/input-validator.ts';
import { AdvancedRateLimiter, rateLimitExceededResponse } from '../_shared/advanced-rate-limiter.ts';
import { securityCheckMiddleware } from '../_shared/security-monitor.ts';
import { requestGuardMiddleware, readBodyWithLimit } from '../_shared/request-guard.ts';

const rateLimiter = new AdvancedRateLimiter();

Deno.serve(async (req: Request) => {
  // 1. CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // 2. Request guards
    const guardResponse = await requestGuardMiddleware(req);
    if (guardResponse) return guardResponse;

    // 3. Security check
    const securityResponse = await securityCheckMiddleware(req);
    if (securityResponse) return securityResponse;

    // 4. Rate limiting
    const rateLimitResult = await rateLimiter.checkMultiTierLimit(req, {
      ip: { maxRequests: 100, windowMs: 60000 },
    });
    if (!rateLimitResult.allowed) {
      return rateLimitExceededResponse(rateLimitResult);
    }

    // 5. Read body
    const bodyResult = await readBodyWithLimit(req);
    if (!bodyResult.success) {
      return secureErrorResponse(bodyResult.error, 400);
    }

    // 6. Validate input
    const validationResult = validateInput(bodyResult.data);
    if (!validationResult.isValid) {
      return secureErrorResponse(validationResult.errors.join(', '), 400);
    }

    // 7. Your business logic here
    const result = await yourBusinessLogic(validationResult.sanitizedData);

    // 8. Secure response
    return secureResponse({ success: true, data: result });

  } catch (error) {
    console.error('Error:', error);
    return secureErrorResponse('Internal server error', 500);
  }
});
```

## Step 4: Add Webhook Verification

Update your webhook handlers to verify signatures:

### Stripe Webhook Example

```typescript
import { verifyStripeWebhook, isWebhookEventProcessed, markWebhookEventProcessed } from '../_shared/webhook-verify.ts';

Deno.serve(async (req: Request) => {
  try {
    const signature = req.headers.get('stripe-signature');
    const payload = await req.text();
    const secret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

    // Verify signature
    const isValid = await verifyStripeWebhook(payload, signature!, secret);
    if (!isValid) {
      return new Response('Invalid signature', { status: 401 });
    }

    const event = JSON.parse(payload);

    // Prevent duplicate processing
    if (await isWebhookEventProcessed(event.id)) {
      return new Response('Event already processed', { status: 200 });
    }

    // Process webhook
    // ... your webhook handling logic ...

    // Mark as processed
    await markWebhookEventProcessed(event.id);

    return new Response('Success', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Error', { status: 500 });
  }
});
```

### Uber Webhook Example

```typescript
import { verifyUberWebhook } from '../_shared/webhook-verify.ts';

Deno.serve(async (req: Request) => {
  const signature = req.headers.get('x-uber-signature');
  const payload = await req.text();
  const secret = Deno.env.get('UBER_WEBHOOK_SECRET')!;

  const isValid = await verifyUberWebhook(payload, signature!, secret);
  if (!isValid) {
    return new Response('Invalid signature', { status: 401 });
  }

  // Process webhook...
});
```

## Step 5: Add Honeypot Fields to Forms

Update your frontend forms to include honeypot fields for bot protection:

```tsx
// Example React form component
export function BookingForm() {
  const [formLoadTime] = useState(Date.now());

  return (
    <form onSubmit={handleSubmit}>
      {/* Regular fields */}
      <input type="text" name="name" required />
      <input type="email" name="email" required />

      {/* Honeypot field - hidden from humans */}
      <input
        type="text"
        name="website"
        style={{ position: 'absolute', left: '-9999px' }}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      {/* Form load timestamp */}
      <input type="hidden" name="formLoadTime" value={formLoadTime} />

      <button type="submit">Submit</button>
    </form>
  );
}
```

## Step 6: Monitor Security Logs

Query the security logs to monitor threats:

```sql
-- View recent security events
SELECT
  event_type,
  severity,
  ip_address,
  endpoint,
  created_at,
  details
FROM security_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC
LIMIT 100;

-- Find blocked IPs
SELECT
  ip_address,
  COUNT(*) as violations,
  MAX(created_at) as last_violation
FROM security_logs
WHERE blocked = true
GROUP BY ip_address
ORDER BY violations DESC;

-- Security event summary
SELECT
  event_type,
  severity,
  COUNT(*) as count
FROM security_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY event_type, severity
ORDER BY count DESC;
```

## Step 7: Test Security Features

Test each security layer:

### Test Rate Limiting
```bash
# Send multiple requests quickly
for i in {1..150}; do
  curl -X POST https://your-function.supabase.co/your-endpoint
done
# Should get 429 Too Many Requests after threshold
```

### Test Input Validation
```bash
# Try SQL injection
curl -X POST https://your-function.supabase.co/your-endpoint \
  -H "Content-Type: application/json" \
  -d '{"name": "test'; DROP TABLE users;--"}'
# Should get validation error
```

### Test Bot Protection
```bash
# Submit without User-Agent
curl -X POST https://your-function.supabase.co/your-endpoint \
  -H "Content-Type: application/json" \
  -d '{"website": "http://spam.com"}'
# Should be blocked as bot
```

## Optional: Production Optimizations

### 1. Enable Redis Rate Limiting

For production, use Redis for distributed rate limiting:

1. Sign up at [upstash.com](https://upstash.com)
2. Create Redis database
3. Add credentials to environment variables
4. Rate limiting will automatically use Redis

### 2. Set Up Monitoring Alerts

Create alerts for security events:

```sql
-- Create a function to check for anomalies
CREATE OR REPLACE FUNCTION check_security_anomalies()
RETURNS TABLE (
  alert_type text,
  details jsonb
) AS $$
BEGIN
  -- High number of blocked requests
  RETURN QUERY
  SELECT
    'HIGH_BLOCK_RATE'::text,
    jsonb_build_object(
      'count', COUNT(*),
      'time_window', '1 hour'
    )
  FROM security_logs
  WHERE blocked = true
    AND created_at > NOW() - INTERVAL '1 hour'
  HAVING COUNT(*) > 100;

  -- New IPs with multiple violations
  RETURN QUERY
  SELECT
    'SUSPICIOUS_IP'::text,
    jsonb_build_object(
      'ip', ip_address,
      'violations', COUNT(*)
    )
  FROM security_logs
  WHERE created_at > NOW() - INTERVAL '1 hour'
    AND severity IN ('high', 'critical')
  GROUP BY ip_address
  HAVING COUNT(*) >= 5;
END;
$$ LANGUAGE plpgsql;
```

### 3. Configure CSP for Your Domain

Update `security-headers.ts` with your actual domains:

```typescript
"connect-src 'self' https://yourdomain.supabase.co https://api.stripe.com",
```

## Troubleshooting

### Rate Limiting Too Strict?

Adjust thresholds in your edge functions:

```typescript
const rateLimitResult = await rateLimiter.checkMultiTierLimit(req, {
  ip: { maxRequests: 200, windowMs: 60000 }, // Increase from 100 to 200
});
```

### Legitimate Users Blocked?

Check the security logs and unblock IPs:

```typescript
import { securityMonitor } from '../_shared/security-monitor.ts';

// Unblock an IP
securityMonitor.unblockIP('1.2.3.4');
```

### Redis Connection Issues?

Verify credentials and fall back to in-memory:

```bash
# Check logs
supabase functions logs your-function

# Redis will auto-fallback to in-memory if unavailable
```

## Next Steps

1. ✅ Review `SECURITY.md` for detailed documentation
2. ✅ Check `supabase/functions/secure-endpoint-example/index.ts` for reference
3. ✅ Set up monitoring dashboard for security logs
4. ✅ Test all security features in staging
5. ✅ Gradually roll out to production endpoints

## Support

For issues or questions:
- Check `SECURITY.md` for detailed documentation
- Review security logs in database
- Test with `secure-endpoint-example`
