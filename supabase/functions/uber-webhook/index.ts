import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors-config.ts';
import { verifyUberWebhook, isWebhookEventProcessed, markWebhookEventProcessed } from '../_shared/webhook-verify.ts';
import { securityCheckMiddleware, securityMonitor } from '../_shared/security-monitor.ts';
import { requestGuardMiddleware, logRequestSafely } from '../_shared/request-guard.ts';

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

Deno.serve(async (req: Request) => {
  // 1. Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // 2. Log request safely
    logRequestSafely(req, { endpoint: 'uber-webhook' });

    // 3. Check request size limits
    const guardResponse = await requestGuardMiddleware(req, {
      maxBodySize: 500 * 1024, // 500KB limit for webhooks
      timeout: 10000, // 10 second timeout
    });
    if (guardResponse) return guardResponse;

    // 4. Security monitoring (but allow webhooks through)
    const securityResponse = await securityCheckMiddleware(req);
    if (securityResponse) {
      // Log but don't block webhooks from known IPs
      const ip = req.headers.get('cf-connecting-ip') ||
                 req.headers.get('x-forwarded-for')?.split(',')[0] ||
                 'unknown';

      await securityMonitor.logSecurityEvent({
        timestamp: new Date(),
        event_type: 'WEBHOOK_SECURITY_CHECK',
        severity: 'low',
        ip_address: ip,
        endpoint: '/uber-webhook',
        details: { message: 'Webhook flagged by security check' },
        blocked: false,
      });
    }

    // 5. Get webhook secret
    const webhookSecret = Deno.env.get('UBER_WEBHOOK_SECRET');

    // 6. Read raw body for signature verification
    const payload = await req.text();

    // 7. Verify webhook signature if secret is configured
    if (webhookSecret) {
      const signature = req.headers.get('x-uber-signature');

      if (!signature) {
        await securityMonitor.logSecurityEvent({
          timestamp: new Date(),
          event_type: 'WEBHOOK_NO_SIGNATURE',
          severity: 'high',
          endpoint: '/uber-webhook',
          details: { message: 'Uber webhook received without signature' },
          blocked: true,
        });

        return jsonResponse({ error: 'Missing signature' }, 401, req);
      }

      const isValid = await verifyUberWebhook(payload, signature, webhookSecret);

      if (!isValid) {
        await securityMonitor.logSecurityEvent({
          timestamp: new Date(),
          event_type: 'WEBHOOK_INVALID_SIGNATURE',
          severity: 'critical',
          endpoint: '/uber-webhook',
          details: { message: 'Uber webhook signature verification failed' },
          blocked: true,
        });

        return jsonResponse({ error: 'Invalid signature' }, 401, req);
      }
    } else {
      console.warn('UBER_WEBHOOK_SECRET not configured - webhooks not verified!');
    }

    // 8. Parse webhook event
    const webhookEvent: UberWebhookEvent = JSON.parse(payload);

    console.log('Received Uber webhook:', {
      event_id: webhookEvent.event_id,
      event_type: webhookEvent.event_type,
      delivery_id: webhookEvent.data?.delivery_id || webhookEvent.meta?.resource_id,
    });

    // 9. Check for duplicate events
    if (await isWebhookEventProcessed(webhookEvent.event_id)) {
      console.log('Webhook event already processed:', webhookEvent.event_id);
      return jsonResponse({ received: true, duplicate: true }, 200, req);
    }

    // 10. Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const deliveryId = webhookEvent.data?.delivery_id || webhookEvent.meta?.resource_id;

    if (!deliveryId) {
      console.warn('No delivery_id in webhook event');
      await markWebhookEventProcessed(webhookEvent.event_id);
      return jsonResponse({ received: true }, 200, req);
    }

    // 11. Update booking with webhook data
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

    // 12. Log webhook event
    await supabase
      .from('uber_webhook_logs')
      .insert({
        event_id: webhookEvent.event_id,
        event_type: webhookEvent.event_type,
        delivery_id: deliveryId,
        payload: webhookEvent,
        processed_at: new Date().toISOString(),
      });

    // 13. Mark event as processed
    await markWebhookEventProcessed(webhookEvent.event_id);

    return jsonResponse({ received: true }, 200, req);

  } catch (error) {
    console.error('Error processing Uber webhook:', error);

    // Log error but return 200 to prevent retries for malformed webhooks
    await securityMonitor.logSecurityEvent({
      timestamp: new Date(),
      event_type: 'WEBHOOK_PROCESSING_ERROR',
      severity: 'medium',
      endpoint: '/uber-webhook',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      blocked: false,
    });

    return jsonResponse({ received: true }, 200, req);
  }
});
