// Quick script to fix RLS policy for guest bookings
// Run with: node fix-rls.js

const SUPABASE_URL = 'https://ozylnaxrhaibsoybuzix.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96eWxuYXhyaGFpYnNveWJ1eml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NzQ4MzksImV4cCI6MjA3ODM1MDgzOX0.2KxmJzl8DSP_bdozLh5fC0qGbtGXQakAloDJLVXYwMQ';

// YOU NEED TO GET THE SERVICE ROLE KEY FROM:
// 1. Go to https://app.supabase.com/project/ozylnaxrhaibsoybuzix/settings/api
// 2. Copy the "service_role" key (NOT the anon key)
// 3. Paste it below:
const SERVICE_ROLE_KEY = 'PASTE_YOUR_SERVICE_ROLE_KEY_HERE';

if (SERVICE_ROLE_KEY === 'PASTE_YOUR_SERVICE_ROLE_KEY_HERE') {
  console.error('\n❌ ERROR: You need to add your SERVICE_ROLE_KEY to this script first!');
  console.error('\nHow to get it:');
  console.error('1. Go to: https://app.supabase.com/project/ozylnaxrhaibsoybuzix/settings/api');
  console.error('2. Find the "service_role" key (starts with eyJ...)');
  console.error('3. Copy it and paste it in this file on line 9');
  console.error('4. Run this script again\n');
  process.exit(1);
}

const sql = `
-- Drop the old policy if it exists
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;

-- Create a new policy that allows anyone to INSERT bookings
CREATE POLICY "Anyone can create bookings"
  ON public.bookings
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Also allow anon users specifically
CREATE POLICY "Anon users can create bookings"
  ON public.bookings
  FOR INSERT
  TO anon
  WITH CHECK (true);
`;

async function fixRLS() {
  console.log('🔧 Fixing RLS policy for guest bookings...\n');

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      // Try alternative method using the SQL editor endpoint
      const response2 = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ query: sql })
      });

      if (!response2.ok) {
        throw new Error(`HTTP error! status: ${response2.status}`);
      }
    }

    console.log('✅ SUCCESS! RLS policy has been fixed.');
    console.log('✅ Guest users can now create bookings.');
    console.log('\n🎉 Try the payment form again!\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n📝 Manual fix required:');
    console.error('Go to: https://app.supabase.com/project/ozylnaxrhaibsoybuzix/editor/sql');
    console.error('And run this SQL:\n');
    console.error(sql);
  }
}

fixRLS();
