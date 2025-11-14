# Security Implementation Guide

This document describes the comprehensive security features implemented in this application.

## Overview

We've implemented a multi-layered security approach that protects against:

- SQL Injection attacks
- Cross-Site Scripting (XSS)
- DDoS and rate limiting abuse
- Bot attacks and spam
- Path traversal attacks
- Webhook spoofing
- Information leakage
- Third-party service failures

## Security Layers

### 1. Input Validation & Sanitization

**Location:** `supabase/functions/_shared/input-validator.ts`

**Features:**
- SQL injection pattern detection
- XSS attack prevention
- Path traversal protection
- Email validation
- Phone number validation
- UUID validation
- Monetary amount validation
- Suspicious pattern detection

**Usage:**
```typescript
import { validateInput, validateEmail } from '../_shared/input-validator.ts';

const result = validateInput(data, {
  allowHtml: false,
  maxLength: 5000,
});

if (!result.isValid) {
  return errorResponse(result.errors.join(', '), 400);
}

if (data.email && !validateEmail(data.email)) {
  return errorResponse('Invalid email', 400);
}
```

### 2. Security Headers

**Location:** `supabase/functions/_shared/security-headers.ts`

**Headers Implemented:**
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `X-XSS-Protection: 1; mode=block` - Enables XSS protection
- `Strict-Transport-Security` - Forces HTTPS
- `Content-Security-Policy` - Controls resource loading
- `Referrer-Policy` - Controls referer information
- `Permissions-Policy` - Restricts browser features

**Usage:**
```typescript
import { secureResponse } from '../_shared/security-headers.ts';

return secureResponse(
  { data: result },
  200,
  {},
  {
    enableCSP: true,
    enableHSTS: true,
    allowedOrigins: ['https://dropgood.co'],
  }
);
```

### 3. Advanced Rate Limiting

**Location:** `supabase/functions/_shared/advanced-rate-limiter.ts`

**Features:**
- IP-based rate limiting
- User-based rate limiting
- Endpoint-based rate limiting
- Sliding window algorithm
- Automatic IP blocking on violations
- Progressive blocking (increases with violations)
- Redis support for distributed rate limiting (via Upstash)

**Configuration:**

For production with Redis/Upstash:
```bash
# Set environment variables
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

**Usage:**
```typescript
import { AdvancedRateLimiter } from '../_shared/advanced-rate-limiter.ts';

const rateLimiter = new AdvancedRateLimiter();

const result = await rateLimiter.checkMultiTierLimit(req, {
  ip: { maxRequests: 100, windowMs: 60000 },
  user: { maxRequests: 50, windowMs: 60000 },
  endpoint: { maxRequests: 1000, windowMs: 60000 },
});

if (!result.allowed) {
  return rateLimitExceededResponse(result);
}
```

### 4. Webhook Signature Verification

**Location:** `supabase/functions/_shared/webhook-verify.ts`

**Supported Providers:**
- Stripe (HMAC SHA256)
- Uber (HMAC SHA512)

**Features:**
- Timestamp validation (prevents replay attacks)
- Constant-time comparison (prevents timing attacks)
- Duplicate event detection

**Usage (Stripe):**
```typescript
import { verifyStripeWebhook } from '../_shared/webhook-verify.ts';

const signature = req.headers.get('stripe-signature');
const payload = await req.text();

const isValid = await verifyStripeWebhook(
  payload,
  signature,
  STRIPE_WEBHOOK_SECRET
);

if (!isValid) {
  return errorResponse('Invalid signature', 401);
}
```

**Usage (Uber):**
```typescript
import { verifyUberWebhook } from '../_shared/webhook-verify.ts';

const signature = req.headers.get('x-uber-signature');
const payload = await req.text();

const isValid = await verifyUberWebhook(
  payload,
  signature,
  UBER_WEBHOOK_SECRET
);
```

### 5. Security Monitoring & IP Blocking

**Location:** `supabase/functions/_shared/security-monitor.ts`

**Features:**
- Real-time security event logging
- Automatic IP blocking
- Suspicious pattern detection
- User agent analysis
- Progressive violation tracking
- Security event database logging

**Usage:**
```typescript
import { securityCheckMiddleware, securityMonitor } from '../_shared/security-monitor.ts';

// Check request security
const securityResponse = await securityCheckMiddleware(req, body);
if (securityResponse) return securityResponse;

// Manually log security event
await securityMonitor.logSecurityEvent({
  timestamp: new Date(),
  event_type: 'SUSPICIOUS_ACTIVITY',
  severity: 'high',
  ip_address: '1.2.3.4',
  details: { reason: 'Multiple failed attempts' },
  blocked: false,
});

// Check if IP is blocked
if (securityMonitor.isIPBlocked(ip)) {
  // Handle blocked IP
}
```

### 6. Request Guards & Protection

**Location:** `supabase/functions/_shared/request-guard.ts`

**Features:**
- Request size limits (body, URL, headers)
- Request timeout protection
- Safe environment variable access
- Safe request logging (no sensitive data)
- Error sanitization (prevents info leakage)

**Usage:**
```typescript
import { requestGuardMiddleware, withTimeout, readBodyWithLimit } from '../_shared/request-guard.ts';

// Check request limits
const guardResponse = await requestGuardMiddleware(req, {
  maxBodySize: 1024 * 1024, // 1MB
  maxUrlLength: 2048,
  timeout: 30000, // 30 seconds
});
if (guardResponse) return guardResponse;

// Read body with size limit
const bodyResult = await readBodyWithLimit(req, 1024 * 1024);
if (!bodyResult.success) {
  return errorResponse(bodyResult.error, 400);
}

// Execute with timeout
const result = await withTimeout(
  someAsyncOperation(),
  10000,
  'Operation timeout'
);
```

### 7. Bot Protection

**Location:** `supabase/functions/_shared/bot-protection.ts`

**Features:**
- Honeypot field detection
- Submission timing analysis
- User agent analysis
- Request fingerprinting
- Duplicate submission detection
- Behavioral scoring

**Usage:**
```typescript
import { detectBot } from '../_shared/bot-protection.ts';

const botResult = detectBot(req, data, data.formLoadTime);

if (botResult.shouldBlock) {
  return errorResponse('Request blocked', 403);
}
```

**Frontend Implementation (Honeypot):**
```tsx
<form>
  {/* Visible fields */}
  <input type="text" name="name" />
  <input type="email" name="email" />

  {/* Honeypot field - hidden from humans */}
  <input
    type="text"
    name="website"
    style={{ position: 'absolute', left: '-9999px' }}
    tabIndex={-1}
    autoComplete="off"
  />

  {/* Form load timestamp */}
  <input type="hidden" name="formLoadTime" value={Date.now()} />
</form>
```

### 8. Circuit Breaker Pattern

**Location:** `supabase/functions/_shared/circuit-breaker.ts`

**Features:**
- Automatic failure detection
- Circuit states: CLOSED, OPEN, HALF_OPEN
- Configurable thresholds
- Service health monitoring
- Automatic retry logic

**Usage:**
```typescript
import { callStripeWithBreaker, callUberWithBreaker } from '../_shared/circuit-breaker.ts';

// Wrap external API calls
const result = await callStripeWithBreaker(async () => {
  const response = await fetch('https://api.stripe.com/v1/charges', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}` },
    body: data,
  });
  return response.json();
});
```

### 9. CORS Configuration

**Location:** `supabase/functions/_shared/cors-config.ts`

**Features:**
- Environment-based allowed origins
- Origin validation
- Proper CORS headers
- Credentials support

**Configuration:**
```bash
# Set allowed origins in environment
ALLOWED_ORIGINS=https://dropgood.co,https://www.dropgood.co
PRODUCTION_DOMAIN=dropgood.co
```

## Database Security

### Security Logs Table

**Migration:** `supabase/migrations/20251115000000_security_enhancements.sql`

The `security_logs` table stores all security events:
- Event type and severity
- IP addresses and user agents
- Event details (JSON)
- Blocked status

**Viewing Security Logs:**
```sql
-- Recent critical events
SELECT * FROM security_logs
WHERE severity = 'critical'
ORDER BY created_at DESC
LIMIT 100;

-- Blocked IPs
SELECT ip_address, COUNT(*) as violations
FROM security_logs
WHERE blocked = true
GROUP BY ip_address
ORDER BY violations DESC;

-- Event types
SELECT event_type, COUNT(*) as count
FROM security_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY event_type
ORDER BY count DESC;
```

## Environment Variables

Add these to your Supabase Edge Function secrets:

```bash
# Required
STRIPE_SECRET_KEY=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
UBER_CLIENT_ID=xxx
UBER_CLIENT_SECRET=xxx
UBER_WEBHOOK_SECRET=xxx

# Optional (Production Recommended)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
ALLOWED_ORIGINS=https://dropgood.co
PRODUCTION_DOMAIN=dropgood.co

# Optional (Bot Protection)
CAPTCHA_SECRET_KEY=xxx
```

## Security Checklist

- [ ] Run the security migration: `20251115000000_security_enhancements.sql`
- [ ] Set up Redis/Upstash for production rate limiting
- [ ] Configure `ALLOWED_ORIGINS` environment variable
- [ ] Add webhook secrets for Stripe and Uber
- [ ] Review and update CSP policy in `security-headers.ts`
- [ ] Add honeypot fields to public forms
- [ ] Test rate limiting thresholds
- [ ] Set up monitoring for security logs
- [ ] Enable HTTPS (Strict-Transport-Security)
- [ ] Review RLS policies (existing, not modified)

## Monitoring & Alerts

### Key Metrics to Monitor

1. **Rate Limit Violations**
   - High violation count may indicate DDoS
   - Check `security_logs` for `RATE_LIMIT_EXCEEDED`

2. **Blocked IPs**
   - Monitor unique IPs blocked
   - Review blocking reasons

3. **Bot Detection**
   - Track `BOT_DETECTED` events
   - Adjust detection thresholds if needed

4. **Circuit Breaker Status**
   - Monitor third-party service health
   - Alert when circuits are OPEN

5. **Suspicious Patterns**
   - SQL injection attempts
   - XSS attempts
   - Path traversal attempts

### Example Monitoring Query

```sql
-- Daily security summary
SELECT
  DATE(created_at) as date,
  event_type,
  severity,
  COUNT(*) as count,
  COUNT(DISTINCT ip_address) as unique_ips
FROM security_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at), event_type, severity
ORDER BY date DESC, count DESC;
```

## Best Practices

1. **Always validate and sanitize input** - Use `validateInput()` on all user data
2. **Use rate limiting on all public endpoints** - Especially auth and payment endpoints
3. **Verify webhook signatures** - Never trust incoming webhooks without verification
4. **Log security events** - Use `securityMonitor.logSecurityEvent()` for suspicious activity
5. **Use circuit breakers for external APIs** - Prevent cascading failures
6. **Review security logs regularly** - Set up automated alerts
7. **Keep secrets secure** - Never log API keys or tokens
8. **Use HTTPS only** - Enable HSTS headers
9. **Update dependencies regularly** - Check for security patches
10. **Test security measures** - Perform regular security audits

## Reference Implementation

See `supabase/functions/secure-endpoint-example/index.ts` for a complete example of how to use all security features together.

## Support

For security issues or questions, please contact your security team or review the code in:
- `supabase/functions/_shared/` - All security middleware
- `SECURITY.md` - This documentation
