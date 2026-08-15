import React, { useState, useEffect, useRef } from 'react';
import { Download, RefreshCw, Type, Image as ImageIcon, Grid, Layers, ShieldCheck, FolderArchive } from 'lucide-react';
import { DropZone } from '../components/DropZone';
import { SEO } from '../components/SEO';
import { ToolGuide } from '../components/ToolGuide';
import { DemoPreview } from '../components/DemoPreview';
import JSZip from 'jszip';

interface WatermarkOverlayProps {
  initialMode?: 'single' | 'batch' | 'tiled';
  pageTitle?: string;
  pageSubtitle?: string;
}

export const WatermarkOverlay: React.FC<WatermarkOverlayProps> = ({
  initialMode = 'single',
  pageTitle,
  pageSubtitle,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Watermark Settings
  const [watermarkType, setWatermarkType] = useState<'text' | 'logo'>('text');
  const [placementMode, setPlacementMode] = useState<'grid' | 'tiled'>(initialMode === 'tiled' ? 'tiled' : 'grid');

  // Text Watermark Options
  const [text, setText] = useState<string>('© ImagePlumber');
  const [fontFamily, setFontFamily] = useState<string>('Montserrat, sans-serif');
  const [fontSizeRatio, setFontSizeRatio] = useState<number>(5); // 1% to 20% of canvas width
  const [textColor, setTextColor] = useState<string>('#FFFFFF');
  const [strokeColor, setStrokeColor] = useState<string>('#000000');
  const [hasStroke, setHasStroke] = useState<boolean>(true);

  // Logo Watermark Options
  const [logoSrc, setLogoSrc] = useState<string>('');
  const [logoSizeRatio, setLogoSizeRatio] = useState<number>(20); // 5% to 80%

  // Common Options
  const [opacity, setOpacity] = useState<number>(65); // 0 to 100%
  const [rotation, setRotation] = useState<number>(0); // -180 to +180 deg
  const [anchorPosition, setAnchorPosition] = useState<
    'top-left' | 'top-center' | 'top-right' |
    'center-left' | 'center' | 'center-right' |
    'bottom-left' | 'bottom-center' | 'bottom-right'
  >('bottom-right');
  const [margin, setMargin] = useState<number>(30); // px
  const [tileSpacing, setTileSpacing] = useState<number>(180); // px for tiled pattern

  const [exportFormat, setExportFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png');
  const [jpegQuality, setJpegQuality] = useState<number>(92);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFilesSelected = (selectedFiles: File[]) => {
    if (selectedFiles.length > 0) {
      setFiles(selectedFiles);
      setSelectedFileIndex(0);
      loadSingleImage(selectedFiles[0]);
    }
  };

  const loadSingleImage = (f: File) => {
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    const url = URL.createObjectURL(f);
    setImageSrc(url);

    const img = new Image();
    img.src = url;
    img.onload = () => {
      setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
    };
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const f = e.target.files[0];
      if (logoSrc) URL.revokeObjectURL(logoSrc);
      setLogoSrc(URL.createObjectURL(f));
    }
  };

  // Draw Watermark on a Given Context
  const drawWatermarkOnContext = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    logoImg?: HTMLImageElement | null
  ) => {
    ctx.save();
    ctx.globalAlpha = opacity / 100;

    if (placementMode === 'tiled') {
      // Full-canvas diagonal 45-degree repeating grid
      const diagDist = Math.hypot(w, h);
      ctx.translate(w / 2, h / 2);
      ctx.rotate((-30 * Math.PI) / 180);
      ctx.translate(-diagDist / 2, -diagDist / 2);

      const step = Math.max(100, tileSpacing);
      const computedFontSize = Math.max(14, Math.round(w * (fontSizeRatio / 100)));

      for (let y = 0; y < diagDist; y += step) {
        for (let x = 0; x < diagDist; x += step) {
          ctx.save();
          ctx.translate(x, y);

          if (watermarkType === 'text') {
            ctx.font = `bold ${computedFontSize}px ${fontFamily}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            if (hasStroke) {
              ctx.strokeStyle = strokeColor;
              ctx.lineWidth = Math.max(1, Math.round(computedFontSize * 0.1));
              ctx.strokeText(text, 0, 0);
            }
            ctx.fillStyle = textColor;
            ctx.fillText(text, 0, 0);
          } else if (watermarkType === 'logo' && logoImg) {
            const logoW = Math.max(30, Math.round(w * (logoSizeRatio / 100)));
            const logoH = (logoW / logoImg.naturalWidth) * logoImg.naturalHeight;
            ctx.drawImage(logoImg, -logoW / 2, -logoH / 2, logoW, logoH);
          }

          ctx.restore();
        }
      }
    } else {
      // 9-Point Anchor Placement
      let posX = w / 2;
      let posY = h / 2;
      let alignH: CanvasTextAlign = 'center';
      let alignV: CanvasTextBaseline = 'middle';

      // Horizontal position
      if (anchorPosition.includes('left')) {
        posX = margin;
        alignH = 'left';
      } else if (anchorPosition.includes('right')) {
        posX = w - margin;
        alignH = 'right';
      }

      // Vertical position
      if (anchorPosition.includes('top')) {
        posY = margin;
        alignV = 'top';
      } else if (anchorPosition.includes('bottom')) {
        posY = h - margin;
        alignV = 'bottom';
      }

      ctx.translate(posX, posY);
      ctx.rotate((rotation * Math.PI) / 180);

      if (watermarkType === 'text') {
        const computedFontSize = Math.max(14, Math.round(w * (fontSizeRatio / 100)));
        ctx.font = `bold ${computedFontSize}px ${fontFamily}`;
        ctx.textAlign = alignH;
        ctx.textBaseline = alignV;

        if (hasStroke) {
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = Math.max(1, Math.round(computedFontSize * 0.12));
          ctx.strokeText(text, 0, 0);
        }
        ctx.fillStyle = textColor;
        ctx.fillText(text, 0, 0);
      } else if (watermarkType === 'logo' && logoImg) {
        const logoW = Math.max(40, Math.round(w * (logoSizeRatio / 100)));
        const logoH = (logoW / logoImg.naturalWidth) * logoImg.naturalHeight;

        let offsetX = -logoW / 2;
        let offsetY = -logoH / 2;
        if (alignH === 'left') offsetX = 0;
        if (alignH === 'right') offsetX = -logoW;
        if (alignV === 'top') offsetY = 0;
        if (alignV === 'bottom') offsetY = -logoH;

        ctx.drawImage(logoImg, offsetX, offsetY, logoW, logoH);
      }
    }

    ctx.restore();
  };

  // Render Main Preview Canvas
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

      // 1. Draw source background
      ctx.drawImage(img, 0, 0, w, h);

      // 2. Draw watermark
      if (watermarkType === 'logo' && logoSrc) {
        const lImg = new Image();
        lImg.src = logoSrc;
        lImg.onload = () => {
          drawWatermarkOnContext(ctx, w, h, lImg);
        };
      } else {
        drawWatermarkOnContext(ctx, w, h, null);
      }
    };
  }, [
    imageSrc,
    imageSize,
    watermarkType,
    placementMode,
    text,
    fontFamily,
    fontSizeRatio,
    textColor,
    strokeColor,
    hasStroke,
    logoSrc,
    logoSizeRatio,
    opacity,
    rotation,
    anchorPosition,
    margin,
    tileSpacing,
  ]);

  // Download Single Current Image
  const handleDownloadSingle = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsProcessing(true);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const originalName = files[selectedFileIndex]?.name.replace(/\.[^/.]+$/, '') || 'watermarked';
        const ext = exportFormat === 'image/png' ? 'png' : exportFormat === 'image/webp' ? 'webp' : 'jpg';
        a.download = `${originalName}-watermarked.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
        setIsProcessing(false);
      },
      exportFormat,
      exportFormat === 'image/jpeg' ? jpegQuality / 100 : undefined
    );
  };

  // Download All as Batch ZIP
  const handleDownloadBatch = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setBatchProgress({ current: 0, total: files.length });

    const zip = new JSZip();

    let loadedLogo: HTMLImageElement | null = null;
    if (watermarkType === 'logo' && logoSrc) {
      loadedLogo = await new Promise((resolve) => {
        const l = new Image();
        l.src = logoSrc;
        l.onload = () => resolve(l);
        l.onerror = () => resolve(null);
      });
    }

    for (let i = 0; i < files.length; i++) {
      setBatchProgress({ current: i + 1, total: files.length });
      const currentFile = files[i];

      const blob = await new Promise<Blob | null>((resolve) => {
        const img = new Image();
        const objUrl = URL.createObjectURL(currentFile);
        img.src = objUrl;
        img.onload = () => {
          const offscreen = document.createElement('canvas');
          offscreen.width = img.naturalWidth;
          offscreen.height = img.naturalHeight;
          const ctx = offscreen.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            drawWatermarkOnContext(ctx, img.naturalWidth, img.naturalHeight, loadedLogo);
            offscreen.toBlob(
              (resBlob) => {
                URL.revokeObjectURL(objUrl);
                resolve(resBlob);
              },
              exportFormat,
              exportFormat === 'image/jpeg' ? jpegQuality / 100 : undefined
            );
          } else {
            URL.revokeObjectURL(objUrl);
            resolve(null);
          }
        };
        img.onerror = () => {
          URL.revokeObjectURL(objUrl);
          resolve(null);
        };
      });

      if (blob) {
        const baseName = currentFile.name.replace(/\.[^/.]+$/, '');
        const ext = exportFormat === 'image/png' ? 'png' : exportFormat === 'image/webp' ? 'webp' : 'jpg';
        zip.file(`${baseName}-watermarked.${ext}`, blob);
      }
    }

    const zipContent = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    const zipUrl = URL.createObjectURL(zipContent);
    a.href = zipUrl;
    a.download = `watermarked-photos-${Date.now()}.zip`;
    a.click();
    URL.revokeObjectURL(zipUrl);

    setIsProcessing(false);
    setBatchProgress(null);
  };

  const handleReset = () => {
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    if (logoSrc) URL.revokeObjectURL(logoSrc);
    setFiles([]);
    setSelectedFileIndex(0);
    setImageSrc('');
    setLogoSrc('');
    setImageSize({ width: 0, height: 0 });
  };

  const watermarkSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Batch Watermark Overlay & Brand Studio - ImagePlumber',
    'applicationCategory': 'MultimediaApplication',
    'operatingSystem': 'Web Browser',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD',
    },
    'description': 'Add text and logo watermarks to multiple photos in batch for free online. 9-point anchor matrix, tiled proofing pattern, and ZIP export with zero cloud uploads.',
    'featureList': [
      'Multi-photo batch watermarking with 1-click ZIP export',
      'Custom text and transparent PNG logo overlay support',
      '9-Point anchor grid positioning and full-canvas 45° diagonal tiled repeating grid',
      'Opacity, rotation, font selection, and stroke outline controls'
    ]
  };

  return (
    <div className="py-8 md:py-12 max-w-7xl mx-auto px-4 sm:px-6">
      <SEO
        title={pageTitle || "Watermark Photos Online Free (Batch & Tiled Grid) | ImagePlumber"}
        description={pageSubtitle || "Add text, logos, or tiled copyright watermarks to photos in batch online for free. 100% private in-browser canvas processing with zero uploads."}
        canonicalUrl="https://imageplumber.com/watermark-overlay"
        schema={watermarkSchema}
      />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-800 text-cyan-650 dark:text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-4">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Batch Branding & Copyright Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-tight mb-4">
          {pageTitle || "Batch Watermark & Brand Studio"}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
          {pageSubtitle || "Protect your work by applying custom text or logo watermarks across multiple photos simultaneously with 9-point grid or tiled repeating patterns."}
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        {files.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
            <div className="md:col-span-7 flex flex-col justify-center">
              <DropZone
                onFilesSelected={handleFilesSelected}
                title="Drop photos to add watermark (Batch supported)"
                subtitle="Supports JPG, PNG, WebP, HEIC up to 50MB (Upload multiple files at once)"
              />
            </div>
            <div className="md:col-span-5 flex">
              <div className="premium-bento rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between w-full shadow-sm">
                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-cyan-650 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-100 dark:border-cyan-900 px-2 py-0.5 rounded uppercase tracking-wider inline-block">
                    Brand Studio
                  </div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Batch Photo Protection</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    Stamp your logo or copyright text on dozens of images in seconds, then export as a combined ZIP archive.
                  </p>
                </div>
                <DemoPreview toolId="watermark" alt="Watermark Overlay Preview" />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Control Sidebar (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="premium-bento p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-5 shadow-xl shadow-slate-200/20 dark:shadow-none">
                
                {/* Batch File Selector Carousel */}
                {files.length > 1 && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Active Batch Preview ({selectedFileIndex + 1} of {files.length})
                    </label>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {files.map((f, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedFileIndex(idx);
                            loadSingleImage(f);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                            selectedFileIndex === idx
                              ? 'bg-cyan-600 text-white shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          #{idx + 1}: {f.name.slice(0, 12)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Watermark Type Selector */}
                <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                  <button
                    onClick={() => setWatermarkType('text')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      watermarkType === 'text'
                        ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-300 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Type className="w-3.5 h-3.5" />
                    <span>Text Stamp</span>
                  </button>
                  <button
                    onClick={() => setWatermarkType('logo')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      watermarkType === 'logo'
                        ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-300 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Logo Image</span>
                  </button>
                </div>

                {/* Mode: 9-Point vs Tiled Pattern */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Placement Style
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPlacementMode('grid')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        placementMode === 'grid'
                          ? 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-300 text-cyan-700 dark:text-cyan-300'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-500'
                      }`}
                    >
                      <Grid className="w-3.5 h-3.5" />
                      <span>Corner / Anchor</span>
                    </button>
                    <button
                      onClick={() => setPlacementMode('tiled')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        placementMode === 'tiled'
                          ? 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-300 text-cyan-700 dark:text-cyan-300'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-500'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Tiled Pattern</span>
                    </button>
                  </div>
                </div>

                {/* Text Watermark Controls */}
                {watermarkType === 'text' && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                        Watermark Text
                      </label>
                      <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        placeholder="e.g. © 2026 Studio"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                          Font
                        </label>
                        <select
                          value={fontFamily}
                          onChange={(e) => setFontFamily(e.target.value)}
                          className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none"
                        >
                          <option value="Montserrat, sans-serif">Montserrat</option>
                          <option value="Impact, sans-serif">Impact</option>
                          <option value="Anton, sans-serif">Anton</option>
                          <option value="Playfair Display, serif">Playfair Display</option>
                          <option value="monospace">Monospace</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                          Text & Stroke Color
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700"
                            title="Text Fill Color"
                          />
                          {hasStroke && (
                            <input
                              type="color"
                              value={strokeColor}
                              onChange={(e) => setStrokeColor(e.target.value)}
                              className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700"
                              title="Stroke Outline Color"
                            />
                          )}
                          <button
                            onClick={() => setHasStroke(!hasStroke)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                              hasStroke ? 'bg-cyan-50 border-cyan-300 text-cyan-700' : 'bg-slate-50 border-slate-200 text-slate-400'
                            }`}
                          >
                            Stroke ({hasStroke ? 'ON' : 'OFF'})
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Logo Watermark Controls */}
                {watermarkType === 'logo' && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Upload Logo (PNG with transparency recommended)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 cursor-pointer"
                    />
                  </div>
                )}

                {/* 9-Point Matrix Picker (when in grid mode) */}
                {placementMode === 'grid' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Position Anchor
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 max-w-[180px]">
                      {(
                        [
                          'top-left', 'top-center', 'top-right',
                          'center-left', 'center', 'center-right',
                          'bottom-left', 'bottom-center', 'bottom-right'
                        ] as const
                      ).map((pos) => (
                        <button
                          key={pos}
                          onClick={() => setAnchorPosition(pos)}
                          className={`h-8 rounded-lg text-[10px] font-bold transition-all cursor-pointer border ${
                            anchorPosition === pos
                              ? 'bg-cyan-600 text-white border-cyan-600 shadow-sm'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {pos === 'center' ? '•' : pos.split('-').map(p => p[0].toUpperCase()).join('')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sliders: Opacity, Scale, Rotation, Margin/Spacing */}
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                      <span>Opacity</span>
                      <span className="font-mono text-cyan-600">{opacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      value={opacity}
                      onChange={(e) => setOpacity(Number(e.target.value))}
                      className="range-styled w-full"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                      <span>Size Scale</span>
                      <span className="font-mono text-cyan-600">
                        {watermarkType === 'text' ? `${fontSizeRatio}% width` : `${logoSizeRatio}% width`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="40"
                      value={watermarkType === 'text' ? fontSizeRatio : logoSizeRatio}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (watermarkType === 'text') setFontSizeRatio(val);
                        else setLogoSizeRatio(val);
                      }}
                      className="range-styled w-full"
                    />
                  </div>

                  {placementMode === 'grid' ? (
                    <>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                          <span>Margin / Offset</span>
                          <span className="font-mono text-cyan-600">{margin} px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="150"
                          value={margin}
                          onChange={(e) => setMargin(Number(e.target.value))}
                          className="range-styled w-full"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                          <span>Rotation</span>
                          <span className="font-mono text-cyan-600">{rotation}°</span>
                        </div>
                        <input
                          type="range"
                          min="-90"
                          max="90"
                          value={rotation}
                          onChange={(e) => setRotation(Number(e.target.value))}
                          className="range-styled w-full"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                        <span>Pattern Grid Spacing</span>
                        <span className="font-mono text-cyan-600">{tileSpacing} px</span>
                      </div>
                      <input
                        type="range"
                        min="100"
                        max="350"
                        value={tileSpacing}
                        onChange={(e) => setTileSpacing(Number(e.target.value))}
                        className="range-styled w-full"
                      />
                    </div>
                  )}
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
                              ? 'bg-cyan-600 text-white'
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
                        <span>JPEG Quality</span>
                        <span className="font-mono text-cyan-600">{jpegQuality}%</span>
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
                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex gap-3">
                    <button
                      onClick={handleReset}
                      className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Reset</span>
                    </button>
                    <button
                      onClick={handleDownloadSingle}
                      disabled={isProcessing}
                      className="flex-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Image</span>
                    </button>
                  </div>

                  {files.length > 1 && (
                    <button
                      onClick={handleDownloadBatch}
                      disabled={isProcessing}
                      className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <FolderArchive className="w-4 h-4" />
                      <span>
                        {batchProgress
                          ? `Processing ${batchProgress.current}/${batchProgress.total}...`
                          : `Download All ${files.length} Photos as ZIP`}
                      </span>
                    </button>
                  )}
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
                <span>Dimensions: {imageSize.width} × {imageSize.height} px</span>
                <span>100% Client-Side RAM Processing</span>
              </div>
            </div>

          </div>
        )}

        {/* SEO Guide Section */}
        <div className="mt-16 border-t border-slate-200/60 dark:border-slate-800 pt-12">
          <ToolGuide
            toolName="Batch Watermark & Brand Studio"
            introText="Protect your photographs and digital media with custom text and logo watermarks across single or multi-photo batches."
            competitorComparison={{
              alternatives: ['Watermarkly', 'iLoveIMG Watermark', 'Visual Watermark'],
              benefit: 'Our watermark studio processes your photos 100% inside your local browser memory. Watermark dozens of high-resolution images in parallel and download a clean ZIP archive with zero cloud latency and zero subscriptions.',
            }}
            steps={[
              { title: 'Upload Photos', description: 'Drag and drop single or multiple photos into the batch workspace.' },
              { title: 'Choose Watermark Style', description: 'Select between custom typography text stamps or transparent PNG brand logos.' },
              { title: 'Configure Placement', description: 'Choose 9-point anchor corner placement or a full-canvas 45-degree tiled diagonal repeating pattern.' },
              { title: 'Export Single or ZIP Batch', description: 'Download the active image or save all watermarked images in a single ZIP bundle.' },
            ]}
            features={[
              'Multi-photo batch watermarking engine with 1-click ZIP package download',
              'Text and transparent PNG logo watermark overlay support',
              '9-Point anchor matrix and 45° diagonal tiled repeating copyright patterns',
              '100% Client-side sandbox execution with zero file size limits'
            ]}
            faq={[
              { q: 'Is there a limit on how many photos I can watermark in a batch?', a: 'No, our client-side engine processes as many photos as your browser memory allows.' },
              { q: 'Can I use a transparent PNG for my logo watermark?', a: 'Yes! Transparent PNGs and SVGs are fully supported and retain clean transparent backgrounds.' }
            ]}
          />
        </div>

      </div>
    </div>
  );
};
