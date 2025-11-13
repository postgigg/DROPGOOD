import fetch from 'node-fetch';

const url = 'https://lyftztgccfslwmdgpslt.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5ZnR6dGdjY2ZzbHdtZGdwc2x0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI2NzI5MCwiZXhwIjoyMDc3ODQzMjkwfQ.0keGtgDmqe1iHlUjhcdl6TsyCMa2BcpKl07d3H6QC_U';

console.log('🔧 Fixing RLS policy via direct SQL...\n');

// Use PostgREST to execute SQL
const sql = `
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anon users can create bookings" ON public.bookings;

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
`;

try {
  const response = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ query: sql })
  });

  const text = await response.text();
  console.log('Response:', text);
  
  if (response.ok) {
    console.log('\n✅ RLS POLICY FIXED!');
  } else {
    console.log('\n❌ Failed - need to run SQL manually');
  }
} catch (error) {
  console.error('Error:', error.message);
}

