import fs from 'fs';
import path from 'path';

const siteUrl = 'https://imageplumber.com';
const currentDate = new Date().toISOString().split('T')[0];

const metaPath = 'src/routes/metadata.json';
const metadata = JSON.parse(fs.readFileSync(metaPath, 'utf8'));

const locales = [
  { code: 'es', file: 'src/locales/es.json' },
  { code: 'pt', file: 'src/locales/pt.json' },
  { code: 'hi', file: 'src/locales/hi.json' },
  { code: 'fr', file: 'src/locales/fr.json' },
  { code: 'de', file: 'src/locales/de.json' }
];

let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

// English URLs
for (const [route, m] of Object.entries(metadata)) {
  const isHome = route === '';
  const loc = isHome ? `${siteUrl}/` : `${siteUrl}/${route}`;
  const priority = isHome ? '1.0' : (route.includes('-') && !route.includes('compress-image-to-') ? '0.90' : '0.85');
  const title = (m.title || 'ImagePlumber').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  xml += `  <url>
    <loc>${loc}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
    <image:image>
      <image:loc>${siteUrl}/og-image.png</image:loc>
      <image:title>${title}</image:title>
    </image:image>
  </url>\n`;
}

// Localized URLs
for (const l of locales) {
  const lData = JSON.parse(fs.readFileSync(l.file, 'utf8'));
  for (const [route, m] of Object.entries(lData)) {
    const isLocalHome = route === '';
    const loc = isLocalHome ? `${siteUrl}/${l.code}` : `${siteUrl}/${l.code}/${route}`;
    const priority = isLocalHome ? '0.95' : '0.85';
    const title = (m.title || 'ImagePlumber').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    xml += `  <url>
    <loc>${loc}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
    <image:image>
      <image:loc>${siteUrl}/og-image.png</image:loc>
      <image:title>${title}</image:title>
    </image:image>
  </url>\n`;
  }
}

xml += `</urlset>\n`;

fs.writeFileSync('public/sitemap.xml', xml, 'utf8');
console.log('Successfully generated public/sitemap.xml!');
