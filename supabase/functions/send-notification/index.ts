import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';
import * as EmailTemplates from './email-templates.ts';
import * as SMSTemplates from './sms-templates.ts';

interface NotificationRequest {
  type: 'booking_confirmation' | 'pickup_reminder' | 'driver_assigned' | 'driver_enroute' | 'driver_arrived' | 'pickup_completed' | 'delivery_completed' | 'delivery_canceled';
  recipient_email: string;
  recipient_phone?: string;
  recipient_name: string;
  data: any;
  send_email?: boolean;
  send_sms?: boolean;
}

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const notificationReq: NotificationRequest = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const results = {
      email_sent: false,
      sms_sent: false,
      errors: [] as string[],
    };

    // Send Email using Resend
    if (notificationReq.send_email !== false) {
      try {
        const emailContent = getEmailContent(notificationReq.type, notificationReq.data);
        const resendKey = Deno.env.get('RESEND_API_KEY');

        if (!resendKey) {
          console.warn('RESEND_API_KEY not configured, skipping email send');
          results.errors.push('Email: API key not configured');
        } else {
          console.log('Sending email to:', notificationReq.recipient_email);

          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'DropGood <notifications@dropgood.co>',
              to: notificationReq.recipient_email,
              subject: emailContent.subject,
              html: emailContent.html,
            }),
          });

          if (!response.ok) {
            const errorData = await response.text();
            console.error('Resend API error:', errorData);
            throw new Error(`Resend API error: ${response.status}`);
          }

          const responseData = await response.json();
          console.log('Email sent successfully:', responseData);
          results.email_sent = true;
        }
      } catch (error) {
        console.error('Email send error:', error);
        results.errors.push(`Email: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Send SMS using Twilio
    if (notificationReq.send_sms !== false && notificationReq.recipient_phone) {
      try {
        const smsContent = getSMSContent(notificationReq.type, notificationReq.data);
        const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID');
        const twilioToken = Deno.env.get('TWILIO_AUTH_TOKEN');
        const twilioPhone = Deno.env.get('TWILIO_PHONE_NUMBER');

        if (!twilioSid || !twilioToken || !twilioPhone) {
          console.warn('Twilio credentials not configured, skipping SMS send');
          results.errors.push('SMS: Credentials not configured');
        } else {
          console.log('Sending SMS to:', notificationReq.recipient_phone);

          const response = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Basic ${btoa(`${twilioSid}:${twilioToken}`)}`,
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                To: SMSTemplates.formatPhoneForSMS(notificationReq.recipient_phone),
                From: twilioPhone,
                Body: smsContent,
              }),
            }
          );

          if (!response.ok) {
            const errorData = await response.text();
            console.error('Twilio API error:', errorData);
            throw new Error(`Twilio API error: ${response.status}`);
          }

          const responseData = await response.json();
          console.log('SMS sent successfully:', responseData);
          results.sms_sent = true;
        }
      } catch (error) {
        console.error('SMS send error:', error);
        results.errors.push(`SMS: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Log notification in database
    await supabase.from('notification_logs').insert({
      notification_type: notificationReq.type,
      recipient_email: notificationReq.recipient_email,
      recipient_phone: notificationReq.recipient_phone,
      email_sent: results.email_sent,
      sms_sent: results.sms_sent,
      sent_at: new Date().toISOString(),
    });

    return jsonResponse(results);
  } catch (error) {
    console.error('Notification error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to send notification',
      500
    );
  }
});

function getEmailContent(type: string, data: any): { subject: string; html: string } {
  switch (type) {
    case 'booking_confirmation':
      return EmailTemplates.bookingConfirmationEmail(data);
    case 'pickup_reminder':
      return EmailTemplates.pickupReminderEmail(data);
    case 'driver_assigned':
    case 'driver_enroute':
      return EmailTemplates.pickupEnRouteEmail(data);
    case 'delivery_completed':
      return EmailTemplates.deliveryCompletedEmail(data);
    case 'delivery_canceled':
      return EmailTemplates.deliveryCanceledEmail(data);
    default:
      throw new Error(`Unknown email type: ${type}`);
  }
}

function getSMSContent(type: string, data: any): string {
  switch (type) {
    case 'booking_confirmation':
      return SMSTemplates.bookingConfirmationSMS(data);
    case 'pickup_reminder':
      return SMSTemplates.pickupReminderSMS(data);
    case 'driver_assigned':
    case 'driver_enroute':
      return SMSTemplates.driverEnRouteSMS(data);
    case 'driver_arrived':
      return SMSTemplates.driverArrivedSMS(data);
    case 'pickup_completed':
      return SMSTemplates.pickupCompletedSMS(data);
    case 'delivery_completed':
      return SMSTemplates.deliveryCompletedSMS(data);
    case 'delivery_canceled':
      return SMSTemplates.deliveryCanceledSMS(data);
    default:
      throw new Error(`Unknown SMS type: ${type}`);
  }
}
