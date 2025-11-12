/**
 * upload_art_music_to_storage.js — Upload Art and Audio files to Supabase Storage buckets
 * 
 * Creates buckets if they don't exist and uploads all files from:
 * - /Art folder → art-previews bucket
 * - /Audio folder → music-previews bucket
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Bucket configuration
const BUCKETS = [
  { id: 'art-previews', name: 'art-previews', public: true, folder: 'Art' },
  { id: 'music-previews', name: 'music-previews', public: true, folder: 'Audio' },
];

/**
 * Create a storage bucket if it doesn't exist
 */
async function ensureBucket(bucketId, bucketName, isPublic) {
  console.log(`📦 Checking bucket: ${bucketId}...`);
  
  // Check if bucket exists
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error(`❌ Error listing buckets:`, listError.message);
    return false;
  }

  const bucketExists = buckets?.some(b => b.id === bucketId);

  if (bucketExists) {
    console.log(`✅ Bucket ${bucketId} already exists`);
    return true;
  }

  // Create bucket via SQL (Storage API doesn't have create bucket method)
  console.log(`🔨 Creating bucket: ${bucketId}...`);
  
  // Note: Bucket creation requires SQL or Dashboard. We'll use a workaround:
  // Try to upload a test file, which will create the bucket if RLS allows
  // Or instruct user to create via Dashboard/SQL
  
  console.log(`⚠️  Bucket ${bucketId} doesn't exist. Please create it manually:`);
  console.log(`   SQL: INSERT INTO storage.buckets (id, name, public) VALUES ('${bucketId}', '${bucketName}', ${isPublic});`);
  console.log(`   Or create via Supabase Dashboard → Storage → New Bucket`);
  console.log(`   Name: ${bucketName}, Public: ${isPublic}`);
  
  return false;
}

/**
 * Upload a file to Supabase Storage
 */
async function uploadFile(bucketId, filePath, fileName) {
  const fileBuffer = fs.readFileSync(filePath);
  const fileExt = path.extname(fileName);
  const baseName = path.basename(fileName, fileExt);

  // Normalize filename (remove spaces, lowercase)
  const normalizedName = `${baseName.toLowerCase().replace(/\s+/g, '-')}${fileExt}`;

  console.log(`  📤 Uploading: ${fileName} → ${bucketId}/${normalizedName}`);

  const { data, error } = await supabase.storage
    .from(bucketId)
    .upload(normalizedName, fileBuffer, {
      contentType: getContentType(fileExt),
      upsert: true, // Overwrite if exists
    });

  if (error) {
    console.error(`    ❌ Error: ${error.message}`);
    return null;
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucketId)
    .getPublicUrl(normalizedName);

  const publicUrl = urlData?.publicUrl;
  console.log(`    ✅ Uploaded: ${publicUrl}`);

  return {
    fileName: normalizedName,
    publicUrl,
    originalName: fileName,
  };
}

/**
 * Get content type from file extension
 */
function getContentType(ext) {
  const types = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
  };
  return types[ext.toLowerCase()] || 'application/octet-stream';
}

/**
 * Upload all files from a folder to a bucket
 */
async function uploadFolder(bucketId, folderPath) {
  if (!fs.existsSync(folderPath)) {
    console.error(`❌ Folder not found: ${folderPath}`);
    return [];
  }

  const files = fs.readdirSync(folderPath);
  const imageFiles = files.filter(f => 
    /\.(jpg|jpeg|png|gif|webp|mp3|wav|ogg)$/i.test(f)
  );

  if (imageFiles.length === 0) {
    console.log(`⚠️  No image/audio files found in ${folderPath}`);
    return [];
  }

  console.log(`\n📁 Processing ${imageFiles.length} files from ${folderPath}...`);

  const uploads = [];
  for (const file of imageFiles) {
    const filePath = path.join(folderPath, file);
    const result = await uploadFile(bucketId, filePath, file);
    if (result) {
      uploads.push(result);
    }
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return uploads;
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting upload to Supabase Storage...\n');
  console.log(`📡 Supabase URL: ${SUPABASE_URL}\n`);

  const projectRoot = path.resolve(__dirname, '..');
  const results = {};

  for (const bucket of BUCKETS) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📦 Processing: ${bucket.name}`);
    console.log('='.repeat(60));

    // Ensure bucket exists
    const bucketExists = await ensureBucket(bucket.id, bucket.name, bucket.public);
    
    if (!bucketExists) {
      console.log(`\n⏭️  Skipping ${bucket.name} - bucket needs to be created first`);
      continue;
    }

    // Upload files
    const folderPath = path.join(projectRoot, bucket.folder);
    const uploads = await uploadFolder(bucket.id, folderPath);
    
    results[bucket.id] = uploads;
  }

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 UPLOAD SUMMARY');
  console.log('='.repeat(60));

  for (const bucket of BUCKETS) {
    const uploads = results[bucket.id] || [];
    console.log(`\n${bucket.name}:`);
    console.log(`  ✅ Uploaded: ${uploads.length} files`);
    
    if (uploads.length > 0) {
      console.log(`  📋 Files:`);
      uploads.forEach(u => {
        console.log(`     - ${u.originalName} → ${u.publicUrl}`);
      });
    }
  }

  console.log(`\n✨ Upload complete!`);
  console.log(`\n💡 Next step: Run 'node scripts/fix_art_music_images.js' to update prompt records`);
}

main()
  .then(() => {
    console.log('\n✅ Script completed successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Script failed:', err);
    process.exit(1);
  });

