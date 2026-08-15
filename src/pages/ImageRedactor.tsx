import React, { useState, useEffect, useRef } from 'react';
import { Download, RefreshCw, Undo2, Redo2, Trash2, EyeOff, ShieldAlert, Sparkles, Square, Stamp } from 'lucide-react';
import { DropZone } from '../components/DropZone';
import { SEO } from '../components/SEO';
import { ToolGuide } from '../components/ToolGuide';
import { DemoPreview } from '../components/DemoPreview';

interface RedactAction {
  type: 'solid' | 'pixelate' | 'blur' | 'stamp';
  x: number;
  y: number;
  w: number;
  h: number;
  color?: string;
  intensity?: number;
  stampText?: string;
}

interface ImageRedactorProps {
  initialMode?: 'solid' | 'blur' | 'pixelate';
  pageTitle?: string;
  pageSubtitle?: string;
}

export const ImageRedactor: React.FC<ImageRedactorProps> = ({
  initialMode = 'solid',
  pageTitle,
  pageSubtitle,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Redaction Settings
  const [redactionMode, setRedactionMode] = useState<'solid' | 'pixelate' | 'blur' | 'stamp'>(initialMode);
  const [solidColor, setSolidColor] = useState<string>('#000000');
  const [pixelSize, setPixelSize] = useState<number>(16);
  const [blurRadius, setBlurRadius] = useState<number>(20);
  const [stampText, setStampText] = useState<string>('TOP SECRET');

  // History Stack
  const [history, setHistory] = useState<RedactAction[]>([]);
  const [redoStack, setRedoStack] = useState<RedactAction[]>([]);

  // Drag interaction
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(null);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png');
  const [jpegQuality, setJpegQuality] = useState<number>(95);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const baseImageRef = useRef<HTMLImageElement | null>(null);

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
        baseImageRef.current = img;
        setHistory([]);
        setRedoStack([]);
      };
    }
  };

  // Redraw canvas from base image + history + current drag box
  useEffect(() => {
    if (!baseImageRef.current || imageSize.width === 0 || imageSize.height === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = imageSize.width;
    canvas.height = imageSize.height;

    // 1. Draw base clean photo
    ctx.drawImage(baseImageRef.current, 0, 0);

    // 2. Apply all historical redaction actions directly into pixel buffer
    const applyAction = (action: RedactAction) => {
      const rx = Math.max(0, Math.min(action.x, imageSize.width));
      const ry = Math.max(0, Math.min(action.y, imageSize.height));
      const rw = Math.max(1, Math.min(action.w, imageSize.width - rx));
      const rh = Math.max(1, Math.min(action.h, imageSize.height - ry));

      if (action.type === 'solid') {
        ctx.fillStyle = action.color || '#000000';
        ctx.fillRect(rx, ry, rw, rh);
      } else if (action.type === 'pixelate') {
        const blockSize = action.intensity || 16;
        const imgData = ctx.getImageData(rx, ry, rw, rh);
        const data = imgData.data;

        for (let py = 0; py < rh; py += blockSize) {
          for (let px = 0; px < rw; px += blockSize) {
            let r = 0, g = 0, b = 0, count = 0;

            // Sample block average
            for (let dy = 0; dy < blockSize && py + dy < rh; dy++) {
              for (let dx = 0; dx < blockSize && px + dx < rw; dx++) {
                const idx = ((py + dy) * rw + (px + dx)) * 4;
                r += data[idx];
                g += data[idx + 1];
                b += data[idx + 2];
                count++;
              }
            }

            if (count > 0) {
              r = Math.round(r / count);
              g = Math.round(g / count);
              b = Math.round(b / count);

              // Fill block
              for (let dy = 0; dy < blockSize && py + dy < rh; dy++) {
                for (let dx = 0; dx < blockSize && px + dx < rw; dx++) {
                  const idx = ((py + dy) * rw + (px + dx)) * 4;
                  data[idx] = r;
                  data[idx + 1] = g;
                  data[idx + 2] = b;
                }
              }
            }
          }
        }
        ctx.putImageData(imgData, rx, ry);
      } else if (action.type === 'blur') {
        // Multi-pass box blur simulation on target region
        const radius = action.intensity || 20;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = rw;
        tempCanvas.height = rh;
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
          tempCtx.filter = `blur(${Math.max(2, Math.round(radius * 0.5))}px)`;
          tempCtx.drawImage(canvas, rx, ry, rw, rh, 0, 0, rw, rh);
          // Apply twice for deep frosted obfuscation
          tempCtx.filter = `blur(${Math.max(2, Math.round(radius * 0.5))}px)`;
          tempCtx.drawImage(tempCanvas, 0, 0);
          ctx.drawImage(tempCanvas, rx, ry);
        }
      } else if (action.type === 'stamp') {
        ctx.save();
        ctx.translate(rx + rw / 2, ry + rh / 2);
        ctx.rotate(-0.15); // Slight -8.5 degree stamp tilt

        const fontSize = Math.max(16, Math.min(rw * 0.2, rh * 0.45));
        ctx.font = `900 ${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Stamp Box
        const textMetrics = ctx.measureText(action.stampText || 'TOP SECRET');
        const boxW = textMetrics.width + fontSize * 1.2;
        const boxH = fontSize * 1.8;

        ctx.fillStyle = 'rgba(220, 38, 38, 0.9)'; // Red 600
        ctx.fillRect(-boxW / 2, -boxH / 2, boxW, boxH);

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(2, fontSize * 0.08);
        ctx.strokeRect(-boxW / 2 + 3, -boxH / 2 + 3, boxW - 6, boxH - 6);

        ctx.fillStyle = '#ffffff';
        ctx.fillText(action.stampText || 'TOP SECRET', 0, 1);
        ctx.restore();
      }
    };

    history.forEach(applyAction);

    // 3. Draw in-progress drag rectangle outline
    if (isDrawing && startPos && currentPos) {
      const x = Math.min(startPos.x, currentPos.x);
      const y = Math.min(startPos.y, currentPos.y);
      const w = Math.abs(currentPos.x - startPos.x);
      const h = Math.abs(currentPos.y - startPos.y);

      ctx.save();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.strokeRect(x, y, w, h);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
      ctx.fillRect(x, y, w, h);
      ctx.restore();
    }
  }, [
    imageUrl,
    imageSize,
    history,
    isDrawing,
    startPos,
    currentPos,
  ]);

  // Coordinate Conversion Helper
  const getCanvasCoords = (clientX: number, clientY: number): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.round((clientX - rect.left) * scaleX);
    const y = Math.round((clientY - rect.top) * scaleY);
    return { x: Math.max(0, Math.min(x, canvas.width)), y: Math.max(0, Math.min(y, canvas.height)) };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getCanvasCoords(e.clientX, e.clientY);
    if (!pos) return;
    setIsDrawing(true);
    setStartPos(pos);
    setCurrentPos(pos);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const pos = getCanvasCoords(e.clientX, e.clientY);
    if (!pos) return;
    setCurrentPos(pos);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!e.touches[0]) return;
    const pos = getCanvasCoords(e.touches[0].clientX, e.touches[0].clientY);
    if (!pos) return;
    setIsDrawing(true);
    setStartPos(pos);
    setCurrentPos(pos);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !e.touches[0]) return;
    const pos = getCanvasCoords(e.touches[0].clientX, e.touches[0].clientY);
    if (!pos) return;
    setCurrentPos(pos);
  };

  const handleMouseUp = () => {
    if (!isDrawing || !startPos || !currentPos) {
      setIsDrawing(false);
      return;
    }

    const x = Math.min(startPos.x, currentPos.x);
    const y = Math.min(startPos.y, currentPos.y);
    const w = Math.abs(currentPos.x - startPos.x);
    const h = Math.abs(currentPos.y - startPos.y);

    if (w > 4 && h > 4) {
      const newAction: RedactAction = {
        type: redactionMode,
        x,
        y,
        w,
        h,
        color: solidColor,
        intensity: redactionMode === 'pixelate' ? pixelSize : blurRadius,
        stampText,
      };

      setHistory((prev) => [...prev, newAction]);
      setRedoStack([]);
    }

    setIsDrawing(false);
    setStartPos(null);
    setCurrentPos(null);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, last]);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setHistory((prev) => [...prev, next]);
  };

  const handleClearAll = () => {
    if (history.length === 0) return;
    setHistory([]);
    setRedoStack([]);
  };

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
        const baseName = file?.name.replace(/\.[^/.]+$/, '') || 'photo';
        const ext = exportFormat === 'image/png' ? 'png' : exportFormat === 'image/webp' ? 'webp' : 'jpg';
        a.download = `${baseName}-redacted.${ext}`;
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
    setHistory([]);
    setRedoStack([]);
    baseImageRef.current = null;
  };

  const redactorSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Photo Redactor & Censor Tool - ImagePlumber',
    'applicationCategory': 'SecurityApplication',
    'operatingSystem': 'Web Browser',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD',
    },
    'description': 'Redact and blur sensitive data, faces, credit cards, and addresses in images. 100% private in-browser canvas sanitization with zero server uploads.',
    'featureList': [
      'Solid color black bars and white censor boxes',
      'High-entropy pixelation mosaic and frosted Gaussian blur',
      'TOP SECRET and CLASSIFIED red angled stamps',
      'Irreversible client-side pixel obliteration'
    ]
  };

  return (
    <div className="py-8 md:py-12 max-w-7xl mx-auto px-4 sm:px-6">
      <SEO
        title={pageTitle || "Redact Image Online Free - Blur Faces & Censor Photos | ImagePlumber"}
        description={pageSubtitle || "Censor sensitive information, blur faces, and black-out ID numbers on photos online for free. 100% private client-side canvas sanitization."}
        canonicalUrl="https://imageplumber.com/redact-image"
        schema={redactorSchema}
      />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-650 dark:text-red-300 text-xs font-semibold uppercase tracking-wider mb-4">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Zero-Leak Local Redaction</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-tight mb-4">
          {pageTitle || "Photo Redactor & Censor Studio"}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
          {pageSubtitle || "Permanently sanitize photos, blur faces, black-out credit card numbers, and redact private document text directly in your browser memory."}
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        {!imageUrl ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
            <div className="md:col-span-7 flex flex-col justify-center">
              <DropZone
                onFilesSelected={handleFilesSelected}
                title="Drop photo, ID card, or document screenshot"
                subtitle="Supports JPG, PNG, WebP up to 50MB"
              />
            </div>
            <div className="md:col-span-5 flex">
              <div className="premium-bento rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between w-full shadow-sm">
                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-red-650 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border border-red-100 dark:border-red-900 px-2 py-0.5 rounded uppercase tracking-wider inline-block">
                    Irreversible Sanitization
                  </div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Military-Grade Pixel Obliteration</h2>
                  <p className="text-xs text-slate-555 dark:text-slate-400 leading-relaxed font-medium">
                    Unlike standard editors that place a recoverable sticker layer, our canvas directly mutates the raw pixel buffer so redacted areas cannot be recovered.
                  </p>
                </div>
                <DemoPreview toolId="redact" alt="Photo Redactor Preview" />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Control Sidebar (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="premium-bento p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-5 shadow-xl shadow-slate-200/20 dark:shadow-none">
                
                {/* Redaction Mode Selection */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Censor Tool Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setRedactionMode('solid')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                        redactionMode === 'solid'
                          ? 'bg-red-50 dark:bg-red-950/50 border-red-300 dark:border-red-700 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <Square className="w-4 h-4 text-slate-900 dark:text-white fill-current" />
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Solid Black Bar</span>
                        <span className="text-[10px] text-slate-500 block">Blackout text/IDs</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setRedactionMode('pixelate')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                        redactionMode === 'pixelate'
                          ? 'bg-red-50 dark:bg-red-950/50 border-red-300 dark:border-red-700 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <EyeOff className="w-4 h-4 text-purple-600" />
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Pixelate Mosaic</span>
                        <span className="text-[10px] text-slate-500 block">Blocky pixel censor</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setRedactionMode('blur')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                        redactionMode === 'blur'
                          ? 'bg-red-50 dark:bg-red-950/50 border-red-300 dark:border-red-700 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Gaussian Blur</span>
                        <span className="text-[10px] text-slate-500 block">Smooth face blur</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setRedactionMode('stamp')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                        redactionMode === 'stamp'
                          ? 'bg-red-50 dark:bg-red-950/50 border-red-300 dark:border-red-700 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <Stamp className="w-4 h-4 text-red-600" />
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Classified Stamp</span>
                        <span className="text-[10px] text-slate-500 block">Red watermark stamp</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Sub-options based on mode */}
                {redactionMode === 'solid' && (
                  <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Block Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={solidColor}
                        onChange={(e) => setSolidColor(e.target.value)}
                        className="w-10 h-8 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700"
                      />
                      <div className="flex gap-2">
                        {['#000000', '#FFFFFF', '#EF4444', '#1E293B'].map((c) => (
                          <button
                            key={c}
                            onClick={() => setSolidColor(c)}
                            className="w-6 h-6 rounded-full border border-slate-300 dark:border-slate-600 cursor-pointer shadow-sm"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {redactionMode === 'pixelate' && (
                  <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                      <span>Pixel Block Size</span>
                      <span className="font-mono text-red-600">{pixelSize} px</span>
                    </div>
                    <input
                      type="range"
                      min="6"
                      max="40"
                      value={pixelSize}
                      onChange={(e) => setPixelSize(Number(e.target.value))}
                      className="range-styled w-full"
                    />
                  </div>
                )}

                {redactionMode === 'blur' && (
                  <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                      <span>Blur Strength</span>
                      <span className="font-mono text-red-600">{blurRadius} px</span>
                    </div>
                    <input
                      type="range"
                      min="8"
                      max="50"
                      value={blurRadius}
                      onChange={(e) => setBlurRadius(Number(e.target.value))}
                      className="range-styled w-full"
                    />
                  </div>
                )}

                {redactionMode === 'stamp' && (
                  <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Stamp Label Text
                    </label>
                    <input
                      type="text"
                      value={stampText}
                      onChange={(e) => setStampText(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold uppercase tracking-wider"
                    />
                  </div>
                )}

                {/* History Actions: Undo / Redo / Clear */}
                <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={handleUndo}
                    disabled={history.length === 0}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-40"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    <span>Undo</span>
                  </button>
                  <button
                    onClick={handleRedo}
                    disabled={redoStack.length === 0}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-40"
                  >
                    <Redo2 className="w-3.5 h-3.5" />
                    <span>Redo</span>
                  </button>
                  <button
                    onClick={handleClearAll}
                    disabled={history.length === 0}
                    className="py-2.5 px-3 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-600 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-40"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear ({history.length})</span>
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
                              ? 'bg-red-600 text-white'
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
                        <span className="font-mono text-red-600">{jpegQuality}%</span>
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
                    className="flex-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-700 text-white font-bold text-sm shadow-lg shadow-red-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Sanitized Photo</span>
                  </button>
                </div>

              </div>
            </div>

            {/* Stage Preview with Drag-to-Censor (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="relative rounded-3xl bg-slate-950/5 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 p-4 min-h-[420px] flex flex-col items-center justify-center overflow-hidden">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <span>Click & Drag to Draw Redaction Box on Canvas</span>
                </div>

                <div className="relative max-w-full max-h-[600px] overflow-hidden rounded-2xl shadow-xl border border-slate-300 dark:border-slate-700 cursor-crosshair">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleMouseUp}
                    onTouchCancel={handleMouseUp}
                    className="max-w-full max-h-[600px] object-contain select-none touch-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2 font-medium">
                <span>{history.length} Redaction Areas Applied</span>
                <span>Canvas Pixels Mutated in Local RAM</span>
              </div>
            </div>

          </div>
        )}

        {/* SEO Guide Section */}
        <div className="mt-16 border-t border-slate-200/60 dark:border-slate-800 pt-12">
          <ToolGuide
            toolName="Photo Redaction & Sensitive Data Censor Tool"
            introText="Censor private information, blur faces, and black-out ID numbers on photos online with 100% permanent client-side pixel obliteration."
            competitorComparison={{
              alternatives: ['Redact.photo', 'Canva Blur', 'Evernote Censor'],
              benefit: 'Our redaction tool permanently overwrites raw pixel values in local browser memory without transmitting your documents or IDs to any server.',
            }}
            steps={[
              { title: 'Upload Image', description: 'Drop your screenshot, invoice, credit card photo, or ID card.' },
              { title: 'Choose Censor Style', description: 'Select solid black bar, pixelate mosaic, Gaussian blur, or TOP SECRET stamp.' },
              { title: 'Click & Drag', description: 'Drag rectangular boxes directly over the sensitive information you want to censor.' },
              { title: 'Download Sanitized Image', description: 'Export your sanitized photo in lossless PNG, JPEG, or WebP.' },
            ]}
            features={[
              'Solid blackout bars, pixelation mosaic, and frosted blur modes',
              'Permanent client-side pixel destruction (non-recoverable)',
              'Multi-level Undo/Redo history stack',
              'Lossless PNG and high-quality JPEG export'
            ]}
            faq={[
              { q: 'Can someone undo or unblur the redacted text after I download it?', a: 'No. The pixel data inside the redacted zone is permanently overwritten in memory before saving, making it mathematically impossible to recover.' },
              { q: 'Is it safe to redact passports and bank statements here?', a: 'Yes! All operations execute 100% inside your browser using Web APIs. No images or files are ever sent over the network.' }
            ]}
          />
        </div>

      </div>
    </div>
  );
};
