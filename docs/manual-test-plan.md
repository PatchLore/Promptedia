# Manual Test Plan — Recent Enhancements

This checklist covers hands-on testing for the latest SEO, UI, and search improvements. Follow the sections that match the feature set you want to verify. Unless otherwise noted, testing is done against the Vercel preview or local dev build (`npm run dev`).

---

## 1. Search Bar Upgrade (Navbar + Browse Page)

**Goal:** Verify live, debounced filtering across navbar and browse page.

1. **Navbar quick search**
   - Start on any page, type a query (e.g., `art`) in the navbar search.
   - After a short delay, confirm you are redirected to `/browse?search=art`.
   - Clear the input and ensure you are sent to `/browse` with search param removed.

2. **Live filtering on `/browse`**
   - Land on `/browse` with a populated prompt list.
   - Type rapidly (e.g., `lofi rain`) and confirm:
     - A spinner shows inside the input while typing.
     - Skeleton cards appear in the grid during debounce.
     - Results update within ~300 ms after typing stops.

3. **Partial + tag/category matching**
   - Search for a partial keyword (`rain`) and confirm matching titles/descriptions display.
   - Search for a tag keyword (e.g., `ambient`) and confirm prompts with that tag appear.
   - Search using a category name (e.g., `music`) and confirm relevant prompts remain.

4. **Empty and reset states**
   - Enter a nonsense string (`zzzz`); verify the empty state card renders.
   - Hit “Clear filters” and confirm:
     - Search, category, tag params reset.
     - Full prompt list returns with result count updated.

5. **URL sync**
   - Manually append `?search=write` to `/browse` in the address bar.
   - Reload and verify the input is prefilled and filtering applied.

---

## 2. Browse Filtering & Sorting

**Goal:** Ensure browse filters still work with new search utility.

1. Select a category chip (e.g., `Music`) and confirm the grid updates.
2. Add a tag via TagChips, verifying the result count matches expectation.
3. Switch sort dropdown between “Newest” and “Popular” to confirm ordering changes without breaking search.
4. Combine category + tags + search; ensure the results respect all filters.

---

## 3. Prompt Grid Skeleton & Empty State

1. While typing a search, observe that skeleton cards inherit consistent card height (no layout shift).
2. When no results match, confirm the empty-state message appears and is visually centered.

---

## 4. SEO Content Additions (Packs + Homepage)

*(If not already verified)*

1. Visit `/packs` and confirm the SEO intro section, heading “Premium AI Prompt Packs & Creator Bundles,” and bullet list render cleanly on both desktop and mobile breakpoints.
2. On the homepage, ensure the SEO-focused content block below the hero displays properly across themes.

---

## 5. JSON-LD & Metadata Spot Checks

1. Open browser dev tools → Elements and confirm `<script type="application/ld+json">` blocks exist on `app/page.tsx`, `app/prompts/page.tsx`, and individual prompt pages.
2. Validate canonical `<link>` tags reference the correct route.

---

## 6. Dynamic OG Image Route

1. Load `/prompts/[slug]` and append `/opengraph-image?title=Test&category=Music` to the URL.
2. Confirm the response is a 1200×630 PNG showing the title and category text.

---

## 7. Profile Page Auth Flow (Dynamic Route)

1. Log out and attempt to access `/profile`; verify redirect to home.
2. Log in and revisit `/profile`; confirm favorites load without SSR errors.
3. Ensure the page stays dynamic (no hydration warnings in console).

---

## 8. Sitemap & Robots Verification

1. Visit `/api/sitemap` and confirm a 308 redirect to `/sitemap.xml`.
2. Load `/sitemap.xml` to ensure prompt URLs resolve.
3. Check `robots.txt` references `https://www.onpointprompt.com/sitemap.xml`.

---

## 9. OptimizedImage Modes

1. Inspect cards, hero, and OG image usages to ensure the `mode` prop is passed (card/hero/og) and images load without layout shift.

---

## 10. Regressions & Global Smoke Tests

1. Run `npm run build` locally to ensure no new SSR/CSR warnings.
2. Navigate all primary routes (`/`, `/browse`, `/prompts`, `/packs`, `/profile`, `/create`, `/sign-in`) looking for console errors or layout anomalies.

---

**Notes:**
- Record any discrepancies with screenshots and URL/query parameters involved.
- Re-test after fixes to confirm the issue is resolved.
