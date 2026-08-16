import React, { useState } from 'react';
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
  ArrowRight, 
  Files, 
  Fingerprint, 
  Copyright, 
  Crop, 
  Smile, 
  Feather, 
  Check, 
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
  ChevronRight
} from 'lucide-react';
import { SEO } from '../components/SEO';
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
}

const toolDirectory: ToolItem[] = [
  // 🪄 Category 1: Photo & Image Studio (7 tools)
  {
    name: 'AI Background Remover',
    path: '/background-remover',
    icon: Cpu,
    category: 'photo-editing',
    description: 'Isolate subjects and erase backgrounds automatically with local on-device neural AI cutout.',
    badge: 'Local Neural AI',
    tag: 'WASM AI',
    colorClass: 'text-purple-650 bg-purple-50 border-purple-100/60 dark:text-purple-400 dark:bg-purple-950/30 dark:border-purple-900/30'
  },
  {
    name: 'Interactive Image Cropper',
    path: '/crop-image',
    icon: Crop,
    category: 'photo-editing',
    description: 'Crop images with 8-handle touch canvas, 1:1, 4:5, 16:9, and official passport 2x2 in aspect ratios.',
    badge: 'Social & Passport',
    tag: 'Touch Crop',
    colorClass: 'text-indigo-650 bg-indigo-50 border-indigo-100/60 dark:text-indigo-400 dark:bg-indigo-950/30 dark:border-indigo-900/30'
  },
  {
    name: 'Image Rotator & Straightener',
    path: '/rotate-image',
    icon: RotateCw,
    category: 'photo-editing',
    description: 'Rotate 90°/180°, mirror flip horizontally/vertically, and level crooked horizon angles with grid overlay.',
    badge: 'Precision Geometry',
    tag: 'Angle Level',
    colorClass: 'text-blue-600 bg-blue-50 border-blue-100/60 dark:text-blue-400 dark:bg-blue-950/30 dark:border-blue-900/30'
  },
  {
    name: 'Image Adjuster & Color Tuner',
    path: '/adjust-image',
    icon: Sliders,
    category: 'photo-editing',
    description: 'Fine-tune exposure, contrast, saturation, temperature, tint, and sharpness with live split comparison.',
    badge: 'Pro Grading',
    tag: 'Live Split',
    colorClass: 'text-blue-600 bg-blue-50 border-blue-100/60 dark:text-blue-400 dark:bg-blue-950/30 dark:border-blue-900/30'
  },
  {
    name: 'Photo Filter & Duotone Studio',
    path: '/photo-filters',
    icon: Wand2,
    category: 'photo-editing',
    description: 'Apply 12 aesthetic presets or create custom dual-gradient duotone maps entirely in client memory.',
    badge: '12 Aesthetics',
    tag: 'Duotone Map',
    colorClass: 'text-purple-650 bg-purple-50 border-purple-100/60 dark:text-purple-400 dark:bg-purple-950/30 dark:border-purple-900/30'
  },
  {
    name: 'Color Inverter & B&W Converter',
    path: '/invert-colors',
    icon: Moon,
    category: 'photo-editing',
    description: 'Invert RGB channels to film negatives, solarize, or convert to 1-bit high-contrast Otsu black & white.',
    badge: 'Photo Negative',
    tag: 'Otsu B&W',
    colorClass: 'text-indigo-650 bg-indigo-50 border-indigo-100/60 dark:text-indigo-400 dark:bg-indigo-950/30 dark:border-indigo-900/30'
  },
  {
    name: 'Smart Aspect Resizer',
    path: '/aspect-resizer',
    icon: Crop,
    category: 'photo-editing',
    description: 'Resize and crop images to social media templates with canvas blur-padding presets and zero distortion.',
    badge: 'Social Media',
    tag: 'Blur Padding',
    colorClass: 'text-amber-600 bg-amber-50 border-amber-100/60 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-900/30'
  },

  // 🛡️ Category 2: Privacy, Security & Docs (7 tools)
  {
    name: 'Photo Redactor & Censor Tool',
    path: '/redact-image',
    icon: ShieldAlert,
    category: 'privacy-security',
    description: 'Permanently censor private data, blur faces, and blackout ID numbers with irreversible pixel obliteration.',
    badge: 'Zero Leak',
    tag: 'Face Blur',
    colorClass: 'text-red-650 bg-red-50 border-red-100/60 dark:text-red-400 dark:bg-red-950/30 dark:border-red-900/30'
  },
  {
    name: 'Image Steganography & Secret Text',
    path: '/image-steganography',
    icon: Lock,
    category: 'privacy-security',
    description: 'Invisibly hide encrypted secret messages and recovery seed phrases inside photos with LSB encoding.',
    badge: 'Cryptographic',
    tag: 'AES-256',
    colorClass: 'text-emerald-650 bg-emerald-50 border-emerald-100/60 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-900/30'
  },
  {
    name: 'EXIF Metadata Stripper',
    path: '/metadata-stripper',
    icon: Fingerprint,
    category: 'privacy-security',
    description: 'Inspect and purge GPS coordinates, camera serials, and privacy headers before sharing photos online.',
    badge: 'GPS Purge',
    tag: 'EXIF Clean',
    colorClass: 'text-red-600 bg-red-50 border-red-100/60 dark:text-red-400 dark:bg-red-950/30 dark:border-red-900/30'
  },
  {
    name: 'Batch Watermark Overlay',
    path: '/watermark-overlay',
    icon: Copyright,
    category: 'privacy-security',
    description: 'Stamp custom logos, tiled copyright text, and security marks across single or multiple images in bulk.',
    badge: 'Copyright Stamp',
    tag: 'Batch Stamp',
    colorClass: 'text-rose-600 bg-rose-50 border-rose-100/60 dark:text-rose-450 dark:bg-rose-950/30 dark:border-rose-900/30'
  },
  {
    name: 'Electronic PDF Signer',
    path: '/sign-pdf',
    icon: PenTool,
    category: 'privacy-security',
    description: 'Draw, type, or upload electronic signatures to sign PDF contracts and documents 100% offline.',
    badge: 'Offline Sign',
    tag: 'Vector Sign',
    colorClass: 'text-indigo-650 bg-indigo-50 border-indigo-100/60 dark:text-indigo-400 dark:bg-indigo-950/30 dark:border-indigo-900/30'
  },
  {
    name: 'Bank Statement Analyzer',
    path: '/bank-statement-analyzer',
    icon: CreditCard,
    category: 'privacy-security',
    description: 'Audit and convert PDF bank statements to Excel and CSV spreadsheets without third-party server exposure.',
    badge: 'Financial Audit',
    tag: 'PDF to CSV',
    colorClass: 'text-teal-650 bg-teal-50 border-teal-100/60 dark:text-teal-450 dark:bg-teal-950/30 dark:border-teal-900/30'
  },
  {
    name: 'OCR Text Extractor',
    path: '/ocr-text-extractor',
    icon: FileText,
    category: 'privacy-security',
    description: 'Extract multi-lingual text from receipts, documents, and screenshots using local Tesseract OCR.',
    badge: 'Multi-Lingual',
    tag: 'Local OCR',
    colorClass: 'text-emerald-650 bg-emerald-50 border-emerald-100/60 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-900/30'
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
    colorClass: 'text-fuchsia-650 bg-fuchsia-50 border-fuchsia-100/60 dark:text-fuchsia-400 dark:bg-fuchsia-950/30 dark:border-fuchsia-900/30'
  },
  {
    name: 'ASCII & Text Art Studio',
    path: '/ascii-art-generator',
    icon: Terminal,
    category: 'creative-art',
    description: 'Convert photos into terminal ASCII character artwork with Matrix phosphor green and ANSI colors.',
    badge: 'Matrix Green',
    tag: 'ASCII Copy',
    colorClass: 'text-emerald-650 bg-emerald-50 border-emerald-100/60 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-900/30'
  },
  {
    name: 'Glitch Art & CRT Distortion',
    path: '/glitch-image-generator',
    icon: Zap,
    category: 'creative-art',
    description: 'Generate RGB chromatic aberration, datamoshing slice corruption, and retro CRT television scanlines.',
    badge: 'Cyberpunk FX',
    tag: 'RGB Split',
    colorClass: 'text-violet-650 bg-violet-50 border-violet-100/60 dark:text-violet-400 dark:bg-violet-950/30 dark:border-violet-900/30'
  },
  {
    name: 'SVG Vectorizer',
    path: '/svg-vectorizer',
    icon: Feather,
    category: 'creative-art',
    description: 'Trace and digitize raster files (JPG/PNG) into scalable vector coordinates (SVG) with bezier handles.',
    badge: 'Vector Paths',
    tag: 'Raster2SVG',
    colorClass: 'text-teal-600 bg-teal-50 border-teal-100/60 dark:text-teal-400 dark:bg-teal-950/30 dark:border-teal-900/30'
  },
  {
    name: 'Instant Meme Generator',
    path: '/meme-generator',
    icon: Smile,
    category: 'creative-art',
    description: 'Design custom memes with bold Impact font captions, multi-layer draggable text, and custom font size.',
    badge: 'Meme Studio',
    tag: 'Impact Font',
    colorClass: 'text-green-600 bg-green-50 border-green-100/60 dark:text-green-400 dark:bg-green-950/30 dark:border-green-900/30'
  },
  {
    name: 'AI Shape Art Generator',
    path: '/shape-art-generator',
    icon: Sparkles,
    category: 'creative-art',
    description: 'Transform photos into creative computational art composed of cosmic stars, blossoms, or particle sketches.',
    badge: 'Cosmic Sketch',
    tag: 'Particle Art',
    colorClass: 'text-indigo-605 bg-indigo-50 border-indigo-100/60 dark:text-indigo-400 dark:bg-indigo-950/30 dark:border-indigo-900/30'
  },
  {
    name: 'Ambient Generative Visuals',
    path: '/ambient',
    icon: Sparkles,
    category: 'creative-art',
    description: 'A quiet place on the internet. Continuously evolving generative liquid artwork for focus and calm.',
    badge: 'Calm & Focus',
    tag: 'Organic Flow',
    colorClass: 'text-indigo-600 bg-indigo-50 border-indigo-100/60 dark:text-indigo-400 dark:bg-indigo-950/30 dark:border-indigo-900/30'
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
    colorClass: 'text-pink-650 bg-pink-50 border-pink-100/60 dark:text-pink-400 dark:bg-pink-950/30 dark:border-pink-900/30'
  },
  {
    name: 'Side-by-Side Combiner',
    path: '/side-by-side-image',
    icon: ArrowLeftRight,
    category: 'layout-formats',
    description: 'Combine two photos horizontally or vertically with customizable Before/After badges and divider borders.',
    badge: 'Before / After',
    tag: 'Dual Stitch',
    colorClass: 'text-blue-650 bg-blue-50 border-blue-100/60 dark:text-blue-400 dark:bg-blue-950/30 dark:border-blue-900/30'
  },
  {
    name: 'Photo Collage Maker',
    path: '/collage-maker',
    icon: LayoutGrid,
    category: 'layout-formats',
    description: 'Assemble multiple photos into dynamic grid layouts with custom gap spacing and border rounding.',
    badge: 'Grid Templates',
    tag: 'Snap Layout',
    colorClass: 'text-pink-655 bg-pink-50 border-pink-100/60 dark:text-pink-400 dark:bg-pink-950/30 dark:border-pink-900/30'
  },
  {
    name: 'Instagram Grid Splitter',
    path: '/instagram-grid-splitter',
    icon: Maximize2,
    category: 'layout-formats',
    description: 'Slice high-resolution photos into 3x3, 3x2, or 3x1 square grid tiles for creative profile feed layouts.',
    badge: '3x3 Profile Grid',
    tag: '9-Tile Slice',
    colorClass: 'text-orange-600 bg-orange-50 border-orange-100/60 dark:text-orange-400 dark:bg-orange-950/30 dark:border-orange-900/30'
  },
  {
    name: 'Canvas Border Expander',
    path: '/add-border-to-image',
    icon: Square,
    category: 'layout-formats',
    description: 'Add colored frames, frosted glass blurred padding, and soft drop shadows for social media feeds.',
    badge: 'Framing & Halo',
    tag: 'Drop Shadow',
    colorClass: 'text-amber-600 bg-amber-50 border-amber-100/60 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-900/30'
  },
  {
    name: 'Smart Image Compressor',
    path: '/image-compressor',
    icon: ImageIcon,
    category: 'layout-formats',
    description: 'Reduce JPEG, PNG, and WebP file sizes up to 90% locally with intelligent chroma subsampling.',
    badge: 'Up to -90% Size',
    tag: 'Lossless WebP',
    colorClass: 'text-indigo-650 bg-indigo-50 border-indigo-100/60 dark:text-indigo-400 dark:bg-indigo-950/30 dark:border-indigo-900/30'
  },
  {
    name: 'Batch Format & PDF Converter',
    path: '/batch-converter',
    icon: Files,
    category: 'layout-formats',
    description: 'Convert and merge single or multiple images into PDF, WebP, PNG, or JPEG formats in bulk.',
    badge: 'Bulk Conversion',
    tag: 'Batch PDF',
    colorClass: 'text-indigo-650 bg-indigo-50 border-indigo-100/60 dark:text-indigo-400 dark:bg-indigo-950/30 dark:border-indigo-900/30'
  },
];

const categories = [
  { id: 'all', label: 'All Tools', count: 28, icon: ImageIcon, colorClass: 'text-indigo-650 bg-indigo-50 border-indigo-100/60 dark:text-indigo-400 dark:bg-indigo-950/30 dark:border-indigo-900/30' },
  { id: 'photo-editing', label: 'Photo & Image Studio', count: 7, icon: Wand2, colorClass: 'text-purple-650 bg-purple-50 border-purple-100/60 dark:text-purple-400 dark:bg-purple-950/30 dark:border-purple-900/30' },
  { id: 'privacy-security', label: 'Privacy, Security & Docs', count: 7, icon: ShieldAlert, colorClass: 'text-rose-650 bg-rose-50 border-rose-100/60 dark:text-rose-400 dark:bg-rose-950/30 dark:border-rose-900/30' },
  { id: 'creative-art', label: 'Creative Art & Pixel FX', count: 7, icon: Sparkles, colorClass: 'text-fuchsia-650 bg-fuchsia-50 border-fuchsia-100/60 dark:text-fuchsia-400 dark:bg-fuchsia-950/30 dark:border-fuchsia-900/30' },
  { id: 'layout-formats', label: 'Layout, Social & Formats', count: 7, icon: LayoutGrid, colorClass: 'text-amber-650 bg-amber-50 border-amber-100/60 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-900/30' }
];

const renderToolPreview = (path: string) => {
  switch (path) {
    // 1. AI Background Remover
    case '/background-remover':
      return (
        <div className="w-full h-28 rounded-2xl bg-zinc-950 border border-zinc-800/80 mb-3.5 overflow-hidden relative flex items-center justify-center select-none group-hover:border-purple-500/50 transition-colors">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: 'linear-gradient(45deg, #1c1c20 25%, transparent 25%), linear-gradient(-45deg, #1c1c20 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1c1c20 75%), linear-gradient(-45deg, transparent 75%, #1c1c20 75%)',
              backgroundSize: '12px 12px',
              backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px'
            }}
          />
          <div className="absolute inset-y-0 left-0 w-1/2 bg-emerald-950/70 border-r border-emerald-500/30 flex items-center justify-center">
            <span className="text-[7.5px] font-black text-emerald-400/90 uppercase tracking-widest absolute top-1.5 left-2">Original</span>
          </div>
          <span className="text-[7.5px] font-black text-purple-400 uppercase tracking-widest absolute top-1.5 right-2">Cutout</span>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-9 h-9 rounded-full bg-gradient-to-b from-purple-400 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 border-2 border-white/20">
              <Cpu className="w-4.5 h-4.5" />
            </div>
            <div className="w-14 h-4 rounded-t-xl bg-purple-500/40 mt-1 border-t border-purple-400/40" />
          </div>
          <div className="absolute inset-y-0 w-1 bg-gradient-to-b from-purple-400 via-white to-purple-400 shadow-[0_0_12px_#a855f7] animate-wipe-x z-20" />
        </div>
      );

    // 2. Interactive Image Cropper
    case '/crop-image':
      return (
        <div className="w-full h-28 rounded-2xl bg-zinc-950 border border-zinc-800/80 mb-3.5 overflow-hidden relative flex items-center justify-center select-none group-hover:border-indigo-500/50 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950 via-slate-900 to-zinc-900 opacity-60" />
          <div className="w-24 h-20 border border-slate-800 grid grid-cols-3 grid-rows-3 opacity-30">
            {Array.from({ length: 9 }).map((_, i) => <div key={i} className="border border-slate-800" />)}
          </div>
          <div className="absolute border-2 border-indigo-400 bg-indigo-500/15 shadow-[0_0_15px_rgba(99,102,241,0.3)] animate-crop-box flex items-center justify-center">
            <div className="w-full h-full grid grid-cols-3 grid-rows-3 opacity-40">
              {Array.from({ length: 9 }).map((_, i) => <div key={i} className="border border-indigo-300/40" />)}
            </div>
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-white border border-indigo-600 rounded-xs" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-white border border-indigo-600 rounded-xs" />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white border border-indigo-600 rounded-xs" />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white border border-indigo-600 rounded-xs" />
          </div>
          <div className="absolute bottom-1.5 right-2 bg-slate-900/90 border border-slate-800 px-2 py-0.5 rounded text-[7.5px] font-black text-indigo-400 uppercase tracking-widest z-20">
            1:1 • 4:5 • 16:9 • ID
          </div>
        </div>
      );

    // 3. Image Rotator & Straightener
    case '/rotate-image':
      return (
        <div className="w-full h-28 rounded-2xl bg-zinc-950 border border-zinc-800/80 mb-3.5 overflow-hidden relative flex items-center justify-center select-none group-hover:border-blue-500/50 transition-colors">
          <div className="w-20 h-20 rounded-full border border-dashed border-blue-500/30 flex items-center justify-center relative">
            <span className="absolute -top-2 text-[7px] font-bold text-blue-400">0°</span>
            <span className="absolute -right-3 text-[7px] font-bold text-blue-400">90°</span>
            <span className="absolute -bottom-2 text-[7px] font-bold text-blue-400">180°</span>
            <span className="absolute -left-3 text-[7px] font-bold text-blue-400">270°</span>
            <div className="w-11 h-8 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 border border-white/40 shadow-lg shadow-blue-500/20 flex items-center justify-center text-white animate-rotate-dial">
              <RotateCw className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="absolute bottom-1.5 left-2 bg-slate-900/90 border border-slate-800 px-2 py-0.5 rounded text-[7px] font-bold text-blue-400">
            Level Tilt: 0.0°
          </div>
        </div>
      );

    // 4. Canvas Border Expander
    case '/add-border-to-image':
      return (
        <div className="w-full h-28 rounded-2xl bg-zinc-950 border border-zinc-800/80 mb-3.5 overflow-hidden relative flex items-center justify-center p-3 select-none group-hover:border-amber-500/50 transition-colors">
          <div className="w-28 h-18 rounded-xl bg-gradient-to-tr from-amber-500/20 via-rose-500/20 to-indigo-500/20 p-2 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/10">
            <div className="w-full h-full rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-transparent" />
              <Square className="w-4 h-4 text-amber-400" />
              <span className="text-[7.5px] font-bold text-amber-300 ml-1.5">Border Frame</span>
            </div>
          </div>
        </div>
      );

    // 5. Photo Filter & Duotone Studio
    case '/photo-filters':
      return (
        <div className="w-full h-28 rounded-2xl bg-zinc-950 border border-zinc-800/80 mb-3.5 overflow-hidden relative flex items-center justify-center select-none group-hover:border-purple-500/50 transition-colors">
          <div className="w-full h-full grid grid-cols-3">
            <div className="bg-gradient-to-b from-amber-800/60 to-amber-950/80 border-r border-zinc-800 flex flex-col items-center justify-center">
              <span className="text-[7px] font-black text-amber-300 uppercase tracking-wider">Sepia</span>
            </div>
            <div className="bg-gradient-to-b from-fuchsia-600/70 to-cyan-700/80 border-r border-zinc-800 flex flex-col items-center justify-center">
              <span className="text-[7px] font-black text-white uppercase tracking-wider">Duotone</span>
            </div>
            <div className="bg-gradient-to-b from-zinc-700 to-zinc-950 flex flex-col items-center justify-center">
              <span className="text-[7px] font-black text-zinc-300 uppercase tracking-wider">Noir</span>
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-8 h-8 rounded-full bg-purple-600/80 border border-white/40 flex items-center justify-center text-white shadow-xl shadow-purple-500/30">
              <Wand2 className="w-4 h-4" />
            </div>
          </div>
        </div>
      );

    // 6. Color Inverter & B&W Converter
    case '/invert-colors':
      return (
        <div className="w-full h-28 rounded-2xl bg-zinc-950 border border-zinc-800/80 mb-3.5 overflow-hidden relative flex items-center justify-center select-none group-hover:border-indigo-500/50 transition-colors">
          <div className="w-full h-full flex">
            <div className="w-1/2 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[8px] font-black">
              RGB Color
            </div>
            <div className="w-1/2 bg-zinc-950 flex items-center justify-center text-zinc-100 text-[8px] font-mono font-black border-l-2 border-white/60">
              Negative
            </div>
          </div>
          <div className="absolute inset-y-0 w-1 bg-white shadow-[0_0_10px_white] animate-wipe-x" />
        </div>
      );

    // 7. Smart Aspect Resizer
    case '/aspect-resizer':
      return (
        <div className="w-full h-28 rounded-2xl bg-zinc-950 border border-zinc-800/80 mb-3.5 overflow-hidden relative flex items-center justify-center gap-2 select-none group-hover:border-amber-500/50 transition-colors p-2">
          {/* 1:1 Box with Blur Margin */}
          <div className="w-16 h-16 rounded-xl bg-amber-500/10 border border-amber-500/30 p-1 flex flex-col items-center justify-center relative shadow-md">
            <div className="absolute inset-0 bg-amber-400/10 blur-sm rounded-xl" />
            <span className="text-[7.5px] font-black text-amber-400 z-10">1:1 Square</span>
            <span className="text-[6.5px] font-mono text-zinc-400 z-10 mt-0.5">Blur Pad</span>
          </div>
          {/* 16:9 Box */}
          <div className="w-20 h-12 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shadow-xs">
            <span className="text-[7px] font-black text-indigo-300">16:9 Feed</span>
          </div>
        </div>
      );

    // 8. Image Adjuster & Color Tuner
    case '/adjust-image':
      return (
        <div className="w-full h-28 rounded-2xl bg-zinc-950 border border-zinc-800/80 mb-3.5 overflow-hidden relative flex items-center justify-center select-none group-hover:border-blue-500/50 transition-colors">
          <div className="w-full h-full flex">
            <div className="w-1/2 bg-slate-900/90 flex flex-col items-center justify-center opacity-40">
              <span className="text-[7.5px] font-bold text-slate-400">Dim</span>
            </div>
            <div className="w-1/2 bg-gradient-to-tr from-blue-600 via-indigo-500 to-sky-400 flex flex-col items-center justify-center">
              <span className="text-[7.5px] font-black text-white">HDR Enhance</span>
            </div>
          </div>
          <div className="absolute inset-y-0 w-1 bg-blue-400 shadow-[0_0_12px_#60a5fa] animate-wipe-x z-10" />
          <div className="absolute bottom-1.5 right-2 bg-slate-900/90 border border-slate-800 px-2 py-0.5 rounded text-[7px] font-black text-blue-400 uppercase tracking-wider z-20">
            Auto Contrast
          </div>
        </div>
      );

    // 8. Photo Redactor & Censor Tool
    case '/redact-image':
      return (
        <div className="w-full h-28 rounded-2xl bg-zinc-950 border border-zinc-800/80 mb-3.5 p-3 overflow-hidden relative flex flex-col justify-between select-none group-hover:border-red-500/50 transition-colors">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 blur-[2px] flex items-center justify-center" />
            <div className="flex-1 space-y-1">
              <div className="w-full h-2 bg-zinc-950 rounded border border-zinc-900 relative">
                <div className="absolute inset-y-0 left-0 w-3/4 bg-black border border-red-500/40 rounded" />
              </div>
              <div className="w-2/3 h-2 bg-zinc-950 rounded border border-zinc-900 relative">
                <div className="absolute inset-y-0 left-0 w-1/2 bg-black border border-red-500/40 rounded" />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-zinc-900 pt-1.5">
            <span className="text-[7px] font-bold text-zinc-500">Document Redaction</span>
            <span className="text-[7px] font-black text-red-400 bg-red-950/60 border border-red-900/60 px-1.5 py-0.5 rounded">
              CENSORED
            </span>
          </div>
        </div>
      );

    // 9. Image Steganography & Secret Text
    case '/image-steganography':
      return (
        <div className="w-full h-28 rounded-2xl bg-[#080d14] border border-zinc-800/80 mb-3.5 p-2.5 overflow-hidden relative flex flex-col justify-between select-none group-hover:border-emerald-500/50 transition-colors">
          <div className="font-mono text-[7px] text-emerald-500/60 leading-tight tracking-wider truncate">
            01010011 01000101 01000011 01010010 01000101 01010100
          </div>
          <div className="flex items-center justify-center gap-2 my-auto">
            <div className="w-7 h-7 rounded-lg bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md shadow-emerald-500/10 animate-float-subtle">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <span className="text-[8.5px] font-mono font-bold text-emerald-400">Secret Embedded</span>
          </div>
          <div className="flex items-center justify-between text-[7px] font-mono text-zinc-500 border-t border-zinc-900 pt-1">
            <span>LSB Encoding</span>
            <span className="text-emerald-400 font-bold">AES-256</span>
          </div>
        </div>
      );

    // 10. EXIF Metadata Stripper
    case '/metadata-stripper':
      return (
        <div className="w-full h-28 rounded-2xl bg-zinc-950 border border-zinc-800/80 mb-3.5 p-2.5 overflow-hidden relative flex flex-col justify-between select-none group-hover:border-red-500/50 transition-colors">
          <div className="space-y-0.5">
            <div className="flex items-center justify-between text-[7px] font-mono text-zinc-500">
              <span>GPS: 37.7749° N, 122.4194° W</span>
              <span className="text-red-400 font-black">PURGED</span>
            </div>
            <div className="text-[7.5px] font-mono text-zinc-400">Sony A7R IV • 85mm f/1.4</div>
          </div>
          <div className="w-full h-0.5 bg-red-500/20 relative overflow-hidden rounded">
            <div className="absolute inset-y-0 w-1/3 bg-red-500 animate-wipe-x" />
          </div>
          <div className="flex items-center justify-between border-t border-zinc-900 pt-1">
            <span className="text-[7px] font-bold text-zinc-500">Privacy Status</span>
            <span className="text-[7.5px] font-black text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> CLEAN
            </span>
          </div>
        </div>
      );

    // 11. Pixel Art & 8-Bit Converter
    case '/pixel-art-generator':
      return (
        <div className="w-full h-28 rounded-2xl bg-zinc-950 border border-zinc-800/80 mb-3.5 overflow-hidden relative flex items-center justify-center select-none group-hover:border-fuchsia-500/50 transition-colors">
          <div className="w-24 h-16 bg-[#8bac0f] border-2 border-[#0f380f] rounded-lg grid grid-cols-8 grid-rows-6 gap-0.5 p-1 shadow-md shadow-fuchsia-500/10">
            {Array.from({ length: 48 }).map((_, i) => {
              const dither = (i % 2 === 0 && (i % 7 < 3)) ? 'bg-[#0f380f]' : (i % 3 === 0) ? 'bg-[#306230]' : 'bg-[#9bbc0f]';
              return <div key={i} className={`rounded-none ${dither}`} />;
            })}
          </div>
          <div className="absolute bottom-1.5 right-2 bg-black/90 border border-fuchsia-500/40 px-2 py-0.5 rounded text-[7px] font-black text-fuchsia-400 uppercase tracking-widest font-mono">
            8-BIT GAMEBOY
          </div>
        </div>
      );

    // 12. ASCII & Text Art Generator
    case '/ascii-art-generator':
      return (
        <div className="w-full h-28 rounded-2xl bg-black border border-emerald-900/60 mb-3.5 p-2 overflow-hidden relative flex flex-col justify-center select-none group-hover:border-emerald-500/50 transition-colors font-mono">
          <div className="text-[6.5px] text-emerald-450 leading-[7px] tracking-tighter opacity-80 select-none">
            @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@<br/>
            @@@@@@@@@@%##**+===*#%@@@@@@@@@@<br/>
            @@@@@@@#*+=--:.....:-=+*#@@@@@@@<br/>
            @@@@@#+=:..  Image  ..:-=+%@@@@@<br/>
            @@@@*=:..   Plumber   ..:=*@@@@@<br/>
            @@@@@#+=:..  ASCII  ..:-=+%@@@@@<br/>
            @@@@@@@#*+=--:.....:-=+*#@@@@@@@<br/>
            @@@@@@@@@@%##**+===*#%@@@@@@@@@@
          </div>
          <div className="absolute bottom-1.5 right-2 bg-emerald-950/90 border border-emerald-500/40 px-1.5 py-0.5 rounded text-[6.5px] font-black text-emerald-400 uppercase tracking-wider">
            ANSI MATRIX
          </div>
        </div>
      );

    // 13. Glitch Art & CRT Distortion
    case '/glitch-image-generator':
      return (
        <div className="w-full h-28 rounded-2xl bg-zinc-950 border border-zinc-800/80 mb-3.5 overflow-hidden relative flex items-center justify-center select-none group-hover:border-violet-500/50 transition-colors">
          <div 
            className="absolute inset-0 z-20 pointer-events-none opacity-40"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.4) 0px, rgba(0, 0, 0, 0.4) 1px, transparent 1px, transparent 2px)',
            }}
          />
          <div className="relative font-black text-xl tracking-wider animate-glitch-fx z-10 select-none text-white">
            <span className="text-cyan-400">GL</span>
            <span className="text-fuchsia-500">IT</span>
            <span className="text-amber-400">CH</span>
          </div>
          <div className="absolute bottom-1.5 left-2 bg-violet-950/80 border border-violet-700/60 px-2 py-0.5 rounded text-[7px] font-black text-violet-300 uppercase tracking-widest z-30">
            CRT & RGB Split
          </div>
        </div>
      );

    // 14. Side-by-Side Combiner
    case '/side-by-side-image':
      return (
        <div className="w-full h-28 rounded-2xl bg-zinc-950 border border-zinc-800/80 mb-3.5 overflow-hidden relative flex items-center justify-center select-none group-hover:border-blue-500/50 transition-colors p-2">
          <div className="w-full h-full rounded-xl overflow-hidden flex border border-zinc-700 shadow-md">
            <div className="w-1/2 bg-gradient-to-br from-slate-800 to-slate-900 relative flex items-center justify-center">
              <span className="text-[7.5px] font-black text-white bg-black/70 px-1.5 py-0.5 rounded absolute top-1.5 left-1.5">BEFORE</span>
              <ImageIcon className="w-5 h-5 text-slate-500" />
            </div>
            <div className="w-0.5 bg-blue-500 shadow-[0_0_8px_#3b82f6] z-10" />
            <div className="w-1/2 bg-gradient-to-br from-blue-600 to-indigo-600 relative flex items-center justify-center">
              <span className="text-[7.5px] font-black text-white bg-blue-900/80 px-1.5 py-0.5 rounded absolute top-1.5 right-1.5">AFTER</span>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      );

    // 15. Instagram Panorama Splitter
    case '/instagram-panorama-splitter':
      return (
        <div className="w-full h-28 rounded-2xl bg-zinc-950 border border-zinc-800/80 mb-3.5 overflow-hidden relative flex items-center justify-center select-none group-hover:border-pink-500/50 transition-colors p-2">
          <div className="flex gap-1.5 items-center">
            <div className="w-14 h-20 rounded-lg bg-zinc-900 border border-pink-500/40 p-1 flex flex-col justify-between relative overflow-hidden shadow-md">
              <div className="text-[6.5px] font-bold text-pink-400">Slide 1 (4:5)</div>
              <div className="w-full h-10 bg-gradient-to-r from-pink-500/30 to-purple-500/30 rounded" />
              <div className="text-[6px] text-zinc-500">1 of 2</div>
            </div>
            <div className="text-pink-500 font-black text-xs">→</div>
            <div className="w-14 h-20 rounded-lg bg-zinc-900 border border-pink-500/40 p-1 flex flex-col justify-between relative overflow-hidden shadow-md">
              <div className="text-[6.5px] font-bold text-pink-400">Slide 2 (4:5)</div>
              <div className="w-full h-10 bg-gradient-to-r from-purple-500/30 to-indigo-500/30 rounded" />
              <div className="text-[6px] text-zinc-500">2 of 2</div>
            </div>
          </div>
          <div className="absolute bottom-1.5 right-2 bg-pink-950/90 border border-pink-500/40 px-1.5 py-0.5 rounded text-[6.5px] font-black text-pink-300 uppercase tracking-wider">
            Seamless Swipe
          </div>
        </div>
      );

    // 16. Photo Collage Maker
    case '/collage-maker':
      return (
        <div className="w-full h-28 rounded-2xl bg-zinc-950 border border-zinc-800/80 mb-3.5 p-2 overflow-hidden relative grid grid-cols-3 gap-1 select-none group-hover:border-pink-500/50 transition-colors">
          <div className="bg-indigo-500/20 border border-indigo-500/30 rounded-lg flex items-center justify-center text-[9px] text-indigo-400 font-bold">1</div>
          <div className="col-span-2 grid grid-rows-2 gap-1">
            <div className="bg-pink-500/20 border border-pink-500/30 rounded-lg flex items-center justify-center text-[8px] text-pink-400 font-bold">2</div>
            <div className="bg-teal-500/20 border border-teal-500/30 rounded-lg flex items-center justify-center text-[8px] text-teal-400 font-bold">3</div>
          </div>
        </div>
      );

    // 17. Instagram Grid Splitter
    case '/instagram-grid-splitter':
      return (
        <div className="w-full h-28 rounded-2xl bg-zinc-950 border border-zinc-800/80 mb-3.5 p-2 overflow-hidden relative flex items-center justify-center select-none group-hover:border-orange-500/50 transition-colors">
          <div className="w-20 h-20 bg-zinc-900 border border-zinc-800 grid grid-cols-3 grid-rows-3 gap-0.5 p-0.5 shadow-sm rounded-lg">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="bg-orange-500/15 border border-orange-500/20 rounded-xs flex items-center justify-center text-[6.5px] text-orange-400 font-black">
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      );

    // 18. Smart Image Compressor
    case '/image-compressor':
      return (
        <div className="w-full h-28 rounded-2xl bg-zinc-950 border border-zinc-800/80 mb-3.5 overflow-hidden relative flex items-center justify-center gap-2 select-none group-hover:border-indigo-500/50 transition-colors px-2">
          <div className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-center flex flex-col">
            <span className="text-[6.5px] text-zinc-500 font-bold uppercase">Original</span>
            <span className="text-[9px] text-zinc-300 font-extrabold">4.8 MB</span>
          </div>
          <div className="text-indigo-400">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
          <div className="px-2 py-1 bg-indigo-950/60 border border-indigo-500/40 rounded-lg text-center flex flex-col shadow-md shadow-indigo-500/10">
            <span className="text-[6.5px] text-emerald-400 font-bold uppercase">-91% Saved</span>
            <span className="text-[9px] text-indigo-300 font-extrabold">420 KB</span>
          </div>
        </div>
      );

    // 19. Batch Format & PDF Converter
    case '/batch-converter':
      return (
        <div className="w-full h-28 rounded-2xl bg-zinc-950 border border-zinc-800/80 mb-3.5 overflow-hidden relative flex items-center justify-center select-none group-hover:border-indigo-500/50 transition-colors">
          <div className="flex -space-x-2 relative">
            <div className="w-8 h-11 rounded bg-zinc-900 border border-zinc-700 shadow-xs flex items-center justify-center text-[7px] font-bold text-rose-400 rotate-[-6deg]">PNG</div>
            <div className="w-8 h-11 rounded bg-zinc-900 border border-zinc-700 shadow-sm flex items-center justify-center text-[7px] font-bold text-sky-400 rotate-[4deg] z-10">WEBP</div>
            <div className="w-8 h-11 rounded bg-indigo-600 text-white shadow-md flex flex-col items-center justify-center text-[8px] font-black rotate-[12deg] z-20">
              <span>PDF</span>
            </div>
          </div>
        </div>
      );

    // 20. Batch Watermark Overlay
    case '/watermark-overlay':
      return (
        <div className="w-full h-28 rounded-2xl bg-zinc-950 border border-zinc-800/80 mb-3.5 overflow-hidden relative flex items-center justify-center select-none group-hover:border-rose-500/50 transition-colors">
          <div className="absolute inset-0 flex flex-col justify-center gap-2.5 rotate-[-15deg] scale-110 opacity-20">
            <div className="text-[7px] text-white font-bold tracking-widest whitespace-nowrap">COPYRIGHT © CONFIDENTIAL</div>
            <div className="text-[7px] text-white font-bold tracking-widest whitespace-nowrap translate-x-3">COPYRIGHT © CONFIDENTIAL</div>
          </div>
          <div className="px-2.5 py-0.5 rounded-lg bg-rose-950/80 border border-rose-500/40 text-[8px] font-black text-rose-300 uppercase tracking-widest z-10 shadow-md">
            Watermark Stamp
          </div>
        </div>
      );

    // 21. Electronic PDF Signer
    case '/sign-pdf':
      return (
        <div className="w-full h-28 rounded-2xl bg-zinc-950 border border-zinc-800/80 mb-3.5 p-2.5 overflow-hidden relative flex flex-col justify-between select-none group-hover:border-indigo-500/50 transition-colors">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-1.5">
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[7.5px] font-bold text-zinc-400">contract_agreement.pdf</span>
          </div>
          <div className="flex-1 flex items-center justify-end pr-3 relative">
            <div className="flex flex-col items-center">
              <span className="font-serif italic text-indigo-300 text-[11px] translate-y-1">Verified Signature</span>
              <div className="w-20 h-0.5 bg-indigo-500/40" />
            </div>
            <div className="absolute top-1 right-1 text-indigo-400 animate-pulse">
              <PenTool className="w-3.5 h-3.5 rotate-45" />
            </div>
          </div>
        </div>
      );

    // 22. Bank Statement Analyzer
    case '/bank-statement-analyzer':
      return (
        <div className="w-full h-28 rounded-2xl bg-zinc-950 border border-zinc-800/80 mb-3.5 p-2.5 overflow-hidden relative flex flex-col justify-between select-none group-hover:border-teal-500/50 transition-colors">
          <div className="grid grid-cols-4 gap-1 text-[7px] font-bold text-zinc-500 border-b border-zinc-800 pb-1">
            <span>Date</span>
            <span>Desc</span>
            <span className="text-right">Credit</span>
            <span className="text-right">Debit</span>
          </div>
          <div className="space-y-0.5">
            <div className="grid grid-cols-4 gap-1 text-[7px] font-bold text-zinc-300">
              <span>24 Jun</span>
              <span className="truncate">Stripe Payout</span>
              <span className="text-right text-emerald-400">+$2.4k</span>
              <span className="text-right text-zinc-600">-</span>
            </div>
            <div className="grid grid-cols-4 gap-1 text-[7px] font-bold text-zinc-300">
              <span>25 Jun</span>
              <span className="truncate">Server Cloud</span>
              <span className="text-right text-zinc-600">-</span>
              <span className="text-right text-rose-400">-$85</span>
            </div>
          </div>
          <div className="h-2 w-full flex items-end">
            <svg className="w-full h-2 stroke-teal-400 fill-teal-500/10" viewBox="0 0 100 10" preserveAspectRatio="none">
              <path d="M0,8 Q20,2 40,6 T80,1 T100,5 L100,10 L0,10 Z" strokeWidth="1" />
            </svg>
          </div>
        </div>
      );

    // 23. OCR Text Extractor
    case '/ocr-text-extractor':
      return (
        <div className="w-full h-28 rounded-2xl bg-zinc-950 border border-zinc-800/80 mb-3.5 p-3 overflow-hidden relative flex flex-col gap-1.5 justify-center select-none group-hover:border-emerald-500/50 transition-colors">
          <div className="w-full h-2 bg-emerald-500/20 rounded" />
          <div className="w-3/4 h-2 bg-emerald-500/30 rounded relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-1/3 bg-emerald-400 animate-wipe-x" />
          </div>
          <div className="w-5/6 h-2 bg-zinc-800 rounded" />
          <div className="w-1/2 h-2 bg-zinc-800 rounded" />
          <div className="absolute bottom-1.5 right-2 bg-emerald-950/90 border border-emerald-500/40 px-2 py-0.5 rounded text-[7px] font-black text-emerald-400 uppercase tracking-wider">
            Tesseract OCR
          </div>
        </div>
      );

    // 24. SVG Vectorizer
    case '/svg-vectorizer':
      return (
        <div className="w-full h-28 rounded-2xl bg-zinc-950 border border-zinc-800/80 mb-3.5 overflow-hidden relative flex items-center justify-center select-none group-hover:border-teal-500/50 transition-colors">
          <div className="flex items-center gap-4 z-10">
            <div className="text-2xl font-black text-zinc-700 blur-[0.8px] select-none">A</div>
            <div className="text-sm text-zinc-600">→</div>
            <div className="relative">
              <div className="text-2xl font-black text-teal-400 select-none font-sans">A</div>
              <div className="absolute -top-1 -left-1 w-1.5 h-1.5 bg-teal-400 border border-white rounded-full" />
              <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-teal-400 border border-white rounded-full" />
            </div>
          </div>
        </div>
      );

    // 25. Instant Meme Generator
    case '/meme-generator':
      return (
        <div className="w-full h-28 rounded-2xl bg-zinc-950 border border-zinc-800/80 mb-3.5 overflow-hidden relative flex items-center justify-center select-none group-hover:border-green-500/50 transition-colors p-1.5">
          <div className="w-full h-full rounded-xl overflow-hidden relative bg-gradient-to-tr from-green-950/50 to-slate-900 border border-zinc-800 flex flex-col justify-between p-2 text-center">
            <span className="text-[7.5px] font-black text-white uppercase tracking-wider drop-shadow-md">TOP CAPTION</span>
            <span className="text-[7.5px] font-black text-white uppercase tracking-wider drop-shadow-md">BOTTOM TEXT</span>
          </div>
        </div>
      );

    // 26. AI Shape Art Generator
    case '/shape-art-generator':
      return (
        <div className="w-full h-28 rounded-2xl bg-[#090d16] border border-zinc-800/80 mb-3.5 overflow-hidden relative flex items-center justify-center gap-1.5 select-none group-hover:border-indigo-500/50 transition-colors">
          <div className="flex -space-x-1.5 relative">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-[10px] text-indigo-400 font-bold rotate-[-12deg] shadow-lg">✨</div>
            <div className="w-8 h-8 rounded-full bg-purple-500/25 border border-purple-500/40 flex items-center justify-center text-[10px] text-purple-400 font-bold z-10 shadow-lg">🌸</div>
            <div className="w-8 h-8 rounded-full bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-[10px] text-sky-400 font-bold rotate-[12deg] z-20 shadow-lg">☁️</div>
          </div>
          <div className="absolute bottom-1.5 right-2 bg-slate-900/90 border border-slate-800 px-2 py-0.5 rounded text-[7px] font-black text-indigo-400 uppercase tracking-wider">
            Shape Art
          </div>
        </div>
      );

    // 27. Ambient Generative Visuals
    case '/ambient':
      return (
        <div className="w-full h-28 rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border border-indigo-800/40 mb-3.5 overflow-hidden relative flex items-center justify-center select-none group-hover:border-indigo-500/50 transition-colors">
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/30 via-purple-500/20 to-transparent animate-pulse" />
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-400/50 flex items-center justify-center text-indigo-300 z-10 shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
      );

    // Default fallback
    default:
      return (
        <div className="w-full h-28 rounded-2xl bg-zinc-950 border border-zinc-800 mb-3.5 flex items-center justify-center text-indigo-400">
          <ImageIcon className="w-6 h-6" />
        </div>
      );
  }
};

export const Home: React.FC = () => {
  const location = useLocation();
  const locale = getLocaleFromPath(location.pathname);
  const t = UI_TRANSLATIONS[locale] || UI_TRANSLATIONS.en;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');
  const [openHomeFaq, setOpenHomeFaq] = useState<number | null>(null);

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

  const filteredTools = toolDirectory.filter(tool => {
    const shortMeta = getShortToolMeta(tool.path, locale);
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
    const matchesSearch = shortMeta.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          shortMeta.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tool.badge.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tool.tag.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderToolCard = (tool: ToolItem) => {
    const Icon = tool.icon;
    const shortMeta = getShortToolMeta(tool.path, locale);
    const toolUrl = getLocalizedToolPath(tool.path, locale);

    const ctaText = locale === 'es' ? 'Abrir Herramienta' : 
                    locale === 'pt' ? 'Abrir Ferramenta' : 
                    locale === 'hi' ? 'टूल खोलें' : 
                    locale === 'fr' ? 'Ouvrir l\'Outil' : 
                    locale === 'de' ? 'Tool Öffnen' : 'Launch Tool';

    return (
      <Link
        key={tool.path}
        to={toolUrl}
        className="premium-bento group flex flex-col justify-between p-4.5 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600/80 relative overflow-hidden transition-all duration-300 shadow-xs hover:shadow-xl hover:shadow-indigo-500/10 cursor-pointer text-left"
      >
        {/* Ambient Top Glow */}
        <div className="absolute -right-12 -top-12 w-28 h-28 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/15 transition-all pointer-events-none" />

        <div>
          {/* Animated Interactive Visual Preview */}
          {renderToolPreview(tool.path)}

          {/* Header Row */}
          <div className="flex items-center justify-between mb-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 ${tool.colorClass} group-hover:scale-105 transition-transform`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900 px-2 py-0.5 rounded-md shadow-2xs">
              {tool.tag}
            </span>
          </div>
          
          <h3 className="font-extrabold text-[13.5px] text-slate-900 dark:text-slate-100 tracking-tight mb-1 group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
            {shortMeta.name}
          </h3>
          <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium line-clamp-2">
            {shortMeta.desc}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-all">
          <span>{ctaText}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>
    );
  };

  const renderCompactToolRow = (tool: ToolItem) => {
    const Icon = tool.icon;
    const shortMeta = getShortToolMeta(tool.path, locale);
    const toolUrl = getLocalizedToolPath(tool.path, locale);

    return (
      <Link
        key={tool.path}
        to={toolUrl}
        className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700/60 hover:bg-indigo-50/30 dark:hover:bg-slate-800/50 transition-all text-left group"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 ${tool.colorClass} group-hover:scale-105 transition-transform`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
              {shortMeta.name}
            </h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate mt-0.5">
              {shortMeta.desc}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-3">
          <span className="hidden sm:inline-block text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
            {tool.tag}
          </span>
          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <ArrowRight className="w-3.5 h-3.5" />
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
        canonicalUrl="https://imageplumber.com/"
        schema={homeFaqSchema}
      />

      {/* Decorative Blur Backdrops */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-dot-grid opacity-50 pointer-events-none -z-10" />
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[70%] h-[300px] bg-gradient-to-tr from-sky-400/10 via-indigo-500/8 to-teal-500/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse-slow" />

      {/* Hero Section */}
      <section className="text-center pt-14 pb-8 md:pt-20 md:pb-12 flex flex-col items-center justify-center relative overflow-hidden">
        
        {/* Anti-Cloud Tag */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-white dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 rounded-full text-[10px] font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-widest mb-6 shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
          <span>{t.heroBadge}</span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 mb-5 max-w-4xl leading-[1.1]">
          {t.heroTitle1} <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-650 via-purple-500 to-pink-500 font-black">
            {t.heroTitle2}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-2xl mb-8 leading-relaxed font-medium px-4">
          {t.heroSubtitle}
        </p>

        {/* Quick Search & Launch Action */}
        <div className="w-full max-w-xl mx-auto px-4 mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-3.5 bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all shadow-md shadow-slate-200/10 dark:shadow-none text-sm text-slate-800 dark:text-slate-100 font-medium placeholder-slate-400 dark:placeholder-slate-500"
            />
            <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Core Value Props Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/60">
            <Check className="w-3 h-3" /> 100% In-Browser RAM
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-900/60">
            <Zap className="w-3 h-3" /> Hardware Accelerated WASM
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-900/60">
            <ShieldCheck className="w-3 h-3" /> Zero Server Uploads
          </span>
        </div>

      </section>

      {/* Tools Directory Section: Bento Grid Dashboard */}
      <section id="tools-grid" className="py-10 border-t border-slate-200/60 dark:border-slate-800 max-w-7xl mx-auto scroll-mt-20 px-4 sm:px-6 lg:px-8">
        
        {/* Category Controls & View Switcher Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-slate-50/70 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-200/70 dark:border-slate-800">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 justify-center">
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
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold tracking-tight transition-all cursor-pointer border flex items-center gap-1.5 ${
                    activeCategory === cat.id
                      ? 'bg-indigo-650 border-indigo-655 text-white shadow-sm shadow-indigo-500/20'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-650 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:border-slate-300 dark:hover:border-slate-600 shadow-2xs'
                  }`}
                >
                  <CatIcon className="w-3.5 h-3.5 shrink-0" />
                  <span>{catLabel}</span>
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md ${activeCategory === cat.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* View Mode Toggle Button */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Visual Cards View"
            >
              <Layout className="w-3.5 h-3.5" />
              <span className="text-[10px]">Cards</span>
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'compact'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Compact Quick Finder View"
            >
              <Table className="w-3.5 h-3.5" />
              <span className="text-[10px]">List</span>
            </button>
          </div>
        </div>

        {/* Results Info Bar when filtered */}
        {searchQuery && (
          <div className="mb-4 text-xs font-semibold text-slate-500 dark:text-slate-400 text-left">
            Showing {filteredTools.length} tools matching "{searchQuery}"
          </div>
        )}

        {/* Directory Presentation (Grid vs Compact) */}
        {filteredTools.length === 0 ? (
          renderEmptyState()
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredTools.map((tool) => renderToolCard(tool))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredTools.map((tool) => renderCompactToolRow(tool))}
          </div>
        )}

      </section>

      {/* Popular Formats & Quick Conversion Matrix Section */}
      <section className="py-12 border-t border-slate-200/60 dark:border-slate-800 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="text-[10px] font-bold text-indigo-655 bg-indigo-50 dark:bg-indigo-950/50 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-900 uppercase tracking-widest">
            High-Speed Matrix
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-normal mt-2.5 mb-2">
            Popular Formats & Target Sizes
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
            Direct 1-click access to preset conversion and compression workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* Column 1: Format Converters */}
          <div className="premium-bento p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 space-y-3">
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
          <div className="premium-bento p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 space-y-3">
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
          <div className="premium-bento p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>Specialized Tasks</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'Photo Filters', path: '/photo-filters' },
                { label: 'Vintage 1977 Filter', path: '/vintage-photo-filter' },
                { label: 'Duotone Generator', path: '/duotone-generator' },
                { label: 'Invert Colors', path: '/invert-colors' },
                { label: 'Black & White Converter', path: '/black-and-white-converter' },
                { label: 'Adjust Brightness & Contrast', path: '/brightness-contrast' },
                { label: 'Crop Image (1:1, 16:9)', path: '/crop-image' },
                { label: 'Passport Photo (2x2 in)', path: '/passport-photo-cropper' },
                { label: 'Rotate & Flip Image', path: '/rotate-image' },
                { label: 'Add Border & Frame', path: '/add-border-to-image' },
                { label: 'Remove White BG', path: '/remove-white-background' },
                { label: 'Transparent BG Maker', path: '/transparent-background-maker' },
                { label: 'Bank Statement to Excel', path: '/bank-statement-to-excel' },
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

      {/* Trust & Zero-Upload Privacy Guarantee Section */}
      <section className="py-12 border-t border-slate-200/60 dark:border-slate-800 max-w-5xl mx-auto px-4 text-center">
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-zinc-950 p-8 sm:p-12 rounded-3xl border border-indigo-900/50 shadow-2xl text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-dot-grid opacity-30 pointer-events-none" />
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 mx-auto mb-4 shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
            Why 100% Client-Side Matters
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium mb-6">
            Unlike cloud image editors that upload your private photos, passport scans, and sensitive bank records to remote servers, ImagePlumber runs completely inside your browser's WebAssembly memory. Your files never leave your device.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-400/30 rounded-full text-emerald-400 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>0 Bytes Transferred • No Server Tracking • Offline Ready</span>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-12 border-t border-slate-200/60 dark:border-slate-800 max-w-4xl mx-auto px-4 text-left">
        <div className="text-center mb-8">
          <span className="text-[10px] font-bold text-indigo-655 bg-indigo-50 dark:bg-indigo-950/50 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-900 uppercase tracking-widest">
            FAQ
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-normal mt-2 mb-2">
            {t.faqTitle}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
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
                  onClick={() => setOpenHomeFaq(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors cursor-pointer"
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
