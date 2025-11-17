/**
 * Roadie Sandbox Testing Script
 *
 * Tests all 3 required scenarios for Roadie certification:
 * 1. Happy Path (single order)
 * 2. Happy Path (multiple orders)
 * 3. Return scenario
 *
 * Usage:
 *   ts-node scripts/test-roadie-sandbox.ts
 *
 * Requirements:
 *   - ROADIE_SANDBOX_TOKEN environment variable set
 *   - Supabase Edge Functions deployed
 */

const SUPABASE_URL = 'https://uhtkemafphcegmabyfyj.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

// Test addresses in Richmond, VA (your service area)
const TEST_PICKUP = {
  street: '123 Main St',
  city: 'Richmond',
  state: 'VA',
  zip_code: '23220',
  latitude: 37.5407,
  longitude: -77.4360,
  contact: {
    name: 'Test Customer',
    phone: '8045551234',
    email: 'test@dropgood.com'
  }
};

const TEST_DELIVERY = {
  street: '456 Charity Lane',
  city: 'Richmond',
  state: 'VA',
  zip_code: '23221',
  latitude: 37.5500,
  longitude: -77.4400,
  contact: {
    name: 'Test Charity',
    phone: '8045555678'
  }
};

interface TestResult {
  scenario: string;
  shipment_id?: number;
  booking_id: string;
  success: boolean;
  error?: string;
  events_received?: string[];
  images_fetched?: string[];
}

const results: TestResult[] = [];

/**
 * Create a test shipment via Edge Function
 */
async function createTestShipment(
  scenario: string,
  bagsCount: number,
  boxesCount: number,
  specialCommand?: 'return' | 'cancel',
  timingSeconds?: number
): Promise<TestResult> {
  const bookingId = `TEST-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

  console.log(`\n🧪 Testing Scenario: ${scenario}`);
  console.log(`📦 Booking ID: ${bookingId}`);
  console.log(`📦 Items: ${bagsCount} bags, ${boxesCount} boxes`);

  try {
    // Set delivery window to NOW (< 30 mins triggers auto-delivery)
    const now = new Date();
    const pickupAfter = now.toISOString();
    const deliverStart = now.toISOString();
    const deliverEnd = new Date(now.getTime() + 30 * 60 * 1000).toISOString();

    // Build description with timing command if provided
    let description = `DropGood TEST - ${scenario} - ${bookingId}`;
    if (timingSeconds) {
      description += ` --timing ${timingSeconds}`;
    }

    // Build notes with special commands
    const pickupNotes = specialCommand === 'cancel'
      ? 'Please cancel this shipment.'
      : `Test pickup for ${scenario}`;

    const deliveryNotes = specialCommand === 'return'
      ? 'Please return this shipment.'
      : `Test delivery for ${scenario}`;

    const payload = {
      booking_id: bookingId,
      description,
      pickup_location: {
        address: {
          street: TEST_PICKUP.street,
          city: TEST_PICKUP.city,
          state: TEST_PICKUP.state,
          zip_code: TEST_PICKUP.zip_code
        },
        latitude: TEST_PICKUP.latitude,
        longitude: TEST_PICKUP.longitude,
        contact: TEST_PICKUP.contact,
        notes: pickupNotes
      },
      delivery_location: {
        address: {
          street: TEST_DELIVERY.street,
          city: TEST_DELIVERY.city,
          state: TEST_DELIVERY.state,
          zip_code: TEST_DELIVERY.zip_code
        },
        latitude: TEST_DELIVERY.latitude,
        longitude: TEST_DELIVERY.longitude,
        contact: TEST_DELIVERY.contact,
        notes: deliveryNotes
      },
      pickup_after: pickupAfter,
      deliver_between: {
        start: deliverStart,
        end: deliverEnd
      },
      bags_count: bagsCount,
      boxes_count: boxesCount,
      options: {
        signature_required: false,
        notifications_enabled: true,
        decline_insurance: false
      }
    };

    console.log('📤 Creating shipment...');
    console.log('⏰ Delivery window:', deliverStart, 'to', deliverEnd);

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/roadie-create-shipment`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create shipment: ${errorText}`);
    }

    const data = await response.json();

    console.log('✅ Shipment created!');
    console.log('📍 Shipment ID:', data.shipment_id);
    console.log('📍 Tracking URL:', data.tracking_url);
    console.log('🚗 Vehicle size:', data.roadie_size);
    console.log('\n⏳ Waiting for auto-delivery events (first event in ~30 seconds)...');
    console.log('📊 Events will arrive every 15 seconds until delivery completes');

    return {
      scenario,
      shipment_id: data.shipment_id,
      booking_id: bookingId,
      success: true,
      events_received: [],
      images_fetched: []
    };
  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      scenario,
      booking_id: bookingId,
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Monitor webhook events for a shipment
 */
async function monitorWebhooks(bookingId: string, durationMinutes: number = 5): Promise<string[]> {
  console.log(`\n👀 Monitoring webhooks for ${durationMinutes} minutes...`);

  const events: string[] = [];
  const startTime = Date.now();
  const endTime = startTime + (durationMinutes * 60 * 1000);

  // Poll every 5 seconds
  while (Date.now() < endTime) {
    try {
      // Query webhook logs from database
      const query = `
        SELECT event_type, processed_at
        FROM roadie_webhook_logs
        WHERE reference_id = '${bookingId}'
        ORDER BY processed_at ASC
      `;

      // Note: This requires database access - you may need to query via Supabase client
      // For now, just log that we're monitoring
      console.log('📡 Checking for new events...');

      await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (error) {
      console.error('Error monitoring webhooks:', error);
    }
  }

  return events;
}

/**
 * Run all test scenarios
 */
async function runAllTests() {
  console.log('🚀 Starting Roadie Sandbox Testing');
  console.log('=' .repeat(60));
  console.log('📍 Test Location: Richmond, VA');
  console.log('🔑 Using Supabase URL:', SUPABASE_URL);
  console.log('=' .repeat(60));

  // Test 1: Happy Path (Single Order)
  console.log('\n\n📋 TEST 1: Happy Path (Single Order)');
  console.log('-' .repeat(60));
  const test1 = await createTestShipment(
    'Happy Path - Single Order',
    5,  // 5 bags
    3,  // 3 boxes
    undefined,
    30  // Events every 30 seconds (slower for easier observation)
  );
  results.push(test1);

  if (test1.success) {
    console.log('\n⏳ Waiting 3 minutes for delivery to complete...');
    await new Promise(resolve => setTimeout(resolve, 3 * 60 * 1000));
  }

  // Test 2: Happy Path (Multiple Orders)
  console.log('\n\n📋 TEST 2: Happy Path (Multiple Orders)');
  console.log('-' .repeat(60));

  const test2a = await createTestShipment(
    'Happy Path - Order A',
    2,
    1,
    undefined,
    30
  );
  results.push(test2a);

  await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay

  const test2b = await createTestShipment(
    'Happy Path - Order B',
    10,
    5,
    undefined,
    30
  );
  results.push(test2b);

  if (test2a.success && test2b.success) {
    console.log('\n⏳ Waiting 3 minutes for both deliveries to complete...');
    await new Promise(resolve => setTimeout(resolve, 3 * 60 * 1000));
  }

  // Test 3: Return Scenario
  console.log('\n\n📋 TEST 3: Return Scenario');
  console.log('-' .repeat(60));
  const test3 = await createTestShipment(
    'Return Scenario',
    4,
    2,
    'return',  // Special command to trigger return
    30
  );
  results.push(test3);

  if (test3.success) {
    console.log('\n⏳ Waiting 3 minutes for return scenario to complete...');
    await new Promise(resolve => setTimeout(resolve, 3 * 60 * 1000));
  }

  // Print results
  console.log('\n\n📊 TEST RESULTS SUMMARY');
  console.log('=' .repeat(60));

  results.forEach((result, index) => {
    console.log(`\nTest ${index + 1}: ${result.scenario}`);
    console.log('  Booking ID:', result.booking_id);
    console.log('  Shipment ID:', result.shipment_id || 'N/A');
    console.log('  Status:', result.success ? '✅ SUCCESS' : '❌ FAILED');
    if (result.error) {
      console.log('  Error:', result.error);
    }
  });

  console.log('\n\n📝 NEXT STEPS FOR CERTIFICATION:');
  console.log('=' .repeat(60));
  console.log('1. Share these Shipment IDs with Roadie:');
  results.forEach(r => {
    if (r.shipment_id) {
      console.log(`   - ${r.shipment_id} (${r.scenario})`);
    }
  });
  console.log('\n2. Email Roadie: integrations@roadie.com');
  console.log('3. Include: Test results + shipment IDs');
  console.log('4. Request: Production API credentials');
  console.log('\n5. Monitor webhooks in database:');
  console.log('   SELECT * FROM roadie_webhook_logs');
  console.log('   WHERE reference_id IN (');
  results.forEach((r, i) => {
    console.log(`     '${r.booking_id}'${i < results.length - 1 ? ',' : ''}`);
  });
  console.log('   ) ORDER BY processed_at;');
}

// Run tests
runAllTests().catch(console.error);
