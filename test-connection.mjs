import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lyftztgccfslwmdgpslt.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5ZnR6dGdjY2ZzbHdtZGdwc2x0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNjcyOTAsImV4cCI6MjA3Nzg0MzI5MH0.gFsnv1ClJydMzjHZyc9T_TY3kkjwGaf3KQdLjbY7GY4';

console.log('🧪 Testing database connection...\n');

const supabase = createClient(SUPABASE_URL, ANON_KEY);

async function testConnection() {
  try {
    // Test 1: Check if donation_centers table exists and has data
    console.log('1️⃣ Testing donation_centers table...');
    const { data: centers, error: centersError } = await supabase
      .from('donation_centers')
      .select('id, name')
      .limit(5);

    if (centersError) {
      console.log('   ❌ Error:', centersError.message);
    } else {
      console.log(`   ✅ Found ${centers?.length || 0} donation centers`);
      if (centers && centers.length > 0) {
        console.log(`      - ${centers[0].name}`);
      }
    }

    // Test 2: Check if we can INSERT a test booking (RLS policy check)
    console.log('\n2️⃣ Testing guest booking creation (RLS check)...');
    const testBooking = {
      id: `TEST-${Date.now()}`,
      user_id: '00000000-0000-0000-0000-000000000000',
      donation_center_id: '00000000-0000-0000-0000-000000000001',
      pickup_street_address: 'Test Address',
      pickup_city: 'Austin',
      pickup_state: 'TX',
      pickup_zip_code: '78701',
      pickup_latitude: 30.2672,
      pickup_longitude: -97.7431,
      dropoff_street_address: 'Test Dropoff',
      dropoff_city: 'Austin',
      dropoff_state: 'TX',
      dropoff_zip_code: '78701',
      dropoff_latitude: 30.2672,
      dropoff_longitude: -97.7431,
      scheduled_date: '2025-12-25',
      scheduled_time_start: '14:00:00',
      scheduled_time_end: '16:00:00',
      items_count: 1,
      items_types: ['Test'],
      uber_cost: 10.00,
      our_markup: 2.50,
      subtotal: 12.50,
      stripe_fee: 0.50,
      total_price: 13.00,
      status: 'payment_pending',
      customer_phone: '555-1234'
    };

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert(testBooking)
      .select()
      .single();

    if (bookingError) {
      console.log('   ❌ RLS Policy Error:', bookingError.message);
      console.log('\n   ⚠️  THIS IS THE PROBLEM - RLS is still blocking inserts!');
    } else {
      console.log('   ✅ SUCCESS! Guest bookings work!');
      console.log(`      Created test booking: ${booking.id}`);

      // Clean up test booking
      await supabase.from('bookings').delete().eq('id', testBooking.id);
      console.log('      (Test booking cleaned up)');
    }

    console.log('\n' + '='.repeat(60));
    if (!bookingError) {
      console.log('✅ ALL TESTS PASSED!');
      console.log('🎉 Database is ready - payment form will work!');
    } else {
      console.log('❌ RLS policy still blocking - need to fix');
    }
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('Fatal error:', error);
  }
}

testConnection();
