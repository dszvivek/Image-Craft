import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import metadataEn from '../routes/metadata.json';
import metadataEs from '../locales/es.json';
import metadataPt from '../locales/pt.json';
import metadataHi from '../locales/hi.json';
import metadataFr from '../locales/fr.json';
import metadataDe from '../locales/de.json';
import { 
  Menu, 
  X, 
  Cpu, 
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
  ChevronRight,
  Home,
  CreditCard,
  PenTool,
  Sparkles,
  Sliders,
  Sun,
  Moon,
  Search,
  RotateCw,
  Square,
  Wand2,
  Gamepad2,
  Terminal,
  Zap,
  ArrowLeftRight,
  ShieldAlert
} from 'lucide-react';
import { AdPlacement } from '../components/AdPlacement';
import { CommandPalette } from '../components/CommandPalette';
import { ScrollToTop } from '../components/ScrollToTop';
import { LanguageSelector } from '../components/LanguageSelector';
import { 
  getLocaleFromPath, 
  getLocalizedToolPath, 
  getShortToolMeta,
  UI_TRANSLATIONS 
} from '../utils/i18n';

export const Layout = () => {
  const [theme, setTheme] = useState<string>(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileToolsExpanded, setIsMobileToolsExpanded] = useState(false);
  const [openMobileCategory, setOpenMobileCategory] = useState<string | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const locale = getLocaleFromPath(location.pathname);
  const t = UI_TRANSLATIONS[locale] || UI_TRANSLATIONS.en;

  const handleExploreAllTools = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const homePath = locale === 'en' ? '/' : `/${locale}`;
    const cleanPath = location.pathname.replace(/\/$/, '') || '/';
    const cleanHomePath = homePath.replace(/\/$/, '') || '/';
    const isHomePage = cleanPath === cleanHomePath;

    if (isHomePage) {
      const el = document.getElementById('tools-grid');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 400, behavior: 'smooth' });
      }
    } else {
      navigate(`${homePath}#tools-grid`);
    }
  };

  // Smooth scroll listener when navigating to #tools-grid from another page
  useEffect(() => {
    if (location.hash === '#tools-grid') {
      const scrollTimer = setTimeout(() => {
        const el = document.getElementById('tools-grid');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
      return () => clearTimeout(scrollTimer);
    }
  }, [location.pathname, location.hash]);

  // Global Cmd+K / Ctrl+K keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      setIsMobileToolsExpanded(false);
      setOpenMobileCategory(null);
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!isMobileToolsExpanded) {
      setOpenMobileCategory(null);
    }
  }, [isMobileToolsExpanded]);

  const toggleMobileCategory = (catId: string) => {
    setOpenMobileCategory(openMobileCategory === catId ? null : catId);
  };

  // Scroll to top on navigation (or smooth scroll to #tools-grid if targeted) and dynamically update SEO head tags
  useEffect(() => {
    if (!location.hash) {
      window.scrollTo(0, 0);
    } else if (location.hash === '#tools-grid') {
      const scrollTimer = setTimeout(() => {
        const el = document.getElementById('tools-grid');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      return () => clearTimeout(scrollTimer);
    }

    let cleanPath = location.pathname;
    if (cleanPath.endsWith('/')) {
      cleanPath = cleanPath.slice(0, -1);
    }
    if (cleanPath.startsWith('/')) {
      cleanPath = cleanPath.substring(1);
    }

    let meta: any = null;
    let isHome = false;

    if (cleanPath.startsWith('es')) {
      const subKey = cleanPath === 'es' ? '' : cleanPath.replace(/^es\//, '');
      meta = (metadataEs as any)[subKey];
      isHome = cleanPath === 'es';
    } else if (cleanPath.startsWith('pt')) {
      const subKey = cleanPath === 'pt' ? '' : cleanPath.replace(/^pt\//, '');
      meta = (metadataPt as any)[subKey];
      isHome = cleanPath === 'pt';
    } else if (cleanPath.startsWith('hi')) {
      const subKey = cleanPath === 'hi' ? '' : cleanPath.replace(/^hi\//, '');
      meta = (metadataHi as any)[subKey];
      isHome = cleanPath === 'hi';
    } else if (cleanPath.startsWith('fr')) {
      const subKey = cleanPath === 'fr' ? '' : cleanPath.replace(/^fr\//, '');
      meta = (metadataFr as any)[subKey];
      isHome = cleanPath === 'fr';
    } else if (cleanPath.startsWith('de')) {
      const subKey = cleanPath === 'de' ? '' : cleanPath.replace(/^de\//, '');
      meta = (metadataDe as any)[subKey];
      isHome = cleanPath === 'de';
    } else {
      meta = (metadataEn as any)[cleanPath];
      isHome = cleanPath === '';
    }
    if (meta) {
      const fullTitle = isHome ? meta.title : `${meta.title} | ImagePlumber`;
      document.title = fullTitle;
      
      // Update meta title
      let titleMeta = document.querySelector('meta[name="title"]');
      if (!titleMeta) {
        titleMeta = document.createElement('meta');
        titleMeta.setAttribute('name', 'title');
        document.head.appendChild(titleMeta);
      }
      titleMeta.setAttribute('content', fullTitle);
      
      // Update meta description
      const descMeta = document.querySelector('meta[name="description"]');
      if (descMeta) descMeta.setAttribute('content', meta.description);
      
      // Update meta keywords
      const keywordsMeta = document.querySelector('meta[name="keywords"]');
      if (keywordsMeta) keywordsMeta.setAttribute('content', meta.keywords);
      
      // Update canonical link
      const canonicalLink = document.querySelector('link[rel="canonical"]');
      if (canonicalLink) {
        let path = location.pathname;
        if (path !== '/' && path.endsWith('/')) {
          path = path.slice(0, -1);
        }
        canonicalLink.setAttribute('href', `https://imageplumber.com${path}`);
      }
      
      // Update Open Graph tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', fullTitle);
      
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', meta.description);
      
      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) ogUrl.setAttribute('content', `https://imageplumber.com${location.pathname}`);
      
      const imageAlt = isHome ? "ImagePlumber - Free Privacy-First Local Image Tools" : (meta.title.includes('ImagePlumber') ? meta.title : `${meta.title} - ImagePlumber`);
      const ogImageAlt = document.querySelector('meta[property="og:image:alt"]');
      if (ogImageAlt) {
        ogImageAlt.setAttribute('content', imageAlt);
      }
      
      // Update Twitter tags
      const twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (twitterTitle) twitterTitle.setAttribute('content', fullTitle);
      
      const twitterDesc = document.querySelector('meta[name="twitter:description"]');
      if (twitterDesc) twitterDesc.setAttribute('content', meta.description);
      
      const twitterImageAlt = document.querySelector('meta[name="twitter:image:alt"]');
      if (twitterImageAlt) {
        twitterImageAlt.setAttribute('content', imageAlt);
      }

      // Update twitter:url
      let twitterUrl = document.querySelector('meta[property="twitter:url"]') || document.querySelector('meta[name="twitter:url"]');
      if (!twitterUrl) {
        twitterUrl = document.createElement('meta');
        twitterUrl.setAttribute('property', 'twitter:url');
        document.head.appendChild(twitterUrl);
      }
      twitterUrl.setAttribute('content', `https://imageplumber.com${location.pathname}`);

      // Google Analytics (GA4) SPA Virtual Pageview
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'page_view', {
          page_title: fullTitle,
          page_location: `https://imageplumber.com${location.pathname}`,
          page_path: location.pathname,
        });
      }
    }
  }, [location.pathname]);

  const showSidebar = !['/', '/about', '/privacy', '/contact', '/faq', '/ambient'].includes(location.pathname);

  const categoriesConfig: Record<string, { name: string; description: string; colorClass: string; icon: any }> = {
    'photo-editing': {
      name: locale === 'es' ? 'Edición y Retoque' : locale === 'pt' ? 'Edição e Retoque' : locale === 'hi' ? 'फोटो स्टूडियो' : locale === 'fr' ? 'Édition & Retouche' : locale === 'de' ? 'Bildbearbeitung' : 'Photo & Image Studio',
      description: locale === 'es' ? 'Recorte, IA, filtros y color' : locale === 'pt' ? 'Recorte, IA, filtros e cor' : locale === 'hi' ? 'क्रॉप, AI, फिल्टर्स व कलर' : locale === 'fr' ? 'Recadrage, IA et filtres' : locale === 'de' ? 'Zuschneiden, KI & Filter' : 'AI cutout, crop, rotate & filters',
      colorClass: 'text-purple-650 bg-purple-50 border-purple-100/50 dark:text-purple-400 dark:bg-purple-950/30 dark:border-purple-900/30',
      icon: Wand2,
    },
    'privacy-security': {
      name: locale === 'es' ? 'Privacidad y Docs' : locale === 'pt' ? 'Privacidade e Docs' : locale === 'hi' ? 'प्राइवेसी व सिक्योरिटी' : locale === 'fr' ? 'Sécurité & Docs' : locale === 'de' ? 'Privatsphäre & Docs' : 'Privacy, Security & Docs',
      description: locale === 'es' ? 'Censurar, EXIF, firmas y OCR' : locale === 'pt' ? 'Censurar, EXIF, assinaturas e OCR' : locale === 'hi' ? 'ब्लर, EXIF, सिग्नेचर व OCR' : locale === 'fr' ? 'Censure, EXIF et signature' : locale === 'de' ? 'Zensur, EXIF & Signatur' : 'Redact, steganography & PDF tools',
      colorClass: 'text-rose-650 bg-rose-50 border-rose-100/50 dark:text-rose-400 dark:bg-rose-950/30 dark:border-rose-900/30',
      icon: ShieldAlert,
    },
    'creative-art': {
      name: locale === 'es' ? 'Arte y Efectos FX' : locale === 'pt' ? 'Arte e Efeitos FX' : locale === 'hi' ? 'क्रिएटिव आर्ट व FX' : locale === 'fr' ? 'Art & Effets FX' : locale === 'de' ? 'Kreativkunst & FX' : 'Creative Art & Pixel FX',
      description: locale === 'es' ? 'Pixel art, ASCII, glitch y memes' : locale === 'pt' ? 'Pixel art, ASCII, glitch e memes' : locale === 'hi' ? 'पिक्सेल आर्ट, ASCII, ग्लिच व मीम' : locale === 'fr' ? 'Pixel art, ASCII et glitch' : locale === 'de' ? 'Pixel-Art, ASCII & Glitch' : 'Pixel art, ASCII, glitch & SVG',
      colorClass: 'text-fuchsia-650 bg-fuchsia-50 border-fuchsia-100/50 dark:text-fuchsia-400 dark:bg-fuchsia-950/30 dark:border-fuchsia-900/30',
      icon: Sparkles,
    },
    'layout-formats': {
      name: locale === 'es' ? 'Diseño y Formatos' : locale === 'pt' ? 'Design e Formatos' : locale === 'hi' ? 'लेआउट व फॉर्मेट्स' : locale === 'fr' ? 'Mise en Page' : locale === 'de' ? 'Layout & Formate' : 'Layout, Social & Formats',
      description: locale === 'es' ? 'Panoramas, collages y compresión' : locale === 'pt' ? 'Panoramas, colagens e compressão' : locale === 'hi' ? 'पैनोरमा, कोलाज व कंप्रेसर' : locale === 'fr' ? 'Panoramas et compression' : locale === 'de' ? 'Panoramen & Komprimierung' : 'Panoramas, collages & converter',
      colorClass: 'text-amber-650 bg-amber-50 border-amber-100/50 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-900/30',
      icon: LayoutGrid,
    }
  };

  const tools = [
    // Column 1: Photo & Image Studio (7 tools)
    { 
      name: 'AI Background Remover', 
      path: '/background-remover', 
      icon: Cpu,
      category: 'photo-editing',
      colorClass: 'text-purple-650 bg-purple-50 border-purple-100/50 dark:text-purple-400 dark:bg-purple-950/30 dark:border-purple-900/30'
    },
    { 
      name: 'Interactive Image Cropper', 
      path: '/crop-image', 
      icon: Crop,
      category: 'photo-editing',
      colorClass: 'text-indigo-650 bg-indigo-50 border-indigo-100/50 dark:text-indigo-400 dark:bg-indigo-950/30 dark:border-indigo-900/30'
    },
    { 
      name: 'Image Rotator & Straightener', 
      path: '/rotate-image', 
      icon: RotateCw,
      category: 'photo-editing',
      colorClass: 'text-blue-600 bg-blue-50 border-blue-100/50 dark:text-blue-400 dark:bg-blue-950/30 dark:border-blue-900/30'
    },
    { 
      name: 'Image Adjuster & Color Tuner', 
      path: '/adjust-image', 
      icon: Sliders,
      category: 'photo-editing',
      colorClass: 'text-blue-600 bg-blue-50 border-blue-100/50 dark:text-blue-400 dark:bg-blue-950/30 dark:border-blue-900/30'
    },
    { 
      name: 'Photo Filter & Duotone Studio', 
      path: '/photo-filters', 
      icon: Wand2,
      category: 'photo-editing',
      colorClass: 'text-purple-650 bg-purple-50 border-purple-100/50 dark:text-purple-400 dark:bg-purple-950/30 dark:border-purple-900/30'
    },
    { 
      name: 'Color Inverter & B&W Converter', 
      path: '/invert-colors', 
      icon: Moon,
      category: 'photo-editing',
      colorClass: 'text-indigo-650 bg-indigo-50 border-indigo-100/50 dark:text-indigo-400 dark:bg-indigo-950/30 dark:border-indigo-900/30'
    },
    { 
      name: 'Smart Crop & Aspect Resizer', 
      path: '/aspect-resizer', 
      icon: Crop,
      category: 'photo-editing',
      colorClass: 'text-amber-600 bg-amber-50 border-amber-100/50 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-900/30'
    },

    // Column 2: Privacy, Security & Docs (7 tools)
    { 
      name: 'Photo Redactor & Censor Tool', 
      path: '/redact-image', 
      icon: ShieldAlert, 
      category: 'privacy-security',
      colorClass: 'text-red-650 bg-red-50 border-red-100/50 dark:text-red-400 dark:bg-red-950/30 dark:border-red-900/30'
    },
    { 
      name: 'Image Steganography & Secret Text', 
      path: '/image-steganography', 
      icon: Lock, 
      category: 'privacy-security',
      colorClass: 'text-emerald-650 bg-emerald-50 border-emerald-100/50 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-900/30'
    },
    { 
      name: 'EXIF Metadata Stripper', 
      path: '/metadata-stripper', 
      icon: Fingerprint,
      category: 'privacy-security',
      colorClass: 'text-red-600 bg-red-50 border-red-100/50 dark:text-red-400 dark:bg-red-950/30 dark:border-red-900/30'
    },
    { 
      name: 'Batch Watermark Overlay', 
      path: '/watermark-overlay', 
      icon: Copyright,
      category: 'privacy-security',
      colorClass: 'text-rose-600 bg-rose-50 border-rose-100/50 dark:text-rose-450 dark:bg-rose-950/30 dark:border-rose-900/30'
    },
    { 
      name: 'Electronic PDF Signer', 
      path: '/sign-pdf', 
      icon: PenTool,
      category: 'privacy-security',
      colorClass: 'text-indigo-650 bg-indigo-50 border-indigo-100/50 dark:text-indigo-400 dark:bg-indigo-950/30 dark:border-indigo-900/30'
    },
    { 
      name: 'Bank Statement Analyzer', 
      path: '/bank-statement-analyzer', 
      icon: CreditCard,
      category: 'privacy-security',
      colorClass: 'text-teal-650 bg-teal-50 border-teal-100/50 dark:text-teal-450 dark:bg-teal-950/30 dark:border-teal-900/30'
    },
    { 
      name: 'OCR Text Extractor', 
      path: '/ocr-text-extractor', 
      icon: FileText,
      category: 'privacy-security',
      colorClass: 'text-emerald-650 bg-emerald-50 border-emerald-100/50 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-900/30'
    },

    // Column 3: Creative Art & Pixel FX (7 tools)
    { 
      name: 'Pixel Art & 8-Bit Converter', 
      path: '/pixel-art-generator', 
      icon: Gamepad2,
      category: 'creative-art',
      colorClass: 'text-fuchsia-650 bg-fuchsia-50 border-fuchsia-100/50 dark:text-fuchsia-400 dark:bg-fuchsia-950/30 dark:border-fuchsia-900/30'
    },
    { 
      name: 'ASCII & Text Art Generator', 
      path: '/ascii-art-generator', 
      icon: Terminal,
      category: 'creative-art',
      colorClass: 'text-emerald-650 bg-emerald-50 border-emerald-100/50 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-900/30'
    },
    { 
      name: 'Glitch Art & CRT Distortion', 
      path: '/glitch-image-generator', 
      icon: Zap,
      category: 'creative-art',
      colorClass: 'text-violet-650 bg-violet-50 border-violet-100/50 dark:text-violet-400 dark:bg-violet-950/30 dark:border-violet-900/30'
    },
    { 
      name: 'SVG Vectorizer', 
      path: '/svg-vectorizer', 
      icon: Feather,
      category: 'creative-art',
      colorClass: 'text-teal-600 bg-teal-50 border-teal-100/50 dark:text-teal-400 dark:bg-teal-950/30 dark:border-teal-900/30'
    },
    { 
      name: 'Instant Meme Generator', 
      path: '/meme-generator', 
      icon: Smile,
      category: 'creative-art',
      colorClass: 'text-green-600 bg-green-50 border-green-100/50 dark:text-green-400 dark:bg-green-950/30 dark:border-green-900/30'
    },
    { 
      name: 'AI Shape Art Generator', 
      path: '/shape-art-generator', 
      icon: Sparkles,
      category: 'creative-art',
      colorClass: 'text-indigo-605 bg-indigo-50 border-indigo-100/50 dark:text-indigo-400 dark:bg-indigo-950/30 dark:border-indigo-900/30'
    },
    { 
      name: 'Ambient Generative Visuals', 
      path: '/ambient', 
      icon: Sparkles,
      category: 'creative-art',
      colorClass: 'text-indigo-600 bg-indigo-50 border-indigo-100/50 dark:text-indigo-400 dark:bg-indigo-950/30 dark:border-indigo-900/30'
    },

    // Column 4: Layout, Social & Formats (7 tools)
    { 
      name: 'Instagram Panorama & Carousel Splitter', 
      path: '/instagram-panorama-splitter', 
      icon: Maximize2,
      category: 'layout-formats',
      colorClass: 'text-pink-650 bg-pink-50 border-pink-100/50 dark:text-pink-400 dark:bg-pink-950/30 dark:border-pink-900/30'
    },
    { 
      name: 'Side-by-Side & Before/After Combiner', 
      path: '/side-by-side-image', 
      icon: ArrowLeftRight,
      category: 'layout-formats',
      colorClass: 'text-blue-650 bg-blue-50 border-blue-100/50 dark:text-blue-400 dark:bg-blue-950/30 dark:border-blue-900/30'
    },
    { 
      name: 'Photo Collage Maker', 
      path: '/collage-maker', 
      icon: LayoutGrid,
      category: 'layout-formats',
      colorClass: 'text-pink-655 bg-pink-50 border-pink-100/50 dark:text-pink-400 dark:bg-pink-950/30 dark:border-pink-900/30'
    },
    { 
      name: 'Instagram Grid Splitter', 
      path: '/instagram-grid-splitter', 
      icon: Maximize2,
      category: 'layout-formats',
      colorClass: 'text-orange-600 bg-orange-50 border-orange-100/50 dark:text-orange-400 dark:bg-orange-950/30 dark:border-orange-900/30'
    },
    { 
      name: 'Canvas Border Expander', 
      path: '/add-border-to-image', 
      icon: Square,
      category: 'layout-formats',
      colorClass: 'text-amber-600 bg-amber-50 border-amber-100/50 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-900/30'
    },
    { 
      name: 'Image Compressor', 
      path: '/image-compressor', 
      icon: ImageIcon,
      category: 'layout-formats',
      colorClass: 'text-indigo-650 bg-indigo-50 border-indigo-100/50 dark:text-indigo-400 dark:bg-indigo-950/30 dark:border-indigo-900/30'
    },
    { 
      name: 'Batch Image to PDF & Format Converter', 
      path: '/batch-converter', 
      icon: Files,
      category: 'layout-formats',
      colorClass: 'text-indigo-650 bg-indigo-50 border-indigo-100/50 dark:text-indigo-400 dark:bg-indigo-950/30 dark:border-indigo-900/30'
    },
  ];

  // Build breadcrumb from current route
  const currentTool = tools.find(t => t.path === location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-slate-800 dark:text-slate-200 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-950 selection:text-indigo-900 dark:selection:text-indigo-100">
      
      {/* Main Navigation */}
      <div className="sticky top-0 z-40 w-full px-4 sm:px-6 lg:px-8 pt-2 sm:pt-4 pointer-events-none">
        <header className="max-w-7xl mx-auto h-16 glass rounded-2xl border border-slate-200/60 dark:border-slate-850 shadow-md shadow-slate-200/5 dark:shadow-none px-4 sm:px-6 lg:px-8 flex items-center justify-between pointer-events-auto relative">
          
          {/* Logo */}
          <Link to={locale === 'en' ? '/' : `/${locale}`} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 20l7-10 7 10" />
                <path d="M9 20l4-6 4 6" />
                <circle cx="12" cy="16" r="2" fill="currentColor" />
              </svg>
            </div>
            <span className="text-lg font-black tracking-tight text-slate-900 dark:text-slate-100 group-hover:text-indigo-650 transition-colors">
              Image<span className="text-indigo-600">Plumber</span>
            </span>
          </Link>
 
          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink 
              to={locale === 'en' ? '/' : `/${locale}`} 
              end
              className={({ isActive }) => 
                `text-[11px] font-bold uppercase tracking-wider hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors ${isActive ? 'text-indigo-650 dark:text-indigo-400' : 'text-slate-550 dark:text-slate-400'}`
              }
            >
              {locale === 'es' ? 'Inicio' : locale === 'pt' ? 'Início' : locale === 'hi' ? 'होम' : locale === 'fr' ? 'Accueil' : locale === 'de' ? 'Start' : 'Home'}
            </NavLink>
 
            {/* Tools Dropdown Trigger */}
            <div className="group/dropdown">
              <button className="text-[11px] font-bold uppercase tracking-wider text-slate-550 dark:text-slate-400 hover:text-indigo-650 dark:hover:text-indigo-400 flex items-center gap-1 py-2 cursor-pointer transition-colors">
                {t.nav.tools}
                <svg className="w-3.5 h-3.5 text-slate-400 dark:text-slate-555 transition-transform group-hover/dropdown:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
 
              {/* Dropdown Menu - Top Tier Balanced Mega Menu (Centered to Header) */}
              <div className="absolute left-0 right-0 mx-auto top-full mt-2 w-[990px] max-w-[calc(100vw-48px)] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-2xl shadow-slate-900/15 dark:shadow-none opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all duration-200 z-50">
                {/* Visual Arrow */}
                <div className="absolute -top-1.5 left-[242px] -translate-x-1/2 w-3.5 h-3.5 bg-white dark:bg-slate-900 border-t border-l border-slate-200/80 dark:border-slate-800 rotate-45" />
                
                {/* 4 Balanced Columns */}
                <div className="grid grid-cols-4 gap-5">
                  {Object.entries(categoriesConfig).map(([catId, cat]) => {
                    const CatIcon = cat.icon;
                    const catTools = tools.filter(t => t.category === catId);

                    return (
                      <div key={catId} className="flex flex-col gap-3">
                        {/* Category Header */}
                        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800/80">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`w-7 h-7 rounded-xl flex items-center justify-center border shadow-xs shrink-0 ${cat.colorClass}`}>
                              <CatIcon className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] font-extrabold text-slate-900 dark:text-slate-100 tracking-tight truncate">{cat.name}</p>
                              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold truncate mt-0.5">{cat.description}</p>
                            </div>
                          </div>
                          <span className="text-[8.5px] font-mono font-bold text-slate-400 dark:text-slate-500 bg-slate-100/80 dark:bg-slate-800/80 px-1.5 py-0.5 rounded-md shrink-0">
                            7
                          </span>
                        </div>
                        
                        {/* Category Tools List */}
                        <div className="flex flex-col gap-1">
                          {catTools.map((tool) => {
                            const Icon = tool.icon;
                            const shortMeta = getShortToolMeta(tool.path, locale);
                            const toolUrl = getLocalizedToolPath(tool.path, locale);

                            return (
                              <Link
                                key={tool.path}
                                to={toolUrl}
                                className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50/90 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-all text-left group/item cursor-pointer"
                              >
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 ${tool.colorClass} group-hover/item:scale-110 transition-transform`}>
                                  <Icon className="w-3.5 h-3.5" />
                                </div>
                                <div className="space-y-0.5 min-w-0 flex-1">
                                  <div className="text-[11.5px] font-bold text-slate-800 dark:text-slate-200 leading-tight group-hover/item:text-indigo-650 dark:group-hover/item:text-indigo-400 transition-colors truncate">
                                    {shortMeta.name}
                                  </div>
                                  <div className="text-[9.5px] text-slate-400 dark:text-slate-500 leading-tight font-medium line-clamp-1">
                                    {shortMeta.desc}
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Mega Menu Footer Banner */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs px-1">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px] font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>100% Client-Side Local Memory • Zero Server Uploads • Offline-Ready</span>
                  </div>
                  <button
                    onClick={handleExploreAllTools}
                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>{locale === 'es' ? 'Explorar las 28 herramientas' : locale === 'pt' ? 'Explorar todas as 28 ferramentas' : locale === 'hi' ? 'सभी 28 टूल्स देखें' : locale === 'fr' ? 'Explorer les 28 outils' : locale === 'de' ? 'Alle 28 Tools entdecken' : 'Explore All 28 Tools'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
 
            <NavLink 
              to="/about" 
              className={({ isActive }) => 
                `text-[11px] font-bold uppercase tracking-wider hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors ${isActive ? 'text-indigo-650 dark:text-indigo-400' : 'text-slate-550 dark:text-slate-400'}`
              }
            >
              {locale === 'es' ? 'Acerca de' : locale === 'pt' ? 'Sobre' : locale === 'hi' ? 'जानकारी' : locale === 'fr' ? 'À Propos' : locale === 'de' ? 'Über Uns' : 'About'}
            </NavLink>
            <NavLink 
              to="/faq" 
              className={({ isActive }) => 
                `text-[11px] font-bold uppercase tracking-wider hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors ${isActive ? 'text-indigo-650 dark:text-indigo-400' : 'text-slate-550 dark:text-slate-400'}`
              }
            >
              FAQ
            </NavLink>
            <NavLink 
              to="/contact" 
              className={({ isActive }) => 
                `text-[11px] font-bold uppercase tracking-wider hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors ${isActive ? 'text-indigo-650 dark:text-indigo-400' : 'text-slate-550 dark:text-slate-400'}`
              }
            >
              Contact
            </NavLink>
          </nav>
 
          {/* Desktop Right CTA */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Selector Dropdown */}
            <LanguageSelector variant="header" />

            {/* Quick Search Command Palette Trigger */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-indigo-300 dark:hover:border-indigo-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs group"
              title="Search tools (⌘K / Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              <span className="text-[11px]">{locale === 'es' ? 'Buscar' : locale === 'pt' ? 'Pesquisar' : locale === 'hi' ? 'खोजें' : locale === 'fr' ? 'Rechercher' : locale === 'de' ? 'Suchen' : 'Search'}</span>
              <kbd className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 font-bold ml-0.5">⌘K</kbd>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-655 dark:hover:text-indigo-400 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center rounded-xl bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200/40 dark:border-slate-700/40"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" />}
            </button>

            <a
              href="https://github.com/dszvivek/Image-Craft"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-650 dark:hover:text-indigo-400 hover:scale-105 transition-all duration-200 cursor-pointer flex items-center justify-center"
              title="View on GitHub"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
            </a>
            <Link
              to="/background-remover"
              className="px-5 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-[11px] font-bold text-white rounded-full shadow-md shadow-zinc-950/10 hover:shadow-zinc-950/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
            >
              <Cpu className="w-3.5 h-3.5" />
              Try AI Cutout
            </Link>
          </div>

          {/* Mobile Right Action Area */}
          <div className="flex items-center gap-1.5 md:hidden">
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Search tools"
              title="Search tools"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </header>
      </div>

      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 md:hidden bg-black/20 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-x-4 top-20 z-50 md:hidden premium-bento rounded-2xl p-5 flex flex-col shadow-2xl shadow-slate-300/20 dark:shadow-none border border-slate-200/80 dark:border-slate-800 animate-fade-in max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin">
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
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
                className="text-sm font-bold text-slate-700 dark:text-slate-350 hover:text-indigo-650 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 px-3 py-2.5 rounded-xl transition-all"
              >
                {label}
              </Link>
            ))}

            {/* Mobile Tools Accordion Trigger */}
            <button
              onClick={() => setIsMobileToolsExpanded(!isMobileToolsExpanded)}
              className="flex items-center justify-between text-sm font-bold text-slate-700 dark:text-slate-355 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 px-3 py-2.5 rounded-xl transition-all cursor-pointer text-left"
            >
              <span>Tools</span>
              <svg 
                className={`w-4 h-4 text-slate-400 dark:text-slate-555 transition-transform duration-200 ${isMobileToolsExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Mobile Tools Collapsible Grid - Premium Accordions */}
            {isMobileToolsExpanded && (
              <div className="border-t border-slate-100/80 dark:border-slate-800 pt-3.5 pb-2.5 px-1 animate-fade-in flex flex-col gap-2">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold block mb-1">
                  Browse by Category
                </span>
                {Object.entries(categoriesConfig).map(([catId, cat]) => {
                  const CatIcon = cat.icon;
                  const catTools = tools.filter(t => t.category === catId);
                  const isCatOpen = openMobileCategory === catId;
                  return (
                    <div key={catId} className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/40">
                      <button
                        onClick={() => toggleMobileCategory(catId)}
                        className="w-full flex items-center justify-between p-3.5 text-left text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center border ${cat.colorClass}`}>
                            <CatIcon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200">{cat.name}</span>
                        </div>
                        <svg 
                          className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${isCatOpen ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {isCatOpen && (
                        <div className="p-2 bg-white dark:bg-slate-950 border-t border-slate-100/80 dark:border-slate-800 grid grid-cols-1 gap-1.5 animate-fade-in">
                          {catTools.map((tool) => {
                             const Icon = tool.icon;
                             const shortMeta = getShortToolMeta(tool.path, locale);
                             const toolUrl = getLocalizedToolPath(tool.path, locale);

                             return (
                               <Link
                                 key={tool.path}
                                 to={toolUrl}
                                 onClick={() => {
                                   setIsMobileMenuOpen(false);
                                   setOpenMobileCategory(null);
                                 }}
                                 className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all ${tool.colorClass} bg-opacity-30 hover:bg-opacity-50`}
                               >
                                 <Icon className="w-4 h-4 shrink-0" />
                                 <div className="flex flex-col min-w-0 flex-1">
                                   <span className="text-[11px] font-extrabold text-slate-850 dark:text-slate-200">{shortMeta.name}</span>
                                   <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium leading-normal line-clamp-1">{shortMeta.desc}</span>
                                 </div>
                               </Link>
                             );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
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
                className="text-sm font-bold text-slate-700 dark:text-slate-350 hover:text-indigo-650 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 px-3 py-2.5 rounded-xl transition-all"
              >
                {label}
              </Link>
            ))}

            {/* Mobile Language Selector */}
            <div className="pt-2 pb-1 border-t border-slate-100 dark:border-slate-800">
              <LanguageSelector variant="mobile" />
            </div>

            {/* Mobile Dark Mode Toggle */}
            <button
              onClick={() => {
                toggleTheme();
                setIsMobileMenuOpen(false);
              }}
              className="text-sm font-bold text-slate-700 dark:text-slate-350 hover:text-indigo-650 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 px-3 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer text-left"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-4 h-4 text-slate-400" />
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Light Mode</span>
                </>
              )}
            </button>

            <a 
              href="https://github.com/dszvivek/Image-Craft" 
              target="_blank" 
              rel="noopener noreferrer" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-bold text-slate-700 dark:text-slate-350 hover:text-indigo-650 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 px-3 py-2.5 rounded-xl transition-all flex items-center gap-2"
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
            <nav className="flex items-center gap-1.5 mb-5 text-[11px] font-semibold text-slate-450 dark:text-slate-400" aria-label="Breadcrumb">
              <Link to="/" className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700" />
              <span className="text-slate-700 dark:text-slate-300">{currentTool.name}</span>
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
      <footer className="w-full bg-slate-50 dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 mt-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-10 text-left">
          
          {/* Brand & Privacy Statement */}
          <div className="flex flex-col gap-3 lg:col-span-1">
            <Link to={locale === 'en' ? '/' : `/${locale}`} className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <svg className="w-4.5 h-4.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 20l7-10 7 10" />
                  <path d="M9 20l4-6 4 6" />
                  <circle cx="12" cy="16" r="2" fill="currentColor" />
                </svg>
              </div>
              <span className="font-bold text-lg text-slate-900 dark:text-slate-100">ImagePlumber</span>
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Privacy-first local image processing tools. Your files never leave your device. No cloud storage, no data harvesting.
            </p>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 rounded-full px-2.5 py-1 w-fit">
              <Lock className="w-3 h-3" />
              100% Local RAM Processing
            </div>
          </div>

          {/* Col 2: Photo Studio */}
          <div>
            <p className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              Photo Studio
            </p>
            <ul className="text-xs text-slate-550 dark:text-slate-400 flex flex-col gap-2 font-medium">
              {tools.filter(t => t.category === 'photo-editing').map(t => {
                const shortMeta = getShortToolMeta(t.path, locale);
                const toolUrl = getLocalizedToolPath(t.path, locale);
                return (
                  <li key={t.path}>
                    <Link to={toolUrl} className="hover:text-indigo-650 dark:hover:text-indigo-400 hover:translate-x-0.5 transition-all inline-block">
                      {shortMeta.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Col 3: Privacy & Security */}
          <div>
            <p className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Privacy & Security
            </p>
            <ul className="text-xs text-slate-550 dark:text-slate-400 flex flex-col gap-2 font-medium">
              {tools.filter(t => t.category === 'privacy-security').map(t => {
                const shortMeta = getShortToolMeta(t.path, locale);
                const toolUrl = getLocalizedToolPath(t.path, locale);
                return (
                  <li key={t.path}>
                    <Link to={toolUrl} className="hover:text-indigo-650 dark:hover:text-indigo-400 hover:translate-x-0.5 transition-all inline-block">
                      {shortMeta.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Col 4: Creative & Layout */}
          <div>
            <p className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-fuchsia-500" />
              Creative & Layout
            </p>
            <ul className="text-xs text-slate-550 dark:text-slate-400 flex flex-col gap-2 font-medium">
              {tools.filter(t => ['creative-art', 'layout-formats'].includes(t.category)).slice(0, 7).map(t => {
                const shortMeta = getShortToolMeta(t.path, locale);
                const toolUrl = getLocalizedToolPath(t.path, locale);
                return (
                  <li key={t.path}>
                    <Link to={toolUrl} className="hover:text-indigo-650 dark:hover:text-indigo-400 hover:translate-x-0.5 transition-all inline-block">
                      {shortMeta.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Col 5: Company & Legal */}
          <div>
            <p className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              Privacy & Legal
            </p>
            <ul className="text-xs text-slate-550 dark:text-slate-400 flex flex-col gap-2 font-medium">
              <li><Link to="/about" className="hover:text-indigo-650 dark:hover:text-indigo-400 hover:translate-x-0.5 transition-all inline-block">About Us</Link></li>
              <li><Link to="/faq" className="hover:text-indigo-650 dark:hover:text-indigo-400 hover:translate-x-0.5 transition-all inline-block">FAQ Helpdesk</Link></li>
              <li><Link to="/privacy" className="hover:text-indigo-650 dark:hover:text-indigo-400 hover:translate-x-0.5 transition-all inline-block">Privacy Policy</Link></li>
              <li><Link to="/contact" className="hover:text-indigo-650 dark:hover:text-indigo-400 hover:translate-x-0.5 transition-all inline-block">Contact Support</Link></li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-200/80 dark:border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-450">
          <p>© {new Date().getFullYear()} ImagePlumber. All rights reserved.</p>
          <div className="flex items-center gap-4 flex-wrap">
            <LanguageSelector variant="header" />
            <a 
              href="https://github.com/dszvivek/Image-Craft" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-1 hover:text-indigo-650 dark:hover:text-indigo-400 transition font-medium"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
              GitHub
            </a>
            <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-650 dark:hover:text-indigo-400 transition">Sitemap</a>
            <Link to="/privacy" className="hover:text-indigo-650 dark:hover:text-indigo-400 transition">Terms of Service</Link>
          </div>
        </div>
      </footer>

      {/* Global Quick Search & Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        toggleTheme={toggleTheme}
        currentTheme={theme}
      />

      {/* Floating Back to Top Button */}
      <ScrollToTop />

    </div>
  );
};
