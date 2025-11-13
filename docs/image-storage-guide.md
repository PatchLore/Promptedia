# 📘 OnPointPrompt — Image Storage & Integration Guide (Supabase Buckets)

This document explains how all images in OnPointPrompt should be stored, uploaded, and integrated using Supabase Storage.

It covers:

- Bucket structure
- Uploading images
- Getting URLs
- Adding them to database rows
- Displaying them in PackCard, PromptCard, Pack Detail, Buy Page
- Fallback handling

Use this as the official workflow for all image-related assets in the project.

---

## 🎯 1. Storage Buckets Overview

We store all project images in Supabase Storage using the following buckets:

| Bucket Name | Purpose |
|------------|---------|
| `packs` | Pack cover images |
| `prompts` | Prompt preview images |
| `categories` | Category icons (writing, art, music, etc.) |
| `branding` | Logos, hero images, banners |
| `art_images` | Optional — AI art outputs |
| `audio_previews` | Optional — audio previews |

### ✔ All buckets should be **public**

This allows images to load without authentication.

### ✔ MIME types: "Any"

This avoids issues when uploading JPG/PNG/WebP.

---

## 🎯 2. Creating the Buckets

In Supabase:

1. Go to **Storage** → **Create Bucket**
2. Name the bucket (e.g., `packs`)
3. Enable **Public bucket**
4. **Create**

Repeat for each:

- `packs`
- `prompts`
- `categories`
- `branding`
- (optional) `art_images`
- (optional) `audio_previews`

That's all — the bucket is ready.

---

## 🎯 3. Uploading Images to Supabase

Inside each bucket (e.g., `packs`):

1. Click **Upload File**
2. Choose your image (JPG, PNG, WebP)
3. After upload, click the image
4. Copy the **Public URL**

**Example:**

```
https://yourproject.supabase.co/storage/v1/object/public/packs/creators-pack.jpg
```

This is the value you put into your database.

---

## 🎯 4. Adding Image URLs to Your Database

### For Pack Images

Go to:
**Supabase → Table Editor → packs → Edit Row**

Set:

```
image_url = <your Supabase public URL>
```

Do this for each pack.

### For Prompt Images (if applicable)

Set:

```
image_url = <supabase URL>
```

### For Category Icons

Set:

```
icon_url = <supabase URL>
```

Once URLs are in the DB, the site dynamically loads them.

---

## 🎯 5. Displaying Images in the UI

### PackCard

```tsx
<img
  src={pack.image_url || "https://placehold.co/600x400?text=Pack+Image"}
  alt={pack.title}
  className="w-full h-48 object-cover rounded-xl shadow-sm"
/>
```

### Pack Detail Page (`/packs/[slug]`)

```tsx
{pack.image_url && (
  <img
    src={pack.image_url}
    alt={pack.title}
    className="w-full rounded-xl shadow mb-6"
  />
)}
```

### Buy Page (`/buy/[slug]`)

```tsx
<img
  src={pack.image_url || "https://placehold.co/600x400"}
  className="w-full rounded-xl shadow mb-4"
/>
```

---

## 🎯 6. Optional: Fallback Helper Function

Create file: `lib/getImageUrl.ts`

```typescript
export function getImageUrl(url?: string) {
  return url || "https://placehold.co/600x400?text=Image";
}
```

Then use:

```tsx
<img src={getImageUrl(pack.image_url)} />
```

This guarantees your UI never breaks because of missing images.

---

## 🎯 7. Why We Use Supabase Storage (Not `/public` Folder)

- ✔ Images load from a global CDN
- ✔ No redeploy required when changing images
- ✔ Keeps your Git repo small
- ✔ Scales to thousands of images
- ✔ Works perfectly for future user uploads
- ✔ Clean separation of assets by type

This is the professional set-up for any content-heavy SaaS.

---

## 🎯 8. Recommended File Naming

### Inside `packs` bucket:

```
creators-pack.jpg
music-pack.jpg
midjourney-pack.jpg
productivity-pack.jpg
```

### Inside `categories` bucket:

```
writing-icon.png
art-icon.png
music-icon.png
productivity-icon.png
```

### Inside `prompts` bucket:

```
prompt-123.jpg
prompt-456.jpg
```

---

## 🎯 9. FULL Workflow Summary

1. Generate your pack/category images (Midjourney/Krea/etc.)
2. Upload them to the correct Supabase bucket
3. Copy the public URL
4. Add it to `image_url` in your Supabase tables
5. UI automatically displays them using PackCard, PromptCard, etc.
6. Fallback images prevent any UI breaks

---

## 🎉 Done: Supabase Storage Integrated for All Images

This structure is ready for:

- Pack store
- Search thumbnails
- Category hubs
- Prompt galleries
- User uploads later
- SEO image previews
- Social sharing OG image previews

Your app is now set up with a proper scalable media system.

---

## 📝 Implementation Notes

### Current Implementation Status

✅ **Helper Function**: `lib/getImageUrl.ts` created  
✅ **PackCard**: Uses `getImageUrl(pack.image_url)`  
✅ **PromptCard**: Uses `getImageUrl()` for fallback  
✅ **Pack Detail Page**: Uses `getImageUrl(pack.image_url)`  
✅ **Buy Page**: Uses `getImageUrl(pack.image_url)`  
✅ **OpenGraph Images**: All pages use `NEXT_PUBLIC_DEFAULT_OG_IMAGE` env var  

### Environment Variables

Set in `.env.local`:

```env
NEXT_PUBLIC_DEFAULT_OG_IMAGE=https://yourproject.supabase.co/storage/v1/object/public/branding/default-og.png
```

### Database Schema

The following columns store image URLs:

- `packs.image_url` — Pack cover images
- `prompts.thumbnail_url` — Prompt thumbnails
- `prompts.example_url` — Prompt example outputs
- `prompts.art_url` — Art-specific previews (optional)

All queries use `select("*")` or explicitly include these fields, so images are automatically fetched.

---

## 🔧 Troubleshooting

### Images not displaying?

1. Check the bucket is **public**
2. Verify the URL is correct (copy from Supabase Storage)
3. Check the database column has the URL stored
4. Verify `getImageUrl()` is being used for fallback

### Broken image URLs?

- Ensure URLs start with `https://`
- Check for typos in the Supabase project URL
- Verify the file exists in the bucket
- Use browser DevTools Network tab to see failed requests

---

## 📚 Related Files

- `lib/getImageUrl.ts` — Image URL helper with fallback
- `lib/constants.ts` — Shared constants including `DEFAULT_OG_IMAGE`
- `components/PackCard.tsx` — Pack card component with image
- `components/PromptCard.tsx` — Prompt card component with image
- `app/packs/[slug]/page.tsx` — Pack detail page
- `app/buy/[slug]/page.tsx` — Buy page

---

*Last updated: November 2024*

