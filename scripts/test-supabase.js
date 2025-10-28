// Quick script to test Supabase connection and check if schema is deployed
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n');
  
  // Test 1: Check users table
  console.log('1. Checking users table...');
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .limit(1);
  
  if (usersError) {
    console.error('❌ Users table not found or error:', usersError.message);
    console.log('\n⚠️  You need to run the schema.sql file in Supabase SQL Editor!');
    console.log('   1. Go to https://supabase.com/dashboard/project/' + supabaseUrl.split('//')[1].split('.')[0] + '/sql/new');
    console.log('   2. Copy the contents of supabase/schema.sql');
    console.log('   3. Paste and run in SQL Editor\n');
    return false;
  }
  console.log('✅ Users table exists');
  
  // Test 2: Check api_collections table
  console.log('2. Checking api_collections table...');
  const { data: collections, error: collectionsError } = await supabase
    .from('api_collections')
    .select('*')
    .limit(1);
  
  if (collectionsError) {
    console.error('❌ Collections table error:', collectionsError.message);
    return false;
  }
  console.log('✅ API collections table exists');
  
  // Test 3: Check api_requests table
  console.log('3. Checking api_requests table...');
  const { data: requests, error: requestsError } = await supabase
    .from('api_requests')
    .select('*')
    .limit(1);
  
  if (requestsError) {
    console.error('❌ Requests table error:', requestsError.message);
    return false;
  }
  console.log('✅ API requests table exists');
  
  console.log('\n🎉 All tables are set up correctly!');
  console.log('📊 Database stats:');
  console.log('   - Users:', users?.length || 0);
  console.log('   - Collections:', collections?.length || 0);
  console.log('   - Requests:', requests?.length || 0);
  
  return true;
}

testConnection()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
