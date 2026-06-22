import { useState } from 'react';
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
  Lock
} from 'lucide-react';
import { AdPlacement } from '../components/AdPlacement';

export const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const showSidebar = !['/', '/about', '/privacy', '/contact'].includes(location.pathname);

  const tools = [
    { 
      name: 'Image Compressor', 
      path: '/image-compressor', 
      icon: ImageIcon,
      description: 'Optimize JPEGs, PNGs, and WebPs locally.',
      colorClass: 'text-indigo-650 bg-indigo-50 border-indigo-100/50'
    },
    { 
      name: 'AI Background Remover', 
      path: '/background-remover', 
      icon: Cpu,
      description: 'Isolate subjects completely inside browser.',
      colorClass: 'text-purple-650 bg-purple-50 border-purple-100/50'
    },
    { 
      name: 'OCR Text Extractor', 
      path: '/ocr-text-extractor', 
      icon: FileText,
      description: 'Extract multi-language texts from image scans.',
      colorClass: 'text-emerald-650 bg-emerald-50 border-emerald-100/50'
    },
    { 
      name: 'Instagram Grid Splitter', 
      path: '/instagram-grid-splitter', 
      icon: Maximize2,
      description: 'Slice photos into creative tile grids.',
      colorClass: 'text-orange-650 bg-orange-50 border-orange-100/50'
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
      colorClass: 'text-cyan-650 bg-cyan-50 border-cyan-100/50'
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Privacy Notice Bar */}
      <div className="w-full bg-gradient-to-r from-indigo-50/50 via-white to-indigo-50/50 border-b border-indigo-100 py-2.5 px-4 text-center text-xs md:text-sm font-semibold tracking-wide flex items-center justify-center gap-2">
        <Lock className="w-4 h-4 text-indigo-500 animate-pulse shrink-0" />
        <span className="text-slate-700">
          Privacy First: <span className="text-indigo-600 font-bold">Your files never leave your device.</span> Everything is processed locally.
        </span>
      </div>

      {/* Main Navigation */}
      <div className="sticky top-0 z-40 w-full px-4 sm:px-6 lg:px-8 pt-4 pointer-events-none">
        <header className="max-w-7xl mx-auto h-16 glass rounded-2xl border border-slate-200/60 shadow-md shadow-slate-200/5 px-4 sm:px-6 lg:px-8 flex items-center justify-between pointer-events-auto">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-black tracking-tight text-slate-900 group-hover:text-indigo-650 transition-colors">
              ImageCraft<span className="text-indigo-600">AI</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `text-[11px] font-bold uppercase tracking-wider hover:text-indigo-600 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-550'}`
              }
            >
              Home
            </NavLink>

            {/* Tools Dropdown Trigger */}
            <div className="relative group/dropdown">
              <button className="text-[11px] font-bold uppercase tracking-wider text-slate-550 hover:text-indigo-600 flex items-center gap-1 py-2 cursor-pointer">
                Tools
                <svg className="w-3.5 h-3.5 text-slate-400 transition-transform group-hover/dropdown:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              <div className="absolute left-1/2 -translate-x-1/2 mt-3.5 w-[520px] bg-white border border-slate-200/60 p-4.5 rounded-2xl shadow-2xl opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all duration-200 grid grid-cols-2 gap-2 z-50">
                {/* Visual Arrow */}
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-t border-l border-slate-200/60 rotate-45" />
                
                {tools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <Link
                      key={tool.path}
                      to={tool.path}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50/80 text-slate-700 hover:text-indigo-600 transition-all text-left"
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${tool.colorClass}`}>
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold leading-tight">{tool.name}</div>
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
              to="/privacy" 
              className={({ isActive }) => 
                `text-[11px] font-bold uppercase tracking-wider hover:text-indigo-600 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-550'}`
              }
            >
              Privacy
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
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/background-remover"
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-650 hover:from-indigo-500 hover:to-purple-550 text-[11px] font-bold text-white rounded-xl shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
            >
              <Cpu className="w-3.5 h-3.5" />
              Try AI Cutout
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

        </header>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-x-4 top-20 z-50 md:hidden premium-bento p-6 flex flex-col shadow-2xl border border-slate-200/80 animate-fade-in">
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          <nav className="flex flex-col gap-4 text-center text-xs font-bold uppercase tracking-wider mb-6">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-700 hover:text-indigo-600 py-2 border-b border-slate-100">
              Home
            </Link>
            <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-700 hover:text-indigo-600 py-2 border-b border-slate-100">
              About
            </Link>
            <Link to="/privacy" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-700 hover:text-indigo-600 py-2 border-b border-slate-100">
              Privacy
            </Link>
            <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-700 hover:text-indigo-600 py-2">
              Contact
            </Link>
          </nav>

          <div className="border-t border-slate-100 pt-6">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mb-4 text-center">
              Available Tools
            </span>
            <div className="grid grid-cols-2 gap-3">
              {tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link
                    key={tool.path}
                    to={tool.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex flex-col items-center gap-2 p-3 bg-slate-50 border border-slate-200/60 rounded-xl hover:border-indigo-500/30 text-[11px] font-bold text-slate-655 text-center shadow-xs"
                  >
                    <Icon className="w-5 h-5 text-indigo-505" />
                    {tool.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Header Ad Slot */}
      <AdPlacement type="header" className="px-4" />

      {/* Main Page Area */}
      <main className={`flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col ${showSidebar ? 'md:flex-row' : ''} gap-8`}>
        
        {/* Main Content Pane */}
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>

        {/* Sidebar Ad Placement (Desktop only) */}
        {showSidebar && (
          <aside className="hidden lg:block w-[300px] shrink-0">
            <div className="sticky top-24">
              <AdPlacement type="sidebar" />
            </div>
          </aside>
        )}
      </main>

      {/* Footer Ad Placement (Mobile only) */}
      <AdPlacement type="mobile" className="lg:hidden" />

      {/* Footer */}
      <footer className="w-full bg-white border-t border-slate-200 mt-auto py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
                <Cpu className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-slate-900">ImageCraft AI</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Privacy-first local image processing tools. Your files never leave your device. No cloud storage, no data harvesting.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-slate-800 mb-3.5">Image Tools</h4>
            <ul className="text-xs text-slate-500 flex flex-col gap-2">
              {tools.slice(0, 3).map(t => (
                <li key={t.path}><Link to={t.path} className="hover:text-indigo-600 transition">{t.name}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-slate-800 mb-3.5">Social Utilities</h4>
            <ul className="text-xs text-slate-500 flex flex-col gap-2">
              {tools.slice(3).map(t => (
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
              <li className="flex items-center gap-1 text-[11px] text-slate-400 mt-2">
                <Lock className="w-3.5 h-3.5 text-indigo-500" />
                100% Local Processing
              </li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-450">
          <p>© {new Date().getFullYear()} ImageCraft AI. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-600 transition cursor-pointer">Sitemap</span>
            <span className="hover:text-slate-600 transition cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
