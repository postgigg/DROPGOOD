const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    console.log('=== CREATE PAYMENT INTENT CALLED ===');
    console.log('Stripe key exists:', !!STRIPE_SECRET_KEY);
    console.log('Stripe key first 10 chars:', STRIPE_SECRET_KEY?.substring(0, 10));

    if (!STRIPE_SECRET_KEY) {
      throw new Error('Stripe secret key not configured');
    }

    const { amount, currency = 'usd', metadata = {}, booking_id } = await req.json();
    console.log('Request data:', { amount, currency, booking_id, metadata });

    if (!amount || amount <= 0) {
      throw new Error('Invalid amount');
    }

    // Build description based on payment type
    let description = 'DropGood Payment';
    if (metadata.type === 'company_credit_purchase') {
      description = `DropGood Company Credits - $${metadata.credit_amount}`;
    } else if (booking_id) {
      description = `DropGood Donation Pickup - ${booking_id}`;
    }

    // Build metadata for Stripe
    const stripeMetadata: Record<string, string> = {};
    if (booking_id) {
      stripeMetadata['booking_id'] = booking_id;
    }
    if (metadata.company_id) {
      stripeMetadata['company_id'] = metadata.company_id;
    }
    if (metadata.credit_amount) {
      stripeMetadata['credit_amount'] = metadata.credit_amount.toString();
    }
    if (metadata.processing_fee) {
      stripeMetadata['processing_fee'] = metadata.processing_fee.toString();
    }
    if (metadata.type) {
      stripeMetadata['type'] = metadata.type;
    }

    // Build request body
    const bodyParams = new URLSearchParams({
      amount: amount.toString(),
      currency: currency,
      'automatic_payment_methods[enabled]': 'true',
      description: description,
    });

    // Add metadata
    Object.entries(stripeMetadata).forEach(([key, value]) => {
      bodyParams.append(`metadata[${key}]`, value);
    });

    // Create Stripe payment intent
    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: bodyParams.toString(),
    });

    console.log('Stripe API response status:', response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error('Stripe API error response:', error);
      console.error('Stripe API error status:', response.status);
      throw new Error(`Stripe API error: ${response.status} - ${error}`);
    }

    const paymentIntent = await response.json();

    return new Response(
      JSON.stringify({ 
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id 
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in create-payment-intent:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});