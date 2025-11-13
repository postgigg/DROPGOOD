import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lyftztgccfslwmdgpslt.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5ZnR6dGdjY2ZzbHdtZGdwc2x0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI2NzI5MCwiZXhwIjoyMDc3ODQzMjkwfQ.0keGtgDmqe1iHlUjhcdl6TsyCMa2BcpKl07d3H6QC_U';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function checkMigration() {
  console.log('🔍 Checking migration status...\n');

  try {
    // Check if the columns exist
    const { data: columns, error: colError } = await supabase
      .from('bookings')
      .select('*')
      .limit(1);

    if (colError) {
      console.error('❌ Error querying bookings:', colError.message);
      console.log('\n📋 The issue is likely with the database schema.');
      console.log('Please run this in Supabase SQL Editor to fix:\n');
      console.log('-- First, drop the problematic column if it exists');
      console.log('ALTER TABLE bookings DROP COLUMN IF EXISTS messages_confirmed_by;');
      console.log('ALTER TABLE bookings DROP COLUMN IF EXISTS messages_confirmed_at;');
      console.log('ALTER TABLE bookings DROP COLUMN IF EXISTS messages_confirmed;');
      console.log('\n-- Then add them back without the foreign key');
      console.log('ALTER TABLE bookings ADD COLUMN messages_confirmed boolean DEFAULT false;');
      console.log('ALTER TABLE bookings ADD COLUMN messages_confirmed_at timestamptz;');
      console.log('ALTER TABLE bookings ADD COLUMN messages_confirmed_by uuid;');
      console.log('\nCREATE INDEX IF NOT EXISTS idx_bookings_messages_confirmed ON bookings(messages_confirmed);');
      return;
    }

    console.log('✅ Successfully queried bookings table');
    console.log('📊 Sample booking structure:', Object.keys(columns[0] || {}));

    // Check if our new columns exist
    if (columns && columns.length > 0) {
      const booking = columns[0];
      console.log('\n✅ New columns check:');
      console.log('  - messages_confirmed:', 'messages_confirmed' in booking ? '✓' : '✗');
      console.log('  - messages_confirmed_at:', 'messages_confirmed_at' in booking ? '✓' : '✗');
      console.log('  - messages_confirmed_by:', 'messages_confirmed_by' in booking ? '✓' : '✗');
    }

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  }
}

checkMigration();
