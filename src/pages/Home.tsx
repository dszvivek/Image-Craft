import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, 
  Cpu, 
  Zap, 
  Image as ImageIcon, 
  Maximize2, 
  LayoutGrid, 
  FileText, 
  Lock, 
  Files, 
  Fingerprint, 
  Copyright, 
  Crop, 
  Smile, 
  Feather, 
  X, 
  CreditCard, 
  PenTool, 
  Sparkles, 
  Sliders, 
  RotateCw, 
  Square, 
  Wand2, 
  Moon, 
  Gamepad2, 
  Terminal, 
  ArrowLeftRight, 
  ShieldAlert,
  Layout,
  Table,
  Search,
  ChevronRight,
  Flame,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { SEO } from '../components/SEO';
import { HeroDropZone } from '../components/HeroDropZone';
import { 
  getLocaleFromPath, 
  getLocalizedToolPath, 
  getShortToolMeta,
  UI_TRANSLATIONS 
} from '../utils/i18n';

interface ToolItem {
  name: string;
  path: string;
  icon: any;
  category: 'photo-editing' | 'privacy-security' | 'creative-art' | 'layout-formats';
  description: string;
  badge: string;
  colorClass: string;
  tag: string;
  formatTag: string;
}

const toolDirectory: ToolItem[] = [
  // 🪄 Category 1: Photo & Image Studio (7 tools)
  {
    name: 'AI Background Remover',
    path: '/background-remover',
    icon: Cpu,
    category: 'photo-editing',
    description: 'Isolate subjects and erase backgrounds automatically with local on-device neural AI cutout.',
    badge: 'On-Device AI',
    tag: 'WASM AI',
    formatTag: 'PNG · WEBGPU',
    colorClass: 'text-purple-600 bg-purple-50 border-purple-200/80 dark:text-purple-400 dark:bg-purple-950/40 dark:border-purple-800/60'
  },
  {
    name: 'Interactive Image Cropper',
    path: '/crop-image',
    icon: Crop,
    category: 'photo-editing',
    description: 'Crop images with 8-handle touch canvas, 1:1, 4:5, 16:9, and official passport 2x2 in aspect ratios.',
    badge: 'Social & Passport',
    tag: 'Touch Crop',
    formatTag: '1:1 · 4:5 · 16:9',
    colorClass: 'text-blue-600 bg-blue-50 border-blue-200/80 dark:text-blue-400 dark:bg-blue-950/40 dark:border-blue-800/60'
  },
  {
    name: 'Image Rotator & Straightener',
    path: '/rotate-image',
    icon: RotateCw,
    category: 'photo-editing',
    description: 'Rotate 90°/180°, mirror flip horizontally/vertically, and level crooked horizon angles with grid overlay.',
    badge: 'Precision Angle',
    tag: 'Angle Level',
    formatTag: '90° · 180° · FLIP',
    colorClass: 'text-blue-600 bg-blue-50 border-blue-200/80 dark:text-blue-400 dark:bg-blue-950/40 dark:border-blue-800/60'
  },
  {
    name: 'Image Adjuster & Color Tuner',
    path: '/adjust-image',
    icon: Sliders,
    category: 'photo-editing',
    description: 'Fine-tune exposure, contrast, saturation, temperature, tint, and sharpness with live split comparison.',
    badge: 'Pro Grading',
    tag: 'Live Split',
    formatTag: 'EXPOSURE · HSL',
    colorClass: 'text-blue-600 bg-blue-50 border-blue-200/80 dark:text-blue-400 dark:bg-blue-950/40 dark:border-blue-800/60'
  },
  {
    name: 'Photo Filter & Duotone Studio',
    path: '/photo-filters',
    icon: Wand2,
    category: 'photo-editing',
    description: 'Apply 12 aesthetic presets or create custom dual-gradient duotone maps entirely in client memory.',
    badge: '12 Aesthetics',
    tag: 'Duotone Map',
    formatTag: 'DUOTONE · LUT',
    colorClass: 'text-purple-600 bg-purple-50 border-purple-200/80 dark:text-purple-400 dark:bg-purple-950/40 dark:border-purple-800/60'
  },
  {
    name: 'Color Inverter & B&W Converter',
    path: '/invert-colors',
    icon: Moon,
    category: 'photo-editing',
    description: 'Invert RGB channels to film negatives, solarize, or convert to 1-bit high-contrast Otsu black & white.',
    badge: 'Film Negative',
    tag: 'Otsu B&W',
    formatTag: 'NEGATIVE · B&W',
    colorClass: 'text-indigo-600 bg-indigo-50 border-indigo-200/80 dark:text-indigo-400 dark:bg-indigo-950/40 dark:border-indigo-800/60'
  },
  {
    name: 'Smart Aspect Resizer',
    path: '/aspect-resizer',
    icon: Crop,
    category: 'photo-editing',
    description: 'Resize and crop images to social media templates with canvas blur-padding presets and zero distortion.',
    badge: 'Social Presets',
    tag: 'Blur Padding',
    formatTag: 'INSTA · YT · STORY',
    colorClass: 'text-amber-600 bg-amber-50 border-amber-200/80 dark:text-amber-400 dark:bg-amber-950/40 dark:border-amber-800/60'
  },

  // 🛡️ Category 2: Privacy, Security & Docs (7 tools)
  {
    name: 'Photo Redactor & Censor Tool',
    path: '/redact-image',
    icon: ShieldAlert,
    category: 'privacy-security',
    description: 'Permanently censor private data, blur faces, and blackout ID numbers with irreversible pixel obliteration.',
    badge: 'Privacy Redact',
    tag: 'Face Blur',
    formatTag: 'BLACKOUT · BLUR',
    colorClass: 'text-rose-600 bg-rose-50 border-rose-200/80 dark:text-rose-400 dark:bg-rose-950/40 dark:border-rose-800/60'
  },
  {
    name: 'Image Steganography & Secret Text',
    path: '/image-steganography',
    icon: Lock,
    category: 'privacy-security',
    description: 'Invisibly hide encrypted secret messages and recovery seed phrases inside photos with LSB encoding.',
    badge: 'Encrypted LSB',
    tag: 'AES-256',
    formatTag: 'AES · STEGO',
    colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-200/80 dark:text-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-800/60'
  },
  {
    name: 'EXIF Metadata Stripper',
    path: '/metadata-stripper',
    icon: Fingerprint,
    category: 'privacy-security',
    description: 'Inspect and purge GPS coordinates, camera serials, and privacy headers before sharing photos online.',
    badge: 'Purge GPS',
    tag: 'EXIF Clean',
    formatTag: 'GPS · CAMERA · DATE',
    colorClass: 'text-rose-600 bg-rose-50 border-rose-200/80 dark:text-rose-400 dark:bg-rose-950/40 dark:border-rose-800/60'
  },
  {
    name: 'Batch Watermark Overlay',
    path: '/watermark-overlay',
    icon: Copyright,
    category: 'privacy-security',
    description: 'Stamp custom logos, tiled copyright text, and security marks across single or multiple images in bulk.',
    badge: 'Copyright Stamp',
    tag: 'Batch Stamp',
    formatTag: 'LOGO · TEXT · TILED',
    colorClass: 'text-teal-600 bg-teal-50 border-teal-200/80 dark:text-teal-400 dark:bg-teal-950/40 dark:border-teal-800/60'
  },
  {
    name: 'Electronic PDF Signer',
    path: '/sign-pdf',
    icon: PenTool,
    category: 'privacy-security',
    description: 'Draw, type, or upload electronic signatures to sign PDF contracts and documents 100% offline.',
    badge: 'Offline Sign',
    tag: 'Vector Sign',
    formatTag: 'PDF · DRAW · TYPE',
    colorClass: 'text-indigo-600 bg-indigo-50 border-indigo-200/80 dark:text-indigo-400 dark:bg-indigo-950/40 dark:border-indigo-800/60'
  },
  {
    name: 'Bank Statement Analyzer',
    path: '/bank-statement-analyzer',
    icon: CreditCard,
    category: 'privacy-security',
    description: 'Audit and convert PDF bank statements to Excel and CSV spreadsheets without third-party server exposure.',
    badge: 'Financial Audit',
    tag: 'PDF to CSV',
    formatTag: 'CSV · EXCEL · PDF',
    colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-200/80 dark:text-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-800/60'
  },
  {
    name: 'OCR Text Extractor',
    path: '/ocr-text-extractor',
    icon: FileText,
    category: 'privacy-security',
    description: 'Extract multi-lingual text from receipts, documents, and screenshots using local Tesseract OCR.',
    badge: 'Local OCR',
    tag: 'Multi-Lingual',
    formatTag: 'TXT · TESSERACT',
    colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-200/80 dark:text-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-800/60'
  },

  // 🎨 Category 3: Creative Art & Pixel FX (7 tools)
  {
    name: 'Pixel Art & 8-Bit Converter',
    path: '/pixel-art-generator',
    icon: Gamepad2,
    category: 'creative-art',
    description: 'Convert photos to 8-bit retro pixel art with Game Boy, NES, and PICO-8 Floyd-Steinberg dithering palettes.',
    badge: '8-Bit Retro',
    tag: 'Dithering',
    formatTag: 'GAME BOY · NES · PICO',
    colorClass: 'text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200/80 dark:text-fuchsia-400 dark:bg-fuchsia-950/40 dark:border-fuchsia-800/60'
  },
  {
    name: 'ASCII & Text Art Studio',
    path: '/ascii-art-generator',
    icon: Terminal,
    category: 'creative-art',
    description: 'Convert photos into terminal ASCII character artwork with Matrix phosphor green and ANSI colors.',
    badge: 'Matrix ASCII',
    tag: 'ASCII Copy',
    formatTag: 'ANSI · MONOSPACE',
    colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-200/80 dark:text-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-800/60'
  },
  {
    name: 'Glitch Art & CRT Distortion',
    path: '/glitch-image-generator',
    icon: Zap,
    category: 'creative-art',
    description: 'Generate RGB chromatic aberration, datamoshing slice corruption, and retro CRT television scanlines.',
    badge: 'Cyberpunk FX',
    tag: 'RGB Split',
    formatTag: 'RGB ABERRATION',
    colorClass: 'text-purple-600 bg-purple-50 border-purple-200/80 dark:text-purple-400 dark:bg-purple-950/40 dark:border-purple-800/60'
  },
  {
    name: 'SVG Vectorizer',
    path: '/svg-vectorizer',
    icon: Feather,
    category: 'creative-art',
    description: 'Trace and digitize raster files (JPG/PNG) into scalable vector coordinates (SVG) with bezier handles.',
    badge: 'Vector Paths',
    tag: 'Raster2SVG',
    formatTag: 'AUTOTRACE · SVG',
    colorClass: 'text-amber-600 bg-amber-50 border-amber-200/80 dark:text-amber-400 dark:bg-amber-950/40 dark:border-amber-800/60'
  },
  {
    name: 'Instant Meme Generator',
    path: '/meme-generator',
    icon: Smile,
    category: 'creative-art',
    description: 'Design custom memes with bold Impact font captions, multi-layer draggable text, and custom font size.',
    badge: 'Meme Studio',
    tag: 'Impact Font',
    formatTag: 'MEME · IMPACT',
    colorClass: 'text-teal-600 bg-teal-50 border-teal-200/80 dark:text-teal-400 dark:bg-teal-950/40 dark:border-teal-800/60'
  },
  {
    name: 'AI Shape Art Generator',
    path: '/shape-art-generator',
    icon: Sparkles,
    category: 'creative-art',
    description: 'Transform photos into creative computational art composed of cosmic stars, blossoms, or particle sketches.',
    badge: 'Cosmic Sketch',
    tag: 'Particle Art',
    formatTag: 'PARTICLES · MESH',
    colorClass: 'text-indigo-600 bg-indigo-50 border-indigo-200/80 dark:text-indigo-400 dark:bg-indigo-950/40 dark:border-indigo-800/60'
  },
  {
    name: 'Ambient Generative Visuals',
    path: '/ambient',
    icon: Sparkles,
    category: 'creative-art',
    description: 'A quiet place on the internet. Continuously evolving generative liquid artwork for focus and calm.',
    badge: 'Calm & Focus',
    tag: 'Organic Flow',
    formatTag: 'GENERATIVE FLOW',
    colorClass: 'text-indigo-600 bg-indigo-50 border-indigo-200/80 dark:text-indigo-400 dark:bg-indigo-950/40 dark:border-indigo-800/60'
  },

  // 📐 Category 4: Layout, Social & Formats (7 tools)
  {
    name: 'Instagram Panorama Splitter',
    path: '/instagram-panorama-splitter',
    icon: Maximize2,
    category: 'layout-formats',
    description: 'Split wide panoramic landscape photos into seamless 4:5 portrait and 1:1 square swipe carousels.',
    badge: 'Seamless Swipe',
    tag: '4:5 Slices',
    formatTag: 'CAROUSEL · 4:5',
    colorClass: 'text-blue-600 bg-blue-50 border-blue-200/80 dark:text-blue-400 dark:bg-blue-950/40 dark:border-blue-800/60'
  },
  {
    name: 'Side-by-Side Combiner',
    path: '/side-by-side-image',
    icon: ArrowLeftRight,
    category: 'layout-formats',
    description: 'Combine two photos horizontally or vertically with customizable Before/After badges and divider borders.',
    badge: 'Before / After',
    tag: 'Dual Stitch',
    formatTag: 'BEFORE · AFTER',
    colorClass: 'text-blue-600 bg-blue-50 border-blue-200/80 dark:text-blue-400 dark:bg-blue-950/40 dark:border-blue-800/60'
  },
  {
    name: 'Photo Collage Maker',
    path: '/collage-maker',
    icon: LayoutGrid,
    category: 'layout-formats',
    description: 'Assemble multiple photos into dynamic grid layouts with custom gap spacing and border rounding.',
    badge: 'Grid Templates',
    tag: 'Snap Layout',
    formatTag: 'GRIDS · COLLAGE',
    colorClass: 'text-teal-600 bg-teal-50 border-teal-200/80 dark:text-teal-400 dark:bg-teal-950/40 dark:border-teal-800/60'
  },
  {
    name: 'Instagram Grid Splitter',
    path: '/instagram-grid-splitter',
    icon: Maximize2,
    category: 'layout-formats',
    description: 'Slice high-resolution photos into 3x3, 3x2, or 3x1 square grid tiles for creative profile feed layouts.',
    badge: '3x3 Grid',
    tag: '9-Tile Slice',
    formatTag: '3X3 · PROFILE',
    colorClass: 'text-amber-600 bg-amber-50 border-amber-200/80 dark:text-amber-400 dark:bg-amber-950/40 dark:border-amber-800/60'
  },
  {
    name: 'Canvas Border Expander',
    path: '/add-border-to-image',
    icon: Square,
    category: 'layout-formats',
    description: 'Add colored frames, frosted glass blurred padding, and soft drop shadows for social media feeds.',
    badge: 'Frames & Shadows',
    tag: 'Drop Shadow',
    formatTag: 'FRAMING · PADDING',
    colorClass: 'text-amber-600 bg-amber-50 border-amber-200/80 dark:text-amber-400 dark:bg-amber-950/40 dark:border-amber-800/60'
  },
  {
    name: 'Smart Image Compressor',
    path: '/image-compressor',
    icon: ImageIcon,
    category: 'layout-formats',
    description: 'Reduce JPEG, PNG, and WebP file sizes up to 90% locally with intelligent chroma subsampling.',
    badge: 'Popular',
    tag: 'Lossless WebP',
    formatTag: 'JPG · PNG · WEBP',
    colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-200/80 dark:text-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-800/60'
  },
  {
    name: 'Batch Format & PDF Converter',
    path: '/batch-converter',
    icon: Files,
    category: 'layout-formats',
    description: 'Convert and merge single or multiple images into PDF, WebP, PNG, or JPEG formats in bulk.',
    badge: 'Batch Ready',
    tag: 'Batch PDF',
    formatTag: 'WEBP · AVIF · PDF',
    colorClass: 'text-amber-600 bg-amber-50 border-amber-200/80 dark:text-amber-400 dark:bg-amber-950/40 dark:border-amber-800/60'
  },
];

const categories = [
  { id: 'all', label: 'All Tools', count: 28, icon: ImageIcon },
  { id: 'photo-editing', label: 'Photo & Image Studio', count: 7, icon: Wand2 },
  { id: 'privacy-security', label: 'Privacy, Security & Docs', count: 7, icon: ShieldAlert },
  { id: 'creative-art', label: 'Creative Art & Pixel FX', count: 7, icon: Sparkles },
  { id: 'layout-formats', label: 'Layout, Social & Formats', count: 7, icon: LayoutGrid }
];

export const Home: React.FC = () => {
  const location = useLocation();
  const locale = getLocaleFromPath(location.pathname);
  const t = UI_TRANSLATIONS[locale] || UI_TRANSLATIONS.en;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  // Auto-detect mobile screen width to default to ergonomic list mode on phones
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>(() => {
    return typeof window !== 'undefined' && window.innerWidth < 768 ? 'compact' : 'grid';
  });
  const [openHomeFaq, setOpenHomeFaq] = useState<number | null>(null);
  const [recentTools, setRecentTools] = useState<string[]>([]);

  // Load recently visited tools from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('imagecraft_recent_tools');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentTools(parsed);
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const trackToolVisit = (path: string) => {
    try {
      const stored = localStorage.getItem('imagecraft_recent_tools');
      const list: string[] = stored ? JSON.parse(stored) : [];
      const updated = [path, ...list.filter((p) => p !== path)].slice(0, 5);
      localStorage.setItem('imagecraft_recent_tools', JSON.stringify(updated));
      setRecentTools(updated);
    } catch {
      // Ignore localStorage errors
    }
  };

  // Auto-scroll to tools directory when navigated with #tools-grid
  useEffect(() => {
    if (location.hash === '#tools-grid') {
      const scrollTimer = setTimeout(() => {
        const el = document.getElementById('tools-grid');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      return () => clearTimeout(scrollTimer);
    }
  }, [location.hash]);

  const homeFaqs = t.faqs;

  const homeFaqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": homeFaqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  const spotlightTools = toolDirectory.filter(tool => [
    '/image-compressor',
    '/background-remover',
    '/crop-image',
    '/redact-image',
    '/batch-converter',
    '/aspect-resizer'
  ].includes(tool.path));

  const quickSearchTags = [
    'Compress',
    'AI Background',
    'Passport',
    'Redact',
    'WebP',
    'PDF',
    'Watermark',
    'EXIF'
  ];

  const filteredTools = toolDirectory.filter(tool => {
    const shortMeta = getShortToolMeta(tool.path, locale);
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
    const matchesSearch = shortMeta.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          shortMeta.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tool.badge.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tool.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tool.formatTag.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Desktop 4-Column Crisp Tool Card
  const renderToolCard = (tool: ToolItem) => {
    const Icon = tool.icon;
    const shortMeta = getShortToolMeta(tool.path, locale);
    const toolUrl = getLocalizedToolPath(tool.path, locale);

    return (
      <Link
        key={tool.path}
        to={toolUrl}
        onClick={() => trackToolVisit(tool.path)}
        className="crisp-tool-card group flex flex-col justify-between p-5 text-left cursor-pointer transition-all duration-200"
      >
        <div>
          {/* Card Top: Icon Box + Badge + Arrow */}
          <div className="flex items-start justify-between mb-3.5">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${tool.colorClass} group-hover:scale-105 transition-transform duration-200`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1.5">
              {tool.badge && (
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
                  {tool.badge}
                </span>
              )}
              <div className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Card Body */}
          <h3 className="font-extrabold text-[15px] text-slate-900 dark:text-slate-100 tracking-tight mb-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {shortMeta.name}
          </h3>
          <p className="text-[12.5px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium line-clamp-2">
            {shortMeta.desc}
          </p>
        </div>

        {/* Card Footer: Format tags & CTA */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
          <span className="font-mono font-semibold text-slate-500 dark:text-slate-400">
            {tool.formatTag}
          </span>
          <span className="font-bold text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex items-center gap-0.5 transition-colors">
            Launch <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </Link>
    );
  };

  // Mobile Ergonomic List Mode Card (Single Row, High Touch Target)
  const renderCompactToolRow = (tool: ToolItem) => {
    const Icon = tool.icon;
    const shortMeta = getShortToolMeta(tool.path, locale);
    const toolUrl = getLocalizedToolPath(tool.path, locale);

    return (
      <Link
        key={tool.path}
        to={toolUrl}
        onClick={() => trackToolVisit(tool.path)}
        className="crisp-tool-card flex items-center justify-between p-3.5 sm:p-4 text-left group transition-all duration-150 min-h-[64px]"
      >
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${tool.colorClass} group-hover:scale-105 transition-transform`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                {shortMeta.name}
              </h4>
              {tool.badge && (
                <span className="hidden sm:inline-block text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  {tool.badge}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-1 mt-0.5">
              {shortMeta.desc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 ml-3">
          <span className="hidden md:inline-block text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
            {tool.formatTag}
          </span>
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </Link>
    );
  };

  const renderEmptyState = () => (
    <div className="text-center py-16 px-4 w-full col-span-full">
      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <Search className="w-6 h-6 text-slate-400" />
      </div>
      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">No tools found matching your search</span>
      <p className="text-xs text-slate-400 mt-1">Try keywords like <em>crop</em>, <em>censor</em>, <em>pdf</em>, or <em>compress</em>.</p>
    </div>
  );

  return (
    <div className="w-full relative">
      <SEO 
        title="Free Privacy-First Image Tools" 
        description="Free browser-based image tools suite: compress images, remove backgrounds with AI, crop, rotate, censor, convert batch images, strip EXIF metadata, add watermarks, and generate pixel art. 100% offline, zero uploads." 
        keywords="free image tools, image compressor, AI background remover, crop image, rotate image, censor photo, EXIF metadata stripper, watermark tool, pixel art generator, ascii art, glitch photo editor"
        schema={homeFaqSchema}
      />

      {/* Background Dot Texture */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-dot-grid opacity-50 pointer-events-none -z-10" />

      {/* HERO SECTION */}
      <section className="text-center pt-8 pb-4 md:pt-14 md:pb-6 flex flex-col items-center justify-center relative overflow-hidden">
        
        {/* Anti-Cloud Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-full text-[10px] font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-widest mb-3.5 shadow-xs">
          <span className="px-1.5 py-0.2 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-[9px] mr-1">NEW</span>
          <span>Next-Gen Multi-Threaded WASM 2.0</span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 mb-3 max-w-4xl leading-[1.15]">
          Every image tool you need.<br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-600 to-indigo-500 dark:from-white dark:via-indigo-300 dark:to-indigo-400 font-black">
            Built with precision. 100% in your browser.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-2xl mb-6 leading-relaxed font-medium px-4">
          Compress, resize, edit, and convert photos with zero cloud uploads and instant local processing speed.
        </p>

        {/* SLEEK TACTILE CRAFT DOCK */}
        <HeroDropZone />

        {/* Trust Strip */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-7 mt-3 mb-6 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-indigo-600 text-xs shadow-xs">⚡</span>
            <span>0.0s Upload Latency</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-indigo-600 text-xs shadow-xs">🔒</span>
            <span>100% Local RAM Privacy</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-indigo-600 text-xs shadow-xs">📦</span>
            <span>Batch Multi-Threading</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-indigo-600 text-xs shadow-xs">🌐</span>
            <span>WebP · AVIF · SVG · PNG · JPG</span>
          </div>
        </div>

      </section>

      {/* RECENTLY USED RIBBON */}
      {recentTools.length > 0 && (
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-left animate-fade-in">
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Recently Used:</span>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              {recentTools.map(path => {
                const tool = toolDirectory.find(t => t.path === path);
                if (!tool) return null;
                const Icon = tool.icon;
                const shortMeta = getShortToolMeta(tool.path, locale);
                return (
                  <Link
                    key={tool.path}
                    to={getLocalizedToolPath(tool.path, locale)}
                    onClick={() => trackToolVisit(tool.path)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:border-indigo-400 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-2xs cursor-pointer"
                  >
                    <Icon className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{shortMeta.name}</span>
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('imagecraft_recent_tools');
                  setRecentTools([]);
                }}
                className="text-[10px] font-bold text-slate-400 hover:text-rose-500 px-2 py-1 transition-colors cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        </section>
      )}

      {/* CURATED FLAGSHIP SPOTLIGHT */}
      {!searchQuery && activeCategory === 'all' && (
        <section className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-left">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/60 text-[10px] font-extrabold uppercase tracking-wider mb-1.5">
                <Flame className="w-3.5 h-3.5" />
                <span>Curated Essentials</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Most Popular Workflows
              </h2>
            </div>
            <a
              href="#tools-grid"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View All 28 Tools</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {spotlightTools.map((tool) => renderToolCard(tool))}
          </div>
        </section>
      )}

      {/* TOOLS DIRECTORY SECTION (Search, Category Tabs, Grid/List) */}
      <section id="tools-grid" className="py-10 border-t border-slate-200/60 dark:border-slate-800 max-w-7xl mx-auto scroll-mt-20 px-4 sm:px-6 lg:px-8 text-left">
        
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-2">
            Complete Tools Directory
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
            Browse all 28 client-side image and document processing utilities.
          </p>
        </div>

        {/* Search Bar & Quick Search Chips */}
        <div className="w-full max-w-2xl mx-auto mb-6">
          <div className="relative mb-3">
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-3 bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all shadow-xs text-sm text-slate-800 dark:text-slate-100 font-medium placeholder-slate-400 dark:placeholder-slate-500"
            />
            <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Search Tag Chips */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Quick:</span>
            {quickSearchTags.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => setSearchQuery(tag)}
                className={`text-[11px] font-semibold px-2.5 py-0.8 rounded-lg border transition-all cursor-pointer ${
                  searchQuery.toLowerCase() === tag.toLowerCase()
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-600 dark:text-slate-300 border-slate-200/70 dark:border-slate-700'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        
        {/* Category Controls & View Switcher Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-slate-100/70 dark:bg-slate-900/50 p-2 sm:p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          
          {/* Horizontal Scrollable Category Tabs */}
          <div className="w-full md:w-auto overflow-x-auto no-scrollbar flex items-center gap-1.5 pb-1 md:pb-0">
            {categories.map((cat) => {
              const CatIcon = cat.icon;
              const catLabel = cat.id === 'all' ? t.allTools :
                               cat.id === 'photo-editing' ? (locale === 'es' ? 'Edición & Retoque' : locale === 'hi' ? 'फोटो एडिटिंग' : 'Photo Studio') :
                               cat.id === 'privacy-security' ? (locale === 'es' ? 'Privacidad & Docs' : locale === 'hi' ? 'प्राइवेसी व Docs' : 'Privacy & Docs') :
                               cat.id === 'creative-art' ? (locale === 'es' ? 'Arte & Pixel FX' : locale === 'hi' ? 'क्रिएटिव आर्ट' : 'Creative & FX') :
                               cat.id === 'layout-formats' ? (locale === 'es' ? 'Diseño & Formatos' : locale === 'hi' ? 'लेआउट व फॉर्मेट्स' : 'Layout & Formats') : cat.label;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-tight transition-all cursor-pointer border flex items-center gap-1.5 shrink-0 ${
                    activeCategory === cat.id
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 shadow-xs'
                      : 'bg-transparent border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/60'
                  }`}
                >
                  <CatIcon className="w-3.5 h-3.5 shrink-0" />
                  <span>{catLabel}</span>
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md ${activeCategory === cat.id ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'}`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* View Mode Toggle (Cards vs Ergonomic List) */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0 self-end md:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="4-Column Visual Cards"
            >
              <Layout className="w-3.5 h-3.5" />
              <span className="text-[11px]">Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('compact')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'compact'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Ergonomic Mobile List Mode"
            >
              <Table className="w-3.5 h-3.5" />
              <span className="text-[11px]">List</span>
            </button>
          </div>
        </div>

        {/* Results Info Bar when filtered */}
        {searchQuery && (
          <div className="mb-4 text-xs font-semibold text-slate-500 dark:text-slate-400 text-left flex items-center justify-between">
            <span>Showing {filteredTools.length} tools matching "{searchQuery}"</span>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Clear filter
            </button>
          </div>
        )}

        {/* Directory Presentation (Grid vs Ergonomic List Mode) */}
        {filteredTools.length === 0 ? (
          renderEmptyState()
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {filteredTools.map((tool) => renderToolCard(tool))}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 max-w-4xl mx-auto">
            {filteredTools.map((tool) => renderCompactToolRow(tool))}
          </div>
        )}

      </section>

      {/* THE CLIENT-SIDE ADVANTAGE BENTO ARCHITECTURE SHOWCASE */}
      <section className="py-14 border-t border-slate-200/60 dark:border-slate-800 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-3 py-1 rounded-full border border-indigo-200/60 dark:border-indigo-900/60">
            The Client-Side Advantage
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mt-2.5 mb-2">
            Engineered for speed. Built for private eyes.
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            Traditional image sites upload your photos to remote cloud servers. Image Craft executes every byte directly in your local hardware memory.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Bento Card 1: Zero Server Footprint */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white border border-indigo-900/50 shadow-lg flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-sky-400 mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight mb-1.5">
                Zero Server Storage
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                When you drag an image onto Image Craft, it decodes into WebAssembly canvas buffers in your device RAM. It is physically impossible for our servers to store or inspect your files.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-2 text-xs font-medium">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">⚡ Image Craft Latency</span>
                <span className="text-emerald-400 font-mono font-bold">0.02s (Local RAM)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">☁️ Cloud Photo Sites</span>
                <span className="text-rose-400 font-mono">8.4s (Upload lag)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">🛡️ Data Privacy</span>
                <span className="text-emerald-400 font-bold">100% On-Device</span>
              </div>
            </div>
          </div>

          {/* Bento Card 2: Parallel Web Workers */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-1.5">
                Parallel Web Workers
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                Our engine distributes compression and conversions across all available CPU threads. Process 100 images in parallel without freezing your browser tab.
              </p>
            </div>
            <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              <span>Multi-Core CPU Acceleration</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Bento Card 3: Next-Gen Codecs */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-800/80 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-1.5">
                Next-Gen Codecs
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                Native LibWebP and LibAVIF binary builds compiled directly into browser bytecode. Achieve 30-50% higher compression efficiency than standard JPEG encoders.
              </p>
            </div>
            <div className="text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1">
              <span>AVIF, WebP, SVG, PNG & JPG</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR FORMATS & QUICK CONVERSION MATRIX SECTION */}
      <section className="py-10 border-t border-slate-200/60 dark:border-slate-800 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <div className="text-center mb-8">
          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-900 uppercase tracking-widest">
            Preset Matrix
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight mt-2 mb-2">
            Popular Formats & Target Sizes
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto font-medium">
            Direct 1-click access to preset conversion and compression workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
          {/* Column 1: Format Converters */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Files className="w-4 h-4 text-indigo-500" />
              <span>Format Converters</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'PNG to JPG', path: '/png-to-jpg' },
                { label: 'JPG to PNG', path: '/jpg-to-png' },
                { label: 'WebP to JPG', path: '/webp-to-jpg' },
                { label: 'WebP to PNG', path: '/webp-to-png' },
                { label: 'HEIC to JPG', path: '/heic-to-jpg' },
                { label: 'SVG to PNG', path: '/svg-to-png' },
                { label: 'PNG to SVG', path: '/png-to-svg' },
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200/60 dark:border-slate-700/60 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all cursor-pointer"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Column 2: Target Size Compression */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">
              <ImageIcon className="w-4 h-4 text-indigo-500" />
              <span>Compression & Target Sizes</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'Compress to 100KB', path: '/compress-image-to-100kb' },
                { label: 'Compress to 50KB', path: '/compress-image-to-50kb' },
                { label: 'Compress to 20KB', path: '/compress-image-to-20kb' },
                { label: 'Compress PNG', path: '/compress-png' },
                { label: 'Compress JPEG', path: '/compress-jpeg' },
                { label: 'Compress WebP', path: '/compress-webp' },
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200/60 dark:border-slate-700/60 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all cursor-pointer"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Column 3: Specialized Tasks */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>Specialized Tasks</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'Photo Filters', path: '/photo-filters' },
                { label: 'Duotone Generator', path: '/duotone-generator' },
                { label: 'Invert Colors', path: '/invert-colors' },
                { label: 'Crop Image', path: '/crop-image' },
                { label: 'Passport Photo', path: '/passport-photo-cropper' },
                { label: 'Rotate & Flip', path: '/rotate-image' },
                { label: 'Add Border', path: '/add-border-to-image' },
                { label: 'Sign PDF Online', path: '/sign-pdf-online' },
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/80 hover:bg-purple-50 dark:hover:bg-purple-950/60 text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 border border-slate-200/60 dark:border-slate-700/60 hover:border-purple-200 dark:hover:border-purple-800 transition-all cursor-pointer"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ ACCORDION SECTION */}
      <section className="py-12 border-t border-slate-200/60 dark:border-slate-800 max-w-4xl mx-auto px-4 text-left">
        <div className="text-center mb-8">
          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-900 uppercase tracking-widest">
            FAQ
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight mt-2 mb-2">
            {t.faqTitle}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {t.faqSubtitle}
          </p>
        </div>

        <div className="space-y-3">
          {homeFaqs.map((faq, index) => {
            const isOpen = openHomeFaq === index;
            return (
              <div 
                key={index} 
                className="border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900/60 shadow-2xs transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenHomeFaq(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${isOpen ? 'rotate-90 text-indigo-600' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium border-t border-slate-100 dark:border-slate-800/60 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
