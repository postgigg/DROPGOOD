import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lyftztgccfslwmdgpslt.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5ZnR6dGdjY2ZzbHdtZGdwc2x0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI2NzI5MCwiZXhwIjoyMDc3ODQzMjkwfQ.0keGtgDmqe1iHlUjhcdl6TsyCMa2BcpKl07d3H6QC_U';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkAdmin() {
  console.log('🔍 Checking admin user setup...\n');

  try {
    // Check if admin_users table exists and has data
    const { data: adminUsers, error: adminError } = await supabase
      .from('admin_users')
      .select('*');

    if (adminError) {
      console.error('❌ Error querying admin_users:', adminError.message);
      return;
    }

    console.log('✅ Found', adminUsers.length, 'admin user(s)');
    adminUsers.forEach(admin => {
      console.log('  -', admin.email, '(ID:', admin.id.substring(0, 8) + '...)');
    });

    // Check auth users
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error('❌ Error querying auth users:', authError.message);
      return;
    }

    console.log('\n✅ Found', authData.users.length, 'auth user(s)');
    authData.users.forEach(user => {
      console.log('  -', user.email, '(ID:', user.id.substring(0, 8) + '...)');
    });

    // Check if the admin user exists in both tables
    const adminEmail = 'admin@dropgood.com';
    const adminInUsers = adminUsers.find(a => a.email === adminEmail);
    const adminInAuth = authData.users.find(u => u.email === adminEmail);

    console.log('\n📋 Admin user "' + adminEmail + '":');
    console.log('  - In admin_users table:', adminInUsers ? '✓' : '✗');
    console.log('  - In auth.users:', adminInAuth ? '✓' : '✗');

    if (adminInUsers && adminInAuth && adminInUsers.id !== adminInAuth.id) {
      console.log('\n⚠️  WARNING: ID mismatch!');
      console.log('  admin_users.id:', adminInUsers.id);
      console.log('  auth.users.id:', adminInAuth.id);
      console.log('\n🔧 Fix by running this in SQL Editor:');
      console.log(`UPDATE admin_users SET id = '${adminInAuth.id}' WHERE email = '${adminEmail}';`);
    }

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  }
}

checkAdmin();
