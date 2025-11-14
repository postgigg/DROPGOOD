/**
 * EXAMPLE: Secured Edge Function
 *
 * This is a reference implementation showing how to use all security features together.
 * Copy this pattern to secure your edge functions.
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors-config.ts';
import { getSecurityHeaders, secureResponse, secureErrorResponse } from '../_shared/security-headers.ts';
import { validateInput, validateEmail, validateAmount } from '../_shared/input-validator.ts';
import { AdvancedRateLimiter, rateLimitExceededResponse } from '../_shared/advanced-rate-limiter.ts';
import { securityCheckMiddleware, securityMonitor } from '../_shared/security-monitor.ts';
import { requestGuardMiddleware, readBodyWithLimit, withTimeout, logRequestSafely } from '../_shared/request-guard.ts';
import { detectBot } from '../_shared/bot-protection.ts';
import { callStripeWithBreaker } from '../_shared/circuit-breaker.ts';

const rateLimiter = new AdvancedRateLimiter();

Deno.serve(async (req: Request) => {
  // 1. Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // 2. Log request safely (no sensitive data)
    logRequestSafely(req, { endpoint: 'secure-endpoint-example' });

    // 3. Check request size limits and guard rails
    const guardResponse = await requestGuardMiddleware(req, {
      maxBodySize: 1024 * 1024, // 1MB limit
      timeout: 10000, // 10 second timeout
    });
    if (guardResponse) return guardResponse;

    // 4. Security monitoring and IP blocking
    const securityResponse = await securityCheckMiddleware(req);
    if (securityResponse) return securityResponse;

    // 5. Multi-tier rate limiting (IP + User + Endpoint)
    const rateLimitResult = await rateLimiter.checkMultiTierLimit(req, {
      ip: { maxRequests: 100, windowMs: 60000 }, // 100 req/min per IP
      user: { maxRequests: 50, windowMs: 60000 }, // 50 req/min per user
      endpoint: { maxRequests: 1000, windowMs: 60000 }, // 1000 req/min total
    });

    if (!rateLimitResult.allowed) {
      return rateLimitExceededResponse(rateLimitResult);
    }

    // 6. Read and validate request body
    const bodyResult = await readBodyWithLimit(req, 1024 * 1024);
    if (!bodyResult.success) {
      return secureErrorResponse(bodyResult.error, 400);
    }

    const data = bodyResult.data;

    // 7. Bot detection (honeypot, timing, user agent analysis)
    const botResult = detectBot(req, data, data.formLoadTime);
    if (botResult.shouldBlock) {
      await securityMonitor.logSecurityEvent({
        timestamp: new Date(),
        event_type: 'BOT_DETECTED',
        severity: 'high',
        ip_address: rateLimiter.getIdentifier(req, 'ip'),
        endpoint: '/secure-endpoint-example',
        details: {
          reasons: botResult.reasons,
          confidence: botResult.confidence,
        },
        blocked: true,
      });

      return secureErrorResponse('Request blocked', 403);
    }

    // 8. Input validation and sanitization
    const validationResult = validateInput(data, {
      allowHtml: false,
      maxLength: 5000,
    });

    if (!validationResult.isValid) {
      return secureErrorResponse(
        `Validation failed: ${validationResult.errors.join(', ')}`,
        400
      );
    }

    // 9. Specific field validation
    if (data.email && !validateEmail(data.email)) {
      return secureErrorResponse('Invalid email format', 400);
    }

    if (data.amount && !validateAmount(data.amount)) {
      return secureErrorResponse('Invalid amount', 400);
    }

    // 10. Business logic with timeout protection
    const result = await withTimeout(
      processRequest(validationResult.sanitizedData),
      8000, // 8 second timeout
      'Request processing timeout'
    );

    // 11. Return secure response with all security headers
    return secureResponse(
      { success: true, data: result },
      200,
      {},
      {
        enableCSP: true,
        enableHSTS: true,
        allowedOrigins: ['http://localhost:5173', 'https://yourdomain.com'],
      }
    );

  } catch (error) {
    console.error('Error in secure-endpoint-example:', error);

    // Log security event for unexpected errors
    await securityMonitor.logSecurityEvent({
      timestamp: new Date(),
      event_type: 'ENDPOINT_ERROR',
      severity: 'medium',
      endpoint: '/secure-endpoint-example',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      blocked: false,
    });

    return secureErrorResponse(
      'An error occurred while processing your request',
      500
    );
  }
});

/**
 * Example business logic function
 */
async function processRequest(data: any): Promise<any> {
  // Example: Call external API with circuit breaker
  if (data.processPayment) {
    return await callStripeWithBreaker(async () => {
      // Your Stripe API call here
      return { paymentId: 'pi_example' };
    });
  }

  // Your business logic here
  return {
    message: 'Request processed successfully',
    timestamp: new Date().toISOString(),
  };
}
