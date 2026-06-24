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
  X
} from 'lucide-react';
import { SEO } from '../components/SEO';

import bgRemoverImg from '../assets/bg_remover_feature.gif';
import svgVectorizerImg from '../assets/svg_vectorizer_feature.gif';
import mosaicImg from '../assets/mosaic_feature.gif';

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
    colorClass: 'text-pink-650 bg-pink-50 border-pink-100/50 hover:border-pink-300'
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

export const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredTools = toolDirectory.filter(tool => {
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tool.badge.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[70%] h-[350px] bg-gradient-to-tr from-indigo-500/10 via-purple-500/8 to-pink-500/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse-slow" />

      {/* Hero Section */}
      <section className="text-center pt-16 pb-12 md:pt-24 md:pb-20 flex flex-col items-center justify-center relative overflow-hidden">
        
        {/* Anti-Cloud Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200/80 rounded-full text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-6 shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
          <span>100% On-Device & Offline-Ready</span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 max-w-4xl leading-[1.08]">
          Craft Perfect Images. <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-650 via-purple-650 to-pink-550 font-black">
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
            className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-650 hover:from-indigo-550 hover:to-purple-550 text-[11px] font-bold uppercase tracking-wider text-white rounded-xl shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-98 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            Explore Free Tools
          </a>
          <Link 
            to="/about" 
            className="px-8 py-3.5 bg-white/80 hover:bg-indigo-50/15 border border-slate-200/50 text-[11px] font-bold uppercase tracking-wider text-slate-700 hover:text-slate-900 rounded-xl transition-all shadow-xs backdrop-blur-md"
          >
            How it works
          </Link>
        </div>

      </section>

      {/* Bento Cards: Core Value Propositions */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 max-w-6xl mx-auto px-4">
        
        {/* Prop 1 */}
        <div className="premium-bento p-6 rounded-3xl bg-white border border-slate-200/50 flex flex-col justify-between gap-4 group cursor-default">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 group-hover:scale-110 transition-transform duration-200">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800 tracking-tight mb-1 group-hover:text-indigo-650 transition-colors">Local Sandbox Processing</h3>
            <p className="text-[13px] text-slate-500 leading-relaxed font-medium">
              Files reside strictly within browser memory space. Web Workers execute all processing scripts locally without cloud transmission.
            </p>
          </div>
        </div>

        {/* Prop 2 */}
        <div className="premium-bento p-6 rounded-3xl bg-white border border-slate-200/50 flex flex-col justify-between gap-4 group cursor-default">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100 group-hover:scale-110 transition-transform duration-200">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800 tracking-tight mb-1 group-hover:text-purple-650 transition-colors">Transformers.js AI Cutout</h3>
            <p className="text-[13px] text-slate-500 leading-relaxed font-medium">
              Run neural network subject segmentation using WebAssembly. Leverage your CPU/GPU hardware capabilities locally.
            </p>
          </div>
        </div>

        {/* Prop 3 */}
        <div className="premium-bento p-6 rounded-3xl bg-white border border-slate-200/50 flex flex-col justify-between gap-4 group cursor-default">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-650 border border-emerald-100 group-hover:scale-110 transition-transform duration-200">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800 tracking-tight mb-1 group-hover:text-emerald-650 transition-colors">Zero Latency Operations</h3>
            <p className="text-[13px] text-slate-500 leading-relaxed font-medium">
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
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mt-3 mb-3">
            Explore Free Utilities
          </h2>
          <p className="text-xs md:text-sm text-slate-550 max-w-md mx-auto">
            Choose from 13 high-performance tools running fully client-side inside your browser sandbox.
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
              className="w-full pl-12 pr-10 py-3.5 bg-white border border-slate-200/80 rounded-2xl focus:border-[#8c6d3e] focus:ring-4 focus:ring-[#8c6d3e]/10 focus:outline-none transition-all shadow-xs text-sm text-slate-800 font-medium placeholder-slate-400"
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
              className={`px-4.5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                activeCategory === cat.id
                  ? 'bg-indigo-650 border-indigo-600 text-white shadow-md shadow-indigo-500/15'
                  : 'bg-white border-slate-200/80 text-slate-655 hover:text-slate-900 hover:border-slate-350 shadow-xs'
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
                  className="premium-bento group flex flex-col justify-between p-6 rounded-3xl bg-white border border-slate-200/50 hover:border-indigo-300 relative overflow-hidden transition-all duration-300 shadow-xs cursor-pointer min-h-[190px]"
                >
                  {/* Glowing Ambient Light on Hover */}
                  <div className="absolute -right-16 -top-16 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all pointer-events-none" />

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-9.5 h-9.5 rounded-xl flex items-center justify-center border shrink-0 ${tool.colorClass.split(' ')[0]} ${tool.colorClass.split(' ')[1]} ${tool.colorClass.split(' ')[2]}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-indigo-650 bg-indigo-50/60 border border-indigo-100/60 px-2 py-0.5 rounded-md shadow-2xs">
                        {tool.badge}
                      </span>
                    </div>
                    
                    <h3 className="font-extrabold text-sm text-slate-900 tracking-tight mb-2 group-hover:text-indigo-650 transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      {tool.description}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-1 text-[11px] font-bold text-indigo-600 group-hover:translate-x-1 transition-all">
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
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mt-3 mb-3">
            See It In Action
          </h2>
          <p className="text-xs md:text-sm text-slate-550 max-w-md mx-auto">
            Take a closer look at our three flagship local engines running completely client-side in browser threads.
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
              <p className="text-xs md:text-sm text-slate-550 leading-relaxed font-medium">
                Remove image backdrops automatically. Powered by neural networks compiling directly in your browser's IndexedDB models cache.
              </p>
              <ul className="space-y-2 text-xs font-semibold text-slate-655">
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Neural subject segmentation (RMBG-1.4)</span></li>
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>No files transferred to cloud servers</span></li>
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Instant transparent alpha download</span></li>
              </ul>
              <Link 
                to="/background-remover" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-650 hover:bg-purple-700 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider transition shadow-md shadow-purple-500/10 active:scale-98"
              >
                Launch AI Cutout
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <Link to="/background-remover" className="flex-1 w-full max-w-[460px] bg-slate-50/20 border border-slate-200/40 rounded-3xl overflow-hidden aspect-[4/3] relative select-none shadow-sm group-hover:scale-[1.02] group-hover:border-purple-400/80 group-hover:shadow-[0_12px_40px_rgba(167,139,250,0.15)] transition-all duration-300 block cursor-pointer backdrop-blur-xs">
              <img src={bgRemoverImg} alt="AI Background Remover Demo" className="w-full h-full object-cover filter sepia-[0.3] contrast-[0.96] saturate-[1.1] transition-all duration-300" />
              <div className="absolute inset-0 bg-purple-950/0 group-hover:bg-purple-950/40 transition-all duration-300 flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-purple-750 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-xl">
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
              <p className="text-xs md:text-sm text-slate-555 leading-relaxed font-medium">
                Reconstruct target images from thousands of small photo tiles client-side. Live overlay density controls, color tinting scales, and zero server-side storage footprint.
              </p>
              <ul className="space-y-2 text-xs font-semibold text-slate-655">
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Advanced color-distance Euclidean search</span></li>
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Adjustable target transparency & tint sliders</span></li>
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Dynamic 16-color placeholder tiles fallback</span></li>
              </ul>
              <Link 
                to="/photo-mosaic-generator" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-fuchsia-650 hover:bg-fuchsia-700 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider transition shadow-md shadow-fuchsia-500/10 active:scale-98"
              >
                Launch Mosaic Engine
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <Link to="/photo-mosaic-generator" className="flex-1 w-full max-w-[460px] bg-slate-50/20 border border-slate-200/40 rounded-3xl overflow-hidden aspect-[4/3] relative select-none shadow-sm group-hover:scale-[1.02] group-hover:border-fuchsia-400/80 group-hover:shadow-[0_12px_40px_rgba(217,70,239,0.15)] transition-all duration-300 block cursor-pointer backdrop-blur-xs">
              <img src={mosaicImg} alt="Photo Mosaic Generator Demo" className="w-full h-full object-cover filter sepia-[0.3] contrast-[0.96] saturate-[1.1] transition-all duration-300" />
              <div className="absolute inset-0 bg-fuchsia-950/0 group-hover:bg-fuchsia-950/40 transition-all duration-300 flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-fuchsia-750 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-xl">
                  Open Tool <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          </div>

          {/* 3. SVG Vectorizer */}
          <div className="flex flex-col md:flex-row-reverse gap-12 items-center justify-between group">
            <div className="flex-1 space-y-5 text-left">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-teal-50 rounded-2xl flex items-center justify-center border border-teal-100 text-teal-650 group-hover:scale-105 transition-transform duration-200 shadow-sm">
                  <Feather className="w-5.5 h-5.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-teal-650 uppercase tracking-wider bg-teal-50/40 border border-teal-100/60 px-2 py-0.5 rounded">Vector Conversion</span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-1 group-hover:text-teal-650 transition-colors">SVG Vectorizer</h3>
                </div>
              </div>
              <p className="text-xs md:text-sm text-slate-555 leading-relaxed font-medium">
                Trace raster JPEGs and PNGs into fully scalable vector SVGs. Adjust color palette counts, path path trace configurations, and speckle noise filters offline.
              </p>
              <ul className="space-y-2 text-xs font-semibold text-slate-655">
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>K-Means++ color quantization</span></li>
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Moore-Neighbor boundary tracer</span></li>
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Douglas-Peucker path simplification</span></li>
              </ul>
              <Link 
                to="/svg-vectorizer" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-teal-650 hover:bg-teal-700 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider transition shadow-md shadow-teal-500/10 active:scale-98"
              >
                Launch SVG Vectorizer
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <Link to="/svg-vectorizer" className="flex-1 w-full max-w-[460px] bg-slate-50/20 border border-slate-200/40 rounded-3xl overflow-hidden aspect-[4/3] relative select-none shadow-sm group-hover:scale-[1.02] group-hover:border-teal-400/80 group-hover:shadow-[0_12px_40px_rgba(13,148,136,0.15)] transition-all duration-300 block cursor-pointer backdrop-blur-xs">
              <img src={svgVectorizerImg} alt="SVG Vectorizer Demo" className="w-full h-full object-cover filter sepia-[0.3] contrast-[0.96] saturate-[1.1] transition-all duration-300" />
              <div className="absolute inset-0 bg-teal-950/0 group-hover:bg-teal-950/40 transition-all duration-300 flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-teal-750 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-xl">
                  Open Tool <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Security Banner section */}
      <section className="my-24 max-w-5xl mx-auto premium-bento rounded-3xl p-8 bg-gradient-to-r from-[#faf1ea]/60 via-white to-[#fdf6ee]/60 border border-slate-200/50 relative overflow-hidden shadow-md flex flex-col md:flex-row items-center gap-8 justify-between">
        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#a38350]/5 rounded-full blur-2xl pointer-events-none" />
        
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
            className="w-full md:w-auto inline-flex justify-center items-center gap-2 px-6 py-3 bg-white/80 hover:bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-700 hover:text-slate-900 rounded-xl transition border border-slate-200/50 shadow-xs backdrop-blur-md"
          >
            View Privacy Policy
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
};
