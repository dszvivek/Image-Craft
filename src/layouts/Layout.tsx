import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Cpu, 
  Image as ImageIcon, 
  Maximize2, 
  LayoutGrid, 
  Palette, 
  FileText,
  Lock,
  Files,
  Fingerprint,
  Copyright,
  Crop,
  Smile,
  Feather,
  Grid,
  ChevronRight,
  Home
} from 'lucide-react';
import { AdPlacement } from '../components/AdPlacement';

export const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileToolsExpanded, setIsMobileToolsExpanded] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (!isMobileMenuOpen) {
      setIsMobileToolsExpanded(false);
    }
  }, [isMobileMenuOpen]);

  // Scroll to top on navigation / route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const showSidebar = !['/', '/about', '/privacy', '/contact', '/faq'].includes(location.pathname);

  const tools = [
    { 
      name: 'AI Background Remover', 
      path: '/background-remover', 
      icon: Cpu,
      description: 'Isolate subjects completely inside browser.',
      colorClass: 'text-purple-650 bg-purple-50 border-purple-100/50'
    },
    { 
      name: 'Photo Mosaic Generator', 
      path: '/photo-mosaic-generator', 
      icon: Grid,
      description: 'Compose target images from tile collections.',
      colorClass: 'text-fuchsia-600 bg-fuchsia-50 border-fuchsia-100/50'
    },
    { 
      name: 'Smart Crop & Aspect Resizer', 
      path: '/aspect-resizer', 
      icon: Crop,
      description: 'Crop and scale to social preset dimensions.',
      colorClass: 'text-amber-600 bg-amber-50 border-amber-100/50'
    },
    { 
      name: 'SVG Vectorizer', 
      path: '/svg-vectorizer', 
      icon: Feather,
      description: 'Trace raster logos into scalable SVGs.',
      colorClass: 'text-teal-600 bg-teal-50 border-teal-100/50'
    },
    { 
      name: 'OCR Text Extractor', 
      path: '/ocr-text-extractor', 
      icon: FileText,
      description: 'Extract multi-language texts from image scans.',
      colorClass: 'text-emerald-650 bg-emerald-50 border-emerald-100/50'
    },
    { 
      name: 'Image Compressor', 
      path: '/image-compressor', 
      icon: ImageIcon,
      description: 'Optimize JPEGs, PNGs, and WebPs locally.',
      colorClass: 'text-indigo-650 bg-indigo-50 border-indigo-100/50'
    },
    { 
      name: 'Batch Image to PDF & Format Converter', 
      path: '/batch-converter', 
      icon: Files,
      description: 'Convert and merge images into PDF, WebP, PNG, or JPEG in bulk.',
      colorClass: 'text-indigo-650 bg-indigo-50 border-indigo-100/50'
    },
    { 
      name: 'Photo Collage Maker', 
      path: '/collage-maker', 
      icon: LayoutGrid,
      description: 'Assemble images in dynamic canvases.',
      colorClass: 'text-pink-650 bg-pink-50 border-pink-100/50'
    },
    { 
      name: 'Color Palette Extractor', 
      path: '/color-palette-extractor', 
      icon: Palette,
      description: 'Quantize colors and copy HEX values.',
      colorClass: 'text-cyan-600 bg-cyan-50 border-cyan-100/50'
    },
    { 
      name: 'Watermark Overlay', 
      path: '/watermark-overlay', 
      icon: Copyright,
      description: 'Apply logos and text watermarks client-side.',
      colorClass: 'text-rose-600 bg-rose-50 border-rose-100/50'
    },
    { 
      name: 'EXIF Metadata Stripper', 
      path: '/metadata-stripper', 
      icon: Fingerprint,
      description: 'Inspect and strip EXIF privacy headers.',
      colorClass: 'text-red-600 bg-red-50 border-red-100/50'
    },
    { 
      name: 'Instagram Grid Splitter', 
      path: '/instagram-grid-splitter', 
      icon: Maximize2,
      description: 'Slice photos into creative tile grids.',
      colorClass: 'text-orange-600 bg-orange-50 border-orange-100/50'
    },
    { 
      name: 'Instant Meme Generator', 
      path: '/meme-generator', 
      icon: Smile,
      description: 'Design custom top/bottom captioned memes.',
      colorClass: 'text-green-600 bg-green-50 border-green-100/50'
    },
  ];

  // Build breadcrumb from current route
  const currentTool = tools.find(t => t.path === location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Main Navigation */}
      <div className="sticky top-0 z-40 w-full px-4 sm:px-6 lg:px-8 pt-2 sm:pt-4 pointer-events-none">
        <header className="max-w-7xl mx-auto h-16 glass rounded-2xl border border-slate-200/60 shadow-md shadow-slate-200/5 px-4 sm:px-6 lg:px-8 flex items-center justify-between pointer-events-auto">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 20l7-10 7 10" />
                <path d="M9 20l4-6 4 6" />
                <circle cx="12" cy="16" r="2" fill="currentColor" />
              </svg>
            </div>
            <span className="text-lg font-black tracking-tight text-slate-900 group-hover:text-indigo-650 transition-colors">
              Image<span className="text-indigo-600">Giri</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink 
              to="/" 
              end
              className={({ isActive }) => 
                `text-[11px] font-bold uppercase tracking-wider hover:text-indigo-600 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-550'}`
              }
            >
              Home
            </NavLink>

            {/* Tools Dropdown Trigger */}
            <div className="relative group/dropdown">
              <button className="text-[11px] font-bold uppercase tracking-wider text-slate-550 hover:text-indigo-600 flex items-center gap-1 py-2 cursor-pointer transition-colors">
                Tools
                <svg className="w-3.5 h-3.5 text-slate-400 transition-transform group-hover/dropdown:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              <div className="absolute left-1/2 -translate-x-1/2 mt-3.5 w-[640px] bg-white border border-slate-200/60 p-4 rounded-2xl shadow-2xl shadow-slate-200/30 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all duration-200 grid grid-cols-2 gap-1.5 z-50">
                {/* Visual Arrow */}
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-t border-l border-slate-200/60 rotate-45" />
                
                {tools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <Link
                      key={tool.path}
                      to={tool.path}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-all text-left group/item"
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${tool.colorClass} group-hover/item:scale-105 transition-transform`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold leading-tight group-hover/item:text-indigo-650 transition-colors">{tool.name}</div>
                        <div className="text-[10px] text-slate-450 leading-relaxed font-medium">{tool.description}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            <NavLink 
              to="/about" 
              className={({ isActive }) => 
                `text-[11px] font-bold uppercase tracking-wider hover:text-indigo-600 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-550'}`
              }
            >
              About
            </NavLink>
            <NavLink 
              to="/faq" 
              className={({ isActive }) => 
                `text-[11px] font-bold uppercase tracking-wider hover:text-indigo-600 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-550'}`
              }
            >
              FAQ
            </NavLink>
            <NavLink 
              to="/contact" 
              className={({ isActive }) => 
                `text-[11px] font-bold uppercase tracking-wider hover:text-indigo-600 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-550'}`
              }
            >
              Contact
            </NavLink>
          </nav>

          {/* Desktop Right CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="https://github.com/dszvivek/Image-Craft"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-500 hover:text-indigo-650 hover:scale-105 transition-all duration-200 cursor-pointer flex items-center justify-center"
              title="View on GitHub"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
            </a>
            <Link
              to="/background-remover"
              className="px-4 py-2 bg-gradient-to-br from-indigo-600 to-purple-650 hover:from-indigo-500 hover:to-purple-600 text-[11px] font-bold text-white rounded-xl shadow-md shadow-indigo-500/15 hover:shadow-indigo-500/25 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
            >
              <Cpu className="w-3.5 h-3.5" />
              Try AI Cutout
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

        </header>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-x-4 top-20 z-50 md:hidden premium-bento rounded-2xl p-5 flex flex-col shadow-2xl shadow-slate-300/20 border border-slate-200/80 animate-fade-in max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin">
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Main Nav Links */}
          <nav className="flex flex-col gap-1 mb-2">
            {[
              { to: '/', label: 'Home' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2.5 rounded-xl transition-all"
              >
                {label}
              </Link>
            ))}

            {/* Mobile Tools Accordion Trigger */}
            <button
              onClick={() => setIsMobileToolsExpanded(!isMobileToolsExpanded)}
              className="flex items-center justify-between text-sm font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2.5 rounded-xl transition-all cursor-pointer text-left"
            >
              <span>Tools</span>
              <svg 
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isMobileToolsExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Mobile Tools Collapsible Grid */}
            {isMobileToolsExpanded && (
              <div className="border-t border-slate-100/80 pt-3.5 pb-2.5 px-1 animate-fade-in">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mb-3">
                  All 13 Tools
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {tools.map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <Link
                        key={tool.path}
                        to={tool.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all hover:shadow-sm ${tool.colorClass} bg-opacity-40`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="text-[10px] font-bold text-slate-700 leading-tight">{tool.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {[
              { to: '/about', label: 'About' },
              { to: '/faq', label: 'FAQ' },
              { to: '/privacy', label: 'Privacy' },
              { to: '/contact', label: 'Contact' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2.5 rounded-xl transition-all"
              >
                {label}
              </Link>
            ))}
            <a 
              href="https://github.com/dszvivek/Image-Craft" 
              target="_blank" 
              rel="noopener noreferrer" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2.5 rounded-xl transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
              GitHub
            </a>
          </nav>
        </div>
      )}

      {/* Header Ad Slot */}
      <AdPlacement type="header" className="px-4" />

      {/* Main Page Area */}
      <main className={`flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col ${showSidebar ? 'xl:flex-row' : ''} gap-8`}>
        
        {/* Main Content Pane */}
        <div className="flex-1 min-w-0">

          {/* Breadcrumb — shown on tool pages */}
          {currentTool && (
            <nav className="flex items-center gap-1.5 mb-5 text-[11px] font-semibold text-slate-450" aria-label="Breadcrumb">
              <Link to="/" className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-slate-700">{currentTool.name}</span>
            </nav>
          )}

          <div key={location.pathname} className="animate-fade-in">
            <Outlet />
          </div>
        </div>

        {/* Sidebar Ad Placement — only at xl+ so tool content has room */}
        {showSidebar && (
          <aside className="hidden xl:block w-[260px] shrink-0">
            <div className="sticky top-24">
              <AdPlacement type="sidebar" />
            </div>
          </aside>
        )}
      </main>

      {/* Footer Ad Placement (Mobile only) */}
      <AdPlacement type="mobile" className="lg:hidden" />

      {/* Footer */}
      <footer className="w-full bg-white border-t border-slate-100 mt-auto py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 20l7-10 7 10" />
                  <path d="M9 20l4-6 4 6" />
                  <circle cx="12" cy="16" r="2" fill="currentColor" />
                </svg>
              </div>
              <span className="font-bold text-lg text-slate-900">ImageGiri</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Privacy-first local image processing tools. Your files never leave your device. No cloud storage, no data harvesting.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1 w-fit">
              <Lock className="w-3 h-3" />
              100% Local Processing
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-slate-800 mb-3.5">Core Tools</h4>
            <ul className="text-xs text-slate-500 flex flex-col gap-2">
              {tools.slice(0, 6).map(t => (
                <li key={t.path}><Link to={t.path} className="hover:text-indigo-600 transition">{t.name}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-slate-800 mb-3.5">Creative Tools</h4>
            <ul className="text-xs text-slate-500 flex flex-col gap-2">
              {tools.slice(6).map(t => (
                <li key={t.path}><Link to={t.path} className="hover:text-indigo-600 transition">{t.name}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-slate-800 mb-3.5">Privacy & Legal</h4>
            <ul className="text-xs text-slate-550 flex flex-col gap-2">
              <li><Link to="/about" className="hover:text-indigo-600 transition">About Us</Link></li>
              <li><Link to="/faq" className="hover:text-indigo-600 transition">FAQ Helpdesk</Link></li>
              <li><Link to="/privacy" className="hover:text-indigo-600 transition">Privacy Policy</Link></li>
              <li><Link to="/contact" className="hover:text-indigo-600 transition">Contact Support</Link></li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-450">
          <p>© {new Date().getFullYear()} ImageGiri. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com/dszvivek/Image-Craft" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-1 hover:text-indigo-600 transition font-medium"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
              GitHub
            </a>
            <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition">Sitemap</a>
            <Link to="/privacy" className="hover:text-indigo-600 transition">Terms of Service</Link>
          </div>
        </div>
      </footer>

    </div>
  );
};
