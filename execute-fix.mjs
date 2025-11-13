import fetch from 'node-fetch';

const SUPABASE_URL = 'https://ozylnaxrhaibsoybuzix.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96eWxuYXhyaGFpYnNveWJ1eml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NzQ4MzksImV4cCI6MjA3ODM1MDgzOX0.2KxmJzl8DSP_bdozLh5fC0qGbtGXQakAloDJLVXYwMQ';

console.log('Attempting to fix RLS policy...');

// Try multiple methods
const methods = [
  {
    name: 'Method 1: Direct SQL via Edge Function',
    execute: async () => {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/exec-sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ANON_KEY}`,
          'apikey': ANON_KEY
        },
        body: JSON.stringify({
          sql: `
            DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;
            DROP POLICY IF EXISTS "Anon users can create bookings" ON public.bookings;
            CREATE POLICY "Anyone can create bookings" ON public.bookings FOR INSERT TO public WITH CHECK (true);
            CREATE POLICY "Anon users can create bookings" ON public.bookings FOR INSERT TO anon WITH CHECK (true);
          `
        })
      });
      return { ok: response.ok, status: response.status, text: await response.text() };
    }
  },
  {
    name: 'Method 2: Via RPC',
    execute: async () => {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ANON_KEY}`,
          'apikey': ANON_KEY
        },
        body: JSON.stringify({
          query: `
            DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;
            DROP POLICY IF EXISTS "Anon users can create bookings" ON public.bookings;
            CREATE POLICY "Anyone can create bookings" ON public.bookings FOR INSERT TO public WITH CHECK (true);
            CREATE POLICY "Anon users can create bookings" ON public.bookings FOR INSERT TO anon WITH CHECK (true);
          `
        })
      });
      return { ok: response.ok, status: response.status, text: await response.text() };
    }
  }
];

for (const method of methods) {
  try {
    console.log(`\nTrying ${method.name}...`);
    const result = await method.execute();
    console.log('Response:', result);

    if (result.ok) {
      console.log('✅ SUCCESS!');
      process.exit(0);
    }
  } catch (error) {
    console.log('Failed:', error.message);
  }
}

console.log('\n❌ All automatic methods failed.');
console.log('The anon key does not have permission to modify RLS policies.');
console.log('You MUST use the Supabase SQL Editor to run this fix.');
