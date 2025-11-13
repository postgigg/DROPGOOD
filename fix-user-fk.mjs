import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://lyftztgccfslwmdgpslt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5ZnR6dGdjY2ZzbHdtZGdwc2x0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI2NzI5MCwiZXhwIjoyMDc3ODQzMjkwfQ.0keGtgDmqe1iHlUjhcdl6TsyCMa2BcpKl07d3H6QC_U'
);

console.log('🔧 Fixing user_id foreign key constraint for guest bookings...\n');

const sql = `
-- Make user_id nullable for guest bookings
ALTER TABLE bookings ALTER COLUMN user_id DROP NOT NULL;

-- Drop the existing foreign key constraint
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_user_id_fkey;

-- Recreate the foreign key constraint but allow NULL values
ALTER TABLE bookings
  ADD CONSTRAINT bookings_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES users(id)
  ON DELETE SET NULL;
`;

try {
  // Try using rpc to execute SQL
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    console.log('⚠️  Cannot execute via API.\n');
    console.log('📋 MANUAL ACTION REQUIRED:');
    console.log('   Go to Supabase SQL Editor and run:');
    console.log('   /Users/bubblefreelancer/Desktop/FIX_USER_FK.sql\n');
    process.exit(1);
  }

  console.log('✅ Foreign key constraint fixed!\n');
  console.log('📋 Changes applied:');
  console.log('   - user_id is now nullable (allows guest bookings)');
  console.log('   - Foreign key constraint updated to allow NULL values');
  console.log('\n🎉 Guest bookings can now be created without user accounts!\n');

} catch (err) {
  console.error('❌ Error:', err.message);
  console.log('\n⚠️  MANUAL ACTION REQUIRED:');
  console.log('   Go to Supabase SQL Editor and run:');
  console.log('   /Users/bubblefreelancer/Desktop/FIX_USER_FK.sql\n');
}
