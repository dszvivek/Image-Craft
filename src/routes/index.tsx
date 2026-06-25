import React, { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '../layouts/Layout';

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
const StatementAnalyzer = lazy(() => import('../pages/StatementAnalyzer').then(module => ({ default: module.StatementAnalyzer })));
const About = lazy(() => import('../pages/About').then(module => ({ default: module.About })));
const Privacy = lazy(() => import('../pages/Privacy').then(module => ({ default: module.Privacy })));
const Contact = lazy(() => import('../pages/Contact').then(module => ({ default: module.Contact })));
const Faq = lazy(() => import('../pages/Faq').then(module => ({ default: module.Faq })));

// Skeleton Loader — mirrors tool page structure to maintain visual layout during lazy loading
const PageLoader: React.FC = () => (
  <div className="w-full animate-pulse">
    {/* Header skeleton */}
    <div className="text-center mb-8 space-y-3">
      <div className="h-5 w-20 bg-slate-200 rounded-full mx-auto" />
      <div className="h-9 w-72 bg-slate-200 rounded-xl mx-auto" />
      <div className="h-4 w-56 bg-slate-200 rounded-lg mx-auto" />
    </div>
    {/* Content skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
      <div className="md:col-span-7 space-y-3">
        <div className="h-52 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200" />
      </div>
      <div className="md:col-span-5 space-y-3">
        <div className="h-52 bg-slate-100 rounded-2xl" />
      </div>
    </div>
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
        path: 'bank-statement-analyzer',
        element: (
          <Suspense fallback={<PageLoader />}>
            <StatementAnalyzer />
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
