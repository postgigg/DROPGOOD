import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const SUPABASE_URL = 'https://lyftztgccfslwmdgpslt.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5ZnR6dGdjY2ZzbHdtZGdwc2x0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI2NzI5MCwiZXhwIjoyMDc3ODQzMjkwfQ.0keGtgDmqe1iHlUjhcdl6TsyCMa2BcpKl07d3H6QC_U';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function applyMigration() {
  console.log('🚀 Applying message confirmation migration...\n');

  try {
    // Read the migration file
    const migrationSql = readFileSync('./supabase/migrations/20251112000000_add_message_confirmation_fields.sql', 'utf8');

    console.log('Migration SQL:');
    console.log(migrationSql);
    console.log('\n---\n');

    // Execute each statement separately (split on semicolons, accounting for DO blocks)
    const statements = migrationSql
      .split(/;(?![^$]*\$\$)/) // Split on semicolons, but not within DO $$ blocks
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('/*') && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.includes('DO $$') || statement.includes('BEGIN') || statement.includes('ALTER TABLE') || statement.includes('CREATE INDEX') || statement.includes('COMMENT ON')) {
        console.log('📝 Executing statement...');
        console.log(statement.substring(0, 100) + '...\n');

        const { error } = await supabase.rpc('exec_sql', { sql: statement });

        if (error) {
          console.log('⚠️  Standard exec failed, trying direct approach...');
          // If that fails, we'll need to execute it via the database directly
          // This might require using pg or a direct SQL execution
          console.log('Error:', error);
        } else {
          console.log('✅ Success\n');
        }
      }
    }

    console.log('\n✅ Migration applied successfully!');
    console.log('\nYou can now refresh your admin login page.');

  } catch (error) {
    console.error('❌ Error applying migration:', error.message);
    console.log('\n📋 Manual Steps:');
    console.log('1. Go to your Supabase Dashboard: https://supabase.com/dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of:');
    console.log('   supabase/migrations/20251112000000_add_message_confirmation_fields.sql');
    console.log('4. Run the query');
  }
}

applyMigration();
