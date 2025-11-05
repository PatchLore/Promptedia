/**
 * Add 10 new Writing prompts to Supabase
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const newWritingPrompts = [
  {
    title: "Midnight Café Conversations",
    prompt: "Write a short story set in a 24-hour café where strangers share their secrets at midnight.",
    tags: ["fiction", "dialogue", "noir"]
  },
  {
    title: "Letters from the Future",
    prompt: "Compose a letter written by your future self to your present self, offering advice and warnings.",
    tags: ["introspective", "time-travel", "letter"]
  },
  {
    title: "Haunting Notifications",
    prompt: "Write a modern ghost story where a phone keeps receiving texts from someone who's gone.",
    tags: ["horror", "technology", "ghost"]
  },
  {
    title: "The Last Librarian",
    prompt: "Create a world where books are banned, and the last librarian guards the final library.",
    tags: ["dystopian", "fiction", "books"]
  },
  {
    title: "Parallel Lives",
    prompt: "Write two short paragraphs showing two versions of the same person in alternate realities.",
    tags: ["sci-fi", "creative", "parallel"]
  },
  {
    title: "The City That Dreamed",
    prompt: "Describe a city that comes alive at night and dreams for its citizens while they sleep.",
    tags: ["magical-realism", "city", "dreams"]
  },
  {
    title: "Lost Words",
    prompt: "Write a poem that uses only words that are no longer part of modern vocabulary.",
    tags: ["poetry", "language", "nostalgia"]
  },
  {
    title: "Dialogue Only",
    prompt: "Tell a full story using only dialogue, with no narration or description.",
    tags: ["challenge", "dialogue", "creative"]
  },
  {
    title: "3 AM Thoughts",
    prompt: "Write an internal monologue of someone lying awake, overthinking their past decisions.",
    tags: ["introspective", "monologue", "realism"]
  },
  {
    title: "Artificial Muse",
    prompt: "Write a short piece from the perspective of an AI that has learned to write poetry about humans.",
    tags: ["ai", "poetry", "perspective"]
  }
];

async function addWritingPrompts() {
  console.log('📝 Adding 10 new Writing prompts...\n');

  // Check for duplicates
  const { data: existing } = await supabase
    .from('prompts')
    .select('title');

  const existingTitles = new Set((existing || []).map(p => p.title?.toLowerCase().trim()));

  const promptsToAdd = newWritingPrompts
    .filter(p => !existingTitles.has(p.title.toLowerCase().trim()))
    .map(p => ({
      title: p.title,
      prompt: p.prompt,
      category: 'Writing',
      type: 'text',
      tags: p.tags,
      is_public: true,
      is_pro: false,
      user_id: null
    }));

  if (promptsToAdd.length === 0) {
    console.log('⚠️  All prompts already exist in database!');
    return;
  }

  console.log(`✅ Found ${promptsToAdd.length} new prompts to add\n`);

  // Insert in batches
  const batchSize = 10;
  let inserted = 0;

  for (let i = 0; i < promptsToAdd.length; i += batchSize) {
    const batch = promptsToAdd.slice(i, i + batchSize);
    
    const { error, data } = await supabase
      .from('prompts')
      .insert(batch)
      .select();

    if (error) {
      console.error(`❌ Error inserting batch:`, error.message);
    } else {
      inserted += data?.length || 0;
      console.log(`✅ Inserted ${data?.length || 0} prompts`);
      batch.forEach(p => console.log(`   - ${p.title}`));
    }
  }

  console.log(`\n🎉 Successfully added ${inserted} new Writing prompts!`);
  console.log(`📊 Total Writing prompts should now be: ${inserted + (existing?.filter(p => p.title).length || 0)}`);
}

addWritingPrompts().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});



