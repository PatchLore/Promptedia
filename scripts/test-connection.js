// Test Supabase connection
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Environment Variables Check:\n');
console.log('NEXT_PUBLIC_SUPABASE_URL:', url ? `${url.substring(0, 30)}...` : 'NOT SET');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', key ? `${key.substring(0, 30)}...` : 'NOT SET');
console.log('\n');

if (!url || !key || url === 'your_supabase_project_url_here') {
  console.error('❌ Credentials not properly set in .env.local');
  console.log('\nPlease make sure .env.local contains:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...');
  process.exit(1);
}

// Validate format
const urlValid = url.startsWith('https://') && url.includes('.supabase.co');
const keyValid = key.startsWith('eyJ') && key.length > 100;

if (!urlValid) {
  console.error('❌ URL format is incorrect');
  console.log(`   Got: ${url}`);
  console.log('   Expected: https://xxxxx.supabase.co');
}

if (!keyValid) {
  console.error('❌ Key format is incorrect');
  console.log(`   Got: ${key.substring(0, 50)}...`);
  console.log('   Expected: eyJ... (JWT token, 100+ characters)');
}

if (urlValid && keyValid) {
  console.log('✅ Format looks correct!');
  console.log('\nTesting connection...');
  
  // Try to make a simple request
  fetch(`${url}/rest/v1/`, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`
    }
  })
    .then(res => {
      if (res.ok) {
        console.log('✅ Connection successful! Supabase is reachable.');
        console.log('\n✅ Your .env.local is configured correctly!');
      } else {
        console.warn('⚠️  Connection attempted but got status:', res.status);
        console.log('   This might be normal - the endpoint might not exist');
        console.log('   But the URL format is correct.');
      }
    })
    .catch(err => {
      console.error('❌ Connection failed:', err.message);
      console.log('   Check your internet connection and Supabase URL');
    });
}



