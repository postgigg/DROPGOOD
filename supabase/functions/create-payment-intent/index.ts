import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { handleCors, errorResponse } from '../_shared/cors-config.ts';
import { secureResponse, secureErrorResponse } from '../_shared/security-headers.ts';
import { validateInput, validateAmount, validateUUID } from '../_shared/input-validator.ts';
import { AdvancedRateLimiter, rateLimitExceededResponse } from '../_shared/advanced-rate-limiter.ts';
import { securityCheckMiddleware } from '../_shared/security-monitor.ts';
import { requestGuardMiddleware, readBodyWithLimit, withTimeout, logRequestSafely } from '../_shared/request-guard.ts';
import { callStripeWithBreaker } from '../_shared/circuit-breaker.ts';

const rateLimiter = new AdvancedRateLimiter();
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');

Deno.serve(async (req: Request) => {
  // 1. Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // 2. Log request safely
    logRequestSafely(req, { endpoint: 'create-payment-intent' });

    // 3. Check request size limits
    const guardResponse = await requestGuardMiddleware(req, {
      maxBodySize: 100 * 1024, // 100KB limit for payment data
      timeout: 15000, // 15 second timeout
    });
    if (guardResponse) return guardResponse;

    // 4. Security monitoring and IP blocking
    const securityResponse = await securityCheckMiddleware(req);
    if (securityResponse) return securityResponse;

    // 5. Rate limiting - strict for payment endpoint
    const rateLimitResult = await rateLimiter.checkMultiTierLimit(req, {
      ip: { maxRequests: 20, windowMs: 60000 }, // 20 req/min per IP (strict for payments)
      user: { maxRequests: 10, windowMs: 60000 }, // 10 req/min per user
      endpoint: { maxRequests: 500, windowMs: 60000 }, // 500 req/min total
    });

    if (!rateLimitResult.allowed) {
      return rateLimitExceededResponse(rateLimitResult);
    }

    // 6. Read and validate request body
    const bodyResult = await readBodyWithLimit(req, 100 * 1024);
    if (!bodyResult.success) {
      return secureErrorResponse(bodyResult.error, 400);
    }

    const { amount, currency = 'usd', metadata = {}, booking_id } = bodyResult.data;

    // 7. Input validation
    const validationResult = validateInput(bodyResult.data, {
      allowHtml: false,
      maxLength: 5000,
    });

    if (!validationResult.isValid) {
      return secureErrorResponse(
        `Validation failed: ${validationResult.errors.join(', ')}`,
        400
      );
    }

    // 8. Specific validations
    if (!STRIPE_SECRET_KEY) {
      return secureErrorResponse('Payment processing not configured', 500);
    }

    if (!amount || !validateAmount(amount)) {
      return secureErrorResponse('Invalid amount', 400);
    }

    if (booking_id && !validateUUID(booking_id)) {
      return secureErrorResponse('Invalid booking ID', 400);
    }

    if (currency && !['usd', 'eur', 'gbp'].includes(currency.toLowerCase())) {
      return secureErrorResponse('Invalid currency', 400);
    }

    // 9. Build description based on payment type
    let description = 'DropGood Payment';
    if (metadata.type === 'company_credit_purchase') {
      description = `DropGood Company Credits - $${metadata.credit_amount}`;
    } else if (booking_id) {
      description = `DropGood Donation Pickup - ${booking_id}`;
    }

    // 10. Build metadata for Stripe
    const stripeMetadata: Record<string, string> = {};
    if (booking_id) {
      stripeMetadata['booking_id'] = booking_id;
    }
    if (metadata.company_id) {
      stripeMetadata['company_id'] = metadata.company_id;
    }
    if (metadata.credit_amount) {
      stripeMetadata['credit_amount'] = metadata.credit_amount.toString();
    }
    if (metadata.processing_fee) {
      stripeMetadata['processing_fee'] = metadata.processing_fee.toString();
    }
    if (metadata.type) {
      stripeMetadata['type'] = metadata.type;
    }

    // 11. Create Stripe payment intent with circuit breaker and timeout
    const paymentIntent = await withTimeout(
      callStripeWithBreaker(async () => {
        const bodyParams = new URLSearchParams({
          amount: amount.toString(),
          currency: currency,
          'automatic_payment_methods[enabled]': 'true',
          description: description,
        });

        // Add metadata
        Object.entries(stripeMetadata).forEach(([key, value]) => {
          bodyParams.append(`metadata[${key}]`, value);
        });

        const response = await fetch('https://api.stripe.com/v1/payment_intents', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: bodyParams.toString(),
        });

        if (!response.ok) {
          const error = await response.text();
          console.error('Stripe API error:', { status: response.status, error });
          throw new Error(`Stripe API error: ${response.status}`);
        }

        return await response.json();
      }),
      10000, // 10 second timeout
      'Stripe API timeout'
    );

    // 12. Return secure response
    return secureResponse(
      {
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id,
      },
      200,
      {},
      {
        enableCSP: true,
        enableHSTS: true,
      }
    );

  } catch (error) {
    console.error('Error in create-payment-intent:', error);

    // Return sanitized error
    const errorMessage = error instanceof Error && error.message.includes('timeout')
      ? 'Payment processing timeout. Please try again.'
      : 'Payment processing error. Please try again.';

    return secureErrorResponse(errorMessage, 500);
  }
});
