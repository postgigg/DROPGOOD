/**
 * Roadie Create Shipment Edge Function
 * Create actual delivery with Roadie after payment succeeds
 *
 * Endpoint: POST /v1/shipments
 * Returns: { shipment_id, reference_id, state, tracking_url }
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { makeRoadieRequest, formatRoadieAddress, formatRoadieContact } from '../_shared/roadie-auth.ts';
import { buildRoadieItems, mapBagsBoxesToRoadieSize } from '../_shared/roadie-size-mapper.ts';

interface CreateShipmentRequest {
  booking_id: string; // DropGood booking ID (used as reference_id)
  description?: string;

  // Pickup details
  pickup_location: {
    address: {
      street?: string;
      street1?: string;
      city?: string;
      state?: string;
      zip?: string;
      zip_code?: string;
    };
    latitude?: number;
    longitude?: number;
    contact: {
      name: string;
      phone: string;
      email?: string;
    };
    notes?: string;
  };

  // Delivery details
  delivery_location: {
    address: {
      street?: string;
      street1?: string;
      city?: string;
      state?: string;
      zip?: string;
      zip_code?: string;
    };
    latitude?: number;
    longitude?: number;
    contact: {
      name: string;
      phone: string;
      email?: string;
    };
    notes?: string;
  };

  // Timing
  pickup_after: string; // ISO 8601 datetime
  deliver_between?: {
    start: string;
    end: string;
  };

  // Items
  bags_count: number;
  boxes_count: number;

  // Options
  options?: {
    signature_required?: boolean;
    notifications_enabled?: boolean;
    decline_insurance?: boolean;
  };
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
    const requestData: CreateShipmentRequest = await req.json();

    console.log('🚚 Creating Roadie shipment for booking:', requestData.booking_id);

    // Validate required fields
    if (!requestData.booking_id) {
      return new Response(
        JSON.stringify({ error: 'Missing booking_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!requestData.pickup_location || !requestData.delivery_location) {
      return new Response(
        JSON.stringify({ error: 'Missing pickup or delivery location' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Auto-determine vehicle size
    const bagsCount = requestData.bags_count || 0;
    const boxesCount = requestData.boxes_count || 0;
    const sizeMapping = mapBagsBoxesToRoadieSize(bagsCount, boxesCount);
    const items = buildRoadieItems(bagsCount, boxesCount);

    console.log(`🚗 Vehicle size: ${sizeMapping.roadie_size.toUpperCase()} - ${sizeMapping.description}`);

    // Generate idempotency key from booking ID
    const idempotencyKey = `dropgood-${requestData.booking_id}-${Date.now()}`;

    // Build Roadie shipment payload
    const shipmentPayload = {
      reference_id: requestData.booking_id,
      idempotency_key: idempotencyKey,
      description: requestData.description || `DropGood donation pickup - ${bagsCount} bags, ${boxesCount} boxes`,
      items,
      pickup_location: {
        address: formatRoadieAddress(requestData.pickup_location.address),
        ...(requestData.pickup_location.latitude && requestData.pickup_location.longitude ? {
          latitude: requestData.pickup_location.latitude,
          longitude: requestData.pickup_location.longitude
        } : {}),
        contact: formatRoadieContact(requestData.pickup_location.contact),
        ...(requestData.pickup_location.notes ? { notes: requestData.pickup_location.notes } : {})
      },
      delivery_location: {
        address: formatRoadieAddress(requestData.delivery_location.address),
        ...(requestData.delivery_location.latitude && requestData.delivery_location.longitude ? {
          latitude: requestData.delivery_location.latitude,
          longitude: requestData.delivery_location.longitude
        } : {}),
        contact: formatRoadieContact(requestData.delivery_location.contact),
        ...(requestData.delivery_location.notes ? { notes: requestData.delivery_location.notes } : {})
      },
      pickup_after: requestData.pickup_after,
      ...(requestData.deliver_between ? { deliver_between: requestData.deliver_between } : {}),
      options: {
        signature_required: requestData.options?.signature_required ?? false,
        notifications_enabled: requestData.options?.notifications_enabled ?? true,
        decline_insurance: requestData.options?.decline_insurance ?? false
      }
    };

    console.log('Roadie shipment payload:', JSON.stringify(shipmentPayload, null, 2));

    // Call Roadie API
    const response = await makeRoadieRequest('/shipments', {
      method: 'POST',
      body: shipmentPayload
    });

    if (!response.success) {
      console.error('❌ Roadie shipment creation failed:', response.error);
      return new Response(
        JSON.stringify({ error: response.error || 'Failed to create Roadie shipment' }),
        { status: response.status || 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const shipmentData = response.data;

    console.log('✅ Roadie shipment created:', {
      id: shipmentData.id,
      reference_id: shipmentData.reference_id,
      state: shipmentData.state
    });

    // Update booking in database with Roadie shipment info
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        roadie_shipment_id: shipmentData.id,
        roadie_reference_id: shipmentData.reference_id || requestData.booking_id,
        roadie_state: shipmentData.state || 'scheduled',
        roadie_tracking_url: shipmentData.tracking_url || null,
        delivery_provider: 'roadie'
      })
      .eq('id', requestData.booking_id);

    if (updateError) {
      console.error('⚠️ Failed to update booking with Roadie shipment info:', updateError);
      // Don't fail the request - shipment was created successfully
    } else {
      console.log('✅ Booking updated with Roadie shipment info');
    }

    // Return shipment details
    return new Response(
      JSON.stringify({
        shipment_id: shipmentData.id,
        reference_id: shipmentData.reference_id || requestData.booking_id,
        state: shipmentData.state || 'scheduled',
        tracking_url: shipmentData.tracking_url || null,
        roadie_size: sizeMapping.roadie_size,
        created_at: shipmentData.created_at || new Date().toISOString(),
        raw_response: shipmentData
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error in roadie-create-shipment:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
        details: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
