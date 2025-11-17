import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { makeUberRequest } from '../_shared/uber-auth.ts';
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';

interface QuoteRequest {
  pickup_latitude: number;
  pickup_longitude: number;
  pickup_address: string; // Can be plain string or JSON string
  dropoff_address: string; // Can be plain string or JSON string
  pickup_phone_number?: string;
  dropoff_phone_number?: string;
  // Optional but recommended fields
  manifest_items?: Array<{
    name: string;
    quantity: number;
    size?: 'small' | 'medium' | 'large' | 'xlarge';
  }>;
  manifest_total_value?: number; // in cents
  external_store_id?: string;
  // Address components (if plain string is provided, we'll format it)
  pickup_city?: string;
  pickup_state?: string;
  pickup_zip_code?: string;
  pickup_country?: string;
  dropoff_city?: string;
  dropoff_state?: string;
  dropoff_zip_code?: string;
  dropoff_country?: string;
}

// Helper function to format address for Uber API
function formatUberAddress(
  address: string,
  city?: string,
  state?: string,
  zipCode?: string,
  country?: string
): string {
  // If address is already JSON formatted, return as-is
  if (address.trim().startsWith('{')) {
    return address;
  }

  // Build JSON address object
  const addressObj: any = {
    street_address: [address],
  };

  if (city) addressObj.city = city;
  if (state) addressObj.state = state;
  if (zipCode) addressObj.zip_code = zipCode;
  if (country) addressObj.country = country || 'US';

  // Return as JSON string (Uber requires this format)
  return JSON.stringify(addressObj);
}

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const {
      pickup_latitude,
      pickup_longitude,
      pickup_address,
      pickup_city,
      pickup_state,
      pickup_zip_code,
      pickup_country = 'US',
      dropoff_latitude,
      dropoff_longitude,
      dropoff_address,
      dropoff_city,
      dropoff_state,
      dropoff_zip_code,
      dropoff_country = 'US',
      pickup_phone_number = '+15555555555',
      dropoff_phone_number = '+15555555555',
      manifest_items,
      manifest_total_value,
      external_store_id
    }: QuoteRequest = await req.json();

    if (!pickup_latitude || !pickup_longitude || !dropoff_latitude || !dropoff_longitude) {
      return errorResponse('Missing required coordinates');
    }

    if (!pickup_address || !dropoff_address) {
      return errorResponse('Missing required addresses');
    }

    const clientId = Deno.env.get('UBER_CLIENT_ID');
    const clientSecret = Deno.env.get('UBER_CLIENT_SECRET');
    const customerId = Deno.env.get('UBER_CUSTOMER_ID');

    if (!clientId || !clientSecret || !customerId) {
      return errorResponse('Uber credentials not configured', 500);
    }

    // Format addresses according to Uber API requirements
    const formattedPickupAddress = formatUberAddress(
      pickup_address,
      pickup_city,
      pickup_state,
      pickup_zip_code,
      pickup_country
    );

    const formattedDropoffAddress = formatUberAddress(
      dropoff_address,
      dropoff_city,
      dropoff_state,
      dropoff_zip_code,
      dropoff_country
    );

    // Build request body
    const requestBody: any = {
      pickup_address: formattedPickupAddress,
      dropoff_address: formattedDropoffAddress,
      pickup_latitude,
      pickup_longitude,
      dropoff_latitude,
      dropoff_longitude,
      pickup_phone_number,
      dropoff_phone_number,
    };

    // Add optional fields if provided
    if (manifest_items && manifest_items.length > 0) {
      requestBody.manifest_items = manifest_items;
    }

    if (manifest_total_value) {
      requestBody.manifest_total_value = manifest_total_value;
    }

    if (external_store_id) {
      requestBody.external_store_id = external_store_id;
    }

    const quoteData = await makeUberRequest(
      `/customers/${customerId}/delivery_quotes`,
      {
        method: 'POST',
        clientId,
        clientSecret,
        body: requestBody,
      }
    );

    return jsonResponse({
      quote_id: quoteData.id,
      fee_cents: quoteData.fee,
      currency: quoteData.currency_type || quoteData.currency,
      dropoff_eta: quoteData.dropoff_eta,
      duration_minutes: quoteData.duration,
      pickup_duration_minutes: quoteData.pickup_duration,
      expires: quoteData.expires,
      created: quoteData.created,
    });
  } catch (error) {
    console.error('Error getting Uber quote:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to get quote',
      500
    );
  }
});
