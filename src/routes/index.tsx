import React, { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '../layouts/Layout';
import { RefreshCw } from 'lucide-react';

// Lazy load page components for code splitting
const Home = lazy(() => import('../pages/Home').then(module => ({ default: module.Home })));
const Compressor = lazy(() => import('../pages/Compressor').then(module => ({ default: module.Compressor })));
const BackgroundRemover = lazy(() => import('../pages/BackgroundRemover').then(module => ({ default: module.BackgroundRemover })));
const OcrExtractor = lazy(() => import('../pages/OcrExtractor').then(module => ({ default: module.OcrExtractor })));
const GridSplitter = lazy(() => import('../pages/GridSplitter').then(module => ({ default: module.GridSplitter })));
const CollageMaker = lazy(() => import('../pages/CollageMaker').then(module => ({ default: module.CollageMaker })));
const PaletteExtractor = lazy(() => import('../pages/PaletteExtractor').then(module => ({ default: module.PaletteExtractor })));
const BatchConverter = lazy(() => import('../pages/BatchConverter').then(module => ({ default: module.BatchConverter })));
const MetadataStripper = lazy(() => import('../pages/MetadataStripper').then(module => ({ default: module.MetadataStripper })));
const WatermarkOverlay = lazy(() => import('../pages/WatermarkOverlay').then(module => ({ default: module.WatermarkOverlay })));
const AspectResizer = lazy(() => import('../pages/AspectResizer').then(module => ({ default: module.AspectResizer })));
const MemeGenerator = lazy(() => import('../pages/MemeGenerator').then(module => ({ default: module.MemeGenerator })));
const SvgVectorizer = lazy(() => import('../pages/SvgVectorizer').then(module => ({ default: module.SvgVectorizer })));
const MosaicGenerator = lazy(() => import('../pages/MosaicGenerator').then(module => ({ default: module.MosaicGenerator })));
const About = lazy(() => import('../pages/About').then(module => ({ default: module.About })));
const Privacy = lazy(() => import('../pages/Privacy').then(module => ({ default: module.Privacy })));
const Contact = lazy(() => import('../pages/Contact').then(module => ({ default: module.Contact })));
const Faq = lazy(() => import('../pages/Faq').then(module => ({ default: module.Faq })));

// Loading Spinner for lazy-loading suspense fallback
const PageLoader: React.FC = () => (
  <div className="w-full min-h-[50vh] flex flex-col items-center justify-center gap-3">
    <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
    <span className="text-xs font-semibold text-slate-400">Loading modules...</span>
  </div>
);

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
        path: 'background-remover',
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
    ],
  },
]);
