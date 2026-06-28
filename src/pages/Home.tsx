import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Cpu, 
  Zap, 
  Image as ImageIcon, 
  Maximize2, 
  LayoutGrid, 
  Palette, 
  FileText, 
  Lock,
  ArrowRight,
  Files,
  Fingerprint,
  Copyright,
  Crop,
  Smile,
  Feather,
  Grid,
  Check,
  X,
  CreditCard,
  PenTool
} from 'lucide-react';
import { SEO } from '../components/SEO';

const toolDirectory = [
  {
    name: 'AI Background Remover',
    path: '/background-remover',
    icon: Cpu,
    category: 'ai-editing',
    description: 'Isolate subjects and remove backgrounds completely inside the browser using local AI.',
    badge: 'Local AI',
    colorClass: 'text-purple-650 bg-purple-50 border-purple-100/50 hover:border-purple-300'
  },
  {
    name: 'Photo Mosaic Generator',
    path: '/photo-mosaic-generator',
    icon: Grid,
    category: 'layout-design',
    description: 'Compose high-resolution mosaic images from grid tile collections locally in your RAM.',
    badge: 'Artistic',
    colorClass: 'text-fuchsia-600 bg-fuchsia-50 border-fuchsia-100/50 hover:border-fuchsia-300'
  },
  {
    name: 'Aspect Resizer & Smart Crop',
    path: '/aspect-resizer',
    icon: Crop,
    category: 'layout-design',
    description: 'Resize and crop images to social media templates with canvas blur-padding presets.',
    badge: 'Responsive',
    colorClass: 'text-amber-600 bg-amber-50 border-amber-100/50 hover:border-amber-300'
  },
  {
    name: 'SVG Vectorizer',
    path: '/svg-vectorizer',
    icon: Feather,
    category: 'ai-editing',
    description: 'Trace and digitize raster files (JPG/PNG) into scalable vector coordinates (SVG).',
    badge: 'Vector',
    colorClass: 'text-teal-650 bg-teal-50 border-teal-100/50 hover:border-teal-300'
  },
  {
    name: 'OCR Text Extractor',
    path: '/ocr-text-extractor',
    icon: FileText,
    category: 'utilities-creative',
    description: 'Extract text from scanned documents, screenshots, or receipts in multiple languages.',
    badge: 'Document Scan',
    colorClass: 'text-emerald-650 bg-emerald-50 border-emerald-100/50 hover:border-emerald-300'
  },
  {
    name: 'Bank Statement Analyzer',
    path: '/bank-statement-analyzer',
    icon: CreditCard,
    category: 'utilities-creative',
    description: 'Upload bank or credit card statements (PDF, CSV, Excel) to analyze credits, debits, cash flow and date ranges.',
    badge: 'Finance Scan',
    colorClass: 'text-teal-650 bg-teal-50 border-teal-100/50 hover:border-teal-300'
  },
  {
    name: 'Electronic PDF Signer',
    path: '/sign-pdf',
    icon: PenTool,
    category: 'utilities-creative',
    description: 'Sign PDF documents client-side. Draw, type, or upload your signature. 100% private, on-device signing.',
    badge: 'Sign PDF',
    colorClass: 'text-indigo-650 bg-indigo-50 border-indigo-100/50 hover:border-indigo-300'
  },
  {
    name: 'Image Compressor',
    path: '/image-compressor',
    icon: ImageIcon,
    category: 'format-bulk',
    description: 'Optimize JPEGs, PNGs, and WebPs in seconds with custom compression levels.',
    badge: 'Optimize',
    colorClass: 'text-indigo-650 bg-indigo-50 border-indigo-100/50 hover:border-indigo-300'
  },
  {
    name: 'Batch Image to PDF & Format Converter',
    path: '/batch-converter',
    icon: Files,
    category: 'format-bulk',
    description: 'Convert image formats in bulk, or merge them into a single custom-ordered PDF document.',
    badge: 'Bulk PDF',
    colorClass: 'text-indigo-650 bg-indigo-50 border-indigo-100/50 hover:border-indigo-300'
  },
  {
    name: 'Photo Collage Maker',
    path: '/collage-maker',
    icon: LayoutGrid,
    category: 'layout-design',
    description: 'Combine multiple images in dynamic customizable grids and borders.',
    badge: 'Layout',
    colorClass: 'text-pink-655 bg-pink-50 border-pink-100/50 hover:border-pink-300'
  },
  {
    name: 'Color Palette Extractor',
    path: '/color-palette-extractor',
    icon: Palette,
    category: 'utilities-creative',
    description: 'Retrieve dominant colors and swatches for Tailwind or standard CSS configs.',
    badge: 'Color Spec',
    colorClass: 'text-cyan-655 bg-cyan-50 border-cyan-100/50 hover:border-cyan-300'
  },
  {
    name: 'Watermark Overlay',
    path: '/watermark-overlay',
    icon: Copyright,
    category: 'utilities-creative',
    description: 'Apply custom PNG branding logos or text copyrights in dynamic tile repeats.',
    badge: 'Security',
    colorClass: 'text-rose-650 bg-rose-50 border-rose-100/50 hover:border-rose-300'
  },
  {
    name: 'EXIF Metadata Stripper',
    path: '/metadata-stripper',
    icon: Fingerprint,
    category: 'format-bulk',
    description: 'Audit cameras, locations, and GPS parameters to clean private metadata.',
    badge: 'Privacy Clean',
    colorClass: 'text-red-650 bg-red-50 border-red-100/50 hover:border-red-300'
  },
  {
    name: 'Instagram Grid Splitter',
    path: '/instagram-grid-splitter',
    icon: Maximize2,
    category: 'layout-design',
    description: 'Slice photos into square tiles for Instagram profiles and grid shapes.',
    badge: 'Social Fit',
    colorClass: 'text-orange-655 bg-orange-50 border-orange-100/50 hover:border-orange-300'
  },
  {
    name: 'Meme Generator',
    path: '/meme-generator',
    icon: Smile,
    category: 'layout-design',
    description: 'Add draggable top and bottom text overlays onto images with classic styling.',
    badge: 'Social Meme',
    colorClass: 'text-green-650 bg-green-50 border-green-100/50 hover:border-green-300'
  }
];

const categories = [
  { id: 'all', label: 'All Tools' },
  { id: 'ai-editing', label: 'AI & Editing' },
  { id: 'layout-design', label: 'Layout & Design' },
  { id: 'format-bulk', label: 'Format & Bulk' },
  { id: 'utilities-creative', label: 'Utilities & Creative' }
];

const renderToolPreview = (path: string) => {
  switch (path) {
    case '/background-remover':
      return (
        <div className="w-full h-24 rounded-2xl bg-zinc-950 border border-zinc-800/80 mb-4 overflow-hidden relative flex items-center justify-center">
          <div className="absolute inset-y-0 left-0 right-1/2 bg-indigo-500/5 flex items-center justify-center">
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Original</span>
          </div>
          <div 
            className="absolute inset-y-0 right-0 left-1/2 flex items-center justify-center border-l border-zinc-800"
            style={{
              background: 'rgba(99, 102, 241, 0.08)',
              backgroundImage: 'radial-gradient(rgba(99, 102, 241, 0.15) 1px, transparent 1px)',
              backgroundSize: '10px 10px'
            }}
          >
            <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest">Cutout</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-400 z-10 shadow-lg shadow-indigo-500/20">
            <Cpu className="w-4.5 h-4.5" />
          </div>
        </div>
      );
    case '/photo-mosaic-generator':
      return (
        <div className="w-full h-24 rounded-2xl bg-slate-950 border border-slate-900 mb-4 overflow-hidden relative grid grid-cols-6 grid-rows-3 gap-0.5 p-1">
          {Array.from({ length: 18 }).map((_, i) => {
            const colors = ['bg-indigo-500/20', 'bg-sky-500/30', 'bg-teal-500/20', 'bg-purple-500/20', 'bg-indigo-400/30'];
            return (
              <div key={i} className={`rounded-xs ${colors[i % colors.length]} flex items-center justify-center text-[7px] text-slate-500/45 font-bold`}>
                T
              </div>
            );
          })}
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-teal-500/10 mix-blend-overlay" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="px-2 py-0.5 rounded bg-slate-900/90 border border-slate-800 text-[8px] font-black text-indigo-400 uppercase tracking-widest shadow-lg">
              Mosaic Grid
            </div>
          </div>
        </div>
      );
    case '/aspect-resizer':
      return (
        <div className="w-full h-24 rounded-2xl bg-slate-50 border border-slate-200/80 mb-4 overflow-hidden relative flex items-center justify-center gap-2 p-3">
          <div className="w-10 h-10 rounded border-2 border-dashed border-indigo-500/40 bg-indigo-50/20 flex flex-col items-center justify-center relative">
            <span className="text-[7px] text-indigo-600 font-bold">1:1</span>
            <div className="absolute -top-1 -left-1 w-1.5 h-1.5 border-t-2 border-l-2 border-indigo-600" />
            <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 border-b-2 border-r-2 border-indigo-600" />
          </div>
          <div className="w-14 h-8 rounded border border-slate-300 bg-slate-100/50 flex items-center justify-center">
            <span className="text-[7px] text-slate-500 font-medium">16:9</span>
          </div>
          <div className="w-7 h-12 rounded border border-slate-300 bg-slate-100/50 flex items-center justify-center">
            <span className="text-[7px] text-slate-500 font-medium">9:16</span>
          </div>
        </div>
      );
    case '/svg-vectorizer':
      return (
        <div className="w-full h-24 rounded-2xl bg-zinc-950 border border-zinc-800 mb-4 overflow-hidden relative flex items-center justify-center">
          <svg className="w-full h-full absolute inset-0 opacity-20" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="cardGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cardGrid)" />
          </svg>
          <div className="flex items-center gap-4 z-10">
            <div className="text-2xl font-black text-zinc-700 blur-[0.8px] select-none">A</div>
            <div className="text-sm text-zinc-600">→</div>
            <div className="relative">
              <div className="text-2xl font-black text-indigo-400 select-none font-sans">A</div>
              <div className="absolute -top-1 -left-1 w-1.5 h-1.5 bg-indigo-500 border border-white rounded-full" />
              <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-indigo-500 border border-white rounded-full" />
            </div>
          </div>
        </div>
      );
    case '/ocr-text-extractor':
      return (
        <div className="w-full h-24 rounded-2xl bg-slate-50 border border-slate-200/80 mb-4 p-3 overflow-hidden relative flex flex-col gap-1.5 justify-center">
          <div className="w-full h-2 bg-indigo-650/10 rounded" />
          <div className="w-3/4 h-2 bg-indigo-655/15 rounded relative">
            <div className="absolute inset-y-0 left-1/4 right-1/4 bg-indigo-500/20 border-x border-indigo-500/40" />
          </div>
          <div className="w-5/6 h-2 bg-slate-200 rounded" />
          <div className="w-1/2 h-2 bg-slate-200 rounded" />
          <div className="absolute bottom-1.5 right-2 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-sm text-[7px] font-black text-indigo-600 uppercase tracking-wider">
            Text OCR
          </div>
        </div>
      );
    case '/bank-statement-analyzer':
      return (
        <div className="w-full h-24 rounded-2xl bg-white border border-slate-200/85 mb-4 p-2.5 overflow-hidden relative flex flex-col justify-between shadow-xs">
          <div className="grid grid-cols-4 gap-1 text-[7px] font-bold text-slate-400 border-b border-slate-100 pb-1">
            <span>Date</span>
            <span>Desc</span>
            <span className="text-right">Credit</span>
            <span className="text-right">Debit</span>
          </div>
          <div className="space-y-0.5">
            <div className="grid grid-cols-4 gap-1 text-[7px] font-bold text-slate-700">
              <span>24 Jun</span>
              <span className="truncate">Stripe</span>
              <span className="text-right text-emerald-600">+$1.2k</span>
              <span className="text-right text-slate-300">-</span>
            </div>
            <div className="grid grid-cols-4 gap-1 text-[7px] font-bold text-slate-700">
              <span>25 Jun</span>
              <span className="truncate">AWS Cloud</span>
              <span className="text-right text-slate-300">-</span>
              <span className="text-right text-rose-600">-$150</span>
            </div>
          </div>
          <div className="h-3 w-full flex items-end">
            <svg className="w-full h-3 stroke-indigo-500 fill-indigo-500/10" viewBox="0 0 100 10" preserveAspectRatio="none">
              <path d="M0,8 Q20,2 40,6 T80,1 T100,5 L100,10 L0,10 Z" strokeWidth="0.8" />
            </svg>
          </div>
        </div>
      );
    case '/sign-pdf':
      return (
        <div className="w-full h-24 rounded-2xl bg-white border border-slate-200/85 mb-4 p-2.5 overflow-hidden relative flex flex-col justify-between shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5">
            <FileText className="w-4 h-4 text-indigo-650" />
            <span className="text-[7.5px] font-bold text-slate-700">document_agreement.pdf</span>
          </div>
          <div className="flex-1 flex items-center justify-end pr-4 relative">
            <div className="flex flex-col items-center">
              <span className="font-serif italic text-indigo-700 text-[10px] translate-y-1">Vivek Gupta</span>
              <div className="w-16 h-0.5 bg-slate-200" />
            </div>
            <div className="absolute top-1 right-2 text-indigo-600 animate-pulse">
              <PenTool className="w-3.5 h-3.5 rotate-45" />
            </div>
          </div>
        </div>
      );
    case '/image-compressor':
      return (
        <div className="w-full h-24 rounded-2xl bg-slate-50 border border-slate-200/80 mb-4 overflow-hidden relative flex items-center justify-center gap-2">
          <div className="px-2 py-1 bg-white border border-slate-200 rounded-lg shadow-xs text-center flex flex-col">
            <span className="text-[6.5px] text-slate-400 font-bold uppercase">Original</span>
            <span className="text-[9px] text-slate-700 font-extrabold">2.4 MB</span>
          </div>
          <div className="text-indigo-500">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
          <div className="px-2 py-1 bg-indigo-50 border border-indigo-100 rounded-lg shadow-xs text-center flex flex-col">
            <span className="text-[6.5px] text-indigo-500 font-bold uppercase">Optimized</span>
            <span className="text-[9px] text-indigo-700 font-extrabold">340 KB</span>
          </div>
        </div>
      );
    case '/batch-converter':
      return (
        <div className="w-full h-24 rounded-2xl bg-slate-50 border border-slate-200/80 mb-4 overflow-hidden relative flex items-center justify-center">
          <div className="flex -space-x-2 relative">
            <div className="w-8 h-11 rounded bg-white border border-slate-200 shadow-xs flex items-center justify-center text-[7px] font-bold text-rose-500 rotate-[-6deg]">PNG</div>
            <div className="w-8 h-11 rounded bg-white border border-slate-200 shadow-sm flex items-center justify-center text-[7px] font-bold text-sky-500 rotate-[4deg] z-10">WEBP</div>
            <div className="w-8 h-11 rounded bg-indigo-600 text-white shadow-md flex flex-col items-center justify-center text-[8px] font-black rotate-[12deg] z-20">
              <span>PDF</span>
            </div>
          </div>
        </div>
      );
    case '/collage-maker':
      return (
        <div className="w-full h-24 rounded-2xl bg-slate-50 border border-slate-200/85 mb-4 p-2 overflow-hidden relative grid grid-cols-3 gap-1">
          <div className="bg-indigo-500/10 border border-indigo-500/25 rounded-lg flex items-center justify-center text-[9px] text-indigo-500/40 font-bold">A</div>
          <div className="col-span-2 grid grid-rows-2 gap-1">
            <div className="bg-sky-500/10 border border-sky-500/25 rounded-lg flex items-center justify-center text-[8px] text-sky-500/40 font-bold">B</div>
            <div className="bg-teal-500/10 border border-teal-500/25 rounded-lg flex items-center justify-center text-[8px] text-teal-500/40 font-bold">C</div>
          </div>
        </div>
      );
    case '/color-palette-extractor':
      return (
        <div className="w-full h-24 rounded-2xl bg-slate-50 border border-slate-200/80 mb-4 overflow-hidden relative flex items-center justify-center gap-1.5 px-3">
          <div className="w-6 h-8 rounded-md bg-indigo-900 border border-white shadow-sm" />
          <div className="w-6 h-8 rounded-md bg-indigo-600 border border-white shadow-sm" />
          <div className="w-6 h-8 rounded-md bg-indigo-400 border border-white shadow-sm" />
          <div className="w-6 h-8 rounded-md bg-teal-500 border border-white shadow-sm" />
          <div className="w-6 h-8 rounded-md bg-teal-200 border border-white shadow-sm" />
        </div>
      );
    case '/watermark-overlay':
      return (
        <div className="w-full h-24 rounded-2xl bg-slate-900 border border-slate-950 mb-4 overflow-hidden relative flex items-center justify-center">
          <div className="absolute inset-0 flex flex-col justify-center gap-2.5 rotate-[-15deg] scale-110 opacity-15">
            <div className="text-[6.5px] text-white font-bold tracking-widest whitespace-nowrap">COPYRIGHT © COPY</div>
            <div className="text-[6.5px] text-white font-bold tracking-widest whitespace-nowrap translate-x-2">COPYRIGHT © COPY</div>
          </div>
          <div className="px-2.5 py-0.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[8px] font-black text-slate-300 uppercase tracking-widest z-10 shadow-md">
            Watermark
          </div>
        </div>
      );
    case '/metadata-stripper':
      return (
        <div className="w-full h-24 rounded-2xl bg-slate-50 border border-slate-200/80 mb-4 p-2.5 overflow-hidden relative flex flex-col justify-between text-left">
          <div className="space-y-0.5">
            <div className="flex items-center justify-between text-[6.5px] font-bold text-slate-400">
              <span>GPS Details</span>
              <span className="text-red-500 font-extrabold">STRIP</span>
            </div>
            <p className="text-[7.5px] font-bold text-slate-600">Camera: Sony A7r IV (GPS: Active)</p>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200/60 pt-1">
            <span className="text-[6.5px] text-slate-400 font-bold">Metadata clean</span>
            <span className="text-[7.5px] font-black text-emerald-600">PRUNED</span>
          </div>
        </div>
      );
    case '/instagram-grid-splitter':
      return (
        <div className="w-full h-24 rounded-2xl bg-slate-50 border border-slate-200/80 mb-4 p-1.5 overflow-hidden relative flex items-center justify-center">
          <div className="w-14 h-14 bg-white border border-slate-200 grid grid-cols-3 grid-rows-3 gap-0.5 p-0.5 shadow-sm rounded-md">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="bg-indigo-500/10 border border-indigo-500/5 rounded-xs flex items-center justify-center text-[6px] text-indigo-500 font-black">
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      );
    case '/meme-generator':
      return (
        <div className="w-full h-24 rounded-2xl bg-slate-900 border border-slate-950 mb-4 overflow-hidden relative flex items-center justify-center p-1">
          <div className="w-full h-full rounded-lg overflow-hidden relative bg-gradient-to-tr from-indigo-900/40 to-slate-900">
            <div className="absolute top-1 inset-x-0 text-center text-[7.5px] font-black text-white uppercase tracking-wider">
              TOP TEXT
            </div>
            <div className="absolute bottom-1 inset-x-0 text-center text-[7.5px] font-black text-white uppercase tracking-wider">
              BOTTOM TEXT
            </div>
          </div>
        </div>
      );
    default:
      return (
        <div className="w-full h-24 rounded-2xl bg-indigo-50/50 border border-indigo-100/50 mb-4 flex items-center justify-center text-indigo-500">
          <ImageIcon className="w-7 h-7" />
        </div>
      );
  }
};

const heroTabsConfig = {
  'bg-remover': {
    title: 'AI Background Cutout',
    slider1Label: 'Mask Sensitivity',
    slider1Val: '85%',
    slider1Pct: '85%',
    slider2Label: 'Feather Edge',
    slider2Val: '12px',
    slider2Pct: '40%',
    btnLabel: 'Apply Mask',
    badgeText: 'Subject Isolated',
    badgeLabel: '100% Client-Side'
  },
  'crop': {
    title: 'Smart Canvas Crop',
    slider1Label: 'Canvas Zoom',
    slider1Val: '100%',
    slider1Pct: '100%',
    slider2Label: 'Blur Padding',
    slider2Val: '60%',
    slider2Pct: '60%',
    btnLabel: 'Crop Image',
    badgeText: 'Social Presets',
    badgeLabel: 'Aspect Bounds'
  },
  'mosaic': {
    title: 'Euclidean Color Grid',
    slider1Label: 'Tile Density',
    slider1Val: '120 tiles',
    slider1Pct: '70%',
    slider2Label: 'Overlay Opacity',
    slider2Val: '45%',
    slider2Pct: '45%',
    btnLabel: 'Compile Mosaic',
    badgeText: 'Tile Composing',
    badgeLabel: 'Euclidean Search'
  },
  'compressor': {
    title: 'Quantization Quality',
    slider1Label: 'Compression Quality',
    slider1Val: '75%',
    slider1Pct: '75%',
    slider2Label: 'Chroma Subsampling',
    slider2Val: '4:2:0',
    slider2Pct: '90%',
    btnLabel: 'Optimize Size',
    badgeText: 'Size Reduction',
    badgeLabel: 'JPEG / PNG / WEBP'
  },
  'vectorizer': {
    title: 'Path Simplification',
    slider1Label: 'Color Palette',
    slider1Val: '16 Colors',
    slider1Pct: '50%',
    slider2Label: 'Trace Tolerance',
    slider2Val: '1.5',
    slider2Pct: '35%',
    btnLabel: 'Trace Vectors',
    badgeText: 'Raster to SVG',
    badgeLabel: 'Vector Outline'
  }
};

const renderInteractiveCanvas = (tab: string) => {
  const gifUrl = `/demo-gifs/${tab}.gif`;
  
  const altText = {
    'bg-remover': 'AI Background Cutout Preview',
    'crop': 'Smart Canvas Crop Preview',
    'mosaic': 'Euclidean Color Grid Mosaic Preview',
    'compressor': 'Quantization Quality Compressor Preview',
    'vectorizer': 'Path Simplification Vectorizer Preview'
  }[tab] || 'Demo Preview';

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#0c0c0e] flex items-center justify-center">
      <img 
        src={gifUrl} 
        alt={altText}
        className="w-full h-full object-cover" 
        loading="eager"
      />
    </div>
  );
};

export const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeHeroTab, setActiveHeroTab] = useState<'bg-remover' | 'crop' | 'mosaic' | 'compressor' | 'vectorizer'>('bg-remover');

  const filteredTools = toolDirectory.filter(tool => {
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tool.badge.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeHeroData = heroTabsConfig[activeHeroTab];

  return (
    <div className="w-full relative">
      <SEO 
        title="Free Privacy-First Image Tools" 
        description="Free browser-based image tools suite: compress images, remove backgrounds with AI, scan text (OCR), split Instagram grids, make collages, extract color palettes, convert batch images, strip EXIF metadata, add watermarks, resize for social media, generate memes, vectorize to SVG, and create photo mosaics. 100% offline, zero uploads." 
        keywords="free image tools, image compressor, AI background remover, OCR text extractor, Instagram grid splitter, photo collage maker, color palette extractor, batch image to pdf converter, EXIF metadata stripper, watermark tool, aspect ratio resizer, meme generator, SVG vectorizer, photo mosaic generator, online image editor, browser image tools, privacy image editor, no upload image tool, free photo editor online"
        canonicalUrl="https://imagegiri.com/"
      />

      {/* Decorative Blur Backdrops */}
      <div className="absolute top-0 inset-x-0 h-[600px] bg-dot-grid opacity-60 pointer-events-none -z-10" />
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[70%] h-[350px] bg-gradient-to-tr from-sky-400/10 via-indigo-500/8 to-teal-500/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse-slow" />

      {/* Hero Section */}
      <section className="text-center pt-16 pb-12 md:pt-24 md:pb-16 flex flex-col items-center justify-center relative overflow-hidden">
        
        {/* Anti-Cloud Tag */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-extrabold text-slate-600 uppercase tracking-widest mb-6 shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
          <span>100% On-Device & Offline-Ready</span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 max-w-4xl leading-[1.08]">
          Craft Perfect Images. <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-650 via-primary-500 to-accent-500 font-black">
            Zero Server Uploads.
          </span>
        </h1>

        {/* Description */}
        <p className="text-sm md:text-base lg:text-lg text-slate-500 max-w-2xl mb-10 leading-relaxed font-medium">
          A premium suite of image and layout tools executing directly inside your browser cache.
          Get instant transformations with absolute privacy.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a 
            href="#tools-grid" 
            className="px-8 py-3.5 bg-zinc-950 hover:bg-zinc-800 text-[11px] font-bold uppercase tracking-wider text-white rounded-full shadow-lg shadow-zinc-950/10 active:scale-98 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-indigo-400" />
            Explore Free Tools
          </a>
          <Link 
            to="/about" 
            className="px-8 py-3.5 bg-white border border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-700 hover:text-slate-900 rounded-full transition-all shadow-xs backdrop-blur-md"
          >
            How it works
          </Link>
        </div>

      </section>

      {/* Hero Editor Mockup */}
      <div className="w-full max-w-4xl mx-auto px-4 mt-4 mb-24 relative group">
        <div className="absolute inset-0 bg-gradient-to-tr from-sky-400/15 via-indigo-500/10 to-purple-400/5 rounded-3xl blur-3xl opacity-80 pointer-events-none group-hover:scale-102 transition-transform duration-500" />
        
        <div className="relative bg-zinc-950 border border-zinc-800/80 rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/20 aspect-[1.8/1] flex flex-col">
          <div className="h-10 border-b border-zinc-900 px-4 flex items-center justify-between shrink-0 bg-zinc-950">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            </div>
            <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
              <span>Interactive Live Preview: {activeHeroData.title}</span>
            </div>
            <div className="w-10" />
          </div>
          
          <div className="flex-1 flex min-h-0 bg-zinc-900">
            {/* Sidebar Navigation - Interactive Tabs */}
            <div className="w-12 border-r border-zinc-950 flex flex-col items-center py-4 gap-4 shrink-0 bg-zinc-950">
              <button 
                onClick={() => setActiveHeroTab('bg-remover')}
                title="AI Background Remover"
                className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
                  activeHeroTab === 'bg-remover'
                    ? 'bg-indigo-600/25 border-indigo-500/40 text-indigo-400 scale-105 shadow-md shadow-indigo-500/10'
                    : 'border-transparent text-zinc-500 hover:text-zinc-350 hover:bg-zinc-900'
                }`}
              >
                <Cpu className="w-4.5 h-4.5" />
              </button>
              <button 
                onClick={() => setActiveHeroTab('crop')}
                title="Aspect Resizer & Smart Crop"
                className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
                  activeHeroTab === 'crop'
                    ? 'bg-indigo-600/25 border-indigo-500/40 text-indigo-400 scale-105 shadow-md shadow-indigo-500/10'
                    : 'border-transparent text-zinc-500 hover:text-zinc-350 hover:bg-zinc-900'
                }`}
              >
                <Crop className="w-4.5 h-4.5" />
              </button>
              <button 
                onClick={() => setActiveHeroTab('mosaic')}
                title="Photo Mosaic Generator"
                className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
                  activeHeroTab === 'mosaic'
                    ? 'bg-indigo-600/25 border-indigo-500/40 text-indigo-400 scale-105 shadow-md shadow-indigo-500/10'
                    : 'border-transparent text-zinc-500 hover:text-zinc-350 hover:bg-zinc-900'
                }`}
              >
                <Grid className="w-4.5 h-4.5" />
              </button>
              <button 
                onClick={() => setActiveHeroTab('compressor')}
                title="Image Compressor"
                className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
                  activeHeroTab === 'compressor'
                    ? 'bg-indigo-600/25 border-indigo-500/40 text-indigo-400 scale-105 shadow-md shadow-indigo-500/10'
                    : 'border-transparent text-zinc-500 hover:text-zinc-350 hover:bg-zinc-900'
                }`}
              >
                <ImageIcon className="w-4.5 h-4.5" />
              </button>
              <button 
                onClick={() => setActiveHeroTab('vectorizer')}
                title="SVG Vectorizer"
                className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
                  activeHeroTab === 'vectorizer'
                    ? 'bg-indigo-600/25 border-indigo-500/40 text-indigo-400 scale-105 shadow-md shadow-indigo-500/10'
                    : 'border-transparent text-zinc-500 hover:text-zinc-350 hover:bg-zinc-900'
                }`}
              >
                <Feather className="w-4.5 h-4.5" />
              </button>
            </div>
            
            {/* Canvas Area with Bespoke Interactive Layout Previews */}
            <div className="flex-1 flex items-center justify-center overflow-hidden relative select-none bg-[#0c0c0e]">
              {renderInteractiveCanvas(activeHeroTab)}
              
              {/* Dynamic Overlay info badge */}
              <div className="absolute bottom-4 right-4 bg-zinc-950/90 backdrop-blur-md border border-zinc-800 rounded-xl p-3 shadow-xl max-w-[170px] text-left animate-fade-in z-20">
                <span className="text-[8px] font-black text-indigo-400 uppercase tracking-wider block mb-0.5">Image Craft Studio</span>
                <p className="text-[10px] font-extrabold text-zinc-100 leading-tight">{activeHeroData.badgeText}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[8px] text-zinc-400 font-bold">{activeHeroData.badgeLabel}</span>
                </div>
              </div>
            </div>
            
            {/* Right Controls Panel */}
            <div className="hidden md:flex w-44 border-l border-zinc-950 flex-col p-4 gap-4 shrink-0 bg-zinc-950 text-left">
              <div className="space-y-0.5">
                <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Adjustment</span>
                <h4 className="text-[11px] font-bold text-zinc-200 truncate">{activeHeroData.title}</h4>
              </div>
              <div className="h-[1px] bg-zinc-900" />
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[9px] font-bold text-zinc-400">
                    <span>{activeHeroData.slider1Label}</span>
                    <span>{activeHeroData.slider1Val}</span>
                  </div>
                  <div className="h-1 bg-zinc-850 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-full transition-all duration-300" 
                      style={{ width: activeHeroData.slider1Pct }}
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[9px] font-bold text-zinc-400">
                    <span>{activeHeroData.slider2Label}</span>
                    <span>{activeHeroData.slider2Val}</span>
                  </div>
                  <div className="h-1 bg-zinc-850 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-full transition-all duration-300" 
                      style={{ width: activeHeroData.slider2Pct }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-auto">
                <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[9px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-md shadow-indigo-650/20 active:scale-98">
                  {activeHeroData.btnLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Cards: Core Value Propositions */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 max-w-6xl mx-auto px-4">
        
        {/* Prop 1 */}
        <div className="premium-bento p-6 rounded-3xl bg-white border border-slate-200/50 flex flex-col justify-between gap-4 group cursor-default">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-650 border border-indigo-100/60 group-hover:scale-110 transition-transform duration-200">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800 tracking-tight mb-1 group-hover:text-indigo-650 transition-colors">Local Sandbox Processing</h3>
            <p className="text-[13px] text-slate-550 leading-relaxed font-medium">
              Files reside strictly within browser memory space. Web Workers execute all processing scripts locally without cloud transmission.
            </p>
          </div>
        </div>

        {/* Prop 2 */}
        <div className="premium-bento p-6 rounded-3xl bg-white border border-slate-200/50 flex flex-col justify-between gap-4 group cursor-default">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-650 border border-purple-100/60 group-hover:scale-110 transition-transform duration-200">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800 tracking-tight mb-1 group-hover:text-purple-650 transition-colors">Transformers.js AI Cutout</h3>
            <p className="text-[13px] text-slate-550 leading-relaxed font-medium">
              Run neural network subject segmentation using WebAssembly. Leverage your CPU/GPU hardware capabilities locally.
            </p>
          </div>
        </div>

        {/* Prop 3 */}
        <div className="premium-bento p-6 rounded-3xl bg-white border border-slate-200/50 flex flex-col justify-between gap-4 group cursor-default">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-650 border border-emerald-100/60 group-hover:scale-110 transition-transform duration-200">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800 tracking-tight mb-1 group-hover:text-emerald-650 transition-colors">Zero Latency Operations</h3>
            <p className="text-[13px] text-slate-550 leading-relaxed font-medium">
              Eliminate massive file upload bottlenecks. Batch split, extract colors, or extract text locally with instant downloads.
            </p>
          </div>
        </div>

      </section>

      {/* Tools Directory Section: Bento Grid Dashboard */}
      <section id="tools-grid" className="py-16 border-t border-slate-200/60 mt-12 max-w-6xl mx-auto scroll-mt-24">
        <div className="text-center mb-10 px-4">
          <span className="text-[10px] font-bold text-indigo-655 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 uppercase tracking-widest">
            Module Catalog
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-normal mt-3 mb-3">
            Explore Free Utilities
          </h2>
          <p className="text-xs md:text-sm text-slate-500 max-w-md mx-auto">
            Choose from 14 high-performance tools running fully client-side inside your browser sandbox.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto mb-8 relative px-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search tools (e.g. compress, pdf, crop, palette)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-3.5 bg-white border border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all shadow-xs text-sm text-slate-800 font-medium placeholder-slate-400"
            />
            <svg className="w-5 h-5 text-slate-400 absolute left-4.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {/* Results count */}
          {searchQuery && (
            <p className="text-[11px] font-semibold text-slate-500 mt-2 text-right pr-1">
              {filteredTools.length} tool{filteredTools.length !== 1 ? 's' : ''} found
            </p>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-12 max-w-4xl mx-auto px-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4.5 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                activeCategory === cat.id
                  ? 'bg-indigo-650 border-indigo-655 text-white shadow-md shadow-indigo-500/15'
                  : 'bg-white border-slate-200 text-slate-655 hover:text-slate-900 hover:border-slate-350 shadow-xs'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Bento Grid */}
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
            {filteredTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.path}
                  to={tool.path}
                  className="premium-bento group flex flex-col justify-between p-5 rounded-3xl bg-white border border-slate-200/50 hover:border-indigo-300 relative overflow-hidden transition-all duration-300 shadow-xs cursor-pointer min-h-[300px]"
                >
                  {/* Glowing Ambient Light on Hover */}
                  <div className="absolute -right-16 -top-16 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all pointer-events-none" />

                  <div>
                    {/* Visual Card Preview Header */}
                    {renderToolPreview(tool.path)}

                    <div className="flex items-center justify-between mb-3 mt-1">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${tool.colorClass.split(' ')[0]} ${tool.colorClass.split(' ')[1]} ${tool.colorClass.split(' ')[2]}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-indigo-655 bg-indigo-50/60 border border-indigo-100/60 px-2 py-0.5 rounded-md shadow-2xs">
                        {tool.badge}
                      </span>
                    </div>
                    
                    <h3 className="font-extrabold text-sm text-slate-900 tracking-tight mb-1 group-hover:text-indigo-650 transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      {tool.description}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-1 text-[11px] font-bold text-indigo-650 group-hover:translate-x-1 transition-all">
                    <span>Open Tool</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 px-4">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
              <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-slate-600">No tools found matching your criteria.</span>
            <p className="text-xs text-slate-400 mt-1">Try a different keyword like <em>compress</em>, <em>pdf</em>, or <em>crop</em>.</p>
          </div>
        )}

      </section>

      {/* Featured Showcases (Selected high-impact tools) */}
      <section className="py-16 border-t border-slate-200/60 mt-12 max-w-5xl mx-auto scroll-mt-24">
        <div className="text-center mb-16 px-4">
          <span className="text-[10px] font-bold text-purple-650 bg-purple-50 px-3 py-1 rounded-full border border-purple-100 uppercase tracking-widest">
            Highlights
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-normal mt-3 mb-3">
            See It In Action
          </h2>
          <p className="text-xs md:text-sm text-slate-500 max-w-md mx-auto">
            Take a closer look at our four flagship local engines running completely client-side in browser threads.
          </p>
        </div>

        <div className="space-y-24 px-4">
          {/* 1. AI Background Remover */}
          <div className="flex flex-col md:flex-row-reverse gap-12 items-center justify-between group">
            <div className="flex-1 space-y-5 text-left">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-purple-50 rounded-2xl flex items-center justify-center border border-purple-100 text-purple-650 group-hover:scale-105 transition-transform duration-200 shadow-sm">
                  <Cpu className="w-5.5 h-5.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-purple-650 uppercase tracking-wider bg-purple-50/40 border border-purple-100/60 px-2 py-0.5 rounded">AI Segmenting</span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-1 group-hover:text-purple-650 transition-colors">AI Background Remover</h3>
                </div>
              </div>
              <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-medium">
                Remove image backdrops automatically. Powered by neural networks compiling directly in your browser's IndexedDB models cache.
              </p>
              <ul className="space-y-2 text-xs font-semibold text-slate-655">
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Neural subject segmentation (RMBG-1.4)</span></li>
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>No files transferred to cloud servers</span></li>
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Instant transparent alpha download</span></li>
              </ul>
              <Link 
                to="/background-remover" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-650 hover:bg-purple-700 text-white rounded-full text-[11px] font-bold uppercase tracking-wider transition shadow-md shadow-purple-500/10 active:scale-98"
              >
                Launch AI Cutout
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <Link to="/background-remover" className="flex-1 w-full max-w-[460px] bg-[#0c0c0e] border border-slate-200/40 rounded-3xl overflow-hidden aspect-[4/3] relative select-none shadow-sm group-hover:scale-[1.02] group-hover:border-purple-400/80 group-hover:shadow-[0_12px_40px_rgba(167,139,250,0.15)] transition-all duration-300 block cursor-pointer">
              <img 
                src="/demo-gifs/bg-remover.gif" 
                alt="AI Background Remover Demo" 
                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-102 group-hover:brightness-105" 
                loading="lazy" 
              />
              <div className="absolute inset-0 bg-purple-950/0 group-hover:bg-purple-950/40 transition-all duration-300 flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-purple-700 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-xl">
                  Open Tool <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          </div>

          {/* 2. Photo Mosaic Generator */}
          <div className="flex flex-col md:flex-row gap-12 items-center justify-between group">
            <div className="flex-1 space-y-5 text-left">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-fuchsia-50 rounded-2xl flex items-center justify-center border border-fuchsia-100 text-fuchsia-650 group-hover:scale-105 transition-transform duration-200 shadow-sm">
                  <Grid className="w-5.5 h-5.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-fuchsia-650 uppercase tracking-wider bg-fuchsia-50/40 border border-fuchsia-100/60 px-2 py-0.5 rounded animate-pulse-slow">Artistic Compositions</span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-1 group-hover:text-fuchsia-650 transition-colors">Photo Mosaic Generator</h3>
                </div>
              </div>
              <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-medium">
                Reconstruct target images from thousands of small photo tiles client-side. Live overlay density controls, color tinting scales, and zero server-side storage footprint.
              </p>
              <ul className="space-y-2 text-xs font-semibold text-slate-655">
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Advanced color-distance Euclidean search</span></li>
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Adjustable target transparency & tint sliders</span></li>
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Dynamic 16-color placeholder tiles fallback</span></li>
              </ul>
              <Link 
                to="/photo-mosaic-generator" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-fuchsia-650 hover:bg-fuchsia-700 text-white rounded-full text-[11px] font-bold uppercase tracking-wider transition shadow-md shadow-fuchsia-500/10 active:scale-98"
              >
                Launch Mosaic Engine
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <Link to="/photo-mosaic-generator" className="flex-1 w-full max-w-[460px] bg-[#0c0c0e] border border-slate-200/40 rounded-3xl overflow-hidden aspect-[4/3] relative select-none shadow-sm group-hover:scale-[1.02] group-hover:border-fuchsia-400/80 group-hover:shadow-[0_12px_40px_rgba(217,70,239,0.15)] transition-all duration-300 block cursor-pointer">
              <img 
                src="/demo-gifs/mosaic.gif" 
                alt="Photo Mosaic Demo" 
                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-102 group-hover:brightness-105" 
                loading="lazy" 
              />
              <div className="absolute inset-0 bg-fuchsia-950/0 group-hover:bg-fuchsia-950/40 transition-all duration-300 flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-fuchsia-750 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-xl">
                  Open Tool <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          </div>

          {/* 3. Aspect Resizer & Smart Crop */}
          <div className="flex flex-col md:flex-row-reverse gap-12 items-center justify-between group">
            <div className="flex-1 space-y-5 text-left">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100 text-amber-650 group-hover:scale-105 transition-transform duration-200 shadow-sm">
                  <Crop className="w-5.5 h-5.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-650 uppercase tracking-wider bg-amber-50/40 border border-amber-100/60 px-2 py-0.5 rounded">Social Optimization</span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-1 group-hover:text-amber-650 transition-colors">Aspect Resizer & Smart Crop</h3>
                </div>
              </div>
              <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-medium">
                Crop and resize images to standard social templates. Apply custom margin spacing and smart blur-padding to fit any aspect ratio without stretching.
              </p>
              <ul className="space-y-2 text-xs font-semibold text-slate-655">
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Presets for Instagram, YouTube, and X (Twitter)</span></li>
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Dynamic blur padding fill for vertical/horizontal bounds</span></li>
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Interactive canvas crop handles and guides</span></li>
              </ul>
              <Link 
                to="/aspect-resizer" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-705 text-white rounded-full text-[11px] font-bold uppercase tracking-wider transition shadow-md shadow-amber-500/10 active:scale-98"
              >
                Launch Aspect Crop
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <Link to="/aspect-resizer" className="flex-1 w-full max-w-[460px] bg-[#0c0c0e] border border-slate-200/40 rounded-3xl overflow-hidden aspect-[4/3] relative select-none shadow-sm group-hover:scale-[1.02] group-hover:border-amber-400/80 group-hover:shadow-[0_12px_40px_rgba(245,158,11,0.15)] transition-all duration-300 block cursor-pointer">
              <img 
                src="/demo-gifs/crop.gif" 
                alt="Aspect Resizer Demo" 
                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-102 group-hover:brightness-105" 
                loading="lazy" 
              />
              <div className="absolute inset-0 bg-amber-950/0 group-hover:bg-amber-950/40 transition-all duration-300 flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-amber-750 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-xl">
                  Open Tool <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          </div>

          {/* 4. Image Compressor */}
          <div className="flex flex-col md:flex-row gap-12 items-center justify-between group">
            <div className="flex-1 space-y-5 text-left">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 text-indigo-650 group-hover:scale-105 transition-transform duration-200 shadow-sm">
                  <ImageIcon className="w-5.5 h-5.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-indigo-650 uppercase tracking-wider bg-indigo-50/40 border border-indigo-100/60 px-2 py-0.5 rounded">Quantization Optimize</span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-1 group-hover:text-indigo-650 transition-colors">Image Compressor</h3>
                </div>
              </div>
              <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-medium">
                Reduce image file sizes by up to 90% without losing visible quality. Optimize JPEGs, PNGs, and WebPs locally in milliseconds using hardware-accelerated quantization.
              </p>
              <ul className="space-y-2 text-xs font-semibold text-slate-655">
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Lossy and lossless client-side compression</span></li>
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Configurable chroma subsampling & quality sliders</span></li>
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Instant download with batch size comparisons</span></li>
              </ul>
              <Link 
                to="/image-compressor" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-650 hover:bg-indigo-700 text-white rounded-full text-[11px] font-bold uppercase tracking-wider transition shadow-md shadow-indigo-500/10 active:scale-98"
              >
                Launch Compressor
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <Link to="/image-compressor" className="flex-1 w-full max-w-[460px] bg-[#0c0c0e] border border-slate-200/40 rounded-3xl overflow-hidden aspect-[4/3] relative select-none shadow-sm group-hover:scale-[1.02] group-hover:border-indigo-400/80 group-hover:shadow-[0_12px_40px_rgba(99,102,241,0.15)] transition-all duration-300 block cursor-pointer">
              <img 
                src="/demo-gifs/compressor.gif" 
                alt="Image Compressor Demo" 
                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-102 group-hover:brightness-105" 
                loading="lazy" 
              />
              <div className="absolute inset-0 bg-indigo-950/0 group-hover:bg-indigo-950/40 transition-all duration-300 flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-750 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-xl">
                  Open Tool <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Security Banner section */}
      <section className="my-24 max-w-5xl mx-auto premium-bento rounded-3xl p-8 bg-gradient-to-r from-slate-100/40 via-white to-slate-50/40 border border-slate-200/80 relative overflow-hidden shadow-md flex flex-col md:flex-row items-center gap-8 justify-between">
        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="space-y-3 max-w-xl text-left">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-650 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100/60 shadow-xs">
            <Lock className="w-3.5 h-3.5" />
            Client-Side Promise
          </div>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Your private files never leave your device</h3>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            ImageGiri operates under a strict offline isolation sandbox. We do not collect cookies, compile usage analytics profiles, or transfer your pixel configurations.
          </p>
        </div>

        <div className="shrink-0 w-full md:w-auto">
          <Link 
            to="/privacy" 
            className="w-full md:w-auto inline-flex justify-center items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-700 hover:text-slate-900 rounded-full transition border border-slate-200 shadow-xs backdrop-blur-md"
          >
            View Privacy Policy
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
};
