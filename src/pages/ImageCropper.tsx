import React, { useState, useEffect, useRef } from 'react';
import { Download, RefreshCw, Crop } from 'lucide-react';
import { DropZone } from '../components/DropZone';
import { SEO } from '../components/SEO';
import { ToolGuide } from '../components/ToolGuide';
import { DemoPreview } from '../components/DemoPreview';

interface AspectPreset {
  id: string;
  label: string;
  ratio: number | null; // width / height, null for freeform
  description: string;
  iconText: string;
}

const PRESETS: AspectPreset[] = [
  { id: 'free', label: 'Freeform', ratio: null, description: 'Unconstrained custom crop', iconText: 'Free' },
  { id: '1-1', label: '1:1 Square', ratio: 1, description: 'Instagram / Profile Photos', iconText: '1:1' },
  { id: '4-5', label: '4:5 Portrait', ratio: 4 / 5, description: 'Instagram Feed Posts', iconText: '4:5' },
  { id: '16-9', label: '16:9 Landscape', ratio: 16 / 9, description: 'YouTube / Presentation / X', iconText: '16:9' },
  { id: '9-16', label: '9:16 Story', ratio: 9 / 16, description: 'TikTok / Reels / Stories', iconText: '9:16' },
  { id: 'passport', label: 'Passport (2x2 in)', ratio: 1, description: 'Official Visa & ID Photos', iconText: '2x2' },
  { id: '3-2', label: '3:2 Classic', ratio: 3 / 2, description: '35mm Photography Standard', iconText: '3:2' },
  { id: '2-3', label: '2:3 Portrait', ratio: 2 / 3, description: 'Vertical Photography', iconText: '2:3' },
  { id: '4-3', label: '4:3 Standard', ratio: 4 / 3, description: 'Classic Display & Tablet', iconText: '4:3' },
];

interface ImageCropperProps {
  initialPreset?: string;
  pageTitle?: string;
  pageSubtitle?: string;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({
  initialPreset = 'free',
  pageTitle,
  pageSubtitle,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [selectedPreset, setSelectedPreset] = useState<string>(initialPreset);
  const [gridType, setGridType] = useState<'thirds' | 'golden' | 'none'>('thirds');
  const [exportFormat, setExportFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png');
  const [jpegQuality, setJpegQuality] = useState<number>(92);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Normalized crop coordinates [0..1]
  const [cropBox, setCropBox] = useState<{ x: number; y: number; w: number; h: number }>({
    x: 0.1,
    y: 0.1,
    w: 0.8,
    h: 0.8,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [displayRect, setDisplayRect] = useState<{ width: number; height: number; left: number; top: number }>({
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  });

  const [dragAction, setDragAction] = useState<{
    type: 'move' | 'nw' | 'ne' | 'se' | 'sw' | 'n' | 'e' | 's' | 'w';
    startX: number;
    startY: number;
    startCrop: { x: number; y: number; w: number; h: number };
  } | null>(null);

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
        applyPreset(selectedPreset, img.naturalWidth, img.naturalHeight);
      };
    }
  };

  const applyPreset = (presetId: string, naturalW = imageSize.width, naturalH = imageSize.height) => {
    setSelectedPreset(presetId);
    const preset = PRESETS.find(p => p.id === presetId);
    if (!preset || naturalW === 0 || naturalH === 0) return;

    if (preset.ratio === null) {
      // Freeform default to 80% center
      setCropBox({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 });
      return;
    }

    const imageRatio = naturalW / naturalH;
    const targetRatio = preset.ratio;

    let newW = 0.8;
    let newH = 0.8;

    if (targetRatio > imageRatio) {
      newW = 0.9;
      newH = (newW * naturalW) / (targetRatio * naturalH);
    } else {
      newH = 0.9;
      newW = (newH * naturalH * targetRatio) / naturalW;
    }

    // Clamp inside [0..1]
    newW = Math.min(Math.max(newW, 0.1), 0.98);
    newH = Math.min(Math.max(newH, 0.1), 0.98);

    const newX = (1 - newW) / 2;
    const newY = (1 - newH) / 2;

    setCropBox({ x: newX, y: newY, w: newW, h: newH });
  };

  const updateDisplayRect = () => {
    if (imageRef.current && containerRef.current) {
      const img = imageRef.current;
      const container = containerRef.current;
      const cRect = container.getBoundingClientRect();
      const iRect = img.getBoundingClientRect();

      setDisplayRect({
        width: iRect.width,
        height: iRect.height,
        left: iRect.left - cRect.left,
        top: iRect.top - cRect.top,
      });
    }
  };

  useEffect(() => {
    window.addEventListener('resize', updateDisplayRect);
    return () => window.removeEventListener('resize', updateDisplayRect);
  }, []);

  const handleMouseDown = (
    e: React.MouseEvent,
    type: 'move' | 'nw' | 'ne' | 'se' | 'sw' | 'n' | 'e' | 's' | 'w'
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragAction({
      type,
      startX: e.clientX,
      startY: e.clientY,
      startCrop: { ...cropBox },
    });
  };

  const handleTouchStart = (
    e: React.TouchEvent,
    type: 'move' | 'nw' | 'ne' | 'se' | 'sw' | 'n' | 'e' | 's' | 'w'
  ) => {
    e.stopPropagation();
    const touch = e.touches[0];
    if (!touch) return;
    setDragAction({
      type,
      startX: touch.clientX,
      startY: touch.clientY,
      startCrop: { ...cropBox },
    });
  };

  useEffect(() => {
    const handleMoveCoord = (clientX: number, clientY: number) => {
      if (!dragAction || displayRect.width === 0 || displayRect.height === 0) return;

      const dx = (clientX - dragAction.startX) / displayRect.width;
      const dy = (clientY - dragAction.startY) / displayRect.height;
      const { startCrop, type } = dragAction;
      const preset = PRESETS.find(p => p.id === selectedPreset);
      const ratio = preset?.ratio;

      let nextX = startCrop.x;
      let nextY = startCrop.y;
      let nextW = startCrop.w;
      let nextH = startCrop.h;

      const minSize = 0.05;

      if (type === 'move') {
        nextX = Math.max(0, Math.min(1 - startCrop.w, startCrop.x + dx));
        nextY = Math.max(0, Math.min(1 - startCrop.h, startCrop.y + dy));
      } else {
        if (type.includes('e')) {
          nextW = Math.max(minSize, Math.min(1 - startCrop.x, startCrop.w + dx));
        }
        if (type.includes('s')) {
          nextH = Math.max(minSize, Math.min(1 - startCrop.y, startCrop.h + dy));
        }
        if (type.includes('w')) {
          const maxDx = startCrop.w - minSize;
          const clampedDx = Math.max(-startCrop.x, Math.min(maxDx, dx));
          nextX = startCrop.x + clampedDx;
          nextW = startCrop.w - clampedDx;
        }
        if (type.includes('n')) {
          const maxDy = startCrop.h - minSize;
          const clampedDy = Math.max(-startCrop.y, Math.min(maxDy, dy));
          nextY = startCrop.y + clampedDy;
          nextH = startCrop.h - clampedDy;
        }

        // Apply locked aspect ratio if preset selected
        if (ratio && imageSize.width > 0 && imageSize.height > 0) {
          const currentPixelW = nextW * imageSize.width;
          const currentPixelH = nextH * imageSize.height;

          if (type.includes('e') || type.includes('w')) {
            nextH = currentPixelW / (ratio * imageSize.height);
          } else {
            nextW = (currentPixelH * ratio) / imageSize.width;
          }
        }
      }

      setCropBox({
        x: Math.max(0, Math.min(1 - nextW, nextX)),
        y: Math.max(0, Math.min(1 - nextH, nextY)),
        w: Math.max(minSize, Math.min(1, nextW)),
        h: Math.max(minSize, Math.min(1, nextH)),
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleMoveCoord(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        handleMoveCoord(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleEnd = () => {
      setDragAction(null);
    };

    if (dragAction) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleEnd);
      window.addEventListener('touchcancel', handleEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
      window.removeEventListener('touchcancel', handleEnd);
    };
  }, [dragAction, displayRect, selectedPreset, imageSize]);

  // Pixel dimensions computed
  const cropPixelWidth = Math.round(cropBox.w * imageSize.width);
  const cropPixelHeight = Math.round(cropBox.h * imageSize.height);

  const handleDownload = async () => {
    if (!imageSrc || imageSize.width === 0 || imageSize.height === 0) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageSrc;
      await new Promise((res) => { img.onload = res; });

      const canvas = document.createElement('canvas');
      const sx = cropBox.x * imageSize.width;
      const sy = cropBox.y * imageSize.height;
      const sw = cropBox.w * imageSize.width;
      const sh = cropBox.h * imageSize.height;

      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context unavailable');

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          const originalName = file?.name.replace(/\.[^/.]+$/, '') || 'cropped-image';
          const ext = exportFormat === 'image/jpeg' ? 'jpg' : exportFormat === 'image/webp' ? 'webp' : 'png';
          a.href = url;
          a.download = `${originalName}-cropped.${ext}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          setIsProcessing(false);
        },
        exportFormat,
        exportFormat === 'image/jpeg' ? jpegQuality / 100 : 0.95
      );
    } catch (err) {
      console.error('Crop export failed', err);
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    setFile(null);
    setImageSrc('');
    setImageSize({ width: 0, height: 0 });
    setCropBox({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 });
  };

  const cropSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Interactive Image Cropper - ImagePlumber',
    'applicationCategory': 'MultimediaApplication',
    'operatingSystem': 'Web Browser',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD',
    },
    'description': 'Free online image cropping tool with social aspect ratio presets, Rule of Thirds grid, and passport photo dimensions. 100% private in-browser processing.',
    'featureList': [
      'Interactive 8-handle crop box with real-time dimension indicators',
      'Instagram 1:1, 4:5, 9:16, YouTube 16:9, and Passport 2x2 in presets',
      'Rule of Thirds and Golden Ratio composition overlay grids',
      'Lossless PNG, JPEG, and WebP export',
    ],
  };

  return (
    <div className="w-full">
      <SEO
        title="Free Online Image Cropper (Square, 16:9, Passport) | ImagePlumber"
        description="Crop photos online for free with aspect ratio presets (1:1, 4:5, 16:9, 9:16, Passport 2x2 in). Interactive Rule of Thirds grid and zero cloud uploads."
        keywords="crop image online, photo cropper free, square image crop, instagram crop 4:5, youtube thumbnail crop, passport photo cropper, crop picture without upload, free image crop tool"
        canonicalUrl="https://imageplumber.com/crop-image"
        schema={cropSchema}
      />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-indigo-650 uppercase tracking-widest px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-full shadow-sm">
            Geometry Engine
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-100 mt-3 mb-2">
            {pageTitle || 'Interactive Image Cropper'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            {pageSubtitle || 'Crop images to exact social ratios or freeform dimensions locally in your browser memory.'}
          </p>
        </div>

        {!imageSrc ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
            <div className="md:col-span-7 flex flex-col justify-center">
              <DropZone
                onFilesSelected={handleFilesSelected}
                title="Drop image to crop"
                subtitle="Supports JPG, PNG, WebP, HEIC up to 50MB"
              />
            </div>
            <div className="md:col-span-5 flex">
              <div className="premium-bento rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between w-full shadow-sm">
                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-indigo-650 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900 px-2 py-0.5 rounded uppercase tracking-wider inline-block">
                    Demo Preview
                  </div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Smart Aspect Cropping</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    Select from popular social media presets or customize freeform crop boxes with live Rule of Thirds alignment guides.
                  </p>
                </div>
                <DemoPreview toolId="crop" alt="Image Cropper Preview" />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Controls Bar */}
            <div className="lg:col-span-4 flex flex-col gap-6 order-2 lg:order-1">
              <div className="premium-bento p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-6 shadow-sm">
                
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h2 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-sm">
                    <Crop className="w-4 h-4 text-indigo-500" />
                    Crop Presets
                  </h2>
                  <span className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                    {cropPixelWidth} × {cropPixelHeight} px
                  </span>
                </div>

                {/* Aspect Ratio Presets Grid */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Aspect Ratio
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {PRESETS.map((p) => {
                      const isSelected = selectedPreset === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => applyPreset(p.id)}
                          className={`px-2 py-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer border ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20'
                              : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-600'
                          }`}
                        >
                          <div className="text-[11px] leading-tight font-extrabold">{p.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Grid Overlay Toggle */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Composition Grid
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'thirds', label: 'Rule of 3rds' },
                      { id: 'golden', label: 'Golden Spiral' },
                      { id: 'none', label: 'Clean' },
                    ].map((g) => (
                      <button
                        key={g.id}
                        onClick={() => setGridType(g.id as any)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                          gridType === g.id
                            ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100'
                            : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Export Format */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Export Format
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'image/png', label: 'PNG (Lossless)' },
                      { id: 'image/jpeg', label: 'JPEG' },
                      { id: 'image/webp', label: 'WebP' },
                    ].map((fmt) => (
                      <button
                        key={fmt.id}
                        onClick={() => setExportFormat(fmt.id as any)}
                        className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer text-center ${
                          exportFormat === fmt.id
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/10'
                            : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {fmt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* JPEG Quality Slider */}
                {exportFormat === 'image/jpeg' && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-500 uppercase tracking-wider text-[10px]">JPEG Quality</span>
                      <span className="text-indigo-600 dark:text-indigo-400">{jpegQuality}%</span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="100"
                      value={jpegQuality}
                      onChange={(e) => setJpegQuality(Number(e.target.value))}
                      className="range-styled w-full"
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2 flex flex-col gap-2.5">
                  <button
                    onClick={handleDownload}
                    disabled={isProcessing}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isProcessing ? 'Cropping...' : 'Download Cropped Image'}</span>
                  </button>

                  <button
                    onClick={handleReset}
                    className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Upload New Image</span>
                  </button>
                </div>

              </div>
            </div>

            {/* Right Canvas / Crop Stage */}
            <div className="lg:col-span-8 order-1 lg:order-2 flex flex-col gap-4">
              <div
                ref={containerRef}
                className="relative rounded-3xl bg-slate-900/90 dark:bg-black/90 p-4 min-h-[460px] flex items-center justify-center overflow-hidden select-none border border-slate-800 shadow-2xl"
              >
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Source for crop"
                  onLoad={updateDisplayRect}
                  className="max-h-[540px] max-w-full object-contain pointer-events-none rounded-lg"
                />

                {/* Shaded Backdrop / Crop Box Overlay */}
                {displayRect.width > 0 && (
                  <div
                    className="absolute"
                    style={{
                      left: `${displayRect.left + cropBox.x * displayRect.width}px`,
                      top: `${displayRect.top + cropBox.y * displayRect.height}px`,
                      width: `${cropBox.w * displayRect.width}px`,
                      height: `${cropBox.h * displayRect.height}px`,
                      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.65)',
                    }}
                  >
                    {/* Crop Border Box */}
                    <div
                      className="w-full h-full border-2 border-white cursor-move relative touch-none"
                      onMouseDown={(e) => handleMouseDown(e, 'move')}
                      onTouchStart={(e) => handleTouchStart(e, 'move')}
                    >
                      {/* Composition Grid Lines */}
                      {gridType === 'thirds' && (
                        <div className="w-full h-full pointer-events-none grid grid-cols-3 grid-rows-3">
                          <div className="border-r border-b border-white/40" />
                          <div className="border-r border-b border-white/40" />
                          <div className="border-b border-white/40" />
                          <div className="border-r border-b border-white/40" />
                          <div className="border-r border-b border-white/40" />
                          <div className="border-b border-white/40" />
                          <div className="border-r border-white/40" />
                          <div className="border-r border-white/40" />
                          <div />
                        </div>
                      )}

                      {gridType === 'golden' && (
                        <div className="w-full h-full pointer-events-none grid grid-cols-2 grid-rows-2">
                          <div className="border-r border-b border-amber-300/40" />
                          <div className="border-b border-amber-300/40" />
                          <div className="border-r border-amber-300/40" />
                          <div />
                        </div>
                      )}

                      {/* 8 Drag Handles */}
                      {/* Corner Handles */}
                      <div
                        onMouseDown={(e) => handleMouseDown(e, 'nw')}
                        onTouchStart={(e) => handleTouchStart(e, 'nw')}
                        className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-sm cursor-nw-resize shadow-md touch-none"
                      />
                      <div
                        onMouseDown={(e) => handleMouseDown(e, 'ne')}
                        onTouchStart={(e) => handleTouchStart(e, 'ne')}
                        className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-sm cursor-ne-resize shadow-md touch-none"
                      />
                      <div
                        onMouseDown={(e) => handleMouseDown(e, 'sw')}
                        onTouchStart={(e) => handleTouchStart(e, 'sw')}
                        className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-sm cursor-sw-resize shadow-md touch-none"
                      />
                      <div
                        onMouseDown={(e) => handleMouseDown(e, 'se')}
                        onTouchStart={(e) => handleTouchStart(e, 'se')}
                        className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-sm cursor-se-resize shadow-md touch-none"
                      />

                      {/* Mid Handles */}
                      <div
                        onMouseDown={(e) => handleMouseDown(e, 'n')}
                        onTouchStart={(e) => handleTouchStart(e, 'n')}
                        className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-2.5 bg-white border border-indigo-600 rounded-sm cursor-n-resize shadow-sm touch-none"
                      />
                      <div
                        onMouseDown={(e) => handleMouseDown(e, 's')}
                        onTouchStart={(e) => handleTouchStart(e, 's')}
                        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-2.5 bg-white border border-indigo-600 rounded-sm cursor-s-resize shadow-sm touch-none"
                      />
                      <div
                        onMouseDown={(e) => handleMouseDown(e, 'w')}
                        onTouchStart={(e) => handleTouchStart(e, 'w')}
                        className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-2.5 h-6 bg-white border border-indigo-600 rounded-sm cursor-w-resize shadow-sm touch-none"
                      />
                      <div
                        onMouseDown={(e) => handleMouseDown(e, 'e')}
                        onTouchStart={(e) => handleTouchStart(e, 'e')}
                        className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-2.5 h-6 bg-white border border-indigo-600 rounded-sm cursor-e-resize shadow-sm touch-none"
                      />

                      {/* Floating Dimension Tag */}
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow pointer-events-none">
                        {cropPixelWidth} × {cropPixelHeight}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Stage Bottom Bar */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2 font-medium">
                <span>Original Dimensions: {imageSize.width} × {imageSize.height} px</span>
                <span>100% In-Browser Canvas Sandbox</span>
              </div>
            </div>

          </div>
        )}

        {/* SEO Guide Section */}
        <div className="mt-16 border-t border-slate-200/60 dark:border-slate-800 pt-12">
          <ToolGuide
            toolName="Interactive Image Cropper"
            introText="Crop photos to exact social media aspect ratios or official 2x2 in passport standards using pure client-side HTML5 Canvas bicubic sampling."
            competitorComparison={{
              alternatives: ['iLoveIMG Crop', 'Canva Cropper', 'PicMonkey'],
              benefit: 'Unlike traditional online image editors that upload your photos to remote servers, ImagePlumber crops all images 100% locally in browser memory with zero file size limits.',
            }}
            steps={[
              { title: 'Drop Image', description: 'Upload any PNG, JPEG, WebP, or HEIC photo directly into the drop zone.' },
              { title: 'Select Ratio or Preset', description: 'Choose from 1:1 Square, 4:5 Instagram Feed, 16:9 Landscape, or drag handles for a freeform crop.' },
              { title: 'Align with Composition Grid', description: 'Use the Rule of Thirds grid to center subjects and balance your photo.' },
              { title: 'Download Instantly', description: 'Export your high-resolution cropped image as lossless PNG, JPEG, or WebP with zero cloud uploads.' },
            ]}
            features={[
              'Interactive 8-handle crop box with live pixel dimension indicators',
              'Aspect ratio presets for Instagram, YouTube, TikTok, and US Passport 2x2 in',
              'Rule of Thirds and Golden Ratio composition overlay lines',
              '100% In-browser processing with zero server uploads'
            ]}
            faq={[
              { q: 'Can I crop passport photos to 2x2 inches?', a: 'Yes! Select the 2x2 in Passport preset to lock the aspect ratio to official visa and passport standards.' },
              { q: 'Will cropping reduce my photo resolution?', a: 'No, cropping extracts the exact native pixels from your source image without downsampling.' }
            ]}
          />
        </div>

      </div>
    </div>
  );
};
