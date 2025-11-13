import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface NotifyAdminRequest {
  booking_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  pickup_address: string;
  donation_center_name: string;
  scheduled_date: string;
  scheduled_time: string;
  total_price: number;
  items_description?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const data: NotifyAdminRequest = await req.json();

    const adminEmail = Deno.env.get("ADMIN_NOTIFICATION_EMAIL");
    const adminPhone = Deno.env.get("ADMIN_NOTIFICATION_PHONE");

    const emailSubject = `🚨 New Booking: ${data.booking_id}`;
    const emailBody = `
New booking requires manual dispatch!

Booking ID: ${data.booking_id}
Customer: ${data.customer_name}
Phone: ${data.customer_phone}
Email: ${data.customer_email}

Pickup Address: ${data.pickup_address}
Delivery To: ${data.donation_center_name}
Scheduled: ${data.scheduled_date} at ${data.scheduled_time}

Items: ${data.items_description || "Not provided"}

Total Price: $${data.total_price.toFixed(2)}

View and manage this booking:
${Deno.env.get("SUPABASE_URL")}/admin/bookings/${data.booking_id}
    `.trim();

    const notifications: Promise<any>[] = [];

    if (adminEmail) {
      console.log("Sending email notification to admin:", adminEmail);
      notifications.push(
        fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "DropGood <notifications@dropgood.com>",
            to: [adminEmail],
            subject: emailSubject,
            text: emailBody,
          }),
        })
      );
    }

    if (adminPhone) {
      const smsMessage = `New DropGood booking ${data.booking_id} from ${data.customer_name}. Pickup: ${data.scheduled_date} at ${data.scheduled_time}. View: ${Deno.env.get("SUPABASE_URL")}/admin/bookings/${data.booking_id}`;

      console.log("Sending SMS notification to admin:", adminPhone);
      notifications.push(
        fetch("https://api.twilio.com/2010-04-01/Accounts/" + Deno.env.get("TWILIO_ACCOUNT_SID") + "/Messages.json", {
          method: "POST",
          headers: {
            "Authorization": "Basic " + btoa(Deno.env.get("TWILIO_ACCOUNT_SID") + ":" + Deno.env.get("TWILIO_AUTH_TOKEN")),
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            To: adminPhone,
            From: Deno.env.get("TWILIO_PHONE_NUMBER") || "",
            Body: smsMessage,
          }),
        })
      );
    }

    if (notifications.length === 0) {
      console.warn("No admin notification channels configured");
      return new Response(
        JSON.stringify({
          success: true,
          message: "No admin notifications configured"
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const results = await Promise.allSettled(notifications);

    const failures = results.filter(r => r.status === "rejected");
    if (failures.length > 0) {
      console.error("Some notifications failed:", failures);
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent: results.filter(r => r.status === "fulfilled").length,
        failed: failures.length,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in notify-admin:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
