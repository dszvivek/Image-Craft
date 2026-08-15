import React, { useState, useEffect, useRef } from 'react';
import { Download, RefreshCw, Gamepad2, Grid } from 'lucide-react';
import { DropZone } from '../components/DropZone';
import { SEO } from '../components/SEO';
import { ToolGuide } from '../components/ToolGuide';
import { DemoPreview } from '../components/DemoPreview';

interface PaletteOption {
  id: string;
  name: string;
  colors: string[] | null;
  description: string;
}

const PALETTES: PaletteOption[] = [
  {
    id: 'original',
    name: 'Full Truecolor',
    colors: null,
    description: 'Preserves original photo colors quantized into pixel blocks'
  },
  {
    id: 'gameboy',
    name: 'Nintendo Game Boy (4-Color)',
    colors: ['#0f380f', '#306230', '#8bac0f', '#9bbc0f'],
    description: 'Classic 1989 monochrome dot matrix green'
  },
  {
    id: 'pico8',
    name: 'PICO-8 Fantasy Console (16-Color)',
    colors: [
      '#000000', '#1D2B53', '#7E2553', '#008751', '#AB5236', '#5F574F',
      '#C2C3C7', '#FFF1E8', '#FF004D', '#FFA300', '#FFEC27', '#00E436',
      '#29ADFF', '#83769C', '#FF77A8', '#FFCCAA'
    ],
    description: 'Vibrant 16-color indie game development palette'
  },
  {
    id: 'c64',
    name: 'Commodore 64 (16-Color)',
    colors: [
      '#000000', '#FFFFFF', '#880000', '#AAFFEE', '#CC44CC', '#00CC55',
      '#0000AA', '#EEEE77', '#DD8855', '#664400', '#FF7777', '#333333',
      '#777777', '#AAFF66', '#0088FF', '#BBBBBB'
    ],
    description: 'Iconic 1982 home computer muted warm tones'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon (10-Color)',
    colors: [
      '#050510', '#2B0938', '#5E1156', '#9B195C', '#E22B5A',
      '#FF5376', '#FF8E80', '#FFD09B', '#00F0FF', '#7000FF'
    ],
    description: 'High-contrast synthetic violet, magenta and cyan glow'
  },
  {
    id: 'monochrome',
    name: '1-Bit Monochrome (2-Color)',
    colors: ['#000000', '#FFFFFF'],
    description: 'Pure high-contrast black and white pixel binary'
  }
];

// Helper to convert HEX to RGB
function hexToRgb(hex: string): [number, number, number] {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return [r, g, b];
}

// Find closest color in palette using Euclidean distance
function getNearestColor(r: number, g: number, b: number, palette: [number, number, number][]): [number, number, number] {
  let minDistance = Infinity;
  let nearest = palette[0];

  for (let i = 0; i < palette.length; i++) {
    const pr = palette[i][0];
    const pg = palette[i][1];
    const pb = palette[i][2];

    const dist = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2;
    if (dist < minDistance) {
      minDistance = dist;
      nearest = palette[i];
    }
  }
  return nearest;
}

// 4x4 Bayer Dithering Matrix
const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5]
];

interface PixelArtGeneratorProps {
  pageTitle?: string;
  pageSubtitle?: string;
}

export const PixelArtGenerator: React.FC<PixelArtGeneratorProps> = ({
  pageTitle,
  pageSubtitle,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Settings
  const [pixelSize, setPixelSize] = useState<number>(12); // 2 to 64 px
  const [selectedPaletteId, setSelectedPaletteId] = useState<string>('gameboy');
  const [ditherMode, setDitherMode] = useState<'none' | 'floyd-steinberg' | 'bayer'>('floyd-steinberg');
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [contrastBoost, setContrastBoost] = useState<number>(15); // -50 to +50

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<'png' | 'svg' | 'webp'>('png');

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

  // Render Pixel Art on Canvas
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

      // 1. Draw source image
      ctx.drawImage(img, 0, 0, w, h);
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      // Active palette RGB array
      const activePalette = PALETTES.find((p) => p.id === selectedPaletteId);
      const rgbPalette = activePalette?.colors ? activePalette.colors.map(hexToRgb) : null;

      // Downsampled low-res grid dimensions
      const blockSize = Math.max(2, pixelSize);
      const gridW = Math.ceil(w / blockSize);
      const gridH = Math.ceil(h / blockSize);

      // Create low-res buffer for pixel block averages
      const lowRes: [number, number, number][] = new Array(gridW * gridH);

      // Step A: Downsample by averaging blocks
      for (let gy = 0; gy < gridH; gy++) {
        for (let gx = 0; gx < gridW; gx++) {
          const startX = gx * blockSize;
          const startY = gy * blockSize;
          const endX = Math.min(w, startX + blockSize);
          const endY = Math.min(h, startY + blockSize);

          let rSum = 0;
          let gSum = 0;
          let bSum = 0;
          let count = 0;

          for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
              const idx = (y * w + x) * 4;
              rSum += data[idx];
              gSum += data[idx + 1];
              bSum += data[idx + 2];
              count++;
            }
          }

          let avgR = count > 0 ? rSum / count : 0;
          let avgG = count > 0 ? gSum / count : 0;
          let avgB = count > 0 ? bSum / count : 0;

          // Apply Contrast Boost
          if (contrastBoost !== 0) {
            const factor = (259 * (contrastBoost + 255)) / (255 * (259 - contrastBoost));
            avgR = Math.max(0, Math.min(255, factor * (avgR - 128) + 128));
            avgG = Math.max(0, Math.min(255, factor * (avgG - 128) + 128));
            avgB = Math.max(0, Math.min(255, factor * (avgB - 128) + 128));
          }

          lowRes[gy * gridW + gx] = [avgR, avgG, avgB];
        }
      }

      // Step B: Palette Quantization & Dithering
      const quantized: [number, number, number][] = new Array(gridW * gridH);

      if (rgbPalette) {
        if (ditherMode === 'floyd-steinberg') {
          // Floyd-Steinberg error diffusion on low-res grid
          const errBuffer: [number, number, number][] = lowRes.map((c) => [...c]);

          for (let gy = 0; gy < gridH; gy++) {
            for (let gx = 0; gx < gridW; gx++) {
              const idx = gy * gridW + gx;
              const [currR, currG, currB] = errBuffer[idx];

              const clampedR = Math.max(0, Math.min(255, currR));
              const clampedG = Math.max(0, Math.min(255, currG));
              const clampedB = Math.max(0, Math.min(255, currB));

              const [nearestR, nearestG, nearestB] = getNearestColor(clampedR, clampedG, clampedB, rgbPalette);
              quantized[idx] = [nearestR, nearestG, nearestB];

              const errR = clampedR - nearestR;
              const errG = clampedG - nearestG;
              const errB = clampedB - nearestB;

              // Diffuse errors: (x+1, y) 7/16, (x-1, y+1) 3/16, (x, y+1) 5/16, (x+1, y+1) 1/16
              if (gx + 1 < gridW) {
                const rightIdx = gy * gridW + (gx + 1);
                errBuffer[rightIdx][0] += errR * (7 / 16);
                errBuffer[rightIdx][1] += errG * (7 / 16);
                errBuffer[rightIdx][2] += errB * (7 / 16);
              }
              if (gy + 1 < gridH) {
                if (gx - 1 >= 0) {
                  const downLeft = (gy + 1) * gridW + (gx - 1);
                  errBuffer[downLeft][0] += errR * (3 / 16);
                  errBuffer[downLeft][1] += errG * (3 / 16);
                  errBuffer[downLeft][2] += errB * (3 / 16);
                }
                const down = (gy + 1) * gridW + gx;
                errBuffer[down][0] += errR * (5 / 16);
                errBuffer[down][1] += errG * (5 / 16);
                errBuffer[down][2] += errB * (5 / 16);
                if (gx + 1 < gridW) {
                  const downRight = (gy + 1) * gridW + (gx + 1);
                  errBuffer[downRight][0] += errR * (1 / 16);
                  errBuffer[downRight][1] += errG * (1 / 16);
                  errBuffer[downRight][2] += errB * (1 / 16);
                }
              }
            }
          }
        } else if (ditherMode === 'bayer') {
          // Bayer 4x4 Ordered Dithering
          for (let gy = 0; gy < gridH; gy++) {
            for (let gx = 0; gx < gridW; gx++) {
              const idx = gy * gridW + gx;
              const [r, g, b] = lowRes[idx];
              const bayerValue = (BAYER_4X4[gy % 4][gx % 4] / 16 - 0.5) * 45;

              const shiftedR = Math.max(0, Math.min(255, r + bayerValue));
              const shiftedG = Math.max(0, Math.min(255, g + bayerValue));
              const shiftedB = Math.max(0, Math.min(255, b + bayerValue));

              quantized[idx] = getNearestColor(shiftedR, shiftedG, shiftedB, rgbPalette);
            }
          }
        } else {
          // Direct nearest color (no dithering)
          for (let i = 0; i < lowRes.length; i++) {
            const [r, g, b] = lowRes[i];
            quantized[i] = getNearestColor(r, g, b, rgbPalette);
          }
        }
      } else {
        // Truecolor (no palette mapping)
        for (let i = 0; i < lowRes.length; i++) {
          quantized[i] = [Math.round(lowRes[i][0]), Math.round(lowRes[i][1]), Math.round(lowRes[i][2])];
        }
      }

      // Step C: Render Blocks Back to Canvas
      for (let gy = 0; gy < gridH; gy++) {
        for (let gx = 0; gx < gridW; gx++) {
          const idx = gy * gridW + gx;
          const [qr, qg, qb] = quantized[idx];
          const startX = gx * blockSize;
          const startY = gy * blockSize;
          const blockW = Math.min(blockSize, w - startX);
          const blockH = Math.min(blockSize, h - startY);

          ctx.fillStyle = `rgb(${qr},${qg},${qb})`;
          ctx.fillRect(startX, startY, blockW, blockH);

          if (showGrid && blockSize >= 4) {
            ctx.strokeStyle = 'rgba(0,0,0,0.18)';
            ctx.lineWidth = 1;
            ctx.strokeRect(startX + 0.5, startY + 0.5, blockW - 1, blockH - 1);
          }
        }
      }
    };
  }, [imageUrl, imageSize, pixelSize, selectedPaletteId, ditherMode, showGrid, contrastBoost]);

  // Export SVG Vector Grid
  const generateSvgContent = (): string => {
    if (!imageSize.width || !imageSize.height) return '';
    const blockSize = Math.max(2, pixelSize);
    const gridW = Math.ceil(imageSize.width / blockSize);
    const gridH = Math.ceil(imageSize.height / blockSize);

    const canvas = canvasRef.current;
    if (!canvas) return '';
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${imageSize.width} ${imageSize.height}" width="${imageSize.width}" height="${imageSize.height}">\n`;

    for (let gy = 0; gy < gridH; gy++) {
      for (let gx = 0; gx < gridW; gx++) {
        const x = gx * blockSize;
        const y = gy * blockSize;
        const pixelData = ctx.getImageData(x + 1, y + 1, 1, 1).data;
        const hex = `#${((1 << 24) + (pixelData[0] << 16) + (pixelData[1] << 8) + pixelData[2]).toString(16).slice(1)}`;
        svg += `  <rect x="${x}" y="${y}" width="${blockSize}" height="${blockSize}" fill="${hex}"/>\n`;
      }
    }
    svg += '</svg>';
    return svg;
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsProcessing(true);
    const originalName = file?.name.replace(/\.[^/.]+$/, '') || 'pixel-art';

    if (exportFormat === 'svg') {
      const svgString = generateSvgContent();
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${originalName}-pixel-art.svg`;
      a.click();
      URL.revokeObjectURL(url);
      setIsProcessing(false);
    } else {
      const mime = exportFormat === 'webp' ? 'image/webp' : 'image/png';
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${originalName}-pixel-art.${exportFormat}`;
        a.click();
        URL.revokeObjectURL(url);
        setIsProcessing(false);
      }, mime);
    }
  };

  const handleReset = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setFile(null);
    setImageUrl('');
    setImageSize({ width: 0, height: 0 });
    setPixelSize(12);
    setSelectedPaletteId('gameboy');
    setDitherMode('floyd-steinberg');
  };

  const pixelSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Pixel Art & 8-Bit Retro Converter - ImagePlumber',
    'applicationCategory': 'MultimediaApplication',
    'operatingSystem': 'Web Browser',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD',
    },
    'description': 'Convert photos into 8-bit retro pixel art online for free. Game Boy, NES, PICO-8 palettes with Floyd-Steinberg dithering and SVG/PNG export.',
    'featureList': [
      'Pixel block size slider (2 to 64px)',
      'Game Boy, PICO-8, Commodore 64, and Cyberpunk retro palettes',
      'Floyd-Steinberg and Bayer 4x4 ordered dithering algorithms',
      'Lossless PNG, WebP, and SVG vector grid export'
    ]
  };

  return (
    <div className="py-8 md:py-12 max-w-7xl mx-auto px-4 sm:px-6">
      <SEO
        title={pageTitle || "Pixel Art Generator & 8-Bit Photo Converter Free | ImagePlumber"}
        description={pageSubtitle || "Turn photos into 8-bit retro pixel art with Game Boy, NES, and PICO-8 palettes and Floyd-Steinberg dithering. 100% private in-browser tool."}
        canonicalUrl="https://imageplumber.com/pixel-art-generator"
        schema={pixelSchema}
      />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-fuchsia-50 dark:bg-fuchsia-950/50 border border-fuchsia-200 dark:border-fuchsia-800 text-fuchsia-650 dark:text-fuchsia-300 text-xs font-semibold uppercase tracking-wider mb-4">
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>8-Bit & Retro Hardware Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-tight mb-4">
          {pageTitle || "Pixel Art & 8-Bit Converter"}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
          {pageSubtitle || "Transform any image into authentic vintage console pixel art with Game Boy, NES, and PICO-8 palettes and error-diffusion dithering."}
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        {!imageUrl ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
            <div className="md:col-span-7 flex flex-col justify-center">
              <DropZone
                onFilesSelected={handleFilesSelected}
                title="Drop photo to convert to 8-bit pixel art"
                subtitle="Supports JPG, PNG, WebP, HEIC up to 50MB"
              />
            </div>
            <div className="md:col-span-5 flex">
              <div className="premium-bento rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between w-full shadow-sm">
                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-fuchsia-650 dark:text-fuchsia-400 bg-fuchsia-50 dark:bg-fuchsia-950/50 border border-fuchsia-100 dark:border-fuchsia-900 px-2 py-0.5 rounded uppercase tracking-wider inline-block">
                    Retro Dither Lab
                  </div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Vintage Game Console Emulation</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    Quantize your images into Game Boy green dot-matrix screens, NES 8-bit sprites, or PICO-8 fantasy graphics.
                  </p>
                </div>
                <DemoPreview toolId="pixelart" alt="Pixel Art Generator Preview" />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Control Sidebar (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="premium-bento p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-5 shadow-xl shadow-slate-200/20 dark:shadow-none">
                
                {/* Pixel Block Size */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Grid className="w-3.5 h-3.5 text-fuchsia-500" />
                      <span>Pixel Block Size</span>
                    </span>
                    <span className="font-mono text-fuchsia-600">{pixelSize} px</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="48"
                    value={pixelSize}
                    onChange={(e) => setPixelSize(Number(e.target.value))}
                    className="range-styled w-full"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    <span>Fine Detail (2px)</span>
                    <span>Blocky Retro (48px)</span>
                  </div>
                </div>

                {/* Hardware Palette Selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Console Palette
                  </label>
                  <div className="space-y-1.5">
                    {PALETTES.map((pal) => (
                      <button
                        key={pal.id}
                        onClick={() => setSelectedPaletteId(pal.id)}
                        className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          selectedPaletteId === pal.id
                            ? 'bg-fuchsia-50 dark:bg-fuchsia-950/40 border-fuchsia-300 dark:border-fuchsia-700 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                            {pal.name}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate max-w-[200px]">
                            {pal.description}
                          </span>
                        </div>
                        {pal.colors && (
                          <div className="flex gap-0.5 shrink-0">
                            {pal.colors.slice(0, 5).map((c, i) => (
                              <div
                                key={i}
                                className="w-3.5 h-3.5 rounded-md border border-slate-300 dark:border-slate-700"
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dithering Mode */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Dithering Algorithm
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(
                      [
                        { id: 'floyd-steinberg', label: 'Floyd-Steinberg' },
                        { id: 'bayer', label: 'Bayer 4x4' },
                        { id: 'none', label: 'Flat (None)' }
                      ] as const
                    ).map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setDitherMode(m.id)}
                        className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                          ditherMode === m.id
                            ? 'bg-fuchsia-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Options: Contrast Boost & Pixel Grid */}
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                      <span>Contrast Boost</span>
                      <span className="font-mono text-fuchsia-600">{contrastBoost > 0 ? `+${contrastBoost}` : contrastBoost}</span>
                    </div>
                    <input
                      type="range"
                      min="-30"
                      max="40"
                      value={contrastBoost}
                      onChange={(e) => setContrastBoost(Number(e.target.value))}
                      className="range-styled w-full"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      CRT Pixel Grid Lines
                    </span>
                    <button
                      onClick={() => setShowGrid(!showGrid)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        showGrid
                          ? 'bg-fuchsia-50 dark:bg-fuchsia-950/50 border-fuchsia-300 text-fuchsia-700'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-400'
                      }`}
                    >
                      {showGrid ? 'Visible' : 'Hidden'}
                    </button>
                  </div>
                </div>

                {/* Export Options */}
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Export Format
                    </label>
                    <div className="flex gap-1.5">
                      {(['png', 'svg', 'webp'] as const).map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => setExportFormat(fmt)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                            exportFormat === fmt
                              ? 'bg-fuchsia-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                  </div>
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
                    className="flex-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700 text-white font-bold text-sm shadow-lg shadow-fuchsia-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Pixel Art</span>
                  </button>
                </div>

              </div>
            </div>

            {/* Stage (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="relative rounded-3xl bg-slate-950/5 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 p-4 min-h-[420px] flex items-center justify-center overflow-hidden">
                <canvas
                  ref={canvasRef}
                  className="max-w-full max-h-[600px] object-contain rounded-2xl shadow-xl transition-all select-none [image-rendering:pixelated]"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2 font-medium">
                <span>Resolution: {imageSize.width} × {imageSize.height} px</span>
                <span>Hardware Quantized in Local RAM</span>
              </div>
            </div>

          </div>
        )}

        {/* SEO Guide Section */}
        <div className="mt-16 border-t border-slate-200/60 dark:border-slate-800 pt-12">
          <ToolGuide
            toolName="Pixel Art & 8-Bit Retro Photo Converter"
            introText="Transform modern digital photos into nostalgic 8-bit pixel art inspired by vintage gaming consoles and retro computers."
            competitorComparison={{
              alternatives: ['PixelMe', 'Piskel', 'iLoveIMG Pixelate'],
              benefit: 'Our pixel art converter features authentic hardware palette quantization (Game Boy, NES, PICO-8, Commodore 64) with Floyd-Steinberg error-diffusion dithering and lossless SVG vector grid export.',
            }}
            steps={[
              { title: 'Upload Image', description: 'Drop any photograph or graphic into the pixel art studio.' },
              { title: 'Adjust Block Size', description: 'Use the pixel size slider to choose between fine retro details or chunky 8-bit blocks.' },
              { title: 'Select Console Palette', description: 'Choose between Game Boy olive greens, PICO-8 16-color sprites, or Commodore 64 tones.' },
              { title: 'Export Lossless or SVG', description: 'Download your pixel masterpiece in crisp PNG, WebP, or scalable vector SVG.' },
            ]}
            features={[
              'Floyd-Steinberg and Bayer 4x4 ordered dithering algorithms',
              'Authentic hardware palettes for Game Boy, PICO-8, NES, and C64',
              'Vector SVG grid export for infinite scalable prints',
              '100% Client-side sandbox rendering with zero cloud uploads'
            ]}
            faq={[
              { q: 'What makes Floyd-Steinberg dithering special for pixel art?', a: 'Floyd-Steinberg dithering diffuses quantization errors across neighboring pixels, creating smooth gradient illusions even when restricted to 4 or 16 vintage hardware colors.' },
              { q: 'Can I export scalable vector SVG pixel art?', a: 'Yes! Select the SVG export format to download clean vector rectangles that scale infinitely without blurring.' }
            ]}
          />
        </div>

      </div>
    </div>
  );
};
