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

const distFiles = getHtmlFiles('./dist');
console.log(`\n======================================================`);
console.log(`🔎 COMPREHENSIVE SEO AUDIT: ${distFiles.length} HTML FILES FOUND`);
console.log(`======================================================\n`);

const issues = {
  missingTitle: [],
  titleTooShort: [],
  titleTooLong: [],
  duplicateTitles: new Map(),

  missingDesc: [],
  descTooShort: [],
  descTooLong: [],
  duplicateDescs: new Map(),

  missingCanonical: [],
  invalidCanonical: [],
  canonicalTrailingSlashError: [],

  missingRobots: [],
  suboptimalRobots: [],

  missingOgLocale: [],
  ogLocaleMismatch: [],
  missingOgImage: [],
  missingTwitterCard: [],

  missingH1: [],
  multipleH1: [],
  emptyH1: [],

  missingJsonLd: [],
  invalidJsonLd: [],
  missingBreadcrumbSchema: [],
  missingSoftwareSchema: [],

  thinContent: [],
  brokenInternalLinks: [],

  sitemapOrphanPages: [],
  sitemapMissingPages: []
};

// Map of canonicals and titles to detect duplicates
const titlesSeen = new Map();
const descsSeen = new Map();
const allDistUrls = new Set();

// Gather all valid URLs from dist
distFiles.forEach(f => {
  let rel = path.relative('./dist', f).replace(/\\/g, '/');
  if (rel === 'index.html') {
    allDistUrls.add('https://imageplumber.com/');
  } else {
    const urlPath = rel.replace(/\/index\.html$/, '');
    allDistUrls.add(`https://imageplumber.com/${urlPath}`);
  }
});

// Check sitemap
const sitemapContent = fs.readFileSync('public/sitemap.xml', 'utf8');
const sitemapUrls = [...sitemapContent.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1].trim());
const sitemapSet = new Set(sitemapUrls);

for (const url of allDistUrls) {
  if (!sitemapSet.has(url)) {
    issues.sitemapMissingPages.push(url);
  }
}
for (const url of sitemapUrls) {
  if (!allDistUrls.has(url)) {
    issues.sitemapOrphanPages.push(url);
  }
}

// Audit each file
distFiles.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8');
  const relPath = path.relative('./dist', file).replace(/\\/g, '/');
  const isHome = relPath === 'index.html';
  const urlPath = isHome ? '' : relPath.replace(/\/index\.html$/, '');
  const langMatch = urlPath.match(/^(es|pt|hi|fr|de)(\/|$)/);
  const detectedLang = langMatch ? langMatch[1] : 'en';

  // 1. Title
  const titleMatch = content.match(/<title>(.*?)<\/title>/s);
  if (!titleMatch || !titleMatch[1].trim()) {
    issues.missingTitle.push(relPath);
  } else {
    const title = titleMatch[1].trim();
    if (title.length < 30) issues.titleTooShort.push({ file: relPath, title, len: title.length });
    if (title.length > 70) issues.titleTooLong.push({ file: relPath, title, len: title.length });

    if (titlesSeen.has(title)) {
      titlesSeen.get(title).push(relPath);
    } else {
      titlesSeen.set(title, [relPath]);
    }
  }

  // 2. Meta Description
  const descMatch = content.match(/<meta\s+name=["']description["']\s+content=(?:"([^"]*)"|'([^']*)')/s);
  const rawDesc = descMatch ? (descMatch[1] !== undefined ? descMatch[1] : descMatch[2]) : null;
  if (!rawDesc || !rawDesc.trim()) {
    issues.missingDesc.push(relPath);
  } else {
    const desc = rawDesc.trim();
    if (desc.length < 100) issues.descTooShort.push({ file: relPath, desc, len: desc.length });
    if (desc.length > 175) issues.descTooLong.push({ file: relPath, desc, len: desc.length });

    if (descsSeen.has(desc)) {
      descsSeen.get(desc).push(relPath);
    } else {
      descsSeen.set(desc, [relPath]);
    }
  }

  // 3. Canonical
  const canonMatch = content.match(/<link\s+rel=["']canonical["']\s+href=["'](.*?)["']/);
  if (!canonMatch) {
    issues.missingCanonical.push(relPath);
  } else {
    const canon = canonMatch[1].trim();
    if (!canon.startsWith('https://imageplumber.com')) {
      issues.invalidCanonical.push({ file: relPath, canon });
    }
    if (canon !== 'https://imageplumber.com/' && canon.endsWith('/')) {
      issues.canonicalTrailingSlashError.push({ file: relPath, canon });
    }
  }

  // 4. Meta Robots
  const robotsMatch = content.match(/<meta\s+name=["']robots["']\s+content=["'](.*?)["']/);
  if (!robotsMatch) {
    issues.missingRobots.push(relPath);
  } else {
    const robots = robotsMatch[1];
    if (!robots.includes('max-image-preview:large')) {
      issues.suboptimalRobots.push({ file: relPath, robots });
    }
  }

  // 5. OpenGraph & Locale
  const ogLocaleMatch = content.match(/<meta\s+property=["']og:locale["']\s+content=["'](.*?)["']/);
  if (!ogLocaleMatch) {
    issues.missingOgLocale.push(relPath);
  } else {
    const ogLocale = ogLocaleMatch[1];
    const expectedLocale = {
      en: 'en_US',
      es: 'es_ES',
      pt: 'pt_BR',
      hi: 'hi_IN',
      fr: 'fr_FR',
      de: 'de_DE'
    }[detectedLang];
    if (expectedLocale && ogLocale !== expectedLocale) {
      issues.ogLocaleMismatch.push({ file: relPath, detectedLang, ogLocale, expectedLocale });
    }
  }

  if (!content.includes('property="og:image"')) {
    issues.missingOgImage.push(relPath);
  }
  if (!content.includes('name="twitter:card"')) {
    issues.missingTwitterCard.push(relPath);
  }

  // 6. H1 Headings inside root
  const h1Matches = [...content.matchAll(/<h1[\s>](.*?)<\/h1>/gis)];
  if (h1Matches.length === 0) {
    issues.missingH1.push(relPath);
  } else if (h1Matches.length > 1) {
    issues.multipleH1.push({ file: relPath, count: h1Matches.length });
  } else {
    const h1Text = h1Matches[0][1].replace(/<[^>]+>/g, '').trim();
    if (!h1Text) issues.emptyH1.push(relPath);
  }

  // 7. Structured Data (JSON-LD)
  const jsonLdTags = [...content.matchAll(/<script\s+type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis)];
  if (jsonLdTags.length === 0) {
    issues.missingJsonLd.push(relPath);
  } else {
    let hasBreadcrumbs = false;
    let hasSoftwareOrWebPage = false;
    jsonLdTags.forEach(t => {
      try {
        const parsed = JSON.parse(t[1]);
        if (parsed['@type'] === 'BreadcrumbList') hasBreadcrumbs = true;
        if (parsed['@type'] === 'SoftwareApplication' || parsed['@type'] === 'WebApplication' || parsed['@type'] === 'WebPage') {
          hasSoftwareOrWebPage = true;
        }
      } catch (e) {
        issues.invalidJsonLd.push({ file: relPath, error: e.message });
      }
    });
    if (!isHome && !hasBreadcrumbs) {
      issues.missingBreadcrumbSchema.push(relPath);
    }
  }

  // 8. Content Depth (Word Count inside root)
  const rootMatch = content.match(/<div id="root">([\s\S]*?)<\/div>\s*(?:<script|<\/body>)/);
  if (rootMatch) {
    const rootText = rootMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const wordCount = rootText.split(' ').filter(Boolean).length;
    if (wordCount < 80) {
      issues.thinContent.push({ file: relPath, wordCount });
    }
  }

  // 9. Internal Links validation
  const linkMatches = [...content.matchAll(/<a\s+(?:[^>]*?\s+)?href=["']([^"'#]+)["']/gi)];
  for (const m of linkMatches) {
    let href = m[1].trim();
    if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('javascript:')) {
      continue;
    }
    if (href === '/') href = 'https://imageplumber.com/';
    else {
      const cleanHref = href.startsWith('/') ? href.slice(1) : href;
      href = `https://imageplumber.com/${cleanHref.replace(/\/$/, '')}`;
    }
    if (!allDistUrls.has(href)) {
      issues.brokenInternalLinks.push({ file: relPath, target: href });
    }
  }
});

// Populate duplicate titles/descs that occur > 1 time
titlesSeen.forEach((files, title) => {
  if (files.length > 1) issues.duplicateTitles.set(title, files);
});
descsSeen.forEach((files, desc) => {
  if (files.length > 1) issues.duplicateDescs.set(desc, files);
});

// Output report
console.log('📊 AUDIT SUMMARY METRICS:');
console.log(`- Missing Titles: ${issues.missingTitle.length}`);
console.log(`- Title Too Long (>70 chars): ${issues.titleTooLong.length}`);
console.log(`- Title Too Short (<30 chars): ${issues.titleTooShort.length}`);
console.log(`- Duplicate Titles: ${issues.duplicateTitles.size}`);

console.log(`- Missing Descriptions: ${issues.missingDesc.length}`);
console.log(`- Description Too Long (>175 chars): ${issues.descTooLong.length}`);
console.log(`- Description Too Short (<100 chars): ${issues.descTooShort.length}`);
console.log(`- Duplicate Descriptions: ${issues.duplicateDescs.size}`);

console.log(`- Missing Canonical: ${issues.missingCanonical.length}`);
console.log(`- Canonical Trailing Slash Errors: ${issues.canonicalTrailingSlashError.length}`);

console.log(`- Missing Meta Robots: ${issues.missingRobots.length}`);
console.log(`- Suboptimal Robots (Missing max-image-preview:large): ${issues.suboptimalRobots.length}`);

console.log(`- OpenGraph og:locale Mismatches: ${issues.ogLocaleMismatch.length}`);
console.log(`- Missing OpenGraph Image: ${issues.missingOgImage.length}`);
console.log(`- Missing Twitter Card: ${issues.missingTwitterCard.length}`);

console.log(`- Missing H1: ${issues.missingH1.length}`);
console.log(`- Multiple H1: ${issues.multipleH1.length}`);
console.log(`- Empty H1: ${issues.emptyH1.length}`);

console.log(`- Missing JSON-LD: ${issues.missingJsonLd.length}`);
console.log(`- Invalid JSON-LD Syntax: ${issues.invalidJsonLd.length}`);
console.log(`- Missing Breadcrumb Schema on Subpages: ${issues.missingBreadcrumbSchema.length}`);

console.log(`- Thin Content (<80 words): ${issues.thinContent.length}`);
console.log(`- Broken Internal Links: ${issues.brokenInternalLinks.length}`);
console.log(`- Sitemap Orphan URLs (in sitemap but not dist): ${issues.sitemapOrphanPages.length}`);
console.log(`- Sitemap Missing URLs (in dist but not sitemap): ${issues.sitemapMissingPages.length}`);

console.log('\n------------------------------------------------------');
if (issues.ogLocaleMismatch.length > 0) {
  console.log(`Sample og:locale mismatch (Total ${issues.ogLocaleMismatch.length}):`);
  issues.ogLocaleMismatch.slice(0, 5).forEach(m => console.log(`  ${m.file}: ${m.ogLocale} (expected ${m.expectedLocale})`));
}

if (issues.suboptimalRobots.length > 0) {
  console.log(`\nSample suboptimal robots (Total ${issues.suboptimalRobots.length}):`);
  issues.suboptimalRobots.slice(0, 3).forEach(m => console.log(`  ${m.file}: ${m.robots}`));
}

if (issues.titleTooLong.length > 0) {
  console.log(`\nSample Titles too long (Total ${issues.titleTooLong.length}):`);
  issues.titleTooLong.slice(0, 5).forEach(m => console.log(`  ${m.file} (${m.len} chars): ${m.title}`));
}

if (issues.descTooLong.length > 0) {
  console.log(`\nSample Descriptions too long (Total ${issues.descTooLong.length}):`);
  issues.descTooLong.slice(0, 5).forEach(m => console.log(`  ${m.file} (${m.len} chars): ${m.desc}`));
}

if (issues.descTooShort.length > 0) {
  console.log(`\nSample Descriptions too short (Total ${issues.descTooShort.length}):`);
  issues.descTooShort.forEach(m => console.log(`  ${m.file} (${m.len} chars): ${m.desc}`));
}

if (issues.duplicateTitles.size > 0) {
  console.log(`\nSample Duplicate Titles (Total ${issues.duplicateTitles.size}):`);
  let count = 0;
  for (const [title, files] of issues.duplicateTitles.entries()) {
    if (count++ > 3) break;
    console.log(`  "${title}" in ${files.length} files: ${files.slice(0, 2).join(', ')}...`);
  }
}

if (issues.thinContent.length > 0) {
  console.log(`\nThin Content Pages (<80 words) (Total ${issues.thinContent.length}):`);
  issues.thinContent.forEach(m => console.log(`  ${m.file} (${m.wordCount} words)`));
}

if (issues.brokenInternalLinks.length > 0) {
  console.log(`\nBroken Internal Links (Total ${issues.brokenInternalLinks.length}):`);
  issues.brokenInternalLinks.slice(0, 10).forEach(m => console.log(`  ${m.file} -> ${m.target}`));
}

if (issues.sitemapOrphanPages.length > 0) {
  console.log(`\nSitemap Orphan Pages (in sitemap but not dist):`, issues.sitemapOrphanPages);
}
if (issues.sitemapMissingPages.length > 0) {
  console.log(`\nSitemap Missing Pages (in dist but not sitemap):`, issues.sitemapMissingPages);
}
