import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Cpu, Download, RefreshCw, AlertTriangle, AlertCircle, Check, Scissors, 
  Copy, ArrowLeftRight, Columns, Palette, Sparkles, SlidersHorizontal, 
  ChevronDown, ChevronUp 
} from 'lucide-react';
import { DropZone } from '../components/DropZone';
import { ProgressBar } from '../components/ProgressBar';
import { SEO } from '../components/SEO';
import { ToolGuide } from '../components/ToolGuide';
import { DemoPreview } from '../components/DemoPreview';

interface WorkerProgress {
  status: 'progress' | 'processing' | 'complete' | 'error';
  progress?: number;
  file?: string;
  loaded?: number;
  total?: number;
  mask?: {
    width: number;
    height: number;
    data: Uint8Array;
  };
  error?: string;
}

type BgMode = 'transparent' | 'color' | 'blur';
type ViewMode = 'split' | 'side-by-side';
type ExportFormat = 'png' | 'jpeg' | 'webp';

const COLOR_PRESETS = [
  { name: 'Studio White', color: '#FFFFFF', border: 'border-slate-300 dark:border-slate-600' },
  { name: 'Pure Black', color: '#000000', border: 'border-slate-800' },
  { name: 'Passport Blue', color: '#0077B6', border: 'border-blue-600' },
  { name: 'Neutral Gray', color: '#F1F5F9', border: 'border-slate-300 dark:border-slate-700' },
  { name: 'Warm Cream', color: '#FFFBEB', border: 'border-amber-200' },
  { name: 'Slate Gray', color: '#475569', border: 'border-slate-600' },
  { name: 'Studio Crimson', color: '#BE123C', border: 'border-rose-600' },
  { name: 'Emerald', color: '#047857', border: 'border-emerald-600' },
];

export const BackgroundRemover: React.FC = () => {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [processedUrl, setProcessedUrl] = useState<string>('');
  const [loadingState, setLoadingState] = useState<'idle' | 'loading-model' | 'processing-image' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [downloaded, setDownloaded] = useState(false);
  const [copied, setCopied] = useState(false);

  // Studio customization states
  const [bgMode, setBgMode] = useState<BgMode>('transparent');
  const [bgColor, setBgColor] = useState<string>('#FFFFFF');
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [edgeFeather, setEdgeFeather] = useState<number>(0);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('png');

  // Interactive slider refs
  const splitContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  // Cached assets for instant re-compositing
  const workerRef = useRef<Worker | null>(null);
  const sourceImgRef = useRef<HTMLImageElement | null>(null);
  const maskRef = useRef<{ width: number; height: number; data: Uint8Array } | null>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (processedUrl) URL.revokeObjectURL(processedUrl);
      const file = files[0];
      setOriginalFile(file);
      const url = URL.createObjectURL(file);
      setOriginalUrl(url);
      setProcessedUrl('');
      processImage(file);
    }
  };

  const processImage = async (file: File) => {
    setLoadingState('loading-model');
    setProgress(0);
    setStatusMessage('Initializing Local AI model...');

    if (workerRef.current) {
      workerRef.current.terminate();
    }

    workerRef.current = new Worker(
      new URL('../workers/background-remover.worker.ts', import.meta.url),
      { type: 'module' }
    );

    workerRef.current.onmessage = (event: MessageEvent<WorkerProgress>) => {
      const data = event.data;

      if (data.status === 'progress') {
        const percent = data.progress ? Math.round(data.progress) : 0;
        setProgress(percent);
        setLoadingState('loading-model');
        const fileDesc = data.file || '';
        if (fileDesc.includes('.onnx') || fileDesc.includes('model')) {
          setStatusMessage(`Downloading AI weights: ${percent}%`);
        } else {
          setStatusMessage('Accessing local neural network cache...');
        }
      } else if (data.status === 'processing') {
        setLoadingState('processing-image');
        setProgress(50);
        setStatusMessage('AI neural network is segmenting foreground pixels...');
      } else if (data.status === 'complete' && data.mask) {
        setStatusMessage('Compositing studio cutout...');
        setProgress(95);
        maskRef.current = data.mask;
        renderMaskOntoImage(file, data.mask);
      } else if (data.status === 'error') {
        setLoadingState('error');
        setErrorMsg(data.error || 'Failed to remove background.');
      }
    };

    try {
      // Transfer binary ArrayBuffer to worker for zero-copy memory performance
      const buffer = await file.arrayBuffer();
      workerRef.current.postMessage({ buffer, mimeType: file.type }, [buffer]);
    } catch (err: any) {
      setLoadingState('error');
      setErrorMsg('Failed to read image file into memory.');
    }
  };

  // Hardware-accelerated 2D canvas compositing
  const compositeAndGenerateBlob = useCallback((
    img: HTMLImageElement,
    mask: { width: number; height: number; data: Uint8Array },
    mode: BgMode,
    color: string,
    feather: number,
    format: ExportFormat
  ): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;

      // 1. Render alpha mask onto offscreen mask canvas
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = mask.width;
      maskCanvas.height = mask.height;
      const maskCtx = maskCanvas.getContext('2d');
      if (!maskCtx) return resolve(null);

      const maskImgData = maskCtx.createImageData(mask.width, mask.height);
      const mPixels = maskImgData.data;
      const mData = mask.data;

      for (let i = 0; i < mData.length; i++) {
        const val = mData[i];
        const pIdx = i * 4;
        mPixels[pIdx] = 255;
        mPixels[pIdx + 1] = 255;
        mPixels[pIdx + 2] = 255;
        mPixels[pIdx + 3] = val;
      }
      maskCtx.putImageData(maskImgData, 0, 0);

      // 2. Render cutout canvas at full native resolution
      const cutoutCanvas = document.createElement('canvas');
      cutoutCanvas.width = w;
      cutoutCanvas.height = h;
      const cutCtx = cutoutCanvas.getContext('2d');
      if (!cutCtx) return resolve(null);

      cutCtx.drawImage(img, 0, 0, w, h);
      cutCtx.globalCompositeOperation = 'destination-in';
      
      // Apply edge feathering if selected
      if (feather > 0) {
        cutCtx.filter = `blur(${feather}px)`;
      }
      cutCtx.drawImage(maskCanvas, 0, 0, w, h);
      cutCtx.filter = 'none';

      // 3. Render final output canvas based on background mode
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = w;
      finalCanvas.height = h;
      const finalCtx = finalCanvas.getContext('2d');
      if (!finalCtx) return resolve(null);

      if (mode === 'transparent') {
        finalCtx.drawImage(cutoutCanvas, 0, 0);
      } else if (mode === 'color') {
        finalCtx.fillStyle = color;
        finalCtx.fillRect(0, 0, w, h);
        finalCtx.drawImage(cutoutCanvas, 0, 0);
      } else if (mode === 'blur') {
        finalCtx.filter = 'blur(30px) brightness(0.92)';
        finalCtx.drawImage(img, -20, -20, w + 40, h + 40);
        finalCtx.filter = 'none';
        finalCtx.drawImage(cutoutCanvas, 0, 0);
      }

      const mime = mode === 'transparent' ? 'image/png' : `image/${format}`;
      const quality = format === 'png' ? undefined : 0.95;
      finalCanvas.toBlob((blob) => resolve(blob), mime, quality);
    });
  }, []);

  const renderMaskOntoImage = (file: File, mask: { width: number; height: number; data: Uint8Array }) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = async () => {
      sourceImgRef.current = img;
      const blob = await compositeAndGenerateBlob(img, mask, bgMode, bgColor, edgeFeather, exportFormat);
      if (blob) {
        if (processedUrl) URL.revokeObjectURL(processedUrl);
        setProcessedUrl(URL.createObjectURL(blob));
        setLoadingState('completed');
        setProgress(100);
        setStatusMessage('Background removed successfully.');
      } else {
        setLoadingState('error');
        setErrorMsg('Failed to generate output cutout.');
      }
    };
    img.onerror = () => {
      setLoadingState('error');
      setErrorMsg('Failed to load image element for compositing.');
    };
  };

  // Re-composite instantaneously (<5ms) when background settings change
  const handleSettingsChange = useCallback(async (
    newMode: BgMode,
    newColor: string,
    newFeather: number,
    newFormat: ExportFormat
  ) => {
    if (!sourceImgRef.current || !maskRef.current) return;
    const blob = await compositeAndGenerateBlob(
      sourceImgRef.current,
      maskRef.current,
      newMode,
      newColor,
      newFeather,
      newFormat
    );
    if (blob) {
      if (processedUrl) URL.revokeObjectURL(processedUrl);
      setProcessedUrl(URL.createObjectURL(blob));
    }
  }, [compositeAndGenerateBlob, processedUrl]);

  const setBgModeAndRecomposite = (mode: BgMode) => {
    setBgMode(mode);
    const newFormat = mode === 'transparent' ? 'png' : exportFormat;
    if (mode === 'transparent') setExportFormat('png');
    handleSettingsChange(mode, bgColor, edgeFeather, newFormat);
  };

  const setBgColorAndRecomposite = (color: string) => {
    setBgColor(color);
    if (bgMode !== 'color') setBgMode('color');
    handleSettingsChange('color', color, edgeFeather, exportFormat);
  };

  const setFeatherAndRecomposite = (feather: number) => {
    setEdgeFeather(feather);
    handleSettingsChange(bgMode, bgColor, feather, exportFormat);
  };

  const setExportFormatAndRecomposite = (format: ExportFormat) => {
    setExportFormat(format);
    handleSettingsChange(bgMode, bgColor, edgeFeather, format);
  };

  // Sample image generator for zero-friction testing
  const handleLoadSample = (sampleType: 'portrait' | 'product' | 'pet') => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (sampleType === 'portrait') {
      // Warm outdoor background
      const grad = ctx.createLinearGradient(0, 0, 800, 800);
      grad.addColorStop(0, '#fde047');
      grad.addColorStop(0.5, '#60a5fa');
      grad.addColorStop(1, '#3b82f6');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 800, 800);

      // Stylized silhouette subject
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.ellipse(400, 680, 240, 160, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fbcfe8';
      ctx.fillRect(365, 460, 70, 90);

      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.ellipse(400, 410, 110, 135, 0, 0, Math.PI * 2);
      ctx.fill();

      // Hair
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.ellipse(400, 340, 130, 90, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(270, 340, 45, 140);
      ctx.fillRect(485, 340, 45, 140);

      // Eyewear
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(320, 395, 60, 14);
      ctx.fillRect(420, 395, 60, 14);
      ctx.fillRect(375, 400, 50, 4);

      // Smile
      ctx.beginPath();
      ctx.arc(400, 460, 35, 0.1 * Math.PI, 0.9 * Math.PI, false);
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#be185d';
      ctx.stroke();
    } else if (sampleType === 'product') {
      // Clean studio floor background
      const grad = ctx.createLinearGradient(0, 0, 0, 800);
      grad.addColorStop(0, '#94a3b8');
      grad.addColorStop(0.7, '#cbd5e1');
      grad.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 800, 800);

      // Modern sneaker subject
      ctx.save();
      ctx.translate(400, 420);
      ctx.rotate(-0.1);

      // Sole
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(-220, 80, 440, 45, 15);
      ctx.fill();

      // Upper
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.moveTo(-200, 80);
      ctx.lineTo(-190, 20);
      ctx.lineTo(-70, -30);
      ctx.lineTo(80, -70);
      ctx.lineTo(130, 20);
      ctx.lineTo(210, 80);
      ctx.closePath();
      ctx.fill();

      // Swoosh accent
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.ellipse(-10, 20, 80, 22, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      // Pet silhouette on garden background
      const grad = ctx.createLinearGradient(0, 0, 800, 800);
      grad.addColorStop(0, '#86efac');
      grad.addColorStop(1, '#22c55e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 800, 800);

      ctx.fillStyle = '#1e1b4b';
      // Body
      ctx.beginPath();
      ctx.ellipse(400, 520, 140, 190, 0, 0, Math.PI * 2);
      ctx.fill();
      // Head
      ctx.beginPath();
      ctx.ellipse(400, 330, 100, 90, 0, 0, Math.PI * 2);
      ctx.fill();
      // Left ear
      ctx.beginPath();
      ctx.moveTo(320, 290);
      ctx.lineTo(340, 190);
      ctx.lineTo(390, 260);
      ctx.closePath();
      ctx.fill();
      // Right ear
      ctx.beginPath();
      ctx.moveTo(480, 290);
      ctx.lineTo(460, 190);
      ctx.lineTo(410, 260);
      ctx.closePath();
      ctx.fill();
      // Eyes
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.ellipse(360, 330, 16, 24, 0, 0, Math.PI * 2);
      ctx.ellipse(440, 330, 16, 24, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `sample_${sampleType}.png`, { type: 'image/png' });
        handleFilesSelected([file]);
      }
    }, 'image/png');
  };

  // Interactive split-slider drag handling
  const handleSplitMove = useCallback((clientX: number) => {
    if (!splitContainerRef.current) return;
    const rect = splitContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    handleSplitMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleSplitMove(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isDraggingRef.current = false;
    };
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        handleSplitMove(e.clientX);
      }
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [handleSplitMove]);

  // 1-Click Copy to Clipboard
  const handleCopyToClipboard = async () => {
    if (!processedUrl) return;
    try {
      const resp = await fetch(processedUrl);
      const blob = await resp.blob();

      if (blob.type === 'image/png') {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
      } else {
        const img = new Image();
        img.src = processedUrl;
        await new Promise((res) => { img.onload = res; });
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        const pngBlob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/png'));
        if (pngBlob) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': pngBlob })
          ]);
        }
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleDownload = () => {
    if (!processedUrl || !originalFile) return;
    const lastDot = originalFile.name.lastIndexOf('.');
    const baseName = lastDot > 0 ? originalFile.name.substring(0, lastDot) : originalFile.name;
    const ext = bgMode === 'transparent' ? 'png' : exportFormat;
    const link = document.createElement('a');
    link.href = processedUrl;
    link.download = `${baseName}_${bgMode === 'transparent' ? 'cutout' : 'studio'}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const handleReset = () => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (processedUrl) URL.revokeObjectURL(processedUrl);
    setOriginalFile(null);
    setOriginalUrl('');
    setProcessedUrl('');
    sourceImgRef.current = null;
    maskRef.current = null;
    setLoadingState('idle');
    setProgress(0);
    setStatusMessage('');
  };

  const handleCancel = () => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    setLoadingState('idle');
    setProgress(0);
  };

  // Cleanup Object URLs on unmount
  useEffect(() => {
    return () => {
      if (workerRef.current) workerRef.current.terminate();
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (processedUrl) URL.revokeObjectURL(processedUrl);
    };
  }, [originalUrl, processedUrl]);

  const bgSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'AI Background Remover - ImagePlumber',
    'applicationCategory': 'MultimediaApplication',
    'operatingSystem': 'Web Browser',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    },
    'description': 'Remove image backgrounds automatically using on-device AI. 100% offline — no files are uploaded to any server. Powered by the RMBG-1.4 neural network running entirely in your browser.',
    'featureList': [
      'Automatic edge segmentation',
      'Local neural network inference (RMBG-1.4)',
      'High-quality transparent PNG download',
      'Studio background replacement (White, Passport Colors, Blur)',
      'Zero-copy GPU canvas compositing'
    ]
  };

  return (
    <div className="w-full">
      <SEO 
        title="Free AI Background Remover - remove.bg Alternative" 
        description="Remove image backgrounds automatically using on-device AI. A 100% offline alternative to remove.bg, Canva, and Adobe Express. Zero uploads." 
        keywords="background remover, remove background from image, AI background removal, background eraser, transparent background, remove image background online, background remover free, cut out background, PNG transparent, photo background remover, no upload background remover, offline background remover, browser AI background, remove.bg alternative, Canva background remover alternative, Adobe Express background remover replacement, free erase background"
        schema={bgSchema}
      />

      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200/80 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold shadow-xs">
            <Cpu className="w-3.5 h-3.5" />
            <span>AI Neural Engine • 🔒 100% Client-Side Private</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mt-3 mb-2 tracking-tight">
            AI Background Remover & Studio
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Extract portraits and products with deep neural edge segmentation. Replace with studio colors, blur, or transparent PNG.
          </p>
        </div>

        {/* State: Idle / DropZone */}
        {loadingState === 'idle' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
              <div className="md:col-span-7 flex flex-col justify-center">
                <DropZone 
                  onFilesSelected={handleFilesSelected}
                  title="Drop image to remove background"
                  subtitle="Supports JPG, PNG, WebP up to 25MB • Full native resolution retained"
                  icon={Scissors}
                />

                {/* Instant Sample Presets */}
                <div className="mt-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    <span>No image handy? Try a live test sample:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLoadSample('portrait')}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 transition cursor-pointer active:scale-95"
                    >
                      👤 Portrait
                    </button>
                    <button
                      onClick={() => handleLoadSample('product')}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 transition cursor-pointer active:scale-95"
                    >
                      👟 Product
                    </button>
                    <button
                      onClick={() => handleLoadSample('pet')}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 transition cursor-pointer active:scale-95"
                    >
                      🐱 Pet
                    </button>
                  </div>
                </div>
              </div>

              <div className="md:col-span-5 flex">
                <div className="premium-bento rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between w-full shadow-sm hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300">
                  <div className="space-y-4">
                    <div className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 border border-purple-100 dark:border-purple-900 px-2 py-0.5 rounded uppercase tracking-wider inline-block">
                      Demo Preview
                    </div>
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                      How AI Background Remover Works
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      Our local AI segments your images directly in your browser's hardware. Extract people, products, and pets with fine edge retention and zero uploads.
                    </p>
                  </div>
                  <DemoPreview
                    toolId="bg-remover"
                    alt="Background Remover Demo"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* State: Loading / Processing */}
        {(loadingState === 'loading-model' || loadingState === 'processing-image') && (
          <div className="premium-bento p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col items-center justify-center gap-6 shadow-xl shadow-slate-200/20 dark:shadow-none">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-150/80 dark:border-indigo-800 flex items-center justify-center animate-pulse text-indigo-600 dark:text-indigo-400 shadow-xs">
              <Cpu className="w-7 h-7" />
            </div>
            
            <ProgressBar 
              progress={progress}
              label={loadingState === 'loading-model' ? 'AI Neural Engine' : 'Segmentation in Progress'}
              subLabel={statusMessage}
              onCancel={handleCancel}
            />

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl max-w-md flex items-start gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
              <AlertTriangle className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
              <span>
                Studio-grade neural network weights (~170MB RMBG-1.4) are cached directly in your browser's IndexedDB. After first initialization, all subsequent processing works 100% offline.
              </span>
            </div>
          </div>
        )}

        {/* State: Error */}
        {loadingState === 'error' && (
          <div className="premium-bento p-8 rounded-3xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 text-center flex flex-col items-center gap-4 animate-fade-in shadow-lg">
            <div className="w-14 h-14 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-red-500 rounded-2xl flex items-center justify-center">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">Processing Encountered an Issue</h3>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-md">{errorMsg}</p>
            </div>
            <button
              onClick={handleReset}
              className="px-6 py-2.5 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200/80 dark:border-red-900 text-xs font-bold text-red-600 dark:text-red-400 rounded-xl transition cursor-pointer shadow-xs flex items-center gap-2 active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try Again
            </button>
          </div>
        )}

        {/* State: Completed / Studio Editor */}
        {loadingState === 'completed' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Top Toolbar: View Mode Toggle & Quick Reset */}
            <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Inspection View:
                </span>
                <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200/60 dark:border-slate-700">
                  <button
                    onClick={() => setViewMode('split')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                      viewMode === 'split'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    Split Compare
                  </button>
                  <button
                    onClick={() => setViewMode('side-by-side')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                      viewMode === 'side-by-side'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Columns className="w-3.5 h-3.5" />
                    Side-by-Side
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  New Image
                </button>
              </div>
            </div>

            {/* Visual Preview Container */}
            {viewMode === 'split' ? (
              <div 
                ref={splitContainerRef}
                onMouseDown={handleMouseDown}
                onTouchMove={handleTouchMove}
                className="relative w-full h-[380px] md:h-[480px] rounded-3xl overflow-hidden border-2 border-slate-200/80 dark:border-slate-800 select-none cursor-ew-resize shadow-md bg-slate-950"
              >
                {/* Bottom Layer: Original Image */}
                <div className="absolute inset-0 flex items-center justify-center p-4 bg-slate-900">
                  <img 
                    src={originalUrl} 
                    alt="Original" 
                    className="max-w-full max-h-full object-contain pointer-events-none" 
                  />
                  <span className="absolute top-4 right-4 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-md border border-white/10 shadow-sm">
                    Original
                  </span>
                </div>

                {/* Top Layer: Cutout with chosen background */}
                <div 
                  className="absolute inset-0 flex items-center justify-center p-4"
                  style={{
                    clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`,
                    backgroundImage: bgMode === 'transparent' 
                      ? 'radial-gradient(#475569 20%, transparent 20%), radial-gradient(#475569 20%, transparent 20%)'
                      : undefined,
                    backgroundPosition: '0 0, 8px 8px',
                    backgroundSize: '16px 16px',
                    backgroundColor: bgMode === 'transparent' ? '#0F172A' : undefined
                  }}
                >
                  <img 
                    src={processedUrl} 
                    alt="AI Cutout" 
                    className="max-w-full max-h-full object-contain pointer-events-none drop-shadow-xl" 
                  />
                  <span className="absolute top-4 left-4 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-600/90 text-white backdrop-blur-md border border-indigo-400/30 shadow-sm">
                    AI Cutout
                  </span>
                </div>

                {/* Draggable Divider Handle */}
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-2xl pointer-events-none z-20 flex items-center justify-center"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold pointer-events-auto cursor-ew-resize active:scale-95 transition-transform">
                    <ArrowLeftRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest block">
                    Original Image
                  </span>
                  <div className="w-full h-[360px] bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 rounded-3xl overflow-hidden flex items-center justify-center p-3">
                    <img src={originalUrl} alt="Original" className="max-w-full max-h-full object-contain rounded-xl shadow-xs" />
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-900/50 uppercase tracking-widest inline-block">
                    Cutout Preview
                  </span>
                  <div 
                    className="w-full h-[360px] border border-indigo-500/20 dark:border-indigo-500/30 rounded-3xl overflow-hidden flex items-center justify-center p-3 relative"
                    style={{ 
                      backgroundImage: bgMode === 'transparent'
                        ? 'radial-gradient(#475569 20%, transparent 20%), radial-gradient(#475569 20%, transparent 20%)'
                        : undefined,
                      backgroundPosition: '0 0, 8px 8px',
                      backgroundSize: '16px 16px',
                      backgroundColor: bgMode === 'transparent' ? '#0F172A' : undefined
                    }}
                  >
                    <img src={processedUrl} alt="AI Cutout" className="max-w-full max-h-full object-contain rounded-xl drop-shadow-xl" />
                  </div>
                </div>
              </div>
            )}

            {/* Studio Background Replacement Suite */}
            <div className="premium-bento p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Studio Background
                  </h3>
                </div>
                
                {/* Background Mode Pills */}
                <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200/60 dark:border-slate-700">
                  <button
                    onClick={() => setBgModeAndRecomposite('transparent')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      bgMode === 'transparent'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    🏁 Transparent
                  </button>
                  <button
                    onClick={() => setBgModeAndRecomposite('color')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      bgMode === 'color'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    🎨 Solid Color
                  </button>
                  <button
                    onClick={() => setBgModeAndRecomposite('blur')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      bgMode === 'blur'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    📸 Portrait Blur
                  </button>
                </div>
              </div>

              {/* Color Swatches (when Solid Color active) */}
              {bgMode === 'color' && (
                <div className="flex items-center flex-wrap gap-2.5 pt-2 animate-fade-in">
                  {COLOR_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => setBgColorAndRecomposite(p.color)}
                      title={p.name}
                      className={`w-9 h-9 rounded-xl border-2 transition transform active:scale-90 cursor-pointer shadow-xs flex items-center justify-center ${p.border} ${
                        bgColor.toLowerCase() === p.color.toLowerCase() ? 'ring-2 ring-indigo-500 scale-105' : ''
                      }`}
                      style={{ backgroundColor: p.color }}
                    >
                      {bgColor.toLowerCase() === p.color.toLowerCase() && (
                        <Check className={`w-4 h-4 ${p.color === '#FFFFFF' || p.color === '#FFFBEB' || p.color === '#F1F5F9' ? 'text-slate-900' : 'text-white'}`} />
                      )}
                    </button>
                  ))}

                  {/* Custom Hex Color Picker */}
                  <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-200 dark:border-slate-700">
                    <label className="relative cursor-pointer flex items-center">
                      <input 
                        type="color" 
                        value={bgColor} 
                        onChange={(e) => setBgColorAndRecomposite(e.target.value)}
                        className="w-9 h-9 opacity-0 absolute cursor-pointer"
                      />
                      <div 
                        className="w-9 h-9 rounded-xl border-2 border-dashed border-indigo-400 flex items-center justify-center cursor-pointer shadow-xs text-xs font-bold text-indigo-600 dark:text-indigo-400"
                        style={{ backgroundColor: bgColor }}
                      >
                        +
                      </div>
                    </label>
                    <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 uppercase">
                      {bgColor}
                    </span>
                  </div>
                </div>
              )}

              {bgMode === 'blur' && (
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                  Creates an optical depth-of-field portrait bokeh effect by blurring the original background behind the isolated subject.
                </p>
              )}

              {/* Advanced Edge Refinement Toggle */}
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center justify-between w-full text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer py-1"
                >
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Edge Softness & Feathering</span>
                    {edgeFeather > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-mono">
                        {edgeFeather}px
                      </span>
                    )}
                  </div>
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showAdvanced && (
                  <div className="mt-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-2 animate-fade-in">
                    <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
                      <span>Edge Feathering (Smooth halo)</span>
                      <span className="font-bold">{edgeFeather}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="5" 
                      step="1"
                      value={edgeFeather}
                      onChange={(e) => setFeatherAndRecomposite(Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-450 dark:text-slate-400">
                      <span>Sharp AI Edge (0px)</span>
                      <span>Soft Blend (5px)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="premium-bento p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              
              {/* Format Selection (Enabled for non-transparent backgrounds) */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Export:
                </span>
                <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200/60 dark:border-slate-700">
                  <button
                    onClick={() => setExportFormatAndRecomposite('png')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer transition ${
                      exportFormat === 'png'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    PNG {bgMode === 'transparent' && '(Alpha)'}
                  </button>
                  {bgMode !== 'transparent' && (
                    <>
                      <button
                        onClick={() => setExportFormatAndRecomposite('jpeg')}
                        className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer transition ${
                          exportFormat === 'jpeg'
                            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        JPG
                      </button>
                      <button
                        onClick={() => setExportFormatAndRecomposite('webp')}
                        className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer transition ${
                          exportFormat === 'webp'
                            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        WebP
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* 1-Click Copy to Clipboard */}
                <button
                  onClick={handleCopyToClipboard}
                  className="py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95 min-h-[48px]"
                  title="Copy cutout image directly to clipboard"
                >
                  {copied ? (
                    <><Check className="w-4 h-4 text-emerald-500 animate-check-pop" /> Copied!</>
                  ) : (
                    <><Copy className="w-4 h-4" /> Copy</>
                  )}
                </button>

                {/* Download Button */}
                <button
                  onClick={handleDownload}
                  className={`flex-1 sm:flex-initial px-6 py-3 text-xs font-bold uppercase tracking-wider text-white rounded-2xl shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[48px] ${
                    downloaded
                      ? 'bg-emerald-500 shadow-emerald-500/20'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-500/25'
                  }`}
                >
                  {downloaded ? (
                    <><Check className="w-4 h-4 animate-check-pop" /> Saved!</>
                  ) : (
                    <><Download className="w-4 h-4" /> Download {bgMode === 'transparent' ? 'PNG' : exportFormat.toUpperCase()}</>
                  )}
                </button>
              </div>

            </div>

            {/* Floating Mobile Bottom Action Dock */}
            <div className="fixed bottom-4 left-4 right-4 sm:hidden z-30 flex items-center justify-between p-2.5 bg-slate-900/90 dark:bg-slate-850/95 text-white rounded-2xl backdrop-blur-xl shadow-2xl border border-white/10 animate-fade-in">
              <button
                onClick={handleReset}
                className="py-2 px-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 transition min-h-[44px]"
              >
                <RefreshCw className="w-4 h-4 text-indigo-400" />
                <span>Reset</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyToClipboard}
                  className="py-2 px-3 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 transition min-h-[44px]"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="py-2 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition min-h-[44px]"
                >
                  <Download className="w-4 h-4" />
                  <span>{downloaded ? 'Saved!' : 'Save'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Informative Tool Guide */}
        <div className="mt-16 border-t border-slate-200/60 dark:border-slate-800 pt-12">
          <ToolGuide
            toolName="AI Background Remover"
            introText="Extract subjects from your images instantly with our offline AI background eraser. Our advanced deep-learning model executes inside your browser, guaranteeing files never leave your device."
            competitorComparison={{
              alternatives: ['remove.bg', 'Canva Background Remover', 'Adobe Express'],
              benefit: 'Traditional background removers upload your images to cloud servers, often charging subscription fees or watermarking low-res files. ImagePlumber runs the RMBG-1.4 neural network completely locally on your hardware. It is 100% free, preserves high-resolution quality, and never uploads a single pixel.'
            }}
            steps={[
              {
                title: 'Upload Image or Sample',
                description: 'Select a portrait, product photo, or animal by dropping it in or clicking one of our instant sample presets.'
              },
              {
                title: 'Automatic AI Segmentation',
                description: 'The browser worker executes the neural network directly on your hardware to segment your subject with fine hair and edge isolation.'
              },
              {
                title: 'Studio Customization & Download',
                description: 'Keep it transparent, apply eCommerce studio white or passport colors, compare with the split slider, and download or copy to clipboard in one click.'
              }
            ]}
            features={[
              'On-device AI inference powered by the state-of-the-art RMBG-1.4 model.',
              'Studio Background Suite: Transparent PNG, solid colors (Amazon White, Passport Blue), or Portrait Depth Blur.',
              'Interactive Before/After split inspection slider to examine edge accuracy.',
              'Zero-copy memory pipeline with WebAssembly and GPU canvas compositing.',
              '1-Click Copy to Clipboard for instant pasting into Figma, Canva, and WhatsApp.',
              'Full native camera resolution preserved with zero compression loss.'
            ]}
            faq={[
              {
                q: 'Why does the first run take longer?',
                a: 'The tool downloads the neural network weights (~170MB RMBG-1.4) from Hugging Face CDN directly into your browser IndexedDB cache. Once downloaded, all subsequent runs launch instantly and operate 100% offline.'
              },
              {
                q: 'Can I replace the background with Amazon White or Passport Blue?',
                a: 'Yes! The Studio Background bar lets you choose between Transparent, Studio White (#FFFFFF), Passport Blue, Portrait Blur, or any custom hex color.'
              },
              {
                q: 'Does it downscale high-resolution photos?',
                a: 'No. ImagePlumber uses hardware-accelerated GPU compositing to render the high-precision segmentation mask onto the full native dimensions of your original camera file.'
              },
              {
                q: 'Are my photos secure?',
                a: 'Yes. Unlike typical online AI utilities, ImagePlumber runs entirely in client-side WebAssembly and JavaScript sandbox. Your data remains strictly on your physical drive.'
              }
            ]}
          />
        </div>

      </div>
    </div>
  );
};
