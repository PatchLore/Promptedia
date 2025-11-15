# 🚀 On Point Prompt — Vision & Development Roadmap (Updated)

## 🌍 Overview

On Point Prompt is an evolving creative AI library — a living encyclopedia of prompts across multiple disciplines (Art, Music, Writing, Coding, and Business).  

Its mission is to become the ultimate **creative discovery hub** — where users can explore, generate, and share ideas through prompts that spark imagination across text, image, audio, and code.



The long-term vision is to unify all creative AI experiences under one ecosystem — connected with **Soundswoop**, **Dreamify**, and future creative tools.



---

## 🎨 Core Concept

> "Describe a vibe — get sound, art, or words."



On Point Prompt bridges inspiration and generation.  

Each category serves as a starting point for creativity:

- **Art** → visual imagination (Leonardo.Ai / Kie.ai)

- **Music** → sonic inspiration (Soundswoop)

- **Writing** → storytelling & poetry prompts

- **Coding** → reusable dev and automation snippets

- **Business** → startup, SaaS, and marketing ideas



---

## 🧱 Current Foundation (v1.0)

- ✅ 100 curated prompts across 5 categories  

- ✅ Public images auto-fetched via Unsplash API  

- ✅ Supabase database + admin dashboard  

- ✅ Category-based UI for browsing  

- ✅ Music section linked with "Try in Soundswoop" CTA  

- ✅ Ready for SEO indexing and public launch



---

## 💡 Near-Term Improvements (v1.1)

### 🔍 User Experience

- Add **search**, **filter**, and **sort** options (category, tags, newest, most liked)

- Add **featured prompts** section on homepage

- Improve card design (hover preview, gradient overlay, tag highlights)

- Category icons and color-coded accents



### ✏️ Content Expansion

- Add `summary`, `use_case`, and `popularity_score` fields to each prompt

- Script automatic summary generation via GPT API

- Group prompts into **"Prompt Packs"** (AI Writing Starter Pack, Visual Design Kit, etc.)



### 🎧 Audio Integration (Phase 1)

- Keep "No audio preview yet" message with link to Soundswoop

- Add `/docs/soundswoop-integration.md` for full merge plan

- Optional manual audio_url support for featured Music prompts



---

## ⚙️ Mid-Term Features (v1.2–v1.3)

- **User Accounts & Favorites**: Save prompts, build collections

- **Prompt Submissions**: User-generated prompts stored in `pending_prompts`

- **Admin Review Queue** for moderation

- **Weekly Spotlight Features**: AI Tool of the Week + Prompt of the Week (see detailed implementation plan below)

- **Newsletter Integration** (via Resend) — Weekly email combining featured tool + prompt

- **Analytics Dashboard** (via PostHog or Supabase analytics)



---

## 🧠 AI Tools Encyclopedia (Knowledge Layer)

**Status:** Planned  
**Priority:** High (Moved to v1.2 for early SEO and revenue impact)  
**Type:** Directory + Affiliate Engine + Knowledge Layer

### Overview

The AI Tools Encyclopedia is an integrated directory of AI applications, APIs, and creative platforms — turning On Point Prompt into a complete AI discovery hub where users can explore prompts and the tools to use them.

### Core Features

- Searchable, filterable list of AI tools (by category, tags, and price)
- Rich card layout (logo, description, tags, "Visit Tool" button)
- Optional affiliate URLs for monetisation
- Category filters: Art, Music, Writing, Business, Developer
- Integrated CTAs: "Try this prompt in [Tool Name]"
- Static `/ai-tools` page with SEO metadata and structured schema
- Supabase-backed `ai_tools` table for storage and updates

### MVP Scope (v1.2)

- Launch with 30-50 curated tools across 5 categories
- Basic search and category filtering
- Affiliate links where available
- Cross-link prompts to tools ("Try in [Tool]")
- Expand to 200+ tools in subsequent iterations

### Data Model

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Primary key |
| `name` | text | Tool name |
| `description` | text | Short summary |
| `category` | text | e.g. Music, Writing, Art |
| `tags` | text[] | e.g. ["Free", "API", "GPT-4"] |
| `website` | text | Official link |
| `affiliate_url` | text | Optional tracked link |
| `logo_url` | text | Image or favicon |
| `created_at` | timestamp | default now() |

### Monetisation & Growth

- Affiliate revenue from tool referrals
- SEO pages ("Best AI Tools for Designers", "Top Music AI Tools 2025")
- Newsletter integration ("Tool of the Week")
- Internal linking with Promptopedia, SaaSpertise, and Soundswoop

### Why It Fits the Vision

- Extends On Point Prompt beyond prompts into a full creative ecosystem.
- Strengthens SEO through evergreen "AI tool" content.
- Creates passive affiliate income.
- Serves as an educational reference layer for creators and entrepreneurs.

---

## ⭐ Weekly Spotlight Features (AI Tool & Prompt of the Week)

**Status:** Planned  
**Priority:** Medium  
**Type:** Engagement + Newsletter + SEO  
**Phase:** v1.2–v1.3

### Overview

Implement dual weekly spotlight features — "AI Tool of the Week" and "Prompt of the Week" — to drive engagement, newsletter signups, and affiliate revenue. Both features pull from Supabase tables, render on the homepage, and are ready for newsletter automation.

### Implementation Plan

#### 1. DATABASE (Supabase)

**Table: `ai_tool_of_the_week`**

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Primary key (default uuid_generate_v4()) |
| `tool_id` | uuid | References `ai_tools(id)` |
| `week_of` | date | Week start date (not null) |
| `highlight_reason` | text | Why this tool was featured |
| `featured_image` | text | Optional banner/hero image |
| `created_at` | timestamp | Default now() |

**Table: `prompt_of_the_week`**

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Primary key (default uuid_generate_v4()) |
| `prompt_id` | uuid | References `prompts(id)` |
| `week_of` | date | Week start date (not null) |
| `highlight_reason` | text | Why this prompt was featured |
| `featured_image` | text | Optional banner/hero image |
| `created_at` | timestamp | Default now() |

**Indexes:**
```sql
CREATE INDEX ON ai_tool_of_the_week (week_of);
CREATE INDEX ON prompt_of_the_week (week_of);
```

**RLS (Row Level Security):**
- Enable RLS on both tables
- Allow public SELECT
- Only admins can INSERT (future admin role)

#### 2. API ROUTES

**`/app/api/ai-tools/weekly/route.ts`**

- **GET** → Returns the latest featured AI tool of the week:
  ```sql
  SELECT * FROM ai_tool_of_the_week
  JOIN ai_tools ON ai_tool_of_the_week.tool_id = ai_tools.id
  ORDER BY week_of DESC LIMIT 1
  ```
- **POST** (optional) → Admins can add new weekly features

**`/app/api/prompts/weekly/route.ts`**

- **GET** → Returns the latest featured prompt of the week:
  ```sql
  SELECT * FROM prompt_of_the_week
  JOIN prompts ON prompt_of_the_week.prompt_id = prompts.id
  ORDER BY week_of DESC LIMIT 1
  ```
- **POST** (optional) → Admins can add new weekly features

#### 3. COMPONENTS

**`/components/WeeklyToolCard.tsx`**

Props:
- `name` — Tool name
- `logo_url` — Tool logo/banner
- `highlight_reason` — Why it's featured
- `affiliate_url` — Affiliate link (or website)
- `featured_image` — Optional hero image

Features:
- Card titled "AI Tool of the Week"
- Logo/banner display
- Short highlight reason
- "Try It" button linking to affiliate_url or website

**`/components/WeeklyPromptCard.tsx`**

Props:
- `title` — Prompt title
- `description` — Prompt description
- `highlight_reason` — Why it's featured
- `thumbnail_url` — Thumbnail or gradient backdrop
- `slug` — Prompt slug for routing

Features:
- Card titled "Prompt of the Week"
- Thumbnail or gradient backdrop
- Short blurb (highlight_reason)
- "View Prompt" button → `/prompt/[slug]`
- Optional "Generate in Soundswoop" CTA for music prompts

#### 4. FRONTEND INTEGRATION

**Homepage (`app/page.tsx`)**

- Import both `WeeklyToolCard` and `WeeklyPromptCard`
- Fetch from:
  - `/api/ai-tools/weekly`
  - `/api/prompts/weekly`
- Display both cards below hero or in a two-column layout
- Add CTAs:
  - "View All Tools → `/ai-tools`"
  - "Explore All Prompts → `/prompts`"

#### 5. DETAIL PAGES (Optional)

**`/app/ai-tools/weekly/[slug]/page.tsx`**
**`/app/prompts/weekly/[slug]/page.tsx`**

- Display full feature details
- Include breadcrumbs and SEO metadata:
  - `title = "AI Tool of the Week — ${tool.name}"`
  - `title = "Prompt of the Week — ${prompt.title}"`

#### 6. NEWSLETTER / FUTURE AUTOMATION (TODO)

- Add Resend email template combining both:
  - Subject: "This Week in AI — Featured Tool + Prompt"
  - Body: Cards with affiliate links and "Try Now" buttons
- Later automation:
  - Pick top viewed tool and prompt each week (based on PostHog metrics or Supabase counters)

#### 7. TESTING

- Confirm both API endpoints return valid data
- Ensure homepage renders both weekly cards
- Run `npm run build` to verify type safety

### Expected Result

Adds dual weekly spotlight features — "AI Tool of the Week" and "Prompt of the Week". Both pull from Supabase tables, render on the homepage, and are ready for newsletter or SEO expansion.

---

## 🎼 Genre Explorer Module (Music Discovery + AI Integration)

**Status:** Planned  
**Priority:** Medium–High  
**Type:** Traffic Engine + AI Integration + SEO Growth

### Overview

The Genre Explorer is a large-scale, SEO-driven content engine powered by free public music data. It aggregates genres, subgenres, and top tracks using openly accessible datasets (MusicBrainz, Wikipedia, Discogs) and connects them directly to On Point Prompt’s AI music generation tools. This creates a two-way funnel where free organic traffic built on lists and rankings converts into AI-generated sound prompts.

### Core Features

- ✅ Genre index page covering 500–1000+ music genres
- ✅ Dynamic top-100 track listings per genre
- ✅ Subgenre breakdown with descriptions
- ✅ Links to YouTube and Spotify for previews
- ✅ Integrated AI music prompt suggestions
- ✅ Calls-to-action to generate music in the genre
- ✅ Structured metadata for SEO
- ✅ Cached/static pages for high performance
- ✅ Related genres to strengthen internal linking

### Data Sources (Free & Safe)

- MusicBrainz API (Free, no key required)
- Wikipedia genre and discography pages
- Discogs public endpoints (basic usage)
- Last.fm (scrapable lists, optional)

All data is community-maintained and usable under open licenses.

### User Flow

1. User lands on `/genres`.
2. User selects a genre (e.g., Trance).
3. Genre page loads with description, subgenres, top 100 tracks, and major artists.
4. Each section features a "Generate AI music in this style" CTA.
5. Clicking the CTA routes the user to the On Point Prompt music generator to create, save, or download AI previews.

### SEO & Growth Strategy

- High-value SEO content for every genre page.
- Optimised titles such as "Top 100 Trance Tracks of All Time."
- Long-tail keyword coverage with strong internal linking.
- Embedded structured schema: `MusicPlaylist`, `MusicGroup`, `CreativeWork`.
- Ideal for ad inventory and affiliate monetisation.

### Monetisation Opportunities

- Ads on high-traffic genre lists.
- Music gear affiliate links (Amazon, Thomann, etc.).
- "Pro Producer Prompt Packs" upsell.
- AI music credit consumption inside Soundswoop.
- Newsletter signups (e.g., "Best Tracks of Each Genre").
- Artist-focused prompt packs that avoid copyrighted assets.

### Planned Technical Implementation

- Next.js static generation with ISR for scalable publishing.
- Supabase tables for caching genre, subgenre, and track data.
- Hierarchical data model (Genre → Subgenre → Track).
- Lightweight scraping and normalisation scripts.
- Automatic prompt generation via AI from genre metadata.
- External preview links only (YouTube, Spotify) to avoid hosting copyrighted audio.

### Why It Fits the Vision

- Expands On Point Prompt’s content depth and authority.
- Leverages free data sources with no API overhead.
- Captures evergreen organic traffic that feeds Soundswoop usage.
- Converts visitors into AI creators through contextual prompts.
- Strengthens long-term positioning in the AI music niche.

---

## 🤖 OnPointPrompt – AI Expert Persona Library (Option B)

**Status:** Planned  
**Priority:** High  
**Type:** Product Expansion + Retention Engine + Premium Monetization  
**Phase:** v2.0–v2.5

### Overview

The AI Expert Persona Library introduces a new, high-value feature to OnPointPrompt: a collection of specialised AI assistants designed to provide expert-level guidance, advice, content, and problem-solving across a wide range of industries and use cases. Each persona is powered by advanced prompt engineering, curated knowledge structures, and unique personalities—making them feel like dedicated virtual specialists users can return to daily.

This expands OnPointPrompt from a prompt discovery tool into a broader AI Productivity Ecosystem, offering built-in chat experiences, specialist workflows, and persona-driven automation.

### 🎯 Core Purpose

To allow users to select from a library of AI Specialist Personas—each with deep expertise in a specific field—and receive tailored responses, workflows, and actionable guidance.

This creates a more immersive and results-focused experience than simply providing standalone prompts.

### 🚀 Why This Fits OnPointPrompt

- Leverages existing strength: prompt engineering expertise
- Naturally extends the platform beyond static content
- Increases daily active use
- Provides recurring value through continuous chat interactions
- Encourages upsells via premium personas and add-on modules
- Aligns with creator-, business-, and productivity-focused audiences

### 🧱 Core Features (MVP)

#### 1. Persona Library Interface

A clean grid of AI persona cards, each showing:

- Name
- Expertise area
- Short tagline
- Avatar
- Category (Business, Creative, Writing, Trades, Wellness, etc.)

Users click a persona → immediately open a dedicated chat page.

#### 2. Persona-Specific System Prompts

Each expert persona has:

- A custom system prompt
- A defined tone and personality
- A set of core capabilities
- Custom flows or mini-skills (e.g., SWOT analysis, SEO audits, ad copy tone presets)

Stored in Supabase for dynamic updates.

#### 3. Persona Chat UI

Each expert has its own dedicated chat environment:

- Avatar & colour theme
- Suggested actions / quick prompts
- Saved chat history (Pro feature)
- Export conversation (PDF/notes)

#### 4. Categories of Personas

Initial categories include:

**Business & Marketing**
- Business Growth Mentor
- Marketing Strategist
- SEO Specialist
- Sales Copywriter

**Creative & Content**
- YouTube Content Coach
- Social Media Planner
- Creative Director
- Script Writer

**Professional & Life**
- Career Advisor
- Productivity Coach
- Mindset & Lifestyle AI
- Therapist-Style Calm Guide

**Technical**
- Web Developer Helper
- AI Automation Agent
- UX/UI Consultant

**Trades & Local Business**
- Trades Business Advisor (ties in with FixBlox)
- Local SEO Specialist
- Google Business Profile Expert

#### 5. Suggested Prompts

Each persona page begins with:

- Suggested questions
- Task workflows
- Scenario-based prompt buttons

E.g., for Marketing Strategist:
- "Create a content plan for my business"
- "Write 5 Instagram captions"
- "Analyse my brand tone"

#### 6. Favourites & Collections

Users can save:

- Favourite personas
- Favourite conversations
- Favourite prompts from within a persona

(Pro-tier unlocking)

### 🔥 Extended Features (Phase 2+)

#### 1. Voice Mode

Users can speak with personas in real time (OpenAI Realtime API).

#### 2. Persona Packs

Sell bundles such as:

- "Creator Pack"
- "Entrepreneur Pack"
- "Agency Pack"
- "Trades Pack"

#### 3. Custom User Personas

Users create and publish their own personas for others to use.

#### 4. Marketplace

Creators sell premium personas.

OnPointPrompt takes a revenue cut (10–30%).

#### 5. Task Automations

Each persona can:

- Generate content
- Analyse files
- Produce reports
- Export templates
- Create step-by-step plans

#### 6. Multi-Agent Mode

Users can have two or more personas interact to solve complex problems collaboratively (e.g., "SEO Expert + Copywriter + Social Strategist").

### 🧩 Technical Architecture (MVP)

#### Database Tables

**`personas`**
- `id` (uuid)
- `name` (text)
- `avatar_url` (text)
- `description` (text)
- `system_prompt` (text)
- `categories` (text[])
- `is_premium` (boolean)
- `personality_style` (text)
- `created_at` (timestamp)

**`persona_sessions`**
- `id` (uuid)
- `user_id` (uuid, references users)
- `persona_id` (uuid, references personas)
- `messages` (jsonb array)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**`persona_messages`**
- `id` (uuid)
- `session_id` (uuid, references persona_sessions)
- `role` (text: user/ai/system)
- `content` (text)
- `timestamp` (timestamp)

### 🛠️ Development Phases

#### Phase 1 — Prototype (3–5 days)

- Persona DB + seeds
- Persona list page
- Persona chat UI
- Basic OpenAI integration
- Session saving
- Suggested prompts

#### Phase 2 — Productisation (1–2 weeks)

- Add categories
- Add Pro personas
- Add saved histories
- Add favourites
- Add improved UI/UX
- Deploy & test

#### Phase 3 — Expansion (1–2 months)

- Voice mode
- File uploads
- Marketplace
- Cross-persona collaboration
- Advanced workflow tools
- Mobile optimisation

### 💰 Monetisation Model

**Free tier**
- 5 basic personas
- Limited chats
- No voice mode
- No saved history

**Pro (£9–£19/mo)**
- Unlimited personas
- All categories
- Save chats
- Export content
- Priority AI model
- Premium persona access

**Creator Pro (£29–£49/mo)**
- Create your own personas
- Access marketplace tools
- Custom branding
- Higher model limits

### 🎯 Strategic Importance

This feature:

- Raises OnPointPrompt's retention dramatically
- Elevates the brand from a prompt library → AI assistant powerhouse
- Differentiates from competitors
- Opens new revenue channels
- Integrates perfectly with your other apps (FixBlox, Soundswoop, AI Shorts Generator)

It positions OnPointPrompt as a core daily-use AI workspace, not just a browsing site.

### 🚀 Final Summary

The AI Expert Persona Library transforms OnPointPrompt into a full suite of specialised AI assistants. It enhances user value, increases daily engagement, opens premium monetisation paths, and creates a long-term scalable ecosystem. After building the fast, viral "AI Conversation Video Generator" as a separate project, this Expert Persona system becomes the natural next evolution of OnPointPrompt.

---
## 💰 Monetization Path (v2.0)

| Tier | Features |

|------|-----------|

| **Free** | Browse + copy public prompts |

| **Pro** | Unlock "Pro Packs", advanced filters, weekly drops |

| **Creator** | Submit and sell custom prompt packs (Stripe Connect) |



Optional expansion into:

- Affiliate integrations ("Try in Midjourney", "Run in Suno")

- Pay-per-download or credit-based generation system



---

## 🧠 Long-Term Vision (v3.0+)

On Point Prompt becomes the **Creative Operating System** for AI makers.



### Future directions:

- Unified authentication across all creative apps (On Point Prompt, Soundswoop, Dreamify)

- Real-time "Run Prompt" generation directly in-app

- Semantic search powered by embeddings

- AI-powered recommendation system ("Because you liked…")

- User profiles, collections, remixing, and community leaderboards

- "Prompt Battles" and weekly challenges



---

## 🧩 Technical Stack

- **Framework:** Next.js 15 (App Router)  

- **Database:** Supabase (Auth, Storage, RLS)  

- **Payments:** Stripe (Pro & Creator tiers)  

- **Image Source:** Unsplash API  

- **Email:** Resend (Newsletter)  

- **Analytics:** PostHog  

- **Deployment:** Vercel  



Optional AI integrations:

- OpenAI GPT (summaries & enrichment)

- Kie.ai (image/music generation)

- Suno / Riffusion (music previews)

- Leonardo.Ai (visual art generation)



---

## 🪄 Strategic Ecosystem

On Point Prompt acts as the discovery layer — now combining Prompt Library + AI Tools Encyclopedia.

Soundswoop acts as the generation layer.

Dreamify acts as the reflection layer (AI dreams, stories, imagination).

Together they form a **creative AI network** powered by shared Supabase infrastructure, unified auth, and cross-app recommendations.



---

## 🧭 Phase-by-Phase Roadmap Summary (Updated)

| Phase | Focus | Key Deliverables |
|--------|--------|------------------|
| **v1.1** | UX & SEO Polish | Search, filters, featured prompts, prompt summaries |
| **v1.2** | AI Tools Encyclopedia | `/ai-tools` page, Supabase table, search & affiliate integration (MVP: 30-50 tools) |
| **v1.3** | User Features | Favorites, submissions, newsletter |
| **v1.4** | Analytics + Engagement | PostHog events, Trending system |
| **v1.5** | Audio & Ecosystem Integration | Soundswoop linking, prompt packs |
| **v2.0** | Monetization | Pro plans, creator marketplace |
| **v3.0+** | Full Ecosystem | Unified accounts, AI recommendations, cross-app flows |



---

## 🌠 Future Expansion (v3.1–v4.0+)

The following concepts extend the platform beyond v3.0 into a multi-layered creative ecosystem — focusing on community, automation, education, and integrations.

### 1️⃣ AI Prompt Marketplace (Creator Economy Layer)

- User storefronts, prompt packs, reviews, and affiliate earnings
- Stripe Connect for payouts
- "Follow Creator" + leaderboard system

### 2️⃣ AI Workflow Builder (Automation Layer)

- Visual drag-and-drop builder for prompt pipelines
- Integrations with OpenAI, Leonardo, Suno, etc.
- Shareable templates and "Workflow of the Week"

### 3️⃣ Creative Hub / Community Layer

- "Remix This Prompt" + "Prompt Battles"
- Weekly challenges and leaderboards
- Social reactions, comments, and collaboration threads

### 4️⃣ AI Plugin / Browser Extension

- Chrome extension for instant prompt suggestions
- Context-aware recommendations inside ChatGPT or Gemini
- "Suggest Similar Prompts" and quick copy features

### 5️⃣ API & Developer Portal

- Public REST API endpoints for external devs
- API key system with usage tracking
- Developer documentation + SDK

### 6️⃣ AI Mood Mixer / Vibe Generator

- Single "Describe a vibe" interface generating music + art + text
- Uses Soundswoop + Seedream integration
- Shareable "Mood Cards" for virality

### 7️⃣ Educational Layer / Academy

- Free micro-courses ("How to write cinematic prompts")
- Tool tutorials and Pro-tier learning content
- "Prompt Mastery" certification system

### 8️⃣ AI Trend Index / Data Dashboard

- Live analytics of top prompts, genres, and tools
- "Trending This Week" and "Rising Tools" pages
- Powered by PostHog + Supabase views

### 9️⃣ Mobile App Companion

- React Native / Expo app for browsing and saving prompts
- Push notifications for new drops or packs

### 🔟 AI Branding Generator

- Combines image, music, and text prompts to output brand kits
- Ideal for business users and Pro-tier upsells

---

## 🏁 Conclusion

On Point Prompt is not just a prompt library — it's the **creative engine of your ecosystem**.  

A hub for discovery, education, and generation — designed to inspire creators and link directly into tools like Soundswoop.  

Every new feature deepens the creative experience and builds toward a shared AI-powered universe for sound, art, and imagination.



---



