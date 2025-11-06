# On Point Prompt

A searchable, filterable library of AI prompts for image generation, music creation, writing, business, and more.

## Features

- 🎨 Browse prompts by category (Art, Music, Writing, Business, Coding)
- 🔍 Search prompts by title, content, or tags
- 💾 Save favorites (requires authentication)
- 📝 Create and submit new prompts
- 🖼️ View example outputs (images, audio, text)
- 📋 Copy prompts to clipboard
- 🔐 Supabase authentication (Google OAuth)

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (Database + Auth)
- **Vercel** (Deployment ready)

## Setup

1. **Clone and install dependencies:**

```bash
npm install
```

2. **Set up Supabase:**

   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Run the SQL schema in your Supabase SQL editor:

```sql
-- prompts table
create table prompts (
  id uuid primary key default gen_random_uuid(),
  title text,
  prompt text,
  category text,
  type text, -- e.g. "image", "music", "text"
  example_url text, -- link to generated output (image/audio)
  model text,
  tags text[],
  user_id uuid references auth.users(id) on delete set null,
  is_public boolean default true,
  is_pro boolean default false,
  created_at timestamp default now()
);

-- favorites table
create table favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  prompt_id uuid references prompts(id),
  created_at timestamp default now()
);
```

3. **Configure environment variables:**

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Set up Google OAuth (optional):**

   - In Supabase Dashboard → Authentication → Providers
   - Enable Google provider
   - Add your Google OAuth credentials

5. **Run the development server:**

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Deployment

Deploy to Vercel:

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add your environment variables
4. Deploy!

## Project Structure

```
/app
  /browse          - Browse and search prompts
  /prompt/[id]     - Individual prompt detail page
  /create          - Create new prompt form
  /profile         - User favorites page
  /auth/callback   - Auth callback handler
/components        - Reusable UI components
/lib/supabase      - Supabase client utilities
```

## Features Roadmap

- [ ] Stripe integration for Pro prompts
- [ ] AI generation endpoint (Kie.ai / OpenAI)
- [ ] User profiles and prompt collections
- [ ] Advanced filtering (tags, date, model)
- [ ] Prompt remix functionality
- [ ] Community ratings and comments

## License

MIT



