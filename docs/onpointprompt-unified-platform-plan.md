# OnPointPrompt Unified Platform Plan

## 🎯 Overview

**OnPointPrompt** (formerly Promptopedia) now serves as a unified AI discovery and monetisation hub — combining prompts, models/tools, weekly content, paid packs, creative generators, and thematic directories (music, cocktails, etc.) into a single SEO-optimised web app.

**Tagline:** *Discover the best AI prompts, models, music styles, and creative tools — all in one place.*

**Core Sections:**

1. **/prompts** – Curated prompt library (formerly Promptopedia)
2. **/models** – AI models and tools directory (the Model Hub)
3. **/blog** – Content and “AI Tool of the Week” articles
4. **/packs** – Paid prompt/model bundles
5. **/cocktails** – AI Cocktail Generator (interactive, viral, and SEO-rich)
6. **/music** – Top 1000 AI music categories and genres (SEO content hub)
7. **/subscribe** – Newsletter and email growth funnel

---

## 🧠 Structure & Architecture

### Frontend

- Framework: **Next.js 15 (App Router)**
- Hosting: **Vercel**
- Styling: **Tailwind CSS + shadcn/ui**
- Analytics: **PostHog + Google Analytics**
- SEO: Dynamic meta tags, OpenGraph, JSON-LD schema per page

### Backend

- Database: **Supabase** (Postgres + Storage)
- Auth: Supabase Auth (optional email login for saving prompts/models)
- Payments: **Stripe Checkout** for packs and premium listings
- Newsletter: Supabase or external (ConvertKit / MailerLite)

---

## 🧩 Supabase Schema

### prompts

| Column         | Type      | Notes                      |
| -------------- | --------- | -------------------------- |
| id             | uuid      | PK                         |
| title          | text      | SEO title                  |
| slug           | text      | for /prompts/[slug]        |
| category       | text      | e.g., music, art, business |
| description    | text      | summary of prompt          |
| example_prompt | text      | full prompt text           |
| example_image  | text      | optional URL               |
| tags           | text[]    | searchable tags            |
| is_free        | boolean   | toggle for premium         |
| created_at     | timestamp | default now()              |

### models

| Column         | Type      | Notes                           |
| -------------- | --------- | ------------------------------- |
| id             | uuid      | PK                              |
| name           | text      | model name                      |
| slug           | text      | /models/[slug]                  |
| category       | text      | e.g., image, music, text, video |
| description    | text      | overview of what model does     |
| example_input  | text      | prompt example                  |
| example_output | text      | short output summary            |
| image_url      | text      | preview image                   |
| api_link       | text      | affiliate or external URL       |
| tags           | text[]    | searchable tags                 |
| is_featured    | boolean   | for homepage highlights         |
| created_at     | timestamp | default now()                   |

### blog_posts

| Column         | Type      | Notes                  |
| -------------- | --------- | ---------------------- |
| id             | uuid      | PK                     |
| title          | text      | post title             |
| slug           | text      | /blog/[slug]           |
| summary        | text      | short meta description |
| content        | text      | markdown body          |
| featured_image | text      | thumbnail              |
| category       | text      | e.g., Tool of the Week |
| published_at   | timestamp | optional               |

### packs

| Column      | Type      | Notes                 |
| ----------- | --------- | --------------------- |
| id          | uuid      | PK                    |
| title       | text      | Pack title            |
| slug        | text      | /packs/[slug]         |
| description | text      | Summary of contents   |
| price       | numeric   | e.g., 9.99            |
| file_url    | text      | Supabase storage link |
| is_featured | boolean   | homepage highlight    |
| created_at  | timestamp | default now()         |

### cocktails

| Column       | Type      | Notes                      |
| ------------ | --------- | -------------------------- |
| id           | uuid      | PK                         |
| name         | text      | AI-generated cocktail name |
| prompt       | text      | User input / vibe          |
| description  | text      | Recipe & story             |
| ingredients  | json      | Structured list            |
| method       | text      | Preparation steps          |
| flavour_tags | text[]    | fruity, smoky, etc.        |
| alcohol_base | text      | rum, gin, vodka, etc.      |
| image_url    | text      | AI image URL               |
| user_id      | uuid      | optional                   |
| created_at   | timestamp | default now()              |

### music_categories

| Column        | Type      | Notes                     |
| ------------- | --------- | ------------------------- |
| id            | uuid      | PK                        |
| name          | text      | Music genre/category name |
| slug          | text      | /music/[slug]             |
| description   | text      | SEO-rich description      |
| mood          | text      | e.g., energetic, relaxed  |
| origin        | text      | optional (decade, style)  |
| image_url     | text      | optional banner           |
| tags          | text[]    | searchable keywords       |
| example_track | text      | link or reference         |
| created_at    | timestamp | default now()             |

---

## 🧱 Page Layout Structure

### Home Page (/)

- Hero: "Discover the best AI prompts, tools, and packs."
- Featured sections:
  - Tool of the Week (from blog)
  - Top Models & Prompts (featured flag)
  - AI Cocktail Generator spotlight
  - Music Styles directory teaser
  - Prompt Packs CTA
  - Newsletter signup

### /prompts

- Filter by category/tags
- Grid of cards → detail page `/prompts/[slug]`
- SEO: title, meta, copy button, related prompts

### /models

- Filter by type (image, music, video, etc.)
- Cards with preview, tags, affiliate button
- Detail pages `/models/[slug]`

### /cocktails

- Hero: “Describe your vibe, and we’ll mix your perfect AI cocktail 🍸”
- Generation form → calls `/api/generate-cocktail`
- Grid of saved cocktails (image, tags, CTA)
- Detail pages `/cocktails/[slug]` with recipe + share tools

### /music

- Grid of 1000+ genres with thumbnail + short description
- `/music/[slug]` pages include:
  - Genre name + description + origin info
  - Mood descriptors + tags
  - Example tracks (linked to Soundswoop/Kie if available)
  - CTA: “Generate a song in this style on Soundswoop”

### /blog

- Weekly AI tool highlights
- Each post links to related models/prompts

### /packs

- Paid bundles (Stripe checkout)
- Download links gated by purchase

### /subscribe

- Newsletter opt-in → Supabase or ConvertKit table

---

## 💰 Monetisation Model

| Stream                | Description                         |
| --------------------- | ----------------------------------- |
| Prompt/Model Packs    | £5–£29 via Stripe checkout          |
| Affiliate Links       | Links to APIs or AI platforms       |
| Featured Listings     | £19–£99/mo for tool owners          |
| Sponsored Posts       | Paid “Tool of the Week” placement   |
| AdSense (later)       | Once organic traffic exceeds 30K/mo |
| Cocktail Packs        | Upsell curated recipe bundles       |
| Music Affiliate       | Soundswoop, Mubert, Kie referrals   |

---

## 🚀 Build Phases

### Phase 1 — Foundation (MVP)

- Create `/prompts`, `/models`, and `/cocktails` with Supabase schema
- Add basic grid + detail pages with SEO
- Seed 200+ prompts + 200+ models via CSV

### Phase 2 — Content Layer

- Add `/blog` (Tool of the Week posts)
- Add dynamic OG + JSON-LD
- Newsletter signup section
- Implement `/api/generate-cocktail` + `/cocktails` UX
- Integrate PostHog tracking for cocktail generations
- Stand up `/music` directory, seed 200+ genres

### Phase 3 — Monetisation

- Add `/packs` with Stripe checkout
- Add affiliate redirects (track clicks)
- Launch “Cocktail Recipe Pack” upsell on cocktails pages
- Add rate limits (3 free generations/day) + Supabase RLS for cocktails
- Expand music categories to 1,000 entries with SEO copy

### Phase 4 — Growth

- Add featured listings & sponsorships
- Expand CSV import to 1,000+ entries
- Implement sitemaps + schema markup for SEO
- Backlink outreach around music + cocktail hubs
- Launch embeddable widgets for partners

---

## 🧭 Summary

**OnPointPrompt** evolves from Promptopedia into a full-scale AI discovery and monetisation hub, housing prompts, models, tools, weekly content, premium packs, and an immersive AI cocktail generator under one SEO-rich brand.

**One platform. One brand. Endless AI discovery.**


# OnPointPrompt YouTube & Shorts Content Plan

## 🎯 Goal

Turn **OnPointPrompt** into a viral video channel that drives traffic, SEO, and brand recognition by showcasing AI generations (cocktails, prompts, art, tools) through short, engaging videos.

**Main Platforms:** YouTube Shorts, TikTok, Instagram Reels

**Posting Frequency:** 3–5 shorts per week

**Average Length:** 15–30 seconds

**Goal:** Grow traffic to OnPointPrompt.com and sell prompt/model packs via links in bio & pinned comments.

---

## 🍸 Core Series Concepts

### 1️⃣ **“AI Made This Drink”** (Cocktail Generator)

* **Hook:** “I asked AI to make me a cocktail based on [mood/vibe]. Here’s what it came up with.”
* **Flow:**
  1. Show prompt on screen.
  2. Screen capture generation or animation of AI processing.
  3. Reveal cocktail name + image + ingredients.
  4. End with callout: “Try your own on OnPointPrompt.com/cocktails.”

**Example Prompts:**

* “A cocktail for heartbreak.” → *Crimson Remedy* ❤️‍🔥
* “A drink for a neon cyberpunk bar.” → *Electric Mirage* ⚡
* “AI invented a Christmas cocktail — it’s insane.” 🎄

**Hashtags:** `#AICocktail #AIDrinks #AIGenerated #OnPointPrompt #CocktailGenerator #BartenderAI`

---

### 2️⃣ **“Prompt vs Result”** (General AI Showcase)

* **Hook:** “I told AI to [create something weird] — here’s what it made.”
* **Flow:** Text prompt → AI generation reveal → quick zoom on details.

**Examples:**

* “Design a house for cats.” 🐈
* “Invent a futuristic city underwater.” 🌊
* “Make a logo for a time travel café.” ⏳

**Hashtags:** `#AIArt #PromptVsResult #AICreativity #OnPointPrompt #AIGenerated`

---

### 3️⃣ **“AI Tool of the Week”** (Blog Companion)

* **Hook:** “This AI tool can [do X] — and it’s free to try.”
* Show quick demo or results.
* End with: “Full write-up on OnPointPrompt.com/blog.”

**Examples:**

* “This AI writes songs in your voice.”
* “Generate 4K images from text in seconds.”

**Hashtags:** `#AITools #AIDiscovery #AIInnovation #OnPointPrompt`

---

### 4️⃣ **“Can AI Beat the [Human/Expert]?”**

* Compare AI generations to real creations (e.g., AI vs bartender, AI vs designer).
* **Hook:** “Who did it better — the AI or the pro?”

**Examples:**

* “AI vs real bartender — tropical drink showdown.”
* “AI vs designer: who made the better album cover?”

**Hashtags:** `#AIvsHuman #AIGenerated #Challenge #OnPointPrompt`

---

## 📅 Posting Schedule

| Day       | Theme                 | Example                                            |
| --------- | --------------------- | -------------------------------------------------- |
| Monday    | AI Prompt vs Result   | “AI imagined a beach in the clouds.”               |
| Wednesday | AI Tool of the Week   | “This tool generates full websites from one line.” |
| Friday    | AI Cocktail Generator | “I asked AI to make a Halloween cocktail.”         |
| Sunday    | Experimental / Funny  | “AI invented a drink for introverts.”              |

---

## 🧠 Script Template (Shorts Format)

**Hook (0–3s):** Present the idea / prompt.

**Action (3–15s):** Show AI generation or time-lapse.

**Reveal (15–25s):** Show result name + visual + quick reaction.

**CTA (25–30s):** “Try your own at OnPointPrompt.com.”

---

## 🎨 Visual Style & Branding

* **Aspect Ratio:** 9:16 (mobile-first)
* **Resolution:** 1080x1920 or higher
* **Font:** Modern sans-serif (Inter / Poppins)
* **Color Palette:** Pull from OnPointPrompt brand — neon blues, magentas, soft gradients.
* **Captions:** Auto or stylised with emojis for mood.
* **Music:** Upbeat, lo-fi, or trending TikTok tracks.

---

## 📈 Growth & Monetisation

| Channel        | Purpose          | Monetisation               |
| -------------- | ---------------- | -------------------------- |
| YouTube Shorts | Primary reach    | AdSense + affiliate links  |
| TikTok         | Viral visibility | Link to site & packs       |
| Instagram      | Aesthetic appeal | Drive to newsletter & site |

**Cross-Link:** Always link to OnPointPrompt in bio + pinned comment.

**Upsell CTA:** “Get the full prompt pack → OnPointPrompt.com/packs.”

---

## 🧭 Summary

**Why it works:**

* Highly visual, instantly rewarding format.
* Drives organic traffic + SEO for OnPointPrompt.
* Recycles your AI generations into viral micro-content.

**Outcome:**

A consistent flow of short-form AI videos that attract new users, sell prompt/model packs, and position OnPointPrompt as *the home of creative AI inspiration.*


# OnPointPrompt Backlink Growth Strategy

## 🎯 Goal

Build steady, high-quality backlinks to increase OnPointPrompt’s domain authority, SEO visibility, and referral traffic. **Target:** 200+ quality backlinks in 6 months through consistent weekly activity.

---

## ⚙️ Why Backlinking Matters

- Backlinks act as trust signals to Google and AI search engines.
- A few dozen real, relevant links can lift rankings across all sections (`/prompts`, `/models`, `/music`, `/cocktails`, `/blog`).
- Focus on quality, relevance, and consistency — not spam.

---

## 🔗 Five-Channel Backlink Strategy

### 1️⃣ Reddit (Fastest Traction)

- **Goal:** Generate organic discussions that include OnPointPrompt links.
- **Communities:** `r/aigenerated`, `r/ArtificialIntelligence`, `r/AItools`, `r/SideProject`, `r/LoFi`, `r/Cocktails`
- **Cadence:** Post 1–2x per week as showcases (not sales).
- **Example Post:** “Built this free AI cocktail generator that invents drinks based on your mood 🍸 — feedback welcome!”
- **CTA:** `[Try it here](https://www.onpointprompt.com/cocktails)`
- **Target:** 10–20 genuine Reddit backlinks per month.

### 2️⃣ Medium & LinkedIn Articles

- **Goal:** Earn strong contextual backlinks through content.
- **Cadence:** Publish 1 article/week (dual-post on Medium + LinkedIn).
- **Topic Ideas:** “10 AI Tools That Blew My Mind This Week”; “How I Built an AI Cocktail Generator Using GPT + Seedream”
- **Placement:** Link inside the body (avoid footers).
- **Outcome:** 1–2 backlinks per article with long-tail keyword coverage.

### 3️⃣ Directory & Community Submissions

- **Goal:** Acquire authority backlinks from trusted AI directories.
- **Targets:** FutureTools.io, TheresAnAIForThat.com, AIToolHunt.com, IndieHackers.com/products, ProductHunt.com (launch).
- **Pace:** 1 submission/week.
- **Outcome:** 10–20 directory links in the first 3 months plus referral traffic.

### 4️⃣ Guest Mentions & List Swaps

- **Goal:** Earn backlinks from other AI creators and blogs.
- **Approach:** Reach out to small AI newsletters/blogs, propose mutual features.
- **Pitch Example:** “I run OnPointPrompt, an AI hub listing 1,000+ tools and prompts. Want to swap a feature or backlink?”
- **Outcome:** 1–2 partnerships per month → 10–15 backlinks over 6 months.

### 5️⃣ Social SEO Cross-Posting

- **Goal:** Build indexed social backlinks and referral clicks.
- **Execution:** Every YouTube Short/TikTok includes onpointprompt.com in caption or pinned comment; posts on X & LinkedIn include the link inline.
- **Brand Tags:** `#OnPointPrompt`, `#AIPrompts`, `#AItools`
- **Outcome:** 20–30 backlinks over 6 months.

---

## 🗓️ Weekly Backlink Routine

| Day     | Task                                     | Result         |
| ------- | ---------------------------------------- | -------------- |
| Monday  | Post 1 Reddit showcase                    | 1 backlink     |
| Wednesday | Publish 1 Medium or LinkedIn article   | 1–2 backlinks  |
| Friday  | Submit 1 new directory or guest request  | 1 backlink     |
| Sunday  | Upload 1 Short/Reel with site link       | 1 social link  |

**Goal:** 4–5 backlinks per week → ~200 per year (sustained).

---

## ⚙️ Tools to Track Progress

- **Ahrefs Webmaster Tools (free):** backlink monitoring
- **Google Search Console:** index status & link growth
- **PostHog / GA4:** referral traffic from Reddit, Medium, etc.

---

## 🧭 Golden Rules

- Avoid spammy link schemes; focus on natural placements.
- Mix formats: contextual, social, directory, community.
- Create useful, visual, shareable assets that earn links organically.

---

## 📈 Expected Results

| Timeframe | Domain Authority | Monthly Traffic Uplift |
| --------- | ---------------- | ---------------------- |
| Month 1   | 5–10             | 1K–3K visits           |
| Month 3   | 15–25            | 5K–10K visits          |
| Month 6   | 30–40            | 25K–50K visits         |

**Outcome:** Compounding SEO growth and higher rankings across all OnPointPrompt sections through sustained backlink building.

