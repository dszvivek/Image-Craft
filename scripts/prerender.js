import fs from 'fs';
import path from 'path';

// Define the root of our dist folder
const distDir = path.resolve('dist');
const templatePath = path.join(distDir, 'index.html');

if (!fs.existsSync(templatePath)) {
  console.error(`Error: Could not find build template at ${templatePath}. Ensure 'npm run build' completes first.`);
  process.exit(1);
}

const templateContent = fs.readFileSync(templatePath, 'utf8');

// Define metadata configuration for all routes
const routesConfig = {
  'background-remover': {
    title: 'Free AI Background Remover - Remove Image BG Offline',
    description: 'Isolate subjects and remove image backgrounds automatically using local neural networks inside your browser. No files uploaded, absolute privacy.',
    keywords: 'background remover, AI background removal, remove bg offline, transparent background, Tesseract OCR, Tesseract.js, offline image tool',
    schema: {
      '@type': 'SoftwareApplication',
      'name': 'AI Background Remover - ImageGiri',
      'applicationCategory': 'MultimediaApplication',
      'operatingSystem': 'Web Browser',
      'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
      'description': 'Remove image backdrops automatically using local neural networks client-side inside the browser sandbox.',
      'featureList': [
        'Neural subject segmentation (RMBG-1.4)',
        '100% offline running in IndexedDB cache',
        'Alpha transparency channel export'
      ]
    }
  },
  'aspect-resizer': {
    title: 'Free Aspect Resizer & Smart Crop - Social Media Presets',
    description: 'Crop and resize images to standard aspect ratios for Instagram, YouTube, X, and Facebook. Fit canvas widths with smart blur padding.',
    keywords: 'aspect resizer, smart crop, social media image sizes, image crop, crop handles, rule of thirds, blur padding',
    schema: {
      '@type': 'SoftwareApplication',
      'name': 'Aspect Resizer & Smart Crop - ImageGiri',
      'applicationCategory': 'MultimediaApplication',
      'operatingSystem': 'Web Browser',
      'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
      'description': 'Crop and resize images to standard templates with smart blur-padding options offline.',
      'featureList': [
        'Presets for Instagram, YouTube, and X (Twitter)',
        'Dynamic blur padding fill for vertical/horizontal bounds',
        'Interactive rule of thirds crop lines'
      ]
    }
  },
  'batch-converter': {
    title: 'Free Batch Image Converter - Convert PNG, JPEG, WebP, PDF',
    description: 'Convert multiple images between PNG, JPEG, WebP, and PDF formats simultaneously. Batch process locally in your browser memory.',
    keywords: 'batch image converter, convert png to jpeg, webp to png, convert images offline, image to pdf, local format converter',
    schema: {
      '@type': 'SoftwareApplication',
      'name': 'Batch Image Converter - ImageGiri',
      'applicationCategory': 'MultimediaApplication',
      'operatingSystem': 'Web Browser',
      'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
      'description': 'Simultaneously convert formats and pack multiple images to PDF files locally.',
      'featureList': [
        'Batch format encoding (WebP, PNG, JPEG)',
        'Compile multiple photos to a single PDF document',
        'Adjustable image scale and canvas page margins'
      ]
    }
  },
  'collage-maker': {
    title: 'Free Photo Collage Maker - Create Custom Photo Grids',
    description: 'Combine multiple photos into beautiful, custom grid layouts. Adjust spacing, corners, and border widths offline.',
    keywords: 'collage maker, photo collage, photo grid, create collage, offline collage, custom grids',
    schema: {
      '@type': 'SoftwareApplication',
      'name': 'Photo Collage Maker - ImageGiri',
      'applicationCategory': 'MultimediaApplication',
      'operatingSystem': 'Web Browser',
      'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
      'description': 'Combine photos into preset grids and fine-tune borders and aspect ratios locally.',
      'featureList': [
        'Dozens of custom aspect grid templates',
        'Live spacing padding and border rounding sliders',
        'Drag-and-drop cell swaps client-side'
      ]
    }
  },
  'image-compressor': {
    title: 'Free Image Compressor - Compress JPEG, PNG & WebP Offline',
    description: 'Reduce image file sizes by up to 90% without losing visible quality. Optimize JPEGs, PNGs, and WebPs locally in milliseconds using hardware-accelerated quantization.',
    keywords: 'image compressor, compress jpeg, reduce image size, offline compressor, compress webp, file size optimizer',
    schema: {
      '@type': 'SoftwareApplication',
      'name': 'Image Compressor - ImageGiri',
      'applicationCategory': 'MultimediaApplication',
      'operatingSystem': 'Web Browser',
      'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
      'description': 'Drastically reduce image file sizes in the browser local RAM cache using quantization algorithms.',
      'featureList': [
        'Lossy and lossless compression configurations',
        'Interactive chroma subsampling adjustments',
        'Speedy multi-threading worker compression'
      ]
    }
  },
  'instagram-grid-splitter': {
    title: 'Free Instagram Grid Splitter - Split Image to Panels',
    description: 'Split a single photo into 3x3, 4x4, or 5x5 grids for Instagram. Crop and export separate panels locally in high quality.',
    keywords: 'instagram grid splitter, split image, grid maker, 3x3 grid, image splitter, grid layout, split photo for social media',
    schema: {
      '@type': 'SoftwareApplication',
      'name': 'Instagram Grid Splitter - ImageGiri',
      'applicationCategory': 'MultimediaApplication',
      'operatingSystem': 'Web Browser',
      'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
      'description': 'Split photos into grid mosaics for Instagram profiles without image resolution loss.',
      'featureList': [
        'Split grids (3x1, 3x2, 3x3, 4x4, 5x5)',
        'Zip packing for single-click downloads',
        'Automatic cell coordinate naming conventions'
      ]
    }
  },
  'meme-generator': {
    title: 'Free Meme Generator - Add Impact Text Captions',
    description: 'Create custom memes instantly using popular templates or your own uploaded photos. Add dragging text labels offline.',
    keywords: 'meme generator, create meme, add text to image, meme creator, custom meme, impact font, blank memes',
    schema: {
      '@type': 'SoftwareApplication',
      'name': 'Meme Generator - ImageGiri',
      'applicationCategory': 'MultimediaApplication',
      'operatingSystem': 'Web Browser',
      'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
      'description': 'Add dragging, styled text captions to image files to create memes offline.',
      'featureList': [
        'Classic Impact-style font settings',
        'Dynamic bounding text boxes with drag handles',
        'Save canvas as high-res PNG locally'
      ]
    }
  },
  'metadata-stripper': {
    title: 'Free EXIF Metadata Stripper - Remove GPS Photo Data',
    description: 'Remove camera, location, and GPS metadata from your photos before sharing. Clean EXIF tags locally for complete privacy.',
    keywords: 'exif metadata stripper, remove gps from photo, clean metadata, strip exif, photo privacy, remove photo location',
    schema: {
      '@type': 'SoftwareApplication',
      'name': 'EXIF Metadata Stripper - ImageGiri',
      'applicationCategory': 'MultimediaApplication',
      'operatingSystem': 'Web Browser',
      'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
      'description': 'Audit and strip metadata strings from camera files locally in RAM.',
      'featureList': [
        'Complete scan of Exif, GPS, and IPTC parameters',
        'One-click tag wipe matching security best practices',
        'Export clean image data blocks immediately'
      ]
    }
  },
  'photo-mosaic-generator': {
    title: 'Free Photo Mosaic Generator - Easymoza Alternative',
    description: 'Reconstruct target images from thousands of small photo tiles locally. A 100% private, free alternative to Easymoza and online mosaic generators.',
    keywords: 'photo mosaic generator, mosaic maker, picture mosaic, Easymoza alternative, mosaic art maker, tile mosaic',
    schema: {
      '@type': 'SoftwareApplication',
      'name': 'Photo Mosaic Generator - ImageGiri',
      'applicationCategory': 'MultimediaApplication',
      'operatingSystem': 'Web Browser',
      'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
      'description': 'Compose photo mosaic grids locally in client-side RAM using color average math.',
      'featureList': [
        'Automatic color distance matching',
        'Custom tile batches or solid colors fallback pool',
        'High-resolution offline canvas rendering'
      ]
    }
  },
  'ocr-text-extractor': {
    title: 'Free OCR Text Extractor - Scan Image to Text Offline',
    description: 'Extract text from images, documents, and book pages locally using Tesseract OCR. Runs 100% in your browser, keeping your data secure.',
    keywords: 'ocr text extractor, image to text, scan text, offline ocr, read text from image, tesseract ocr, tesseract.js',
    schema: {
      '@type': 'SoftwareApplication',
      'name': 'OCR Text Extractor - ImageGiri',
      'applicationCategory': 'MultimediaApplication',
      'operatingSystem': 'Web Browser',
      'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
      'description': 'Scan and extract characters from text pictures locally in client memory.',
      'featureList': [
        'Local Tesseract.js language engines',
        'Support for English, Spanish, French, and Japanese',
        'Instant copy-to-clipboard transaction text box'
      ]
    }
  },
  'color-palette-extractor': {
    title: 'Free Color Palette Extractor - HEX/RGB Palette Generator',
    description: 'Extract dominant color palettes from any photo instantly using local clustering. Supports HEX, RGB, and Tailwind CSS formats.',
    keywords: 'color palette extractor, color generator, extract color from image, photo colors, color palette, hex color finder',
    schema: {
      '@type': 'SoftwareApplication',
      'name': 'Color Palette Extractor - ImageGiri',
      'applicationCategory': 'MultimediaApplication',
      'operatingSystem': 'Web Browser',
      'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
      'description': 'Extract harmonious color palettes from photography locally in browser memory.',
      'featureList': [
        'Dynamic color swatch extractors',
        'HEX, RGB, and Tailwind class formats',
        'Save and copy palettes instantly'
      ]
    }
  },
  'svg-vectorizer': {
    title: 'Free SVG Vectorizer - Convert Raster to Vector Outline',
    description: 'Trace raster PNG or JPEG images into clean vector SVG drawings locally. Adjust path tolerances and colors offline.',
    keywords: 'svg vectorizer, image to svg, raster to vector, trace outline, vector outline, tracer, png to svg offline',
    schema: {
      '@type': 'SoftwareApplication',
      'name': 'SVG Vectorizer - ImageGiri',
      'applicationCategory': 'MultimediaApplication',
      'operatingSystem': 'Web Browser',
      'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
      'description': 'Convert bitmap files to vector SVG outlines locally using canvas color analysis.',
      'featureList': [
        'Local canvas edge tracing logic',
        'Path simplification tolerance thresholds',
        'Download vector SVG code inline'
      ]
    }
  },
  'watermark-overlay': {
    title: 'Free Watermark Overlay - Add Text & Logo to Images',
    description: 'Protect your images by overlaying custom text or logo watermarks. Adjust transparency, spacing, and rotation offline.',
    keywords: 'watermark overlay, add watermark, protect images, logo watermark, watermark tool, copyright image tool',
    schema: {
      '@type': 'SoftwareApplication',
      'name': 'Watermark Overlay - ImageGiri',
      'applicationCategory': 'MultimediaApplication',
      'operatingSystem': 'Web Browser',
      'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
      'description': 'Overlay copyright text arrays or logo images onto canvases locally.',
      'featureList': [
        'Custom watermark text alignment controls',
        'Opacity slider and repeating tile layouts',
        'Local browser memory rendering'
      ]
    }
  },
  'bank-statement-analyzer': {
    title: 'Free Bank Statement Analyzer - PDF/CSV/Excel Parser',
    description: 'Analyze bank and credit card statements locally inside your browser cache. Calculate cash flows, identify categories, and export transactions.',
    keywords: 'bank statement analyzer, statement parser, pdf to csv bank statement, excel bank statement, cash flow ledger calculator',
    schema: {
      '@type': 'SoftwareApplication',
      'name': 'PDF Bank Statement Analyzer - ImageGiri',
      'applicationCategory': 'BusinessApplication',
      'operatingSystem': 'Web Browser',
      'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
      'description': 'Analyze credit card or bank statement sheets locally inside the client browser cache.',
      'featureList': [
        'Parse password-protected PDF bank statements',
        'Export parsed tables directly to Excel/CSV',
        '100% offline local parsing, zero server transmission'
      ]
    }
  },
  'about': {
    title: 'About Us - Privacy-First Local Image Tools Suite',
    description: 'Learn about ImageGiri and our absolute privacy commitment. We run 100% client-side web sandbox processing without cloud databases.',
    keywords: 'about imagegiri, offline image tools, client-side tools, private image processing'
  },
  'privacy': {
    title: 'Privacy Policy - Client-Side Promise',
    description: 'Review the privacy policy for ImageGiri. Our strict client-side sandbox ensures files stay on your device and are never uploaded.',
    keywords: 'privacy policy, cookie policy, client-side promise, data safety guarantee'
  },
  'faq': {
    title: 'Frequently Asked Questions - Help & Guides',
    description: 'Common questions answered about offline processing, browser compatibility, and private security frameworks.',
    keywords: 'faq, help page, user guides, compatibility list, local security questions'
  },
  'contact': {
    title: 'Contact Support & Feedback',
    description: 'Reach out to the ImageGiri development team for queries, bug reports, and features requests.',
    keywords: 'contact support, bug report, feedback form, request feature'
  }
};

console.log('Generating pre-rendered static meta index pages...');

// Base URL of the site
const siteUrl = 'https://imagegiri.com';

for (const [route, meta] of Object.entries(routesConfig)) {
  const routeDir = path.join(distDir, route);
  fs.mkdirSync(routeDir, { recursive: true });
  
  const pageCanonical = `${siteUrl}/${route}`;
  const fullTitle = `${meta.title} | ImageGiri`;
  
  // Set up base WebPage schema
  const webpageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    'name': fullTitle,
    'description': meta.description,
    'url': pageCanonical,
    'isPartOf': {
      '@type': 'WebSite',
      'name': 'ImageGiri',
      'url': siteUrl
    }
  };
  
  // Create scripts for headers
  const baseSchemaScript = `<script type="application/ld+json" id="page-jsonld">${JSON.stringify(webpageSchema)}</script>`;
  const extraSchemaScript = meta.schema 
    ? `<script type="application/ld+json" id="page-extra-jsonld">${JSON.stringify(meta.schema)}</script>`
    : '';
    
  const headInject = `${baseSchemaScript}\n    ${extraSchemaScript}\n  </head>`;
  
  // Do string replacements on the template
  let pageContent = templateContent;
  
  // Replace title tags
  pageContent = pageContent.replace(
    '<title>ImageGiri - Free Privacy-First Local Image Tools Suite</title>',
    `<title>${fullTitle}</title>`
  );
  
  // Replace description meta tag
  pageContent = pageContent.replace(
    'name="description" content="Free online image tools that run 100% in your browser. Compress images, remove backgrounds with AI, extract text (OCR), split grids for Instagram, make collages, extract color palettes, and more. Zero uploads. Absolute privacy."',
    `name="description" content="${meta.description}"`
  );
  
  // Replace keywords meta tag
  pageContent = pageContent.replace(
    'name="keywords" content="image compressor, background remover, AI background removal, OCR text extractor, image to text, Instagram grid splitter, photo collage maker, color palette extractor, batch image converter, EXIF metadata stripper, watermark overlay, aspect ratio resizer, meme generator, SVG vectorizer, photo mosaic generator, free image tools, offline image editor, privacy image tools, browser image editor, no upload image tool"',
    `name="keywords" content="${meta.keywords}"`
  );
  
  // Replace canonical URL
  pageContent = pageContent.replace(
    '<link rel="canonical" href="https://imagegiri.com/" />',
    `<link rel="canonical" href="${pageCanonical}" />`
  );
  
  // Replace Open Graph title, description, and URL tags
  pageContent = pageContent.replace(
    'property="og:title" content="ImageGiri - Free Privacy-First Local Image Tools Suite"',
    `property="og:title" content="${fullTitle}"`
  );
  pageContent = pageContent.replace(
    'property="og:description" content="Free online image tools that run 100% in your browser. Compress, remove backgrounds with AI, extract text, split grids, and more. Zero uploads. Absolute privacy."',
    `property="og:description" content="${meta.description}"`
  );
  pageContent = pageContent.replace(
    'property="og:url" content="https://imagegiri.com/"',
    `property="og:url" content="${pageCanonical}"`
  );
  pageContent = pageContent.replace(
    'property="og:image:alt" content="ImageGiri - Free Privacy-First Local Image Tools"',
    `property="og:image:alt" content="${meta.title} - ImageGiri"`
  );
  
  // Replace Twitter card title and description tags
  pageContent = pageContent.replace(
    'name="twitter:title" content="ImageGiri - Free Privacy-First Local Image Tools Suite"',
    `name="twitter:title" content="${fullTitle}"`
  );
  pageContent = pageContent.replace(
    'name="twitter:description" content="Free online image tools that run 100% in your browser. Compress, remove backgrounds with AI, extract text, split grids, and more. Zero uploads. Absolute privacy."',
    `name="twitter:description" content="${meta.description}"`
  );
  pageContent = pageContent.replace(
    'name="twitter:image:alt" content="ImageGiri - Free Privacy-First Local Image Tools"',
    `name="twitter:image:alt" content="${meta.title} - ImageGiri"`
  );
  
  // Inject schemas before closing head tag
  pageContent = pageContent.replace('</head>', headInject);
  
  // Write the output file
  const pageOutputPath = path.join(routeDir, 'index.html');
  fs.writeFileSync(pageOutputPath, pageContent, 'utf8');
  console.log(` - Prerendered: /${route}`);
}

console.log('All static meta index pages prerendered successfully!');
