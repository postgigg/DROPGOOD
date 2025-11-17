/**
 * Roadie Estimate Edge Function
 * Get pricing quote from Roadie API with automatic vehicle size determination
 *
 * Endpoint: POST /v1/estimates
 * Returns: { roadie_base_price, estimated_distance, roadie_size }
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { makeRoadieRequest, formatRoadieAddress, formatRoadieContact } from '../_shared/roadie-auth.ts';
import { buildRoadieItems, mapBagsBoxesToRoadieSize, validateRoadieLoad } from '../_shared/roadie-size-mapper.ts';

interface EstimateRequest {
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
    contact?: {
      name?: string;
      phone?: string;
    };
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
    contact?: {
      name?: string;
      phone?: string;
    };
  };

  // Timing
  pickup_after?: string; // ISO 8601 datetime
  deliver_between?: {
    start: string; // ISO 8601 datetime
    end: string;   // ISO 8601 datetime
  };

  // Items (bags/boxes - we auto-determine vehicle size)
  bags_count?: number;
  boxes_count?: number;
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
    const requestData: EstimateRequest = await req.json();

    console.log('📦 Roadie Estimate Request:', {
      pickup: requestData.pickup_location?.address,
      delivery: requestData.delivery_location?.address,
      bags: requestData.bags_count || 0,
      boxes: requestData.boxes_count || 0
    });

    // Validate required fields
    if (!requestData.pickup_location?.address || !requestData.delivery_location?.address) {
      return new Response(
        JSON.stringify({ error: 'Missing pickup or delivery location' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const bagsCount = requestData.bags_count || 0;
    const boxesCount = requestData.boxes_count || 0;

    // Validate load
    const validation = validateRoadieLoad(bagsCount, boxesCount);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.reason }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Auto-determine vehicle size from bags/boxes
    const sizeMapping = mapBagsBoxesToRoadieSize(bagsCount, boxesCount);
    const items = buildRoadieItems(bagsCount, boxesCount);

    console.log(`🚗 Auto-determined vehicle size: ${sizeMapping.roadie_size.toUpperCase()}`);
    console.log(`📏 Dimensions: ${sizeMapping.length}x${sizeMapping.width}x${sizeMapping.height}, ${sizeMapping.weight}lbs`);

    // Build Roadie estimate request
    const roadieEstimatePayload = {
      items,
      pickup_location: {
        address: formatRoadieAddress(requestData.pickup_location.address),
        ...(requestData.pickup_location.latitude && requestData.pickup_location.longitude ? {
          latitude: requestData.pickup_location.latitude,
          longitude: requestData.pickup_location.longitude
        } : {}),
        ...(requestData.pickup_location.contact ? {
          contact: formatRoadieContact(requestData.pickup_location.contact)
        } : {})
      },
      delivery_location: {
        address: formatRoadieAddress(requestData.delivery_location.address),
        ...(requestData.delivery_location.latitude && requestData.delivery_location.longitude ? {
          latitude: requestData.delivery_location.latitude,
          longitude: requestData.delivery_location.longitude
        } : {}),
        ...(requestData.delivery_location.contact ? {
          contact: formatRoadieContact(requestData.delivery_location.contact)
        } : {})
      },
      ...(requestData.pickup_after ? { pickup_after: requestData.pickup_after } : {}),
      ...(requestData.deliver_between ? { deliver_between: requestData.deliver_between } : {})
    };

    // Call Roadie API
    const response = await makeRoadieRequest('/estimates', {
      method: 'POST',
      body: roadieEstimatePayload
    });

    if (!response.success) {
      console.error('❌ Roadie API error:', response.error);
      return new Response(
        JSON.stringify({ error: response.error || 'Failed to get Roadie estimate' }),
        { status: response.status || 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract price from Roadie response
    // Roadie returns price in cents or dollars depending on API version
    const roadieData = response.data;
    let basePriceDollars = 0;

    if (roadieData.price !== undefined) {
      // If price is in dollars
      basePriceDollars = typeof roadieData.price === 'number' ? roadieData.price : parseFloat(roadieData.price);
    } else if (roadieData.fee !== undefined) {
      // If price is in cents (like Uber)
      basePriceDollars = typeof roadieData.fee === 'number' ? roadieData.fee / 100 : parseFloat(roadieData.fee) / 100;
    } else if (roadieData.quote?.price !== undefined) {
      basePriceDollars = typeof roadieData.quote.price === 'number' ? roadieData.quote.price : parseFloat(roadieData.quote.price);
    }

    console.log(`✅ Roadie estimate: $${basePriceDollars.toFixed(2)}`);

    // Return standardized response
    return new Response(
      JSON.stringify({
        roadie_base_price: parseFloat(basePriceDollars.toFixed(2)),
        estimated_distance: roadieData.estimated_distance || roadieData.distance || null,
        roadie_size: sizeMapping.roadie_size,
        roadie_size_description: sizeMapping.description,
        quote_id: roadieData.id || roadieData.quote_id || null,
        raw_response: roadieData // For debugging
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error in roadie-estimate:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
        details: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
