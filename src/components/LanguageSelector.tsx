import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Globe, ChevronDown, Check } from 'lucide-react';

interface LanguageOption {
  code: string;
  name: string;
  flag: string;
  pathPrefix: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', flag: '🇺🇸', pathPrefix: '' },
  { code: 'es', name: 'Español', flag: '🇪🇸', pathPrefix: '/es' },
  { code: 'pt', name: 'Português', flag: '🇧🇷', pathPrefix: '/pt' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳', pathPrefix: '/hi' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', pathPrefix: '/fr' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', pathPrefix: '/de' },
];

// Mapping between English tool routes and localized tool routes
const TOOL_EQUIVALENTS: Record<string, Record<string, string>> = {
  'image-compressor': {
    es: 'comprimir-imagen',
    pt: 'comprimir-imagem',
    hi: 'photo-compress-kare',
    fr: 'compresser-image',
    de: 'bild-komprimieren',
  },
  'background-remover': {
    es: 'quitar-fondo',
    pt: 'remover-fundo',
    hi: 'background-hataye',
    fr: 'supprimer-arriere-plan',
    de: 'hintergrund-entfernen',
  },
  'batch-converter': {
    es: 'convertidor-por-lotes',
    pt: 'conversor-em-lote',
    hi: 'batch-converter',
    fr: 'convertisseur-par-lots',
    de: 'stapel-konverter',
  },
  'sign-pdf': {
    es: 'firmar-pdf',
    pt: 'assinar-pdf',
    hi: 'pdf-sign-kare',
    fr: 'signer-pdf',
    de: 'pdf-unterschreiben',
  },
  'png-to-jpg': {
    es: 'png-a-jpg',
    pt: 'png-para-jpg',
    hi: 'png-se-jpg',
    fr: 'png-en-jpg',
    de: 'png-in-jpg',
  },
  'jpg-to-png': {
    es: 'jpg-a-png',
    pt: 'jpg-para-png',
    hi: 'jpg-se-png',
    fr: 'jpg-en-png',
    de: 'jpg-in-png',
  },
  'crop-image': {
    es: 'recortar-imagen',
    pt: 'cortar-imagem',
    hi: 'photo-crop-kare',
    fr: 'recadrer-image',
    de: 'bild-zuschneiden',
  },
  'rotate-image': {
    es: 'rotar-imagen',
    pt: 'girar-imagem',
    hi: 'photo-rotate-kare',
    fr: 'pivoter-image',
    de: 'bild-drehen',
  },
  'add-border-to-image': {
    es: 'agregar-borde-imagen',
    pt: 'adicionar-borda-imagem',
    hi: 'border-lagaye',
    fr: 'ajouter-bordure-image',
    de: 'rahmen-hinzufuegen',
  },
  'photo-filters': {
    es: 'filtros-fotos',
    pt: 'filtros-fotos',
    hi: 'photo-filters',
    fr: 'filtres-photos',
    de: 'fotofilter',
  },
  'invert-colors': {
    es: 'invertir-colores',
    pt: 'inverter-cores',
    hi: 'color-invert-kare',
    fr: 'inverser-couleurs',
    de: 'farben-invertieren',
  },
  'adjust-image': {
    es: 'ajustar-imagen',
    pt: 'ajustar-imagem',
    hi: 'photo-brightness-contrast',
    fr: 'ajuster-image',
    de: 'bild-anpassen',
  },
  'meme-generator': {
    es: 'generador-memes',
    pt: 'gerador-memes',
    hi: 'meme-generator',
    fr: 'generateur-memes',
    de: 'meme-generator',
  },
  'watermark-overlay': {
    es: 'marca-de-agua',
    pt: 'marca-dagua',
    hi: 'watermark-lagaye',
    fr: 'filigrane-image',
    de: 'wasserzeichen-hinzufuegen',
  },
  'metadata-stripper': {
    es: 'eliminar-metadatos',
    pt: 'remover-metadados',
    hi: 'exif-metadata-hataye',
    fr: 'supprimer-metadonnees',
    de: 'metadaten-entfernen',
  },
  'pixel-art-generator': {
    es: 'arte-pixel',
    pt: 'arte-pixel',
    hi: 'pixel-art-generator',
    fr: 'pixel-art',
    de: 'pixel-art-generator',
  },
  'ascii-art-generator': {
    es: 'arte-ascii',
    pt: 'arte-ascii',
    hi: 'ascii-art-generator',
    fr: 'art-ascii',
    de: 'ascii-art-generator',
  },
  'glitch-image-generator': {
    es: 'efecto-glitch',
    pt: 'efeito-glitch',
    hi: 'glitch-art-studio',
    fr: 'effet-glitch',
    de: 'glitch-effekt',
  },
  'side-by-side-image': {
    es: 'comparar-fotos',
    pt: 'comparar-fotos',
    hi: 'photo-compare-kare',
    fr: 'comparer-photos',
    de: 'bilder-vergleichen',
  },
  'instagram-panorama-splitter': {
    es: 'panoramica-instagram',
    pt: 'panoramica-instagram',
    hi: 'instagram-panorama-splitter',
    fr: 'panorama-instagram',
    de: 'instagram-panorama-teiler',
  },
  'collage-maker': {
    es: 'cuadricula-fotos',
    pt: 'grade-fotos',
    hi: 'photo-grid-maker',
    fr: 'grille-photos',
    de: 'fotogitter-erstellen',
  },
  'redact-image': {
    es: 'censurar-foto',
    pt: 'censurar-foto',
    hi: 'photo-censor-kare',
    fr: 'censurer-photo',
    de: 'bild-zensieren',
  },
  'image-steganography': {
    es: 'esteganografia-imagenes',
    pt: 'esteganografia-imagem',
    hi: 'image-steganography',
    fr: 'steganographie-image',
    de: 'bild-steganographie',
  },
  'bank-statement-analyzer': {
    es: 'analizador-extractos-bancarios',
    pt: 'analisador-extrato-bancario',
    hi: 'bank-statement-analyzer',
    fr: 'analyseur-releve-bancaire',
    de: 'kontoauszug-analysieren',
  },
  'ocr-text-extractor': {
    es: 'extractor-texto-ocr',
    pt: 'extrator-texto-ocr',
    hi: 'ocr-text-extractor',
    fr: 'extracteur-texte-ocr',
    de: 'ocr-texterkennung',
  },
  'svg-vectorizer': {
    es: 'vectorizador-svg',
    pt: 'vetorizador-svg',
    hi: 'svg-vectorizer',
    fr: 'vectoriseur-svg',
    de: 'svg-vektorisierer',
  },
  'shape-art-generator': {
    es: 'arte-formas',
    pt: 'arte-formas',
    hi: 'shape-art-generator',
    fr: 'art-formes',
    de: 'formen-kunst',
  },
  'ambient': {
    es: 'visuales-ambientales',
    pt: 'visuais-ambientais',
    hi: 'ambient-visuals',
    fr: 'visuels-ambiance',
    de: 'ambient-visuals',
  },
};

// Aliases and secondary landing pages mapped to primary tool keys
const TOOL_ALIASES: Record<string, string> = {
  'compress-png': 'image-compressor',
  'compress-jpeg': 'image-compressor',
  'compress-webp': 'image-compressor',
  'compress-image-to-100kb': 'image-compressor',
  'compress-image-to-50kb': 'image-compressor',
  'compress-image-to-20kb': 'image-compressor',
  'remove-white-background': 'background-remover',
  'transparent-background-maker': 'background-remover',
  'webp-to-jpg': 'batch-converter',
  'webp-to-png': 'batch-converter',
  'heic-to-jpg': 'batch-converter',
  'svg-to-png': 'batch-converter',
  'png-to-svg': 'svg-vectorizer',
  'exif-viewer': 'metadata-stripper',
  'remove-exif-data': 'metadata-stripper',
  'batch-watermark': 'watermark-overlay',
  'add-logo-to-photo': 'watermark-overlay',
  'aspect-resizer': 'crop-image',
  'add-text-to-image': 'meme-generator',
  'caption-generator': 'meme-generator',
  'photo-mosaic-generator': 'collage-maker',
  'bank-statement-to-excel': 'bank-statement-analyzer',
  'sign-pdf-online': 'sign-pdf',
  'passport-photo-cropper': 'crop-image',
  'vintage-photo-filter': 'photo-filters',
  'duotone-generator': 'photo-filters',
  'black-and-white-converter': 'invert-colors',
  'brightness-contrast': 'adjust-image',
  '8-bit-photo-converter': 'pixel-art-generator',
  'pixelate-image': 'pixel-art-generator',
  'image-to-text-art': 'ascii-art-generator',
  'ansi-art': 'ascii-art-generator',
  'crt-tv-filter': 'glitch-image-generator',
  'vhs-effect': 'glitch-image-generator',
  'before-after-image': 'side-by-side-image',
  'compare-images': 'side-by-side-image',
  'swipe-carousel-maker': 'instagram-panorama-splitter',
  'seamless-carousel': 'instagram-panorama-splitter',
  'photo-grid-maker': 'collage-maker',
  'photo-joiner': 'collage-maker',
  'instagram-grid-splitter': 'collage-maker',
  'blur-faces': 'redact-image',
  'pixelate-face': 'redact-image',
  'censor-photo': 'redact-image',
  'hide-text-in-image': 'image-steganography',
  'decode-hidden-message': 'image-steganography',
};

// Reverse map to find standard English route from localized path
const LOCAL_TO_EN_MAP: Record<string, string> = {
  'es/comprimir-imagen': 'image-compressor',
  'es/quitar-fondo': 'background-remover',
  'es/convertidor-por-lotes': 'batch-converter',
  'es/firmar-pdf': 'sign-pdf',
  'es/png-a-jpg': 'png-to-jpg',
  'es/jpg-a-png': 'jpg-to-png',
  'es/recortar-imagen': 'crop-image',
  'es/rotar-imagen': 'rotate-image',
  'es/agregar-borde-imagen': 'add-border-to-image',
  'es/filtros-fotos': 'photo-filters',
  'es/invertir-colores': 'invert-colors',
  'es/ajustar-imagen': 'adjust-image',
  'es/generador-memes': 'meme-generator',
  'es/marca-de-agua': 'watermark-overlay',
  'es/eliminar-metadatos': 'metadata-stripper',
  'es/arte-pixel': 'pixel-art-generator',
  'es/arte-ascii': 'ascii-art-generator',
  'es/efecto-glitch': 'glitch-image-generator',
  'es/comparar-fotos': 'side-by-side-image',
  'es/panoramica-instagram': 'instagram-panorama-splitter',
  'es/cuadricula-fotos': 'collage-maker',
  'es/censurar-foto': 'redact-image',
  'es/esteganografia-imagenes': 'image-steganography',
  'es/analizador-extractos-bancarios': 'bank-statement-analyzer',
  'es/extractor-texto-ocr': 'ocr-text-extractor',
  'es/vectorizador-svg': 'svg-vectorizer',
  'es/arte-formas': 'shape-art-generator',
  'es/visuales-ambientales': 'ambient',
  'pt/comprimir-imagem': 'image-compressor',
  'pt/remover-fundo': 'background-remover',
  'pt/conversor-em-lote': 'batch-converter',
  'pt/assinar-pdf': 'sign-pdf',
  'pt/png-para-jpg': 'png-to-jpg',
  'pt/jpg-para-png': 'jpg-to-png',
  'pt/cortar-imagem': 'crop-image',
  'pt/girar-imagem': 'rotate-image',
  'pt/adicionar-borda-imagem': 'add-border-to-image',
  'pt/filtros-fotos': 'photo-filters',
  'pt/inverter-cores': 'invert-colors',
  'pt/ajustar-imagem': 'adjust-image',
  'pt/gerador-memes': 'meme-generator',
  'pt/marca-dagua': 'watermark-overlay',
  'pt/remover-metadados': 'metadata-stripper',
  'pt/arte-pixel': 'pixel-art-generator',
  'pt/arte-ascii': 'ascii-art-generator',
  'pt/efeito-glitch': 'glitch-image-generator',
  'pt/comparar-fotos': 'side-by-side-image',
  'pt/panoramica-instagram': 'instagram-panorama-splitter',
  'pt/grade-fotos': 'collage-maker',
  'pt/censurar-foto': 'redact-image',
  'pt/esteganografia-imagem': 'image-steganography',
  'pt/analisador-extrato-bancario': 'bank-statement-analyzer',
  'pt/extrator-texto-ocr': 'ocr-text-extractor',
  'pt/vetorizador-svg': 'svg-vectorizer',
  'pt/arte-formas': 'shape-art-generator',
  'pt/visuais-ambientais': 'ambient',
  'hi/photo-compress-kare': 'image-compressor',
  'hi/background-hataye': 'background-remover',
  'hi/batch-converter': 'batch-converter',
  'hi/pdf-sign-kare': 'sign-pdf',
  'hi/png-se-jpg': 'png-to-jpg',
  'hi/jpg-se-png': 'jpg-to-png',
  'hi/photo-crop-kare': 'crop-image',
  'hi/photo-rotate-kare': 'rotate-image',
  'hi/border-lagaye': 'add-border-to-image',
  'hi/photo-filters': 'photo-filters',
  'hi/color-invert-kare': 'invert-colors',
  'hi/photo-brightness-contrast': 'adjust-image',
  'hi/meme-generator': 'meme-generator',
  'hi/watermark-lagaye': 'watermark-overlay',
  'hi/exif-metadata-hataye': 'metadata-stripper',
  'hi/pixel-art-generator': 'pixel-art-generator',
  'hi/ascii-art-generator': 'ascii-art-generator',
  'hi/glitch-art-studio': 'glitch-image-generator',
  'hi/photo-compare-kare': 'side-by-side-image',
  'hi/instagram-panorama-splitter': 'instagram-panorama-splitter',
  'hi/photo-grid-maker': 'collage-maker',
  'hi/photo-censor-kare': 'redact-image',
  'hi/image-steganography': 'image-steganography',
  'hi/bank-statement-analyzer': 'bank-statement-analyzer',
  'hi/ocr-text-extractor': 'ocr-text-extractor',
  'hi/svg-vectorizer': 'svg-vectorizer',
  'hi/shape-art-generator': 'shape-art-generator',
  'hi/ambient-visuals': 'ambient',
  'fr/compresser-image': 'image-compressor',
  'fr/supprimer-arriere-plan': 'background-remover',
  'fr/convertisseur-par-lots': 'batch-converter',
  'fr/signer-pdf': 'sign-pdf',
  'fr/png-en-jpg': 'png-to-jpg',
  'fr/jpg-en-png': 'jpg-to-png',
  'fr/recadrer-image': 'crop-image',
  'fr/pivoter-image': 'rotate-image',
  'fr/ajouter-bordure-image': 'add-border-to-image',
  'fr/filtres-photos': 'photo-filters',
  'fr/inverser-couleurs': 'invert-colors',
  'fr/ajuster-image': 'adjust-image',
  'fr/generateur-memes': 'meme-generator',
  'fr/filigrane-image': 'watermark-overlay',
  'fr/supprimer-metadonnees': 'metadata-stripper',
  'fr/pixel-art': 'pixel-art-generator',
  'fr/art-ascii': 'ascii-art-generator',
  'fr/effet-glitch': 'glitch-image-generator',
  'fr/comparer-photos': 'side-by-side-image',
  'fr/panorama-instagram': 'instagram-panorama-splitter',
  'fr/grille-photos': 'collage-maker',
  'fr/censurer-photo': 'redact-image',
  'fr/steganographie-image': 'image-steganography',
  'fr/analyseur-releve-bancaire': 'bank-statement-analyzer',
  'fr/extracteur-texte-ocr': 'ocr-text-extractor',
  'fr/vectoriseur-svg': 'svg-vectorizer',
  'fr/art-formes': 'shape-art-generator',
  'fr/visuels-ambiance': 'ambient',
  'de/bild-komprimieren': 'image-compressor',
  'de/hintergrund-entfernen': 'background-remover',
  'de/stapel-konverter': 'batch-converter',
  'de/pdf-unterschreiben': 'sign-pdf',
  'de/png-in-jpg': 'png-to-jpg',
  'de/jpg-in-png': 'jpg-to-png',
  'de/bild-zuschneiden': 'crop-image',
  'de/bild-drehen': 'rotate-image',
  'de/rahmen-hinzufuegen': 'add-border-to-image',
  'de/fotofilter': 'photo-filters',
  'de/farben-invertieren': 'invert-colors',
  'de/bild-anpassen': 'adjust-image',
  'de/meme-generator': 'meme-generator',
  'de/wasserzeichen-hinzufuegen': 'watermark-overlay',
  'de/metadaten-entfernen': 'metadata-stripper',
  'de/pixel-art-generator': 'pixel-art-generator',
  'de/ascii-art-generator': 'ascii-art-generator',
  'de/glitch-effekt': 'glitch-image-generator',
  'de/bilder-vergleichen': 'side-by-side-image',
  'de/instagram-panorama-teiler': 'instagram-panorama-splitter',
  'de/fotogitter-erstellen': 'collage-maker',
  'de/bild-zensieren': 'redact-image',
  'de/bild-steganographie': 'image-steganography',
  'de/kontoauszug-analysieren': 'bank-statement-analyzer',
  'de/ocr-texterkennung': 'ocr-text-extractor',
  'de/svg-vektorisierer': 'svg-vectorizer',
  'de/formen-kunst': 'shape-art-generator',
  'de/ambient-visuals': 'ambient',
};

interface LanguageSelectorProps {
  className?: string;
  variant?: 'header' | 'footer' | 'mobile';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  className = '',
  variant = 'header',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Determine current language from URL path
  const currentPath = location.pathname.replace(/^\/+|\/+$/g, '');
  const pathParts = currentPath.split('/');
  const currentLangCode = ['es', 'pt', 'hi', 'fr', 'de'].includes(pathParts[0]) ? pathParts[0] : 'en';
  const currentLanguage = LANGUAGES.find(l => l.code === currentLangCode) || LANGUAGES[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageSelect = (targetLang: LanguageOption) => {
    setIsOpen(false);
    if (targetLang.code === currentLangCode) return;

    // Resolve base English tool key, checking aliases first
    let enToolKey = '';
    if (currentLangCode === 'en') {
      enToolKey = TOOL_ALIASES[currentPath] || currentPath;
    } else {
      enToolKey = LOCAL_TO_EN_MAP[currentPath] || '';
    }

    let targetPath = targetLang.pathPrefix;

    if (enToolKey && TOOL_EQUIVALENTS[enToolKey]) {
      if (targetLang.code === 'en') {
        targetPath = `/${enToolKey}`;
      } else {
        const localizedToolPath = TOOL_EQUIVALENTS[enToolKey][targetLang.code];
        if (localizedToolPath) {
          targetPath = `${targetLang.pathPrefix}/${localizedToolPath}`;
        }
      }
    }

    if (!targetPath) {
      targetPath = '/';
    }

    navigate(targetPath);
  };

  if (variant === 'mobile') {
    return (
      <div className={`space-y-1.5 ${className}`}>
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-1 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5" />
          <span>Language / Idioma</span>
        </div>
        <div className="grid grid-cols-2 gap-1 px-2">
          {LANGUAGES.map((lang) => {
            const isSelected = lang.code === currentLangCode;
            return (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
                }`}
              >
                <span className="text-sm">{lang.flag}</span>
                <span className="truncate">{lang.name}</span>
                {isSelected && <Check className="w-3 h-3 text-indigo-600 dark:text-indigo-400 ml-auto shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200/60 dark:border-slate-800 transition-all cursor-pointer select-none"
        aria-label="Select Language"
        aria-expanded={isOpen}
      >
        <span className="text-sm leading-none">{currentLanguage.flag}</span>
        <span className="hidden sm:inline-block font-semibold">{currentLanguage.name}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-500' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-44 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50 animate-fade-in backdrop-blur-md">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 mb-1">
            Select Language
          </div>
          {LANGUAGES.map((lang) => {
            const isSelected = lang.code === currentLangCode;
            return (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold transition-colors text-left cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                <span className="text-base leading-none">{lang.flag}</span>
                <span>{lang.name}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 ml-auto" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
