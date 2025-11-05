/**
 * Find public domain images for prompts and update example_url
 * Uses Unsplash API (public domain) to find images matching prompt themes
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Image search terms mapped to prompt titles/categories
// Using Unsplash URLs (public domain, no API key needed for direct links)
const imageSearchTerms = {
  // Art prompts
  "Cyberpunk Skyline": "cyberpunk city neon lights night",
  "Dream Forest": "enchanted forest mist moonlight",
  "Retro Futurism": "80s retro futuristic poster chrome",
  "Surreal Desert Mirage": "surreal desert landscape floating dunes",
  "Astral Garden": "interstellar garden flowers space zero gravity",
  "Neon Samurai": "futuristic samurai neon signs rain",
  "Glass Ocean": "ocean glass waves sunset reflection",
  "Floating Islands": "floating islands waterfalls sky ruins",
  "Cosmic Portrait": "portrait stars galaxies cosmos",
  "Shadow Theater": "dimly lit stage shadows dance",
  "Golden Hour Street": "european street golden hour sunlight",
  "Fractured Reality": "city skyline fragmented glass shards",
  "Minimalist Horizon": "minimalist landscape soft gradients mountains",
  "Ethereal Wings": "angelic figure clouds glowing mist",
  "Solar Bloom": "flowers sun abstract light",
  "Celestial Clock": "giant clock planets orbiting",
  "Urban Echoes": "city lights wet pavement rain reflection",
  "Underwater Ruins": "ancient greek temples underwater crystal clear",
  "Electric Jungle": "rainforest electric vines bioluminescent robotic",
  "Lunar Reflection": "lake reflecting giant moon clouds",
  
  // Music prompts - using abstract/visual music representations
  "Lofi Rainwalk": "cozy room rain window lofi",
  "Drum & Bass Uplift": "energetic music abstract colorful",
  "Cinematic Pulse": "epic cinematic dramatic mountains",
  "Ambient Drift": "ambient space cosmic textures",
  "Synthwave Streets": "80s arcade neon highways retro",
  "Deep House Flow": "smooth music abstract colorful",
  "Trance Horizon": "euphoric trance abstract colorful",
  "Dark Techno Circuit": "techno dark gritty abstract",
  "Jazz Lullaby": "jazz chill cozy warm",
  "Ocean Echoes": "ocean waves ambient calm",
  "Dubstep Shockwave": "high energy abstract colorful",
  "Lofi Guitar Sunset": "sunset guitar cozy warm",
  "Drum Funk Motion": "drum funk groove abstract",
  "Space Chillout": "space ambient relaxing cosmic",
  "Minimal Pulse": "minimal techno abstract textures",
  "Future Garage Mood": "atmospheric future abstract",
  "Loft Beats": "jazz hip hop dusty vinyl",
  "Ethereal Choir": "choir vocals ethereal ambient",
  "Rainforest Percussion": "tribal percussion rainforest natural",
  "Night Drive": "night drive city neon synthwave",
  
  // Writing prompts
  "Morning Haiku": "dawn morning light quiet streets",
  "AI Love Letter": "ai robot technology love",
  "Product Launch Email": "saas product launch modern",
  "Sci-Fi Journal Entry": "mars red horizon space",
  "Short Horror Scene": "subway station midnight flickering",
  "Poetic Brand Slogan": "sustainable coffee brand eco",
  "Futurist Manifesto": "ai creativity future technology",
  "Dream Interpretation": "locked doors endless hallway dream",
  "Brand Story": "handmade jewelry artisan craft",
  "Comedy Tweet": "ai taking over job humor",
  "Midnight Café Conversations": "24 hour cafe midnight strangers",
  "Letters from the Future": "letter future time travel",
  "Haunting Notifications": "phone ghost technology horror",
  "The Last Librarian": "library books banned dystopian",
  "Parallel Lives": "alternate realities parallel universe",
  "The City That Dreamed": "city night dreams magical",
  "Lost Words": "poetry vintage language old",
  "Dialogue Only": "dialogue conversation talking",
  "3 AM Thoughts": "person lying awake night thoughts",
  "Artificial Muse": "ai poetry writing perspective",
  
  // Business prompts
  "Startup Elevator Pitch": "startup pitch meeting modern",
  "Brand Mission Statement": "sustainable fashion brand eco",
  "Social Media Strategy": "social media strategy instagram",
  "Customer Testimonial": "happy customer testimonial review",
  "Lead Magnet Idea": "lead magnet online course",
  "Product Tagline": "ai design assistant product",
  "Cold Email Template": "email outreach business",
  "Pricing Table Copy": "saas pricing table plans",
  "Customer Retention Email": "email retention engagement",
  "Affiliate Pitch": "affiliate program influencer marketing",
  "Landing Page Headline": "ai marketing tool homepage",
  "Investor Update": "investor update business growth",
  "Upsell Script": "customer support sales upsell",
  "Business Slogan": "eco cleaning company sustainable",
  "About Us Page Copy": "creative agency boutique authentic",
  "Customer Onboarding Email": "welcome email onboarding saas",
  "Event Promo Post": "linkedin post webinar product demo",
  "Business Plan Summary": "subscription coffee brand business",
  "Client Testimonial Request": "testimonial request email customer",
  "Startup Name Generator": "fintech startup naming brand",
  
  // Coding prompts
  "Next.js Auth Guard": "nextjs code authentication",
  "Supabase Trigger Example": "supabase database sql code",
  "Stripe Webhook Handler": "stripe api webhook code",
  "Tailwind Theme Config": "tailwind css design config",
  "React Context Example": "react context theme dark light",
  "Supabase Auth Flow": "supabase authentication nextjs",
  "Prisma Relation Query": "prisma database query code",
  "Credit System Function": "backend credits api function",
  "File Upload API": "file upload api nextjs",
  "Image Optimization": "nextjs image optimization performance",
  "Database Migration": "sql migration database code",
  "Environment Variables": "nextjs environment variables security",
  "Edge Function Example": "supabase edge function serverless",
  "Unit Test Example": "jest test code unit testing",
  "API Rate Limiter": "api rate limiter security",
  "Stripe Subscription Flow": "stripe checkout subscription nextjs",
  "Responsive Navbar": "responsive navbar tailwind hamburger",
  "SEO Metadata Component": "seo meta tags react component",
  "Supabase Storage Upload": "supabase storage upload avatar",
  "Pagination Query": "sql pagination query database"
};

// Unsplash image URLs - using curated public domain images
// Format: https://images.unsplash.com/photo-[id]?w=1280&h=720&fit=crop&q=80
const unsplashImageMap = {
  // Art - curated high-quality images
  "Cyberpunk Skyline": "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1280&h=720&fit=crop",
  "Dream Forest": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1280&h=720&fit=crop",
  "Retro Futurism": "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1280&h=720&fit=crop",
  "Surreal Desert Mirage": "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1280&h=720&fit=crop",
  "Astral Garden": "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=1280&h=720&fit=crop",
  "Neon Samurai": "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1280&h=720&fit=crop",
  "Glass Ocean": "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1280&h=720&fit=crop",
  "Floating Islands": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1280&h=720&fit=crop",
  "Cosmic Portrait": "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1280&h=720&fit=crop",
  "Shadow Theater": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1280&h=720&fit=crop",
  "Golden Hour Street": "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1280&h=720&fit=crop",
  "Fractured Reality": "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1280&h=720&fit=crop",
  "Minimalist Horizon": "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1280&h=720&fit=crop",
  "Ethereal Wings": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1280&h=720&fit=crop",
  "Solar Bloom": "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=1280&h=720&fit=crop",
  "Celestial Clock": "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=1280&h=720&fit=crop",
  "Urban Echoes": "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1280&h=720&fit=crop",
  "Underwater Ruins": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1280&h=720&fit=crop",
  "Electric Jungle": "https://images.unsplash.com/photo-1470114716159-e389f8712fda?w=1280&h=720&fit=crop",
  "Lunar Reflection": "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1280&h=720&fit=crop",
  
  // Music - abstract/atmospheric
  "Lofi Rainwalk": "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1280&h=720&fit=crop",
  "Drum & Bass Uplift": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1280&h=720&fit=crop",
  "Cinematic Pulse": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1280&h=720&fit=crop",
  "Ambient Drift": "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=1280&h=720&fit=crop",
  "Synthwave Streets": "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1280&h=720&fit=crop",
  "Deep House Flow": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1280&h=720&fit=crop",
  "Trance Horizon": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1280&h=720&fit=crop",
  "Dark Techno Circuit": "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1280&h=720&fit=crop",
  "Jazz Lullaby": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1280&h=720&fit=crop",
  "Ocean Echoes": "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1280&h=720&fit=crop",
  "Dubstep Shockwave": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1280&h=720&fit=crop",
  "Lofi Guitar Sunset": "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1280&h=720&fit=crop",
  "Drum Funk Motion": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1280&h=720&fit=crop",
  "Space Chillout": "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=1280&h=720&fit=crop",
  "Minimal Pulse": "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1280&h=720&fit=crop",
  "Future Garage Mood": "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1280&h=720&fit=crop",
  "Loft Beats": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1280&h=720&fit=crop",
  "Ethereal Choir": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1280&h=720&fit=crop",
  "Rainforest Percussion": "https://images.unsplash.com/photo-1470114716159-e389f8712fda?w=1280&h=720&fit=crop",
  "Night Drive": "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1280&h=720&fit=crop",
  
  // Writing
  "Morning Haiku": "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1280&h=720&fit=crop",
  "AI Love Letter": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1280&h=720&fit=crop",
  "Product Launch Email": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1280&h=720&fit=crop",
  "Sci-Fi Journal Entry": "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1280&h=720&fit=crop",
  "Short Horror Scene": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1280&h=720&fit=crop",
  "Poetic Brand Slogan": "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1280&h=720&fit=crop",
  "Futurist Manifesto": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1280&h=720&fit=crop",
  "Dream Interpretation": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1280&h=720&fit=crop",
  "Brand Story": "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1280&h=720&fit=crop",
  "Comedy Tweet": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1280&h=720&fit=crop",
  "Midnight Café Conversations": "https://images.unsplash.com/photo-1501339847302-ac426a4c7c98?w=1280&h=720&fit=crop",
  "Letters from the Future": "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1280&h=720&fit=crop",
  "Haunting Notifications": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1280&h=720&fit=crop",
  "The Last Librarian": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1280&h=720&fit=crop",
  "Parallel Lives": "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1280&h=720&fit=crop",
  "The City That Dreamed": "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1280&h=720&fit=crop",
  "Lost Words": "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1280&h=720&fit=crop",
  "Dialogue Only": "https://images.unsplash.com/photo-1501339847302-ac426a4c7c98?w=1280&h=720&fit=crop",
  "3 AM Thoughts": "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1280&h=720&fit=crop",
  "Artificial Muse": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1280&h=720&fit=crop",
  
  // Business
  "Startup Elevator Pitch": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1280&h=720&fit=crop",
  "Brand Mission Statement": "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1280&h=720&fit=crop",
  "Social Media Strategy": "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1280&h=720&fit=crop",
  "Customer Testimonial": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1280&h=720&fit=crop",
  "Lead Magnet Idea": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1280&h=720&fit=crop",
  "Product Tagline": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1280&h=720&fit=crop",
  "Cold Email Template": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1280&h=720&fit=crop",
  "Pricing Table Copy": "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1280&h=720&fit=crop",
  "Customer Retention Email": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1280&h=720&fit=crop",
  "Affiliate Pitch": "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1280&h=720&fit=crop",
  "Landing Page Headline": "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1280&h=720&fit=crop",
  "Investor Update": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1280&h=720&fit=crop",
  "Upsell Script": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1280&h=720&fit=crop",
  "Business Slogan": "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1280&h=720&fit=crop",
  "About Us Page Copy": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1280&h=720&fit=crop",
  "Customer Onboarding Email": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1280&h=720&fit=crop",
  "Event Promo Post": "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1280&h=720&fit=crop",
  "Business Plan Summary": "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1280&h=720&fit=crop",
  "Client Testimonial Request": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1280&h=720&fit=crop",
  "Startup Name Generator": "https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?w=1280&h=720&fit=crop",
  
  // Coding
  "Next.js Auth Guard": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1280&h=720&fit=crop",
  "Supabase Trigger Example": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1280&h=720&fit=crop",
  "Stripe Webhook Handler": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1280&h=720&fit=crop",
  "Tailwind Theme Config": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1280&h=720&fit=crop",
  "React Context Example": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1280&h=720&fit=crop",
  "Supabase Auth Flow": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1280&h=720&fit=crop",
  "Prisma Relation Query": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1280&h=720&fit=crop",
  "Credit System Function": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1280&h=720&fit=crop",
  "File Upload API": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1280&h=720&fit=crop",
  "Image Optimization": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1280&h=720&fit=crop",
  "Database Migration": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1280&h=720&fit=crop",
  "Environment Variables": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1280&h=720&fit=crop",
  "Edge Function Example": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1280&h=720&fit=crop",
  "Unit Test Example": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1280&h=720&fit=crop",
  "API Rate Limiter": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1280&h=720&fit=crop",
  "Stripe Subscription Flow": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1280&h=720&fit=crop",
  "Responsive Navbar": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1280&h=720&fit=crop",
  "SEO Metadata Component": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1280&h=720&fit=crop",
  "Supabase Storage Upload": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1280&h=720&fit=crop",
  "Pagination Query": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1280&h=720&fit=crop"
};

async function updateImages() {
  console.log('📖 Fetching all prompts...');
  const { data: prompts, error: fetchError } = await supabase
    .from('prompts')
    .select('id, title, category, example_url');

  if (fetchError) {
    console.error('❌ Error fetching prompts:', fetchError.message);
    return;
  }

  console.log(`✅ Found ${prompts.length} prompts\n`);

  let updated = 0;
  let skipped = 0;
  let notFound = [];

  for (const prompt of prompts) {
    const imageUrl = unsplashImageMap[prompt.title];
    
    if (imageUrl) {
      if (prompt.example_url === imageUrl) {
        skipped++;
        continue;
      }

      const { error } = await supabase
        .from('prompts')
        .update({ example_url: imageUrl })
        .eq('id', prompt.id);

      if (error) {
        console.error(`❌ Error updating "${prompt.title}":`, error.message);
      } else {
        updated++;
        console.log(`✅ Updated: ${prompt.title}`);
      }
    } else {
      notFound.push(prompt.title);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 UPDATE SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Updated: ${updated}`);
  console.log(`⏭️  Skipped (already correct): ${skipped}`);
  console.log(`❓ Not found in map: ${notFound.length}`);
  
  if (notFound.length > 0) {
    console.log('\n⚠️  Prompts without image mappings:');
    notFound.forEach(title => console.log(`   - ${title}`));
  }
  
  console.log('\n🎉 Image update complete!');
}

updateImages().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});



