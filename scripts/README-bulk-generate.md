# Bulk Generate Prompts Script

This script automatically generates AI prompts using OpenAI and inserts them into your Supabase database.

## Setup

1. **Install dependencies:**
   ```bash
   npm install openai
   ```

2. **Add environment variables to `.env.local`:**
   ```env
   OPENAI_API_KEY=sk-your-openai-api-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

   Get your OpenAI API key from: https://platform.openai.com/api-keys
   Get your Supabase Service Role Key from: Supabase Dashboard → Settings → API

## Usage

### Basic usage (generate all prompts):
```bash
node scripts/bulk-generate-prompts.js
```

### Limit total prompts:
```bash
node scripts/bulk-generate-prompts.js 50
```

### Preview mode (see what would be generated without inserting):
```bash
node scripts/bulk-generate-prompts.js --preview
```

### Dry run (test OpenAI parsing only):
```bash
node scripts/bulk-generate-prompts.js --dry-run
```

### Combine flags:
```bash
node scripts/bulk-generate-prompts.js 100 --preview
```

## Features

- ✅ Generates 10-20 prompts per topic
- ✅ Covers 5 categories: Art, Music, Writing, Business, Coding
- ✅ Rate limiting (2-3 second delays between requests)
- ✅ Error handling with graceful skipping
- ✅ Progress logging
- ✅ Statistics summary
- ✅ CLI arguments for flexibility

## Categories & Topics

The script generates prompts for:

- **Art**: cyberpunk, fantasy forest, minimal design, surrealism, portrait, landscape, abstract, digital art
- **Music**: lofi, drum & bass, ambient, cinematic, electronic, jazz, rock, classical
- **Writing**: story ideas, marketing copy, poetry, sci-fi, blog posts, product descriptions, headlines, social media
- **Business**: startup ideas, branding, customer emails, SaaS growth, marketing strategies, sales pitches, business plans, content calendars
- **Coding**: Next.js, Supabase, Stripe, automation scripts, API design, database queries, React components, TypeScript patterns

## Output

After running, you'll see:
- Progress for each category/topic
- Total prompts generated
- Total prompts inserted
- Statistics by category
- Any errors encountered

## Notes

- Uses GPT-4o-mini for cost efficiency
- Rate limits to avoid API throttling
- Uses Supabase Service Role Key for write access (bypasses RLS)
- All prompts are set as `is_public: true` and `is_pro: false`



