/**
 * DoorDash Drive Webhook Handler
 * Handles delivery status updates from DoorDash
 *
 * Webhook Events:
 * - delivery.created - Delivery was successfully created
 * - delivery.picked_up - Dasher picked up the order
 * - delivery.delivered - Delivery was completed
 * - delivery.cancelled - Delivery was cancelled
 * - delivery.updated - Delivery status or details were updated
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface DoorDashWebhookEvent {
  created_at: string;
  event_name: string;
  external_delivery_id: string;
  dasher_id?: number;
  dasher_name?: string;
  dasher_phone_number?: string;
  dasher_location?: {
    lat: number;
    lng: number;
  };
  dasher_vehicle_make?: string;
  dasher_vehicle_model?: string;
  dasher_vehicle_year?: string;
  tracking_url?: string;
  pickup_time_estimated?: string;
  dropoff_time_estimated?: string;
  fee?: number; // In cents
  tip?: number;
  support_reference?: string;
  updated_at?: string;
}

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-doordash-signature',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const webhookData: DoorDashWebhookEvent = await req.json();

    console.log('🔔 DoorDash webhook received:', {
      event_name: webhookData.event_name,
      external_id: webhookData.external_delivery_id,
      dasher_id: webhookData.dasher_id,
      created_at: webhookData.created_at
    });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Log webhook event
    const { error: logError } = await supabase
      .from('doordash_webhook_logs')
      .insert({
        event_id: webhookData.support_reference || `event_${Date.now()}`,
        event_type: webhookData.event_name,
        delivery_id: webhookData.dasher_id?.toString() || null,
        external_delivery_id: webhookData.external_delivery_id,
        payload: webhookData
      });

    if (logError) {
      console.error('⚠️ Failed to log webhook event:', logError);
    }

    // Extract delivery info
    const externalDeliveryId = webhookData.external_delivery_id;
    const eventName = webhookData.event_name;
    const trackingUrl = webhookData.tracking_url;
    const dasherInfo = {
      id: webhookData.dasher_id,
      name: webhookData.dasher_name,
      phone: webhookData.dasher_phone_number,
      location: webhookData.dasher_location
    };
    const pickupEta = webhookData.pickup_time_estimated;
    const dropoffEta = webhookData.dropoff_time_estimated;

    if (!externalDeliveryId) {
      console.error('❌ No external_delivery_id in webhook');
      return new Response(
        JSON.stringify({ error: 'Invalid webhook payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find booking by external delivery ID
    const { data: bookings, error: fetchError } = await supabase
      .from('bookings')
      .select('id, status, doordash_delivery_id, doordash_status')
      .eq('doordash_delivery_id', externalDeliveryId)
      .limit(1);

    if (fetchError) {
      console.error('❌ Failed to fetch booking:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Database error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!bookings || bookings.length === 0) {
      console.warn('⚠️ No booking found for delivery:', { externalDeliveryId });
      // Return 200 to acknowledge webhook even if booking not found
      return new Response(
        JSON.stringify({ message: 'Webhook received but booking not found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const booking = bookings[0];
    console.log(`📦 Updating booking ${booking.id} with DoorDash event: ${eventName}`);

    // Prepare update data
    const updateData: any = {
      doordash_status: eventName,
      doordash_tracking_url: trackingUrl || booking.doordash_tracking_url,
    };

    if (dasherInfo.id) {
      updateData.doordash_dasher_info = dasherInfo;

      // Map dasher info to standard driver columns for tracking page
      if (dasherInfo.name) {
        updateData.driver_name = dasherInfo.name;
      }
      if (dasherInfo.phone) {
        updateData.driver_phone = dasherInfo.phone;
      }

      // Build vehicle string from make/model/year
      const vehicleParts = [
        webhookData.dasher_vehicle_year,
        webhookData.dasher_vehicle_make,
        webhookData.dasher_vehicle_model
      ].filter(Boolean);

      if (vehicleParts.length > 0) {
        updateData.driver_vehicle = vehicleParts.join(' ');
      }
    }

    if (pickupEta) {
      updateData.doordash_pickup_eta = pickupEta;
    }

    if (dropoffEta) {
      updateData.doordash_dropoff_eta = dropoffEta;
    }

    // Map DoorDash event name to booking status
    if (eventName === 'DASHER_DROPPED_OFF' || eventName === 'DELIVERY_DELIVERED') {
      updateData.status = 'completed';
    } else if (eventName === 'DELIVERY_CANCELLED' || eventName === 'DASHER_CANCELLED') {
      updateData.status = 'cancelled';
    } else if (eventName === 'DASHER_PICKED_UP' || eventName === 'DASHER_ENROUTE_TO_DROPOFF') {
      updateData.status = 'in_transit';
    } else if (eventName === 'DASHER_CONFIRMED' || eventName === 'DASHER_ENROUTE_TO_PICKUP') {
      updateData.status = 'confirmed';
    }

    // Update booking
    const { error: updateError } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', booking.id);

    if (updateError) {
      console.error('❌ Failed to update booking:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update booking' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ Booking ${booking.id} updated successfully`);

    // TODO: Send notifications to customer based on event type
    // - delivery.picked_up -> "Your items are on the way!"
    // - delivery.delivered -> "Your donation has been delivered!"
    // - delivery.cancelled -> "Your delivery was cancelled"

    return new Response(
      JSON.stringify({
        message: 'Webhook processed successfully',
        booking_id: booking.id,
        event_name: webhookData.event_name,
        doordash_status: updateData.doordash_status,
        booking_status: updateData.status || booking.status
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error processing DoorDash webhook:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
        details: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
