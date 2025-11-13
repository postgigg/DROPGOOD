import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';

interface UberWebhookEvent {
  event_id: string;
  event_type: string;
  event_time: string;
  resource_href: string;
  meta?: {
    user_id: string;
    resource_id: string;
  };
  data?: {
    delivery_id?: string;
    status?: string;
    courier?: {
      name?: string;
      phone_number?: string;
      location?: {
        lat: number;
        lng: number;
      };
    };
    dropoff_eta?: string;
    pickup_eta?: string;
  };
}

Deno.serve(async (req: Request) {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const webhookEvent: UberWebhookEvent = await req.json();

    console.log('Received Uber webhook:', JSON.stringify(webhookEvent, null, 2));

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const deliveryId = webhookEvent.data?.delivery_id || webhookEvent.meta?.resource_id;

    if (!deliveryId) {
      console.warn('No delivery_id in webhook event');
      return jsonResponse({ received: true });
    }

    const updateData: any = {
      uber_status: webhookEvent.data?.status,
      updated_at: new Date().toISOString(),
    };

    if (webhookEvent.data?.courier) {
      updateData.courier_info = webhookEvent.data.courier;
    }

    if (webhookEvent.data?.dropoff_eta) {
      updateData.dropoff_eta = webhookEvent.data.dropoff_eta;
    }

    if (webhookEvent.data?.pickup_eta) {
      updateData.pickup_eta = webhookEvent.data.pickup_eta;
    }

    const { error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('uber_delivery_id', deliveryId);

    if (error) {
      console.error('Failed to update booking from webhook:', error);
    }

    await supabase
      .from('uber_webhook_logs')
      .insert({
        event_id: webhookEvent.event_id,
        event_type: webhookEvent.event_type,
        delivery_id: deliveryId,
        payload: webhookEvent,
        processed_at: new Date().toISOString(),
      });

    return jsonResponse({ received: true });
  } catch (error) {
    console.error('Error processing Uber webhook:', error);
    return jsonResponse({ received: true }, 200);
  }
});
