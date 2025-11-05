/**
 * Bulk Generate Prompts Script
 * 
 * Generates AI prompts using OpenAI and inserts them into Supabase
 * 
 * Usage:
 *   node scripts/bulk-generate-prompts.js              # Generate all prompts
 *   node scripts/bulk-generate-prompts.js 50            # Limit to 50 prompts
 *   node scripts/bulk-generate-prompts.js --preview     # Preview without inserting
 *   node scripts/bulk-generate-prompts.js --dry-run     # Test OpenAI parsing only
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');

// Configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate environment variables
if (!OPENAI_API_KEY) {
  console.error('❌ Missing OPENAI_API_KEY in .env.local');
  process.exit(1);
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Initialize clients
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Categories and topics
const categories = {
  Art: ['cyberpunk', 'fantasy forest', 'minimal design', 'surrealism', 'portrait', 'landscape', 'abstract', 'digital art'],
  Music: ['lofi', 'drum & bass', 'ambient', 'cinematic', 'electronic', 'jazz', 'rock', 'classical'],
  Writing: ['story ideas', 'marketing copy', 'poetry', 'sci-fi', 'blog posts', 'product descriptions', 'headlines', 'social media'],
  Business: ['startup ideas', 'branding', 'customer emails', 'SaaS growth', 'marketing strategies', 'sales pitches', 'business plans', 'content calendars'],
  Coding: ['Next.js', 'Supabase', 'Stripe', 'automation scripts', 'API design', 'database queries', 'React components', 'TypeScript patterns']
};

// Parse CLI arguments
const args = process.argv.slice(2);
const limitArg = args.find(arg => /^\d+$/.test(arg));
const limit = limitArg ? parseInt(limitArg, 10) : null;
const preview = args.includes('--preview');
const dryRun = args.includes('--dry-run');

// Statistics
let stats = {
  totalGenerated: 0,
  totalInserted: 0,
  totalErrors: 0,
  byCategory: {}
};

/**
 * Generate prompts using OpenAI
 */
async function generatePrompts(category, topic, count = 15) {
  const systemPrompt = `You are a creative AI prompt generator. Create ${count} creative and concise AI prompts for ${category} on the theme "${topic}".

Each prompt should include:
- title: A short, descriptive title (max 60 characters)
- prompt: The actual prompt text (1-2 sentences, clear and actionable)
- tags: An array of 2-5 relevant tags (e.g., ["tag1", "tag2", "tag3"])

Return ONLY a valid JSON array in this exact format:
[
  {
    "title": "Example Title",
    "prompt": "Create a detailed prompt description here.",
    "tags": ["tag1", "tag2", "tag3"]
  }
]

Do not include any markdown formatting, code blocks, or explanations. Just the JSON array.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate ${count} prompts for ${category} on the theme "${topic}".` }
      ],
      temperature: 0.8,
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content.trim();
    
    // Try to extract JSON from markdown code blocks if present
    let jsonText = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }

    // Parse JSON
    const prompts = JSON.parse(jsonText);
    
    if (!Array.isArray(prompts)) {
      throw new Error('Response is not an array');
    }

    return prompts;
  } catch (error) {
    console.error(`   ❌ Error generating prompts: ${error.message}`);
    if (error.response) {
      console.error(`   OpenAI API error:`, error.response.status, error.response.data);
    }
    return [];
  }
}

/**
 * Insert prompts into Supabase
 */
async function insertPrompts(prompts, category, topic) {
  const type = category === 'Music' ? 'audio' : category === 'Coding' ? 'text' : 'image';
  
  const inserts = prompts.map(p => ({
    title: p.title || 'Untitled Prompt',
    prompt: p.prompt || '',
    category: category,
    type: type,
    tags: p.tags || [],
    is_public: true,
    is_pro: false,
    user_id: null,
  }));

  if (preview || dryRun) {
    console.log(`   📝 Would insert ${inserts.length} prompts:`);
    inserts.slice(0, 3).forEach((p, i) => {
      console.log(`      ${i + 1}. ${p.title}`);
      console.log(`         ${p.prompt.substring(0, 60)}...`);
      console.log(`         Tags: ${p.tags.join(', ')}`);
    });
    if (inserts.length > 3) {
      console.log(`      ... and ${inserts.length - 3} more`);
    }
    return inserts.length;
  }

  try {
    const { data, error } = await supabase
      .from('prompts')
      .insert(inserts)
      .select();

    if (error) {
      throw error;
    }

    return data?.length || 0;
  } catch (error) {
    console.error(`   ❌ Error inserting prompts: ${error.message}`);
    throw error;
  }
}

/**
 * Process a single category/topic combination
 */
async function processCategoryTopic(category, topic, promptsPerTopic = 15) {
  console.log(`\n📝 Generating prompts for ${category} / ${topic}...`);
  
  try {
    // Generate prompts
    const prompts = await generatePrompts(category, topic, promptsPerTopic);
    
    if (prompts.length === 0) {
      console.log(`   ⚠️  No prompts generated for ${category} / ${topic}`);
      return 0;
    }

    stats.totalGenerated += prompts.length;

    // Insert prompts
    const inserted = await insertPrompts(prompts, category, topic);
    stats.totalInserted += inserted;

    // Update category stats
    if (!stats.byCategory[category]) {
      stats.byCategory[category] = 0;
    }
    stats.byCategory[category] += inserted;

    console.log(`   ✅ ${preview || dryRun ? 'Would insert' : 'Inserted'} ${inserted} prompts`);
    
    return inserted;
  } catch (error) {
    stats.totalErrors++;
    console.error(`   ❌ Failed to process ${category} / ${topic}:`, error.message);
    return 0;
  }
}

/**
 * Calculate prompts per topic based on limit
 */
function calculatePromptsPerTopic(totalLimit, totalTopics) {
  if (!limit) return 15; // Default
  return Math.max(5, Math.floor(totalLimit / totalTopics));
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Bulk Prompt Generator');
  console.log('='.repeat(50));
  
  if (preview) {
    console.log('📋 PREVIEW MODE: Will show prompts but not insert');
  }
  if (dryRun) {
    console.log('🧪 DRY RUN MODE: Testing OpenAI parsing only');
  }
  if (limit) {
    console.log(`🎯 LIMIT MODE: Generating max ${limit} prompts`);
  }
  console.log('');

  // Calculate total topics
  const totalTopics = Object.values(categories).reduce((sum, topics) => sum + topics.length, 0);
  const promptsPerTopic = calculatePromptsPerTopic(limit, totalTopics);

  let processed = 0;

  // Process each category
  for (const [category, topics] of Object.entries(categories)) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`📂 Category: ${category}`);
    console.log(`${'='.repeat(50)}`);

    for (const topic of topics) {
      // Check limit
      if (limit && stats.totalInserted >= limit) {
        console.log(`\n🎯 Reached limit of ${limit} prompts. Stopping.`);
        break;
      }

      // Process this topic
      await processCategoryTopic(category, topic, promptsPerTopic);

      // Rate limiting: wait 2-3 seconds between requests
      if (!dryRun) {
        const delay = 2000 + Math.random() * 1000; // 2-3 seconds
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      processed++;
    }

    if (limit && stats.totalInserted >= limit) {
      break;
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Total generated: ${stats.totalGenerated}`);
  console.log(`✅ Total ${preview || dryRun ? 'would be inserted' : 'inserted'}: ${stats.totalInserted}`);
  console.log(`❌ Total errors: ${stats.totalErrors}`);
  console.log('\n📂 By Category:');
  for (const [category, count] of Object.entries(stats.byCategory)) {
    console.log(`   ${category}: ${count} prompts`);
  }
  
  if (!preview && !dryRun) {
    console.log('\n🎉 All prompts have been added to Supabase!');
    console.log('   Visit http://localhost:3000/admin to manage them.');
  }
}

// Run the script
main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});



