import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { makeUberRequest } from '../_shared/uber-auth.ts';
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';

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
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const requestData: DeliveryRequest = await req.json();

    const clientId = Deno.env.get('UBER_CLIENT_ID');
    const clientSecret = Deno.env.get('UBER_CLIENT_SECRET');
    const customerId = Deno.env.get('UBER_CUSTOMER_ID');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!clientId || !clientSecret || !customerId) {
      return errorResponse('Uber credentials not configured', 500);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const deliveryData = await makeUberRequest(
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
    }

    return jsonResponse({
      delivery_id: deliveryData.id,
      tracking_url: deliveryData.tracking_url,
      status: deliveryData.status,
      pickup_eta: deliveryData.pickup_eta,
      dropoff_eta: deliveryData.dropoff_eta,
      courier: deliveryData.courier,
    });
  } catch (error) {
    console.error('Error creating Uber delivery:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to create delivery',
      500
    );
  }
});
