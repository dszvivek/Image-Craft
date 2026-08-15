import React, { useState, useEffect, useRef } from 'react';
import { Download, RefreshCw, Zap, Eye, Sparkles, Tv, Radio } from 'lucide-react';
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
  const [jpegQuality, setJpegQuality] = useState<number>(92);

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

  // Randomize all parameters
  const handleRandomGlitch = () => {
    setRgbShift(Math.floor(Math.random() * 45) + 5);
    setSliceCount(Math.floor(Math.random() * 20) + 4);
    setSliceOffset(Math.floor(Math.random() * 60) + 15);
    setScanlineOpacity(Math.floor(Math.random() * 50) + 10);
    setNoiseAmount(Math.floor(Math.random() * 30) + 5);
    setColorInvertBand(Math.random() > 0.4);
    setSeed(Math.random() * 1000);
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

      if (isComparing) {
        // Draw original clean image
        ctx.drawImage(img, 0, 0, w, h);
        return;
      }

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
  }, [imageUrl, imageSize, rgbShift, sliceCount, sliceOffset, scanlineOpacity, noiseAmount, colorInvertBand, seed, isComparing]);

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
      exportFormat === 'image/jpeg' ? jpegQuality / 100 : undefined
    );
  };

  const handleReset = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setFile(null);
    setImageUrl('');
    setImageSize({ width: 0, height: 0 });
    setRgbShift(18);
    setSliceCount(12);
    setSliceOffset(35);
    setScanlineOpacity(40);
    setNoiseAmount(15);
    setColorInvertBand(true);
  };

  const glitchSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Glitch Art & CRT Distortion Studio - ImagePlumber',
    'applicationCategory': 'MultimediaApplication',
    'operatingSystem': 'Web Browser',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD',
    },
    'description': 'Create surreal glitch art, chromatic aberration, and CRT television scanline effects online for free. 100% private in-browser canvas studio.',
    'featureList': [
      'RGB channel split and chromatic aberration displacement',
      'Horizontal digital slice datamoshing engine',
      'CRT television scanlines and phosphor noise simulation',
      '1-Click Glitch Me randomizer and lossless PNG/JPEG export'
    ]
  };

  return (
    <div className="py-8 md:py-12 max-w-7xl mx-auto px-4 sm:px-6">
      <SEO
        title={pageTitle || "Glitch Image Generator & CRT VHS Distortion Free | ImagePlumber"}
        description={pageSubtitle || "Create surreal glitch art, RGB chromatic aberration, and retro CRT television scanlines online for free. 100% client-side in-browser studio."}
        canonicalUrl="https://imageplumber.com/glitch-image-generator"
        schema={glitchSchema}
      />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-800 text-violet-650 dark:text-violet-300 text-xs font-semibold uppercase tracking-wider mb-4">
          <Zap className="w-3.5 h-3.5" />
          <span>Vaporwave & Glitch Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-tight mb-4">
          {pageTitle || "Glitch Art & CRT Distortion Studio"}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
          {pageSubtitle || "Generate RGB chromatic aberration, datamoshing slice corruption, VHS static noise, and retro CRT television scanlines in real time."}
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        {!imageUrl ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
            <div className="md:col-span-7 flex flex-col justify-center">
              <DropZone
                onFilesSelected={handleFilesSelected}
                title="Drop photo to generate surreal glitch art"
                subtitle="Supports JPG, PNG, WebP, HEIC up to 50MB"
              />
            </div>
            <div className="md:col-span-5 flex">
              <div className="premium-bento rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between w-full shadow-sm">
                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-violet-650 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/50 border border-violet-100 dark:border-violet-900 px-2 py-0.5 rounded uppercase tracking-wider inline-block">
                    Cybernetic Distortion
                  </div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">RGB Displacement & Scanlines</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    Separate red, green, and blue color channels and apply digital datamoshing slices for high-impact album covers and aesthetic artwork.
                  </p>
                </div>
                <DemoPreview toolId="glitch" alt="Glitch Art Generator Preview" />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Control Sidebar (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="premium-bento p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-5 shadow-xl shadow-slate-200/20 dark:shadow-none">
                
                {/* Randomize Glitch Button */}
                <button
                  onClick={handleRandomGlitch}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white font-extrabold text-sm shadow-lg shadow-violet-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span>Surprise Me (Random Glitch)</span>
                </button>

                {/* RGB Chromatic Aberration */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-violet-500" />
                      <span>RGB Channel Split (Aberration)</span>
                    </span>
                    <span className="font-mono text-violet-600">{rgbShift} px</span>
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

                {/* Slice Datamoshing */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                      <span>Slice Displacement Amount</span>
                      <span className="font-mono text-violet-600">{sliceCount} slices</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="25"
                      value={sliceCount}
                      onChange={(e) => setSliceCount(Number(e.target.value))}
                      className="range-styled w-full"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                      <span>Slice Jitter Width</span>
                      <span className="font-mono text-violet-600">{sliceOffset} px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="80"
                      value={sliceOffset}
                      onChange={(e) => setSliceOffset(Number(e.target.value))}
                      className="range-styled w-full"
                    />
                  </div>
                </div>

                {/* CRT Scanlines & TV Static */}
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Tv className="w-3.5 h-3.5 text-violet-500" />
                        <span>CRT TV Scanlines</span>
                      </span>
                      <span className="font-mono text-violet-600">{scanlineOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="85"
                      value={scanlineOpacity}
                      onChange={(e) => setScanlineOpacity(Number(e.target.value))}
                      className="range-styled w-full"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                      <span>Analog VHS Noise</span>
                      <span className="font-mono text-violet-600">{noiseAmount}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="45"
                      value={noiseAmount}
                      onChange={(e) => setNoiseAmount(Number(e.target.value))}
                      className="range-styled w-full"
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Negative Glitch Band
                  </span>
                  <button
                    onClick={() => setColorInvertBand(!colorInvertBand)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      colorInvertBand
                        ? 'bg-violet-50 dark:bg-violet-950/50 border-violet-300 text-violet-700'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-400'
                    }`}
                  >
                    {colorInvertBand ? 'Enabled' : 'Disabled'}
                  </button>
                </div>

                {/* Export Options */}
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
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
                              ? 'bg-violet-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {fmt === 'image/png' ? 'PNG' : fmt === 'image/jpeg' ? 'JPEG' : 'WebP'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {exportFormat === 'image/jpeg' && (
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                        <span>Quality</span>
                        <span className="font-mono text-violet-600">{jpegQuality}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="100"
                        value={jpegQuality}
                        onChange={(e) => setJpegQuality(Number(e.target.value))}
                        className="range-styled w-full"
                      />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleReset}
                    className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Reset</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    disabled={isProcessing}
                    className="flex-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-violet-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Glitch</span>
                  </button>
                </div>

              </div>
            </div>

            {/* Stage (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="relative rounded-3xl bg-slate-950/5 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 p-4 min-h-[420px] flex items-center justify-center overflow-hidden">
                <canvas
                  ref={canvasRef}
                  className="max-w-full max-h-[600px] object-contain rounded-2xl shadow-xl transition-all select-none"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2 font-medium">
                <button
                  onMouseDown={() => setIsComparing(true)}
                  onMouseUp={() => setIsComparing(false)}
                  onTouchStart={() => setIsComparing(true)}
                  onTouchEnd={() => setIsComparing(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5 cursor-pointer select-none"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Hold to View Original</span>
                </button>
                <span>{imageSize.width} × {imageSize.height} px</span>
              </div>
            </div>

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
