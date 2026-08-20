import fs from 'fs';
import path from 'path';

let totalChecked = 0;
let errors = 0;

function checkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'assets') {
        checkDir(fullPath);
      }
    } else if (entry.name === 'index.html') {
      totalChecked++;
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // 1. Check root div is non-empty
      const rootMatch = content.match(/<div id="root">([\s\S]*?)<\/div>\s*<\/body>/);
      if (!rootMatch || !rootMatch[1].trim()) {
        console.error('Empty root div in:', fullPath);
        errors++;
      }
      
      // 2. Check canonical exists
      const canonMatch = content.match(/<link rel="canonical" href="(.*?)" \/>/);
      if (!canonMatch) {
        console.error('Missing canonical in:', fullPath);
        errors++;
      } else {
        const url = canonMatch[1];
        if (url !== 'https://imageplumber.com/' && url.endsWith('/')) {
          console.error('Trailing slash in canonical:', fullPath, url);
          errors++;
        }
      }
      
      // 3. Check JSON-LD
      if (!content.includes('application/ld+json')) {
        console.error('Missing JSON-LD in:', fullPath);
        errors++;
      }
    }
  }
}

checkDir('dist');
console.log(`Audit complete! Total checked: ${totalChecked}, Errors: ${errors}`);
