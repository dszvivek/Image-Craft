import React, { useState } from 'react';
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
  ChevronDown, 
  ChevronUp,
  ArrowRight,
  Sparkles,
  FileCheck,
  Code
} from 'lucide-react';
import { SEO } from '../components/SEO';

interface FAQItem {
  q: string;
  a: string;
}

export const Home: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);


  const testimonials = [
    {
      quote: "Zero uploads means I can compress confidential brand visuals without worrying about compliance or NDA issues. ImageCraft is an essential daily utility.",
      author: "Jane Doe",
      role: "Lead Brand Designer",
      avatarColor: "bg-indigo-100 text-indigo-700",
      initials: "JD"
    },
    {
      quote: "The background cutout runs completely in-browser! Once the cached model is loaded, it executes instantly. Incredible design.",
      author: "Marcus Chen",
      role: "UX Lead at FlowState",
      avatarColor: "bg-purple-100 text-purple-700",
      initials: "MC"
    },
    {
      quote: "Splitting grid layouts for Instagram is seamless. No ads covering the download button, no payment walls, and original resolution is preserved.",
      author: "Sarah Lund",
      role: "Digital Creator",
      avatarColor: "bg-pink-100 text-pink-700",
      initials: "SL"
    },
    {
      quote: "The OCR text extraction auto-detects English and Hindi flawlessly. Incredible to see such complex tools compile entirely client-side.",
      author: "Alex Rivera",
      role: "Frontend Engineer",
      avatarColor: "bg-emerald-100 text-emerald-700",
      initials: "AR"
    },
    {
      quote: "I love the Color Palette Extractor. I drop an asset, copy the generated Tailwind configuration codes, and apply it directly. Highly recommend!",
      author: "Elena Rostova",
      role: "UI Developer",
      avatarColor: "bg-cyan-100 text-cyan-700",
      initials: "ER"
    }
  ];

  const faqs: FAQItem[] = [
    {
      q: 'How does client-side local processing work?',
      a: 'Modern browsers are capable of running complex calculations via Web Workers and WebAssembly. We pack compiling scripts and AI weights directly into your browser. Once loaded, everything runs on your physical CPU or GPU, entirely bypassing the cloud.'
    },
    {
      q: 'Are my private files saved or monitored?',
      a: 'Absolutely not. ImageCraft AI has no databases, telemetry tracking, or backend servers for your files. All transformations, AI cutouts, and OCR script scanning occur locally in your browser memory (RAM).'
    },
    {
      q: 'Why does background removal require an initial download?',
      a: 'The AI tool runs a local neural network (RMBG-1.4) inside your browser. The first time you launch the tool, the weights (approx. 10MB) are downloaded from Hugging Face CDN. They are subsequently cached in your browser\'s IndexedDB, enabling immediate, offline loading next time.'
    },
    {
      q: 'Is ImageCraft AI truly 100% free?',
      a: 'Yes, completely. There are no registration forms, no usage credits, and no subscriptions. The application is supported by lightweight, non-disruptive ad placements without interrupting your local workflow.'
    }
  ];

  const handleCopyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  return (
    <div className="w-full relative">
      <SEO 
        title="Privacy-First Image Tools" 
        description="Compress images, remove backgrounds with local AI, extract text (OCR), split grids, and extract color palettes 100% locally in your browser. Absolute privacy, zero cloud uploads." 
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

        {/* Interactive Mock Graphic */}
        <div className="relative mt-16 w-full max-w-3xl premium-bento rounded-3xl p-1.5 shadow-2xl animate-float pointer-events-none select-none border border-slate-200/60 bg-white/40">
          <div className="rounded-[18px] bg-slate-50 border border-slate-100 overflow-hidden relative aspect-[16/9] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-dot-grid opacity-30" />
            
            {/* Mock Layout Grid */}
            <div className="w-full h-full flex gap-4 relative z-10">
              
              {/* Left Side: Original Image Card */}
              <div className="flex-1 bg-white rounded-xl border border-slate-200/60 p-3 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">source.png</span>
                </div>
                
                {/* SVG Mock Image */}
                <div className="flex-1 my-3 bg-indigo-50/50 rounded-lg flex flex-col items-center justify-center relative overflow-hidden border border-indigo-100/40">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-400 to-purple-400 opacity-80 flex items-center justify-center shadow-lg animate-pulse-slow">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute bottom-2 inset-x-2 h-4 bg-white/70 backdrop-blur-xs rounded border border-white/40 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-indigo-600">4.2 MB Original Asset</span>
                  </div>
                </div>

                <div className="h-6 flex items-center justify-between text-[9px] text-slate-450 px-0.5">
                  <span>Width: 3840px</span>
                  <span>PNG Raw</span>
                </div>
              </div>

              {/* Center Slider Split */}
              <div className="w-[1px] h-full bg-indigo-200/50 relative flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center shadow-md border border-white">
                  <ArrowRight className="w-3.5 h-3.5 text-white animate-pulse" />
                </div>
              </div>

              {/* Right Side: Processed Output */}
              <div className="flex-1 bg-white rounded-xl border border-slate-200/60 p-3 shadow-xs flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-bold text-emerald-650 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AI Engine Active
                  </span>
                  <span className="text-[10px] font-mono text-indigo-650 bg-indigo-50 px-1.5 py-0.5 rounded font-bold">100% Secure</span>
                </div>

                {/* Subject Isolated Mock Grid */}
                <div className="flex-1 my-3 bg-[linear-gradient(45deg,#e2e8f0_25%,transparent_25%),linear-gradient(-45deg,#e2e8f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e2e8f0_75%),linear-gradient(-45deg,transparent_75%,#e2e8f0_75%)] bg-[size:10px_10px] bg-[position:0_0,0_5px,5px_-5px,-5px_0] bg-slate-50 rounded-lg flex items-center justify-center relative overflow-hidden border border-slate-200/40">
                  
                  {/* Floating cut out element */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-400 to-purple-400 flex items-center justify-center shadow-lg border-2 border-white animate-float">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  
                  <div className="absolute bottom-2 inset-x-2 h-4 bg-emerald-500/90 text-white rounded flex items-center justify-center gap-1 shadow-sm">
                    <FileCheck className="w-3 h-3" />
                    <span className="text-[8px] font-bold uppercase tracking-wider">Compressed WebP: 242 KB</span>
                  </div>
                </div>

                <div className="h-6 flex items-center justify-between text-[9px] text-slate-450 px-0.5">
                  <span className="text-emerald-600 font-bold">-94.2% Saved</span>
                  <span>0.0s latency</span>
                </div>
              </div>

            </div>

            {/* Glowing Accent Lights */}
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
          </div>
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

      {/* Bento Grid: Tools Directory */}
      <section id="tools-grid" className="py-16 border-t border-slate-200/60 mt-12 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Browser-Based Utilities</h2>
          <p className="text-xs md:text-sm text-slate-450 font-bold uppercase tracking-wider">Select a standalone application module</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 1. Image Compressor (col-span-2) */}
          <div className="group md:col-span-2 premium-bento rounded-3xl p-6 bg-white flex flex-col justify-between hover:scale-[1.01]">
            <div className="flex flex-col md:flex-row gap-6 justify-between items-start h-full">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100 text-indigo-600 group-hover:scale-105 transition-transform duration-200">
                    <ImageIcon className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-indigo-650 bg-indigo-50/50 px-2 py-0.5 rounded border border-indigo-100">Core Optimization</span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1 group-hover:text-indigo-650 transition-colors">Image Compressor</h3>
                  </div>
                </div>
                <p className="text-xs md:text-sm text-slate-500 leading-relaxed max-w-md">
                  Reduce heavy JPEG, PNG, and WebP assets by up to 90% without visible noise. Fully control dimensions, quality percentages, and target file formats.
                </p>
              </div>

              {/* Card visual detail */}
              <div className="w-full md:w-48 bg-slate-50 border border-slate-100 rounded-2xl p-3 flex flex-col gap-2 pointer-events-none select-none">
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full w-4/5 bg-indigo-600 rounded-full animate-pulse" />
                </div>
                <div className="flex justify-between text-[9px] font-bold text-slate-450 font-mono">
                  <span>90% quality</span>
                  <span className="text-indigo-600">-84% Saved</span>
                </div>
                <div className="border-t border-slate-200/50 pt-2 flex items-center justify-between text-[10px] text-slate-500">
                  <span>output.webp</span>
                  <span className="bg-emerald-50 text-emerald-700 px-1 rounded font-bold">Safe</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6 mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Features side-by-side split screen</span>
              <Link 
                to="/image-compressor" 
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-50 hover:bg-indigo-600 text-slate-650 hover:text-white rounded-xl text-xs font-bold text-center transition-all duration-200 border border-slate-200 hover:border-indigo-500 shadow-xs flex items-center justify-center gap-1.5"
              >
                Launch Compressor
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* 2. AI Background Remover (col-span-1) */}
          <div className="group premium-bento rounded-3xl p-6 bg-white flex flex-col justify-between hover:scale-[1.01]">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center border border-purple-100 text-purple-600 group-hover:scale-105 transition-transform duration-200">
                  <Cpu className="w-5.5 h-5.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-purple-650 bg-purple-50/50 px-2 py-0.5 rounded border border-purple-100">Local Model</span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1 group-hover:text-purple-650 transition-colors">AI Cutout</h3>
                </div>
              </div>
              <p className="text-xs text-slate-550 leading-relaxed">
                Remove backgrounds instantly. Powered by RMBG-1.4 neural network executing on-device in Web Worker threads.
              </p>
              
              {/* Card visual detail */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 aspect-[4/3] flex items-center justify-center relative overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,#e2e8f0_25%,transparent_25%),linear-gradient(-45deg,#e2e8f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e2e8f0_75%),linear-gradient(-45deg,transparent_75%,#e2e8f0_75%)] bg-[size:8px_8px] bg-[position:0_0,0_4px,4px_-4px,-4px_0] bg-slate-50 opacity-40" />
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center shadow-lg z-10 border-2 border-white animate-float">
                  <Sparkles className="w-6 h-6" />
                </div>
              </div>
            </div>

            <Link 
              to="/background-remover" 
              className="w-full mt-6 py-2.5 bg-slate-50 hover:bg-purple-600 text-slate-650 hover:text-white rounded-xl text-xs font-bold text-center transition-all duration-200 border border-slate-200 hover:border-purple-500 shadow-xs flex items-center justify-center gap-1"
            >
              Launch AI Cutout
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 3. OCR Text Extractor (col-span-1) */}
          <div className="group premium-bento rounded-3xl p-6 bg-white flex flex-col justify-between hover:scale-[1.01]">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 text-emerald-600 group-hover:scale-105 transition-transform duration-200">
                  <FileText className="w-5.5 h-5.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-650 bg-emerald-50/50 px-2 py-0.5 rounded border border-emerald-100">Scan scripts</span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1 group-hover:text-emerald-650 transition-colors">OCR Extractor</h3>
                </div>
              </div>
              <p className="text-xs text-slate-550 leading-relaxed">
                Scan images to extract text. Supports multi-language models executing inside offline sandbox workers.
              </p>
              
              {/* Card visual detail */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex flex-col justify-center gap-1.5 h-24 font-mono text-[9px] text-slate-500 relative overflow-hidden pointer-events-none">
                <div className="absolute top-0 inset-x-0 h-0.5 bg-emerald-500/80 animate-bounce" />
                <span className="text-slate-800 font-bold bg-emerald-50 px-1 rounded border border-emerald-100/40">OCR Output detected:</span>
                <span>$ npm run local-ocr ...</span>
                <span className="text-indigo-650 font-bold">Auto Language: Hindi / English</span>
              </div>
            </div>

            <Link 
              to="/ocr-text-extractor" 
              className="w-full mt-6 py-2.5 bg-slate-50 hover:bg-emerald-650 text-slate-650 hover:text-white rounded-xl text-xs font-bold text-center transition-all duration-200 border border-slate-200 hover:border-emerald-500 shadow-xs flex items-center justify-center gap-1"
            >
              Launch OCR Text
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 4. Instagram Grid Splitter (col-span-1) */}
          <div className="group premium-bento rounded-3xl p-6 bg-white flex flex-col justify-between hover:scale-[1.01]">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center border border-orange-100 text-orange-600 group-hover:scale-105 transition-transform duration-200">
                  <Maximize2 className="w-5.5 h-5.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-orange-650 bg-orange-50/50 px-2 py-0.5 rounded border border-orange-100">Layouts</span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1 group-hover:text-orange-650 transition-colors">Grid Splitter</h3>
                </div>
              </div>
              <p className="text-xs text-slate-550 leading-relaxed">
                Slice single images into structured feeds. Fully compatible with Instagram, Pinterest, and Twitter image ratios.
              </p>
              
              {/* Card visual detail */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2.5 h-24 flex items-center justify-center pointer-events-none">
                <div className="grid grid-cols-3 gap-1 w-16 h-16">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="border border-orange-200/50 bg-orange-50/40 rounded-xs flex items-center justify-center text-[7px] text-orange-500 font-bold">
                      {i+1}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Link 
              to="/instagram-grid-splitter" 
              className="w-full mt-6 py-2.5 bg-slate-50 hover:bg-orange-600 text-slate-650 hover:text-white rounded-xl text-xs font-bold text-center transition-all duration-200 border border-slate-200 hover:border-orange-500 shadow-xs flex items-center justify-center gap-1"
            >
              Launch Splitter
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 5. Photo Collage Maker (col-span-1) */}
          <div className="group premium-bento rounded-3xl p-6 bg-white flex flex-col justify-between hover:scale-[1.01]">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-pink-50 rounded-xl flex items-center justify-center border border-pink-100 text-pink-600 group-hover:scale-105 transition-transform duration-200">
                  <LayoutGrid className="w-5.5 h-5.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-pink-650 bg-pink-50/50 px-2 py-0.5 rounded border border-pink-100">Canvas</span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1 group-hover:text-pink-650 transition-colors">Collage Maker</h3>
                </div>
              </div>
              <p className="text-xs text-slate-550 leading-relaxed">
                Combine your favorite moments. Rearrange files, edit gap paddings, and style borders live in a responsive canvas grid.
              </p>
              
              {/* Card visual detail */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2.5 h-24 flex items-center justify-center pointer-events-none">
                <div className="w-20 h-14 border border-pink-200/50 bg-pink-50/40 rounded flex gap-1 p-1">
                  <div className="flex-1 bg-white rounded border border-pink-100" />
                  <div className="w-6 flex flex-col gap-1">
                    <div className="flex-1 bg-white rounded border border-pink-100" />
                    <div className="flex-1 bg-white rounded border border-pink-100" />
                  </div>
                </div>
              </div>
            </div>

            <Link 
              to="/collage-maker" 
              className="w-full mt-6 py-2.5 bg-slate-50 hover:bg-pink-600 text-slate-650 hover:text-white rounded-xl text-xs font-bold text-center transition-all duration-200 border border-slate-200 hover:border-pink-500 shadow-xs flex items-center justify-center gap-1"
            >
              Launch Collage
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 6. Color Palette Extractor (col-span-2) */}
          <div className="group md:col-span-2 premium-bento rounded-3xl p-6 bg-white flex flex-col justify-between hover:scale-[1.01]">
            <div className="flex flex-col md:flex-row gap-6 justify-between items-start h-full">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-cyan-50 rounded-xl flex items-center justify-center border border-cyan-100 text-cyan-600 group-hover:scale-105 transition-transform duration-200">
                    <Palette className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-cyan-650 bg-cyan-50/50 px-2 py-0.5 rounded border border-cyan-100">Colors</span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1 group-hover:text-cyan-650 transition-colors">Palette Extractor</h3>
                  </div>
                </div>
                <p className="text-xs md:text-sm text-slate-500 leading-relaxed max-w-md">
                  Retrieve key dominant color values and accent HEX swatches. Get matching UI design colors code blocks for standard stylesheets, tailwind configurations, and code files.
                </p>
              </div>

              {/* Card visual detail - Interactive color swatches! */}
              <div className="w-full md:w-48 bg-slate-50 border border-slate-100 rounded-2xl p-3 flex flex-col gap-2.5 pointer-events-auto">
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Click to Copy swatch</div>
                <div className="flex gap-1.5">
                  {[
                    { hex: '#6366F1', label: 'Indigo' },
                    { hex: '#8B5CF6', label: 'Purple' },
                    { hex: '#EC4899', label: 'Pink' },
                    { hex: '#10B981', label: 'Emerald' }
                  ].map((color) => (
                    <button 
                      key={color.hex}
                      onClick={() => handleCopyColor(color.hex)}
                      className="w-8 h-8 rounded-lg border border-slate-200/80 cursor-pointer transition-transform hover:scale-110 active:scale-95 shadow-xs relative group/swatch flex items-center justify-center"
                      style={{ backgroundColor: color.hex }}
                      title={`Copy ${color.hex}`}
                    >
                      {copiedColor === color.hex && (
                        <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                          <span className="text-[8px] font-bold text-white">✓</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <div className="text-[9px] font-mono text-slate-500 bg-white border border-slate-150 p-1.5 rounded flex items-center justify-between">
                  <span>{copiedColor ? `Copied: ${copiedColor}` : 'Hex codes list'}</span>
                  <Code className="w-3 h-3 text-slate-400" />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6 mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Leverages k-means clustering model</span>
              <Link 
                to="/color-palette-extractor" 
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-50 hover:bg-cyan-600 text-slate-650 hover:text-white rounded-xl text-xs font-bold text-center transition-all duration-200 border border-slate-200 hover:border-cyan-500 shadow-xs flex items-center justify-center gap-1.5"
              >
                Launch Extractor
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* 7. More Tools Coming Soon (col-span-1) */}
          <div className="premium-bento rounded-3xl p-6 bg-gradient-to-br from-indigo-600 to-purple-650 text-white flex flex-col justify-between hover:scale-[1.01] border-0">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center text-white backdrop-blur-xs">
                  <Sparkles className="w-5.5 h-5.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider">Submit feedback</span>
                  <h3 className="text-lg font-bold mt-1">Request a Tool</h3>
                </div>
              </div>
              <p className="text-xs text-indigo-100 leading-relaxed">
                Need another security-first utility running offline? Send us features requests, bug reports, or custom code suggestions.
              </p>
            </div>

            <Link 
              to="/contact" 
              className="w-full mt-6 py-2.5 bg-white text-indigo-950 hover:bg-indigo-50 active:scale-98 rounded-xl text-xs font-bold text-center transition-all shadow-md flex items-center justify-center gap-1"
            >
              Get in touch
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </section>

      {/* Security Banner section */}
      <section className="my-16 max-w-5xl mx-auto premium-bento rounded-3xl p-8 bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/50 border border-slate-200/50 relative overflow-hidden shadow-md flex flex-col md:flex-row items-center gap-8 justify-between">
        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="space-y-3 max-w-xl text-left">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-650 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100/60 shadow-xs">
            <Lock className="w-3.5 h-3.5" />
            Client-Side Promise
          </div>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Your private files never leave your device</h3>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            ImageCraft AI operates under a strict offline isolation sandbox. We do not collect cookies, compile usage analytics profiles, or transfer your pixel configurations.
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

      {/* Testimonials Section (Masonry Asymmetric Layout) */}
      <section className="py-16 border-t border-slate-200/60 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Designed for Professionals</h2>
          <p className="text-xs md:text-sm text-slate-450 font-bold uppercase tracking-wider">Here is what the creator community says</p>
        </div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {testimonials.map((test, index) => (
            <div 
              key={index} 
              className="break-inside-avoid premium-bento p-6 rounded-3xl bg-white border border-slate-200/50 flex flex-col justify-between gap-6 hover:scale-[1.01]"
            >
              <p className="text-xs md:text-sm text-slate-550 leading-relaxed font-medium italic">
                "{test.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border border-slate-200/50 ${test.avatarColor}`}>
                  {test.initials}
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800">{test.author}</h4>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{test.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section (Borderless Clean Accordion) */}
      <section className="py-16 border-t border-slate-200/60 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">FAQ</h2>
          <p className="text-xs md:text-sm text-slate-450 font-bold uppercase tracking-wider">Common answers about client-side architectures</p>
        </div>

        <div className="flex flex-col border-y border-slate-200/65">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="border-b last:border-0 border-slate-200/65 overflow-hidden"
            >
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                className="w-full py-6 flex items-center justify-between text-left text-sm md:text-base font-bold text-slate-800 hover:text-indigo-650 cursor-pointer transition-colors duration-150"
              >
                <span>{faq.q}</span>
                {openFaqIndex === index ? (
                  <ChevronUp className="w-4 h-4 text-indigo-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>
              
              <div 
                className={`transition-all duration-250 ease-in-out ${openFaqIndex === index ? 'max-h-48 opacity-100 pb-6' : 'max-h-0 opacity-0'}`}
              >
                <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-medium">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
