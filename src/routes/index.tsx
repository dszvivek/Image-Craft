import React, { Suspense } from 'react';
import type { ComponentType } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '../layouts/Layout';

// Clear chunk reload flag on successful script load
if (typeof window !== 'undefined') {
  sessionStorage.removeItem('chunk-reload');
}

// Wrapper for React.lazy to automatically reload the page on ChunkLoadError (triggered by new builds)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function safeLazy<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) {
  return React.lazy(async () => {
    try {
      return await importFn();
    } catch (error) {
      console.error("Chunk loading failed, reloading page...", error);
      const hasReloaded = sessionStorage.getItem('chunk-reload');
      if (!hasReloaded) {
        sessionStorage.setItem('chunk-reload', 'true');
        window.location.reload();
        return new Promise(() => {}); // block rendering
      }
      throw error;
    }
  });
}

// Lazy load page components with auto-reload recovery for code splitting
const Home = safeLazy(() => import('../pages/Home').then(module => ({ default: module.Home })));
const Compressor = safeLazy(() => import('../pages/Compressor').then(module => ({ default: module.Compressor })));
const BackgroundRemover = safeLazy(() => import('../pages/BackgroundRemover').then(module => ({ default: module.BackgroundRemover })));
const OcrExtractor = safeLazy(() => import('../pages/OcrExtractor').then(module => ({ default: module.OcrExtractor })));
const GridSplitter = safeLazy(() => import('../pages/GridSplitter').then(module => ({ default: module.GridSplitter })));
const CollageMaker = safeLazy(() => import('../pages/CollageMaker').then(module => ({ default: module.CollageMaker })));
const PaletteExtractor = safeLazy(() => import('../pages/PaletteExtractor').then(module => ({ default: module.PaletteExtractor })));
const BatchConverter = safeLazy(() => import('../pages/BatchConverter').then(module => ({ default: module.BatchConverter })));
const MetadataStripper = safeLazy(() => import('../pages/MetadataStripper').then(module => ({ default: module.MetadataStripper })));
const WatermarkOverlay = safeLazy(() => import('../pages/WatermarkOverlay').then(module => ({ default: module.WatermarkOverlay })));
const AspectResizer = safeLazy(() => import('../pages/AspectResizer').then(module => ({ default: module.AspectResizer })));
const MemeGenerator = safeLazy(() => import('../pages/MemeGenerator').then(module => ({ default: module.MemeGenerator })));
const SvgVectorizer = safeLazy(() => import('../pages/SvgVectorizer').then(module => ({ default: module.SvgVectorizer })));
const MosaicGenerator = safeLazy(() => import('../pages/MosaicGenerator').then(module => ({ default: module.MosaicGenerator })));
const ShapeArtGenerator = safeLazy(() => import('../pages/ShapeArtGenerator').then(module => ({ default: module.ShapeArtGenerator })));
const StatementAnalyzer = safeLazy(() => import('../pages/StatementAnalyzer').then(module => ({ default: module.StatementAnalyzer })));
const PdfSigner = safeLazy(() => import('../pages/PdfSigner').then(module => ({ default: module.PdfSigner })));
const AmbientVisuals = safeLazy(() => import('../pages/AmbientVisuals').then(module => ({ default: module.AmbientVisuals })));
const About = safeLazy(() => import('../pages/About').then(module => ({ default: module.About })));
const Privacy = safeLazy(() => import('../pages/Privacy').then(module => ({ default: module.Privacy })));
const Contact = safeLazy(() => import('../pages/Contact').then(module => ({ default: module.Contact })));
const Faq = safeLazy(() => import('../pages/Faq').then(module => ({ default: module.Faq })));

import { PageLoader } from '../components/PageLoader';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: 'image-compressor',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Compressor />
          </Suspense>
        ),
      },
      {
        path: 'compress-png',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Compressor defaultFormat="image/png" defaultQuality={80} pageTitle="Compress PNG Images Online" pageSubtitle="Reduce PNG image file size without losing transparency locally in browser RAM." />
          </Suspense>
        ),
      },
      {
        path: 'compress-jpeg',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Compressor defaultFormat="image/jpeg" defaultQuality={75} pageTitle="Compress JPEG Images Online" pageSubtitle="Compress JPG/JPEG photos online with custom quality sliders and instant preview." />
          </Suspense>
        ),
      },
      {
        path: 'compress-webp',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Compressor defaultFormat="image/webp" defaultQuality={75} pageTitle="Compress WebP Images Online" pageSubtitle="Optimize modern WebP files with maximum byte savings and zero server uploads." />
          </Suspense>
        ),
      },
      {
        path: 'compress-image-to-100kb',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Compressor defaultFormat="image/jpeg" defaultQuality={60} pageTitle="Compress Image to 100KB Online" pageSubtitle="Reduce photo size under 100KB for application forms, portals, and fast web delivery." />
          </Suspense>
        ),
      },
      {
        path: 'compress-image-to-50kb',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Compressor defaultFormat="image/jpeg" defaultQuality={40} pageTitle="Compress Image to 50KB Online" pageSubtitle="Compress JPG/PNG photos to under 50KB instantly without upload limits." />
          </Suspense>
        ),
      },
      {
        path: 'compress-image-to-20kb',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Compressor defaultFormat="image/jpeg" defaultQuality={25} pageTitle="Compress Image to 20KB Online" pageSubtitle="Compress signatures and passport photos under 20KB for official portal requirements." />
          </Suspense>
        ),
      },
      {
        path: 'background-remover',
        element: (
          <Suspense fallback={<PageLoader />}>
            <BackgroundRemover />
          </Suspense>
        ),
      },
      {
        path: 'remove-white-background',
        element: (
          <Suspense fallback={<PageLoader />}>
            <BackgroundRemover />
          </Suspense>
        ),
      },
      {
        path: 'transparent-background-maker',
        element: (
          <Suspense fallback={<PageLoader />}>
            <BackgroundRemover />
          </Suspense>
        ),
      },
      {
        path: 'ocr-text-extractor',
        element: (
          <Suspense fallback={<PageLoader />}>
            <OcrExtractor />
          </Suspense>
        ),
      },
      {
        path: 'instagram-grid-splitter',
        element: (
          <Suspense fallback={<PageLoader />}>
            <GridSplitter />
          </Suspense>
        ),
      },
      {
        path: 'collage-maker',
        element: (
          <Suspense fallback={<PageLoader />}>
            <CollageMaker />
          </Suspense>
        ),
      },
      {
        path: 'color-palette-extractor',
        element: (
          <Suspense fallback={<PageLoader />}>
            <PaletteExtractor />
          </Suspense>
        ),
      },
      {
        path: 'batch-converter',
        element: (
          <Suspense fallback={<PageLoader />}>
            <BatchConverter />
          </Suspense>
        ),
      },
      {
        path: 'png-to-jpg',
        element: (
          <Suspense fallback={<PageLoader />}>
            <BatchConverter defaultFormat="image/jpeg" pageTitle="PNG to JPG Converter" pageSubtitle="Convert PNG images to high-quality JPG format in bulk locally in your browser. Zero cloud uploads." />
          </Suspense>
        ),
      },
      {
        path: 'jpg-to-png',
        element: (
          <Suspense fallback={<PageLoader />}>
            <BatchConverter defaultFormat="image/png" pageTitle="JPG to PNG Converter" pageSubtitle="Convert JPG photos to transparent-ready PNG format locally with zero quality loss." />
          </Suspense>
        ),
      },
      {
        path: 'webp-to-jpg',
        element: (
          <Suspense fallback={<PageLoader />}>
            <BatchConverter defaultFormat="image/jpeg" pageTitle="WebP to JPG Converter" pageSubtitle="Convert WebP images to standard JPG format in bulk without uploading files to any server." />
          </Suspense>
        ),
      },
      {
        path: 'webp-to-png',
        element: (
          <Suspense fallback={<PageLoader />}>
            <BatchConverter defaultFormat="image/png" pageTitle="WebP to PNG Converter" pageSubtitle="Convert modern WebP images to lossless PNG format 100% offline in browser RAM." />
          </Suspense>
        ),
      },
      {
        path: 'heic-to-jpg',
        element: (
          <Suspense fallback={<PageLoader />}>
            <BatchConverter defaultFormat="image/jpeg" pageTitle="HEIC to JPG Converter" pageSubtitle="Convert Apple iPhone HEIC/HEIF photos to universally compatible JPG images locally." />
          </Suspense>
        ),
      },
      {
        path: 'svg-to-png',
        element: (
          <Suspense fallback={<PageLoader />}>
            <BatchConverter defaultFormat="image/png" pageTitle="SVG to PNG Converter" pageSubtitle="Convert scalable vector SVG files to high-resolution raster PNG images." />
          </Suspense>
        ),
      },
      {
        path: 'png-to-svg',
        element: (
          <Suspense fallback={<PageLoader />}>
            <SvgVectorizer />
          </Suspense>
        ),
      },
      {
        path: 'metadata-stripper',
        element: (
          <Suspense fallback={<PageLoader />}>
            <MetadataStripper />
          </Suspense>
        ),
      },
      {
        path: 'watermark-overlay',
        element: (
          <Suspense fallback={<PageLoader />}>
            <WatermarkOverlay />
          </Suspense>
        ),
      },
      {
        path: 'aspect-resizer',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AspectResizer />
          </Suspense>
        ),
      },
      {
        path: 'meme-generator',
        element: (
          <Suspense fallback={<PageLoader />}>
            <MemeGenerator />
          </Suspense>
        ),
      },
      {
        path: 'svg-vectorizer',
        element: (
          <Suspense fallback={<PageLoader />}>
            <SvgVectorizer />
          </Suspense>
        ),
      },
      {
        path: 'photo-mosaic-generator',
        element: (
          <Suspense fallback={<PageLoader />}>
            <MosaicGenerator />
          </Suspense>
        ),
      },
      {
        path: 'shape-art-generator',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ShapeArtGenerator />
          </Suspense>
        ),
      },
      {
        path: 'bank-statement-analyzer',
        element: (
          <Suspense fallback={<PageLoader />}>
            <StatementAnalyzer />
          </Suspense>
        ),
      },
      {
        path: 'bank-statement-to-excel',
        element: (
          <Suspense fallback={<PageLoader />}>
            <StatementAnalyzer />
          </Suspense>
        ),
      },
      {
        path: 'sign-pdf',
        element: (
          <Suspense fallback={<PageLoader />}>
            <PdfSigner />
          </Suspense>
        ),
      },
      {
        path: 'sign-pdf-online',
        element: (
          <Suspense fallback={<PageLoader />}>
            <PdfSigner />
          </Suspense>
        ),
      },
      {
        path: 'ambient',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AmbientVisuals />
          </Suspense>
        ),
      },
      {
        path: 'about',
        element: (
          <Suspense fallback={<PageLoader />}>
            <About />
          </Suspense>
        ),
      },
      {
        path: 'privacy',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Privacy />
          </Suspense>
        ),
      },
      {
        path: 'contact',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Contact />
          </Suspense>
        ),
      },
      {
        path: 'faq',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Faq />
          </Suspense>
        ),
      },
      // Spanish Localized Routes (i18n Pilot)
      {
        path: 'es',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: 'es/comprimir-imagen',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Compressor pageTitle="Comprimir Imágenes Online Gratis" pageSubtitle="Reduce el tamaño de tus fotos en segundos sin subir archivos a servidores externos." />
          </Suspense>
        ),
      },
      {
        path: 'es/quitar-fondo',
        element: (
          <Suspense fallback={<PageLoader />}>
            <BackgroundRemover />
          </Suspense>
        ),
      },
      {
        path: 'es/convertidor-por-lotes',
        element: (
          <Suspense fallback={<PageLoader />}>
            <BatchConverter pageTitle="Convertidor de Imágenes por Lotes" pageSubtitle="Convierte múltiples fotos a diferentes formatos de forma 100% local." />
          </Suspense>
        ),
      },
      {
        path: 'es/firmar-pdf',
        element: (
          <Suspense fallback={<PageLoader />}>
            <PdfSigner />
          </Suspense>
        ),
      },
      {
        path: 'es/png-a-jpg',
        element: (
          <Suspense fallback={<PageLoader />}>
            <BatchConverter defaultFormat="image/jpeg" pageTitle="Convertir PNG a JPG" pageSubtitle="Convierte imágenes PNG a JPG de forma rápida y segura en tu navegador." />
          </Suspense>
        ),
      },
      {
        path: 'es/jpg-a-png',
        element: (
          <Suspense fallback={<PageLoader />}>
            <BatchConverter defaultFormat="image/png" pageTitle="Convertir JPG a PNG" pageSubtitle="Convierte fotos JPG a PNG con máxima calidad y sin pérdidas." />
          </Suspense>
        ),
      },
      // Portuguese Localized Routes (i18n Phase 2)
      {
        path: 'pt',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: 'pt/comprimir-imagem',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Compressor pageTitle="Comprimir Imagem Online Grátis" pageSubtitle="Reduza o tamanho de fotos em segundos sem enviar arquivos para a nuvem." />
          </Suspense>
        ),
      },
      {
        path: 'pt/remover-fundo',
        element: (
          <Suspense fallback={<PageLoader />}>
            <BackgroundRemover />
          </Suspense>
        ),
      },
      {
        path: 'pt/conversor-em-lote',
        element: (
          <Suspense fallback={<PageLoader />}>
            <BatchConverter pageTitle="Conversor de Imagens em Lote" pageSubtitle="Converta múltiplas fotos para diferentes formatos de forma 100% local." />
          </Suspense>
        ),
      },
      {
        path: 'pt/assinar-pdf',
        element: (
          <Suspense fallback={<PageLoader />}>
            <PdfSigner />
          </Suspense>
        ),
      },
      {
        path: 'pt/png-para-jpg',
        element: (
          <Suspense fallback={<PageLoader />}>
            <BatchConverter defaultFormat="image/jpeg" pageTitle="Converter PNG para JPG" pageSubtitle="Converta imagens PNG para JPG com máxima qualidade no seu navegador." />
          </Suspense>
        ),
      },
      {
        path: 'pt/jpg-para-png',
        element: (
          <Suspense fallback={<PageLoader />}>
            <BatchConverter defaultFormat="image/png" pageTitle="Converter JPG para PNG" pageSubtitle="Converta fotos JPG para PNG sem perdas de qualidade." />
          </Suspense>
        ),
      },
      // Hindi Localized Routes (i18n Phase 2)
      {
        path: 'hi',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: 'hi/photo-compress-kare',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Compressor pageTitle="Photo Size Kam Kare Online Free" pageSubtitle="बिना किसी सर्वर अपलोड के फोटो का साइज 20KB, 50KB, 100KB में कम करें।" />
          </Suspense>
        ),
      },
      {
        path: 'hi/background-hataye',
        element: (
          <Suspense fallback={<PageLoader />}>
            <BackgroundRemover />
          </Suspense>
        ),
      },
      {
        path: 'hi/batch-converter',
        element: (
          <Suspense fallback={<PageLoader />}>
            <BatchConverter pageTitle="Batch Image Converter & PDF Maker" pageSubtitle="एक साथ कई फोटो को JPG, PNG या कंबाइंड PDF में बदलें।" />
          </Suspense>
        ),
      },
      {
        path: 'hi/pdf-sign-kare',
        element: (
          <Suspense fallback={<PageLoader />}>
            <PdfSigner />
          </Suspense>
        ),
      },
      {
        path: 'hi/png-se-jpg',
        element: (
          <Suspense fallback={<PageLoader />}>
            <BatchConverter defaultFormat="image/jpeg" pageTitle="PNG Ko JPG Me Convert Kare" pageSubtitle="PNG फोटो को हाई क्वालिटी JPG में बदलें बिना सर्वर पर भेजे।" />
          </Suspense>
        ),
      },
      {
        path: 'hi/jpg-se-png',
        element: (
          <Suspense fallback={<PageLoader />}>
            <BatchConverter defaultFormat="image/png" pageTitle="JPG Ko PNG Me Convert Kare" pageSubtitle="JPG और JPEG फोटो को बिना क्वालिटी खोए PNG में बदलें।" />
          </Suspense>
        ),
      },
      // French Localized Routes (i18n Phase 2)
      {
        path: 'fr',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: 'fr/compresser-image',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Compressor pageTitle="Compresser une Image en Ligne Gratuit" pageSubtitle="Réduisez la taille de vos images sans perte de qualité dans votre navigateur." />
          </Suspense>
        ),
      },
      {
        path: 'fr/supprimer-arriere-plan',
        element: (
          <Suspense fallback={<PageLoader />}>
            <BackgroundRemover />
          </Suspense>
        ),
      },
      {
        path: 'fr/convertisseur-par-lots',
        element: (
          <Suspense fallback={<PageLoader />}>
            <BatchConverter pageTitle="Convertisseur d'Images par Lots" pageSubtitle="Convertissez plusieurs photos vers différents formats en local." />
          </Suspense>
        ),
      },
      {
        path: 'fr/signer-pdf',
        element: (
          <Suspense fallback={<PageLoader />}>
            <PdfSigner />
          </Suspense>
        ),
      },
      {
        path: 'fr/png-en-jpg',
        element: (
          <Suspense fallback={<PageLoader />}>
            <BatchConverter defaultFormat="image/jpeg" pageTitle="Convertir PNG en JPG" pageSubtitle="Convertissez vos PNG en format JPG rapidement sans serveur cloud." />
          </Suspense>
        ),
      },
      {
        path: 'fr/jpg-en-png',
        element: (
          <Suspense fallback={<PageLoader />}>
            <BatchConverter defaultFormat="image/png" pageTitle="Convertir JPG en PNG" pageSubtitle="Convertissez vos photos JPG en PNG avec transparence préservée." />
          </Suspense>
        ),
      },
      // German Localized Routes (i18n Phase 2)
      {
        path: 'de',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: 'de/bild-komprimieren',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Compressor pageTitle="Bilder Online Kostenlos Komprimieren" pageSubtitle="Reduzieren Sie die Dateigröße Ihrer Fotos in Sekundenschnelle ohne Cloud-Uploads." />
          </Suspense>
        ),
      },
      {
        path: 'de/hintergrund-entfernen',
        element: (
          <Suspense fallback={<PageLoader />}>
            <BackgroundRemover />
          </Suspense>
        ),
      },
      {
        path: 'de/stapel-konverter',
        element: (
          <Suspense fallback={<PageLoader />}>
            <BatchConverter pageTitle="Stapel-Bildkonverter & PDF-Maker" pageSubtitle="Konvertieren Sie mehrere Fotos lokal in verschiedene Dateiformate." />
          </Suspense>
        ),
      },
      {
        path: 'de/pdf-unterschreiben',
        element: (
          <Suspense fallback={<PageLoader />}>
            <PdfSigner />
          </Suspense>
        ),
      },
      {
        path: 'de/png-in-jpg',
        element: (
          <Suspense fallback={<PageLoader />}>
            <BatchConverter defaultFormat="image/jpeg" pageTitle="PNG in JPG Umwandeln" pageSubtitle="Konvertieren Sie PNG-Bilder verlustfrei in das universelle JPG-Format." />
          </Suspense>
        ),
      },
      {
        path: 'de/jpg-in-png',
        element: (
          <Suspense fallback={<PageLoader />}>
            <BatchConverter defaultFormat="image/png" pageTitle="JPG in PNG Umwandeln" pageSubtitle="Konvertieren Sie JPG-Fotos in hochwertige PNG-Dateien ohne Cloud." />
          </Suspense>
        ),
      },
    ],
  },
]);
