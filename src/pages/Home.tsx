import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Cpu, 
  Zap, 
  Image as ImageIcon, 
  Maximize2, 
  LayoutGrid, 
  Palette, 
  FileText, 
  Lock,
  ArrowRight,
  Files,
  Fingerprint,
  Copyright,
  Crop,
  Smile,
  Feather,
  Grid,
  Check
} from 'lucide-react';
import { SEO } from '../components/SEO';

import compressorImg from '../assets/compressor_feature.gif';
import bgRemoverImg from '../assets/bg_remover_feature.gif';
import ocrExtractorImg from '../assets/ocr_extractor_feature.gif';
import gridSplitterImg from '../assets/grid_splitter_feature.gif';
import collageMakerImg from '../assets/collage_maker_feature.gif';
import paletteExtractorImg from '../assets/palette_extractor_feature.gif';
import batchConverterImg from '../assets/batch_converter_feature.gif';
import metadataStripperImg from '../assets/metadata_stripper_feature.gif';
import watermarkOverlayImg from '../assets/watermark_overlay_feature.gif';
import aspectResizerImg from '../assets/aspect_resizer_feature.gif';
import memeGeneratorImg from '../assets/meme_generator_feature.gif';
import svgVectorizerImg from '../assets/svg_vectorizer_feature.gif';
import mosaicImg from '../assets/mosaic_feature.gif';

export const Home: React.FC = () => {
  return (
    <div className="w-full relative">
      <SEO 
        title="Free Privacy-First Image Tools" 
        description="Free browser-based image tools suite: compress images, remove backgrounds with AI, scan text (OCR), split Instagram grids, make collages, extract color palettes, convert batch images, strip EXIF metadata, add watermarks, resize for social media, generate memes, vectorize to SVG, and create photo mosaics. 100% offline, zero uploads." 
        keywords="free image tools, image compressor, AI background remover, OCR text extractor, Instagram grid splitter, photo collage maker, color palette extractor, batch image converter, EXIF metadata stripper, watermark tool, aspect ratio resizer, meme generator, SVG vectorizer, photo mosaic generator, online image editor, browser image tools, privacy image editor, no upload image tool, free photo editor online"
        canonicalUrl="https://imagegiri.com/"
      />

      {/* Decorative Blur Backdrops */}
      <div className="absolute top-0 inset-x-0 h-[600px] bg-dot-grid opacity-60 pointer-events-none -z-10" />
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[70%] h-[350px] bg-gradient-to-tr from-indigo-500/10 via-purple-500/8 to-pink-500/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse-slow" />

      {/* Hero Section */}
      <section className="text-center pt-16 pb-12 md:pt-24 md:pb-20 flex flex-col items-center justify-center relative overflow-hidden">
        
        {/* Anti-Cloud Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200/80 rounded-full text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-6 shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
          <span>100% On-Device & Offline-Ready</span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 max-w-4xl leading-[1.08]">
          Craft Perfect Images. <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-650 via-purple-650 to-pink-550 font-black">
            Zero Server Uploads.
          </span>
        </h1>

        {/* Description */}
        <p className="text-sm md:text-base lg:text-lg text-slate-500 max-w-2xl mb-10 leading-relaxed font-medium">
          A premium suite of image and layout tools executing directly inside your browser cache.
          Get instant transformations with absolute privacy.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a 
            href="#tools-grid" 
            className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-650 hover:from-indigo-550 hover:to-purple-550 text-[11px] font-bold uppercase tracking-wider text-white rounded-xl shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-98 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            Explore Free Tools
          </a>
          <Link 
            to="/privacy" 
            className="px-8 py-3.5 bg-white hover:bg-slate-50 border border-slate-200/60 text-[11px] font-bold uppercase tracking-wider text-slate-700 hover:text-slate-900 rounded-xl transition-all shadow-xs"
          >
            How it works
          </Link>
        </div>

      </section>

      {/* Bento Cards: Core Value Propositions */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 max-w-6xl mx-auto">
        
        {/* Prop 1 */}
        <div className="premium-bento p-6 rounded-3xl bg-white border border-slate-200/50 flex flex-col justify-between gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800 tracking-tight mb-1">Local Sandbox Processing</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Files reside strictly within browser memory space. Web Workers execute all processing scripts locally without cloud transmission.
            </p>
          </div>
        </div>

        {/* Prop 2 */}
        <div className="premium-bento p-6 rounded-3xl bg-white border border-slate-200/50 flex flex-col justify-between gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800 tracking-tight mb-1">Transformers.js AI Cutout</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Run neural network subject segmentation using WebAssembly. Leverage your CPU/GPU hardware capabilities locally.
            </p>
          </div>
        </div>

        {/* Prop 3 */}
        <div className="premium-bento p-6 rounded-3xl bg-white border border-slate-200/50 flex flex-col justify-between gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800 tracking-tight mb-1">Zero Latency Operations</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Eliminate massive file upload bottlenecks. Batch split, extract colors, or extract text locally with instant downloads.
            </p>
          </div>
        </div>

      </section>

      {/* Tools Directory Section: Large Alternating Showcases */}
      <section id="tools-grid" className="py-16 border-t border-slate-200/60 mt-12 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold text-indigo-650 bg-indigo-50/50 px-2.5 py-1 rounded-full border border-indigo-100 uppercase tracking-widest">
            Module Catalog
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mt-3 mb-3">
            Our Local Image Tools
          </h2>
          <p className="text-xs md:text-sm text-slate-500 max-w-md mx-auto">
            Click on any module to run high-performance image transformations directly inside your browser cache.
          </p>
        </div>

        <div className="space-y-24">
          {/* 1. AI Background Remover */}
          <div className="flex flex-col md:flex-row-reverse gap-12 items-center justify-between group">
            <div className="flex-1 space-y-5 text-left">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-purple-50 rounded-2xl flex items-center justify-center border border-purple-100 text-purple-650 group-hover:scale-105 transition-transform duration-200 shadow-sm">
                  <Cpu className="w-5.5 h-5.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-purple-650 uppercase tracking-wider bg-purple-50/40 border border-purple-100/60 px-2 py-0.5 rounded font-bold">AI Segmenting</span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-1 group-hover:text-purple-650 transition-colors">AI Background Remover</h3>
                </div>
              </div>
              <p className="text-xs md:text-sm text-slate-550 leading-relaxed font-medium">
                Remove image backdrops automatically. Powered by neural networks compiling directly in your browser's IndexedDB models cache.
              </p>
              <ul className="space-y-2 text-xs font-semibold text-slate-655">
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Neural subject segmentation (RMBG-1.4)</span></li>
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>No files transferred to cloud servers</span></li>
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Instant transparent alpha download</span></li>
              </ul>
              <Link 
                to="/background-remover" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider transition shadow-md shadow-purple-500/10 active:scale-98"
              >
                Launch AI Cutout
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <Link to="/background-remover" className="flex-1 w-full max-w-[460px] bg-slate-50 border border-slate-200/50 rounded-3xl overflow-hidden aspect-[4/3] relative select-none shadow-sm group-hover:scale-[1.02] group-hover:border-purple-400/80 group-hover:shadow-[0_12px_40px_rgba(167,139,250,0.15)] transition-all duration-300 block cursor-pointer">
              <img src={bgRemoverImg} alt="AI Background Remover Demo" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-purple-950/0 group-hover:bg-purple-950/40 transition-all duration-300 flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-purple-700 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-xl">
                  Open Tool <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          </div>

          {/* 2. Photo Mosaic Generator */}
          <div className="flex flex-col md:flex-row gap-12 items-center justify-between group">
            <div className="flex-1 space-y-5 text-left">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-fuchsia-50 rounded-2xl flex items-center justify-center border border-fuchsia-100 text-fuchsia-650 group-hover:scale-105 transition-transform duration-200 shadow-sm">
                  <Grid className="w-5.5 h-5.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-fuchsia-650 uppercase tracking-wider bg-fuchsia-50/40 border border-fuchsia-100/60 px-2 py-0.5 rounded font-bold">Artistic Compositions</span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-1 group-hover:text-fuchsia-650 transition-colors">Photo Mosaic Generator</h3>
                </div>
              </div>
              <p className="text-xs md:text-sm text-slate-555 leading-relaxed font-medium">
                Reconstruct target images from thousands of small photo tiles client-side. Live overlay density controls, color tinting scales, and zero server-side storage footprint.
              </p>
              <ul className="space-y-2 text-xs font-semibold text-slate-655">
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Advanced color-distance Euclidean search</span></li>
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Adjustable target transparency & tint sliders</span></li>
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Dynamic 16-color placeholder tiles fallback</span></li>
              </ul>
              <Link 
                to="/photo-mosaic-generator" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider transition shadow-md shadow-fuchsia-500/10 active:scale-98"
              >
                Launch Mosaic Engine
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <Link to="/photo-mosaic-generator" className="flex-1 w-full max-w-[460px] bg-slate-50 border border-slate-200/50 rounded-3xl overflow-hidden aspect-[4/3] relative select-none shadow-sm group-hover:scale-[1.02] group-hover:border-fuchsia-400/80 group-hover:shadow-[0_12px_40px_rgba(217,70,239,0.15)] transition-all duration-300 block cursor-pointer">
              <img src={mosaicImg} alt="Photo Mosaic Generator Demo" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-fuchsia-950/0 group-hover:bg-fuchsia-950/40 transition-all duration-300 flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-fuchsia-700 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-xl">
                  Open Tool <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          </div>

        </div>

          {/* 3. Aspect Resizer & Smart Crop */}
          <div className="flex flex-col md:flex-row-reverse gap-12 items-center justify-between group">
            <div className="flex-1 space-y-5 text-left">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100 text-amber-650 group-hover:scale-105 transition-transform duration-200 shadow-sm">
                  <Crop className="w-5.5 h-5.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-650 uppercase tracking-wider bg-amber-50/40 border border-amber-100/60 px-2 py-0.5 rounded font-bold">Social Dimensions</span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-1 group-hover:text-amber-650 transition-colors">Aspect Resizer & Smart Crop</h3>
                </div>
              </div>
              <p className="text-xs md:text-sm text-slate-555 leading-relaxed font-medium">
                Refit your images to standard social templates or crop them manually. Use our new interactive Smart Crop overlay with handles and aspect lock grid.
              </p>
              <ul className="space-y-2 text-xs font-semibold text-slate-655">
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Manual interactive Smart Crop overlays</span></li>
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>High-end blur padding fit</span></li>
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Instant canvas resizing control</span></li>
              </ul>
              <Link 
                to="/aspect-resizer" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider transition shadow-md shadow-amber-500/10 active:scale-98"
              >
                Launch Aspect Resizer
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <Link to="/aspect-resizer" className="flex-1 w-full max-w-[460px] bg-slate-50 border border-slate-200/50 rounded-3xl overflow-hidden aspect-[4/3] relative select-none shadow-sm group-hover:scale-[1.02] group-hover:border-amber-400/80 group-hover:shadow-[0_12px_40px_rgba(217,119,6,0.15)] transition-all duration-300 block cursor-pointer">
              <img src={aspectResizerImg} alt="Aspect Ratio Resizer Demo" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-amber-950/0 group-hover:bg-amber-950/40 transition-all duration-300 flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-amber-700 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-xl">
                  Open Tool <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          </div>

          {/* 4. SVG Vectorizer */}
          <div className="flex flex-col md:flex-row-reverse gap-12 items-center justify-between group">
            <div className="flex-1 space-y-5 text-left">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-teal-50 rounded-2xl flex items-center justify-center border border-teal-100 text-teal-650 group-hover:scale-105 transition-transform duration-200 shadow-sm">
                  <Feather className="w-5.5 h-5.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-teal-650 uppercase tracking-wider bg-teal-50/40 border border-teal-100/60 px-2 py-0.5 rounded font-bold">Vector Conversion</span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-1 group-hover:text-teal-650 transition-colors">SVG Vectorizer</h3>
                </div>
              </div>
              <p className="text-xs md:text-sm text-slate-555 leading-relaxed font-medium">
                Trace raster JPEGs and PNGs into fully scalable vector SVGs. Adjust color palette counts, path smoothing, and speckle noise filters offline.
              </p>
              <ul className="space-y-2 text-xs font-semibold text-slate-655">
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>K-Means++ color quantization</span></li>
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Moore-Neighbor boundary tracer</span></li>
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Douglas-Peucker path simplification</span></li>
              </ul>
              <Link 
                to="/svg-vectorizer" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider transition shadow-md shadow-teal-500/10 active:scale-98"
              >
                Launch SVG Vectorizer
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <Link to="/svg-vectorizer" className="flex-1 w-full max-w-[460px] bg-slate-50 border border-slate-200/50 rounded-3xl overflow-hidden aspect-[4/3] relative select-none shadow-sm group-hover:scale-[1.02] group-hover:border-teal-400/80 group-hover:shadow-[0_12px_40px_rgba(13,148,136,0.15)] transition-all duration-300 block cursor-pointer">
              <img src={svgVectorizerImg} alt="SVG Vectorizer Demo" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-teal-950/0 group-hover:bg-teal-950/40 transition-all duration-300 flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-teal-700 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-xl">
                  Open Tool <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          </div>

          {/* 5. OCR Text Extractor */}
          <div className="flex flex-col md:flex-row gap-12 items-center justify-between group">
            <div className="flex-1 space-y-5 text-left">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 text-emerald-650 group-hover:scale-105 transition-transform duration-200 shadow-sm">
                  <FileText className="w-5.5 h-5.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-650 uppercase tracking-wider bg-emerald-50/40 border border-emerald-100/60 px-2 py-0.5 rounded font-bold">Document Scan</span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-1 group-hover:text-emerald-650 transition-colors">OCR Text Extractor</h3>
                </div>
              </div>
              <p className="text-xs md:text-sm text-slate-555 leading-relaxed font-medium">
                Scan screenshots, receipts, or documents and pull texts immediately. Supports multi-language packages compiled under local sandboxes.
              </p>
              <ul className="space-y-2 text-xs font-semibold text-slate-655">
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Local scan engines using Tesseract.js</span></li>
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Bounding boxes scan progress visual</span></li>
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Multi-language libraries</span></li>
              </ul>
              <Link 
                to="/ocr-text-extractor" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider transition shadow-md shadow-emerald-500/10 active:scale-98"
              >
                Launch OCR Extractor
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <Link to="/ocr-text-extractor" className="flex-1 w-full max-w-[460px] bg-slate-50 border border-slate-200/50 rounded-3xl overflow-hidden aspect-[4/3] relative select-none shadow-sm group-hover:scale-[1.02] group-hover:border-emerald-400/80 group-hover:shadow-[0_12px_40px_rgba(16,185,129,0.15)] transition-all duration-300 block cursor-pointer">
              <img src={ocrExtractorImg} alt="OCR Text Extractor Demo" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-emerald-950/0 group-hover:bg-emerald-950/40 transition-all duration-300 flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-700 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-xl">
                  Open Tool <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          </div>

          {/* 6. Image Compressor */}
          <div className="flex flex-col md:flex-row gap-12 items-center justify-between group">
            <div className="flex-1 space-y-5 text-left">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 text-indigo-650 group-hover:scale-105 transition-transform duration-200 shadow-sm">
                  <ImageIcon className="w-5.5 h-5.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-indigo-650 uppercase tracking-wider bg-indigo-50/40 border border-indigo-100/60 px-2 py-0.5 rounded font-bold">Core Optimization</span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-1 group-hover:text-indigo-650 transition-colors">Image Compressor</h3>
                </div>
              </div>
              <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-medium">
                Optimize your JPEGs, PNGs, and WebPs in seconds. Control quality levels and convert formats offline without losing pixel fidelity.
              </p>
              <ul className="space-y-2 text-xs font-semibold text-slate-655">
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Save up to 90% in bundle sizes</span></li>
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Direct side-by-side comparison slider</span></li>
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Bulk offline conversion engine</span></li>
              </ul>
              <Link 
                to="/image-compressor" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider transition shadow-md shadow-indigo-500/10 active:scale-98"
              >
                Launch Compressor
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <Link to="/image-compressor" className="flex-1 w-full max-w-[460px] bg-slate-50 border border-slate-200/50 rounded-3xl overflow-hidden aspect-[4/3] relative select-none shadow-sm group-hover:scale-[1.02] group-hover:border-indigo-400/80 group-hover:shadow-[0_12px_40px_rgba(99,102,241,0.15)] transition-all duration-300 block cursor-pointer">
              <img src={compressorImg} alt="Compressor Demo" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-indigo-950/0 group-hover:bg-indigo-950/40 transition-all duration-300 flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-xl">
                  Open Tool <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          </div>

          {/* 7. Batch Image Converter */}
          <div className="flex flex-col md:flex-row gap-12 items-center justify-between group">
            <div className="flex-1 space-y-5 text-left">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 text-indigo-655 group-hover:scale-105 transition-transform duration-200 shadow-sm">
                  <Files className="w-5.5 h-5.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-indigo-650 uppercase tracking-wider bg-indigo-50/40 border border-indigo-100/60 px-2 py-0.5 rounded font-bold">Bulk Operation</span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-1 group-hover:text-indigo-650 transition-colors">Batch Image Converter</h3>
                </div>
              </div>
              <p className="text-xs md:text-sm text-slate-555 leading-relaxed font-medium">
                Convert multiple JPEGs, PNGs, or WebPs in one go. Package your images into a single multi-page PDF booklet or a ZIP archive locally.
              </p>
              <ul className="space-y-2 text-xs font-semibold text-slate-655">
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Multi-file bulk processing</span></li>
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Custom PDF package scaling</span></li>
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Instant JSZip downloader</span></li>
              </ul>
              <Link 
                to="/batch-converter" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider transition shadow-md shadow-indigo-500/10 active:scale-98"
              >
                Launch Batch Converter
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <Link to="/batch-converter" className="flex-1 w-full max-w-[460px] bg-slate-50 border border-slate-200/50 rounded-3xl overflow-hidden aspect-[4/3] relative select-none shadow-sm group-hover:scale-[1.02] group-hover:border-indigo-400/80 group-hover:shadow-[0_12px_40px_rgba(99,102,241,0.15)] transition-all duration-300 block cursor-pointer">
              <img src={batchConverterImg} alt="Batch Converter Demo" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-indigo-950/0 group-hover:bg-indigo-950/40 transition-all duration-300 flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-xl">
                  Open Tool <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          </div>

          {/* 8. Photo Collage Maker */}
          <div className="flex flex-col md:flex-row gap-12 items-center justify-between group">
            <div className="flex-1 space-y-5 text-left">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-pink-50 rounded-2xl flex items-center justify-center border border-pink-100 text-pink-650 group-hover:scale-105 transition-transform duration-200 shadow-sm">
                  <LayoutGrid className="w-5.5 h-5.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-pink-650 uppercase tracking-wider bg-pink-50/40 border border-pink-100/60 px-2 py-0.5 rounded font-bold">Canvas Assembly</span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-1 group-hover:text-pink-650 transition-colors">Collage Maker</h3>
                </div>
              </div>
              <p className="text-xs md:text-sm text-slate-555 leading-relaxed font-medium">
                Combine your favorite shots in customizable templates. Drag files, adjust layout gaps, borders, and canvas colors live in-browser.
              </p>
              <ul className="space-y-2 text-xs font-semibold text-slate-655">
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Responsive template grids</span></li>
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Editable margin gaps and border curves</span></li>
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Single-click high quality canvas download</span></li>
              </ul>
              <Link 
                to="/collage-maker" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider transition shadow-md shadow-pink-500/10 active:scale-98"
              >
                Launch Collage Maker
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <Link to="/collage-maker" className="flex-1 w-full max-w-[460px] bg-slate-50 border border-slate-200/50 rounded-3xl overflow-hidden aspect-[4/3] relative select-none shadow-sm group-hover:scale-[1.02] group-hover:border-pink-400/80 group-hover:shadow-[0_12px_40px_rgba(236,72,153,0.15)] transition-all duration-300 block cursor-pointer">
              <img src={collageMakerImg} alt="Photo Collage Maker Demo" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-pink-950/0 group-hover:bg-pink-950/40 transition-all duration-300 flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-pink-700 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-xl">
                  Open Tool <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          </div>

          {/* 9. Color Palette Extractor */}
          <div className="flex flex-col md:flex-row-reverse gap-12 items-center justify-between group">
            <div className="flex-1 space-y-5 text-left">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-cyan-50 rounded-2xl flex items-center justify-center border border-cyan-100 text-cyan-650 group-hover:scale-105 transition-transform duration-200 shadow-sm">
                  <Palette className="w-5.5 h-5.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-cyan-650 uppercase tracking-wider bg-cyan-50/40 border border-cyan-100/60 px-2 py-0.5 rounded font-bold">Colors Spec</span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-1 group-hover:text-cyan-650 transition-colors">Palette Extractor</h3>
                </div>
              </div>
              <p className="text-xs md:text-sm text-slate-555 leading-relaxed font-medium">
                Retrieve dominant colors and copy accent swatches inline. Generates custom code blocks compatible with Tailwind CSS configs and standard styles.
              </p>
              <ul className="space-y-2 text-xs font-semibold text-slate-655">
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Advanced color quantization math</span></li>
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Single click HEX codes copy</span></li>
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Tailwind palette config blocks output</span></li>
              </ul>
              <Link 
                to="/color-palette-extractor" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider transition shadow-md shadow-cyan-500/10 active:scale-98"
              >
                Launch Palette Extractor
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <Link to="/color-palette-extractor" className="flex-1 w-full max-w-[460px] bg-slate-50 border border-slate-200/50 rounded-3xl overflow-hidden aspect-[4/3] relative select-none shadow-sm group-hover:scale-[1.02] group-hover:border-cyan-400/80 group-hover:shadow-[0_12px_40px_rgba(6,182,212,0.15)] transition-all duration-300 block cursor-pointer">
              <img src={paletteExtractorImg} alt="Palette Extractor Demo" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-cyan-950/0 group-hover:bg-cyan-950/40 transition-all duration-300 flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-cyan-700 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-xl">
                  Open Tool <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          </div>

          {/* 10. Watermark Overlay */}
          <div className="flex flex-col md:flex-row gap-12 items-center justify-between group">
            <div className="flex-1 space-y-5 text-left">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-rose-50 rounded-2xl flex items-center justify-center border border-rose-100 text-rose-650 group-hover:scale-105 transition-transform duration-200 shadow-sm">
                  <Copyright className="w-5.5 h-5.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-rose-650 uppercase tracking-wider bg-rose-50/40 border border-rose-100/60 px-2 py-0.5 rounded font-bold">Brand Protection</span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-1 group-hover:text-rose-650 transition-colors">Watermark Overlay</h3>
                </div>
              </div>
              <p className="text-xs md:text-sm text-slate-555 leading-relaxed font-medium">
                Overlay custom PNG branding logos or outline text watermarks onto your photos. Adjust opacity, scale, rotation, and tile-repeats client-side.
              </p>
              <ul className="space-y-2 text-xs font-semibold text-slate-655">
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Support image & text overlays</span></li>
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Responsive coordinates placement</span></li>
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Dynamic repeat tiling patterns</span></li>
              </ul>
              <Link 
                to="/watermark-overlay" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider transition shadow-md shadow-rose-500/10 active:scale-98"
              >
                Launch Watermark Overlay
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <Link to="/watermark-overlay" className="flex-1 w-full max-w-[460px] bg-slate-50 border border-slate-200/50 rounded-3xl overflow-hidden aspect-[4/3] relative select-none shadow-sm group-hover:scale-[1.02] group-hover:border-rose-400/80 group-hover:shadow-[0_12px_40px_rgba(244,63,94,0.15)] transition-all duration-300 block cursor-pointer">
              <img src={watermarkOverlayImg} alt="Watermark Overlay Demo" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-rose-950/0 group-hover:bg-rose-950/40 transition-all duration-300 flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-rose-700 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-xl">
                  Open Tool <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          </div>

          {/* 11. EXIF Metadata Stripper */}
          <div className="flex flex-col md:flex-row-reverse gap-12 items-center justify-between group">
            <div className="flex-1 space-y-5 text-left">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-red-50 rounded-2xl flex items-center justify-center border border-red-100 text-red-650 group-hover:scale-105 transition-transform duration-200 shadow-sm">
                  <Fingerprint className="w-5.5 h-5.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-red-650 uppercase tracking-wider bg-red-50/40 border border-red-100/60 px-2 py-0.5 rounded font-bold">Privacy Shield</span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-1 group-hover:text-red-650 transition-colors">EXIF Metadata Stripper</h3>
                </div>
              </div>
              <p className="text-xs md:text-sm text-slate-555 leading-relaxed font-medium">
                Audit and scrub hidden EXIF data headers from your photos. Remove GPS coordinates, camera models, and capture times to secure your privacy.
              </p>
              <ul className="space-y-2 text-xs font-semibold text-slate-655">
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Local EXIF inspection panel</span></li>
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Interactive coordinates locator</span></li>
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Zero-trace canvas cleaning</span></li>
              </ul>
              <Link 
                to="/metadata-stripper" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider transition shadow-md shadow-red-500/10 active:scale-98"
              >
                Launch Metadata Stripper
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <Link to="/metadata-stripper" className="flex-1 w-full max-w-[460px] bg-slate-50 border border-slate-200/50 rounded-3xl overflow-hidden aspect-[4/3] relative select-none shadow-sm group-hover:scale-[1.02] group-hover:border-red-400/80 group-hover:shadow-[0_12px_40px_rgba(239,68,68,0.15)] transition-all duration-300 block cursor-pointer">
              <img src={metadataStripperImg} alt="EXIF Metadata Stripper Demo" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-red-950/0 group-hover:bg-red-950/40 transition-all duration-300 flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-red-700 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-xl">
                  Open Tool <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          </div>

          {/* 12. Instagram Grid Splitter */}
          <div className="flex flex-col md:flex-row-reverse gap-12 items-center justify-between group">
            <div className="flex-1 space-y-5 text-left">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-orange-50 rounded-2xl flex items-center justify-center border border-orange-100 text-orange-650 group-hover:scale-105 transition-transform duration-200 shadow-sm">
                  <Maximize2 className="w-5.5 h-5.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-orange-650 uppercase tracking-wider bg-orange-50/40 border border-orange-100/60 px-2 py-0.5 rounded font-bold">Social Feeds</span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-1 group-hover:text-orange-650 transition-colors">Grid Splitter</h3>
                </div>
              </div>
              <p className="text-xs md:text-sm text-slate-555 leading-relaxed font-medium">
                Slice single panoramic images into square grid assets. Ready for cohesive social banners, Instagram feeds, or Pinterest grids.
              </p>
              <ul className="space-y-2 text-xs font-semibold text-slate-655">
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Grid metrics split presets (3x3, 3x1, 3x2)</span></li>
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Instant ZIP generation pipeline</span></li>
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Retain full source pixel resolution</span></li>
              </ul>
              <Link 
                to="/instagram-grid-splitter" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider transition shadow-md shadow-orange-500/10 active:scale-98"
              >
                Launch Grid Splitter
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <Link to="/instagram-grid-splitter" className="flex-1 w-full max-w-[460px] bg-slate-50 border border-slate-200/50 rounded-3xl overflow-hidden aspect-[4/3] relative select-none shadow-sm group-hover:scale-[1.02] group-hover:border-orange-400/80 group-hover:shadow-[0_12px_40px_rgba(249,115,22,0.15)] transition-all duration-300 block cursor-pointer">
              <img src={gridSplitterImg} alt="Instagram Grid Splitter Demo" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-orange-950/0 group-hover:bg-orange-950/40 transition-all duration-300 flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-orange-700 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-xl">
                  Open Tool <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          </div>

          {/* 13. Instant Meme Generator */}
          <div className="flex flex-col md:flex-row gap-12 items-center justify-between group">
            <div className="flex-1 space-y-5 text-left">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-green-50 rounded-2xl flex items-center justify-center border border-green-100 text-green-650 group-hover:scale-105 transition-transform duration-200 shadow-sm">
                  <Smile className="w-5.5 h-5.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-green-650 uppercase tracking-wider bg-green-50/40 border border-green-100/60 px-2 py-0.5 rounded font-bold">Creator Tool</span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-1 group-hover:text-green-650 transition-colors">Meme Generator</h3>
                </div>
              </div>
              <p className="text-xs md:text-sm text-slate-555 leading-relaxed font-medium">
                Create custom memes and captioned social cards. Drag-and-drop movable text layers freely on the photo canvas with classic Impact font styling.
              </p>
              <ul className="space-y-2 text-xs font-semibold text-slate-655">
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Drag-and-drop text layouts</span></li>
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Heavy black outlines & fills</span></li>
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-650 shrink-0 mt-0.5" /><span>Add unlimited caption blocks</span></li>
              </ul>
              <Link 
                to="/meme-generator" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider transition shadow-md shadow-green-500/10 active:scale-98"
              >
                Launch Meme Generator
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <Link to="/meme-generator" className="flex-1 w-full max-w-[460px] bg-slate-50 border border-slate-200/50 rounded-3xl overflow-hidden aspect-[4/3] relative select-none shadow-sm group-hover:scale-[1.02] group-hover:border-green-400/80 group-hover:shadow-[0_12px_40px_rgba(34,197,94,0.15)] transition-all duration-300 block cursor-pointer">
              <img src={memeGeneratorImg} alt="Meme Generator Demo" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-green-950/0 group-hover:bg-green-950/40 transition-all duration-300 flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-green-700 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-xl">
                  Open Tool <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          </div>
        
      </section>

      {/* Security Banner section */}
      <section className="my-24 max-w-5xl mx-auto premium-bento rounded-3xl p-8 bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/50 border border-slate-200/50 relative overflow-hidden shadow-md flex flex-col md:flex-row items-center gap-8 justify-between">
        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="space-y-3 max-w-xl text-left">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-650 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100/60 shadow-xs">
            <Lock className="w-3.5 h-3.5" />
            Client-Side Promise
          </div>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Your private files never leave your device</h3>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            ImageGiri operates under a strict offline isolation sandbox. We do not collect cookies, compile usage analytics profiles, or transfer your pixel configurations.
          </p>
        </div>

        <div className="shrink-0 w-full md:w-auto">
          <Link 
            to="/privacy" 
            className="w-full md:w-auto inline-flex justify-center items-center px-6 py-3 bg-white hover:bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-700 hover:text-slate-900 rounded-xl transition border border-slate-200/60 shadow-xs"
          >
            Read Privacy Terms
          </Link>
        </div>
      </section>
    </div>
  );
};

