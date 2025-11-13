import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ReceiptRequest {
  booking_id: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { booking_id }: ReceiptRequest = await req.json();

    if (!booking_id) {
      return new Response(
        JSON.stringify({ error: 'booking_id is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get booking details with donation center info
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        donation_centers (
          id,
          name,
          street_address,
          city,
          state,
          zip_code,
          phone,
          email,
          is_partner,
          can_auto_issue_receipts,
          ein,
          authorized_signer_name,
          receipt_email
        )
      `)
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking) {
      return new Response(
        JSON.stringify({ error: 'Booking not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const donationCenter = booking.donation_centers;

    // Check if receipt already exists
    const { data: existingReceipt } = await supabase
      .from('donation_receipts')
      .select('*')
      .eq('booking_id', booking_id)
      .single();

    if (existingReceipt) {
      return new Response(
        JSON.stringify({
          receipt: existingReceipt,
          type: donationCenter.can_auto_issue_receipts ? 'tax_receipt' : 'donation_summary'
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Extract donor info
    const donorName = booking.pickup_street_address.split(',')[0] || 'Donor';
    const donorAddress = `${booking.pickup_street_address}, ${booking.pickup_city}, ${booking.pickup_state} ${booking.pickup_zip_code}`;

    // Calculate estimated value based on item types and count
    const itemTypeValues: Record<string, number> = {
      'Clothing': 15,
      'Furniture': 75,
      'Electronics': 50,
      'Books': 5,
      'Household items': 25,
      'Toys': 10,
      'Kitchen items': 20,
      'Sporting goods': 30,
      'Other': 15,
    };

    let estimatedValue = 0;
    const items = booking.items_types || [];
    items.forEach((itemType: string) => {
      const valuePerItem = itemTypeValues[itemType] || 15;
      estimatedValue += valuePerItem * Math.max(1, Math.floor(booking.items_count / items.length));
    });

    // Create donation items description
    const donationItems = {
      types: booking.items_types,
      count: booking.items_count,
      photos: booking.photo_urls || [],
      description: `Approximately ${booking.items_count} items including: ${booking.items_types.join(', ')}`
    };

    // For partner centers with auto-issue capability, create full tax receipt
    if (donationCenter.can_auto_issue_receipts && donationCenter.ein && donationCenter.authorized_signer_name) {
      // Generate receipt number
      const { data: receiptNumberData } = await supabase.rpc('generate_receipt_number');
      const receiptNumber = receiptNumberData || `DR-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      // Create tax receipt
      const { data: receipt, error: receiptError } = await supabase
        .from('donation_receipts')
        .insert({
          booking_id: booking.id,
          donation_center_id: booking.donation_center_id,
          receipt_number: receiptNumber,
          donor_name: donorName,
          donor_email: booking.customer_email,
          donor_phone: booking.customer_phone,
          donor_address: donorAddress,
          donation_date: booking.scheduled_date,
          donation_items: donationItems,
          estimated_value: estimatedValue,
          goods_or_services_provided: false,
          goods_or_services_description: null,
          goods_or_services_value: null,
          tax_deductible_amount: estimatedValue,
          receipt_issued_date: new Date().toISOString(),
          receipt_type: 'tax_receipt',
        })
        .select()
        .single();

      if (receiptError) {
        console.error('Error creating tax receipt:', receiptError);
        return new Response(
          JSON.stringify({ error: 'Failed to create tax receipt', details: receiptError.message }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({
          receipt,
          type: 'tax_receipt',
          message: 'Tax receipt generated and will be emailed automatically'
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // For non-partner centers, create donation summary
    else {
      const summaryNumber = `DS-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      // Create donation summary (not a tax receipt)
      const { data: summary, error: summaryError } = await supabase
        .from('donation_receipts')
        .insert({
          booking_id: booking.id,
          donation_center_id: booking.donation_center_id,
          receipt_number: summaryNumber,
          donor_name: donorName,
          donor_email: booking.customer_email,
          donor_phone: booking.customer_phone,
          donor_address: donorAddress,
          donation_date: booking.scheduled_date,
          donation_items: donationItems,
          estimated_value: estimatedValue,
          goods_or_services_provided: false,
          goods_or_services_description: null,
          goods_or_services_value: null,
          tax_deductible_amount: estimatedValue,
          receipt_issued_date: new Date().toISOString(),
          receipt_type: 'donation_summary',
        })
        .select()
        .single();

      if (summaryError) {
        console.error('Error creating donation summary:', summaryError);
        return new Response(
          JSON.stringify({ error: 'Failed to create donation summary', details: summaryError.message }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({
          receipt: summary,
          type: 'donation_summary',
          message: 'Donation summary generated. Forward this to the donation center to receive your official tax receipt.',
          forward_to: donationCenter.receipt_email || donationCenter.email
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('Error in generate-receipt function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
