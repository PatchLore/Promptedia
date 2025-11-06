# 🎧 On Point Prompt ↔ Soundswoop Integration Plan

## Overview

On Point Prompt hosts prompt metadata (title, category, tags, prompt text, image, optional audio_url).

Soundswoop generates AI music tracks and stores them in Supabase with their own metadata.

The goal is to connect the two apps so each Music prompt can display or trigger its matching Soundswoop audio.

---

## Phase 1 — Simple Cross-Link (✅ Current)

- Each Music prompt links to Soundswoop's `/create?prompt=<prompt text>`

- Soundswoop loads that prompt into its generator field automatically.

- No shared database connection needed yet.

**Implementation:**
- Music prompt detail page shows "Try this prompt in Soundswoop →" button
- Links to: `https://www.soundswoop.com/create?prompt=${encodeURIComponent(prompt.prompt)}`
- Clean UI with placeholder message when no audio preview exists

---

## Phase 2 — Shared Audio Data

- Add `audio_url` field in On Point Prompt's `prompts` table (or use existing `example_url`).

- When Soundswoop generates a track from an On Point Prompt prompt:

  - It POSTs the audio_url and metadata back to On Point Prompt API endpoint:

    `/api/prompts/update-audio`

  - On Point Prompt updates `prompts.audio_url` (or `example_url`) and sets `has_preview = true` (optional flag).

**Database Schema Addition:**
```sql
-- Optional: Add audio_url field if not using example_url
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS audio_url TEXT;
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS has_audio_preview BOOLEAN DEFAULT false;
```

**API Endpoint:**
```
POST /api/prompts/update-audio
Body: {
  "prompt_id": "...",
  "audio_url": "...",
  "duration": 30,
  "source": "soundswoop"
}
Response: { success: true }
```

---

## Phase 3 — Unified Profiles and Credit System

- Shared Supabase instance or linked `user_id` keys.

- Users who generate on Soundswoop see their prompts synced to On Point Prompt's "Created By" field.

- Optional credit system: "Generate preview (costs 12 credits)".

**Features:**
- User authentication sync between apps
- Shared credit/wallet system
- User-generated prompts appear in both apps
- Attribution linking

---

## Phase 4 — Cross-App Analytics & Recommendations

- Track most generated music prompts in Soundswoop → highlight on On Point Prompt's homepage.

- Add "Top Trending Soundswoop Tracks" carousel.

**Features:**
- Analytics dashboard showing popular prompts
- Trending section on On Point Prompt homepage
- Cross-app recommendations based on generation frequency
- User engagement metrics

---

## API Design Notes

**On Point Prompt endpoint:**

```
POST /api/prompts/update-audio
Headers: {
  Authorization: Bearer <service_role_key>
}
Body: {
  "prompt_id": "uuid",
  "audio_url": "https://...",
  "duration": 30,
  "source": "soundswoop",
  "metadata": {
    "model": "suno-v3",
    "bitrate": "192kbps"
  }
}
Response: {
  "success": true,
  "prompt": { ... }
}
```

**Soundswoop Callback:**
- After generating audio, Soundswoop calls On Point Prompt API
- Can use webhook or direct API call
- Includes prompt text matching for linking

---

## Security

- Use Supabase service role key on Soundswoop server side for direct updates.

- Ensure only approved prompts can receive audio links.

- Rate limiting on API endpoint.

- Validate prompt_id exists and matches prompt text.

**Security Measures:**
```typescript
// Validate prompt exists
const { data: prompt } = await supabase
  .from('prompts')
  .select('id, prompt')
  .eq('id', prompt_id)
  .single();

if (!prompt) {
  return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
}

// Optional: Verify prompt text matches (if Soundswoop sends it)
if (promptText && prompt.prompt !== promptText) {
  return NextResponse.json({ error: 'Prompt mismatch' }, { status: 400 });
}
```

---

## Future Vision

- One shared creative ecosystem:

  **On Point Prompt** → inspiration + prompt discovery  

  **Soundswoop** → generation + playback  

- Unified "Generate" button works across both apps

- Seamless user experience where prompts flow between platforms

- Shared user base and credit system

- Cross-platform analytics and insights

---

## Implementation Checklist

### Phase 1 (Current)
- [x] Add Soundswoop link button to Music prompts
- [x] Handle missing audio preview gracefully
- [x] Clean UI with branded footer

### Phase 2 (Next)
- [ ] Add `audio_url` field to prompts table (or use `example_url`)
- [ ] Create `/api/prompts/update-audio` endpoint
- [ ] Implement validation and security
- [ ] Update Soundswoop to call On Point Prompt API after generation
- [ ] Test audio playback on prompt detail page

### Phase 3 (Future)
- [ ] Shared user authentication
- [ ] Credit system integration
- [ ] User profile sync
- [ ] Attribution tracking

### Phase 4 (Future)
- [ ] Analytics dashboard
- [ ] Trending prompts section
- [ ] Cross-app recommendations
- [ ] Engagement metrics

---

## Technical Notes

- **Audio URL Storage:** Currently using `example_url` field, but can add dedicated `audio_url` field for clarity
- **Audio Format:** Support MP3, WAV, OGG formats
- **CDN:** Consider using Supabase Storage or external CDN for audio files
- **Caching:** Cache audio URLs to reduce API calls
- **Error Handling:** Graceful fallback if Soundswoop API is unavailable

---

## Testing

1. **Phase 1 Testing:**
   - Verify Soundswoop link opens with correct prompt text
   - Check UI on Music prompts without audio
   - Test responsive design

2. **Phase 2 Testing:**
   - Test API endpoint with valid/invalid data
   - Verify audio playback works
   - Test error handling

3. **Integration Testing:**
   - End-to-end flow: On Point Prompt → Soundswoop → Audio generation → Back to On Point Prompt
   - User authentication sync
   - Credit system transactions



