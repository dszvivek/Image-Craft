import fs from 'fs';
import path from 'path';

function getHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getHtmlFiles(filePath));
    } else if (file === 'index.html') {
      results.push(filePath);
    }
  });
  return results;
}

const files = getHtmlFiles('./dist');
let errorCount = 0;

console.log(`Starting SEO Audit on ${files.length} prerendered pages...`);

files.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8');

  // 1. Title tag check
  const titleMatch = content.match(/<title>([^<]+)<\/title>/);
  if (!titleMatch || !titleMatch[1].trim()) {
    console.error(`❌ [Missing Title]: ${file}`);
    errorCount++;
  }

  // 2. Meta description check
  const descMatch = content.match(/<meta name="description" content="([^"]+)"/);
  if (!descMatch || !descMatch[1].trim()) {
    console.error(`❌ [Missing Meta Description]: ${file}`);
    errorCount++;
  }

  // 3. Canonical link check
  const canonicalMatch = content.match(/<link rel="canonical" href="([^"]+)"/);
  if (!canonicalMatch || !canonicalMatch[1].trim()) {
    console.error(`❌ [Missing Canonical]: ${file}`);
    errorCount++;
  }

  // 4. OpenGraph tags check
  if (!content.includes('property="og:title"')) {
    console.error(`❌ [Missing og:title]: ${file}`);
    errorCount++;
  }
  if (!content.includes('property="og:description"')) {
    console.error(`❌ [Missing og:description]: ${file}`);
    errorCount++;
  }
  if (!content.includes('property="og:image"')) {
    console.error(`❌ [Missing og:image]: ${file}`);
    errorCount++;
  }

  // 5. Twitter card check
  if (!content.includes('name="twitter:card"')) {
    console.error(`❌ [Missing twitter:card]: ${file}`);
    errorCount++;
  }

  // 6. JSON-LD scripts syntax check
  const jsonLdTags = content.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g) || [];
  if (jsonLdTags.length === 0) {
    console.error(`❌ [Missing JSON-LD]: ${file}`);
    errorCount++;
  }

  jsonLdTags.forEach((tag) => {
    const rawJson = tag.replace(/<script[^>]*>/, '').replace('</script>', '');
    try {
      JSON.parse(rawJson);
    } catch (err) {
      console.error(`❌ [Invalid JSON-LD Syntax] in ${file}: ${err.message}`);
      errorCount++;
    }
  });
});

console.log(`\n========================================`);
console.log(`SEO Audit Complete!`);
console.log(`Pages Analyzed: ${files.length}`);
console.log(`Errors / Gaps Detected: ${errorCount}`);
console.log(`========================================\n`);

if (errorCount > 0) {
  process.exit(1);
}
