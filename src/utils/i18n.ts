import metadataEs from '../locales/es.json';
import metadataPt from '../locales/pt.json';
import metadataHi from '../locales/hi.json';
import metadataFr from '../locales/fr.json';
import metadataDe from '../locales/de.json';
import metadataEn from '../routes/metadata.json';

export type SupportedLocale = 'en' | 'es' | 'pt' | 'hi' | 'fr' | 'de';

export interface UiTranslations {
  heroBadge: string;
  heroTitle1: string;
  heroTitle2: string;
  heroSubtitle: string;
  heroCta: string;
  searchPlaceholder: string;
  allTools: string;
  categories: {
    all: string;
    imageEditing: string;
    layoutGrid: string;
    imageOpt: string;
    pdfDocs: string;
  };
  features: {
    privacy: string;
    privacyDesc: string;
    speed: string;
    speedDesc: string;
    free: string;
    freeDesc: string;
  };
  faqTitle: string;
  faqSubtitle: string;
  faqs: Array<{ q: string; a: string }>;
  nav: {
    tools: string;
    privacyPromise: string;
    searchShortcut: string;
    selectLanguage: string;
  };
}

export const UI_TRANSLATIONS: Record<SupportedLocale, UiTranslations> = {
  en: {
    heroBadge: '100% In-Browser • Zero Server Uploads',
    heroTitle1: 'Free Privacy-First',
    heroTitle2: 'Local Image Tools',
    heroSubtitle: 'Compress, crop, redact, filter, convert, and sign images directly on your device. Powered by WebAssembly and local browser memory with zero cloud uploads.',
    heroCta: 'Explore All Tools',
    searchPlaceholder: 'Search 24+ private image & PDF tools (e.g. crop, blur, convert)...',
    allTools: 'All Tools',
    categories: {
      all: 'All Tools',
      imageEditing: 'AI & Image Editing',
      layoutGrid: 'Layout & Grid',
      imageOpt: 'Optimization & Formats',
      pdfDocs: 'PDF & Documents',
    },
    features: {
      privacy: 'Zero Server Leaks',
      privacyDesc: 'Your files never leave your device RAM. 100% private sandbox.',
      speed: 'Instant WASM Performance',
      speedDesc: 'Runs with native hardware acceleration directly in your browser.',
      free: '100% Free Forever',
      freeDesc: 'No subscriptions, watermarks, sign-ups, or daily upload limits.',
    },
    faqTitle: 'Frequently Asked Questions',
    faqSubtitle: 'Everything you need to know about our privacy-first local processing.',
    faqs: [
      {
        q: 'Are my photos uploaded to any servers?',
        a: 'No. ImagePlumber runs 100% locally in your browser memory using client-side JavaScript, WebAssembly, and local canvas memory. Your files never leave your device.',
      },
      {
        q: 'Can I use these image tools offline?',
        a: 'Yes. Once the page is loaded, all tool scripts are fully cached. You can disconnect your internet and compress images, crop photos, or apply filters completely offline.',
      },
      {
        q: 'Is ImagePlumber free and safe to use?',
        a: 'Absolutely. ImagePlumber is 100% free with no sign-ups, subscriptions, or upload limits. Processing files on-device rather than on cloud servers makes it the safest option for sensitive documents.',
      },
    ],
    nav: {
      tools: 'Tools',
      privacyPromise: 'Zero-Upload Guarantee',
      searchShortcut: 'Search tools...',
      selectLanguage: 'Select Language',
    },
  },
  es: {
    heroBadge: '100% en el Navegador • Sin Subir Archivos',
    heroTitle1: 'Herramientas de Imagen',
    heroTitle2: '100% Locales y Privadas',
    heroSubtitle: 'Comprime, recorta, censura, aplica filtros y une fotos directamente en tu dispositivo. Procesamiento local con WebAssembly sin servidores en la nube.',
    heroCta: 'Explorar Herramientas',
    searchPlaceholder: 'Buscar herramientas de imagen y PDF (ej. recortar, desenfocar, comprimir)...',
    allTools: 'Todas las Herramientas',
    categories: {
      all: 'Todas las Herramientas',
      imageEditing: 'Edición y Filtros',
      layoutGrid: 'Diseño y Cuadrículas',
      imageOpt: 'Optimización y Formatos',
      pdfDocs: 'PDF y Documentos',
    },
    features: {
      privacy: 'Cero Fugas al Servidor',
      privacyDesc: 'Tus fotos nunca salen de la memoria de tu dispositivo.',
      speed: 'Velocidad Instantánea WASM',
      speedDesc: 'Procesamiento acelerado por hardware en tu propio navegador.',
      free: '100% Gratis Sin Límites',
      freeDesc: 'Sin registros, sin marcas de agua y sin suscripciones obligatorias.',
    },
    faqTitle: 'Preguntas Frecuentes',
    faqSubtitle: 'Todo lo que necesitas saber sobre nuestro procesamiento seguro y privado.',
    faqs: [
      {
        q: '¿Se suben mis fotos a algún servidor?',
        a: 'No. ImagePlumber funciona 100% en local en tu navegador con JavaScript y WebAssembly. Tus archivos nunca salen de tu ordenador o teléfono.',
      },
      {
        q: '¿Puedo usar estas herramientas sin conexión a internet?',
        a: 'Sí. Una vez cargada la página, todos los scripts se guardan en caché. Puedes desconectar internet y recortar, comprimir o censurar fotos offline.',
      },
      {
        q: '¿Es seguro para documentos confidenciales y fotos privadas?',
        a: 'Totalmente. Al no enviar datos a la nube, es la opción más segura para documentos bancarios, pasaportes y fotos personales.',
      },
    ],
    nav: {
      tools: 'Herramientas',
      privacyPromise: 'Garantía Sin Subidas',
      searchShortcut: 'Buscar herramientas...',
      selectLanguage: 'Seleccionar Idioma',
    },
  },
  pt: {
    heroBadge: '100% no Navegador • Sem Upload de Arquivos',
    heroTitle1: 'Ferramentas de Imagem',
    heroTitle2: '100% Locais e Privadas',
    heroSubtitle: 'Comprima, corte, censure, aplique filtros e converta imagens diretamente no seu dispositivo com total privacidade e velocidade.',
    heroCta: 'Explorar Ferramentas',
    searchPlaceholder: 'Pesquisar ferramentas de imagem e PDF (ex. cortar, desfocar, comprimir)...',
    allTools: 'Todas as Ferramentas',
    categories: {
      all: 'Todas as Ferramentas',
      imageEditing: 'Edição e Filtros',
      layoutGrid: 'Grades e Layout',
      imageOpt: 'Otimização e Formatos',
      pdfDocs: 'PDF e Documentos',
    },
    features: {
      privacy: 'Zero Envio para Nuvem',
      privacyDesc: 'Seus arquivos nunca saem da memória do seu dispositivo.',
      speed: 'Desempenho Instantâneo',
      speedDesc: 'Processamento acelerado diretamente pelo navegador.',
      free: '100% Gratuito Para Sempre',
      freeDesc: 'Sem cadastro, marcas d\'água ou limites diários de conversão.',
    },
    faqTitle: 'Perguntas Frequentes',
    faqSubtitle: 'Tudo o que você precisa saber sobre o processamento local de imagens.',
    faqs: [
      {
        q: 'As minhas fotos são enviadas para algum servidor?',
        a: 'Não. O ImagePlumber opera 100% localmente na memória do seu navegador. Os seus arquivos nunca saem do seu celular ou computador.',
      },
      {
        q: 'Posso usar as ferramentas sem internet?',
        a: 'Sim. Após carregar a página, todos os scripts funcionam offline para cortar, comprimir ou editar imagens.',
      },
      {
        q: 'É seguro para documentos confidenciais?',
        a: 'Sim, absolutamente seguro. Como nada é enviado para a nuvem, é a solução ideal para documentos pessoais e bancários.',
      },
    ],
    nav: {
      tools: 'Ferramentas',
      privacyPromise: 'Garantia Sem Upload',
      searchShortcut: 'Pesquisar ferramentas...',
      selectLanguage: 'Selecionar Idioma',
    },
  },
  hi: {
    heroBadge: '100% ब्राउज़र में प्रोसेस • ज़ीरो सर्वर अपलोड',
    heroTitle1: '100% फ्री और प्राइवेट',
    heroTitle2: 'लोकल इमेज टूल्स सुइट',
    heroSubtitle: 'फोटो कंप्रेस करें, क्रॉप करें, फिल्टर लगाएं, टेक्स्ट लिखें और बैकग्राउंड हटाएं सीधे अपने डिवाइस में बिना किसी सर्वर अपलोड के।',
    heroCta: 'सभी टूल्स देखें',
    searchPlaceholder: 'इमेज व PDF टूल्स खोजें (जैसे फोटो क्रॉप, ब्लर, कंप्रेस)...',
    allTools: 'सभी टूल्स',
    categories: {
      all: 'सभी टूल्स',
      imageEditing: 'AI व फोटो एडिटिंग',
      layoutGrid: 'लेआउट व ग्रिड',
      imageOpt: 'ऑप्टिमाइजेशन व साइज',
      pdfDocs: 'PDF व डॉक्यूमेंट्स',
    },
    features: {
      privacy: 'ज़ीरो डेटा लीक',
      privacyDesc: 'आपकी फोटो आपके डिवाइस से बाहर कभी नहीं जाती।',
      speed: 'सुपरफास्ट स्पीड',
      speedDesc: 'हार्डवेयर एक्सेलरेटेड ब्राउज़र टेक्नोलॉजी के साथ तुरंत परिणाम।',
      free: '100% फ्री हमेशा के लिए',
      freeDesc: 'बिना लॉगिन, बिना वॉटरमार्क और बिना किसी लिमिट के।',
    },
    faqTitle: 'अक्सर पूछे जाने वाले सवाल (FAQ)',
    faqSubtitle: 'प्राइवेट और लोकल इमेज प्रोसेसिंग के बारे में जरूरी जानकारियां।',
    faqs: [
      {
        q: 'क्या मेरी फोटो किसी सर्वर पर अपलोड होती है?',
        a: 'नहीं। ImagePlumber पूरी तरह से आपके ब्राउज़र मेमोरी में चलता है। आपकी फाइलें आपके मोबाइल या कंप्यूटर से कभी बाहर नहीं भेजी जातीं।',
      },
      {
        q: 'क्या मैं इन टूल्स को बिना इंटरनेट इस्तेमाल कर सकता हूँ?',
        a: 'हाँ। एक बार पेज लोड होने के बाद आप इंटरनेट बंद करके भी फोटो क्रॉप, कंप्रेस और एडिट कर सकते हैं।',
      },
      {
        q: 'क्या यह सरकारी डॉक्यूमेंट्स और प्राइवेट फोटो के लिए सुरक्षित है?',
        a: 'बिल्कुल 100% सुरक्षित है क्योंकि कोई भी डेटा इंटरनेट पर ट्रांसफर नहीं होता।',
      },
    ],
    nav: {
      tools: 'टूल्स',
      privacyPromise: 'ज़ीरो-अपलोड गारंटी',
      searchShortcut: 'टूल्स खोजें...',
      selectLanguage: 'भाषा चुनें',
    },
  },
  fr: {
    heroBadge: '100% dans le Navigateur • Zéro Upload Serveur',
    heroTitle1: 'Outils d\'Image Gratuits',
    heroTitle2: '100% Privés et Locaux',
    heroSubtitle: 'Compressez, recadrez, censurez, appliquez des filtres et signez vos images directement sur votre appareil avec sécurité totale.',
    heroCta: 'Découvrir les Outils',
    searchPlaceholder: 'Rechercher des outils image & PDF (ex. recadrer, flouter, compresser)...',
    allTools: 'Tous les Outils',
    categories: {
      all: 'Tous les Outils',
      imageEditing: 'Édition et Filtres',
      layoutGrid: 'Mise en Page et Grilles',
      imageOpt: 'Optimisation et Formats',
      pdfDocs: 'PDF et Documents',
    },
    features: {
      privacy: 'Zéro Fuite de Données',
      privacyDesc: 'Vos fichiers restent 100% dans la mémoire de votre appareil.',
      speed: 'Performance Instantanée',
      speedDesc: 'Exécution accélérée directement dans votre navigateur.',
      free: '100% Gratuit Sans Limite',
      freeDesc: 'Aucune inscription, filigrane ou abonnement requis.',
    },
    faqTitle: 'Foire Aux Questions',
    faqSubtitle: 'Tout ce que vous devez savoir sur notre traitement local et sécurisé.',
    faqs: [
      {
        q: 'Mes photos sont-elles téléchargées sur un serveur ?',
        a: 'Non. ImagePlumber fonctionne entièrement dans votre navigateur. Vos fichiers ne quittent jamais votre ordinateur ou smartphone.',
      },
      {
        q: 'Puis-je utiliser les outils hors ligne ?',
        a: 'Oui. Une fois la page chargée, tous les scripts fonctionnent sans connexion internet pour recadrer, compresser ou censurer vos images.',
      },
      {
        q: 'Est-ce sécurisé pour les documents confidentiels ?',
        a: 'Oui, totalement. L\'absence d\'envoi vers le cloud en fait la solution la plus sûre pour vos pièces d\'identité et documents sensibles.',
      },
    ],
    nav: {
      tools: 'Outils',
      privacyPromise: 'Garantie Zéro Upload',
      searchShortcut: 'Rechercher un outil...',
      selectLanguage: 'Choisir la Langue',
    },
  },
  de: {
    heroBadge: '100% im Browser • Keine Server-Uploads',
    heroTitle1: 'Kostenlose Bild-Tools',
    heroTitle2: '100% Lokal & Privat',
    heroSubtitle: 'Komprimieren, zuschneiden, zensieren, filtern und signieren Sie Bilder direkt auf Ihrem Gerät mit maximaler Privatsphäre.',
    heroCta: 'Alle Tools Erkunden',
    searchPlaceholder: 'Bild- & PDF-Tools suchen (z. B. zuschneiden, verpixeln, komprimieren)...',
    allTools: 'Alle Tools',
    categories: {
      all: 'Alle Tools',
      imageEditing: 'Bearbeitung & Filter',
      layoutGrid: 'Layout & Raster',
      imageOpt: 'Optimierung & Formate',
      pdfDocs: 'PDF & Dokumente',
    },
    features: {
      privacy: 'Keine Server-Uploads',
      privacyDesc: 'Ihre Dateien verlassen niemals den Arbeitsspeicher Ihres Geräts.',
      speed: 'Maximale Geschwindigkeit',
      speedDesc: 'Hardware-beschleunigte Ausführung direkt im Browser.',
      free: '100% Dauerhaft Kostenlos',
      freeDesc: 'Ohne Registrierung, Wasserzeichen oder tägliche Limits.',
    },
    faqTitle: 'Häufig Gestellte Fragen',
    faqSubtitle: 'Alles über unsere sichere, lokale Bildverarbeitung.',
    faqs: [
      {
        q: 'Werden meine Fotos auf Server hochgeladen?',
        a: 'Nein. ImagePlumber läuft vollständig lokal im Browser über JavaScript und WebAssembly. Ihre Daten bleiben immer auf Ihrem Gerät.',
      },
      {
        q: 'Kann ich die Tools offline verwenden?',
        a: 'Ja. Nach dem Laden der Seite sind alle Skripte zwischengespeichert und funktionieren komplett ohne Internetverbindung.',
      },
      {
        q: 'Ist es sicher für Ausweise und vertrauliche Dokumente?',
        a: 'Ja, absolut. Da keine Daten über das Internet übertragen werden, ist es die sicherste Option für private Dokumente.',
      },
    ],
    nav: {
      tools: 'Tools',
      privacyPromise: 'Kein-Upload-Garantie',
      searchShortcut: 'Tools suchen...',
      selectLanguage: 'Sprache Wählen',
    },
  },
};

/**
 * Extracts the current locale code from the URL pathname
 */
export function getLocaleFromPath(pathname: string): SupportedLocale {
  const clean = pathname.replace(/^\/+|\/+$/g, '');
  const firstPart = clean.split('/')[0];
  if (['es', 'pt', 'hi', 'fr', 'de'].includes(firstPart)) {
    return firstPart as SupportedLocale;
  }
  return 'en';
}

/**
 * Returns localized tool path from English tool path based on active locale
 */
export function getLocalizedToolPath(enPath: string, locale: SupportedLocale): string {
  if (locale === 'en') return enPath;
  const toolKey = enPath.replace(/^\//, '');

  const localeMap: Record<string, Record<string, string>> = {
    'background-remover': { es: 'quitar-fondo', pt: 'remover-fundo', hi: 'background-hataye', fr: 'supprimer-arriere-plan', de: 'hintergrund-entfernen' },
    'aspect-resizer': { es: 'recortar-imagen', pt: 'cortar-imagem', hi: 'photo-crop-kare', fr: 'recadrer-image', de: 'bild-zuschneiden' },
    'batch-converter': { es: 'convertidor-por-lotes', pt: 'conversor-em-lote', hi: 'batch-converter', fr: 'convertisseur-par-lots', de: 'stapel-konverter' },
    'collage-maker': { es: 'cuadricula-fotos', pt: 'grade-fotos', hi: 'photo-grid-maker', fr: 'grille-photos', de: 'fotogitter-erstellen' },
    'image-compressor': { es: 'comprimir-imagen', pt: 'comprimir-imagem', hi: 'photo-compress-kare', fr: 'compresser-image', de: 'bild-komprimieren' },
    'instagram-grid-splitter': { es: 'cuadricula-fotos', pt: 'grade-fotos', hi: 'photo-grid-maker', fr: 'grille-photos', de: 'fotogitter-erstellen' },
    'meme-generator': { es: 'generador-memes', pt: 'gerador-memes', hi: 'meme-generator', fr: 'generateur-memes', de: 'meme-generator' },
    'metadata-stripper': { es: 'eliminar-metadatos', pt: 'remover-metadados', hi: 'exif-metadata-hataye', fr: 'supprimer-metadonnees', de: 'metadaten-entfernen' },
    'sign-pdf': { es: 'firmar-pdf', pt: 'assinar-pdf', hi: 'pdf-sign-kare', fr: 'signer-pdf', de: 'pdf-unterschreiben' },
    'crop-image': { es: 'recortar-imagen', pt: 'cortar-imagem', hi: 'photo-crop-kare', fr: 'recadrer-image', de: 'bild-zuschneiden' },
    'rotate-image': { es: 'rotar-imagen', pt: 'girar-imagem', hi: 'photo-rotate-kare', fr: 'pivoter-image', de: 'bild-drehen' },
    'add-border-to-image': { es: 'agregar-borde-imagen', pt: 'adicionar-borda-imagem', hi: 'border-lagaye', fr: 'ajouter-bordure-image', de: 'rahmen-hinzufuegen' },
    'photo-filters': { es: 'filtros-fotos', pt: 'filtros-fotos', hi: 'photo-filters', fr: 'filtres-photos', de: 'fotofilter' },
    'invert-colors': { es: 'invertir-colores', pt: 'inverter-cores', hi: 'color-invert-kare', fr: 'inverser-couleurs', de: 'farben-invertieren' },
    'adjust-image': { es: 'ajustar-imagen', pt: 'ajustar-imagem', hi: 'photo-brightness-contrast', fr: 'ajuster-image', de: 'bild-anpassen' },
    'watermark-overlay': { es: 'marca-de-agua', pt: 'marca-dagua', hi: 'watermark-lagaye', fr: 'filigrane-image', de: 'wasserzeichen-hinzufuegen' },
    'pixel-art-generator': { es: 'arte-pixel', pt: 'arte-pixel', hi: 'pixel-art-generator', fr: 'pixel-art', de: 'pixel-art-generator' },
    'ascii-art-generator': { es: 'arte-ascii', pt: 'arte-ascii', hi: 'ascii-art-generator', fr: 'art-ascii', de: 'ascii-art-generator' },
    'glitch-image-generator': { es: 'efecto-glitch', pt: 'efeito-glitch', hi: 'glitch-art-studio', fr: 'effet-glitch', de: 'glitch-effekt' },
    'side-by-side-image': { es: 'comparar-fotos', pt: 'comparar-fotos', hi: 'photo-compare-kare', fr: 'comparer-photos', de: 'bilder-vergleichen' },
    'instagram-panorama-splitter': { es: 'panoramica-instagram', pt: 'panoramica-instagram', hi: 'instagram-panorama-splitter', fr: 'panorama-instagram', de: 'instagram-panorama-teiler' },
    'redact-image': { es: 'censurar-foto', pt: 'censurar-foto', hi: 'photo-censor-kare', fr: 'censurer-photo', de: 'bild-zensieren' },
    'image-steganography': { es: 'esteganografia-imagenes', pt: 'esteganografia-imagem', hi: 'image-steganography', fr: 'steganographie-image', de: 'bild-steganographie' },
  };

  const localizedSlug = localeMap[toolKey]?.[locale];
  if (localizedSlug) {
    return `/${locale}/${localizedSlug}`;
  }
  return `/${locale}${enPath}`;
}

/**
 * Returns localized tool title and description from locale JSON
 */
export function getLocalizedToolMeta(enPath: string, locale: SupportedLocale) {
  const toolKey = enPath.replace(/^\//, '');
  if (locale === 'en') {
    const meta = (metadataEn as any)[toolKey];
    return meta ? { title: meta.title.split(' - ')[0].split(' | ')[0], description: meta.description } : null;
  }

  const localeMap: Record<SupportedLocale, any> = {
    en: metadataEn,
    es: metadataEs,
    pt: metadataPt,
    hi: metadataHi,
    fr: metadataFr,
    de: metadataDe,
  };

  const currentDict = localeMap[locale];
  const localizedPath = getLocalizedToolPath(enPath, locale).replace(new RegExp(`^/${locale}/`), '');
  const meta = currentDict?.[localizedPath];
  if (meta) {
    return {
      title: meta.title.split(' - ')[0].split(' | ')[0],
      description: meta.description,
    };
  }
  return null;
}
