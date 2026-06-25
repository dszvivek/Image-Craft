import React from 'react';
import { 
  Cpu, FileText, Image as ImageIcon, Smile, Check, Shield
} from 'lucide-react';


// ==========================================
// 1. AI BACKGROUND REMOVER ANIMATION
// ==========================================
export const BgRemoverAnimation: React.FC = () => {
  return (
    <div className="relative w-full h-full bg-[#0c0c0e] flex items-center justify-center">
      {/* Scope Style */}
      <style>{`
        @keyframes sweepLine {
          0%, 100% { left: 10%; }
          50% { left: 90%; }
        }
        @keyframes clipReveal {
          0%, 100% { clip-path: inset(0 0 0 10%); }
          50% { clip-path: inset(0 0 0 90%); }
        }
      `}</style>
      
      {/* Grid Checkerboard Background for cutout */}
      <div 
        className="absolute inset-0 opacity-25" 
        style={{
          backgroundImage: 'conic-gradient(#27272a 0.25turn, transparent 0.25turn 0.5turn, #27272a 0.5turn 0.75turn, transparent 0.75turn)',
          backgroundSize: '12px 12px'
        }}
      />
      
      {/* Cutout Portrait (Centered) */}
      <div className="relative w-36 h-48 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800">
        {/* Cutout Image (Base Layer - background is removed) */}
        <div className="absolute inset-0 bg-transparent flex items-center justify-center">
          <div className="w-24 h-32 rounded-full bg-indigo-500/10 border-2 border-indigo-400/50 flex items-center justify-center text-indigo-400 animate-pulse">
            <Cpu className="w-8 h-8 opacity-60" />
          </div>
        </div>
        
        {/* Original Image (Masked Layer - revealed dynamically) */}
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            animation: 'clipReveal 5s ease-in-out infinite',
            clipPath: 'inset(0 0 0 10%)'
          }}
        >
          <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-500">
            <div className="w-24 h-32 rounded-full bg-zinc-700 flex items-center justify-center">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Portrait</span>
            </div>
          </div>
        </div>

        {/* Floating AI Badges */}
        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-[8px] font-bold text-zinc-300">Original</div>
        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-indigo-650/80 text-[8px] font-bold text-white">Cutout</div>

        {/* Scan Bar */}
        <div 
          className="absolute inset-y-0 w-[2px] bg-indigo-400 shadow-[0_0_12px_#818cf8] pointer-events-none"
          style={{
            animation: 'sweepLine 5s ease-in-out infinite',
            left: '10%'
          }}
        />
      </div>
    </div>
  );
};

// ==========================================
// 2. PHOTO MOSAIC GENERATOR ANIMATION
// ==========================================
export const MosaicAnimation: React.FC = () => {
  return (
    <div className="relative w-full h-full bg-[#0c0c0e] flex items-center justify-center p-4">
      <style>{`
        @keyframes mosaicPulse {
          0%, 100% { opacity: 0.2; transform: scale(0.9); }
          50% { opacity: 0.85; transform: scale(1.02); }
        }
        @keyframes gridScanner {
          0% { top: 0%; opacity: 0; }
          10%, 90% { opacity: 1; }
          50% { top: 100%; }
          100% { top: 0%; opacity: 0; }
        }
      `}</style>
      
      {/* Background container representing an image */}
      <div className="relative w-44 h-44 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900/60 p-2 grid grid-cols-10 grid-rows-10 gap-[2px]">
        {Array.from({ length: 100 }).map((_, i) => {
          const colors = [
            'bg-indigo-650/40', 'bg-sky-500/30', 'bg-teal-500/35', 
            'bg-purple-500/40', 'bg-fuchsia-500/30', 'bg-indigo-400/50'
          ];
          const delay = (i % 7) * 120 + (i % 5) * 80;
          return (
            <div 
              key={i} 
              className={`rounded-xs ${colors[i % colors.length]}`} 
              style={{
                animation: 'mosaicPulse 4s ease-in-out infinite',
                animationDelay: `${delay}ms`
              }}
            />
          );
        })}

        {/* Laser scanner grid overlay */}
        <div 
          className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_10px_#818cf8] pointer-events-none"
          style={{
            animation: 'gridScanner 6s ease-in-out infinite'
          }}
        />
        
        {/* Central Overlay Indicator */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="px-3 py-1 rounded bg-zinc-950/90 border border-zinc-800 text-[8px] font-black text-indigo-400 uppercase tracking-widest shadow-xl">
            Composing Tiles
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. ASPECT RESIZER & SMART CROP ANIMATION
// ==========================================
export const CropAnimation: React.FC = () => {
  return (
    <div className="relative w-full h-full bg-[#0c0c0e] flex items-center justify-center">
      <style>{`
        @keyframes cropContainer {
          0%, 100% { width: 140px; height: 140px; }
          33% { width: 180px; height: 100px; }
          66% { width: 100px; height: 160px; }
        }
      `}</style>
      
      {/* Dimmed Background image representation */}
      <div className="w-48 h-44 rounded-2xl bg-zinc-900 border border-zinc-850 flex items-center justify-center overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
        
        {/* Dynamic Bounding Box */}
        <div 
          className="rounded-xl border-2 border-indigo-400/80 bg-zinc-950/20 flex flex-col justify-between p-1.5 shadow-[0_0_24px_rgba(99,102,241,0.15)] relative overflow-hidden transition-all duration-700"
          style={{
            animation: 'cropContainer 6s ease-in-out infinite',
            boxShadow: '0 0 0 9999px rgba(12, 12, 14, 0.65)'
          }}
        >
          {/* Rule of Thirds Grid Lines */}
          <div className="absolute inset-y-0 left-1/3 w-[1px] border-l border-dashed border-indigo-400/30" />
          <div className="absolute inset-y-0 right-1/3 w-[1px] border-r border-dashed border-indigo-400/30" />
          <div className="absolute inset-x-0 top-1/3 h-[1px] border-t border-dashed border-indigo-400/30" />
          <div className="absolute inset-x-0 bottom-1/3 h-[1px] border-b border-dashed border-indigo-400/30" />

          {/* Smart handles */}
          <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-indigo-400" />
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-indigo-400" />
          <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-indigo-400" />
          <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-indigo-400" />
          
          <div className="m-auto text-[9px] font-black text-indigo-400 uppercase tracking-widest bg-zinc-950/80 px-2 py-0.5 rounded border border-zinc-800">
            Crop
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. SVG VECTORIZER ANIMATION
// ==========================================
export const VectorizerAnimation: React.FC = () => {
  return (
    <div className="relative w-full h-full bg-[#0c0c0e] flex items-center justify-center p-4">
      <style>{`
        @keyframes drawPath {
          0% { stroke-dashoffset: 400; fill: rgba(99, 102, 241, 0); }
          50% { stroke-dashoffset: 0; fill: rgba(99, 102, 241, 0.05); }
          80%, 100% { stroke-dashoffset: 0; fill: rgba(99, 102, 241, 0.15); }
        }
        @keyframes anchorPulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.3); opacity: 1; }
        }
      `}</style>
      
      {/* Vector grid backdrop */}
      <svg className="w-full h-full absolute inset-0 opacity-15" xmlns="http://www.w3.org/2000/svg">
        <pattern id="vectorGrid" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#vectorGrid)" />
      </svg>
      
      <div className="relative w-36 h-36 flex items-center justify-center z-10">
        <svg className="w-full h-full stroke-indigo-400" viewBox="0 0 100 100" fill="none">
          {/* Animated SVG Vector path (a complex flower shape) */}
          <path 
            d="M 50 15 C 35 25, 15 45, 15 60 C 15 75, 30 85, 50 85 C 70 85, 85 75, 85 60 C 85 45, 65 25, 50 15 Z" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={{
              strokeDasharray: '400',
              strokeDashoffset: '400',
              animation: 'drawPath 5s cubic-bezier(0.4, 0, 0.2, 1) infinite'
            }}
          />
          {/* Anchor Points */}
          <g style={{ animation: 'anchorPulse 2s infinite', transformOrigin: '50px 15px' }}>
            <circle cx="50" cy="15" r="3" className="fill-white stroke-indigo-600 stroke-2" />
          </g>
          <g style={{ animation: 'anchorPulse 2s infinite 0.5s', transformOrigin: '15px 60px' }}>
            <circle cx="15" cy="60" r="3" className="fill-white stroke-indigo-600 stroke-2" />
          </g>
          <g style={{ animation: 'anchorPulse 2s infinite 1s', transformOrigin: '50px 85px' }}>
            <circle cx="50" cy="85" r="3" className="fill-white stroke-indigo-600 stroke-2" />
          </g>
          <g style={{ animation: 'anchorPulse 2s infinite 1.5s', transformOrigin: '85px 60px' }}>
            <circle cx="85" cy="60" r="3" className="fill-white stroke-indigo-600 stroke-2" />
          </g>
        </svg>

        <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[6.5px] font-black text-indigo-400 uppercase tracking-widest">
          SVG output
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 5. OCR TEXT EXTRACTOR ANIMATION
// ==========================================
export const OcrAnimation: React.FC = () => {
  return (
    <div className="relative w-full h-full bg-[#0c0c0e] flex items-center justify-center p-4">
      <style>{`
        @keyframes laserScan {
          0%, 100% { top: 15%; opacity: 0.1; }
          10% { opacity: 1; }
          50% { top: 85%; opacity: 1; }
          90% { opacity: 1; }
        }
        @keyframes textReveal {
          0%, 100% { opacity: 0.35; filter: blur(1px); }
          50% { opacity: 1; filter: blur(0px); color: #818cf8; }
        }
      `}</style>
      
      {/* Mock Document Card */}
      <div className="w-44 h-40 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden shadow-2xl">
        <div className="space-y-2">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-850">
            <span className="text-[7px] font-extrabold text-zinc-500 uppercase tracking-widest">OCR SCANNER</span>
            <FileText className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          
          <div className="space-y-1.5 pt-1">
            <div 
              className="w-full h-2 rounded bg-zinc-850"
              style={{ animation: 'textReveal 4s ease-in-out infinite' }}
            />
            <div 
              className="w-5/6 h-2 rounded bg-zinc-850"
              style={{ animation: 'textReveal 4s ease-in-out infinite 0.3s' }}
            />
            <div 
              className="w-11/12 h-2 rounded bg-zinc-850"
              style={{ animation: 'textReveal 4s ease-in-out infinite 0.6s' }}
            />
            <div 
              className="w-3/4 h-2 rounded bg-indigo-500/20"
              style={{ animation: 'textReveal 4s ease-in-out infinite 0.9s' }}
            />
          </div>
        </div>

        {/* Scanned result box */}
        <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-2 text-left">
          <span className="text-[6.5px] font-bold text-zinc-500 uppercase tracking-wider block mb-0.5">Parsed Text</span>
          <span className="text-[8px] font-black text-indigo-400 font-mono tracking-wider animate-pulse">
            EXTRACTING TEXT...
          </span>
        </div>

        {/* Laser scanner line */}
        <div 
          className="absolute left-0 right-0 h-[2px] bg-indigo-400 shadow-[0_0_12px_#818cf8] z-20 pointer-events-none"
          style={{
            animation: 'laserScan 4s ease-in-out infinite',
            top: '15%'
          }}
        />
      </div>
    </div>
  );
};

// ==========================================
// 6. BANK STATEMENT ANALYZER ANIMATION
// ==========================================
export const StatementAnimation: React.FC = () => {
  return (
    <div className="relative w-full h-full bg-[#0c0c0e] flex items-center justify-center p-4">
      <style>{`
        @keyframes chartDraw {
          0% { stroke-dashoffset: 200; fill: rgba(16, 185, 129, 0); }
          50%, 100% { stroke-dashoffset: 0; fill: rgba(16, 185, 129, 0.08); }
        }
      `}</style>
      
      <div className="w-48 h-36 bg-zinc-900 border border-zinc-800 rounded-2xl p-3 flex flex-col justify-between shadow-2xl relative">
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[7px] font-bold text-zinc-400 border-b border-zinc-800 pb-1">
            <span>Transaction</span>
            <span className="text-right">Value</span>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-[8px] font-bold text-zinc-200">
              <span className="truncate max-w-[80px]">Client Payout</span>
              <span className="text-emerald-500 font-extrabold">+$1,450.00</span>
            </div>
            <div className="flex justify-between text-[8px] font-bold text-zinc-300">
              <span className="truncate max-w-[80px]">AWS Web Services</span>
              <span className="text-rose-500 font-extrabold">-$120.40</span>
            </div>
          </div>
        </div>

        {/* Vector Statement Chart */}
        <div className="h-14 border-t border-dashed border-zinc-800 relative flex items-end">
          <svg className="w-full h-full absolute inset-0 stroke-emerald-500 fill-emerald-500/10" viewBox="0 0 100 30" preserveAspectRatio="none">
            <path 
              d="M0,28 L20,25 L40,15 L60,20 L80,5 L100,2 Z" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{
                strokeDasharray: '200',
                strokeDashoffset: '200',
                animation: 'chartDraw 4s ease-in-out infinite'
              }}
            />
          </svg>
          <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[6.5px] font-black text-emerald-450 uppercase tracking-widest">
            Net Surplus: +$1,329.60
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 7. IMAGE COMPRESSOR ANIMATION
// ==========================================
export const CompressorAnimation: React.FC = () => {
  return (
    <div className="relative w-full h-full bg-[#0c0c0e] flex items-center justify-center p-4">
      <style>{`
        @keyframes shrinkCard {
          0%, 100% { transform: scale(1.05); }
          50% { transform: scale(0.9); }
        }
        @keyframes shrinkNumber {
          0%, 100% { content: "5.2 MB"; color: #ef4444; }
          50% { content: "320 KB"; color: #10b981; }
        }
      `}</style>
      
      <div 
        className="w-40 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3 shadow-2xl relative z-10"
        style={{ animation: 'shrinkCard 5s ease-in-out infinite' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/35 flex items-center justify-center text-indigo-400">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div className="space-y-0.5 text-left">
            <div className="text-[10px] font-bold text-zinc-200">photo_compress.jpg</div>
            <div className="text-[8px] text-zinc-500">Lossy Quantization</div>
          </div>
        </div>
        
        <div className="h-[1px] bg-zinc-800" />
        
        <div className="flex items-center justify-between text-[10px] font-extrabold">
          <span className="text-zinc-400">File Weight</span>
          {/* Dynamic text reveal representing compression sizing */}
          <span 
            className="font-mono tracking-wider"
            style={{
              animation: 'shrinkNumber 5s steps(1) infinite'
            }}
          >
            5.2 MB
          </span>
        </div>
        
        <div className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400 text-[8px] font-black tracking-wider uppercase text-center w-full">
          Optimizing Layout...
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 8. BATCH CONVERTER ANIMATION
// ==========================================
export const ConverterAnimation: React.FC = () => {
  return (
    <div className="relative w-full h-full bg-[#0c0c0e] flex items-center justify-center p-4">
      <style>{`
        @keyframes fileFly1 {
          0% { transform: translate(-30px, -20px) rotate(-15deg); opacity: 0; }
          20%, 80% { transform: translate(-15px, -10px) rotate(-8deg); opacity: 1; }
          100% { transform: translate(0px, 0px) rotate(0deg); opacity: 0; }
        }
        @keyframes fileFly2 {
          0% { transform: translate(30px, -20px) rotate(15deg); opacity: 0; }
          20%, 80% { transform: translate(15px, -5px) rotate(8deg); opacity: 1; }
          100% { transform: translate(0px, 0px) rotate(0deg); opacity: 0; }
        }
        @keyframes docMerge {
          0%, 30% { transform: scale(0.9); opacity: 0.4; }
          50%, 80% { transform: scale(1.05); opacity: 1; border-color: #818cf8; }
          100% { transform: scale(0.9); opacity: 0.4; }
        }
      `}</style>
      
      <div className="relative flex items-center justify-center w-40 h-32">
        {/* Floating Input files */}
        <div 
          className="absolute w-12 h-16 rounded bg-zinc-800 border border-zinc-700 shadow-lg flex items-center justify-center text-[7px] font-bold text-rose-500 z-10"
          style={{ animation: 'fileFly1 4s ease-in-out infinite' }}
        >
          PNG
        </div>
        
        <div 
          className="absolute w-12 h-16 rounded bg-zinc-800 border border-zinc-700 shadow-md flex items-center justify-center text-[7px] font-bold text-sky-500 z-15"
          style={{ animation: 'fileFly2 4s ease-in-out infinite 0.5s' }}
        >
          WEBP
        </div>

        {/* Merged output PDF package */}
        <div 
          className="absolute w-14 h-18 rounded-lg bg-indigo-650 text-white shadow-2xl flex flex-col items-center justify-center border-2 border-indigo-400 z-20"
          style={{ animation: 'docMerge 4s ease-in-out infinite' }}
        >
          <span className="text-[9px] font-black tracking-widest">PDF</span>
          <div className="w-6 h-0.5 bg-white/40 mt-1.5 rounded" />
          <div className="w-4 h-0.5 bg-white/40 mt-1 rounded" />
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 9. PHOTO COLLAGE MAKER ANIMATION
// ==========================================
export const CollageAnimation: React.FC = () => {
  return (
    <div className="relative w-full h-full bg-[#0c0c0e] flex items-center justify-center p-4">
      <style>{`
        @keyframes collageGap {
          0%, 100% { gap: 8px; padding: 12px; }
          50% { gap: 2px; padding: 4px; }
        }
        @keyframes blockSlide {
          0%, 100% { transform: scale(0.95); }
          50% { transform: scale(1); }
        }
      `}</style>
      
      {/* Collage Frame */}
      <div 
        className="w-44 h-36 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden grid grid-cols-3 relative"
        style={{
          animation: 'collageGap 5s ease-in-out infinite'
        }}
      >
        <div 
          className="bg-indigo-500/10 border border-indigo-500/25 rounded-lg flex items-center justify-center text-[10px] text-indigo-400 font-bold"
          style={{ animation: 'blockSlide 5s ease-in-out infinite' }}
        >
          A
        </div>
        
        <div className="col-span-2 grid grid-rows-2 gap-inherit">
          <div 
            className="bg-sky-500/10 border border-sky-500/25 rounded-lg flex items-center justify-center text-[9px] text-sky-400 font-bold"
            style={{ animation: 'blockSlide 5s ease-in-out infinite 0.2s' }}
          >
            B
          </div>
          <div 
            className="bg-teal-500/10 border border-teal-500/25 rounded-lg flex items-center justify-center text-[9px] text-teal-400 font-bold"
            style={{ animation: 'blockSlide 5s ease-in-out infinite 0.4s' }}
          >
            C
          </div>
        </div>

        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-zinc-950/80 border border-zinc-800 text-[6px] font-black text-indigo-400 uppercase tracking-widest">
          Collage Grid
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 10. COLOR PALETTE EXTRACTOR ANIMATION
// ==========================================
export const PaletteAnimation: React.FC = () => {
  return (
    <div className="relative w-full h-full bg-[#0c0c0e] flex flex-col items-center justify-center p-4">
      <style>{`
        @keyframes dropperPulse {
          0%, 100% { transform: scale(0.9); opacity: 0.3; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        @keyframes swatchReveal {
          0%, 100% { transform: translateY(10px); opacity: 0; }
          50% { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      
      {/* Photo box overlayed with sampler pins */}
      <div className="relative w-44 h-24 bg-zinc-900 border border-zinc-850 rounded-xl overflow-hidden mb-3">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/30 via-teal-900/10 to-pink-900/20" />
        
        {/* Droppers pins */}
        <div 
          className="absolute top-6 left-10 w-3 h-3 bg-indigo-500 border-2 border-white rounded-full shadow-[0_0_8px_#6366f1]"
          style={{ animation: 'dropperPulse 3s ease-in-out infinite' }}
        />
        <div 
          className="absolute bottom-6 left-24 w-3 h-3 bg-teal-400 border-2 border-white rounded-full shadow-[0_0_8px_#2dd4bf]"
          style={{ animation: 'dropperPulse 3s ease-in-out infinite 0.8s' }}
        />
        <div 
          className="absolute top-10 right-8 w-3 h-3 bg-pink-500 border-2 border-white rounded-full shadow-[0_0_8px_#ec4899]"
          style={{ animation: 'dropperPulse 3s ease-in-out infinite 1.6s' }}
        />
      </div>

      {/* Extracted Swatches */}
      <div 
        className="flex gap-1 justify-center z-10"
        style={{ animation: 'swatchReveal 3s cubic-bezier(0.16, 1, 0.3, 1) infinite' }}
      >
        <div className="w-7 h-7 rounded bg-indigo-900 border border-zinc-850 shadow-xs" />
        <div className="w-7 h-7 rounded bg-indigo-500 border border-zinc-850 shadow-xs" />
        <div className="w-7 h-7 rounded bg-teal-400 border border-zinc-850 shadow-xs" />
        <div className="w-7 h-7 rounded bg-pink-500 border border-zinc-850 shadow-xs" />
        <div className="w-7 h-7 rounded bg-zinc-900 border border-zinc-850 shadow-xs" />
      </div>
    </div>
  );
};

// ==========================================
// 11. WATERMARK OVERLAY ANIMATION
// ==========================================
export const WatermarkAnimation: React.FC = () => {
  return (
    <div className="relative w-full h-full bg-[#0c0c0e] flex items-center justify-center overflow-hidden">
      <style>{`
        @keyframes diagonalMarquee {
          0% { transform: translate(-10px, -10px); }
          100% { transform: translate(10px, 10px); }
        }
      `}</style>
      
      {/* Background Graphic */}
      <div className="w-44 h-36 bg-zinc-900 border border-zinc-850 rounded-2xl relative overflow-hidden flex items-center justify-center">
        {/* Diagonal repeating copyright overlay */}
        <div 
          className="absolute inset-0 flex flex-col justify-center gap-4 rotate-[-20deg] scale-125 opacity-20 pointer-events-none"
          style={{
            animation: 'diagonalMarquee 15s linear infinite'
          }}
        >
          <div className="text-[7px] text-white font-extrabold tracking-widest whitespace-nowrap">
            IMAGE CRAFT • COPYRIGHT • PRIVATE
          </div>
          <div className="text-[7px] text-white font-extrabold tracking-widest whitespace-nowrap translate-x-4">
            IMAGE CRAFT • COPYRIGHT • PRIVATE
          </div>
          <div className="text-[7px] text-white font-extrabold tracking-widest whitespace-nowrap -translate-x-2">
            IMAGE CRAFT • COPYRIGHT • PRIVATE
          </div>
        </div>

        {/* Centered Protected Tag */}
        <div className="px-3 py-1 bg-zinc-950/80 border border-zinc-800 rounded-lg text-[8px] font-black text-indigo-400 uppercase tracking-widest shadow-lg">
          Protected
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 12. EXIF METADATA STRIPPER ANIMATION
// ==========================================
export const StripperAnimation: React.FC = () => {
  return (
    <div className="relative w-full h-full bg-[#0c0c0e] flex items-center justify-center p-4">
      <style>{`
        @keyframes dataStrip {
          0%, 30% { opacity: 1; filter: blur(0px); color: #ef4444; }
          50%, 80% { opacity: 0.15; filter: blur(1.5px); color: #71717a; }
          100% { opacity: 1; filter: blur(0px); color: #ef4444; }
        }
        @keyframes shieldSweep {
          0%, 100% { opacity: 0.3; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.1); color: #10b981; }
        }
      `}</style>
      
      <div className="w-48 h-36 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between shadow-2xl relative">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[7px] font-bold text-zinc-500 border-b border-zinc-800 pb-1.5">
            <span>EXIF METADATA</span>
            <Shield className="w-3.5 h-3.5 text-zinc-400" style={{ animation: 'shieldSweep 4s ease-in-out infinite' }} />
          </div>
          
          <div className="space-y-1 pt-1 text-[8.5px] font-mono text-zinc-350 text-left">
            <div className="flex justify-between">
              <span>GPS Lat:</span>
              <span className="font-bold" style={{ animation: 'dataStrip 4s ease-in-out infinite' }}>
                40.7128° N
              </span>
            </div>
            <div className="flex justify-between">
              <span>GPS Long:</span>
              <span className="font-bold" style={{ animation: 'dataStrip 4s ease-in-out infinite' }}>
                -74.0060° W
              </span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Camera:</span>
              <span>Apple iPhone 15</span>
            </div>
          </div>
        </div>

        {/* Clean status */}
        <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-2 flex items-center justify-between">
          <span className="text-[6.5px] font-bold text-zinc-500 uppercase tracking-wider">Audit Security</span>
          <span className="text-[8px] font-black text-emerald-450 font-sans tracking-widest flex items-center gap-1 animate-pulse">
            <Check className="w-2.5 h-2.5" /> STRIPPED
          </span>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 13. INSTAGRAM GRID SPLITTER ANIMATION
// ==========================================
export const SplitterAnimation: React.FC = () => {
  return (
    <div className="relative w-full h-full bg-[#0c0c0e] flex items-center justify-center p-4">
      <style>{`
        @keyframes tileSplit {
          0%, 100% { gap: 1px; padding: 2px; }
          50% { gap: 6px; padding: 8px; }
        }
      `}</style>
      
      {/* 3x3 Tile Grid */}
      <div 
        className="w-36 h-36 bg-zinc-900 border border-zinc-800 rounded-xl grid grid-cols-3 grid-rows-3 gap-[1px] p-0.5 relative transition-all duration-700"
        style={{
          animation: 'tileSplit 5s ease-in-out infinite'
        }}
      >
        {Array.from({ length: 9 }).map((_, i) => (
          <div 
            key={i} 
            className="bg-indigo-500/10 border border-indigo-500/20 rounded-md flex items-center justify-center text-[8px] text-indigo-400 font-black relative"
          >
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 14. MEME GENERATOR ANIMATION
// ==========================================
export const MemeAnimation: React.FC = () => {
  return (
    <div className="relative w-full h-full bg-[#0c0c0e] flex items-center justify-center p-4">
      <style>{`
        @keyframes fontPop {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
      `}</style>
      
      {/* Mock Image container */}
      <div className="w-44 h-36 rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden relative flex flex-col justify-between p-2">
        {/* Top text */}
        <div 
          className="text-center text-[10px] font-black text-white uppercase tracking-wider"
          style={{
            fontFamily: 'Impact, sans-serif',
            textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 1.5px 3px rgba(0,0,0,0.8)',
            animation: 'fontPop 4s ease-in-out infinite'
          }}
        >
          Offline Image Suite
        </div>
        
        {/* Meme Image Placeholder (funny face/sunglasses emoji) */}
        <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/25 rounded-full flex items-center justify-center m-auto text-indigo-400 animate-bounce">
          <Smile className="w-6 h-6" />
        </div>

        {/* Bottom text */}
        <div 
          className="text-center text-[10px] font-black text-white uppercase tracking-wider"
          style={{
            fontFamily: 'Impact, sans-serif',
            textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 1.5px 3px rgba(0,0,0,0.8)',
            animation: 'fontPop 4s ease-in-out infinite 0.5s'
          }}
        >
          No Server Uploads
        </div>
      </div>
    </div>
  );
};

// ==========================================
// DYNAMIC DISPATCHER COMPONENT
// ==========================================
interface DemoAnimationProps {
  toolId: string;
}

export const DemoAnimation: React.FC<DemoAnimationProps> = ({ toolId }) => {
  switch (toolId) {
    case 'bg-remover':
      return <BgRemoverAnimation />;
    case 'mosaic':
      return <MosaicAnimation />;
    case 'crop':
      return <CropAnimation />;
    case 'vectorizer':
      return <VectorizerAnimation />;
    case 'ocr':
      return <OcrAnimation />;
    case 'statement':
      return <StatementAnimation />;
    case 'compressor':
      return <CompressorAnimation />;
    case 'converter':
      return <ConverterAnimation />;
    case 'collage':
      return <CollageAnimation />;
    case 'palette':
      return <PaletteAnimation />;
    case 'watermark':
      return <WatermarkAnimation />;
    case 'stripper':
      return <StripperAnimation />;
    case 'splitter':
      return <SplitterAnimation />;
    case 'meme':
      return <MemeAnimation />;
    default:
      return (
        <div className="relative w-full h-full bg-[#0c0c0e] flex items-center justify-center text-zinc-500">
          <ImageIcon className="w-12 h-12 opacity-30" />
        </div>
      );
  }
};
