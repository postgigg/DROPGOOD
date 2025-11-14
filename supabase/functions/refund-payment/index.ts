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
    console.log('=== REFUND PAYMENT CALLED ===');

    if (!STRIPE_SECRET_KEY) {
      throw new Error('Stripe secret key not configured');
    }

    const { payment_intent_id, amount, reason = 'requested_by_customer' } = await req.json();
    console.log('Refund request:', { payment_intent_id, amount, reason });

    if (!payment_intent_id) {
      throw new Error('Payment intent ID required');
    }

    // Build request body
    const bodyParams = new URLSearchParams({
      payment_intent: payment_intent_id,
    });

    // Add optional amount (if not provided, full refund)
    if (amount) {
      bodyParams.append('amount', amount.toString());
    }

    // Add reason
    bodyParams.append('reason', reason);

    // Create Stripe refund
    const response = await fetch('https://api.stripe.com/v1/refunds', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: bodyParams.toString(),
    });

    console.log('Stripe refund API response status:', response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error('Stripe refund error:', error);
      throw new Error(`Stripe refund failed: ${response.status} - ${error}`);
    }

    const refund = await response.json();
    console.log('Refund successful:', refund.id);

    return new Response(
      JSON.stringify({
        success: true,
        refund_id: refund.id,
        amount: refund.amount,
        status: refund.status,
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
    console.error('Error in refund-payment:', error);
    return new Response(
      JSON.stringify({
        success: false,
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
