# Promptopedia - Design Brief & Summary

## 🎯 App Overview

**Promptopedia** is a searchable, filterable library of AI prompts for image generation, music creation, writing, business, and coding. Users can browse, search, save favorites, and submit their own prompts.

---

## 📱 Pages & Structure

### 1. **Home Page (`/`)**
**Purpose:** Landing page with featured content

**Layout:**
- Hero section with:
  - App title/logo: "Promptopedia"
  - Tagline: "Discover, search, and save AI prompts for image generation, music creation, writing, and more"
  - CTA buttons: "Browse Prompts" and "Submit Prompt"
- Categories grid (5 categories):
  - Art 🎨
  - Music 🎵
  - Writing ✍️
  - Business 💼
  - Coding 💻
  - Each category card should be clickable
- Featured Prompts section:
  - Grid of prompt cards (12 featured prompts)
  - "View All" link

**Design Elements Needed:**
- Hero banner with gradient background
- Category cards with icons
- Prompt cards (see below)

---

### 2. **Browse Page (`/browse`)**
**Purpose:** Search and filter prompts

**Layout:**
- Page title: "Browse Prompts"
- Search bar (full width, prominent)
- Category filter chips/tags:
  - All, Art, Music, Writing, Business, Coding
  - Active filter highlighted
- Responsive grid of prompt cards:
  - 1 column on mobile
  - 2 columns on tablet
  - 3 columns on desktop
- Empty state: "No prompts found. Try adjusting your search or category filter."

**Design Elements Needed:**
- Search input with icon
- Filter chips with hover/active states
- Masonry or grid layout for prompts

---

### 3. **Prompt Detail Page (`/prompt/[id]`)**
**Purpose:** View individual prompt with example output

**Layout:**
- Category and type badges at top
- Prompt title (large, bold)
- Prompt text section:
  - Copy button
  - Favorite button (if logged in)
  - Full prompt text (preserves line breaks)
- Example Result section (if exists):
  - Image display (if type = image)
  - Audio player (if type = music)
  - Text display (if type = text)
- Details section:
  - Model name
  - Tags (chips)
  - Created date
- Structured data (JSON-LD) for SEO

**Design Elements Needed:**
- Card-based layout for sections
- Image container with aspect ratio
- Audio player styling
- Tag chips
- Action buttons (Copy, Favorite)

---

### 4. **Create Prompt Page (`/create`)**
**Purpose:** Submit new prompts

**Layout:**
- Page title: "Create New Prompt"
- Form with fields:
  - Title (required)
  - Prompt Text (textarea, required)
  - Category dropdown (required): Art, Music, Writing, Business, Coding
  - Type dropdown (required): Image, Music, Text
  - Example URL (optional)
  - Model (optional)
  - Tags (comma-separated, optional)
  - Checkboxes:
    - Make public
    - Pro prompt
  - Submit button

**Design Elements Needed:**
- Clean form layout
- Input styling
- Dropdown selects
- Textarea with good height
- Checkbox styling
- Primary action button

---

### 5. **Profile/Favorites Page (`/profile`)**
**Purpose:** View saved favorite prompts

**Layout:**
- Page title: "My Favorites"
- Grid of favorite prompt cards (same as browse page)
- Empty state: "You haven't saved any favorites yet. Start browsing prompts and save the ones you like!"

**Design Elements Needed:**
- Same prompt card design as browse
- Empty state message

---

## 🧩 Components

### **Navbar**
**Location:** Top of every page, sticky

**Elements:**
- Logo/Brand: "Promptopedia" (left)
- Search bar (center, max-width)
- Navigation links:
  - Browse
  - Create
  - Favorites (if logged in)
- Auth button:
  - "Sign In" (if not logged in)
  - "Sign Out" (if logged in)

**Design Requirements:**
- Sticky/fixed at top
- Clean, minimal design
- Search bar integrated
- Responsive (mobile menu on small screens)

---

### **Prompt Card**
**Used in:** Home, Browse, Profile pages

**Elements:**
- Image preview (if example_url exists and type = image)
  - Aspect ratio: 16:9
  - Object cover
- Category badge (small, colored)
- Type badge (small, colored)
- Title (truncated to 2 lines)
- Prompt text preview (truncated to 3 lines)
- Tags (up to 3 tags, small chips)

**Design Requirements:**
- Card with shadow
- Hover effect (shadow increase)
- Rounded corners
- Clickable entire card
- Responsive image
- Badge styling

---

### **Footer**
**Location:** Bottom of every page

**Elements:**
- 3 columns:
  - Column 1: App description
  - Column 2: Quick links (Browse, Submit, Favorites)
  - Column 3: About info
- Copyright notice at bottom

**Design Requirements:**
- Clean, minimal
- Responsive (stacks on mobile)
- Links styled appropriately

---

## 🎨 Design System

### **Colors**
**Current (can be customized):**
- Primary: Blue (#2563eb / blue-600)
- Secondary: Purple (for accents)
- Background: White (light mode) / Dark gray (dark mode)
- Text: Gray-900 (light) / Gray-100 (dark)
- Cards: White / Gray-800 (dark)

**Suggested Color Palette:**
- Primary: Vibrant blue or purple gradient
- Accent: Complementary color for highlights
- Success: Green (for success states)
- Warning: Yellow/Orange (for warnings)
- Error: Red (for errors)

---

### **Typography**
- Headings: Bold, large sizes
- Body: Regular weight, readable size
- Links: Underlined or colored on hover
- Code/Prompts: Monospace font (for prompt text)

---

### **Spacing & Layout**
- Container: Max-width container, centered
- Padding: Consistent spacing (p-4, p-6, p-8)
- Grid gaps: 1.5rem (gap-6)
- Card padding: 1rem (p-4)

---

### **UI Patterns**

**Buttons:**
- Primary: Blue background, white text, rounded
- Secondary: Gray background, dark text
- Icon buttons: Circular or square
- Hover states: Darker shade, slight scale

**Inputs:**
- Rounded corners (rounded-xl)
- Border on focus
- Placeholder text styling
- Clear visual feedback

**Badges/Tags:**
- Small, rounded-full
- Colored backgrounds
- Text contrast ensured

**Cards:**
- White background
- Shadow (shadow-md)
- Rounded corners (rounded-xl)
- Hover: Increased shadow (shadow-lg)

---

## 🔍 Features to Highlight

1. **Search Functionality**
   - Instant search as you type
   - Search across title and prompt text

2. **Category Filtering**
   - Visual category chips
   - Active state clearly indicated

3. **Favorites System**
   - Heart icon for saving
   - Visual feedback on save

4. **Copy to Clipboard**
   - One-click copy button
   - Visual confirmation ("Copied!")

5. **Example Previews**
   - Images display inline
   - Audio player for music
   - Text examples formatted

---

## 📐 Responsive Breakpoints

- Mobile: < 768px (1 column)
- Tablet: 768px - 1024px (2 columns)
- Desktop: > 1024px (3 columns)

---

## 🎯 Design Priorities

1. **Clean & Modern**
   - Minimal UI
   - Plenty of white space
   - Clear hierarchy

2. **User-Friendly**
   - Easy navigation
   - Clear CTAs
   - Intuitive search

3. **Visual Appeal**
   - Beautiful gradients
   - Smooth animations
   - Professional polish

4. **Accessibility**
   - Good contrast ratios
   - Keyboard navigation
   - Screen reader friendly

---

## 🖼️ Image Requirements

- Hero images: Optional, can be gradient or illustration
- Category icons: Emoji or custom icons
- Placeholder images: For prompts without examples
- Favicon: App logo/icon

---

## ✨ Animation Ideas

- Smooth page transitions
- Card hover effects
- Button press animations
- Loading states
- Success/error notifications
- Search results fade-in

---

## 📝 Notes for Designer

- The app uses **Tailwind CSS** - design should be compatible
- Supports **dark mode** - design should work in both
- Uses **Next.js Image** component for optimized images
- All components are React/TypeScript
- Forms use server actions (no traditional form submission)

---

## 🎨 Design Deliverables Needed

1. **HTML/CSS Template** for:
   - Home page layout
   - Browse page layout
   - Prompt detail page layout
   - Create form layout
   - Navbar component
   - Footer component
   - Prompt card component

2. **Color Palette** (hex codes)
3. **Typography Scale** (font sizes, weights)
4. **Component Library** (buttons, inputs, cards, badges)
5. **Mobile Responsive** designs

---

## 🚀 Ready to Integrate

Once you provide the HTML/CSS design, I can:
- Convert it to React components
- Integrate with existing functionality
- Ensure responsive design
- Add dark mode support
- Connect all interactive elements

**Let me know when you have the design ready!**



