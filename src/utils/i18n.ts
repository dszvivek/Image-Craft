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

export const SHORT_TOOL_NAMES: Record<string, Record<SupportedLocale, { name: string; desc: string }>> = {
  'background-remover': {
    en: { name: 'AI Background Remover', desc: 'Isolate subjects with on-device AI' },
    es: { name: 'Eliminar Fondo AI', desc: 'Elimina fondos localmente con IA' },
    pt: { name: 'Remover Fundo AI', desc: 'Recorte de fundo com IA local' },
    hi: { name: 'बैकग्राउंड हटाएं (AI)', desc: 'लोकल AI से फोटो बैकग्राउंड हटाएं' },
    fr: { name: 'Supprimer Arrière-Plan', desc: 'Détourage photo avec IA locale' },
    de: { name: 'Hintergrund Entfernen', desc: 'Objekte lokal mit KI freistellen' },
  },
  'crop-image': {
    en: { name: 'Interactive Cropper', desc: '8-handle crop & passport aspect ratios' },
    es: { name: 'Recortador de Fotos', desc: 'Recorte 1:1, 4:5, 16:9 y pasaporte' },
    pt: { name: 'Cortador de Fotos', desc: 'Corte 1:1, 4:5, 16:9 e passaporte' },
    hi: { name: 'फोटो क्रॉप करें', desc: '1:1, 4:5, 16:9 व पासपोर्ट साइज' },
    fr: { name: 'Recadrer Image', desc: 'Ratios 1:1, 4:5, 16:9 et passeport' },
    de: { name: 'Bild Zuschneiden', desc: '1:1, 4:5, 16:9 & Passfoto-Formate' },
  },
  'rotate-image': {
    en: { name: 'Rotator & Straightener', desc: '90° rotate, mirror flip & level tilt' },
    es: { name: 'Girar y Enderezar', desc: 'Rotación 90°, espejos y nivelación' },
    pt: { name: 'Girar e Endireitar', desc: 'Gire 90°, espelhe e nivele o horizonte' },
    hi: { name: 'फोटो घुमाएं / सीधा करें', desc: '90° रोटेट, मिरर और एंगल सीधा करें' },
    fr: { name: 'Pivoter et Redresser', desc: 'Rotation 90°, miroir et redressement' },
    de: { name: 'Bild Drehen & Ausrichten', desc: '90° drehen, spiegeln & begradigen' },
  },
  'adjust-image': {
    en: { name: 'Image Adjuster & Tuner', desc: 'Lighting, contrast & auto-enhance' },
    es: { name: 'Ajustar Brillo y Tono', desc: 'Exposición, contraste y mejora 1-clic' },
    pt: { name: 'Ajustar Brilho e Tom', desc: 'Exposição, contraste e auto-ajuste' },
    hi: { name: 'ब्राइटनेस व कंट्रास्ट', desc: 'लाइटिंग, शार्पनेस व ऑटो-एन्हांस' },
    fr: { name: 'Ajuster Image & Ton', desc: 'Luminosité, contraste et amélioration' },
    de: { name: 'Bild Anpassen & Tunen', desc: 'Belichtung, Kontrast & Auto-Enhance' },
  },
  'photo-filters': {
    en: { name: 'Photo Filter & Duotone', desc: '12 aesthetic presets & duotone studio' },
    es: { name: 'Filtros y Duotono', desc: '12 filtros estéticos y mapas de color' },
    pt: { name: 'Filtros e Duotono', desc: '12 presets e gradientes duotone' },
    hi: { name: 'फोटो फिल्टर्स व डुओटोन', desc: '12 खूबसूरत फिल्टर्स व कस्टम टोन' },
    fr: { name: 'Filtres et Duotone', desc: '12 filtres esthétiques et duotones' },
    de: { name: 'Fotofilter & Duotone', desc: '12 Filter-Presets & Duotone-Generator' },
  },
  'invert-colors': {
    en: { name: 'Color Inverter & B&W', desc: 'Photo negative, solarize & Otsu B&W' },
    es: { name: 'Invertir Colores y B/N', desc: 'Negativo fotográfico y binarización' },
    pt: { name: 'Inverter Cores e P&B', desc: 'Negativo de foto e binarização P&B' },
    hi: { name: 'कलर इनवर्ट व B&W', desc: 'फोटो नेगेटिव और ब्लैक & व्हाइट' },
    fr: { name: 'Inverser Couleurs', desc: 'Négatif photo et noir & blanc' },
    de: { name: 'Farben Invertieren & S/W', desc: 'Foto-Negativ & Schwarz-Weiß' },
  },
  'aspect-resizer': {
    en: { name: 'Smart Aspect Resizer', desc: 'Fit social templates with blur padding' },
    es: { name: 'Redimensionar Aspecto', desc: 'Adapta a redes con relleno difuso' },
    pt: { name: 'Redimensionar Proporção', desc: 'Ajuste para redes com fundo desfocado' },
    hi: { name: 'साइज व रेश्यो बदलें', desc: 'सोशल मीडिया साइज व ब्लर पैडिंग' },
    fr: { name: 'Redimensionneur Ratio', desc: 'Formats sociaux avec flou de marge' },
    de: { name: 'Format Anpassen', desc: 'Social-Media-Größen mit Unschärfe' },
  },

  'redact-image': {
    en: { name: 'Photo Redactor & Censor', desc: 'Blackout private data & blur faces' },
    es: { name: 'Censurar y Desenfocar', desc: 'Oculta datos privados y caras' },
    pt: { name: 'Censurar e Desfocar', desc: 'Oculte dados confidenciais e rostos' },
    hi: { name: 'फोटो सेंसर व ब्लर करें', desc: 'प्राइवेट डेटा छुपाएं व चेहरे ब्लर करें' },
    fr: { name: 'Censurer et Flouter', desc: 'Masquez données privées et visages' },
    de: { name: 'Bild Zensieren & Verpixeln', desc: 'Private Daten schwärzen & Gesichter' },
  },
  'image-steganography': {
    en: { name: 'Steganography Secret Text', desc: 'Invisibly hide encrypted text in PNG' },
    es: { name: 'Esteganografía Oculta', desc: 'Oculta mensajes cifrados en imágenes' },
    pt: { name: 'Esteganografia Oculta', desc: 'Oculte mensagens secretas em imagens' },
    hi: { name: 'सीक्रेट मैसेज छिपाएं', desc: 'फोटो में छिपाएं एन्क्रिप्टेड टेक्स्ट' },
    fr: { name: 'Stéganographie Secrète', desc: 'Cachez du texte chiffré dans l\'image' },
    de: { name: 'Bild-Steganographie', desc: 'Geheime Nachrichten in Bildern' },
  },
  'metadata-stripper': {
    en: { name: 'EXIF Metadata Stripper', desc: 'Inspect & purge GPS camera headers' },
    es: { name: 'Eliminar Metadatos EXIF', desc: 'Inspecciona y borra GPS y cámara' },
    pt: { name: 'Remover Metadados EXIF', desc: 'Limpe coordenadas GPS e câmera' },
    hi: { name: 'EXIF डेटा हटाएं', desc: 'GPS व कैमरा मेटाडेटा साफ करें' },
    fr: { name: 'Supprimer Métadonnées', desc: 'Purgez GPS et données d\'appareil' },
    de: { name: 'Metadaten Entfernen', desc: 'GPS & Kamera-Header löschen' },
  },
  'watermark-overlay': {
    en: { name: 'Batch Watermark Overlay', desc: 'Apply copyright logos & text stamps' },
    es: { name: 'Marca de Agua en Lote', desc: 'Aplica logos y textos protegidos' },
    pt: { name: 'Marca d\'Água em Lote', desc: 'Aplique logos e marcas em fotos' },
    hi: { name: 'वॉटरमार्क लगाएं', desc: 'फोटो पर लोगो व कॉपीराइट टेक्स्ट' },
    fr: { name: 'Filigrane en Lot', desc: 'Appliquez logos et mentions copyright' },
    de: { name: 'Wasserzeichen Hinzufügen', desc: 'Logos & Text-Stempel aufbringen' },
  },
  'sign-pdf': {
    en: { name: 'Electronic PDF Signer', desc: 'Draw, type or upload signatures offline' },
    es: { name: 'Firmar PDF Online', desc: 'Dibuja o escribe firmas sin subir' },
    pt: { name: 'Assinar PDF Online', desc: 'Desenhe ou digite assinaturas offline' },
    hi: { name: 'PDF साइन करें', desc: 'डिजिटल सिग्नेचर लगाएं सुरक्षित रूप से' },
    fr: { name: 'Signer un PDF', desc: 'Signez vos contrats PDF hors ligne' },
    de: { name: 'PDF Unterschreiben', desc: 'Dokumente offline signieren' },
  },
  'bank-statement-analyzer': {
    en: { name: 'Bank Statement Analyzer', desc: 'Parse PDF/CSV ledgers client-side' },
    es: { name: 'Analizador de Extractos', desc: 'Audita extractos bancarios en local' },
    pt: { name: 'Analisador de Extratos', desc: 'Analise extratos bancários em local' },
    hi: { name: 'बैंक स्टेटमेंट एनालाइजर', desc: 'स्टेटमेंट का हिसाब-किताब देखें' },
    fr: { name: 'Analyseur Bancaire', desc: 'Analysez relevés bancaires en local' },
    de: { name: 'Kontoauszug-Analyzer', desc: 'Kontoauszüge lokal analysieren' },
  },
  'ocr-text-extractor': {
    en: { name: 'OCR Text Extractor', desc: 'Extract multi-lingual text from scans' },
    es: { name: 'Extractor de Texto OCR', desc: 'Extrae texto de fotos y documentos' },
    pt: { name: 'Extrator de Texto OCR', desc: 'Extraia texto de fotos e recibos' },
    hi: { name: 'OCR टेक्स्ट निकालें', desc: 'फोटो से लिखा हुआ टेक्स्ट कॉपी करें' },
    fr: { name: 'Extracteur de Texte OCR', desc: 'Numérisez le texte de vos images' },
    de: { name: 'OCR Texterkennung', desc: 'Text aus Bildern scannen' },
  },

  'pixel-art-generator': {
    en: { name: 'Pixel Art & 8-Bit Studio', desc: 'Game Boy, NES & PICO-8 retro dither' },
    es: { name: 'Pixel Art 8-Bit', desc: 'Paletas retro Game Boy y tramado' },
    pt: { name: 'Pixel Art 8-Bit', desc: 'Paletas retro Game Boy e pontilhado' },
    hi: { name: 'पिक्सेल आर्ट जेनरेटर', desc: '8-बिट रेट्रो गेमिंग स्टाइल फोटो' },
    fr: { name: 'Pixel Art 8-Bit', desc: 'Palettes rétro Game Boy et trames' },
    de: { name: 'Pixel-Art-Generator', desc: '8-Bit Retro-Stil & Game Boy Paletten' },
  },
  'ascii-art-generator': {
    en: { name: 'ASCII & Text Art Studio', desc: 'Matrix green & ANSI terminal art' },
    es: { name: 'Arte ASCII y Texto', desc: 'Convierte fotos en arte de terminal' },
    pt: { name: 'Arte ASCII e Texto', desc: 'Converta fotos em arte de terminal' },
    hi: { name: 'ASCII टेक्स्ट आर्ट', desc: 'फोटो को टेक्स्ट व कैरेक्टर में बदलें' },
    fr: { name: 'Art ASCII & Texte', desc: 'Convertissez en art de terminal vert' },
    de: { name: 'ASCII-Art-Studio', desc: 'Bilder in Matrix-Textkunst wandeln' },
  },
  'glitch-image-generator': {
    en: { name: 'Glitch Art & CRT Studio', desc: 'RGB split, datamoshing & scanlines' },
    es: { name: 'Efecto Glitch y CRT', desc: 'Aberración cromática y líneas CRT' },
    pt: { name: 'Efeito Glitch e CRT', desc: 'Aberração cromática e linhas CRT' },
    hi: { name: 'ग्लिच आर्ट स्टूडियो', desc: 'RGB स्प्लिट व CRT टीवी इफेक्ट्स' },
    fr: { name: 'Effet Glitch & CRT', desc: 'Aberration chromatique et lignes CRT' },
    de: { name: 'Glitch & CRT Effekt', desc: 'RGB-Verschiebung & Scanlines' },
  },
  'svg-vectorizer': {
    en: { name: 'SVG Path Vectorizer', desc: 'Trace raster JPG/PNG to vector SVG' },
    es: { name: 'Vectorizador SVG', desc: 'Convierte fotos a vectores SVG' },
    pt: { name: 'Vetorizador SVG', desc: 'Converta imagens em vetor SVG' },
    hi: { name: 'SVG वेक्टर बनाएं', desc: 'फोटो को स्केलेबल वेक्टर SVG बनाएं' },
    fr: { name: 'Vectoriseur SVG', desc: 'Tracez en tracés vectoriels SVG' },
    de: { name: 'SVG Vektorisierer', desc: 'Rasterbilder in SVG-Vektoren umwandeln' },
  },
  'meme-generator': {
    en: { name: 'Instant Meme Generator', desc: 'Custom draggable text captions & fonts' },
    es: { name: 'Generador de Memes', desc: 'Crea memes con textos arrastrables' },
    pt: { name: 'Gerador de Memes', desc: 'Crie memes com textos arrastáveis' },
    hi: { name: 'मीम जेनरेटर', desc: 'फोटो पर फनी मीम टेक्स्ट लिखें' },
    fr: { name: 'Générateur de Mèmes', desc: 'Créez vos mèmes avec textes' },
    de: { name: 'Meme-Generator', desc: 'Memes mit Texten & Fonts erstellen' },
  },
  'shape-art-generator': {
    en: { name: 'AI Shape Art Generator', desc: 'Cosmic stars, particle clouds & floral' },
    es: { name: 'Arte de Formas AI', desc: 'Retratos con estrellas y bocetos' },
    pt: { name: 'Arte de Formas AI', desc: 'Retratos em estrelas e esboços' },
    hi: { name: 'शेप आर्ट जेनरेटर', desc: 'तारों व पार्टिकल्स से कलाकृति बनाएं' },
    fr: { name: 'Art Vectoriel Formes', desc: 'Portraits en étoiles et esquisses' },
    de: { name: 'Formen-Kunst Generator', desc: 'Fotos in Sternen-Porträts wandeln' },
  },
  'ambient': {
    en: { name: 'Ambient Visuals & Focus', desc: 'Generative canvas for focus & calm' },
    es: { name: 'Visuales Ambientales', desc: 'Arte generativo para concentración' },
    pt: { name: 'Visuais Ambientais', desc: 'Arte generativa para foco e calma' },
    hi: { name: 'एंबिएंट विजुअल्स', desc: 'फोकस व ध्यान के लिए विजुअल आर्ट' },
    fr: { name: 'Visuels d\'Ambiance', desc: 'Toile générative pour concentration' },
    de: { name: 'Ambient Visuals', desc: 'Generative Kunst für Entspannung' },
  },

  'instagram-panorama-splitter': {
    en: { name: 'Instagram Panorama Splitter', desc: 'Seamless 4:5 swipeable carousel slices' },
    es: { name: 'Panorámica Instagram', desc: 'Divide paisajes en carrusel deslizable' },
    pt: { name: 'Panorâmica Instagram', desc: 'Divida fotos em carrossel contínuo' },
    hi: { name: 'इंस्टाग्राम पैनोरमा स्प्लिटर', desc: 'स्वाइप कैरोसेल 4:5 स्लाइस में काटें' },
    fr: { name: 'Panorama Instagram', desc: 'Découpez en carrousel sans couture' },
    de: { name: 'Panorama-Teiler Instagram', desc: 'Nahtlose Swipe-Karussell-Bilder' },
  },
  'side-by-side-image': {
    en: { name: 'Side-by-Side Combiner', desc: 'Stitch Before/After comparison photos' },
    es: { name: 'Comparar Antes/Después', desc: 'Une fotos en paralelo con etiquetas' },
    pt: { name: 'Comparar Antes/Depois', desc: 'Junte fotos com tags Antes/Depois' },
    hi: { name: 'फोटो कंपेयर (Before/After)', desc: 'दो फोटो को साथ-साथ जोड़ें' },
    fr: { name: 'Comparer Photos', desc: 'Assemblez avant/après avec étiquettes' },
    de: { name: 'Bilder Vergleichen', desc: 'Vorher/Nachher Fotos zusammenfügen' },
  },
  'collage-maker': {
    en: { name: 'Photo Collage Maker', desc: 'Multi-photo grid templates & spacing' },
    es: { name: 'Creador de Collages', desc: 'Plantillas de cuadrículas dinámicas' },
    pt: { name: 'Criador de Colagens', desc: 'Templates de grades para fotos' },
    hi: { name: 'फोटो कोलाज मेकर', desc: 'सुंदर ग्रिड कोलाज बनाएं' },
    fr: { name: 'Créateur de Collages', desc: 'Grilles photo avec espacements' },
    de: { name: 'Fotocollage Erstellen', desc: 'Bilder-Raster & Layout-Vorlagen' },
  },
  'instagram-grid-splitter': {
    en: { name: 'Instagram Grid Splitter', desc: 'Slice photos into 3x3, 3x2 social tiles' },
    es: { name: 'Cuadrícula Instagram', desc: 'Divide en mosaicos 3x3 para tu perfil' },
    pt: { name: 'Grade Instagram', desc: 'Divida em blocos 3x3 para o feed' },
    hi: { name: 'ग्रिड स्प्लिटर (3x3)', desc: 'फोटो को 9 टुकड़ों में बांटें' },
    fr: { name: 'Grille Instagram', desc: 'Découpez en tuiles 3x3 pour le profil' },
    de: { name: 'Instagram Raster-Teiler', desc: 'Fotos in 3x3 Kacheln aufteilen' },
  },
  'add-border-to-image': {
    en: { name: 'Canvas Border Expander', desc: 'Frames, blurred padding & drop shadows' },
    es: { name: 'Bordes y Sombras', desc: 'Bordes sólidos, sombras y desenfoque' },
    pt: { name: 'Bordas e Sombras', desc: 'Bordas sólidas, sombras e desfoque' },
    hi: { name: 'बॉर्डर व शैडो लगाएं', desc: 'कलर बॉर्डर, शैडो व ब्लर पैडिंग' },
    fr: { name: 'Bordures et Ombres', desc: 'Bordures colorées et ombres douces' },
    de: { name: 'Rahmen & Schatten', desc: 'Farbränder, Schatten & Unschärfe' },
  },
  'image-compressor': {
    en: { name: 'Smart Image Compressor', desc: 'Reduce JPEG, PNG, WebP up to 90%' },
    es: { name: 'Compresor de Fotos', desc: 'Reduce tamaño sin perder calidad' },
    pt: { name: 'Compressor de Fotos', desc: 'Reduza tamanho de JPEG, PNG e WebP' },
    hi: { name: 'फोटो कंप्रेस करें', desc: 'बिना क्वालिटी खोए फोटो साइज घटाएं' },
    fr: { name: 'Compresseur d\'Image', desc: 'Réduisez le poids sans perte visuelle' },
    de: { name: 'Bild Komprimieren', desc: 'JPEG, PNG & WebP Dateigröße sparen' },
  },
  'batch-converter': {
    en: { name: 'Batch Format & PDF Converter', desc: 'Bulk convert PNG, JPG, WebP & PDF' },
    es: { name: 'Conversor por Lotes', desc: 'Convierte y une a PDF o formatos' },
    pt: { name: 'Conversor em Lote', desc: 'Converta e junte em PDF e formatos' },
    hi: { name: 'बैच फोटो व PDF कनवर्टर', desc: 'एक साथ कई फोटो को PDF व फॉर्मेट बदलें' },
    fr: { name: 'Convertisseur par Lots', desc: 'Convertissez et fusionnez en PDF' },
    de: { name: 'Stapel-Konverter', desc: 'Bilder stapelweise in PDF & WebP' },
  },
  'photo-mosaic-generator': {
    en: { name: 'Photo Mosaic Generator', desc: 'Compose target photos from photo tiles' },
    es: { name: 'Mosaico de Fotos', desc: 'Recrea fotos a partir de miles de azulejos' },
    pt: { name: 'Mosaico de Fotos', desc: 'Crie mosaicos a partir de miniaturas' },
    hi: { name: 'फोटो मोज़ेक मेकर', desc: 'हजारों छोटी फोटो से बड़ी फोटो बनाएं' },
    fr: { name: 'Mosaïque Photo', desc: 'Composez des mosaïques à partir de tuiles' },
    de: { name: 'Fotomosaik Erstellen', desc: 'Mosaikbilder aus vielen kleinen Fotos' },
  },
  'color-palette-extractor': {
    en: { name: 'Color Palette Extractor', desc: 'Extract dominant HEX colors with K-Means' },
    es: { name: 'Paleta de Colores', desc: 'Extrae códigos HEX dominantes con K-Means' },
    pt: { name: 'Paleta de Cores', desc: 'Extraia paletas HEX dominantes com K-Means' },
    hi: { name: 'कलर पैलेट एक्सट्रैक्टर', desc: 'फोटो से मुख्य रंग (HEX) निकालें' },
    fr: { name: 'Palette de Couleurs', desc: 'Extrayez les couleurs HEX dominantes' },
    de: { name: 'Farbpalette Extrahieren', desc: 'Dominante HEX-Farbwerte extrahieren' },
  }
};

/**
 * Returns clean, concise short tool title and description for UI components
 */
export function getShortToolMeta(enPath: string, locale: SupportedLocale): { name: string; desc: string } {
  const toolKey = enPath.replace(/^\//, '');
  const entry = SHORT_TOOL_NAMES[toolKey]?.[locale] || SHORT_TOOL_NAMES[toolKey]?.en;
  if (entry) {
    return entry;
  }
  return {
    name: toolKey.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    desc: 'Client-side privacy tool'
  };
}

/**
 * Returns localized tool title and description from locale JSON (for SEO tags)
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
