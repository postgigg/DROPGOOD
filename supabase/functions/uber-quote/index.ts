import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { makeUberRequest } from '../_shared/uber-auth.ts';
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';

interface QuoteRequest {
  pickup_latitude: number;
  pickup_longitude: number;
  pickup_address: string;
  dropoff_latitude: number;
  dropoff_longitude: number;
  dropoff_address: string;
  pickup_phone_number?: string;
  dropoff_phone_number?: string;
}

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const {
      pickup_latitude,
      pickup_longitude,
      pickup_address,
      dropoff_latitude,
      dropoff_longitude,
      dropoff_address,
      pickup_phone_number = '+15555555555',
      dropoff_phone_number = '+15555555555'
    }: QuoteRequest = await req.json();

    if (!pickup_latitude || !pickup_longitude || !dropoff_latitude || !dropoff_longitude) {
      return errorResponse('Missing required coordinates');
    }

    const clientId = Deno.env.get('UBER_CLIENT_ID');
    const clientSecret = Deno.env.get('UBER_CLIENT_SECRET');
    const customerId = Deno.env.get('UBER_CUSTOMER_ID');

    if (!clientId || !clientSecret || !customerId) {
      return errorResponse('Uber credentials not configured', 500);
    }

    const quoteData = await makeUberRequest(
      `/customers/${customerId}/delivery_quotes`,
      {
        method: 'POST',
        clientId,
        clientSecret,
        body: {
          pickup_address,
          dropoff_address,
          pickup_latitude,
          pickup_longitude,
          dropoff_latitude,
          dropoff_longitude,
          pickup_phone_number,
          dropoff_phone_number,
        },
      }
    );

    return jsonResponse({
      quote_id: quoteData.id,
      fee_cents: quoteData.fee,
      currency: quoteData.currency_type || quoteData.currency,
      dropoff_eta: quoteData.dropoff_eta,
      duration_minutes: quoteData.duration,
      pickup_duration_minutes: quoteData.pickup_duration,
      expires: quoteData.expires,
      created: quoteData.created,
    });
  } catch (error) {
    console.error('Error getting Uber quote:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to get quote',
      500
    );
  }
});
