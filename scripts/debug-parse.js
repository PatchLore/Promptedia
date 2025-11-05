import fs from "fs";

const csv = fs.readFileSync("./scripts/prompts_seed.csv", "utf8");
const lines = csv.split('\n').filter(l => l.trim());

console.log('Sample line 2:');
console.log(lines[1]);
console.log('\n');

// Try to find category
const validCategories = ['Art', 'Music', 'Writing', 'Business', 'Coding'];
const line = lines[1];

for (const cat of validCategories) {
  const idx1 = line.indexOf(cat);
  const idx2 = line.indexOf(',' + cat);
  const idx3 = line.indexOf(cat + ',');
  const idx4 = line.indexOf(',' + cat + ',');
  
  console.log(`Category: ${cat}`);
  console.log(`  indexOf("${cat}"): ${idx1}`);
  console.log(`  indexOf(",\${cat}"): ${idx2}`);
  console.log(`  indexOf("\${cat},"): ${idx3}`);
  console.log(`  indexOf(",\${cat},"): ${idx4}`);
  console.log('');
}



