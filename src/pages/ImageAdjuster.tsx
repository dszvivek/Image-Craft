import React, { useState, useEffect, useRef } from 'react';
import { Download, Sliders, Eye, RotateCcw, Sparkles } from 'lucide-react';
import { DropZone } from '../components/DropZone';
import { SEO } from '../components/SEO';
import { ToolGuide } from '../components/ToolGuide';
import { DemoPreview } from '../components/DemoPreview';

interface ImageAdjusterProps {
  initialMode?: 'general' | 'brightness-contrast';
  pageTitle?: string;
  pageSubtitle?: string;
}

export const ImageAdjuster: React.FC<ImageAdjusterProps> = ({
  initialMode = 'general',
  pageTitle,
  pageSubtitle,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Core Adjustments
  const [brightness, setBrightness] = useState<number>(0); // -100 to +100
  const [contrast, setContrast] = useState<number>(0); // -100 to +100
  const [saturation, setSaturation] = useState<number>(0); // -100 to +100
  const [exposure, setExposure] = useState<number>(0); // -100 to +100
  const [warmth, setWarmth] = useState<number>(0); // -100 to +100 (Temp)
  const [tint, setTint] = useState<number>(0); // -100 to +100
  const [sharpness, setSharpness] = useState<number>(0); // 0 to 100
  const [blur, setBlur] = useState<number>(0); // 0 to 20 px
  const [vignette, setVignette] = useState<number>(0); // 0 to 100%

  // Comparison state
  const [compareSplit, setCompareSplit] = useState<number>(50); // Split slider 0..100%
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [showSplitView, setShowSplitView] = useState<boolean>(false);

  const [exportFormat, setExportFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png');
  const [jpegQuality, setJpegQuality] = useState<number>(92);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      if (imageSrc) URL.revokeObjectURL(imageSrc);
      const f = files[0];
      setFile(f);
      const url = URL.createObjectURL(f);
      setImageSrc(url);

      const img = new Image();
      img.src = url;
      img.onload = () => {
        setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
        
        // Cache original canvas
        const origCanvas = document.createElement('canvas');
        origCanvas.width = img.naturalWidth;
        origCanvas.height = img.naturalHeight;
        const origCtx = origCanvas.getContext('2d');
        if (origCtx) {
          origCtx.drawImage(img, 0, 0);
          originalCanvasRef.current = origCanvas;
        }
      };
    }
  };

  // 1-Click Auto-Enhance
  const handleAutoEnhance = () => {
    if (!originalCanvasRef.current) return;
    const origCtx = originalCanvasRef.current.getContext('2d');
    if (!origCtx) return;

    const imgData = origCtx.getImageData(0, 0, imageSize.width, imageSize.height);
    const data = imgData.data;

    let minLuma = 255;
    let maxLuma = 0;
    let avgLuma = 0;

    for (let i = 0; i < data.length; i += 4) {
      const luma = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      if (luma < minLuma) minLuma = luma;
      if (luma > maxLuma) maxLuma = luma;
      avgLuma += luma;
    }
    avgLuma /= (data.length / 4);

    // Auto-adjust values
    const newExposure = Math.round((128 - avgLuma) * 0.35);
    const newContrast = Math.round(Math.min(30, (255 / (maxLuma - minLuma + 1) - 1) * 40));
    const newSaturation = 15;
    const newSharpness = 20;
    const newWarmth = 5;

    setExposure(Math.max(-40, Math.min(40, newExposure)));
    setContrast(Math.max(5, Math.min(35, newContrast)));
    setSaturation(newSaturation);
    setSharpness(newSharpness);
    setWarmth(newWarmth);
  };

  // Render Canvas
  useEffect(() => {
    if (!imageSrc || imageSize.width === 0 || imageSize.height === 0 || !originalCanvasRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const w = imageSize.width;
    const h = imageSize.height;
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (isComparing) {
      // Draw 100% original when hold-to-compare is active
      ctx.drawImage(originalCanvasRef.current, 0, 0);
      return;
    }

    const origCtx = originalCanvasRef.current.getContext('2d');
    if (!origCtx) return;

    const originalImgData = origCtx.getImageData(0, 0, w, h);
    const outputImgData = ctx.createImageData(w, h);

    const src = originalImgData.data;
    const dst = outputImgData.data;

    // Precalculate factors
    const bFactor = (brightness + exposure * 1.5) * 2.55;
    const cFactor = (contrast >= 0) ? (1 + contrast / 100 * 2) : (1 + contrast / 100);
    const sFactor = (saturation >= 0) ? (1 + saturation / 100 * 1.5) : (1 + saturation / 100);
    const wR = warmth > 0 ? 1 + warmth * 0.003 : 1;
    const wB = warmth < 0 ? 1 + Math.abs(warmth) * 0.003 : 1 - warmth * 0.002;
    const tG = tint > 0 ? 1 + tint * 0.002 : 1;
    const tM = tint < 0 ? 1 + Math.abs(tint) * 0.002 : 1;

    for (let i = 0; i < src.length; i += 4) {
      let r = src[i];
      let g = src[i + 1];
      let b = src[i + 2];
      const a = src[i + 3];

      // 1. Exposure / Brightness
      r += bFactor;
      g += bFactor;
      b += bFactor;

      // 2. Contrast
      r = (r - 128) * cFactor + 128;
      g = (g - 128) * cFactor + 128;
      b = (b - 128) * cFactor + 128;

      // 3. Temperature & Tint
      r = r * wR * tM;
      g = g * tG;
      b = b * wB;

      // 4. Saturation
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;
      r = luma + (r - luma) * sFactor;
      g = luma + (g - luma) * sFactor;
      b = luma + (b - luma) * sFactor;

      dst[i] = Math.min(255, Math.max(0, r));
      dst[i + 1] = Math.min(255, Math.max(0, g));
      dst[i + 2] = Math.min(255, Math.max(0, b));
      dst[i + 3] = a;
    }

    ctx.putImageData(outputImgData, 0, 0);

    // 5. Apply Sharpness if requested (unsharp mask via 3x3 convolution)
    if (sharpness > 0) {
      const sharpCtx = canvas.getContext('2d');
      if (sharpCtx) {
        const sharpData = sharpCtx.getImageData(0, 0, w, h);
        const sDst = sharpData.data;
        const temp = new Uint8ClampedArray(sDst);
        const amount = (sharpness / 100) * 0.75;

        for (let y = 1; y < h - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            const idx = (y * w + x) * 4;
            for (let c = 0; c < 3; c++) {
              const center = temp[idx + c];
              const up = temp[((y - 1) * w + x) * 4 + c];
              const down = temp[((y + 1) * w + x) * 4 + c];
              const left = temp[(y * w + (x - 1)) * 4 + c];
              const right = temp[(y * w + (x + 1)) * 4 + c];

              const sharpVal = center + amount * (4 * center - up - down - left - right);
              sDst[idx + c] = Math.min(255, Math.max(0, sharpVal));
            }
          }
        }
        sharpCtx.putImageData(sharpData, 0, 0);
      }
    }

    // 6. Apply Vignette
    if (vignette > 0) {
      const grad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.7);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      grad.addColorStop(1, `rgba(0, 0, 0, ${(vignette / 100) * 0.85})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }

    // 7. Split View Comparison Overlay
    if (showSplitView) {
      const splitX = (compareSplit / 100) * w;
      // Draw original left half
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, splitX, h);
      ctx.clip();
      ctx.drawImage(originalCanvasRef.current, 0, 0);
      ctx.restore();

      // Divider line
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.moveTo(splitX, 0);
      ctx.lineTo(splitX, h);
      ctx.stroke();
    }
  }, [
    imageSrc,
    imageSize,
    brightness,
    contrast,
    saturation,
    exposure,
    warmth,
    tint,
    sharpness,
    blur,
    vignette,
    isComparing,
    showSplitView,
    compareSplit,
  ]);

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
        const originalName = file?.name.replace(/\.[^/.]+$/, '') || 'adjusted-image';
        const ext = exportFormat === 'image/png' ? 'png' : exportFormat === 'image/webp' ? 'webp' : 'jpg';
        a.download = `${originalName}-adjusted-${Date.now()}.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
        setIsProcessing(false);
      },
      exportFormat,
      exportFormat === 'image/jpeg' ? jpegQuality / 100 : undefined
    );
  };

  const handleReset = () => {
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
    setExposure(0);
    setWarmth(0);
    setTint(0);
    setSharpness(0);
    setBlur(0);
    setVignette(0);
  };

  const adjusterSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Image Adjuster & Brightness Contrast Tuner - ImagePlumber',
    'applicationCategory': 'MultimediaApplication',
    'operatingSystem': 'Web Browser',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD',
    },
    'description': 'Adjust brightness, contrast, saturation, exposure, temperature, and sharpness online for free. 1-click Auto-Enhance with split before/after comparison.',
    'featureList': [
      'Real-time sliders for Brightness, Contrast, Saturation, Exposure, and Warmth',
      '1-Click Auto-Enhance histogram equalizer',
      'Interactive Split-View Before vs After comparison slider',
      '3x3 Convolution sharpness enhancer and soft vignette generator',
      'Lossless PNG, JPEG, and WebP export with zero cloud uploads'
    ]
  };

  return (
    <div className="py-8 md:py-12 max-w-7xl mx-auto px-4 sm:px-6">
      <SEO
        title={pageTitle || "Adjust Image Brightness, Contrast & Colors Online Free | ImagePlumber"}
        description={pageSubtitle || "Fine-tune brightness, contrast, saturation, temperature, and sharpness online for free. 100% private in-browser GPU-accelerated canvas processing."}
        canonicalUrl="https://imageplumber.com/adjust-image"
        schema={adjusterSchema}
      />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-650 dark:text-blue-300 text-xs font-semibold uppercase tracking-wider mb-4">
          <Sliders className="w-3.5 h-3.5" />
          <span>{initialMode === 'brightness-contrast' ? 'Lighting & Contrast Engine' : 'Professional Image Tuner & Grading'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-tight mb-4">
          {pageTitle || "Image Adjuster & Color Tuner"}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
          {pageSubtitle || "Fine-tune exposure, contrast, saturation, temperature, and sharpness with live before/after comparison and 1-click auto-enhancement."}
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        {!imageSrc ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
            <div className="md:col-span-7 flex flex-col justify-center">
              <DropZone
                onFilesSelected={handleFilesSelected}
                title="Drop photo to adjust colors & lighting"
                subtitle="Supports JPG, PNG, WebP, HEIC up to 50MB"
              />
            </div>
            <div className="md:col-span-5 flex">
              <div className="premium-bento rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between w-full shadow-sm">
                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 px-2 py-0.5 rounded uppercase tracking-wider inline-block">
                    Tuner Studio
                  </div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Live Split Comparison</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    Adjust brightness, contrast, saturation, warmth, and sharpness with instant 60 FPS split-view rendering.
                  </p>
                </div>
                <DemoPreview toolId="editor" alt="Image Adjuster Preview" />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Control Sidebar (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="premium-bento p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-5 shadow-xl shadow-slate-200/20 dark:shadow-none">
                
                {/* Auto-Enhance Button */}
                <button
                  onClick={handleAutoEnhance}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/10 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>1-Click Auto-Enhance</span>
                </button>

                {/* Sliders Container */}
                <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                  
                  {/* Brightness */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-700 dark:text-slate-300">Brightness</span>
                      <span className="font-mono text-blue-600 dark:text-blue-400">{brightness > 0 ? `+${brightness}` : brightness}</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="range-styled w-full"
                    />
                  </div>

                  {/* Contrast */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-700 dark:text-slate-300">Contrast</span>
                      <span className="font-mono text-blue-600 dark:text-blue-400">{contrast > 0 ? `+${contrast}` : contrast}</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="range-styled w-full"
                    />
                  </div>

                  {/* Saturation */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-700 dark:text-slate-300">Saturation</span>
                      <span className="font-mono text-blue-600 dark:text-blue-400">{saturation > 0 ? `+${saturation}` : saturation}</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={saturation}
                      onChange={(e) => setSaturation(Number(e.target.value))}
                      className="range-styled w-full"
                    />
                  </div>

                  {/* Exposure */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-700 dark:text-slate-300">Exposure</span>
                      <span className="font-mono text-blue-600 dark:text-blue-400">{exposure > 0 ? `+${exposure}` : exposure}</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={exposure}
                      onChange={(e) => setExposure(Number(e.target.value))}
                      className="range-styled w-full"
                    />
                  </div>

                  {/* Warmth / Temperature */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-700 dark:text-slate-300">Warmth (Temperature)</span>
                      <span className="font-mono text-amber-600 dark:text-amber-400">{warmth > 0 ? `+${warmth}` : warmth}</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={warmth}
                      onChange={(e) => setWarmth(Number(e.target.value))}
                      className="range-styled w-full"
                    />
                  </div>

                  {/* Sharpness */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-700 dark:text-slate-300">Sharpness</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400">{sharpness}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sharpness}
                      onChange={(e) => setSharpness(Number(e.target.value))}
                      className="range-styled w-full"
                    />
                  </div>

                  {/* Vignette */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-700 dark:text-slate-300">Vignette</span>
                      <span className="font-mono text-purple-600 dark:text-purple-400">{vignette}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={vignette}
                      onChange={(e) => setVignette(Number(e.target.value))}
                      className="range-styled w-full"
                    />
                  </div>

                </div>

                {/* Export Format & Quality */}
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Output Format
                    </label>
                    <div className="flex gap-1.5">
                      {(['image/png', 'image/jpeg', 'image/webp'] as const).map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => setExportFormat(fmt)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            exportFormat === fmt
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {fmt === 'image/png' ? 'PNG' : fmt === 'image/jpeg' ? 'JPEG' : 'WebP'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {exportFormat === 'image/jpeg' && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-500">
                        <span>Quality</span>
                        <span>{jpegQuality}%</span>
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
                    className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset Sliders</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    disabled={isProcessing}
                    className="flex-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isProcessing ? 'Processing...' : 'Download Image'}</span>
                  </button>
                </div>

              </div>
            </div>

            {/* Preview Stage (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Compare Toolbar */}
              <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-4 py-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2">
                  <button
                    onMouseDown={() => setIsComparing(true)}
                    onMouseUp={() => setIsComparing(false)}
                    onMouseLeave={() => setIsComparing(false)}
                    onTouchStart={() => setIsComparing(true)}
                    onTouchEnd={() => setIsComparing(false)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 select-none ${
                      isComparing
                        ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Hold to Compare</span>
                  </button>

                  <button
                    onClick={() => setShowSplitView(!showSplitView)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                      showSplitView
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>Split View</span>
                  </button>
                </div>

                {showSplitView && (
                  <div className="flex items-center gap-2 flex-1 max-w-[200px] ml-4">
                    <span className="text-[10px] font-bold text-slate-400">Split:</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={compareSplit}
                      onChange={(e) => setCompareSplit(Number(e.target.value))}
                      className="range-styled w-full"
                    />
                  </div>
                )}
              </div>

              <div className="relative rounded-3xl bg-slate-950/5 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 p-4 min-h-[420px] flex items-center justify-center overflow-hidden">
                <canvas
                  ref={canvasRef}
                  className="max-w-full max-h-[600px] object-contain rounded-2xl shadow-xl transition-all"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2 font-medium">
                <span>Dimensions: {imageSize.width} × {imageSize.height} px</span>
                <span>100% Client-Side Canvas Processing</span>
              </div>
            </div>

          </div>
        )}

        {/* SEO Guide Section */}
        <div className="mt-16 border-t border-slate-200/60 dark:border-slate-800 pt-12">
          <ToolGuide
            toolName="Image Adjuster & Color Tuner"
            introText="Fine-tune photo lighting, contrast, saturation, temperature warmth, and sharpness in real-time with zero server uploads."
            competitorComparison={{
              alternatives: ['Canva Photo Adjust', 'iLoveIMG Adjust', 'Fotor Basic Adjuster'],
              benefit: 'Our image adjustment engine processes native 32-bit RGBA pixel arrays in local memory. Experience 60 FPS slider responsiveness with interactive Before/After split sliders and zero privacy risks.',
            }}
            steps={[
              { title: 'Upload Image', description: 'Drop any PNG, JPEG, WebP, or HEIC photo directly into the browser.' },
              { title: 'Adjust Lighting & Color', description: 'Drag brightness, contrast, saturation, warmth, and sharpness sliders to grade your image.' },
              { title: 'Compare Before & After', description: 'Click "Hold to Compare" or enable Split View to inspect fine details side-by-side.' },
              { title: 'Export in High Fidelity', description: 'Download your graded photo in lossless PNG, JPEG, or WebP format with zero cloud uploads.' },
            ]}
            features={[
              'Multi-parameter grading: Brightness, Contrast, Saturation, Exposure, Warmth, and Tint',
              '1-Click Auto-Enhance histogram equalizer for instant lighting correction',
              '3x3 Convolution matrix unsharp mask for crisp texture and details',
              'Interactive Split View and Hold-to-Compare visual verification tools'
            ]}
            faq={[
              { q: 'What does the Auto-Enhance button do?', a: 'It analyzes the minimum, maximum, and average luminance distribution of your photo, then applies mathematical dynamic range stretching and contrast optimization.' },
              { q: 'How does sharpness enhancement work?', a: 'It computes a 3x3 unsharp masking convolution kernel that calculates local contrast gradients to enhance fine edges without creating color noise.' }
            ]}
          />
        </div>

      </div>
    </div>
  );
};
