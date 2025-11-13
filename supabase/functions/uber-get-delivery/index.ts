import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { makeUberRequest } from '../_shared/uber-auth.ts';
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { delivery_id } = await req.json();

    if (!delivery_id) {
      return errorResponse('Missing delivery_id');
    }

    const clientId = Deno.env.get('UBER_CLIENT_ID');
    const clientSecret = Deno.env.get('UBER_CLIENT_SECRET');
    const customerId = Deno.env.get('UBER_CUSTOMER_ID');

    if (!clientId || !clientSecret || !customerId) {
      return errorResponse('Uber credentials not configured', 500);
    }

    const deliveryData = await makeUberRequest(
      `/customers/${customerId}/deliveries/${delivery_id}`,
      {
        method: 'GET',
        clientId,
        clientSecret,
      }
    );

    return jsonResponse({
      id: deliveryData.id,
      status: deliveryData.status,
      tracking_url: deliveryData.tracking_url,
      courier: deliveryData.courier,
      pickup_eta: deliveryData.pickup_eta,
      dropoff_eta: deliveryData.dropoff_eta,
      pickup: deliveryData.pickup,
      dropoff: deliveryData.dropoff,
      complete: deliveryData.complete,
    });
  } catch (error) {
    console.error('Error getting Uber delivery:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to get delivery',
      500
    );
  }
});
