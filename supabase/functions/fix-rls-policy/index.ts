import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Fixing RLS policy for bookings table...');

    // Execute the SQL to fix RLS policies
    const { data, error } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        -- Drop existing policies
        DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;
        DROP POLICY IF EXISTS "Anon users can create bookings" ON public.bookings;

        -- Create new policies that allow guest bookings
        CREATE POLICY "Anyone can create bookings"
          ON public.bookings
          FOR INSERT
          TO public
          WITH CHECK (true);

        CREATE POLICY "Anon users can create bookings"
          ON public.bookings
          FOR INSERT
          TO anon
          WITH CHECK (true);
      `
    });

    if (error) {
      // Try alternative method - direct SQL execution
      const { error: directError } = await supabaseAdmin.from('_sql').select('*').limit(0);

      // If that fails too, we need to use raw SQL
      throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'RLS policy fixed successfully! Guest bookings are now enabled.'
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error fixing RLS:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        instructions: 'Please run this SQL manually in Supabase SQL Editor: DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings; CREATE POLICY "Anyone can create bookings" ON public.bookings FOR INSERT TO public WITH CHECK (true);'
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
