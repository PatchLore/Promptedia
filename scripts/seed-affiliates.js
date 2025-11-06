/**
 * Seed script for affiliates table
 * Run with: node scripts/seed-affiliates.js
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const affiliates = [
  {
    name: 'Webflow',
    category: ['business', 'coding'],
    affiliate_url: 'https://webflow.grsm.io/promptopedia',
    commission_value: 50,
    commission_type: 'revshare',
    cookie_days: 90,
  },
  {
    name: 'Framer',
    category: ['business', 'coding'],
    affiliate_url: 'https://framer.com/?ref=promptopedia',
    commission_value: 50,
    commission_type: 'revshare',
    cookie_days: 60,
  },
  {
    name: 'Mixo AI',
    category: ['business', 'coding'],
    affiliate_url: 'https://mixo.io/?via=promptopedia',
    commission_value: 20,
    commission_type: 'revshare',
    cookie_days: 90,
  },
  {
    name: 'Copy.ai',
    category: ['writing', 'business'],
    affiliate_url: 'https://copy.ai/?via=promptopedia',
    commission_value: 45,
    commission_type: 'revshare',
    cookie_days: 90,
  },
  {
    name: 'Jasper',
    category: ['writing'],
    affiliate_url: 'https://jasper.ai/?via=promptopedia',
    commission_value: 30,
    commission_type: 'revshare',
    cookie_days: 60,
  },
  {
    name: 'Notion',
    category: ['writing', 'business'],
    affiliate_url: 'https://notion.so/?ref=promptopedia',
    commission_value: 20,
    commission_type: 'revshare',
    cookie_days: 90,
  },
  {
    name: 'Leonardo.ai',
    category: ['art'],
    affiliate_url: 'https://leonardo.ai/?via=promptopedia',
    commission_value: 60,
    commission_type: 'revshare',
    cookie_days: 30,
  },
  {
    name: 'Imagine.art',
    category: ['art'],
    affiliate_url: 'https://imagine.art/?ref=promptopedia',
    commission_value: 50,
    commission_type: 'revshare',
    cookie_days: 60,
  },
  {
    name: 'Midjourney',
    category: ['art'],
    affiliate_url: 'https://midjourney.com',
    commission_value: 0,
    commission_type: 'none',
    cookie_days: 0,
  },
  {
    name: 'Mubert',
    category: ['music'],
    affiliate_url: 'https://mubert.com/?ref=promptopedia',
    commission_value: 30,
    commission_type: 'revshare',
    cookie_days: 60,
  },
  {
    name: 'SOUNDRAW',
    category: ['music'],
    affiliate_url: 'https://soundraw.io/?via=promptopedia',
    commission_value: 25,
    commission_type: 'cpa',
    cookie_days: 30,
  },
  {
    name: 'Soundswoop',
    category: ['music'],
    affiliate_url: 'https://soundswoop.com',
    commission_value: 0,
    commission_type: 'none',
    cookie_days: 0,
  },
];

async function seedAffiliates() {
  console.log('🌱 Seeding affiliates table...\n');

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const affiliate of affiliates) {
    // Check if affiliate already exists
    const { data: existing } = await supabase
      .from('affiliates')
      .select('id')
      .eq('name', affiliate.name)
      .maybeSingle();

    if (existing) {
      // Update existing affiliate
      const { error } = await supabase
        .from('affiliates')
        .update(affiliate)
        .eq('id', existing.id);

      if (error) {
        console.error(`❌ Failed to update ${affiliate.name}:`, error.message);
        skipped++;
      } else {
        console.log(`✅ Updated: ${affiliate.name} (${affiliate.commission_value}% ${affiliate.commission_type})`);
        updated++;
      }
    } else {
      // Insert new affiliate
      const { error } = await supabase.from('affiliates').insert(affiliate);

      if (error) {
        console.error(`❌ Failed to insert ${affiliate.name}:`, error.message);
        skipped++;
      } else {
        console.log(`✅ Inserted: ${affiliate.name} (${affiliate.commission_value}% ${affiliate.commission_type})`);
        inserted++;
      }
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Inserted: ${inserted}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Total: ${affiliates.length}`);
}

seedAffiliates()
  .then(() => {
    console.log('\n✨ Seeding complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });

