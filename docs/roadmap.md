# 🚀 On Point Prompt — Vision & Development Roadmap

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

- **Newsletter / Prompt of the Week** (via Resend)

- **Analytics Dashboard** (via PostHog or Supabase analytics)



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

On Point Prompt acts as the discovery layer.  

Soundswoop acts as the generation layer.  

Dreamify acts as the reflection layer (AI dreams, stories, imagination).  



Together they form a **creative AI network** powered by shared Supabase infrastructure, unified auth, and cross-app recommendations.



---

## 🧭 Phase-by-Phase Roadmap Summary



| Phase | Focus | Key Deliverables |

|--------|--------|------------------|

| **v1.1** | UX & SEO Polish | Search, filters, featured prompts, prompt summaries |

| **v1.2** | User Features | Favorites, submissions, newsletter |

| **v1.3** | Audio & Ecosystem Integration | Soundswoop linking, prompt packs |

| **v2.0** | Monetization | Pro plans, creator marketplace |

| **v3.0+** | Full Ecosystem | Unified accounts, generation pipelines, AI recommendations |



---

## 🏁 Conclusion

On Point Prompt is not just a prompt library — it's the **creative engine of your ecosystem**.  

A hub for discovery, education, and generation — designed to inspire creators and link directly into tools like Soundswoop.  

Every new feature deepens the creative experience and builds toward a shared AI-powered universe for sound, art, and imagination.



---



