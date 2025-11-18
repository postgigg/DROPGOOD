/**
 * DoorDash Drive Quote Edge Function
 * Get delivery quote from DoorDash Drive API
 *
 * Endpoint: POST /v2/quotes
 * Returns: { quote_id, fee_cents, currency, pickup_eta, dropoff_eta }
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { makeDoorDashRequest, formatDoorDashAddress, formatDoorDashPhone } from '../_shared/doordash-auth.ts';

interface QuoteRequest {
  // External delivery ID (unique per quote request)
  external_delivery_id?: string;

  // Pickup details
  pickup_address: {
    street?: string;
    street1?: string;
    city?: string;
    state?: string;
    zip?: string;
    zip_code?: string;
  };
  pickup_phone_number?: string;
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
  dropoff_phone_number?: string;
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
  tip?: number; // In cents - enables $2.75 discount if provided
}

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const requestData: QuoteRequest = await req.json();

    console.log('🚗 DoorDash Quote Request:', {
      pickup: requestData.pickup_address,
      dropoff: requestData.dropoff_address,
      external_id: requestData.external_delivery_id
    });

    // Validate required fields
    if (!requestData.pickup_address || !requestData.dropoff_address) {
      return new Response(
        JSON.stringify({ error: 'Missing pickup or dropoff address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate unique external delivery ID if not provided
    const externalDeliveryId = requestData.external_delivery_id || `quote_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Build DoorDash quote request payload
    // DoorDash expects full address as single string, not split components
    const pickupAddr = formatDoorDashAddress(requestData.pickup_address);
    const dropoffAddr = formatDoorDashAddress(requestData.dropoff_address);

    const quotePayload: any = {
      external_delivery_id: externalDeliveryId,

      // Pickup details - full address as single string
      pickup_address: `${pickupAddr.street} ${pickupAddr.city}, ${pickupAddr.state} ${pickupAddr.zip_code}`,

      // Dropoff details - full address as single string
      dropoff_address: `${dropoffAddr.street} ${dropoffAddr.city}, ${dropoffAddr.state} ${dropoffAddr.zip_code}`,
    };

    // Add optional pickup details
    if (requestData.pickup_phone_number) {
      quotePayload.pickup_phone_number = formatDoorDashPhone(requestData.pickup_phone_number);
    }
    if (requestData.pickup_business_name) {
      quotePayload.pickup_business_name = requestData.pickup_business_name;
    }
    if (requestData.pickup_instructions) {
      quotePayload.pickup_instructions = requestData.pickup_instructions;
    }

    // Add optional dropoff details
    if (requestData.dropoff_phone_number) {
      quotePayload.dropoff_phone_number = formatDoorDashPhone(requestData.dropoff_phone_number);
    }
    if (requestData.dropoff_business_name) {
      quotePayload.dropoff_business_name = requestData.dropoff_business_name;
    }
    if (requestData.dropoff_instructions) {
      quotePayload.dropoff_instructions = requestData.dropoff_instructions;
    }

    // Add order details
    if (requestData.order_value !== undefined) {
      quotePayload.order_value = requestData.order_value;
    }
    if (requestData.items && requestData.items.length > 0) {
      quotePayload.items = requestData.items;
    }

    // Add delivery options
    if (requestData.dasher_allowed_vehicles && requestData.dasher_allowed_vehicles.length > 0) {
      quotePayload.dasher_allowed_vehicles = requestData.dasher_allowed_vehicles;
    }
    if (requestData.contactless_dropoff !== undefined) {
      quotePayload.contactless_dropoff = requestData.contactless_dropoff;
    }

    // Add tip to enable $2.75 discount (if provided)
    if (requestData.tip !== undefined && requestData.tip > 0) {
      quotePayload.tip = requestData.tip;
    }

    console.log('DoorDash quote payload:', JSON.stringify(quotePayload, null, 2));

    // Call DoorDash API
    const response = await makeDoorDashRequest('/drive/v2/quotes', {
      method: 'POST',
      body: quotePayload
    });

    if (!response.success) {
      console.error('❌ DoorDash quote API error:', response.error);
      return new Response(
        JSON.stringify({ error: response.error || 'Failed to get DoorDash quote' }),
        { status: response.status || 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const quoteData = response.data;

    console.log('✅ DoorDash quote received:', {
      external_id: quoteData.external_delivery_id,
      fee_cents: quoteData.fee,
      currency: quoteData.currency_code
    });

    // Return standardized response
    return new Response(
      JSON.stringify({
        quote_id: quoteData.id || externalDeliveryId,
        external_delivery_id: quoteData.external_delivery_id || externalDeliveryId,
        fee_cents: quoteData.fee || 0,
        fee_dollars: (quoteData.fee || 0) / 100,
        currency_code: quoteData.currency_code || 'USD',
        pickup_time_estimated: quoteData.pickup_time_estimated || null,
        dropoff_time_estimated: quoteData.dropoff_time_estimated || null,
        created: quoteData.created || new Date().toISOString(),
        expires: quoteData.expires || null,
        raw_response: quoteData // For debugging
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error in doordash-quote:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
        details: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
