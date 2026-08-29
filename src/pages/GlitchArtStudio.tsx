import React, { useState, useEffect, useRef } from 'react';
import { Download, RefreshCw, Zap, Eye, Sparkles, Minus, Plus, Shuffle } from 'lucide-react';
import { DropZone } from '../components/DropZone';
import { SEO } from '../components/SEO';
import { ToolGuide } from '../components/ToolGuide';
import { DemoPreview } from '../components/DemoPreview';

interface GlitchArtStudioProps {
  pageTitle?: string;
  pageSubtitle?: string;
}

export const GlitchArtStudio: React.FC<GlitchArtStudioProps> = ({
  pageTitle,
  pageSubtitle,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Glitch Parameters
  const [rgbShift, setRgbShift] = useState<number>(18); // 0 to 60 px
  const [sliceCount, setSliceCount] = useState<number>(12); // 0 to 30 slices
  const [sliceOffset, setSliceOffset] = useState<number>(35); // 0 to 100 px
  const [scanlineOpacity, setScanlineOpacity] = useState<number>(40); // 0 to 100%
  const [noiseAmount, setNoiseAmount] = useState<number>(15); // 0 to 60%
  const [colorInvertBand, setColorInvertBand] = useState<boolean>(true);

  const [seed, setSeed] = useState<number>(42);
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const [exportFormat, setExportFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png');
  const [jpegQuality] = useState<number>(92);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
      const f = files[0];
      setFile(f);
      const url = URL.createObjectURL(f);
      setImageUrl(url);

      const img = new Image();
      img.src = url;
      img.onload = () => {
        setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
      };
    }
  };

  // Pseudo-random generator seeded for consistent render
  const seededRandom = (s: number) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };

  // Render Glitch Canvas
  useEffect(() => {
    if (!imageUrl || imageSize.width === 0 || imageSize.height === 0) return;

    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const w = imageSize.width;
      const h = imageSize.height;
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      // 1. Offscreen source buffer
      const srcCanvas = document.createElement('canvas');
      srcCanvas.width = w;
      srcCanvas.height = h;
      const srcCtx = srcCanvas.getContext('2d', { willReadFrequently: true });
      if (!srcCtx) return;
      srcCtx.drawImage(img, 0, 0, w, h);

      // 2. Perform Slice Datamoshing on srcCanvas
      if (sliceCount > 0 && sliceOffset > 0) {
        for (let i = 0; i < sliceCount; i++) {
          const sliceH = Math.floor(seededRandom(seed + i * 3) * (h * 0.12)) + 4;
          const sliceY = Math.floor(seededRandom(seed + i * 7) * (h - sliceH));
          const offset = (seededRandom(seed + i * 11) - 0.5) * 2 * sliceOffset;

          const sliceData = srcCtx.getImageData(0, sliceY, w, sliceH);
          srcCtx.putImageData(sliceData, offset, sliceY);

          // Optional Inverted slice band
          if (colorInvertBand && i === 1) {
            const invData = srcCtx.getImageData(0, sliceY, w, sliceH);
            const d = invData.data;
            for (let p = 0; p < d.length; p += 4) {
              d[p] = 255 - d[p];
              d[p + 1] = 255 - d[p + 1];
              d[p + 2] = 255 - d[p + 2];
            }
            srcCtx.putImageData(invData, offset, sliceY);
          }
        }
      }

      const baseImgData = srcCtx.getImageData(0, 0, w, h);
      const baseData = baseImgData.data;

      // 3. RGB Channel Split / Chromatic Aberration
      const outImgData = ctx.createImageData(w, h);
      const outData = outImgData.data;

      const shiftX = Math.round(rgbShift);
      const shiftY = Math.round(rgbShift * 0.35);

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;

          // Red channel shifted left/up
          const rx = Math.max(0, Math.min(w - 1, x + shiftX));
          const ry = Math.max(0, Math.min(h - 1, y + shiftY));
          const rIdx = (ry * w + rx) * 4;
          const rVal = baseData[rIdx];

          // Green channel centered
          const gVal = baseData[idx + 1];

          // Blue channel shifted right/down
          const bx = Math.max(0, Math.min(w - 1, x - shiftX));
          const by = Math.max(0, Math.min(h - 1, y - shiftY));
          const bIdx = (by * w + bx) * 4;
          const bVal = baseData[bIdx + 2];

          outData[idx] = rVal;
          outData[idx + 1] = gVal;
          outData[idx + 2] = bVal;
          outData[idx + 3] = baseData[idx + 3];
        }
      }

      ctx.putImageData(outImgData, 0, 0);

      // 4. CRT Scanlines Overlay
      if (scanlineOpacity > 0) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.globalAlpha = scanlineOpacity / 100;
        for (let y = 0; y < h; y += 4) {
          ctx.fillRect(0, y, w, 2);
        }
        ctx.restore();
      }

      // 5. Analog TV Static Noise
      if (noiseAmount > 0) {
        ctx.save();
        const noiseData = ctx.getImageData(0, 0, w, h);
        const nd = noiseData.data;
        const noiseFactor = noiseAmount * 0.7;

        for (let i = 0; i < nd.length; i += 4) {
          if (Math.random() < 0.25) {
            const grain = (Math.random() - 0.5) * noiseFactor * 4;
            nd[i] = Math.max(0, Math.min(255, nd[i] + grain));
            nd[i + 1] = Math.max(0, Math.min(255, nd[i + 1] + grain));
            nd[i + 2] = Math.max(0, Math.min(255, nd[i + 2] + grain));
          }
        }
        ctx.putImageData(noiseData, 0, 0);
        ctx.restore();
      }
    };
  }, [imageUrl, imageSize, rgbShift, sliceCount, sliceOffset, scanlineOpacity, noiseAmount, colorInvertBand, seed]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsProcessing(true);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const originalName = file?.name.replace(/\.[^/.]+$/, '') || 'glitch-art';
        const ext = exportFormat === 'image/png' ? 'png' : exportFormat === 'image/webp' ? 'webp' : 'jpg';
        a.download = `${originalName}-glitch.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
        setIsProcessing(false);
      },
      exportFormat,
      jpegQuality / 100
    );
  };

  const handleRandomGlitch = () => {
    setRgbShift(Math.floor(Math.random() * 25) + 3);
    setSliceCount(Math.floor(Math.random() * 8) + 1);
    setSliceOffset(Math.floor(Math.random() * 35) + 5);
    setScanlineOpacity(Math.floor(Math.random() * 60) + 10);
    setNoiseAmount(Math.floor(Math.random() * 40) + 5);
    setColorInvertBand(Math.random() > 0.5);
    setSeed(Math.floor(Math.random() * 10000));
  };

  const handleReset = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setFile(null);
    setImageUrl('');
    setImageSize({ width: 0, height: 0 });
    setRgbShift(8);
    setSliceCount(4);
    setSliceOffset(15);
    setScanlineOpacity(25);
    setNoiseAmount(15);
    setColorInvertBand(false);
    setSeed(42);
    setIsProcessing(false);
    setIsComparing(false);
  };

  const glitchSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Glitch Art Studio & CRT Filter - ImagePlumber',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description: 'Transform photos into aesthetic retro glitch art, VHS datamoshing, CRT TV scanlines, and RGB chromatic aberration effects online for free.',
  };

  return (
    <div className="py-8 md:py-12 max-w-7xl mx-auto px-4 sm:px-6">
      <SEO
        title={pageTitle || "Glitch Art Generator & VHS CRT Effect Online Free | ImagePlumber"}
        description={pageSubtitle || "Create aesthetic cyberpunk glitch art, RGB chromatic split, VHS scanlines, and datamosh slice effects online for free. 100% client-side."}
        schema={glitchSchema}
      />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-50 dark:bg-pink-950/50 border border-pink-200 dark:border-pink-800 text-pink-650 dark:text-pink-300 text-xs font-semibold uppercase tracking-wider mb-4">
          <Zap className="w-3.5 h-3.5" />
          <span>Vaporwave & Cyberpunk FX</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-tight mb-4">
          {pageTitle || "Glitch Art Studio"}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
          {pageSubtitle || "Transform photos into aesthetic retro glitch art with RGB channel displacement, CRT scanlines, and VHS datamosh slice distortion."}
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        {!imageUrl ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
            <div className="md:col-span-7 flex flex-col justify-center">
              <DropZone
                onFilesSelected={handleFilesSelected}
                title="Drop photo for glitch processing"
                subtitle="Supports JPG, PNG, WebP, HEIC up to 50MB"
              />
            </div>
            <div className="md:col-span-5 flex">
              <div className="premium-bento rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between w-full shadow-sm">
                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-pink-650 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/50 border border-pink-100 dark:border-pink-900 px-2 py-0.5 rounded uppercase tracking-wider inline-block">
                    Realtime GPU/Canvas 2D
                  </div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Chromatic Channel Split</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    Shift red and blue pixel buffers horizontally to recreate authentic analog CRT television monitor artifacts and retro VHS distortion.
                  </p>
                </div>
                <DemoPreview toolId="glitch" alt="Glitch Art Studio Preview" />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Control Sidebar (5 cols) */}
            <div className="lg:col-span-5 space-y-6 order-2 lg:order-1">
              <div className="premium-bento p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-5 shadow-xl shadow-slate-200/20 dark:shadow-none">
                
                {/* 1-Tap Quick Style Presets */}
                <div className="space-y-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest block">
                    Glitch Presets
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { label: '📼 Subtle VHS', shift: 6, slices: 2, offset: 8, scanlines: 30, noise: 10, inv: false },
                      { label: '⚡ Cyberpunk', shift: 16, slices: 5, offset: 25, scanlines: 45, noise: 20, inv: true },
                      { label: '💥 Meltdown', shift: 30, slices: 10, offset: 45, scanlines: 70, noise: 35, inv: true },
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setRgbShift(preset.shift);
                          setSliceCount(preset.slices);
                          setSliceOffset(preset.offset);
                          setScanlineOpacity(preset.scanlines);
                          setNoiseAmount(preset.noise);
                          setColorInvertBand(preset.inv);
                        }}
                        className="py-2 px-1 rounded-xl text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-pink-50 dark:hover:bg-pink-950/40 text-slate-700 dark:text-slate-300 hover:text-pink-600 border border-slate-200/60 dark:border-slate-700/60 transition cursor-pointer active:scale-95 text-center truncate"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Glitch Intensity Sliders with Steppers */}
                <div className="space-y-4">
                  {/* RGB Shift with Steppers */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-600 dark:text-slate-400">
                      <span>RGB Channel Split</span>
                      <div className="flex items-center gap-1.5 font-mono text-pink-600">
                        <button 
                          onClick={() => setRgbShift(Math.max(0, rgbShift - 2))}
                          className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-xs font-black cursor-pointer active:scale-90 transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="min-w-[36px] text-center font-bold">{rgbShift}px</span>
                        <button 
                          onClick={() => setRgbShift(Math.min(50, rgbShift + 2))}
                          className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-xs font-black cursor-pointer active:scale-90 transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={rgbShift}
                      onChange={(e) => setRgbShift(Number(e.target.value))}
                      className="range-styled w-full"
                    />
                  </div>

                  {/* Slice Count with Steppers */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-600 dark:text-slate-400">
                      <span>Datamosh Slices</span>
                      <div className="flex items-center gap-1.5 font-mono text-pink-600">
                        <button 
                          onClick={() => setSliceCount(Math.max(0, sliceCount - 1))}
                          className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-xs font-black cursor-pointer active:scale-90 transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="min-w-[36px] text-center font-bold">{sliceCount}</span>
                        <button 
                          onClick={() => setSliceCount(Math.min(15, sliceCount + 1))}
                          className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-xs font-black cursor-pointer active:scale-90 transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="15"
                      value={sliceCount}
                      onChange={(e) => setSliceCount(Number(e.target.value))}
                      className="range-styled w-full"
                    />
                  </div>

                  {/* CRT Scanline Opacity with Steppers */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-600 dark:text-slate-400">
                      <span>CRT Scanlines</span>
                      <div className="flex items-center gap-1.5 font-mono text-pink-600">
                        <button 
                          onClick={() => setScanlineOpacity(Math.max(0, scanlineOpacity - 5))}
                          className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-xs font-black cursor-pointer active:scale-90 transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="min-w-[36px] text-center font-bold">{scanlineOpacity}%</span>
                        <button 
                          onClick={() => setScanlineOpacity(Math.min(100, scanlineOpacity + 5))}
                          className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-xs font-black cursor-pointer active:scale-90 transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={scanlineOpacity}
                      onChange={(e) => setScanlineOpacity(Number(e.target.value))}
                      className="range-styled w-full"
                    />
                  </div>

                  {/* Noise Amount with Steppers */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-600 dark:text-slate-400">
                      <span>VHS Grain / Noise</span>
                      <div className="flex items-center gap-1.5 font-mono text-pink-600">
                        <button 
                          onClick={() => setNoiseAmount(Math.max(0, noiseAmount - 5))}
                          className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-xs font-black cursor-pointer active:scale-90 transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="min-w-[36px] text-center font-bold">{noiseAmount}%</span>
                        <button 
                          onClick={() => setNoiseAmount(Math.min(60, noiseAmount + 5))}
                          className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-xs font-black cursor-pointer active:scale-90 transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="60"
                      value={noiseAmount}
                      onChange={(e) => setNoiseAmount(Number(e.target.value))}
                      className="range-styled w-full"
                    />
                  </div>

                  {/* Invert band toggle */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Negative Color Band</span>
                    <button
                      onClick={() => setColorInvertBand(!colorInvertBand)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        colorInvertBand
                          ? 'bg-pink-600 text-white border-pink-600'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {colorInvertBand ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>

                {/* Randomize & Reset Toolbar */}
                <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={handleRandomGlitch}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-pink-50 dark:bg-pink-950/40 hover:bg-pink-100 text-pink-600 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span>Randomize</span>
                  </button>
                  <button
                    onClick={handleReset}
                    className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>

                {/* Export Options */}
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Export Format
                    </label>
                    <div className="flex gap-1.5">
                      {(['image/png', 'image/jpeg', 'image/webp'] as const).map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => setExportFormat(fmt)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            exportFormat === fmt
                              ? 'bg-pink-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {fmt === 'image/png' ? 'PNG' : fmt === 'image/jpeg' ? 'JPEG' : 'WebP'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Download Button */}
                <div className="pt-2">
                  <button
                    onClick={handleDownload}
                    disabled={isProcessing}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold text-sm shadow-lg shadow-pink-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Glitch Art</span>
                  </button>
                </div>

              </div>
            </div>

            {/* Stage (7 cols) */}
            <div className="lg:col-span-7 space-y-4 order-1 lg:order-2">
              <div className="relative rounded-3xl bg-slate-950/5 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 p-4 min-h-[420px] flex items-center justify-center overflow-hidden">
                {/* Canvas is kept mounted at all times to prevent destroying pixel buffer */}
                <canvas
                  ref={canvasRef}
                  className={`max-w-full max-h-[600px] object-contain rounded-2xl shadow-xl transition-all select-none ${
                    isComparing ? 'opacity-0' : 'opacity-100'
                  }`}
                />

                {/* Hold to Compare Overlay */}
                {isComparing && (
                  <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none animate-fade-in z-10">
                    <img
                      src={imageUrl}
                      alt="Original"
                      className="max-w-full max-h-[600px] object-contain rounded-2xl shadow-xl select-none"
                    />
                    <span className="absolute top-7 left-7 bg-black/80 backdrop-blur-md text-amber-300 border border-amber-500/40 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg">
                      Original Photo
                    </span>
                  </div>
                )}

                {/* Hold to Compare Live Button */}
                <button
                  onMouseDown={(e) => { e.preventDefault(); setIsComparing(true); }}
                  onMouseUp={() => setIsComparing(false)}
                  onMouseLeave={() => setIsComparing(false)}
                  onTouchStart={(e) => { e.preventDefault(); setIsComparing(true); }}
                  onTouchEnd={(e) => { e.preventDefault(); setIsComparing(false); }}
                  onTouchCancel={() => setIsComparing(false)}
                  onContextMenu={(e) => e.preventDefault()}
                  className={`absolute top-4 right-4 px-2.5 py-1 rounded-xl text-[10px] font-bold border transition flex items-center gap-1 cursor-pointer select-none backdrop-blur-md shadow-sm active:scale-95 z-20 ${
                    isComparing 
                      ? 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-400/40' 
                      : 'bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{isComparing ? 'Original' : 'Hold to Compare'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2 font-medium">
                <span>Resolution: {imageSize.width} × {imageSize.height} px</span>
                <span>GPU/Canvas 2D Realtime Filter</span>
              </div>
            </div>

          </div>
        )}

        {/* Floating Mobile Bottom Action Dock */}
        {imageUrl && (
          <div className="fixed bottom-4 left-4 right-4 sm:hidden z-30 flex items-center justify-between p-2.5 bg-slate-900/90 dark:bg-slate-850/95 text-white rounded-2xl backdrop-blur-xl shadow-2xl border border-white/10 animate-fade-in">
            <button
              onClick={handleRandomGlitch}
              className="py-2 px-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
            >
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span>Surprise</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={isProcessing}
              className="py-2 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
            >
              <Download className="w-4 h-4" />
              <span>Export Glitch</span>
            </button>
          </div>
        )}

        {/* SEO Guide Section */}
        <div className="mt-16 border-t border-slate-200/60 dark:border-slate-800 pt-12">
          <ToolGuide
            toolName="Glitch Art & CRT VHS Distortion Generator"
            introText="Turn ordinary photos into aesthetic cyberpunk glitch art with RGB channel displacement, datamoshing slice corruption, and analog CRT scanlines."
            competitorComparison={{
              alternatives: ['Photomosh', 'GlitchArt.com', 'MoshCam'],
              benefit: 'Our glitch studio runs 100% inside your local browser memory with 60 FPS real-time parameter tweaking and lossless high-resolution export without watermarks or subscriptions.',
            }}
            steps={[
              { title: 'Upload Photo', description: 'Drop your image into the glitch studio.' },
              { title: 'Adjust Chromatic Shift', description: 'Slide RGB Channel Split to create red/cyan chromatic aberration displacement.' },
              { title: 'Add Datamoshing & Scanlines', description: 'Tune slice displacement and CRT television scanlines for retro analog distortion.' },
              { title: 'Download High-Res Art', description: 'Export your glitch art in lossless PNG, JPEG, or WebP format.' },
            ]}
            features={[
              'RGB color channel splitting & chromatic aberration',
              'Digital horizontal datamosh slice displacement',
              'Analog CRT television scanlines & VHS noise generator',
              '1-Click "Glitch Me" randomizer for infinite creative combinations'
            ]}
            faq={[
              { q: 'What is chromatic aberration in glitch art?', a: 'Chromatic aberration separates the Red, Green, and Blue color channels horizontally and vertically, mimicking misaligned lenses or analog CRT projector beams.' },
              { q: 'Does ImagePlumber limit export resolution for glitch artwork?', a: 'No! Your images are processed directly at native source resolution in local browser RAM.' }
            ]}
          />
        </div>

      </div>
    </div>
  );
};
