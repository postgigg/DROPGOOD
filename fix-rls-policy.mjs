import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://lyftztgccfslwmdgpslt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5ZnR6dGdjY2ZzbHdtZGdwc2x0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI2NzI5MCwiZXhwIjoyMDc3ODQzMjkwfQ.0keGtgDmqe1iHlUjhcdl6TsyCMa2BcpKl07d3H6QC_U'
);

console.log('🔧 Fixing RLS policy for bookings table...\n');

// Execute SQL to fix RLS policies
const sql = `
-- Drop any existing restrictive policies
DROP POLICY IF EXISTS "Anyone can create bookings" ON bookings;
DROP POLICY IF EXISTS "Anon users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;

-- Create permissive policy for anonymous users to insert bookings
CREATE POLICY "Anyone can create bookings"
  ON bookings FOR INSERT
  TO public
  WITH CHECK (true);

-- Also allow reads for anonymous users
DROP POLICY IF EXISTS "Anyone can view their bookings" ON bookings;
CREATE POLICY "Anyone can view their bookings"
  ON bookings FOR SELECT
  TO public
  USING (true);
`;

try {
  // Try using rpc to execute SQL
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    console.log('⚠️  RPC method not available, trying direct REST API...\n');

    // Use fetch to execute SQL via PostgREST
    const response = await fetch('https://lyftztgccfslwmdgpslt.supabase.co/rest/v1/rpc/exec_sql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5ZnR6dGdjY2ZzbHdtZGdwc2x0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI2NzI5MCwiZXhwIjoyMDc3ODQzMjkwfQ.0keGtgDmqe1iHlUjhcdl6TsyCMa2BcpKl07d3H6QC_U',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5ZnR6dGdjY2ZzbHdtZGdwc2x0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI2NzI5MCwiZXhwIjoyMDc3ODQzMjkwfQ.0keGtgDmqe1iHlUjhcdl6TsyCMa2BcpKl07d3H6QC_U'
      },
      body: JSON.stringify({ sql_query: sql })
    });

    if (!response.ok) {
      throw new Error('Cannot execute SQL via API. You need to run FIX_RLS.sql manually in Supabase SQL Editor.');
    }

    console.log('✅ RLS policy fixed via REST API!\n');
  } else {
    console.log('✅ RLS policy fixed via RPC!\n');
  }

  console.log('📋 Applied changes:');
  console.log('   - Dropped old restrictive policies');
  console.log('   - Created policy: "Anyone can create bookings" (allows all inserts)');
  console.log('   - Created policy: "Anyone can view their bookings" (allows all selects)');
  console.log('\n🎉 Anonymous users can now create bookings!\n');

} catch (err) {
  console.error('❌ Error:', err.message);
  console.log('\n⚠️  MANUAL ACTION REQUIRED:');
  console.log('   Go to Supabase SQL Editor and run the file:');
  console.log('   /Users/bubblefreelancer/Desktop/FIX_RLS.sql\n');
}
