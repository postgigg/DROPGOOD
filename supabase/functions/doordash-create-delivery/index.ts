/**
 * DoorDash Create Delivery Edge Function
 * Accept a quote and create actual delivery after payment succeeds
 *
 * Two workflows supported:
 * 1. Accept existing quote (recommended - within 5 minutes of quote creation)
 * 2. Direct delivery creation (without prior quote)
 *
 * Endpoint: POST /drive/v2/quotes/{external_delivery_id}/accept
 *        or POST /drive/v2/deliveries
 * Returns: { delivery_id, tracking_url, status, dasher_info }
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { makeDoorDashRequest, formatDoorDashAddress, formatDoorDashPhone } from '../_shared/doordash-auth.ts';

interface CreateDeliveryRequest {
  booking_id: string; // DropGood booking ID
  external_delivery_id: string; // Used for quote acceptance or delivery creation
  quote_id?: string; // If accepting a quote

  // Pickup details
  pickup_address: {
    street?: string;
    street1?: string;
    city?: string;
    state?: string;
    zip?: string;
    zip_code?: string;
  };
  pickup_phone_number: string;
  pickup_business_name?: string;
  pickup_instructions?: string;

  // Dropoff details
  dropoff_address: {
    street?: string;
    street1?: string;
    city?: string;
    state?: string;
    zip?: string;
    zip_code?: string;
  };
  dropoff_phone_number: string;
  dropoff_business_name?: string;
  dropoff_instructions?: string;

  // Order details
  order_value?: number; // In cents
  items?: Array<{
    name: string;
    description?: string;
    quantity: number;
  }>;

  // Delivery options
  dasher_allowed_vehicles?: string[]; // ['car', 'bicycle', 'walker']
  contactless_dropoff?: boolean;
  tip?: number; // In cents
  pickup_time?: string; // ISO 8601 datetime
  dropoff_time?: string; // ISO 8601 datetime
}

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const requestData: CreateDeliveryRequest = await req.json();

    console.log('🚗 Creating DoorDash delivery for booking:', requestData.booking_id);

    // Validate required fields
    if (!requestData.booking_id || !requestData.external_delivery_id) {
      return new Response(
        JSON.stringify({ error: 'Missing booking_id or external_delivery_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!requestData.pickup_address || !requestData.dropoff_address) {
      return new Response(
        JSON.stringify({ error: 'Missing pickup or dropoff address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let deliveryData: any;

    // Workflow 1: Accept existing quote (recommended)
    if (requestData.quote_id) {
      console.log(`📋 Accepting DoorDash quote: ${requestData.quote_id}`);

      const acceptPayload: any = {
        tip: requestData.tip || 0 // Can update tip during acceptance
      };

      const response = await makeDoorDashRequest(
        `/drive/v2/quotes/${requestData.external_delivery_id}/accept`,
        {
          method: 'POST',
          body: acceptPayload
        }
      );

      if (!response.success) {
        console.error('❌ DoorDash quote acceptance failed:', response.error);
        return new Response(
          JSON.stringify({ error: response.error || 'Failed to accept DoorDash quote' }),
          { status: response.status || 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      deliveryData = response.data;
      console.log('✅ DoorDash quote accepted');
    }
    // Workflow 2: Direct delivery creation (without quote)
    else {
      console.log('📦 Creating DoorDash delivery directly (no quote)');

      // DoorDash expects full address as single string, not split components
      const pickupAddr = formatDoorDashAddress(requestData.pickup_address);
      const dropoffAddr = formatDoorDashAddress(requestData.dropoff_address);

      const deliveryPayload: any = {
        external_delivery_id: requestData.external_delivery_id,

        // Pickup details - full address as single string
        pickup_address: `${pickupAddr.street} ${pickupAddr.city}, ${pickupAddr.state} ${pickupAddr.zip_code}`,
        pickup_phone_number: formatDoorDashPhone(requestData.pickup_phone_number),

        // Dropoff details - full address as single string
        dropoff_address: `${dropoffAddr.street} ${dropoffAddr.city}, ${dropoffAddr.state} ${dropoffAddr.zip_code}`,
        dropoff_phone_number: formatDoorDashPhone(requestData.dropoff_phone_number),
      };

      // Add optional fields
      if (requestData.pickup_business_name) deliveryPayload.pickup_business_name = requestData.pickup_business_name;
      if (requestData.pickup_instructions) deliveryPayload.pickup_instructions = requestData.pickup_instructions;
      if (requestData.dropoff_business_name) deliveryPayload.dropoff_business_name = requestData.dropoff_business_name;
      if (requestData.dropoff_instructions) deliveryPayload.dropoff_instructions = requestData.dropoff_instructions;
      if (requestData.order_value) deliveryPayload.order_value = requestData.order_value;
      if (requestData.items && requestData.items.length > 0) deliveryPayload.items = requestData.items;
      if (requestData.dasher_allowed_vehicles) deliveryPayload.dasher_allowed_vehicles = requestData.dasher_allowed_vehicles;
      if (requestData.contactless_dropoff !== undefined) deliveryPayload.contactless_dropoff = requestData.contactless_dropoff;
      if (requestData.tip) deliveryPayload.tip = requestData.tip;
      if (requestData.pickup_time) deliveryPayload.pickup_time = requestData.pickup_time;
      if (requestData.dropoff_time) deliveryPayload.dropoff_time = requestData.dropoff_time;

      console.log('DoorDash delivery payload:', JSON.stringify(deliveryPayload, null, 2));

      const response = await makeDoorDashRequest('/drive/v2/deliveries', {
        method: 'POST',
        body: deliveryPayload
      });

      if (!response.success) {
        console.error('❌ DoorDash delivery creation failed:', response.error);
        return new Response(
          JSON.stringify({ error: response.error || 'Failed to create DoorDash delivery' }),
          { status: response.status || 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      deliveryData = response.data;
      console.log('✅ DoorDash delivery created');
    }

    // Extract delivery info
    const deliveryId = deliveryData.delivery_id || deliveryData.id;
    const trackingUrl = deliveryData.tracking_url;
    const status = deliveryData.delivery_status || deliveryData.status || 'created';
    const feeCents = deliveryData.fee;

    console.log('✅ DoorDash delivery created:', {
      delivery_id: deliveryId,
      tracking_url: trackingUrl,
      status: status,
      fee_cents: feeCents
    });

    // Update booking in database with DoorDash delivery info
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        doordash_delivery_id: deliveryId,
        doordash_quote_id: requestData.quote_id || null,
        doordash_tracking_url: trackingUrl || null,
        doordash_status: status,
        doordash_fee_cents: feeCents || null,
        delivery_provider: 'doordash'
      })
      .eq('id', requestData.booking_id);

    if (updateError) {
      console.error('⚠️ Failed to update booking with DoorDash delivery info:', updateError);
      // Don't fail the request - delivery was created successfully
    } else {
      console.log('✅ Booking updated with DoorDash delivery info');
    }

    // Return delivery details
    return new Response(
      JSON.stringify({
        delivery_id: deliveryId,
        external_delivery_id: requestData.external_delivery_id,
        tracking_url: trackingUrl || null,
        status: status,
        fee_cents: feeCents || null,
        pickup_eta: deliveryData.pickup_time_estimated || null,
        dropoff_eta: deliveryData.dropoff_time_estimated || null,
        created_at: deliveryData.created || new Date().toISOString(),
        raw_response: deliveryData
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error in doordash-create-delivery:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
        details: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
