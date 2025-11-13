import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lyftztgccfslwmdgpslt.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5ZnR6dGdjY2ZzbHdtZGdwc2x0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNjcyOTAsImV4cCI6MjA3Nzg0MzI5MH0.gFsnv1ClJydMzjHZyc9T_TY3kkjwGaf3KQdLjbY7GY4';

const supabase = createClient(SUPABASE_URL, ANON_KEY);

async function testLogin() {
  console.log('🔐 Testing admin login...\n');

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@dropgood.com',
      password: 'Demo123!'
    });

    if (error) {
      console.error('❌ Login failed:', error.message);
      console.log('\nError details:', error);
      
      console.log('\n🔧 Possible fixes:');
      console.log('1. Wait a few minutes - Supabase might be having temporary issues');
      console.log('2. Check Supabase Status: https://status.supabase.com/');
      console.log('3. Try resetting the admin password in Supabase Dashboard:');
      console.log('   https://supabase.com/dashboard/project/lyftztgccfslwmdgpslt/auth/users');
      return;
    }

    console.log('✅ Login successful!');
    console.log('User:', data.user?.email);

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  }
}

testLogin();
