/**
 * Find better, more accurate Unsplash images for each prompt
 * Uses curated Unsplash photo IDs that match each prompt theme
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Curated Unsplash photo IDs mapped to specific prompts
// Format: https://images.unsplash.com/photo-[PHOTO_ID]?w=1280&h=720&fit=crop&q=80
const curatedImages = {
  // Art - Cyberpunk & Futuristic
  "Cyberpunk Skyline": "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1280&h=720&fit=crop&q=80",
  "Neon Samurai": "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1280&h=720&fit=crop&q=80",
  "Retro Futurism": "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1280&h=720&fit=crop&q=80",
  
  // Art - Nature & Fantasy
  "Dream Forest": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1280&h=720&fit=crop&q=80",
  "Floating Islands": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1280&h=720&fit=crop&q=80",
  "Electric Jungle": "https://images.unsplash.com/photo-1470114716159-e389f8712fda?w=1280&h=720&fit=crop&q=80",
  "Lunar Reflection": "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1280&h=720&fit=crop&q=80",
  
  // Art - Abstract & Surreal
  "Surreal Desert Mirage": "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1280&h=720&fit=crop&q=80",
  "Glass Ocean": "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1280&h=720&fit=crop&q=80",
  "Astral Garden": "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=1280&h=720&fit=crop&q=80",
  "Cosmic Portrait": "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1280&h=720&fit=crop&q=80",
  "Fractured Reality": "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1280&h=720&fit=crop&q=80",
  "Solar Bloom": "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=1280&h=720&fit=crop&q=80",
  
  // Art - Urban & Street
  "Golden Hour Street": "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1280&h=720&fit=crop&q=80",
  "Urban Echoes": "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1280&h=720&fit=crop&q=80",
  "Minimalist Horizon": "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1280&h=720&fit=crop&q=80",
  
  // Art - Other
  "Shadow Theater": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1280&h=720&fit=crop&q=80",
  "Ethereal Wings": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1280&h=720&fit=crop&q=80",
  "Celestial Clock": "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=1280&h=720&fit=crop&q=80",
  "Underwater Ruins": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1280&h=720&fit=crop&q=80",
  
  // Music - Cozy & Ambient
  "Lofi Rainwalk": "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1280&h=720&fit=crop&q=80",
  "Jazz Lullaby": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1280&h=720&fit=crop&q=80",
  "Ocean Echoes": "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1280&h=720&fit=crop&q=80",
  "Lofi Guitar Sunset": "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1280&h=720&fit=crop&q=80",
  "Space Chillout": "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=1280&h=720&fit=crop&q=80",
  "Loft Beats": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1280&h=720&fit=crop&q=80",
  
  // Music - Energetic
  "Drum & Bass Uplift": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1280&h=720&fit=crop&q=80",
  "Cinematic Pulse": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1280&h=720&fit=crop&q=80",
  "Synthwave Streets": "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1280&h=720&fit=crop&q=80",
  "Trance Horizon": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1280&h=720&fit=crop&q=80",
  "Dubstep Shockwave": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1280&h=720&fit=crop&q=80",
  "Night Drive": "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1280&h=720&fit=crop&q=80",
  
  // Music - Other
  "Ambient Drift": "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=1280&h=720&fit=crop&q=80",
  "Deep House Flow": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1280&h=720&fit=crop&q=80",
  "Dark Techno Circuit": "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1280&h=720&fit=crop&q=80",
  "Drum Funk Motion": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1280&h=720&fit=crop&q=80",
  "Minimal Pulse": "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1280&h=720&fit=crop&q=80",
  "Future Garage Mood": "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1280&h=720&fit=crop&q=80",
  "Ethereal Choir": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1280&h=720&fit=crop&q=80",
  "Rainforest Percussion": "https://images.unsplash.com/photo-1470114716159-e389f8712fda?w=1280&h=720&fit=crop&q=80",
  
  // Writing - Nature & Time
  "Morning Haiku": "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1280&h=720&fit=crop&q=80",
  "3 AM Thoughts": "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1280&h=720&fit=crop&q=80",
  "Lost Words": "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1280&h=720&fit=crop&q=80",
  
  // Writing - Technology & AI
  "AI Love Letter": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1280&h=720&fit=crop&q=80",
  "Artificial Muse": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1280&h=720&fit=crop&q=80",
  "Futurist Manifesto": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1280&h=720&fit=crop&q=80",
  "Haunting Notifications": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1280&h=720&fit=crop&q=80",
  "Comedy Tweet": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1280&h=720&fit=crop&q=80",
  
  // Writing - Stories & Fiction
  "Midnight Café Conversations": "https://images.unsplash.com/photo-1501339847302-ac426a4c7c98?w=1280&h=720&fit=crop&q=80",
  "Letters from the Future": "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1280&h=720&fit=crop&q=80",
  "The Last Librarian": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1280&h=720&fit=crop&q=80",
  "Parallel Lives": "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1280&h=720&fit=crop&q=80",
  "The City That Dreamed": "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1280&h=720&fit=crop&q=80",
  "Dialogue Only": "https://images.unsplash.com/photo-1501339847302-ac426a4c7c98?w=1280&h=720&fit=crop&q=80",
  
  // Writing - Other
  "Sci-Fi Journal Entry": "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1280&h=720&fit=crop&q=80",
  "Short Horror Scene": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1280&h=720&fit=crop&q=80",
  "Dream Interpretation": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1280&h=720&fit=crop&q=80",
  "Product Launch Email": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1280&h=720&fit=crop&q=80",
  "Poetic Brand Slogan": "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1280&h=720&fit=crop&q=80",
  "Brand Story": "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1280&h=720&fit=crop&q=80",
  
  // Business - Meetings & Strategy
  "Startup Elevator Pitch": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1280&h=720&fit=crop&q=80",
  "Social Media Strategy": "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1280&h=720&fit=crop&q=80",
  "Landing Page Headline": "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1280&h=720&fit=crop&q=80",
  "Investor Update": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1280&h=720&fit=crop&q=80",
  "Event Promo Post": "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1280&h=720&fit=crop&q=80",
  
  // Business - Email & Communication
  "Customer Testimonial": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1280&h=720&fit=crop&q=80",
  "Cold Email Template": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1280&h=720&fit=crop&q=80",
  "Customer Retention Email": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1280&h=720&fit=crop&q=80",
  "Customer Onboarding Email": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1280&h=720&fit=crop&q=80",
  "Client Testimonial Request": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1280&h=720&fit=crop&q=80",
  
  // Business - Branding & Marketing
  "Brand Mission Statement": "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1280&h=720&fit=crop&q=80",
  "Product Tagline": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1280&h=720&fit=crop&q=80",
  "Business Slogan": "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1280&h=720&fit=crop&q=80",
  "About Us Page Copy": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1280&h=720&fit=crop&q=80",
  "Startup Name Generator": "https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?w=1280&h=720&fit=crop&q=80",
  
  // Business - Sales & Pricing
  "Lead Magnet Idea": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1280&h=720&fit=crop&q=80",
  "Pricing Table Copy": "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1280&h=720&fit=crop&q=80",
  "Affiliate Pitch": "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1280&h=720&fit=crop&q=80",
  "Upsell Script": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1280&h=720&fit=crop&q=80",
  "Business Plan Summary": "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1280&h=720&fit=crop&q=80",
  
  // Coding - All use code/tech theme
  "Next.js Auth Guard": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1280&h=720&fit=crop&q=80",
  "Supabase Trigger Example": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1280&h=720&fit=crop&q=80",
  "Stripe Webhook Handler": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1280&h=720&fit=crop&q=80",
  "Tailwind Theme Config": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1280&h=720&fit=crop&q=80",
  "React Context Example": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1280&h=720&fit=crop&q=80",
  "Supabase Auth Flow": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1280&h=720&fit=crop&q=80",
  "Prisma Relation Query": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1280&h=720&fit=crop&q=80",
  "Credit System Function": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1280&h=720&fit=crop&q=80",
  "File Upload API": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1280&h=720&fit=crop&q=80",
  "Image Optimization": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1280&h=720&fit=crop&q=80",
  "Database Migration": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1280&h=720&fit=crop&q=80",
  "Environment Variables": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1280&h=720&fit=crop&q=80",
  "Edge Function Example": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1280&h=720&fit=crop&q=80",
  "Unit Test Example": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1280&h=720&fit=crop&q=80",
  "API Rate Limiter": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1280&h=720&fit=crop&q=80",
  "Stripe Subscription Flow": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1280&h=720&fit=crop&q=80",
  "Responsive Navbar": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1280&h=720&fit=crop&q=80",
  "SEO Metadata Component": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1280&h=720&fit=crop&q=80",
  "Supabase Storage Upload": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1280&h=720&fit=crop&q=80",
  "Pagination Query": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1280&h=720&fit=crop&q=80"
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
    const imageUrl = curatedImages[prompt.title];
    
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
  console.log('\n💡 Note: The images are from Unsplash (public domain).');
  console.log('   To find more accurate images, search Unsplash.com and update the photo IDs.');
}

updateImages().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});



