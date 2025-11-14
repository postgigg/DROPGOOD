import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { makeUberRequest } from '../_shared/uber-auth.ts';
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors-config.ts';
import { secureResponse, secureErrorResponse } from '../_shared/security-headers.ts';
import { validateInput, validateUUID } from '../_shared/input-validator.ts';
import { AdvancedRateLimiter, rateLimitExceededResponse } from '../_shared/advanced-rate-limiter.ts';
import { securityCheckMiddleware } from '../_shared/security-monitor.ts';
import { requestGuardMiddleware, readBodyWithLimit, withTimeout, logRequestSafely } from '../_shared/request-guard.ts';
import { callUberWithBreaker } from '../_shared/circuit-breaker.ts';

const rateLimiter = new AdvancedRateLimiter();

interface DeliveryRequest {
  booking_id: string;
  quote_id: string;
  pickup_name: string;
  pickup_address: string;
  pickup_latitude: number;
  pickup_longitude: number;
  pickup_phone_number: string;
  dropoff_name: string;
  dropoff_address: string;
  dropoff_latitude: number;
  dropoff_longitude: number;
  dropoff_phone_number: string;
  dropoff_notes?: string;
  manifest_reference: string;
  manifest_items: Array<{
    name: string;
    quantity: number;
    size?: string;
  }>;
}

Deno.serve(async (req: Request) => {
  // 1. Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // 2. Log request safely
    logRequestSafely(req, { endpoint: 'uber-create-delivery' });

    // 3. Check request size limits
    const guardResponse = await requestGuardMiddleware(req, {
      maxBodySize: 200 * 1024, // 200KB limit
      timeout: 20000, // 20 second timeout (Uber API can be slow)
    });
    if (guardResponse) return guardResponse;

    // 4. Security monitoring and IP blocking
    const securityResponse = await securityCheckMiddleware(req);
    if (securityResponse) return securityResponse;

    // 5. Rate limiting
    const rateLimitResult = await rateLimiter.checkMultiTierLimit(req, {
      ip: { maxRequests: 30, windowMs: 60000 }, // 30 req/min per IP
      user: { maxRequests: 20, windowMs: 60000 }, // 20 req/min per user
      endpoint: { maxRequests: 100, windowMs: 60000 }, // 100 req/min total
    });

    if (!rateLimitResult.allowed) {
      return rateLimitExceededResponse(rateLimitResult);
    }

    // 6. Read and validate request body
    const bodyResult = await readBodyWithLimit(req, 200 * 1024);
    if (!bodyResult.success) {
      return secureErrorResponse(bodyResult.error, 400);
    }

    const requestData: DeliveryRequest = bodyResult.data;

    // 7. Input validation
    const validationResult = validateInput(requestData, {
      allowHtml: false,
      maxLength: 10000,
    });

    if (!validationResult.isValid) {
      return secureErrorResponse(
        `Validation failed: ${validationResult.errors.join(', ')}`,
        400
      );
    }

    // 8. Specific field validations
    if (!validateUUID(requestData.booking_id)) {
      return secureErrorResponse('Invalid booking ID', 400);
    }

    if (!validateUUID(requestData.quote_id)) {
      return secureErrorResponse('Invalid quote ID', 400);
    }

    if (!requestData.pickup_name || requestData.pickup_name.length < 2) {
      return secureErrorResponse('Invalid pickup name', 400);
    }

    if (!requestData.dropoff_name || requestData.dropoff_name.length < 2) {
      return secureErrorResponse('Invalid dropoff name', 400);
    }

    // Validate phone numbers (basic check)
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(requestData.pickup_phone_number.replace(/[-\s()]/g, ''))) {
      return secureErrorResponse('Invalid pickup phone number', 400);
    }

    if (!phoneRegex.test(requestData.dropoff_phone_number.replace(/[-\s()]/g, ''))) {
      return secureErrorResponse('Invalid dropoff phone number', 400);
    }

    // Validate coordinates
    if (Math.abs(requestData.pickup_latitude) > 90 || Math.abs(requestData.pickup_longitude) > 180) {
      return secureErrorResponse('Invalid pickup coordinates', 400);
    }

    if (Math.abs(requestData.dropoff_latitude) > 90 || Math.abs(requestData.dropoff_longitude) > 180) {
      return secureErrorResponse('Invalid dropoff coordinates', 400);
    }

    // Validate manifest items
    if (!Array.isArray(requestData.manifest_items) || requestData.manifest_items.length === 0) {
      return secureErrorResponse('Manifest items required', 400);
    }

    // 9. Get Uber credentials
    const clientId = Deno.env.get('UBER_CLIENT_ID');
    const clientSecret = Deno.env.get('UBER_CLIENT_SECRET');
    const customerId = Deno.env.get('UBER_CUSTOMER_ID');

    if (!clientId || !clientSecret || !customerId) {
      return secureErrorResponse('Uber integration not configured', 500);
    }

    // 10. Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 11. Create Uber delivery with circuit breaker and timeout
    const deliveryData = await withTimeout(
      callUberWithBreaker(async () => {
        return await makeUberRequest(
          `/customers/${customerId}/deliveries`,
          {
            method: 'POST',
            clientId,
            clientSecret,
            body: {
              quote_id: requestData.quote_id,
              pickup_name: requestData.pickup_name,
              pickup_address: requestData.pickup_address,
              pickup_latitude: requestData.pickup_latitude,
              pickup_longitude: requestData.pickup_longitude,
              pickup_phone_number: requestData.pickup_phone_number,
              dropoff_name: requestData.dropoff_name,
              dropoff_address: requestData.dropoff_address,
              dropoff_latitude: requestData.dropoff_latitude,
              dropoff_longitude: requestData.dropoff_longitude,
              dropoff_phone_number: requestData.dropoff_phone_number,
              dropoff_notes: requestData.dropoff_notes || '',
              manifest_reference: requestData.manifest_reference,
              manifest_items: requestData.manifest_items,
              deliverable_action: 'deliverable_action_meet_at_door',
              undeliverable_action: 'return',
              idempotency_key: `${requestData.booking_id}-${Date.now()}`,
            },
          }
        );
      }),
      15000, // 15 second timeout
      'Uber API timeout'
    );

    // 12. Update booking in database
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        uber_delivery_id: deliveryData.id,
        uber_tracking_url: deliveryData.tracking_url,
        uber_status: deliveryData.status,
        uber_quote_id: requestData.quote_id,
      })
      .eq('id', requestData.booking_id);

    if (updateError) {
      console.error('Failed to update booking:', updateError);
      // Don't fail the request if DB update fails, delivery was created
    }

    // 13. Return secure response
    return secureResponse(
      {
        delivery_id: deliveryData.id,
        tracking_url: deliveryData.tracking_url,
        status: deliveryData.status,
        pickup_eta: deliveryData.pickup_eta,
        dropoff_eta: deliveryData.dropoff_eta,
        courier: deliveryData.courier,
      },
      200,
      {},
      {
        enableCSP: true,
        enableHSTS: true,
      }
    );

  } catch (error) {
    console.error('Error creating Uber delivery:', error);

    // Return sanitized error
    const errorMessage = error instanceof Error
      ? (error.message.includes('timeout')
          ? 'Delivery creation timeout. Please try again.'
          : error.message.includes('Circuit breaker')
          ? 'Delivery service temporarily unavailable. Please try again later.'
          : 'Failed to create delivery. Please try again.')
      : 'Failed to create delivery. Please try again.';

    return secureErrorResponse(errorMessage, 500);
  }
});
