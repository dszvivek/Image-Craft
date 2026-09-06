import React, { useState, useRef, useCallback } from 'react';
import { Cpu, ImageIcon, ShieldAlert, SlidersHorizontal, ArrowLeftRight } from 'lucide-react';

interface ShowcasePreset {
  id: string;
  title: string;
  badge: string;
  leftLabel: string;
  rightLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const PRESETS: ShowcasePreset[] = [
  {
    id: 'cutout',
    title: 'AI Background Cutout',
    badge: 'Neural WASM',
    leftLabel: 'Original Photo',
    rightLabel: 'AI Cutout (Transparent)',
    icon: Cpu,
    description: 'Local neural network detects subject boundaries and strips backgrounds in browser RAM with sub-pixel edge matting.'
  },
  {
    id: 'compress',
    title: 'Lossless Compression',
    badge: '-91% File Size',
    leftLabel: 'Raw JPEG (4.8 MB)',
    rightLabel: 'Optimized WebP (420 KB)',
    icon: ImageIcon,
    description: 'Intelligent chroma subsampling and WebP encoding removes invisible redundancies while keeping 100% optical clarity.'
  },
  {
    id: 'censor',
    title: 'Irreversible Redaction',
    badge: 'Zero Recovery',
    leftLabel: 'Sensitive Document',
    rightLabel: 'Obliterated Redaction',
    icon: ShieldAlert,
    description: 'Destroys pixel data under censorship boxes permanently before saving — preventing any digital recovery.'
  }
];

export const HeroInteractiveShowcase: React.FC = () => {
  const [activePreset, setActivePreset] = useState<string>('cutout');
  const [sliderPosition, setSliderPosition] = useState<number>(52);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const preset = PRESETS.find(p => p.id === activePreset) || PRESETS[0];

  const handlePointerMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSliderPosition(percent);
  }, []);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handlePointerMove(e.clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handlePointerMove(e.touches[0].clientX);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 mt-6 mb-12">
      {/* Preset Selector Tabs */}
      <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
        {PRESETS.map((p) => {
          const Icon = p.icon;
          const isActive = activePreset === p.id;
          return (
            <button
              key={p.id}
              onClick={() => {
                setActivePreset(p.id);
                setSliderPosition(50);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                isActive
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-md'
                  : 'bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{p.title}</span>
              <span className={`text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded-full ${
                isActive ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
              }`}>
                {p.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Interactive Split Comparison Frame */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className="relative w-full h-72 sm:h-80 md:h-96 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-indigo-500/5 select-none bg-slate-950 cursor-ew-resize group"
      >
        {/* RIGHT LAYER (Processed Outcome) */}
        <div className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden">
          {activePreset === 'cutout' && (
            // Checkerboard cutout outcome
            <div className="w-full h-full relative flex items-center justify-center">
              <div 
                className="absolute inset-0"
                style={{
                  backgroundImage: 'linear-gradient(45deg, #1e2230 25%, transparent 25%), linear-gradient(-45deg, #1e2230 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1e2230 75%), linear-gradient(-45deg, transparent 75%, #1e2230 75%)',
                  backgroundSize: '16px 16px',
                  backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px'
                }}
              />
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-tr from-purple-500 via-indigo-500 to-pink-500 flex items-center justify-center text-white shadow-2xl shadow-purple-500/40 border-4 border-white/20 animate-pulse-slow">
                  <Cpu className="w-16 h-16 text-white" />
                </div>
                <div className="w-48 h-12 rounded-t-3xl bg-indigo-500/40 mt-2 border-t-2 border-indigo-400/40 backdrop-blur-xs" />
              </div>
            </div>
          )}

          {activePreset === 'compress' && (
            // Compressed result: crisp details + size metrics
            <div className="w-full h-full bg-gradient-to-br from-indigo-950 via-slate-900 to-zinc-950 flex flex-col items-center justify-center p-6 text-center">
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 shadow-xl mb-3">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 block mb-1">
                  Compressed WebP
                </span>
                <span className="text-3xl font-black text-white font-mono">420 KB</span>
                <span className="text-[11px] font-bold text-emerald-300 block mt-1">91.3% Space Saved</span>
              </div>
              <span className="text-xs text-slate-400 font-medium">Original visual quality 100% retained</span>
            </div>
          )}

          {activePreset === 'censor' && (
            // Censored document outcome
            <div className="w-full h-full bg-zinc-950 flex items-center justify-center p-6">
              <div className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-800 p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 border border-red-500/40 flex items-center justify-center text-red-400">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="w-36 h-3 bg-red-950 border border-red-500/50 rounded shadow-xs" />
                    <div className="w-24 h-2.5 bg-zinc-800 rounded" />
                  </div>
                </div>
                <div className="h-4 bg-black border border-red-600/40 rounded flex items-center justify-center">
                  <span className="text-[8px] font-mono text-red-400 font-bold uppercase tracking-widest">
                    ████ SENSITIVE ID OBLITERATED ████
                  </span>
                </div>
                <div className="h-3 w-3/4 bg-black border border-red-600/40 rounded" />
              </div>
            </div>
          )}

          {/* Right Badge */}
          <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md border border-white/15 px-3 py-1 rounded-full text-[10px] font-extrabold text-white uppercase tracking-wider z-20">
            {preset.rightLabel}
          </div>
        </div>

        {/* LEFT LAYER (Original Image clipped by slider position) */}
        <div
          className="absolute inset-0 h-full overflow-hidden z-10"
          style={{ width: `${sliderPosition}%` }}
        >
          <div 
            className="w-full h-full flex items-center justify-center relative overflow-hidden"
            style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%' }}
          >
            {activePreset === 'cutout' && (
              // Original with messy solid backdrop
              <div className="w-full h-full bg-gradient-to-tr from-amber-700 via-emerald-800 to-teal-900 flex flex-col items-center justify-center">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-tr from-purple-500 via-indigo-500 to-pink-500 flex items-center justify-center text-white shadow-2xl border-4 border-white/20">
                  <Cpu className="w-16 h-16 text-white" />
                </div>
                <div className="w-48 h-12 rounded-t-3xl bg-indigo-500/40 mt-2 border-t-2 border-indigo-400/40" />
              </div>
            )}

            {activePreset === 'compress' && (
              // Raw JPEG heavy file
              <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-900 to-zinc-900 flex flex-col items-center justify-center p-6 text-center">
                <div className="p-4 rounded-2xl bg-zinc-900/80 border border-slate-700 shadow-xl mb-3">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                    Uncompressed JPEG
                  </span>
                  <span className="text-3xl font-black text-slate-200 font-mono">4.8 MB</span>
                  <span className="text-[11px] font-bold text-rose-400 block mt-1">High Bandwidth Cost</span>
                </div>
                <span className="text-xs text-slate-400 font-medium">Heavy original capture</span>
              </div>
            )}

            {activePreset === 'censor' && (
              // Uncensored exposed data
              <div className="w-full h-full bg-zinc-950 flex items-center justify-center p-6">
                <div className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-800 p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-200 block">Jane Doe Passport #4920</span>
                      <span className="text-[10px] text-slate-400 block">Exposed Personal Identification</span>
                    </div>
                  </div>
                  <div className="h-4 bg-slate-800 rounded px-2 text-[8px] font-mono text-slate-300 flex items-center">
                    SSN: 849-20-4910 (EXPOSED)
                  </div>
                  <div className="h-3 w-3/4 bg-slate-800 rounded" />
                </div>
              </div>
            )}

            {/* Left Badge */}
            <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md border border-white/15 px-3 py-1 rounded-full text-[10px] font-extrabold text-white uppercase tracking-wider z-20">
              {preset.leftLabel}
            </div>
          </div>
        </div>

        {/* SLIDER DIVIDER LINE & THUMB HANDLE */}
        <div
          className="absolute inset-y-0 w-0.5 bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)] z-30 pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white text-slate-900 shadow-xl flex items-center justify-center border-2 border-indigo-500 cursor-ew-resize">
            <ArrowLeftRight className="w-4 h-4 text-indigo-600" />
          </div>
        </div>

        {/* Bottom Helper Hint */}
        <div className="absolute bottom-3 inset-x-0 flex justify-center z-20 pointer-events-none">
          <span className="text-[10px] font-bold text-white/80 bg-black/50 backdrop-blur-xs px-3 py-1 rounded-full flex items-center gap-1.5">
            <SlidersHorizontal className="w-3 h-3" />
            <span>Drag slider to compare Before & After</span>
          </span>
        </div>

      </div>

      {/* Preset Explainer Caption */}
      <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-3 max-w-xl mx-auto font-medium">
        {preset.description}
      </p>
    </div>
  );
};
