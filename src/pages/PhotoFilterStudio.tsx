import React, { useState, useEffect, useRef } from 'react';
import { Download, RefreshCw, Wand2, Palette, Sparkles, Sliders, Check } from 'lucide-react';
import { DropZone } from '../components/DropZone';
import { SEO } from '../components/SEO';
import { ToolGuide } from '../components/ToolGuide';
import { DemoPreview } from '../components/DemoPreview';

interface FilterPreset {
  id: string;
  name: string;
  category: string;
  description: string;
  previewBg: string;
}

const FILTER_PRESETS: FilterPreset[] = [
  { id: 'normal', name: 'Original', category: 'Basic', description: 'Unfiltered source image', previewBg: 'from-slate-700 to-slate-900' },
  { id: 'vintage1977', name: 'Vintage 1977', category: 'Retro', description: 'Warm nostalgic tones with faded shadows', previewBg: 'from-amber-600 to-yellow-800' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon', category: 'Creative', description: 'Electric cyan shadows with neon magenta highlights', previewBg: 'from-cyan-600 to-fuchsia-600' },
  { id: 'filmNoir', name: 'Film Noir B&W', category: 'Monochrome', description: 'High-contrast classic cinema black & white', previewBg: 'from-neutral-900 to-neutral-700' },
  { id: 'goldenHour', name: 'Golden Hour', category: 'Warm', description: 'Lush golden sunset warmth and soft highlights', previewBg: 'from-amber-500 to-orange-600' },
  { id: 'nordicFrost', name: 'Nordic Frost', category: 'Cool', description: 'Subtle icy blues with desaturated highlights', previewBg: 'from-sky-700 to-indigo-900' },
  { id: 'polaroid', name: 'Retro Polaroid', category: 'Retro', description: 'Faded matte blacks and nostalgic color shift', previewBg: 'from-emerald-700 to-amber-700' },
  { id: 'emeraldLush', name: 'Emerald Lush', category: 'Creative', description: 'Rich forest greens with deep velvety contrast', previewBg: 'from-emerald-800 to-teal-900' },
  { id: 'sepiaClassic', name: 'Sepia Classic', category: 'Monochrome', description: 'Antique warm brown monochrome photography', previewBg: 'from-amber-800 to-stone-900' },
  { id: 'pastelSoft', name: 'Pastel Soft', category: 'Soft', description: 'Lifted shadows and soft dreamy color palette', previewBg: 'from-pink-400 to-indigo-400' },
  { id: 'dramaticHdr', name: 'Dramatic HDR', category: 'Punchy', description: 'Deep clarity boost with punchy contrast', previewBg: 'from-blue-700 to-amber-600' },
  { id: 'sunsetGlow', name: 'Sunset Glow', category: 'Warm', description: 'Vibrant fiery orange and magenta radiance', previewBg: 'from-rose-600 to-amber-500' },
];

const DUOTONE_PRESETS = [
  { name: 'Cyberpunk', shadow: '#111827', highlight: '#EC4899' },
  { name: 'Neon Ocean', shadow: '#030712', highlight: '#06B6D4' },
  { name: 'Sunset Gold', shadow: '#311042', highlight: '#F59E0B' },
  { name: 'Forest Moss', shadow: '#052E16', highlight: '#84CC16' },
  { name: 'Classic Indigo', shadow: '#1E1B4B', highlight: '#F43F5E' },
  { name: 'Vintage Cream', shadow: '#1C1917', highlight: '#FEF3C7' },
];

interface PhotoFilterStudioProps {
  initialPreset?: string;
  initialMode?: 'preset' | 'duotone';
  pageTitle?: string;
  pageSubtitle?: string;
}

export const PhotoFilterStudio: React.FC<PhotoFilterStudioProps> = ({
  initialPreset = 'normal',
  initialMode = 'preset',
  pageTitle,
  pageSubtitle,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const [mode, setMode] = useState<'preset' | 'duotone'>(initialMode);
  const [activePreset, setActivePreset] = useState<string>(initialPreset);
  const [intensity, setIntensity] = useState<number>(100); // 0 to 100%

  // Duotone custom colors
  const [shadowColor, setShadowColor] = useState<string>('#1E1B4B');
  const [highlightColor, setHighlightColor] = useState<string>('#F43F5E');

  const [exportFormat, setExportFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png');
  const [jpegQuality, setJpegQuality] = useState<number>(92);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalDataRef = useRef<ImageData | null>(null);

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
      };
    }
  };

  // Hex to RGB helper
  const hexToRgb = (hex: string) => {
    const clean = hex.replace('#', '');
    const num = parseInt(clean, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  };

  // Render & Process Canvas
  useEffect(() => {
    if (!imageSrc || imageSize.width === 0 || imageSize.height === 0) return;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const w = imageSize.width;
      const h = imageSize.height;
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, w, h);
      const imgData = ctx.getImageData(0, 0, w, h);
      const original = ctx.getImageData(0, 0, w, h);
      originalDataRef.current = original;

      const data = imgData.data;
      const origData = original.data;
      const factor = intensity / 100;

      if (mode === 'duotone') {
        const shadow = hexToRgb(shadowColor);
        const highlight = hexToRgb(highlightColor);

        for (let i = 0; i < data.length; i += 4) {
          // Standard ITU-R BT.601 luma
          const luma = (0.299 * origData[i] + 0.587 * origData[i + 1] + 0.114 * origData[i + 2]) / 255;
          
          // Interpolate between shadow and highlight
          const targetR = shadow.r + (highlight.r - shadow.r) * luma;
          const targetG = shadow.g + (highlight.g - shadow.g) * luma;
          const targetB = shadow.b + (highlight.b - shadow.b) * luma;

          // Blend with original
          data[i] = origData[i] * (1 - factor) + targetR * factor;
          data[i + 1] = origData[i + 1] * (1 - factor) + targetG * factor;
          data[i + 2] = origData[i + 2] * (1 - factor) + targetB * factor;
        }
      } else {
        // Filter Preset Math
        for (let i = 0; i < data.length; i += 4) {
          const r = origData[i];
          const g = origData[i + 1];
          const b = origData[i + 2];
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;

          let tr = r;
          let tg = g;
          let tb = b;

          switch (activePreset) {
            case 'vintage1977':
              tr = r * 1.1 + 20;
              tg = g * 0.95 + 10;
              tb = b * 0.75;
              break;

            case 'cyberpunk':
              // High contrast with cyan shadows and magenta highlights
              tr = luma > 128 ? r * 1.25 + 30 : r * 0.7;
              tg = luma > 128 ? g * 0.7 : g * 1.2 + 25;
              tb = luma > 128 ? b * 1.35 + 40 : b * 1.4 + 45;
              break;

            case 'filmNoir':
              // High-contrast S-curve B&W
              const noir = luma < 128 ? Math.pow(luma / 128, 1.4) * 128 : 255 - Math.pow((255 - luma) / 128, 1.4) * 128;
              tr = noir;
              tg = noir;
              tb = noir;
              break;

            case 'goldenHour':
              tr = r * 1.2 + 25;
              tg = g * 1.05 + 15;
              tb = b * 0.85;
              break;

            case 'nordicFrost':
              tr = r * 0.85;
              tg = g * 0.95 + 10;
              tb = b * 1.25 + 30;
              break;

            case 'polaroid':
              tr = r * 1.05 + 15;
              tg = g * 1.0 + 10;
              tb = b * 0.9 + 25;
              break;

            case 'emeraldLush':
              tr = r * 0.8;
              tg = g * 1.25 + 20;
              tb = b * 0.9;
              break;

            case 'sepiaClassic':
              tr = r * 0.393 + g * 0.769 + b * 0.189;
              tg = r * 0.349 + g * 0.686 + b * 0.168;
              tb = r * 0.272 + g * 0.534 + b * 0.131;
              break;

            case 'pastelSoft':
              tr = (r + 255) / 2 * 1.05;
              tg = (g + 255) / 2 * 0.98;
              tb = (b + 255) / 2 * 1.02;
              break;

            case 'dramaticHdr':
              const contrast = 1.35;
              tr = ((r / 255 - 0.5) * contrast + 0.5) * 255;
              tg = ((g / 255 - 0.5) * contrast + 0.5) * 255;
              tb = ((b / 255 - 0.5) * contrast + 0.5) * 255;
              break;

            case 'sunsetGlow':
              tr = r * 1.3 + 35;
              tg = g * 0.85 + 10;
              tb = b * 1.05 + 20;
              break;

            case 'normal':
            default:
              tr = r;
              tg = g;
              tb = b;
              break;
          }

          // Clamp [0..255] and blend with original by intensity factor
          tr = Math.min(255, Math.max(0, tr));
          tg = Math.min(255, Math.max(0, tg));
          tb = Math.min(255, Math.max(0, tb));

          data[i] = origData[i] * (1 - factor) + tr * factor;
          data[i + 1] = origData[i + 1] * (1 - factor) + tg * factor;
          data[i + 2] = origData[i + 2] * (1 - factor) + tb * factor;
        }
      }

      ctx.putImageData(imgData, 0, 0);
    };
  }, [imageSrc, imageSize, mode, activePreset, intensity, shadowColor, highlightColor]);

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
        const originalName = file?.name.replace(/\.[^/.]+$/, '') || 'filtered-image';
        const ext = exportFormat === 'image/png' ? 'png' : exportFormat === 'image/webp' ? 'webp' : 'jpg';
        a.download = `${originalName}-${activePreset || 'duotone'}-${Date.now()}.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
        setIsProcessing(false);
      },
      exportFormat,
      exportFormat === 'image/jpeg' ? jpegQuality / 100 : undefined
    );
  };

  const handleReset = () => {
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    setFile(null);
    setImageSrc('');
    setImageSize({ width: 0, height: 0 });
    setActivePreset('vintage1977');
    setIntensity(100);
  };

  const filterSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Photo Filter Studio & Duotone Generator - ImagePlumber',
    'applicationCategory': 'MultimediaApplication',
    'operatingSystem': 'Web Browser',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD',
    },
    'description': 'Free aesthetic photo filters and Spotify-style duotone generator online. Apply 12 vintage, cyberpunk, noir, and golden hour presets 100% locally in your browser.',
    'featureList': [
      '12 Curated aesthetic photo filters (Vintage 1977, Cyberpunk, Film Noir, Golden Hour, Retro Polaroid)',
      'Custom 2-color duotone generator with shadow/highlight color pickers',
      'Intensity blend slider (0% to 100%)',
      'Lossless PNG, JPEG, and WebP export with zero cloud uploads'
    ]
  };

  return (
    <div className="py-8 md:py-12 max-w-7xl mx-auto px-4 sm:px-6">
      <SEO
        title={pageTitle || "Photo Filters & Duotone Generator Online Free | ImagePlumber"}
        description={pageSubtitle || "Apply vintage, cyberpunk, duotone, and aesthetic photo filters to images for free in your browser. 100% private with zero cloud uploads."}
        canonicalUrl="https://imageplumber.com/photo-filters"
        schema={filterSchema}
      />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-purple-650 dark:text-purple-300 text-xs font-semibold uppercase tracking-wider mb-4">
          <Wand2 className="w-3.5 h-3.5" />
          <span>Aesthetic Color Grading & Filters</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-tight mb-4">
          {pageTitle || "Photo Filters & Duotone Studio"}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
          {pageSubtitle || "Transform your photos with aesthetic vintage presets, cinematic color grading, or custom 2-color duotones directly inside your browser."}
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        {!imageSrc ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
            <div className="md:col-span-7 flex flex-col justify-center">
              <DropZone
                onFilesSelected={handleFilesSelected}
                title="Drop photo to apply filters"
                subtitle="Supports JPG, PNG, WebP, HEIC up to 50MB"
              />
            </div>
            <div className="md:col-span-5 flex">
              <div className="premium-bento rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between w-full shadow-sm">
                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-purple-650 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 border border-purple-100 dark:border-purple-900 px-2 py-0.5 rounded uppercase tracking-wider inline-block">
                    Grading Studio
                  </div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">12 Aesthetic Film Presets</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    Apply vintage Polaroid tones, cyberpunk neon, or Spotify duotones with live opacity blending.
                  </p>
                </div>
                <DemoPreview toolId="editor" alt="Photo Filter Preview" />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Control Sidebar (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="premium-bento p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-6 shadow-xl shadow-slate-200/20 dark:shadow-none">
                
                {/* Mode Selector Tabs */}
                <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                  <button
                    onClick={() => setMode('preset')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      mode === 'preset'
                        ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Aesthetic Filters</span>
                  </button>
                  <button
                    onClick={() => setMode('duotone')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      mode === 'duotone'
                        ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <Palette className="w-3.5 h-3.5" />
                    <span>Duotone Generator</span>
                  </button>
                </div>

                {/* Mode A: Filter Presets Grid */}
                {mode === 'preset' && (
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                      Select Filter Preset
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-60 overflow-y-auto p-1 border border-slate-100 dark:border-slate-800/60 rounded-2xl">
                      {FILTER_PRESETS.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setActivePreset(p.id)}
                          className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                            activePreset === p.id
                              ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/40 shadow-sm'
                              : 'border-slate-200/60 dark:border-slate-800 hover:border-slate-300 bg-slate-50/50 dark:bg-slate-800/40'
                          }`}
                        >
                          <div className={`w-full h-8 rounded-lg bg-gradient-to-br ${p.previewBg} mb-1.5 flex items-center justify-center shadow-inner`}>
                            {activePreset === p.id && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                            {p.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mode B: Duotone Custom Color Controls */}
                {mode === 'duotone' && (
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-purple-500" />
                      Duotone Color Palette
                    </label>

                    {/* Quick Duotone Presets */}
                    <div className="flex flex-wrap gap-1.5">
                      {DUOTONE_PRESETS.map((dp) => (
                        <button
                          key={dp.name}
                          onClick={() => {
                            setShadowColor(dp.shadow);
                            setHighlightColor(dp.highlight);
                          }}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-purple-50 flex items-center gap-1.5 cursor-pointer"
                        >
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dp.shadow }} />
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dp.highlight }} />
                          <span>{dp.name}</span>
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Shadows (Dark)</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={shadowColor}
                            onChange={(e) => setShadowColor(e.target.value)}
                            className="w-8 h-8 rounded-full border-0 cursor-pointer p-0 bg-transparent"
                          />
                          <span className="font-mono text-xs font-semibold">{shadowColor}</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Highlights (Light)</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={highlightColor}
                            onChange={(e) => setHighlightColor(e.target.value)}
                            className="w-8 h-8 rounded-full border-0 cursor-pointer p-0 bg-transparent"
                          />
                          <span className="font-mono text-xs font-semibold">{highlightColor}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Intensity Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <Sliders className="w-3 h-3 text-purple-500" />
                      Filter Intensity
                    </span>
                    <span className="font-mono text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded">
                      {intensity}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={intensity}
                    onChange={(e) => setIntensity(Number(e.target.value))}
                    className="range-styled w-full"
                  />
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
                              ? 'bg-purple-600 text-white'
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
                    <RefreshCw className="w-4 h-4" />
                    <span>Reset</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    disabled={isProcessing}
                    className="flex-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-purple-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isProcessing ? 'Processing...' : 'Download Image'}</span>
                  </button>
                </div>

              </div>
            </div>

            {/* Preview Stage (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
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
            toolName="Photo Filter Studio & Duotone Generator"
            introText="Apply vintage aesthetic filters, cinematic cyberpunk gradients, or custom two-tone duotone effects to your photos instantly with zero server uploads."
            competitorComparison={{
              alternatives: ['Canva Filters', 'Fotor Effects', 'Duotone.me'],
              benefit: 'Other filter tools watermark your images or upload photos to remote analytics servers. ImagePlumber processes pixel matrices directly inside your local browser memory for total privacy and infinite resolutions.',
            }}
            steps={[
              { title: 'Upload Photo', description: 'Drop any PNG, JPEG, WebP, or HEIC image into the workspace canvas.' },
              { title: 'Choose Filter Preset or Duotone', description: 'Select an aesthetic preset (Vintage, Cyberpunk, Film Noir) or configure custom Shadow/Highlight colors.' },
              { title: 'Adjust Blend Intensity', description: 'Fine-tune the filter opacity slider from subtle color grading to full artistic transformation.' },
              { title: 'Download in Full Resolution', description: 'Export your enhanced image in lossless PNG, JPEG, or WebP format instantly.' },
            ]}
            features={[
              '12 Curated photo filter presets for retro, monochrome, and cinematic color palettes',
              'Full duotone generator with custom Shadow and Highlight HEX color pickers',
              'Intensity blend slider (0% to 100%) for natural skin tones and subtle color grades',
              'Zero cloud uploads with 100% private in-browser canvas execution'
            ]}
            faq={[
              { q: 'What is a duotone effect?', a: 'Duotone replaces all dark shadows with one color and light highlights with another color, creating striking visual graphics popular on Spotify album covers and modern posters.' },
              { q: 'Does applying filters downscale my original image?', a: 'No. ImagePlumber applies mathematical pixel matrix transformations to your native photo resolution without downscaling.' }
            ]}
          />
        </div>

      </div>
    </div>
  );
};
