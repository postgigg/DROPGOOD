/**
 * Roadie Webhook Handler Edge Function
 * Handles Roadie webhook events for shipment updates
 *
 * Events:
 * - driver_assigned
 * - en_route_to_pickup
 * - at_pickup
 * - pickup_confirmed → Auto-fetch pickup image
 * - en_route_to_delivery
 * - at_delivery
 * - delivery_confirmed → Auto-fetch delivery + signature images
 * - canceled
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface RoadieWebhookEvent {
  event_type: string;
  event_id?: string;
  shipment_id?: number;
  reference_id?: string;
  state?: string;
  timestamp?: string;
  data?: any;
  // Roadie webhook structure may vary - adjust based on actual API docs
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
    const webhookData: RoadieWebhookEvent = await req.json();

    console.log('🔔 Roadie Webhook received:', {
      event_type: webhookData.event_type,
      shipment_id: webhookData.shipment_id,
      reference_id: webhookData.reference_id,
      state: webhookData.state
    });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Log webhook to database
    const { error: logError } = await supabase
      .from('roadie_webhook_logs')
      .insert({
        event_type: webhookData.event_type,
        shipment_id: webhookData.shipment_id,
        reference_id: webhookData.reference_id,
        payload: webhookData,
        processed_at: new Date().toISOString()
      });

    if (logError) {
      console.error('⚠️ Failed to log webhook:', logError);
      // Don't fail the webhook - continue processing
    }

    // Find booking by reference_id or shipment_id
    let bookingId: string | null = null;

    if (webhookData.reference_id) {
      // reference_id is the booking_id
      bookingId = webhookData.reference_id;
    } else if (webhookData.shipment_id) {
      // Look up booking by shipment_id
      const { data: booking } = await supabase
        .from('bookings')
        .select('id')
        .eq('roadie_shipment_id', webhookData.shipment_id)
        .single();

      if (booking) {
        bookingId = booking.id;
      }
    }

    if (!bookingId) {
      console.warn('⚠️ No booking found for webhook event');
      return new Response(
        JSON.stringify({ received: true, warning: 'Booking not found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📝 Updating booking: ${bookingId}`);

    // Update booking state
    const updateData: any = {
      roadie_state: webhookData.state || webhookData.event_type,
      updated_at: new Date().toISOString()
    };

    const { error: updateError } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', bookingId);

    if (updateError) {
      console.error('❌ Failed to update booking:', updateError);
    } else {
      console.log('✅ Booking updated successfully');
    }

    // Auto-fetch images based on event type
    const eventType = (webhookData.event_type || '').toLowerCase();

    if (eventType.includes('pickup') && eventType.includes('confirmed')) {
      // Pickup completed - fetch pickup image
      console.log('📸 Triggering pickup image fetch...');
      await fetchAndStoreImage(
        webhookData.shipment_id!,
        'pickup',
        bookingId,
        supabaseUrl
      );
    }

    if (eventType.includes('delivery') && eventType.includes('confirmed')) {
      // Delivery completed - fetch delivery and signature images
      console.log('📸 Triggering delivery + signature image fetch...');
      await Promise.all([
        fetchAndStoreImage(webhookData.shipment_id!, 'delivery', bookingId, supabaseUrl),
        fetchAndStoreImage(webhookData.shipment_id!, 'signature', bookingId, supabaseUrl)
      ]);
    }

    return new Response(
      JSON.stringify({ received: true, booking_id: bookingId }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error in roadie-webhook:', error);
    // Return 200 to prevent Roadie from retrying
    return new Response(
      JSON.stringify({
        received: true,
        error: error instanceof Error ? error.message : 'Internal error'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Helper function to fetch and store image
 */
async function fetchAndStoreImage(
  shipmentId: number,
  imageType: 'pickup' | 'delivery' | 'signature',
  bookingId: string,
  supabaseUrl: string
) {
  try {
    console.log(`📸 Fetching ${imageType} image for shipment ${shipmentId}...`);

    // Call roadie-get-images Edge Function
    const response = await fetch(
      `${supabaseUrl}/functions/v1/roadie-get-images`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
        },
        body: JSON.stringify({
          shipment_id: shipmentId,
          image_type: imageType,
          booking_id: bookingId
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Failed to fetch ${imageType} image:`, errorText);
      return;
    }

    const result = await response.json();
    console.log(`✅ ${imageType} image fetched:`, result.image_url);
  } catch (error) {
    console.error(`❌ Error fetching ${imageType} image:`, error);
  }
}
