import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';

interface NotifyDriversRequest {
  booking_id: string;
  pickup_city: string;
  pickup_state: string;
  pickup_latitude?: number;
  pickup_longitude?: number;
  distance_miles: number;
  items_count: number;
  scheduled_date?: string;
  scheduled_time_start?: string;
}

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const requestData: NotifyDriversRequest = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Finding nearby drivers for booking ${requestData.booking_id} in ${requestData.pickup_city}, ${requestData.pickup_state}`);

    // Find nearby drivers using the database function
    const { data: nearbyDrivers, error: driversError } = await supabase
      .rpc('find_nearby_drivers', {
        booking_city: requestData.pickup_city,
        booking_state: requestData.pickup_state,
        booking_lat: requestData.pickup_latitude || null,
        booking_lng: requestData.pickup_longitude || null,
        radius_miles: 15
      });

    if (driversError) {
      console.error('Error finding drivers:', driversError);
      throw driversError;
    }

    if (!nearbyDrivers || nearbyDrivers.length === 0) {
      console.log('No nearby drivers found');
      return jsonResponse({
        success: true,
        drivers_notified: 0,
        message: 'No nearby drivers found'
      });
    }

    console.log(`Found ${nearbyDrivers.length} nearby drivers`);

    const notificationResults = [];

    // Send notifications to each driver
    for (const driver of nearbyDrivers) {
      try {
        // Check if we've already notified this driver about this job
        const { data: existingNotification } = await supabase
          .from('driver_job_notifications')
          .select('id')
          .eq('driver_signup_id', driver.driver_id)
          .eq('booking_id', requestData.booking_id)
          .single();

        if (existingNotification) {
          console.log(`Driver ${driver.driver_email} already notified about this job`);
          continue;
        }

        // Send email notification
        const notificationResponse = await fetch(
          `${supabaseUrl}/functions/v1/send-notification`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'driver_job_available',
              recipient_email: driver.driver_email,
              recipient_name: driver.driver_name,
              send_email: true,
              send_sms: false,
              data: {
                driver_name: driver.driver_name,
                job_id: requestData.booking_id,
                pickup_city: requestData.pickup_city,
                pickup_state: requestData.pickup_state,
                distance_miles: driver.distance_miles || 0,
                items_count: requestData.items_count || 1,
                scheduled_date: requestData.scheduled_date,
                scheduled_time: requestData.scheduled_time_start,
              },
            }),
          }
        );

        const notificationResult = await notificationResponse.json();

        // Log the notification in the database
        const { error: logError } = await supabase
          .from('driver_job_notifications')
          .insert({
            driver_signup_id: driver.driver_id,
            booking_id: requestData.booking_id,
            distance_miles: driver.distance_miles || 0,
            email_sent: notificationResult.email_sent || false,
            email_error: notificationResult.errors?.length > 0 ? notificationResult.errors.join(', ') : null,
            sent_at: new Date().toISOString(),
          });

        if (logError) {
          console.error('Error logging notification:', logError);
        }

        notificationResults.push({
          driver_email: driver.driver_email,
          email_sent: notificationResult.email_sent,
          errors: notificationResult.errors,
        });

        console.log(`Notified driver ${driver.driver_email} - Email sent: ${notificationResult.email_sent}`);
      } catch (error) {
        console.error(`Error notifying driver ${driver.driver_email}:`, error);
        notificationResults.push({
          driver_email: driver.driver_email,
          email_sent: false,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
        });
      }
    }

    const successCount = notificationResults.filter(r => r.email_sent).length;

    return jsonResponse({
      success: true,
      drivers_found: nearbyDrivers.length,
      drivers_notified: successCount,
      results: notificationResults,
    });
  } catch (error) {
    console.error('Notify drivers error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to notify drivers',
      500
    );
  }
});
