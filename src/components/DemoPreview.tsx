import React, { useState } from 'react';
import { 
  Cpu, 
  RotateCw, 
  Wand2, 
  Lock, 
  PenTool, 
  FileText, 
  Sparkles, 
  Image as ImageIcon, 
  ArrowRight, 
  ShieldCheck, 
  Square
} from 'lucide-react';

interface DemoPreviewProps {
  toolId?: string;
  gifSrc?: string;
  staticSrc?: string;
  alt?: string;
  className?: string;
}

export const DemoPreview: React.FC<DemoPreviewProps> = ({ 
  toolId = '', 
  gifSrc, 
  staticSrc, 
  alt = 'Tool Feature Preview',
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const effectiveMediaSrc = isHovered && gifSrc ? gifSrc : (staticSrc || gifSrc);
  const hasExplicitMedia = !!effectiveMediaSrc && !imgError;

  // Normalized tool key
  const key = toolId.toLowerCase().trim();

  // Render bespoke GPU-accelerated animated micro-demo
  const renderInteractiveDemo = () => {
    switch (key) {
      // 1. Photo Redactor & Censor
      case 'redact':
      case 'redact-image':
      case 'censor':
        return (
          <div className="w-full h-full p-4 flex flex-col justify-between relative bg-[#09090b]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 blur-[3px] shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="w-full h-2.5 bg-zinc-900 rounded relative overflow-hidden">
                  <div className="absolute inset-y-0 left-0 w-3/4 bg-black border border-red-500/50 rounded shadow-[0_0_8px_rgba(239,68,68,0.3)] animate-pulse" />
                </div>
                <div className="w-2/3 h-2.5 bg-zinc-900 rounded relative overflow-hidden">
                  <div className="absolute inset-y-0 left-0 w-1/2 bg-black border border-red-500/50 rounded shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
                </div>
              </div>
            </div>
            <div className="w-full h-0.5 bg-red-500/20 relative overflow-hidden rounded my-auto">
              <div className="absolute inset-y-0 w-1/3 bg-red-500 shadow-[0_0_10px_#ef4444] animate-wipe-x" />
            </div>
            <div className="flex items-center justify-between border-t border-zinc-800/80 pt-2 text-[10px]">
              <span className="font-mono text-zinc-400 font-semibold">Zero Pixel Recovery</span>
              <span className="font-extrabold text-red-400 bg-red-950/80 border border-red-800/80 px-2 py-0.5 rounded tracking-wider shadow-sm">
                IRREVERSIBLE CENSOR
              </span>
            </div>
          </div>
        );

      // 2. Background Remover
      case 'bg-remover':
      case 'background-remover':
      case 'cutout':
        return (
          <div className="w-full h-full relative flex items-center justify-center bg-[#09090b]">
            <div 
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage: 'linear-gradient(45deg, #1c1c20 25%, transparent 25%), linear-gradient(-45deg, #1c1c20 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1c1c20 75%), linear-gradient(-45deg, transparent 75%, #1c1c20 75%)',
                backgroundSize: '16px 16px',
                backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px'
              }}
            />
            <div className="absolute inset-y-0 left-0 w-1/2 bg-emerald-950/70 border-r border-emerald-500/30 flex items-center justify-center">
              <span className="text-[9px] font-black text-emerald-400/90 uppercase tracking-widest absolute top-2.5 left-3">Original</span>
            </div>
            <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest absolute top-2.5 right-3">Cutout</span>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-b from-purple-400 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-purple-500/40 border-2 border-white/30 animate-pulse">
                <Cpu className="w-6 h-6" />
              </div>
              <div className="w-20 h-5 rounded-t-2xl bg-purple-500/40 mt-1 border-t border-purple-400/40" />
            </div>
            <div className="absolute inset-y-0 w-1 bg-gradient-to-b from-purple-400 via-white to-purple-400 shadow-[0_0_16px_#a855f7] animate-wipe-x z-20" />
          </div>
        );

      // 3. Cropper
      case 'crop':
      case 'crop-image':
      case 'resizer':
        return (
          <div className="w-full h-full relative flex items-center justify-center bg-zinc-950">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/80 via-slate-900 to-zinc-900 opacity-60" />
            <div className="w-40 h-28 border border-slate-800 grid grid-cols-3 grid-rows-3 opacity-30">
              {Array.from({ length: 9 }).map((_, i) => <div key={i} className="border border-slate-800" />)}
            </div>
            <div className="absolute border-2 border-indigo-400 bg-indigo-500/15 shadow-[0_0_20px_rgba(99,102,241,0.4)] animate-crop-box flex items-center justify-center">
              <div className="w-full h-full grid grid-cols-3 grid-rows-3 opacity-50">
                {Array.from({ length: 9 }).map((_, i) => <div key={i} className="border border-indigo-300/40" />)}
              </div>
              <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-indigo-600 rounded-xs shadow-sm" />
              <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-indigo-600 rounded-xs shadow-sm" />
              <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-indigo-600 rounded-xs shadow-sm" />
              <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-indigo-600 rounded-xs shadow-sm" />
            </div>
            <div className="absolute bottom-2.5 right-3 bg-slate-900/90 border border-indigo-500/40 px-2.5 py-1 rounded-md text-[9px] font-black text-indigo-300 uppercase tracking-widest z-20 shadow-md">
              1:1 • 4:5 • 16:9 • Passport
            </div>
          </div>
        );

      // 4. Rotator
      case 'rotate':
      case 'rotate-image':
        return (
          <div className="w-full h-full relative flex items-center justify-center bg-zinc-950">
            <div className="w-28 h-28 rounded-full border-2 border-dashed border-blue-500/30 flex items-center justify-center relative">
              <span className="absolute -top-3 text-[9px] font-bold text-blue-400">0°</span>
              <span className="absolute -right-4 text-[9px] font-bold text-blue-400">90°</span>
              <span className="absolute -bottom-3 text-[9px] font-bold text-blue-400">180°</span>
              <span className="absolute -left-4 text-[9px] font-bold text-blue-400">270°</span>
              <div className="w-16 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 border border-white/40 shadow-xl shadow-blue-500/30 flex items-center justify-center text-white animate-rotate-dial">
                <RotateCw className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="absolute bottom-2.5 left-3 bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded-md text-[9px] font-bold text-blue-400">
              Horizon Level: 0.0°
            </div>
          </div>
        );

      // 5. Photo Filters
      case 'filters':
      case 'photo-filters':
      case 'editor':
        return (
          <div className="w-full h-full relative flex flex-col justify-center bg-zinc-950">
            <div className="w-full h-full grid grid-cols-3">
              <div className="bg-gradient-to-b from-amber-800/70 to-amber-950/90 border-r border-zinc-800 flex flex-col items-center justify-center">
                <span className="text-[9px] font-black text-amber-300 uppercase tracking-wider">Sepia</span>
              </div>
              <div className="bg-gradient-to-b from-fuchsia-600/80 to-cyan-700/90 border-r border-zinc-800 flex flex-col items-center justify-center">
                <span className="text-[9px] font-black text-white uppercase tracking-wider">Duotone</span>
              </div>
              <div className="bg-gradient-to-b from-zinc-700 to-zinc-950 flex flex-col items-center justify-center">
                <span className="text-[9px] font-black text-zinc-300 uppercase tracking-wider">Noir B&W</span>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-10 h-10 rounded-full bg-purple-600/90 border-2 border-white/40 flex items-center justify-center text-white shadow-2xl shadow-purple-500/40 animate-pulse">
                <Wand2 className="w-5 h-5" />
              </div>
            </div>
          </div>
        );

      // 6. Color Inverter
      case 'invert':
      case 'invert-colors':
        return (
          <div className="w-full h-full relative flex items-center justify-center bg-zinc-950">
            <div className="w-full h-full flex">
              <div className="w-1/2 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-black">
                RGB Color
              </div>
              <div className="w-1/2 bg-zinc-950 flex items-center justify-center text-zinc-100 text-[10px] font-mono font-black border-l-2 border-white/60">
                Film Negative
              </div>
            </div>
            <div className="absolute inset-y-0 w-1 bg-white shadow-[0_0_14px_white] animate-wipe-x" />
          </div>
        );

      // 7. Image Adjuster
      case 'adjust':
      case 'adjust-image':
        return (
          <div className="w-full h-full relative flex items-center justify-center bg-zinc-950">
            <div className="w-full h-full flex">
              <div className="w-1/2 bg-slate-900/90 flex flex-col items-center justify-center opacity-40">
                <span className="text-[9px] font-bold text-slate-400">Dim Raw</span>
              </div>
              <div className="w-1/2 bg-gradient-to-tr from-blue-600 via-indigo-500 to-sky-400 flex flex-col items-center justify-center">
                <span className="text-[9px] font-black text-white">HDR Enhance</span>
              </div>
            </div>
            <div className="absolute inset-y-0 w-1 bg-blue-400 shadow-[0_0_14px_#60a5fa] animate-wipe-x z-10" />
            <div className="absolute bottom-2.5 right-3 bg-slate-900/90 border border-slate-800 px-2 py-0.5 rounded text-[8px] font-black text-blue-400 uppercase tracking-wider z-20">
              Auto Color Grading
            </div>
          </div>
        );

      // 8. Aspect Resizer & Border Expander
      case 'aspect':
      case 'aspect-resizer':
      case 'border':
      case 'add-border-to-image':
        return (
          <div className="w-full h-full relative flex items-center justify-center gap-3 p-4 bg-zinc-950">
            <div className="w-24 h-24 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 p-2 flex flex-col items-center justify-center relative shadow-lg shadow-amber-500/10">
              <div className="absolute inset-0 bg-amber-400/10 blur-md rounded-2xl" />
              <Square className="w-5 h-5 text-amber-400 z-10 mb-1" />
              <span className="text-[9px] font-black text-amber-300 z-10">1:1 Square</span>
              <span className="text-[7.5px] font-mono text-zinc-400 z-10">Blur Padding</span>
            </div>
            <div className="w-28 h-18 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex flex-col items-center justify-center shadow-md">
              <span className="text-[8.5px] font-black text-indigo-300">16:9 Feed</span>
              <span className="text-[7px] text-zinc-400">Zero Distortion</span>
            </div>
          </div>
        );

      // 9. Steganography
      case 'stego':
      case 'stego-decode':
      case 'image-steganography':
        return (
          <div className="w-full h-full p-3.5 flex flex-col justify-between relative bg-[#080d14]">
            <div className="font-mono text-[8.5px] text-emerald-500/60 leading-tight tracking-wider truncate">
              01010011 01000101 01000011 01010010 01000101 01010100
            </div>
            <div className="flex items-center justify-center gap-2.5 my-auto">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/70 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20 animate-pulse">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10.5px] font-mono font-bold text-emerald-400">Secret Embedded</div>
                <div className="text-[8px] font-mono text-zinc-500">Invisible LSB Stream</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-[8px] font-mono text-zinc-500 border-t border-zinc-900 pt-1.5">
              <span>LSB Encoding</span>
              <span className="text-emerald-400 font-bold">AES-256 GCM</span>
            </div>
          </div>
        );

      // 10. EXIF Metadata Stripper
      case 'metadata':
      case 'metadata-stripper':
      case 'stripper':
        return (
          <div className="w-full h-full p-3.5 flex flex-col justify-between relative bg-zinc-950">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[8.5px] font-mono text-zinc-400">
                <span>GPS: 37.7749° N, 122.4194° W</span>
                <span className="text-red-400 font-black bg-red-950/60 border border-red-900/60 px-1.5 py-0.2 rounded">PURGED</span>
              </div>
              <div className="text-[9px] font-mono text-zinc-400">Sony A7R IV • 85mm f/1.4 GM</div>
            </div>
            <div className="w-full h-1 bg-red-500/20 relative overflow-hidden rounded my-auto">
              <div className="absolute inset-y-0 w-1/3 bg-red-500 animate-wipe-x" />
            </div>
            <div className="flex items-center justify-between border-t border-zinc-900 pt-1.5">
              <span className="text-[8px] font-bold text-zinc-500">EXIF Sanitization</span>
              <span className="text-[9px] font-black text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% CLEAN
              </span>
            </div>
          </div>
        );

      // 11. Watermark Overlay
      case 'watermark':
      case 'watermark-overlay':
        return (
          <div className="w-full h-full relative flex items-center justify-center bg-zinc-950 overflow-hidden">
            <div className="absolute inset-0 flex flex-col justify-center gap-3 rotate-[-15deg] scale-110 opacity-25">
              <div className="text-[9px] text-white font-bold tracking-widest whitespace-nowrap">COPYRIGHT © CONFIDENTIAL • PROTECTED</div>
              <div className="text-[9px] text-white font-bold tracking-widest whitespace-nowrap translate-x-4">COPYRIGHT © CONFIDENTIAL • PROTECTED</div>
            </div>
            <div className="px-3.5 py-1 rounded-xl bg-rose-950/80 border border-rose-500/40 text-[10px] font-black text-rose-300 uppercase tracking-widest z-10 shadow-lg shadow-rose-500/10">
              Batch Copyright Stamp
            </div>
          </div>
        );

      // 12. Electronic PDF Signer
      case 'sign':
      case 'sign-pdf':
      case 'pdf-sign':
        return (
          <div className="w-full h-full p-3.5 flex flex-col justify-between relative bg-zinc-950">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span className="text-[9px] font-bold text-zinc-300">legal_contract_agreement.pdf</span>
            </div>
            <div className="flex-1 flex items-center justify-end pr-4 relative my-auto">
              <div className="flex flex-col items-center">
                <span className="font-serif italic text-indigo-300 text-sm tracking-wide translate-y-1">Verified Signature</span>
                <div className="w-28 h-0.5 bg-indigo-500/50" />
              </div>
              <div className="absolute top-2 right-1 text-indigo-400 animate-pulse">
                <PenTool className="w-4 h-4 rotate-45" />
              </div>
            </div>
            <div className="flex items-center justify-between text-[8px] text-zinc-500 border-t border-zinc-900 pt-1">
              <span>Client Vector Signature</span>
              <span className="text-emerald-400 font-bold">100% Offline</span>
            </div>
          </div>
        );

      // 13. Bank Statement Analyzer
      case 'statement':
      case 'bank-statement':
      case 'bank-statement-analyzer':
        return (
          <div className="w-full h-full p-3.5 flex flex-col justify-between relative bg-zinc-950">
            <div className="grid grid-cols-4 gap-1 text-[8px] font-bold text-zinc-500 border-b border-zinc-800 pb-1.5">
              <span>Date</span>
              <span>Description</span>
              <span className="text-right">Credit</span>
              <span className="text-right">Debit</span>
            </div>
            <div className="space-y-1">
              <div className="grid grid-cols-4 gap-1 text-[8.5px] font-bold text-zinc-300">
                <span>24 Jun</span>
                <span className="truncate">Stripe Payout</span>
                <span className="text-right text-emerald-400">+$2,450.00</span>
                <span className="text-right text-zinc-600">-</span>
              </div>
              <div className="grid grid-cols-4 gap-1 text-[8.5px] font-bold text-zinc-300">
                <span>25 Jun</span>
                <span className="truncate">AWS Cloud Hosting</span>
                <span className="text-right text-zinc-600">-</span>
                <span className="text-right text-rose-400">-$85.00</span>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-zinc-900 pt-1 text-[8px]">
              <span className="text-zinc-500 font-medium">Export to Excel & CSV</span>
              <span className="text-teal-400 font-bold font-mono">Clean Parsing</span>
            </div>
          </div>
        );

      // 14. OCR Text Extractor
      case 'ocr':
      case 'ocr-text-extractor':
        return (
          <div className="w-full h-full p-4 flex flex-col gap-2 justify-center relative bg-zinc-950">
            <div className="w-full h-2.5 bg-emerald-500/20 rounded" />
            <div className="w-3/4 h-2.5 bg-emerald-500/30 rounded relative overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-1/3 bg-emerald-400 animate-wipe-x shadow-[0_0_10px_#10b981]" />
            </div>
            <div className="w-5/6 h-2.5 bg-zinc-800 rounded" />
            <div className="w-1/2 h-2.5 bg-zinc-800 rounded" />
            <div className="absolute bottom-2.5 right-3 bg-emerald-950/90 border border-emerald-500/40 px-2 py-0.5 rounded text-[8px] font-black text-emerald-400 uppercase tracking-wider">
              Tesseract Multi-Lingual OCR
            </div>
          </div>
        );

      // 15. Pixel Art Generator
      case 'pixelart':
      case 'pixel-art-generator':
        return (
          <div className="w-full h-full relative flex items-center justify-center bg-zinc-950">
            <div className="w-36 h-24 bg-[#8bac0f] border-2 border-[#0f380f] rounded-xl grid grid-cols-8 grid-rows-6 gap-0.5 p-1.5 shadow-xl shadow-fuchsia-500/10">
              {Array.from({ length: 48 }).map((_, i) => {
                const dither = (i % 2 === 0 && (i % 7 < 3)) ? 'bg-[#0f380f]' : (i % 3 === 0) ? 'bg-[#306230]' : 'bg-[#9bbc0f]';
                return <div key={i} className={`rounded-none ${dither}`} />;
              })}
            </div>
            <div className="absolute bottom-2.5 right-3 bg-black/90 border border-fuchsia-500/40 px-2.5 py-1 rounded-md text-[8px] font-black text-fuchsia-400 uppercase tracking-widest font-mono">
              8-BIT DITHERING
            </div>
          </div>
        );

      // 16. ASCII Art Generator
      case 'ascii':
      case 'ascii-art-generator':
        return (
          <div className="w-full h-full p-3 flex flex-col justify-center relative bg-black font-mono overflow-hidden">
            <div className="text-[7.5px] text-emerald-450 leading-[8.5px] tracking-tighter opacity-85 select-none">
              @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@<br/>
              @@@@@@@@@@%##**+======+*#%@@@@@@@@@@@@<br/>
              @@@@@@@#*+=--:..........:-=+*#@@@@@@@@<br/>
              @@@@@#+=:..  ImagePlumber  ..:-=+%@@@@<br/>
              @@@@*=:..    ASCII Studio    ..:=*@@@@<br/>
              @@@@@#+=:..   Matrix Green   ..:-=+%@@<br/>
              @@@@@@@#*+=--:..........:-=+*#@@@@@@@@<br/>
              @@@@@@@@@@%##**+======+*#%@@@@@@@@@@@@
            </div>
            <div className="absolute bottom-2 right-3 bg-emerald-950/90 border border-emerald-500/40 px-2 py-0.5 rounded text-[7.5px] font-black text-emerald-400 uppercase tracking-wider">
              ANSI MATRIX GREEN
            </div>
          </div>
        );

      // 17. Glitch Art Studio
      case 'glitch':
      case 'glitch-image-generator':
        return (
          <div className="w-full h-full relative flex items-center justify-center bg-zinc-950 overflow-hidden">
            <div 
              className="absolute inset-0 z-20 pointer-events-none opacity-40"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.4) 0px, rgba(0, 0, 0, 0.4) 1px, transparent 1px, transparent 2px)',
              }}
            />
            <div className="relative font-black text-3xl tracking-widest animate-glitch-fx z-10 select-none text-white">
              <span className="text-cyan-400">GL</span>
              <span className="text-fuchsia-500">IT</span>
              <span className="text-amber-400">CH</span>
            </div>
            <div className="absolute bottom-2.5 left-3 bg-violet-950/80 border border-violet-700/60 px-2.5 py-1 rounded-md text-[8px] font-black text-violet-300 uppercase tracking-widest z-30">
              CRT Scanlines & RGB Split
            </div>
          </div>
        );

      // 18. SVG Vectorizer
      case 'vectorizer':
      case 'svg-vectorizer':
        return (
          <div className="w-full h-full relative flex items-center justify-center bg-[#070b12] p-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-zinc-900 border border-zinc-800 grid grid-cols-4 grid-rows-4 p-1">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className={`rounded-none ${i % 3 === 0 ? 'bg-zinc-600' : 'bg-transparent'}`} />
                ))}
              </div>
              <ArrowRight className="w-5 h-5 text-indigo-400" />
              <div className="w-14 h-14 rounded-xl bg-indigo-950/60 border border-indigo-500/40 flex items-center justify-center text-teal-300">
                <svg className="w-8 h-8 stroke-teal-300 fill-teal-400/20" viewBox="0 0 24 24" strokeWidth="2">
                  <path d="M12 2L2 19h20L12 2z" />
                  <circle cx="12" cy="2" r="1.5" fill="white" />
                  <circle cx="2" cy="19" r="1.5" fill="white" />
                  <circle cx="22" cy="19" r="1.5" fill="white" />
                </svg>
              </div>
            </div>
            <div className="absolute bottom-2.5 right-3 bg-indigo-950/90 border border-indigo-500/40 px-2 py-0.5 rounded text-[8px] font-black text-teal-300 uppercase tracking-wider">
              Raster to Smooth Vector
            </div>
          </div>
        );

      // 19. Meme Generator
      case 'meme':
      case 'meme-generator':
        return (
          <div className="w-full h-full p-2 relative flex items-center justify-center bg-zinc-950">
            <div className="w-full h-full rounded-xl overflow-hidden relative bg-gradient-to-tr from-green-950/60 to-slate-900 border border-zinc-800 flex flex-col justify-between p-3 text-center">
              <span className="text-[11px] font-black text-white uppercase tracking-wider drop-shadow-[0_2px_4px_black]">TOP CAPTION</span>
              <div className="w-10 h-10 rounded-full bg-green-500/20 border border-green-400/40 flex items-center justify-center mx-auto text-lg">
                😂
              </div>
              <span className="text-[11px] font-black text-white uppercase tracking-wider drop-shadow-[0_2px_4px_black]">BOTTOM TEXT</span>
            </div>
          </div>
        );

      // 20. Shape Art Generator
      case 'shape':
      case 'shape-art-generator':
        return (
          <div className="w-full h-full relative flex items-center justify-center bg-[#090d16] gap-2">
            <div className="flex -space-x-2 relative">
              <div className="w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-base rotate-[-12deg] shadow-lg">✨</div>
              <div className="w-12 h-12 rounded-full bg-purple-500/25 border border-purple-500/40 flex items-center justify-center text-base z-10 shadow-lg animate-pulse">🌸</div>
              <div className="w-12 h-12 rounded-full bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-base rotate-[12deg] z-20 shadow-lg">☁️</div>
            </div>
            <div className="absolute bottom-2.5 right-3 bg-slate-900/90 border border-indigo-500/40 px-2 py-0.5 rounded text-[8px] font-black text-indigo-400 uppercase tracking-wider">
              Particle Constellation
            </div>
          </div>
        );

      // 21. Instagram Panorama Splitter
      case 'panorama':
      case 'instagram-panorama-splitter':
        return (
          <div className="w-full h-full p-3 relative flex items-center justify-center bg-zinc-950">
            <div className="flex gap-2 items-center">
              <div className="w-20 h-28 rounded-xl bg-zinc-900 border border-pink-500/40 p-1.5 flex flex-col justify-between relative overflow-hidden shadow-lg">
                <div className="text-[8px] font-bold text-pink-400">Slide 1 (4:5)</div>
                <div className="w-full h-14 bg-gradient-to-r from-pink-500/30 to-purple-500/30 rounded" />
                <div className="text-[7px] text-zinc-500">1 of 2</div>
              </div>
              <div className="text-pink-500 font-black text-sm">→</div>
              <div className="w-20 h-28 rounded-xl bg-zinc-900 border border-pink-500/40 p-1.5 flex flex-col justify-between relative overflow-hidden shadow-lg">
                <div className="text-[8px] font-bold text-pink-400">Slide 2 (4:5)</div>
                <div className="w-full h-14 bg-gradient-to-r from-purple-500/30 to-indigo-500/30 rounded" />
                <div className="text-[7px] text-zinc-500">2 of 2</div>
              </div>
            </div>
            <div className="absolute bottom-2 right-3 bg-pink-950/90 border border-pink-500/40 px-2 py-0.5 rounded text-[8px] font-black text-pink-300 uppercase tracking-wider">
              Seamless 4:5 Swipe
            </div>
          </div>
        );

      // 22. Side-by-Side Combiner
      case 'compare':
      case 'side-by-side-image':
        return (
          <div className="w-full h-full p-3 relative flex items-center justify-center bg-zinc-950">
            <div className="w-full h-full rounded-2xl overflow-hidden flex border border-zinc-700 shadow-lg">
              <div className="w-1/2 bg-gradient-to-br from-slate-800 to-slate-900 relative flex items-center justify-center">
                <span className="text-[9px] font-black text-white bg-black/70 px-2 py-0.5 rounded absolute top-2.5 left-2.5">BEFORE</span>
                <ImageIcon className="w-8 h-8 text-slate-500" />
              </div>
              <div className="w-1 bg-blue-500 shadow-[0_0_12px_#3b82f6] z-10" />
              <div className="w-1/2 bg-gradient-to-br from-blue-600 to-indigo-600 relative flex items-center justify-center">
                <span className="text-[9px] font-black text-white bg-blue-900/80 px-2 py-0.5 rounded absolute top-2.5 right-2.5">AFTER</span>
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        );

      // 23. Collage Maker
      case 'collage':
      case 'collage-maker':
        return (
          <div className="w-full h-full p-3 grid grid-cols-3 gap-1.5 bg-zinc-950">
            <div className="bg-indigo-500/20 border border-indigo-500/30 rounded-xl flex items-center justify-center text-xs text-indigo-400 font-bold">1</div>
            <div className="col-span-2 grid grid-rows-2 gap-1.5">
              <div className="bg-pink-500/20 border border-pink-500/30 rounded-xl flex items-center justify-center text-xs text-pink-400 font-bold">2</div>
              <div className="bg-teal-500/20 border border-teal-500/30 rounded-xl flex items-center justify-center text-xs text-teal-400 font-bold">3</div>
            </div>
          </div>
        );

      // 24. Grid Splitter
      case 'grid':
      case 'splitter':
      case 'instagram-grid-splitter':
        return (
          <div className="w-full h-full p-3 flex items-center justify-center bg-zinc-950">
            <div className="w-28 h-28 bg-zinc-900 border border-zinc-800 grid grid-cols-3 grid-rows-3 gap-1 p-1 shadow-md rounded-xl">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="bg-orange-500/15 border border-orange-500/20 rounded-sm flex items-center justify-center text-[9px] text-orange-400 font-black">
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        );

      // 25. Compressor
      case 'compressor':
      case 'image-compressor':
        return (
          <div className="w-full h-full flex items-center justify-center gap-3 bg-zinc-950 px-4">
            <div className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-center flex flex-col">
              <span className="text-[8px] text-zinc-500 font-bold uppercase">Original</span>
              <span className="text-xs text-zinc-300 font-extrabold">4.8 MB</span>
            </div>
            <div className="text-indigo-400">
              <ArrowRight className="w-5 h-5" />
            </div>
            <div className="px-3 py-2 bg-indigo-950/70 border border-indigo-500/40 rounded-xl text-center flex flex-col shadow-lg shadow-indigo-500/20">
              <span className="text-[8px] text-emerald-400 font-bold uppercase">-91% Saved</span>
              <span className="text-xs text-indigo-300 font-extrabold">420 KB</span>
            </div>
          </div>
        );

      // 26. Batch Converter
      case 'converter':
      case 'batch-converter':
        return (
          <div className="w-full h-full relative flex items-center justify-center bg-zinc-950">
            <div className="flex -space-x-3 relative">
              <div className="w-11 h-16 rounded-lg bg-zinc-900 border border-zinc-700 shadow-md flex items-center justify-center text-[9px] font-bold text-rose-400 rotate-[-8deg]">PNG</div>
              <div className="w-11 h-16 rounded-lg bg-zinc-900 border border-zinc-700 shadow-lg flex items-center justify-center text-[9px] font-bold text-sky-400 rotate-[4deg] z-10">WEBP</div>
              <div className="w-11 h-16 rounded-lg bg-indigo-600 text-white shadow-xl flex flex-col items-center justify-center text-xs font-black rotate-[14deg] z-20">
                <span>PDF</span>
              </div>
            </div>
          </div>
        );

      // 27. Photo Mosaic
      case 'mosaic':
      case 'photo-mosaic-generator':
        return (
          <div className="w-full h-full p-3 flex items-center justify-center bg-zinc-950">
            <div className="w-32 h-24 bg-zinc-900 border border-zinc-800 grid grid-cols-6 grid-rows-4 gap-0.5 p-1 rounded-xl shadow-lg">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className={`rounded-none opacity-80 ${i % 2 === 0 ? 'bg-indigo-500/40' : 'bg-purple-500/40'}`} />
              ))}
            </div>
          </div>
        );

      // 28. Palette Extractor
      case 'palette':
      case 'color-palette-extractor':
        return (
          <div className="w-full h-full p-4 flex flex-col justify-center gap-2 bg-zinc-950">
            <div className="flex h-12 rounded-xl overflow-hidden border border-zinc-800 shadow-md">
              <div className="flex-1 bg-[#1e293b]" />
              <div className="flex-1 bg-[#6366f1]" />
              <div className="flex-1 bg-[#a855f7]" />
              <div className="flex-1 bg-[#ec4899]" />
              <div className="flex-1 bg-[#f43f5e]" />
            </div>
            <div className="flex justify-between font-mono text-[8px] text-zinc-400 px-1">
              <span>#1E293B</span>
              <span>#6366F1</span>
              <span>#A855F7</span>
              <span>#EC4899</span>
              <span>#F43F5E</span>
            </div>
          </div>
        );

      // Default Fallback
      default:
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 text-indigo-400 p-4">
            <ImageIcon className="w-10 h-10 mb-2 opacity-60" />
            <span className="text-xs font-bold text-slate-400">Interactive Preview</span>
          </div>
        );
    }
  };

  return (
    <div 
      className={`my-5 rounded-2xl overflow-hidden aspect-[4/3] border border-slate-200/60 dark:border-slate-800/80 shadow-md relative select-none bg-[#09090b] transition-all duration-300 group hover:shadow-xl hover:shadow-indigo-500/10 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* If an explicit media (GIF/image) was provided and didn't 404, display it */}
      {hasExplicitMedia ? (
        <img 
          src={effectiveMediaSrc} 
          alt={alt} 
          onError={() => setImgError(true)}
          className={`w-full h-full object-cover transition-all duration-500 ${isHovered ? 'scale-102 brightness-105' : ''}`}
          loading="lazy" 
        />
      ) : (
        renderInteractiveDemo()
      )}

      {/* Floating Micro-Badge */}
      <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-white/10 text-[8px] font-mono font-bold text-slate-300 opacity-80 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Live Demo
      </div>
    </div>
  );
};
