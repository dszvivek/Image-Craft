import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Terminal, Copy, Check, FileText, Code, Image as ImageIcon, Eye, Minus, Plus, Download } from 'lucide-react';
import { DropZone } from '../components/DropZone';
import { SEO } from '../components/SEO';
import { ToolGuide } from '../components/ToolGuide';
import { DemoPreview } from '../components/DemoPreview';

interface CharSet {
  id: string;
  name: string;
  chars: string;
  description: string;
}

const CHAR_SETS: CharSet[] = [
  {
    id: 'standard',
    name: 'Classic 10-Level ASCII',
    chars: '@%#*+=-:. ',
    description: 'Clean readable monochrome shades'
  },
  {
    id: 'dense',
    name: 'High-Density 70-Char Master',
    chars: '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^`\'. ',
    description: 'Ultra-fine tonal transitions for complex portraits'
  },
  {
    id: 'blocks',
    name: 'Unicode Block Shades',
    chars: '█▓▒░ ',
    description: 'Solid typographic pixel blocks'
  },
  {
    id: 'binary',
    name: 'Matrix Binary (0 & 1)',
    chars: '10 ',
    description: 'Cyberpunk hacker code stream'
  },
  {
    id: 'math',
    name: 'Math & Greek Symbols',
    chars: 'ΩΨ∑∏∆∇∂√∫≈≠± ',
    description: 'Technical formula and physics notation'
  }
];

type ColorTheme = 'matrix' | 'amber' | 'colored-html' | 'dark' | 'light';

interface AsciiArtGeneratorProps {
  pageTitle?: string;
  pageSubtitle?: string;
}

export const AsciiArtGenerator: React.FC<AsciiArtGeneratorProps> = ({
  pageTitle,
  pageSubtitle,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Settings
  const [charSetId, setCharSetId] = useState<string>('standard');
  const [columns, setColumns] = useState<number>(100); // 40 to 220
  const [colorTheme, setColorTheme] = useState<ColorTheme>('matrix');
  const [isInverted, setIsInverted] = useState<boolean>(false);
  const [contrast, setContrast] = useState<number>(20); // -50 to +50

  const [plainAscii, setPlainAscii] = useState<string>('');
  const [coloredHtml, setColoredHtml] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isComparing, setIsComparing] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

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

  // Convert Image to ASCII
  useEffect(() => {
    if (!imageUrl || imageSize.width === 0 || imageSize.height === 0) return;

    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      const activeCharSet = CHAR_SETS.find((c) => c.id === charSetId)?.chars || CHAR_SETS[0].chars;
      const charsLen = activeCharSet.length;

      // Monospace characters are roughly 2x taller than wide, so height ratio is ~0.55
      const aspectCorrection = 0.55;
      const targetW = columns;
      const targetH = Math.round((imageSize.height / imageSize.width) * targetW * aspectCorrection);

      const offscreen = document.createElement('canvas');
      offscreen.width = targetW;
      offscreen.height = targetH;
      const ctx = offscreen.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, targetW, targetH);
      const imgData = ctx.getImageData(0, 0, targetW, targetH);
      const data = imgData.data;

      let rawText = '';
      let htmlString = '';

      const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));

      for (let y = 0; y < targetH; y++) {
        let lineText = '';
        let lineHtml = '';

        for (let x = 0; x < targetW; x++) {
          const idx = (y * targetW + x) * 4;
          let r = data[idx];
          let g = data[idx + 1];
          let b = data[idx + 2];

          // Apply contrast
          if (contrast !== 0) {
            r = Math.max(0, Math.min(255, contrastFactor * (r - 128) + 128));
            g = Math.max(0, Math.min(255, contrastFactor * (g - 128) + 128));
            b = Math.max(0, Math.min(255, contrastFactor * (b - 128) + 128));
          }

          // ITU-R BT.601 luminance
          let lum = 0.299 * r + 0.587 * g + 0.114 * b;
          if (isInverted) lum = 255 - lum;

          const charIdx = Math.floor((lum / 255) * (charsLen - 1));
          const char = activeCharSet[charIdx] || ' ';

          lineText += char;

          // HTML colored span
          const safeChar = char === '<' ? '&lt;' : char === '>' ? '&gt;' : char === '&' ? '&amp;' : char === ' ' ? '&nbsp;' : char;
          lineHtml += `<span style="color:rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})">${safeChar}</span>`;
        }

        rawText += lineText + '\n';
        htmlString += lineHtml + '\n';
      }

      setPlainAscii(rawText);
      setColoredHtml(htmlString);

      // Also render to output preview canvas for PNG image export
      const renderCanvas = canvasRef.current;
      if (renderCanvas) {
        const charPx = 10;
        const outW = targetW * (charPx * 0.6);
        const outH = targetH * charPx;

        renderCanvas.width = outW;
        renderCanvas.height = outH;
        const rCtx = renderCanvas.getContext('2d');
        if (rCtx) {
          // Background fill
          if (colorTheme === 'light') {
            rCtx.fillStyle = '#FFFFFF';
          } else if (colorTheme === 'amber') {
            rCtx.fillStyle = '#100C02';
          } else {
            rCtx.fillStyle = '#0B0F19';
          }
          rCtx.fillRect(0, 0, outW, outH);

          rCtx.font = `${charPx}px monospace`;
          rCtx.textBaseline = 'top';

          const lines = rawText.split('\n');
          for (let row = 0; row < lines.length; row++) {
            const rowText = lines[row];
            for (let col = 0; col < rowText.length; col++) {
              const ch = rowText[col];
              if (ch === ' ') continue;

              const posX = col * (charPx * 0.6);
              const posY = row * charPx;

              if (colorTheme === 'colored-html') {
                const pixelIdx = (row * targetW + col) * 4;
                rCtx.fillStyle = `rgb(${data[pixelIdx]},${data[pixelIdx + 1]},${data[pixelIdx + 2]})`;
              } else if (colorTheme === 'matrix') {
                rCtx.fillStyle = '#00FF66';
              } else if (colorTheme === 'amber') {
                rCtx.fillStyle = '#FFB000';
              } else if (colorTheme === 'light') {
                rCtx.fillStyle = '#0F172A';
              } else {
                rCtx.fillStyle = '#F8FAFC';
              }

              rCtx.fillText(ch, posX, posY);
            }
          }
        }
      }
    };
  }, [imageUrl, imageSize, charSetId, columns, colorTheme, isInverted, contrast]);

  // Copy Raw Text
  const handleCopyText = async () => {
    if (!plainAscii) return;
    try {
      await navigator.clipboard.writeText(plainAscii);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Clipboard write failed', err);
    }
  };

  // Download .TXT Plain Text File
  const handleDownloadTxt = () => {
    if (!plainAscii) return;
    const blob = new Blob([plainAscii], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const originalName = file?.name.replace(/\.[^/.]+$/, '') || 'ascii-art';
    a.download = `${originalName}-ascii.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download Standalone .HTML File
  const handleDownloadHtml = () => {
    if (!coloredHtml) return;
    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>ASCII Art - ImagePlumber</title>
  <style>
    body { background-color: #0d1117; color: #58a6ff; font-family: monospace; font-size: 8px; line-height: 8px; margin: 20px; white-space: pre; }
  </style>
</head>
<body>
<pre>${coloredHtml}</pre>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const originalName = file?.name.replace(/\.[^/.]+$/, '') || 'ascii-art';
    a.download = `${originalName}-colored-ascii.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download Rendered PNG Image
  const handleDownloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsProcessing(true);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const originalName = file?.name.replace(/\.[^/.]+$/, '') || 'ascii-art';
      a.download = `${originalName}-ascii.png`;
      a.click();
      URL.revokeObjectURL(url);
      setIsProcessing(false);
    }, 'image/png');
  };

  const handleReset = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setFile(null);
    setImageUrl('');
    setImageSize({ width: 0, height: 0 });
    setPlainAscii('');
    setColoredHtml('');
    setColumns(100);
  };

  const asciiSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'ASCII & Text Art Generator - ImagePlumber',
    'applicationCategory': 'MultimediaApplication',
    'operatingSystem': 'Web Browser',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD',
    },
    'description': 'Convert photos into ASCII text art online for free. Matrix green, full-color ANSI HTML, block shades, and 1-click clipboard/TXT/PNG export.',
    'featureList': [
      'Character density slider (40 to 220 columns)',
      'Classic 10-char, 70-char dense, and Unicode block presets',
      'Matrix green, amber CRT, and full-color ANSI styles',
      'Export to TXT, colored HTML, PNG canvas, and clipboard'
    ]
  };

  return (
    <div className="py-8 md:py-12 max-w-7xl mx-auto px-4 sm:px-6">
      <SEO
        title={pageTitle || "ASCII Art Generator & Image to Text Art Online Free | ImagePlumber"}
        description={pageSubtitle || "Turn photos into ASCII character art online for free. Full-color ANSI, Matrix green phosphor, Unicode blocks, and TXT/PNG export."}
schema={asciiSchema}
      />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-650 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-4">
          <Terminal className="w-3.5 h-3.5" />
          <span>Typographic & ANSI Art Lab</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-tight mb-4">
          {pageTitle || "ASCII & Text Art Generator"}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
          {pageSubtitle || "Convert photos into terminal ASCII character artwork with Matrix green phosphor glow, full-color ANSI HTML, and 1-click clipboard/PNG export."}
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        {!imageUrl ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
            <div className="md:col-span-7 flex flex-col justify-center">
              <DropZone
                onFilesSelected={handleFilesSelected}
                title="Drop photo to convert to ASCII text art"
                subtitle="Supports JPG, PNG, WebP, HEIC up to 50MB"
              />
            </div>
            <div className="md:col-span-5 flex">
              <div className="premium-bento rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between w-full shadow-sm">
                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-emerald-650 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900 px-2 py-0.5 rounded uppercase tracking-wider inline-block">
                    Terminal Typographer
                  </div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Luminance Character Mapping</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    Map image brightness onto custom character sets to render high-contrast cyberpunk ASCII portraits.
                  </p>
                </div>
                <DemoPreview toolId="ascii" alt="ASCII Art Generator Preview" />
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
                    ASCII Art Presets
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { label: '⚡ Matrix Stream', cols: 80, theme: 'matrix', set: 'binary' },
                      { label: '✨ Classic Terminal', cols: 100, theme: 'amber', set: 'standard' },
                      { label: '🎨 Color Portrait', cols: 130, theme: 'colored-html', set: 'dense' },
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setColumns(preset.cols);
                          setColorTheme(preset.theme as any);
                          setCharSetId(preset.set);
                        }}
                        className="py-2 px-1 rounded-xl text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-600 border border-slate-200/60 dark:border-slate-700/60 transition cursor-pointer active:scale-95 text-center truncate"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Character Density / Columns with Steppers */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-600 dark:text-slate-400">
                    <span>Resolution (Columns)</span>
                    <div className="flex items-center gap-1.5 font-mono text-emerald-600">
                      <button 
                        onClick={() => setColumns(Math.max(40, columns - 10))}
                        className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-xs font-black cursor-pointer active:scale-90 transition"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="min-w-[48px] text-center font-bold">{columns} chars</span>
                      <button 
                        onClick={() => setColumns(Math.min(180, columns + 10))}
                        className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-xs font-black cursor-pointer active:scale-90 transition"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="180"
                    step="5"
                    value={columns}
                    onChange={(e) => setColumns(Number(e.target.value))}
                    className="range-styled w-full accent-emerald-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    <span>Compact (40)</span>
                    <span>High-Definition (180)</span>
                  </div>
                </div>

                {/* Character Set Selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest block">
                    Character Set
                  </label>
                  <div className="space-y-1.5">
                    {CHAR_SETS.map((cs) => (
                      <button
                        key={cs.id}
                        onClick={() => setCharSetId(cs.id)}
                        className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 active:scale-98 ${
                          charSetId === cs.id
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600 shadow-sm ring-1 ring-emerald-500/20'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                            {cs.name}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate max-w-[200px]">
                            {cs.description}
                          </span>
                        </div>
                        <span className="font-mono text-xs text-emerald-600 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 shrink-0">
                          {cs.chars.slice(0, 4)}...
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Theme Selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest block">
                    Display & Color Theme
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        { id: 'matrix', label: 'Matrix Phosphor' },
                        { id: 'colored-html', label: 'Full-Color ANSI' },
                        { id: 'amber', label: 'Amber Terminal' },
                        { id: 'dark', label: 'Dark Mono' },
                        { id: 'light', label: 'Light Mono' }
                      ] as const
                    ).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setColorTheme(t.id)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center active:scale-95 ${
                          colorTheme === t.id
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contrast & Invert Toggles */}
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-600 dark:text-slate-400">
                      <span>Contrast Adjustment</span>
                      <div className="flex items-center gap-1.5 font-mono text-emerald-600">
                        <button 
                          onClick={() => setContrast(Math.max(-30, contrast - 5))}
                          className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-xs font-black cursor-pointer active:scale-90 transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="min-w-[32px] text-center font-bold">{contrast > 0 ? `+${contrast}` : contrast}</span>
                        <button 
                          onClick={() => setContrast(Math.min(40, contrast + 5))}
                          className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-xs font-black cursor-pointer active:scale-90 transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="-30"
                      max="40"
                      step="5"
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="range-styled w-full accent-emerald-600"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Invert Tone Luminance
                    </span>
                    <button
                      onClick={() => setIsInverted(!isInverted)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer active:scale-95 ${
                        isInverted
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 text-emerald-600 dark:text-emerald-400 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                      }`}
                    >
                      {isInverted ? 'Inverted' : 'Standard'}
                    </button>
                  </div>
                </div>

                {/* Export & Copy Actions */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleCopyText}
                      className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                    </button>

                    <button
                      onClick={handleDownloadTxt}
                      className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Save .TXT</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleDownloadHtml}
                      className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Code className="w-3.5 h-3.5" />
                      <span>Save .HTML</span>
                    </button>

                    <button
                      onClick={handleDownloadPng}
                      disabled={isProcessing}
                      className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 active:scale-95"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Save as PNG</span>
                    </button>
                  </div>

                  <button
                    onClick={handleReset}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-500 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Image</span>
                  </button>
                </div>

              </div>
            </div>

            {/* Stage Preview (7 cols) */}
            <div ref={previewContainerRef} className="lg:col-span-7 space-y-4 order-1 lg:order-2">
              <div
                className={`relative rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 min-h-[420px] max-h-[650px] overflow-auto select-all shadow-inner font-mono text-[6px] sm:text-[7px] md:text-[8px] leading-[6px] sm:leading-[7px] md:leading-[8px] whitespace-pre transition-all ${
                  isComparing
                    ? 'bg-black text-white flex items-center justify-center'
                    : colorTheme === 'light'
                    ? 'bg-white text-slate-900'
                    : colorTheme === 'amber'
                    ? 'bg-[#100C02] text-[#FFB000]'
                    : colorTheme === 'matrix'
                    ? 'bg-[#060D08] text-[#00FF66] text-shadow-sm'
                    : 'bg-[#0B0F19] text-slate-100'
                }`}
              >
                {/* ASCII output element is preserved */}
                <div className={isComparing ? 'opacity-0' : 'opacity-100'}>
                  {colorTheme === 'colored-html' ? (
                    <pre
                      ref={preRef}
                      dangerouslySetInnerHTML={{ __html: coloredHtml }}
                      className="m-0 p-0 font-mono"
                    />
                  ) : (
                    <pre ref={preRef} className="m-0 p-0 font-mono">
                      {plainAscii}
                    </pre>
                  )}
                </div>

                {/* Hold to Compare Overlay */}
                {isComparing && (
                  <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none animate-fade-in z-10">
                    <img
                      src={imageUrl}
                      alt="Original"
                      className="max-w-full max-h-[500px] object-contain rounded-2xl shadow-xl select-none"
                    />
                    <span className="absolute top-7 left-7 bg-black/80 backdrop-blur-md text-amber-300 border border-amber-500/40 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg">
                      Original Photo
                    </span>
                  </div>
                )}

                {/* Hold to Compare Button */}
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

              {/* Hidden canvas for PNG export */}
              <canvas ref={canvasRef} className="hidden" />

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2 font-medium">
                <span>Output Grid: {columns} columns</span>
                <span>Select & Copy directly or export PNG</span>
              </div>
            </div>

          </div>
        )}

        {/* Floating Mobile Bottom Action Dock */}
        {imageUrl && (
          <div className="fixed bottom-4 left-4 right-4 sm:hidden z-30 flex items-center justify-between p-2.5 bg-slate-900/90 dark:bg-slate-850/95 text-white rounded-2xl backdrop-blur-xl shadow-2xl border border-white/10 animate-fade-in">
            <button
              onClick={handleCopyText}
              className="py-2 px-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
            >
              <Copy className="w-4 h-4 text-emerald-400" />
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownloadPng}
              disabled={isProcessing}
              className="py-2 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
            >
              <Download className="w-4 h-4" />
              <span>Save PNG</span>
            </button>
          </div>
        )}

        {/* SEO Guide Section */}
        <div className="mt-16 border-t border-slate-200/60 dark:border-slate-800 pt-12">
          <ToolGuide
            toolName="ASCII Art & Image to Text Converter"
            introText="Convert any photograph into terminal text art with customizable character density, Matrix green phosphor glow, and full-color ANSI HTML formatting."
            competitorComparison={{
              alternatives: ['Text-Image.com', 'ASCII Art Generator', 'Manytools ASCII'],
              benefit: 'Our ASCII art generator runs 100% in your local browser with instant 60 FPS live sliders, full-color ANSI rendering, and direct PNG image canvas download without server queues.',
            }}
            steps={[
              { title: 'Upload Photo', description: 'Drop your image into the ASCII converter.' },
              { title: 'Choose Character Set', description: 'Select between standard 10-char gradients, dense 70-char sets, or Unicode block shades.' },
              { title: 'Tune Resolution & Theme', description: 'Adjust character column width and choose Matrix green, amber CRT, or full-color ANSI.' },
              { title: 'Copy or Download', description: 'Copy text to clipboard with 1 click or download as .TXT, .HTML, or high-res PNG.' },
            ]}
            features={[
              'Real-time luminance mapping to customizable character sets',
              'Matrix green, amber CRT, and full-color ANSI HTML themes',
              'High-density 70-character grayscale palette',
              '1-Click Copy to clipboard + .TXT, .HTML, and PNG export'
            ]}
            faq={[
              { q: 'How does the ASCII art generator convert photos to text?', a: 'The algorithm downsamples the image and maps the ITU-R BT.601 brightness (luminance) of each pixel to characters with corresponding visual visual weights.' },
              { q: 'Can I copy the ASCII text directly into Discord or Slack?', a: 'Yes! Click "Copy Text" and paste inside code blocks (``` text ```) for clean monospace rendering in Discord, Slack, and GitHub.' }
            ]}
          />
        </div>

      </div>
    </div>
  );
};
