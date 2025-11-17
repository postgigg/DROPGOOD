/**
 * Roadie Get Images Edge Function
 * Fetch pickup/delivery/signature images from Roadie and store in Supabase Storage
 *
 * Endpoint: GET /v1/shipments/{id}/images/{type}
 * Types: 'pickup', 'delivery', 'signature'
 * Returns: { image_url }
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { makeRoadieRequest } from '../_shared/roadie-auth.ts';

interface GetImagesRequest {
  shipment_id: number;
  image_type: 'pickup' | 'delivery' | 'signature';
  booking_id?: string; // For updating database
}

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const requestData: GetImagesRequest = await req.json();

    console.log(`📸 Fetching ${requestData.image_type} image for shipment:`, requestData.shipment_id);

    if (!requestData.shipment_id || !requestData.image_type) {
      return new Response(
        JSON.stringify({ error: 'Missing shipment_id or image_type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call Roadie API to get image
    const response = await makeRoadieRequest(
      `/shipments/${requestData.shipment_id}/images/${requestData.image_type}`,
      { method: 'GET' }
    );

    if (!response.success) {
      console.error(`❌ Failed to fetch ${requestData.image_type} image:`, response.error);
      return new Response(
        JSON.stringify({ error: response.error || `Failed to fetch ${requestData.image_type} image` }),
        { status: response.status || 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const imageData = response.data;

    // Roadie may return image URL or base64 data
    let imageUrl: string | null = null;

    if (imageData.url) {
      // Direct URL provided
      imageUrl = imageData.url;
      console.log(`✅ Got direct image URL from Roadie`);
    } else if (imageData.image_url) {
      imageUrl = imageData.image_url;
      console.log(`✅ Got image_url from Roadie`);
    } else if (imageData.data || imageData.base64) {
      // Base64 data - need to upload to Supabase Storage
      console.log('📤 Uploading image to Supabase Storage...');

      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const base64Data = imageData.data || imageData.base64;
      const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

      const fileName = `${requestData.shipment_id}-${requestData.image_type}-${Date.now()}.jpg`;
      const filePath = `roadie/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('delivery-images')
        .upload(filePath, buffer, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) {
        console.error('❌ Failed to upload image to storage:', uploadError);
        return new Response(
          JSON.stringify({ error: 'Failed to upload image to storage' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('delivery-images')
        .getPublicUrl(filePath);

      imageUrl = urlData.publicUrl;
      console.log(`✅ Image uploaded to storage:`, imageUrl);
    }

    if (!imageUrl) {
      console.error('❌ No image URL found in Roadie response');
      return new Response(
        JSON.stringify({ error: 'No image data available' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update booking with image URL if booking_id provided
    if (requestData.booking_id) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const updateField = `roadie_${requestData.image_type}_image_url`;
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ [updateField]: imageUrl })
        .eq('id', requestData.booking_id);

      if (updateError) {
        console.error(`⚠️ Failed to update booking with ${requestData.image_type} image:`, updateError);
      } else {
        console.log(`✅ Booking updated with ${requestData.image_type} image`);
      }
    }

    return new Response(
      JSON.stringify({
        image_url: imageUrl,
        image_type: requestData.image_type,
        shipment_id: requestData.shipment_id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error in roadie-get-images:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
        details: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
