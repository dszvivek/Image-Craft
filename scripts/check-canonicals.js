import fs from 'fs';
import path from 'path';

// Let's run a test on dist if it exists, or check metadata.json and prerender.js
const meta = JSON.parse(fs.readFileSync('src/routes/metadata.json', 'utf8'));
const locales = ['es', 'pt', 'hi', 'fr', 'de'];

console.log('--- Checking English routes metadata ---');
for (const [route, m] of Object.entries(meta)) {
  if (!m.title || !m.description) {
    console.log('Missing title/desc in en route:', route);
  }
}

console.log('\n--- Checking Locales ---');
for (const loc of locales) {
  const locData = JSON.parse(fs.readFileSync(`src/locales/${loc}.json`, 'utf8'));
  for (const [route, m] of Object.entries(locData)) {
    if (!m.title || !m.description) {
      console.log(`Missing title/desc in ${loc} route:`, route);
    }
  }
}

// Let's check prerendered files in dist if dist exists
if (fs.existsSync('dist')) {
  let canonicalsFound = new Map();
  function checkHtmlFiles(dir) {
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, item.name);
      if (item.isDirectory() && item.name !== 'assets') {
        checkHtmlFiles(full);
      } else if (item.name === 'index.html') {
        const content = fs.readFileSync(full, 'utf8');
        const m = content.match(/<link rel="canonical" href="([^"]+)"/);
        const relPath = path.relative('dist', full);
        if (m) {
          const c = m[1];
          if (!canonicalsFound.has(c)) {
            canonicalsFound.set(c, []);
          }
          canonicalsFound.get(c).push(relPath);
        } else {
          console.log('NO CANONICAL in:', relPath);
        }
      }
    }
  }
  checkHtmlFiles('dist');
  console.log('\nTotal unique canonical URLs in dist:', canonicalsFound.size);
  // Check duplicates pointing to same canonical
  for (const [c, files] of canonicalsFound.entries()) {
    if (files.length > 1) {
      console.log(`Multiple files (${files.length}) share same canonical "${c}":`, files);
    }
  }
}
