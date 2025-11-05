// Quick script to validate .env.local format
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');

if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found!');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));

const env = {};
lines.forEach(line => {
  const [key, ...valueParts] = line.split('=');
  env[key.trim()] = valueParts.join('=').trim();
});

console.log('🔍 Checking .env.local configuration...\n');

// Check URL
const url = env.NEXT_PUBLIC_SUPABASE_URL;
if (!url || url === 'your_supabase_project_url_here') {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set or still has placeholder value');
  console.log('   Expected format: https://xxxxx.supabase.co\n');
} else {
  if (url.startsWith('https://') && url.includes('.supabase.co')) {
    console.log('✅ NEXT_PUBLIC_SUPABASE_URL format looks correct');
    console.log(`   URL: ${url.substring(0, 30)}...`);
  } else {
    console.warn('⚠️  NEXT_PUBLIC_SUPABASE_URL format might be incorrect');
    console.log(`   Got: ${url}`);
    console.log('   Expected: https://xxxxx.supabase.co\n');
  }
}

// Check Anon Key
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!key || key === 'your_supabase_anon_key_here') {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set or still has placeholder value');
  console.log('   Expected format: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\n');
} else {
  if (key.startsWith('eyJ') && key.length > 100) {
    console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY format looks correct');
    console.log(`   Key: ${key.substring(0, 20)}...`);
  } else {
    console.warn('⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY format might be incorrect');
    console.log(`   Got: ${key.substring(0, 50)}...`);
    console.log('   Expected: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\n');
  }
}

console.log('\n📝 Next steps:');
console.log('   1. Make sure you\'ve restarted your dev server after updating .env.local');
console.log('   2. Run the SQL schema in Supabase Dashboard → SQL Editor');
console.log('   3. Test by visiting http://localhost:3000');



