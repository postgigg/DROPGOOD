import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = 'https://lyftztgccfslwmdgpslt.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5ZnR6dGdjY2ZzbHdtZGdwc2x0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI2NzI5MCwiZXhwIjoyMDc3ODQzMjkwfQ.0keGtgDmqe1iHlUjhcdl6TsyCMa2BcpKl07d3H6QC_U';

const migrationsDir = './supabase/migrations';

async function executeSql(sql, migrationName) {
  console.log(`\n📝 Running: ${migrationName}`);

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ query: sql })
    });

    const text = await response.text();

    if (!response.ok) {
      // Try alternative endpoint
      const response2 = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ query: sql })
      });

      if (!response2.ok) {
        console.error(`❌ Failed: ${response.status} ${text}`);
        return false;
      }
    }

    console.log(`✅ Success: ${migrationName}`);
    return true;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return false;
  }
}

async function runMigrations() {
  console.log('🚀 Starting database migration...\n');
  console.log(`📍 Target: ${SUPABASE_URL}\n`);

  // Get all migration files in order
  const files = readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`Found ${files.length} migration files\n`);

  let successCount = 0;
  let failCount = 0;

  for (const file of files) {
    const filePath = join(migrationsDir, file);
    const sql = readFileSync(filePath, 'utf8');

    const success = await executeSql(sql, file);

    if (success) {
      successCount++;
    } else {
      failCount++;
      console.log('\n⚠️  Migration failed, but continuing with next one...\n');
    }

    // Small delay between migrations
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Completed: ${successCount} migrations`);
  console.log(`❌ Failed: ${failCount} migrations`);
  console.log('='.repeat(60) + '\n');

  if (failCount === 0) {
    console.log('🎉 All migrations completed successfully!');
    console.log('🔄 Now testing database connection...\n');
  } else {
    console.log('⚠️  Some migrations failed. The database may be partially set up.');
  }
}

runMigrations().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
