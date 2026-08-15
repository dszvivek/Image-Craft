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
const ImageCropper = safeLazy(() => import('../pages/ImageCropper').then(module => ({ default: module.ImageCropper })));
const ImageRotator = safeLazy(() => import('../pages/ImageRotator').then(module => ({ default: module.ImageRotator })));
const BorderExpander = safeLazy(() => import('../pages/BorderExpander').then(module => ({ default: module.BorderExpander })));
const PhotoFilterStudio = safeLazy(() => import('../pages/PhotoFilterStudio').then(module => ({ default: module.PhotoFilterStudio })));
const ColorInverter = safeLazy(() => import('../pages/ColorInverter').then(module => ({ default: module.ColorInverter })));
const ImageAdjuster = safeLazy(() => import('../pages/ImageAdjuster').then(module => ({ default: module.ImageAdjuster })));
const PixelArtGenerator = safeLazy(() => import('../pages/PixelArtGenerator').then(module => ({ default: module.PixelArtGenerator })));
const AsciiArtGenerator = safeLazy(() => import('../pages/AsciiArtGenerator').then(module => ({ default: module.AsciiArtGenerator })));
const GlitchArtStudio = safeLazy(() => import('../pages/GlitchArtStudio').then(module => ({ default: module.GlitchArtStudio })));
const SideBySideCompare = safeLazy(() => import('../pages/SideBySideCompare').then(module => ({ default: module.SideBySideCompare })));
const InstagramPanoramaSplitter = safeLazy(() => import('../pages/InstagramPanoramaSplitter').then(module => ({ default: module.InstagramPanoramaSplitter })));
const ImageRedactor = safeLazy(() => import('../pages/ImageRedactor').then(module => ({ default: module.ImageRedactor })));
const ImageSteganography = safeLazy(() => import('../pages/ImageSteganography').then(module => ({ default: module.ImageSteganography })));
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
        path: 'exif-viewer',
        element: (
          <Suspense fallback={<PageLoader />}>
            <MetadataStripper initialMode="view" pageTitle="EXIF Metadata Viewer Online" pageSubtitle="Inspect camera settings, aperture, ISO, and GPS coordinates online for free." />
          </Suspense>
        ),
      },
      {
        path: 'remove-exif-data',
        element: (
          <Suspense fallback={<PageLoader />}>
            <MetadataStripper initialMode="strip" pageTitle="Remove EXIF Data & GPS from Photos" pageSubtitle="Strip geolocation, serial numbers, and metadata from single or batch photos." />
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
        path: 'batch-watermark',
        element: (
          <Suspense fallback={<PageLoader />}>
            <WatermarkOverlay initialMode="batch" pageTitle="Batch Watermark Photos Online" pageSubtitle="Watermark multiple photos simultaneously and export as a ZIP archive." />
          </Suspense>
        ),
      },
      {
        path: 'add-logo-to-photo',
        element: (
          <Suspense fallback={<PageLoader />}>
            <WatermarkOverlay initialMode="single" pageTitle="Add Logo to Photo Online Free" pageSubtitle="Overlay transparent PNG logos with custom opacity, scale, and anchor positioning." />
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
        path: 'add-text-to-image',
        element: (
          <Suspense fallback={<PageLoader />}>
            <MemeGenerator initialMode="text" pageTitle="Add Text to Photo Online Free" pageSubtitle="Overlay custom text, outline strokes, and fonts on images without cloud uploads." />
          </Suspense>
        ),
      },
      {
        path: 'caption-generator',
        element: (
          <Suspense fallback={<PageLoader />}>
            <MemeGenerator initialMode="caption" pageTitle="Photo Caption & Subtitle Generator" pageSubtitle="Add high-visibility subtitles and highlight caption boxes to images." />
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
        path: 'crop-image',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ImageCropper />
          </Suspense>
        ),
      },
      {
        path: 'passport-photo-cropper',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ImageCropper initialPreset="passport" pageTitle="Passport & Visa Photo Cropper" pageSubtitle="Crop photos to official 2x2 inch (51x51 mm) passport and visa ID standards locally in RAM." />
          </Suspense>
        ),
      },
      {
        path: 'rotate-image',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ImageRotator />
          </Suspense>
        ),
      },
      {
        path: 'add-border-to-image',
        element: (
          <Suspense fallback={<PageLoader />}>
            <BorderExpander />
          </Suspense>
        ),
      },
      {
        path: 'photo-filters',
        element: (
          <Suspense fallback={<PageLoader />}>
            <PhotoFilterStudio />
          </Suspense>
        ),
      },
      {
        path: 'vintage-photo-filter',
        element: (
          <Suspense fallback={<PageLoader />}>
            <PhotoFilterStudio initialPreset="vintage1977" pageTitle="Vintage & Retro Photo Filters" pageSubtitle="Apply 1970s film and retro Polaroid color grading to photos 100% locally." />
          </Suspense>
        ),
      },
      {
        path: 'duotone-generator',
        element: (
          <Suspense fallback={<PageLoader />}>
            <PhotoFilterStudio initialMode="duotone" pageTitle="Duotone Effect Generator" pageSubtitle="Create Spotify-style two-tone gradient maps with custom shadow and highlight colors." />
          </Suspense>
        ),
      },
      {
        path: 'invert-colors',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ColorInverter />
          </Suspense>
        ),
      },
      {
        path: 'black-and-white-converter',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ColorInverter initialMode="bw" pageTitle="Black & White Image Converter" pageSubtitle="Convert photos to high-contrast monochrome or 1-bit binary scans with Otsu auto-thresholding." />
          </Suspense>
        ),
      },
      {
        path: 'adjust-image',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ImageAdjuster />
          </Suspense>
        ),
      },
      {
        path: 'brightness-contrast',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ImageAdjuster initialMode="brightness-contrast" pageTitle="Image Brightness & Contrast Tuner" pageSubtitle="Fine-tune lighting, contrast, and saturation with live before/after split comparison." />
          </Suspense>
        ),
      },
      {
        path: 'pixel-art-generator',
        element: (
          <Suspense fallback={<PageLoader />}>
            <PixelArtGenerator />
          </Suspense>
        ),
      },
      {
        path: '8-bit-photo-converter',
        element: (
          <Suspense fallback={<PageLoader />}>
            <PixelArtGenerator pageTitle="8-Bit Photo Converter Online Free" pageSubtitle="Convert photos into authentic 8-bit retro pixel art with Game Boy, NES, and PICO-8 palettes." />
          </Suspense>
        ),
      },
      {
        path: 'pixelate-image',
        element: (
          <Suspense fallback={<PageLoader />}>
            <PixelArtGenerator pageTitle="Pixelate Image Online Free" pageSubtitle="Apply custom pixel block sizes and dithering algorithms to photos in your browser." />
          </Suspense>
        ),
      },
      {
        path: 'ascii-art-generator',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AsciiArtGenerator />
          </Suspense>
        ),
      },
      {
        path: 'image-to-text-art',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AsciiArtGenerator pageTitle="Image to Text Art Converter" pageSubtitle="Map photo brightness to ASCII character sets with instant clipboard copy and TXT/PNG export." />
          </Suspense>
        ),
      },
      {
        path: 'ansi-art',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AsciiArtGenerator pageTitle="ANSI Art & Colored ASCII Generator" pageSubtitle="Generate full-color ANSI text art and Matrix phosphor green character streams." />
          </Suspense>
        ),
      },
      {
        path: 'glitch-image-generator',
        element: (
          <Suspense fallback={<PageLoader />}>
            <GlitchArtStudio />
          </Suspense>
        ),
      },
      {
        path: 'crt-tv-filter',
        element: (
          <Suspense fallback={<PageLoader />}>
            <GlitchArtStudio pageTitle="CRT TV Filter & Scanlines Online" pageSubtitle="Simulate retro cathode ray tube scanlines, phosphor glow, and analog screen curvature." />
          </Suspense>
        ),
      },
      {
        path: 'vhs-effect',
        element: (
          <Suspense fallback={<PageLoader />}>
            <GlitchArtStudio pageTitle="VHS Effect & Glitch Art Generator" pageSubtitle="Apply vintage 1980s VHS tape static, noise, and RGB chromatic aberration distortion." />
          </Suspense>
        ),
      },
      {
        path: 'side-by-side-image',
        element: (
          <Suspense fallback={<PageLoader />}>
            <SideBySideCompare />
          </Suspense>
        ),
      },
      {
        path: 'before-after-image',
        element: (
          <Suspense fallback={<PageLoader />}>
            <SideBySideCompare pageTitle="Before and After Image Combiner Free" pageSubtitle="Combine Before and After photos with custom text badge labels and divider borders." />
          </Suspense>
        ),
      },
      {
        path: 'compare-images',
        element: (
          <Suspense fallback={<PageLoader />}>
            <SideBySideCompare pageTitle="Compare Two Images Side by Side" pageSubtitle="Compare two images with horizontal or vertical split and custom badge styling." />
          </Suspense>
        ),
      },
      {
        path: 'instagram-panorama-splitter',
        element: (
          <Suspense fallback={<PageLoader />}>
            <InstagramPanoramaSplitter />
          </Suspense>
        ),
      },
      {
        path: 'swipe-carousel-maker',
        element: (
          <Suspense fallback={<PageLoader />}>
            <InstagramPanoramaSplitter pageTitle="Swipe Carousel Maker for Instagram & TikTok" pageSubtitle="Create seamless 4:5 portrait and square swipe carousels from panoramic photos." />
          </Suspense>
        ),
      },
      {
        path: 'seamless-carousel',
        element: (
          <Suspense fallback={<PageLoader />}>
            <InstagramPanoramaSplitter pageTitle="Seamless Panorama Carousel Splitter" pageSubtitle="Split panoramic photos into seamless swipe slides with batch ZIP download." />
          </Suspense>
        ),
      },
      {
        path: 'photo-grid-maker',
        element: (
          <Suspense fallback={<PageLoader />}>
            <CollageMaker pageTitle="Photo Grid Maker Online Free" pageSubtitle="Combine photos into custom grid structures with adjustable spacing and corner radius." />
          </Suspense>
        ),
      },
      {
        path: 'photo-joiner',
        element: (
          <Suspense fallback={<PageLoader />}>
            <CollageMaker pageTitle="Photo Joiner & Image Combiner" pageSubtitle="Join multiple photos into a single canvas locally in your browser." />
          </Suspense>
        ),
      },
      {
        path: 'redact-image',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ImageRedactor />
          </Suspense>
        ),
      },
      {
        path: 'blur-faces',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ImageRedactor initialMode="blur" pageTitle="Blur Faces in Photos Online Free" pageSubtitle="Quickly blur faces and people in images with smooth frosted Gaussian blur." />
          </Suspense>
        ),
      },
      {
        path: 'pixelate-face',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ImageRedactor initialMode="pixelate" pageTitle="Pixelate Faces & Censor Photos Online" pageSubtitle="Apply blocky 8-bit mosaic pixelation to conceal faces and sensitive details." />
          </Suspense>
        ),
      },
      {
        path: 'censor-photo',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ImageRedactor initialMode="solid" pageTitle="Censor Photos & Black Out Information" pageSubtitle="Draw blackout bars to censor addresses, credit cards, and license plates." />
          </Suspense>
        ),
      },
      {
        path: 'image-steganography',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ImageSteganography />
          </Suspense>
        ),
      },
      {
        path: 'hide-text-in-image',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ImageSteganography initialMode="encode" pageTitle="Hide Text in Image Online Free (Steganography)" pageSubtitle="Invisibly embed secret text notes and recovery phrases into PNG images." />
          </Suspense>
        ),
      },
      {
        path: 'decode-hidden-message',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ImageSteganography initialMode="decode" pageTitle="Extract & Decode Hidden Message from Image" pageSubtitle="Extract secret text messages hidden in steganographic images with a password." />
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
      {
        path: 'es/recortar-imagen',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ImageCropper pageTitle="Recortar Imágenes Online Gratis" pageSubtitle="Recorta fotos con proporciones cuadradas, 16:9 y formatos de pasaporte sin subir archivos." />
          </Suspense>
        ),
      },
      {
        path: 'es/rotar-imagen',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ImageRotator />
          </Suspense>
        ),
      },
      {
        path: 'es/agregar-borde-imagen',
        element: (
          <Suspense fallback={<PageLoader />}>
            <BorderExpander />
          </Suspense>
        ),
      },
      {
        path: 'es/filtros-fotos',
        element: (
          <Suspense fallback={<PageLoader />}>
            <PhotoFilterStudio pageTitle="Filtros de Fotos Online Gratis" pageSubtitle="Aplica filtros vintage, cyberpunk y efectos duotono a tus fotos 100% en el navegador." />
          </Suspense>
        ),
      },
      {
        path: 'es/invertir-colores',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ColorInverter pageTitle="Invertir Colores de Imagen Online" pageSubtitle="Convierte fotos a negativo o blanco y negro de alto contraste sin subir archivos." />
          </Suspense>
        ),
      },
      {
        path: 'es/ajustar-imagen',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ImageAdjuster pageTitle="Ajustar Brillo y Contraste de Fotos" pageSubtitle="Ajusta exposición, saturación y temperatura con vista comparativa en tiempo real." />
          </Suspense>
        ),
      },
      {
        path: 'es/generador-memes',
        element: (
          <Suspense fallback={<PageLoader />}>
            <MemeGenerator pageTitle="Generador de Memes Online Gratis" pageSubtitle="Crea memes personalizados y añade texto con fuentes y bordes en tu navegador." />
          </Suspense>
        ),
      },
      {
        path: 'es/marca-de-agua',
        element: (
          <Suspense fallback={<PageLoader />}>
            <WatermarkOverlay pageTitle="Poner Marca de Agua a Fotos Online" pageSubtitle="Añade texto, logos o marcas repetidas en lote con descarga en ZIP." />
          </Suspense>
        ),
      },
      {
        path: 'es/eliminar-metadatos',
        element: (
          <Suspense fallback={<PageLoader />}>
            <MetadataStripper pageTitle="Ver y Eliminar Metadatos EXIF Online" pageSubtitle="Inspecciona ajustes de cámara, ubicación GPS y limpia datos sensibles en local." />
          </Suspense>
        ),
      },
      {
        path: 'es/arte-pixel',
        element: (
          <Suspense fallback={<PageLoader />}>
            <PixelArtGenerator pageTitle="Generador de Pixel Art y 8-Bits Online" pageSubtitle="Convierte fotos en arte pixel retro con paletas de Game Boy, NES y dithering." />
          </Suspense>
        ),
      },
      {
        path: 'es/arte-ascii',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AsciiArtGenerator pageTitle="Generador de Arte ASCII Online Gratis" pageSubtitle="Convierte fotos a texto ASCII con temas verde Matrix, color ANSI y exportación PNG." />
          </Suspense>
        ),
      },
      {
        path: 'es/efecto-glitch',
        element: (
          <Suspense fallback={<PageLoader />}>
            <GlitchArtStudio pageTitle="Generador de Efecto Glitch y Líneas CRT" pageSubtitle="Crea aberración cromática RGB, datamoshing y distorsión retro VHS 100% local." />
          </Suspense>
        ),
      },
      {
        path: 'es/comparar-fotos',
        element: (
          <Suspense fallback={<PageLoader />}>
            <SideBySideCompare pageTitle="Comparar Fotos Lado a Lado y Antes/Después" pageSubtitle="Combina dos fotos lado a lado con etiquetas de Antes/Después y bordes divisorios." />
          </Suspense>
        ),
      },
      {
        path: 'es/panoramica-instagram',
        element: (
          <Suspense fallback={<PageLoader />}>
            <InstagramPanoramaSplitter pageTitle="Dividir Panorámica para Carrusel de Instagram" pageSubtitle="Crea publicaciones continuas de Instagram en 4:5 y cuadrado con descarga en ZIP." />
          </Suspense>
        ),
      },
      {
        path: 'es/cuadricula-fotos',
        element: (
          <Suspense fallback={<PageLoader />}>
            <CollageMaker pageTitle="Crear Cuadrícula y Collage de Fotos Gratis" pageSubtitle="Combina múltiples imágenes en cuadrículas personalizadas sin marcas de agua." />
          </Suspense>
        ),
      },
      {
        path: 'es/censurar-foto',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ImageRedactor pageTitle="Censurar Fotos y Desenfocar Caras Online" pageSubtitle="Oculta información confidencial, censura caras y tapa datos privados en el navegador." />
          </Suspense>
        ),
      },
      {
        path: 'es/esteganografia-imagenes',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ImageSteganography pageTitle="Ocultar Texto Secreto en Fotos (Esteganografía)" pageSubtitle="Oculta mensajes de texto secretos dentro de imágenes con contraseña en local." />
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
      {
        path: 'pt/cortar-imagem',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ImageCropper pageTitle="Cortar Imagens Online Grátis" pageSubtitle="Corte fotos em proporções personalizadas ou formatos para redes sociais 100% no navegador." />
          </Suspense>
        ),
      },
      {
        path: 'pt/girar-imagem',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ImageRotator />
          </Suspense>
        ),
      },
      {
        path: 'pt/adicionar-borda-imagem',
        element: (
          <Suspense fallback={<PageLoader />}>
            <BorderExpander />
          </Suspense>
        ),
      },
      {
        path: 'pt/filtros-fotos',
        element: (
          <Suspense fallback={<PageLoader />}>
            <PhotoFilterStudio pageTitle="Filtros de Fotos Online Grátis" pageSubtitle="Aplique efeitos vintage, cyberpunk e duotone nas suas fotos no navegador." />
          </Suspense>
        ),
      },
      {
        path: 'pt/inverter-cores',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ColorInverter pageTitle="Inverter Cores de Imagem Online" pageSubtitle="Transforme fotos em negativo ou preto e branco de alto contraste 100% local." />
          </Suspense>
        ),
      },
      {
        path: 'pt/ajustar-imagem',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ImageAdjuster pageTitle="Ajustar Brilho e Contraste de Fotos" pageSubtitle="Ajuste iluminação, saturação e nitidez com visualização comparativa." />
          </Suspense>
        ),
      },
      {
        path: 'pt/gerador-memes',
        element: (
          <Suspense fallback={<PageLoader />}>
            <MemeGenerator pageTitle="Gerador de Memes Online Grátis" pageSubtitle="Crie memes personalizados e adicione textos com fontes e contornos no navegador." />
          </Suspense>
        ),
      },
      {
        path: 'pt/marca-dagua',
        element: (
          <Suspense fallback={<PageLoader />}>
            <WatermarkOverlay pageTitle="Colocar Marca d'Água em Fotos Online" pageSubtitle="Adicione textos, logotipos ou marcas repetidas em lote com download em ZIP." />
          </Suspense>
        ),
      },
      {
        path: 'pt/remover-metadados',
        element: (
          <Suspense fallback={<PageLoader />}>
            <MetadataStripper pageTitle="Ver e Remover Metadados EXIF Online" pageSubtitle="Inspecione configurações da câmera, GPS e limpe dados privados em local." />
          </Suspense>
        ),
      },
      {
        path: 'pt/arte-pixel',
        element: (
          <Suspense fallback={<PageLoader />}>
            <PixelArtGenerator pageTitle="Gerador de Pixel Art e 8-Bits Online" pageSubtitle="Transforme fotos em pixel art retrô com paletas Game Boy, NES e dithering." />
          </Suspense>
        ),
      },
      {
        path: 'pt/arte-ascii',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AsciiArtGenerator pageTitle="Gerador de Arte ASCII Online Grátis" pageSubtitle="Converta fotos em texto ASCII com temas Matrix, cores ANSI e exportação PNG." />
          </Suspense>
        ),
      },
      {
        path: 'pt/efeito-glitch',
        element: (
          <Suspense fallback={<PageLoader />}>
            <GlitchArtStudio pageTitle="Gerador de Efeito Glitch e Linhas CRT" pageSubtitle="Crie aberração cromática RGB, datamoshing e distorção retrô VHS no navegador." />
          </Suspense>
        ),
      },
      {
        path: 'pt/comparar-fotos',
        element: (
          <Suspense fallback={<PageLoader />}>
            <SideBySideCompare pageTitle="Comparar Fotos Lado a Lado e Antes/Depois" pageSubtitle="Junte duas fotos lado a lado com tags Antes/Depois e molduras personalizadas." />
          </Suspense>
        ),
      },
      {
        path: 'pt/panoramica-instagram',
        element: (
          <Suspense fallback={<PageLoader />}>
            <InstagramPanoramaSplitter pageTitle="Dividir Panorâmica para Carrossel Instagram" pageSubtitle="Crie posts contínuos no Instagram em formato 4:5 e quadrado com download ZIP." />
          </Suspense>
        ),
      },
      {
        path: 'pt/grade-fotos',
        element: (
          <Suspense fallback={<PageLoader />}>
            <CollageMaker pageTitle="Criar Grade e Colagem de Fotos Grátis" pageSubtitle="Combine fotos em grades personalizadas diretamente no navegador sem marcas." />
          </Suspense>
        ),
      },
      {
        path: 'pt/censurar-foto',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ImageRedactor pageTitle="Censurar Fotos e Desfocar Rostos Online" pageSubtitle="Oculte dados confidenciais, desfoque rostos e tampe informações privadas no navegador." />
          </Suspense>
        ),
      },
      {
        path: 'pt/esteganografia-imagem',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ImageSteganography pageTitle="Ocultar Texto Secreto em Fotos (Esteganografia)" pageSubtitle="Esconda notas secretas e senhas dentro de imagens com criptografia local." />
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
      {
        path: 'hi/photo-crop-kare',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ImageCropper pageTitle="Photo Crop Kare Online Free" pageSubtitle="फोटो को पासपोर्ट साइज, स्क्वायर (1:1) या 16:9 में फ्री में क्रॉप करें।" />
          </Suspense>
        ),
      },
      {
        path: 'hi/photo-rotate-kare',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ImageRotator />
          </Suspense>
        ),
      },
      {
        path: 'hi/border-lagaye',
        element: (
          <Suspense fallback={<PageLoader />}>
            <BorderExpander />
          </Suspense>
        ),
      },
      {
        path: 'hi/photo-filters',
        element: (
          <Suspense fallback={<PageLoader />}>
            <PhotoFilterStudio pageTitle="Photo Filters Online Free" pageSubtitle="फोटो में विंटेज, साइबरपंक और डुओटोन फिल्टर्स लगाएं 100% फ्री।" />
          </Suspense>
        ),
      },
      {
        path: 'hi/color-invert-kare',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ColorInverter pageTitle="Photo Color Invert & B&W Kare" pageSubtitle="फोटो को नेगेटिव में बदलें या हाई-कॉन्ट्रास्ट ब्लैक एंड व्हाइट बनाएं।" />
          </Suspense>
        ),
      },
      {
        path: 'hi/photo-brightness-contrast',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ImageAdjuster pageTitle="Photo Brightness & Contrast Adjust Kare" pageSubtitle="फोटो की ब्राइटनेस, कॉन्ट्रास्ट और कलर्स को रियल-टाइम में ठीक करें।" />
          </Suspense>
        ),
      },
      {
        path: 'hi/meme-generator',
        element: (
          <Suspense fallback={<PageLoader />}>
            <MemeGenerator pageTitle="Meme Generator & Photo Par Text Likhe" pageSubtitle="फोटो पर स्टाइलिश टेक्स्ट, मीम्स और आउटलाइन स्ट्रोक लगाएं फ्री में।" />
          </Suspense>
        ),
      },
      {
        path: 'hi/watermark-lagaye',
        element: (
          <Suspense fallback={<PageLoader />}>
            <WatermarkOverlay pageTitle="Photo Me Watermark Lagaye Online" pageSubtitle="एक साथ कई फोटो में अपना लोगो या टेक्स्ट वाटरमार्क लगाएं और ZIP डाउनलोड करें।" />
          </Suspense>
        ),
      },
      {
        path: 'hi/exif-metadata-hataye',
        element: (
          <Suspense fallback={<PageLoader />}>
            <MetadataStripper pageTitle="Photo Se EXIF Metadata & GPS Hataye" pageSubtitle="फोटो की लोकेशन और कैमरा सेटिंग्स देखें और पूरी तरह साफ करें।" />
          </Suspense>
        ),
      },
      {
        path: 'hi/pixel-art-generator',
        element: (
          <Suspense fallback={<PageLoader />}>
            <PixelArtGenerator pageTitle="Pixel Art & 8-Bit Photo Converter" pageSubtitle="फोटो को 8-बिट पिक्सेल आर्ट और रेट्रो गेम बॉय स्टाइल में बदलें फ्री में।" />
          </Suspense>
        ),
      },
      {
        path: 'hi/ascii-art-generator',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AsciiArtGenerator pageTitle="ASCII Art & Text Art Generator Hindi" pageSubtitle="फोटो को ASCII कैरेक्टर आर्ट में बदलें और 1-क्लिक में कॉपी या PNG सेव करें।" />
          </Suspense>
        ),
      },
      {
        path: 'hi/glitch-art-studio',
        element: (
          <Suspense fallback={<PageLoader />}>
            <GlitchArtStudio pageTitle="Glitch Art & CRT TV Effect Generator" pageSubtitle="फोटो में RGB क्रोमैटिक एबरेशन, स्कैनलाइन्स और रेट्रो ग्लिच इफेक्ट लगाएं।" />
          </Suspense>
        ),
      },
      {
        path: 'hi/photo-compare-kare',
        element: (
          <Suspense fallback={<PageLoader />}>
            <SideBySideCompare pageTitle="Photo Compare Kare & Before After Combiner" pageSubtitle="दो फोटो को एक साथ साइड-बाय-साइड जोड़ें बिफोर/आफ्टर टैग के साथ।" />
          </Suspense>
        ),
      },
      {
        path: 'hi/instagram-panorama-splitter',
        element: (
          <Suspense fallback={<PageLoader />}>
            <InstagramPanoramaSplitter pageTitle="Instagram Panorama Splitter & Swipe Carousel" pageSubtitle="पैनोरमा फोटो को इंस्टाग्राम स्वाइप कैरोसेल में काटें और ZIP डाउनलोड करें।" />
          </Suspense>
        ),
      },
      {
        path: 'hi/photo-grid-maker',
        element: (
          <Suspense fallback={<PageLoader />}>
            <CollageMaker pageTitle="Photo Grid & Collage Maker Hindi" pageSubtitle="कई फोटो को एक साथ सुंदर ग्रिड और कोलाज में जोड़ें फ्री में।" />
          </Suspense>
        ),
      },
      {
        path: 'hi/photo-censor-kare',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ImageRedactor pageTitle="Photo Censor & Face Blur Kare Online" pageSubtitle="फोटो में प्राइवेट डेटा, आधार कार्ड और चेहरों को ब्लर या ब्लैकआउट करें।" />
          </Suspense>
        ),
      },
      {
        path: 'hi/image-steganography',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ImageSteganography pageTitle="Photo Me Secret Text Chupaye (Steganography)" pageSubtitle="फोटो के अंदर सीक्रेट मैसेज और पासवर्ड छिपाएं 100% सेफ और प्राइवेट।" />
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
      {
        path: 'fr/recadrer-image',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ImageCropper pageTitle="Recadrer une Image en Ligne Gratuit" pageSubtitle="Recadrez vos photos aux ratios personnalisés ou passeport en local dans votre navigateur." />
          </Suspense>
        ),
      },
      {
        path: 'fr/pivoter-image',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ImageRotator />
          </Suspense>
        ),
      },
      {
        path: 'fr/ajouter-bordure-image',
        element: (
          <Suspense fallback={<PageLoader />}>
            <BorderExpander />
          </Suspense>
        ),
      },
      {
        path: 'fr/filtres-photos',
        element: (
          <Suspense fallback={<PageLoader />}>
            <PhotoFilterStudio pageTitle="Filtres Photos en Ligne Gratuit" pageSubtitle="Appliquez des filtres vintage, cyberpunk et des effets bicolores duotone." />
          </Suspense>
        ),
      },
      {
        path: 'fr/inverser-couleurs',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ColorInverter pageTitle="Inverser les Couleurs d'une Image" pageSubtitle="Convertissez vos photos en négatif ou en noir et blanc contrasté en local." />
          </Suspense>
        ),
      },
      {
        path: 'fr/ajuster-image',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ImageAdjuster pageTitle="Ajuster Luminosité et Contraste Photo" pageSubtitle="Ajustez l'exposition, les couleurs et la netteté avec comparaison instantanée." />
          </Suspense>
        ),
      },
      {
        path: 'fr/generateur-memes',
        element: (
          <Suspense fallback={<PageLoader />}>
            <MemeGenerator pageTitle="Générateur de Mèmes en Ligne Gratuit" pageSubtitle="Créez des mèmes personnalisés et ajoutez du texte avec contours et polices." />
          </Suspense>
        ),
      },
      {
        path: 'fr/filigrane-image',
        element: (
          <Suspense fallback={<PageLoader />}>
            <WatermarkOverlay pageTitle="Ajouter un Filigrane sur une Image" pageSubtitle="Ajoutez texte, logos ou filigranes répétés par lots avec téléchargement ZIP." />
          </Suspense>
        ),
      },
      {
        path: 'fr/supprimer-metadonnees',
        element: (
          <Suspense fallback={<PageLoader />}>
            <MetadataStripper pageTitle="Afficher et Supprimer Métadonnées EXIF" pageSubtitle="Inspectez réglages de l'appareil, GPS et effacez les données privées en local." />
          </Suspense>
        ),
      },
      {
        path: 'fr/pixel-art',
        element: (
          <Suspense fallback={<PageLoader />}>
            <PixelArtGenerator pageTitle="Générateur de Pixel Art et 8-Bits en Ligne" pageSubtitle="Transformez vos photos en pixel art rétro avec palettes Game Boy et tramage Floyd-Steinberg." />
          </Suspense>
        ),
      },
      {
        path: 'fr/art-ascii',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AsciiArtGenerator pageTitle="Générateur d'Art ASCII en Ligne Gratuit" pageSubtitle="Convertissez vos photos en texte ASCII avec thèmes Matrix vert et export PNG." />
          </Suspense>
        ),
      },
      {
        path: 'fr/effet-glitch',
        element: (
          <Suspense fallback={<PageLoader />}>
            <GlitchArtStudio pageTitle="Générateur d'Effet Glitch et Lignes CRT" pageSubtitle="Créez aberration chromatique RGB, datamoshing et distorsion rétro VHS dans votre navigateur." />
          </Suspense>
        ),
      },
      {
        path: 'fr/comparer-photos',
        element: (
          <Suspense fallback={<PageLoader />}>
            <SideBySideCompare pageTitle="Comparer Deux Photos Côte à Côte" pageSubtitle="Combinez deux photos côte à côte ou avant/après avec étiquettes personnalisées." />
          </Suspense>
        ),
      },
      {
        path: 'fr/panorama-instagram',
        element: (
          <Suspense fallback={<PageLoader />}>
            <InstagramPanoramaSplitter pageTitle="Découper Panorama pour Carrousel Instagram" pageSubtitle="Créez des carrousels continus en 4:5 et carré avec téléchargement ZIP." />
          </Suspense>
        ),
      },
      {
        path: 'fr/grille-photos',
        element: (
          <Suspense fallback={<PageLoader />}>
            <CollageMaker pageTitle="Créer une Grille et Collage Photo Gratuit" pageSubtitle="Assemblez plusieurs images en grilles personnalisées sans filigrane." />
          </Suspense>
        ),
      },
      {
        path: 'fr/censurer-photo',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ImageRedactor pageTitle="Censurer des Photos et Flouter Visages" pageSubtitle="Masquez informations sensibles, floutez visages et caviardez documents en local." />
          </Suspense>
        ),
      },
      {
        path: 'fr/steganographie-image',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ImageSteganography pageTitle="Cacher Texte Secret dans une Image" pageSubtitle="Dissimulez des messages secrets et mots de passe dans des images en toute sécurité." />
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
      {
        path: 'de/bild-zuschneiden',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ImageCropper pageTitle="Bilder Online Zuschneiden" pageSubtitle="Schneiden Sie Fotos in individuellen Seitenverhältnissen oder Passfoto-Größen lokal zu." />
          </Suspense>
        ),
      },
      {
        path: 'de/bild-drehen',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ImageRotator />
          </Suspense>
        ),
      },
      {
        path: 'de/rahmen-hinzufuegen',
        element: (
          <Suspense fallback={<PageLoader />}>
            <BorderExpander />
          </Suspense>
        ),
      },
      {
        path: 'de/fotofilter',
        element: (
          <Suspense fallback={<PageLoader />}>
            <PhotoFilterStudio pageTitle="Fotofilter Online Kostenlos" pageSubtitle="Wenden Sie Vintage-, Cyberpunk- und Duotone-Effekte direkt im Browser an." />
          </Suspense>
        ),
      },
      {
        path: 'de/farben-invertieren',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ColorInverter pageTitle="Farben Invertieren & Schwarz-Weiß" pageSubtitle="Konvertieren Sie Fotos in Negative oder kontrastreiches Schwarz-Weiß." />
          </Suspense>
        ),
      },
      {
        path: 'de/bild-anpassen',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ImageAdjuster pageTitle="Helligkeit & Kontrast Anpassen" pageSubtitle="Optimieren Sie Belichtung, Sättigung und Schärfe mit Vorher-Nachher-Vergleich." />
          </Suspense>
        ),
      },
      {
        path: 'de/meme-generator',
        element: (
          <Suspense fallback={<PageLoader />}>
            <MemeGenerator pageTitle="Meme Generator & Text auf Bild" pageSubtitle="Erstellen Sie Memes und fügen Sie Texte mit Konturen und Schriftarten lokal hinzu." />
          </Suspense>
        ),
      },
      {
        path: 'de/wasserzeichen-hinzufuegen',
        element: (
          <Suspense fallback={<PageLoader />}>
            <WatermarkOverlay pageTitle="Wasserzeichen zu Bildern Hinzufügen" pageSubtitle="Fügen Sie Text, Logos oder gekachelte Wasserzeichen im Stapel mit ZIP-Export hinzu." />
          </Suspense>
        ),
      },
      {
        path: 'de/metadaten-entfernen',
        element: (
          <Suspense fallback={<PageLoader />}>
            <MetadataStripper pageTitle="EXIF-Daten Anzeigen & Löschen" pageSubtitle="Inspizieren Sie Kameraeinstellungen, GPS und bereinigen Sie sensible Daten lokal." />
          </Suspense>
        ),
      },
      {
        path: 'de/pixel-art-generator',
        element: (
          <Suspense fallback={<PageLoader />}>
            <PixelArtGenerator pageTitle="Pixel Art & 8-Bit Bildkonverter Online" pageSubtitle="Verwandeln Sie Fotos in 8-Bit Retro Pixel-Art mit Game Boy Farbpaletten und Dithering." />
          </Suspense>
        ),
      },
      {
        path: 'de/ascii-art-generator',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AsciiArtGenerator pageTitle="ASCII Art Generator Online Kostenlos" pageSubtitle="Konvertieren Sie Fotos in ASCII-Textkunst mit Matrix-Grün-Themes und PNG-Export." />
          </Suspense>
        ),
      },
      {
        path: 'de/glitch-effekt',
        element: (
          <Suspense fallback={<PageLoader />}>
            <GlitchArtStudio pageTitle="Glitch Art & CRT Scanline Generator" pageSubtitle="Erzeugen Sie RGB Farbverschiebung, Datamoshing und VHS Retro-Verzerrung im Browser." />
          </Suspense>
        ),
      },
      {
        path: 'de/bilder-vergleichen',
        element: (
          <Suspense fallback={<PageLoader />}>
            <SideBySideCompare pageTitle="Bilder Nebeneinander Vergleichen (Vorher/Nachher)" pageSubtitle="Fügen Sie zwei Bilder nebeneinander mit Vorher/Nachher-Badges und Rahmen zusammen." />
          </Suspense>
        ),
      },
      {
        path: 'de/instagram-panorama-teiler',
        element: (
          <Suspense fallback={<PageLoader />}>
            <InstagramPanoramaSplitter pageTitle="Panorama für Instagram Karussell Teilen" pageSubtitle="Erstellen Sie nahtlose Wisch-Karussells in 4:5 Porträt mit ZIP-Download." />
          </Suspense>
        ),
      },
      {
        path: 'de/fotogitter-erstellen',
        element: (
          <Suspense fallback={<PageLoader />}>
            <CollageMaker pageTitle="Fotogitter & Collage Erstellen Online Kostenlos" pageSubtitle="Kombinieren Sie mehrere Fotos in individuelle Raster lokal ohne Wasserzeichen." />
          </Suspense>
        ),
      },
      {
        path: 'de/bild-zensieren',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ImageRedactor pageTitle="Bilder Zensieren & Gesichter Verpixeln" pageSubtitle="Schwärzen Sie vertrauliche Daten, verpixeln Sie Gesichter und zensieren Sie Dokumente lokal." />
          </Suspense>
        ),
      },
      {
        path: 'de/bild-steganographie',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ImageSteganography pageTitle="Geheime Texte in Bildern Verstecken (Steganographie)" pageSubtitle="Verstecken Sie Passwörter und private Nachrichten unsichtbar in Bilddateien." />
          </Suspense>
        ),
      },
    ],
  },
]);
