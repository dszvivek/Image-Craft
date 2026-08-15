import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  X, 
  ArrowRight, 
  Sparkles, 
  Cpu, 
  Grid, 
  Crop, 
  Feather, 
  FileText, 
  CreditCard, 
  PenTool, 
  Image as ImageIcon, 
  Files, 
  LayoutGrid, 
  Palette, 
  Copyright, 
  Fingerprint, 
  Maximize2, 
  Smile, 
  Sun, 
  Moon, 
  ShieldCheck, 
  HelpCircle,
  RotateCw,
  Square,
  Wand2,
  Sliders,
  Gamepad2,
  Terminal,
  Zap,
  ArrowLeftRight,
  ShieldAlert,
  Lock
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  toggleTheme: () => void;
  currentTheme: string;
}

interface SearchItem {
  id: string;
  name: string;
  description: string;
  path?: string;
  category: string;
  icon: React.ElementType;
  badge?: string;
  colorClass?: string;
  action?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  toggleTheme,
  currentTheme
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const allItems: SearchItem[] = [
    // Image & AI Tools
    {
      id: 'bg-remover',
      name: 'AI Background Remover',
      description: 'Remove photo backgrounds locally with on-device AI neural networks',
      path: '/background-remover',
      category: 'AI & Image Editing',
      icon: Cpu,
      badge: 'Local AI',
      colorClass: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-400'
    },
    {
      id: 'ambient',
      name: 'Ambient Generative Visuals',
      description: 'Living generative art canvas for focus, relaxation & break timers',
      path: '/ambient',
      category: 'AI & Image Editing',
      icon: Sparkles,
      badge: 'Generative',
      colorClass: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400'
    },
    {
      id: 'shape-art',
      name: 'AI Shape Art Generator',
      description: 'Convert photos to particle clouds, stars, or sketches',
      path: '/shape-art-generator',
      category: 'AI & Image Editing',
      icon: Sparkles,
      badge: 'Artistic',
      colorClass: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400'
    },
    {
      id: 'svg-vectorizer',
      name: 'SVG Vectorizer',
      description: 'Trace JPG/PNG raster files into scalable vector SVG paths',
      path: '/svg-vectorizer',
      category: 'AI & Image Editing',
      icon: Feather,
      badge: 'Vector',
      colorClass: 'text-teal-600 bg-teal-50 dark:bg-teal-950/40 dark:text-teal-400'
    },
    {
      id: 'watermark',
      name: 'Watermark Overlay',
      description: 'Apply copyright logos and text patterns across photos offline',
      path: '/watermark-overlay',
      category: 'AI & Image Editing',
      icon: Copyright,
      badge: 'Watermark',
      colorClass: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400'
    },
    {
      id: 'meme',
      name: 'Instant Meme Generator',
      description: 'Create custom captioned memes with draggable text layers and curated fonts',
      path: '/meme-generator',
      category: 'AI & Image Editing',
      icon: Smile,
      badge: 'Meme',
      colorClass: 'text-green-600 bg-green-50 dark:bg-green-950/40 dark:text-green-400'
    },
    {
      id: 'crop-image',
      name: 'Interactive Image Cropper',
      description: 'Crop images with 8-point handle, aspect ratio presets & passport photo mode',
      path: '/crop-image',
      category: 'AI & Image Editing',
      icon: Crop,
      badge: 'Crop',
      colorClass: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400'
    },
    {
      id: 'rotate-image',
      name: 'Image Rotator & Straightener',
      description: 'Rotate 90°, mirror flip, and level horizon tilt angles with fine straightener',
      path: '/rotate-image',
      category: 'AI & Image Editing',
      icon: RotateCw,
      badge: 'Rotate',
      colorClass: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400'
    },
    {
      id: 'border-expander',
      name: 'Canvas Border Expander',
      description: 'Add solid color frames, frosted blurred margins, and soft drop shadows',
      path: '/add-border-to-image',
      category: 'AI & Image Editing',
      icon: Square,
      badge: 'Border',
      colorClass: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400'
    },
    {
      id: 'photo-filters',
      name: 'Photo Filter & Duotone Studio',
      description: 'Apply 12 aesthetic photo filters and custom duotone gradient maps',
      path: '/photo-filters',
      category: 'AI & Image Editing',
      icon: Wand2,
      badge: 'Filters',
      colorClass: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-400'
    },
    {
      id: 'invert-colors',
      name: 'Color Inverter & B&W Converter',
      description: 'Invert colors to photographic negative and generate Otsu binary B&W',
      path: '/invert-colors',
      category: 'AI & Image Editing',
      icon: Moon,
      badge: 'Invert',
      colorClass: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400'
    },
    {
      id: 'adjust-image',
      name: 'Image Adjuster & Color Tuner',
      description: 'Tune exposure, brightness, contrast, sharpness & 1-click Auto Enhance',
      path: '/adjust-image',
      category: 'AI & Image Editing',
      icon: Sliders,
      badge: 'Adjust',
      colorClass: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400'
    },
    {
      id: 'pixel-art',
      name: 'Pixel Art & 8-Bit Converter',
      description: 'Retro 8-bit pixel art generator with Game Boy palettes and Floyd-Steinberg dithering',
      path: '/pixel-art-generator',
      category: 'AI & Image Editing',
      icon: Gamepad2,
      badge: 'Pixel Art',
      colorClass: 'text-fuchsia-600 bg-fuchsia-50 dark:bg-fuchsia-950/40 dark:text-fuchsia-400'
    },
    {
      id: 'ascii-art',
      name: 'ASCII & Text Art Generator',
      description: 'Convert photos to terminal ASCII text art with Matrix green and ANSI color styles',
      path: '/ascii-art-generator',
      category: 'AI & Image Editing',
      icon: Terminal,
      badge: 'ASCII',
      colorClass: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400'
    },
    {
      id: 'glitch-art',
      name: 'Glitch Art & CRT Distortion',
      description: 'RGB chromatic split, digital datamoshing slices, and retro CRT television scanlines',
      path: '/glitch-image-generator',
      category: 'AI & Image Editing',
      icon: Zap,
      badge: 'Glitch',
      colorClass: 'text-violet-600 bg-violet-50 dark:bg-violet-950/40 dark:text-violet-400'
    },
    {
      id: 'redact-image',
      name: 'Photo Redactor & Censor Studio',
      description: 'Permanently censor private data, blur faces, and blackout ID numbers with zero server leaks',
      path: '/redact-image',
      category: 'AI & Image Editing',
      icon: ShieldAlert,
      badge: 'Redact',
      colorClass: 'text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400'
    },
    {
      id: 'steganography',
      name: 'Image Steganography & Secret Text',
      description: 'Invisibly embed and extract encrypted secret messages inside photos using LSB encoding',
      path: '/image-steganography',
      category: 'AI & Image Editing',
      icon: Lock,
      badge: 'Stego',
      colorClass: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400'
    },

    // Optimization & Formats
    {
      id: 'compressor',
      name: 'Image Compressor',
      description: 'Optimize JPEG, PNG, and WebP images with before/after comparison',
      path: '/image-compressor',
      category: 'Optimization & Formats',
      icon: ImageIcon,
      badge: 'Compress',
      colorClass: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400'
    },
    {
      id: 'color-palette',
      name: 'Color Palette Extractor',
      description: 'Extract dominant HEX color palettes using K-Means clustering',
      path: '/color-palette-extractor',
      category: 'Optimization & Formats',
      icon: Palette,
      badge: 'Palette',
      colorClass: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40 dark:text-cyan-400'
    },
    {
      id: 'metadata-stripper',
      name: 'EXIF Metadata Stripper',
      description: 'Inspect and purge GPS coordinates and camera headers from photos',
      path: '/metadata-stripper',
      category: 'Optimization & Formats',
      icon: Fingerprint,
      badge: 'Privacy',
      colorClass: 'text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400'
    },

    // Layout & Grid
    {
      id: 'side-by-side',
      name: 'Side-by-Side & Before/After Combiner',
      description: 'Combine two photos horizontally or vertically with Before/After badges & divider borders',
      path: '/side-by-side-image',
      category: 'Layout & Grid',
      icon: ArrowLeftRight,
      badge: 'Compare',
      colorClass: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400'
    },
    {
      id: 'panorama-splitter',
      name: 'Instagram Panorama & Carousel Splitter',
      description: 'Split wide panoramic landscape photos into seamless 4:5 swipe carousels with ZIP download',
      path: '/instagram-panorama-splitter',
      category: 'Layout & Grid',
      icon: Maximize2,
      badge: 'Panorama',
      colorClass: 'text-pink-600 bg-pink-50 dark:bg-pink-950/40 dark:text-pink-400'
    },
    {
      id: 'aspect-resizer',
      name: 'Aspect Resizer & Smart Crop',
      description: 'Scale photos to social presets with smart blur-padding',
      path: '/aspect-resizer',
      category: 'Layout & Grid',
      icon: Crop,
      badge: 'Resizer',
      colorClass: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400'
    },
    {
      id: 'collage-maker',
      name: 'Photo Collage Maker',
      description: 'Assemble multiple pictures in custom layout templates and grids',
      path: '/collage-maker',
      category: 'Layout & Grid',
      icon: LayoutGrid,
      badge: 'Collage',
      colorClass: 'text-pink-600 bg-pink-50 dark:bg-pink-950/40 dark:text-pink-400'
    },
    {
      id: 'grid-splitter',
      name: 'Instagram Grid Splitter',
      description: 'Slice photos into 3x3, 3x2, or 4x4 tile grids for social feeds',
      path: '/instagram-grid-splitter',
      category: 'Layout & Grid',
      icon: Maximize2,
      badge: 'Grid',
      colorClass: 'text-orange-600 bg-orange-50 dark:bg-orange-950/40 dark:text-orange-400'
    },
    {
      id: 'photo-mosaic',
      name: 'Photo Mosaic Generator',
      description: 'Recreate target photos from thousands of small photo tiles',
      path: '/photo-mosaic-generator',
      category: 'Layout & Grid',
      icon: Grid,
      badge: 'Mosaic',
      colorClass: 'text-fuchsia-600 bg-fuchsia-50 dark:bg-fuchsia-950/40 dark:text-fuchsia-400'
    },

    // PDF & Document Tools
    {
      id: 'ocr-text-extractor',
      name: 'OCR Text Extractor',
      description: 'Scan and extract multi-lingual text from image files via Tesseract WASM',
      path: '/ocr-text-extractor',
      category: 'PDF & Documents',
      icon: FileText,
      badge: 'OCR',
      colorClass: 'text-emerald-650 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400'
    },
    {
      id: 'sign-pdf',
      name: 'Electronic PDF Signer',
      description: 'Sign PDF documents client-side with drawn, typed, or uploaded signatures',
      path: '/sign-pdf',
      category: 'PDF & Documents',
      icon: PenTool,
      badge: 'Sign PDF',
      colorClass: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400'
    },
    {
      id: 'bank-statement',
      name: 'Bank Statement Analyzer',
      description: 'Parse PDF/CSV/Excel bank and credit card statement ledgers locally',
      path: '/bank-statement-analyzer',
      category: 'PDF & Documents',
      icon: CreditCard,
      badge: 'Finance',
      colorClass: 'text-teal-650 bg-teal-50 dark:bg-teal-950/40 dark:text-teal-400'
    },
    {
      id: 'batch-converter',
      name: 'Batch Image to PDF & Format Converter',
      description: 'Convert and merge multiple photos into PDF, PNG, JPG, or WebP',
      path: '/batch-converter',
      category: 'PDF & Documents',
      icon: Files,
      badge: 'Batch',
      colorClass: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400'
    },

    // Quick Actions
    {
      id: 'toggle-theme',
      name: currentTheme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode',
      description: 'Toggle the visual theme of the interface',
      category: 'Quick Actions',
      icon: currentTheme === 'light' ? Moon : Sun,
      action: toggleTheme
    },
    {
      id: 'about-us',
      name: 'About ImagePlumber',
      description: 'Learn about our zero-upload offline architecture and mission',
      path: '/about',
      category: 'Quick Actions',
      icon: ShieldCheck
    },
    {
      id: 'faq-help',
      name: 'Frequently Asked Questions',
      description: 'Common questions about security, offline mode, and file limits',
      path: '/faq',
      category: 'Quick Actions',
      icon: HelpCircle
    }
  ];

  // Filter items based on search query
  const filteredItems = allItems.filter(item => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.badge && item.badge.toLowerCase().includes(q))
    );
  });

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Keep selected index within bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredItems.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          handleSelect(filteredItems[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredItems]);

  const handleSelect = (item: SearchItem) => {
    onClose();
    if (item.action) {
      item.action();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 px-4 bg-slate-950/60 backdrop-blur-md animate-fade-in">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] z-10">
        
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools, formats, or actions... (e.g. compress, ocr, pdf)"
            className="w-full bg-transparent border-0 outline-hidden text-sm md:text-base font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 scrollbar-thin">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400">
              <p className="text-sm font-semibold">No tools found matching "{query}"</p>
              <p className="text-xs text-slate-400 mt-1">Try keywords like <em>background</em>, <em>convert</em>, <em>sign</em>, or <em>crop</em>.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredItems.map((item, index) => {
                const Icon = item.icon;
                const isSelected = index === selectedIndex;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-100'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${
                        item.colorClass || 'text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs md:text-sm font-extrabold truncate ${
                            isSelected ? 'text-indigo-650 dark:text-indigo-400' : 'text-slate-900 dark:text-slate-100'
                          }`}>
                            {item.name}
                          </span>
                          {item.badge && (
                            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <ArrowRight className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected ? 'text-indigo-600 dark:text-indigo-400 translate-x-1' : 'text-slate-300 dark:text-slate-600'
                    }`} />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-medium">
          <div className="hidden sm:flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 font-mono text-[9px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 font-mono text-[9px]">↓</kbd> Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 font-mono text-[9px]">↵</kbd> Select
            </span>
          </div>
          <span className="text-[10px] text-emerald-650 dark:text-emerald-400 font-bold flex items-center gap-1 ml-auto sm:ml-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            100% Client-Side
          </span>
        </div>

      </div>
    </div>
  );
};
