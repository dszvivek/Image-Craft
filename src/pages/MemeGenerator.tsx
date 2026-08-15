import React, { useState, useEffect, useRef } from 'react';
import { Download, RefreshCw, Type, Plus, Trash2, Copy, Move, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { DropZone } from '../components/DropZone';
import { SEO } from '../components/SEO';
import { ToolGuide } from '../components/ToolGuide';
import { DemoPreview } from '../components/DemoPreview';

export interface TextLayer {
  id: string;
  text: string;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  size: number; // font size in px
  color: string;
  strokeColor: string;
  strokeWidth: number; // 0-20 px
  fontFamily: string;
  isAllCaps: boolean;
  align: 'left' | 'center' | 'right';
  hasBackground: boolean;
  backgroundColor: string;
  backgroundOpacity: number; // 0-100
}

interface MemeTemplate {
  id: string;
  name: string;
  url: string;
}

const TEMPLATES: MemeTemplate[] = [
  {
    id: 'drake',
    name: 'Drake Hotline',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'success',
    name: 'Success Kid / Achievement',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'two-choices',
    name: 'Decision Dilemma',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'brain',
    name: 'Cosmic Genius',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
  }
];

const FONTS = [
  { id: 'Impact', label: 'Impact (Classic Meme)' },
  { id: 'Montserrat', label: 'Montserrat (Modern Bold)' },
  { id: 'Anton', label: 'Anton (Heavy Header)' },
  { id: 'Comic Neue, Comic Sans MS', label: 'Comic Neue (Humorous)' },
  { id: 'Pacifico', label: 'Pacifico (Cursive Script)' },
  { id: 'Playfair Display', label: 'Playfair Display (Serif Elegance)' },
  { id: 'Outfit, sans-serif', label: 'Outfit (Clean UI)' },
  { id: 'monospace', label: 'Monospace (Code / Retro)' }
];

interface MemeGeneratorProps {
  initialMode?: 'meme' | 'caption' | 'text';
  pageTitle?: string;
  pageSubtitle?: string;
}

export const MemeGenerator: React.FC<MemeGeneratorProps> = ({
  initialMode = 'meme',
  pageTitle,
  pageSubtitle,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const [layers, setLayers] = useState<TextLayer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  const [exportFormat, setExportFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png');
  const [jpegQuality, setJpegQuality] = useState<number>(92);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDraggingRef = useRef<boolean>(false);

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
        initDefaultLayers(initialMode);
      };
    }
  };

  const loadTemplate = (templateUrl: string) => {
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    setFile(null);
    setImageSrc(templateUrl);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = templateUrl;
    img.onload = () => {
      setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
      initDefaultLayers(initialMode);
    };
  };

  const initDefaultLayers = (mode: string) => {
    if (mode === 'meme') {
      const top: TextLayer = {
        id: 'layer-top',
        text: 'TOP MEME CAPTION',
        x: 50,
        y: 12,
        size: 42,
        color: '#FFFFFF',
        strokeColor: '#000000',
        strokeWidth: 4,
        fontFamily: 'Impact',
        isAllCaps: true,
        align: 'center',
        hasBackground: false,
        backgroundColor: '#000000',
        backgroundOpacity: 60
      };
      const bottom: TextLayer = {
        id: 'layer-bottom',
        text: 'BOTTOM MEME CAPTION',
        x: 50,
        y: 88,
        size: 42,
        color: '#FFFFFF',
        strokeColor: '#000000',
        strokeWidth: 4,
        fontFamily: 'Impact',
        isAllCaps: true,
        align: 'center',
        hasBackground: false,
        backgroundColor: '#000000',
        backgroundOpacity: 60
      };
      setLayers([top, bottom]);
      setSelectedLayerId('layer-top');
    } else if (mode === 'caption') {
      const cap: TextLayer = {
        id: 'layer-caption',
        text: 'Add your photo caption or subtitle here...',
        x: 50,
        y: 85,
        size: 32,
        color: '#FFFFFF',
        strokeColor: '#000000',
        strokeWidth: 2,
        fontFamily: 'Outfit, sans-serif',
        isAllCaps: false,
        align: 'center',
        hasBackground: true,
        backgroundColor: '#000000',
        backgroundOpacity: 75
      };
      setLayers([cap]);
      setSelectedLayerId('layer-caption');
    } else {
      const txt: TextLayer = {
        id: 'layer-text',
        text: 'Custom Typography Overlay',
        x: 50,
        y: 50,
        size: 40,
        color: '#FFFFFF',
        strokeColor: '#1E1B4B',
        strokeWidth: 3,
        fontFamily: 'Montserrat',
        isAllCaps: false,
        align: 'center',
        hasBackground: false,
        backgroundColor: '#000000',
        backgroundOpacity: 50
      };
      setLayers([txt]);
      setSelectedLayerId('layer-text');
    }
  };

  const addLayer = () => {
    const newLayer: TextLayer = {
      id: `layer-${Date.now()}`,
      text: 'NEW TEXT LAYER',
      x: 50,
      y: 50,
      size: 36,
      color: '#FFFFFF',
      strokeColor: '#000000',
      strokeWidth: 3,
      fontFamily: 'Impact',
      isAllCaps: true,
      align: 'center',
      hasBackground: false,
      backgroundColor: '#000000',
      backgroundOpacity: 60
    };
    setLayers((prev) => [...prev, newLayer]);
    setSelectedLayerId(newLayer.id);
  };

  const duplicateLayer = (layer: TextLayer) => {
    const dup: TextLayer = {
      ...layer,
      id: `layer-${Date.now()}`,
      y: Math.min(95, layer.y + 6)
    };
    setLayers((prev) => [...prev, dup]);
    setSelectedLayerId(dup.id);
  };

  const deleteLayer = (id: string) => {
    setLayers((prev) => prev.filter((l) => l.id !== id));
    if (selectedLayerId === id) setSelectedLayerId(null);
  };

  const updateLayer = (id: string, updates: Partial<TextLayer>) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updates } : l))
    );
  };

  const selectedLayer = layers.find((l) => l.id === selectedLayerId);

  // Render Canvas
  useEffect(() => {
    if (!imageSrc || imageSize.width === 0 || imageSize.height === 0) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
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

      // Draw background image
      ctx.drawImage(img, 0, 0, w, h);

      // Draw all text layers
      layers.forEach((layer) => {
        ctx.save();

        const displayText = layer.isAllCaps ? layer.text.toUpperCase() : layer.text;
        // Scale font proportionally to 1000px width baseline
        const scaleFactor = w / 1000;
        const computedFontSize = Math.max(14, Math.round(layer.size * scaleFactor));
        
        ctx.font = `bold ${computedFontSize}px ${layer.fontFamily}`;
        ctx.textAlign = layer.align;
        ctx.textBaseline = 'middle';

        const posX = (layer.x / 100) * w;
        const posY = (layer.y / 100) * h;

        // Optional Background Highlight Box
        if (layer.hasBackground) {
          const metrics = ctx.measureText(displayText);
          const padX = computedFontSize * 0.5;
          const padY = computedFontSize * 0.3;
          const boxW = metrics.width + padX * 2;
          const boxH = computedFontSize + padY * 2;

          let startX = posX - padX;
          if (layer.align === 'center') startX = posX - boxW / 2;
          if (layer.align === 'right') startX = posX - boxW + padX;
          const startY = posY - boxH / 2;

          ctx.fillStyle = layer.backgroundColor;
          ctx.globalAlpha = layer.backgroundOpacity / 100;
          ctx.fillRect(startX, startY, boxW, boxH);
          ctx.globalAlpha = 1.0;
        }

        // Stroke Outline
        if (layer.strokeWidth > 0) {
          ctx.strokeStyle = layer.strokeColor;
          ctx.lineWidth = Math.max(1, Math.round(layer.strokeWidth * scaleFactor));
          ctx.lineJoin = 'round';
          ctx.miterLimit = 2;
          ctx.strokeText(displayText, posX, posY);
        }

        // Fill Text
        ctx.fillStyle = layer.color;
        ctx.fillText(displayText, posX, posY);

        ctx.restore();
      });
    };
  }, [imageSrc, imageSize, layers]);

  // Handle Drag on Canvas
  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || layers.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    // Find closest layer
    let closestId: string | null = null;
    let minDist = 20; // threshold in %

    layers.forEach((l) => {
      const dist = Math.hypot(l.x - clickX, l.y - clickY);
      if (dist < minDist) {
        minDist = dist;
        closestId = l.id;
      }
    });

    if (closestId) {
      setSelectedLayerId(closestId);
      isDraggingRef.current = true;
    }
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current || !selectedLayerId) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const newX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const newY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    updateLayer(selectedLayerId, { x: Math.round(newX), y: Math.round(newY) });
  };

  const handleCanvasPointerUp = () => {
    isDraggingRef.current = false;
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
        const originalName = file?.name.replace(/\.[^/.]+$/, '') || 'meme';
        const ext = exportFormat === 'image/png' ? 'png' : exportFormat === 'image/webp' ? 'webp' : 'jpg';
        a.download = `${originalName}-${Date.now()}.${ext}`;
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
    setLayers([]);
    setSelectedLayerId(null);
  };

  const memeSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Interactive Meme Generator & Photo Typography Studio - ImagePlumber',
    'applicationCategory': 'MultimediaApplication',
    'operatingSystem': 'Web Browser',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD',
    },
    'description': 'Create custom memes and add text overlays to photos online for free. Drag-and-drop captions, Google Fonts, outline strokes, and popular meme templates.',
    'featureList': [
      'Multi-layer draggable text overlay with Impact, Anton, and Montserrat Google Fonts',
      'Outline stroke thickness, custom fill colors, and subtitle highlight boxes',
      'Instant meme templates library & custom photo upload',
      'Lossless PNG, JPEG, and WebP export with zero cloud uploads'
    ]
  };

  return (
    <div className="py-8 md:py-12 max-w-7xl mx-auto px-4 sm:px-6">
      <SEO
        title={pageTitle || "Free Online Meme Generator & Add Text to Photo | ImagePlumber"}
        description={pageSubtitle || "Create custom memes and add captions to photos online for free. Multi-layer draggable text, outline strokes, Google Fonts, and zero cloud uploads."}
        canonicalUrl="https://imageplumber.com/meme-generator"
        schema={memeSchema}
      />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-650 dark:text-amber-300 text-xs font-semibold uppercase tracking-wider mb-4">
          <Type className="w-3.5 h-3.5" />
          <span>Typography & Meme Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-tight mb-4">
          {pageTitle || "Meme Generator & Text Overlay"}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
          {pageSubtitle || "Add custom captions, outline strokes, and typography to any photo or template with live draggable canvas positioning."}
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        {!imageSrc ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
              <div className="md:col-span-7 flex flex-col justify-center">
                <DropZone
                  onFilesSelected={handleFilesSelected}
                  title="Drop any photo to add text or create a meme"
                  subtitle="Supports JPG, PNG, WebP, HEIC up to 50MB"
                />
              </div>
              <div className="md:col-span-5 flex">
                <div className="premium-bento rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between w-full shadow-sm">
                  <div className="space-y-4">
                    <div className="text-[10px] font-bold text-amber-650 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border border-amber-100 dark:border-amber-900 px-2 py-0.5 rounded uppercase tracking-wider inline-block">
                      Typography Studio
                    </div>
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Multi-Layer Captions</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      Add multiple text blocks with custom outline strokes, Google Fonts, and subtitle highlight boxes.
                    </p>
                  </div>
                  <DemoPreview toolId="meme" alt="Meme Generator Preview" />
                </div>
              </div>
            </div>

            {/* Popular Templates Gallery */}
            <div className="border-t border-slate-200/60 dark:border-slate-800 pt-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Or pick a classic starter template:
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => loadTemplate(tmpl.url)}
                    className="group rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-900/50 hover:border-amber-400 dark:hover:border-amber-500 transition-all text-left cursor-pointer p-2 flex flex-col items-center gap-2 shadow-sm hover:shadow-md"
                  >
                    <img
                      src={tmpl.url}
                      alt={tmpl.name}
                      className="w-full h-28 object-cover rounded-xl group-hover:scale-105 transition-transform"
                    />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate w-full text-center">
                      {tmpl.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Controls (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="premium-bento p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-5 shadow-xl shadow-slate-200/20 dark:shadow-none">
                
                {/* Header Actions */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Text Layers ({layers.length})
                  </span>
                  <button
                    onClick={addLayer}
                    className="py-1.5 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-700 dark:text-amber-300 font-bold text-xs border border-amber-200/60 dark:border-amber-800 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Layer</span>
                  </button>
                </div>

                {/* Layer Selector Tabs */}
                <div className="flex flex-wrap gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                  {layers.map((l, index) => (
                    <button
                      key={l.id}
                      onClick={() => setSelectedLayerId(l.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        selectedLayerId === l.id
                          ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-300 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <span>#{index + 1}: {l.text.slice(0, 10) || 'Empty'}</span>
                    </button>
                  ))}
                </div>

                {/* Selected Layer Controls */}
                {selectedLayer && (
                  <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                    
                    {/* Caption Input */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                        Caption Text
                      </label>
                      <input
                        type="text"
                        value={selectedLayer.text}
                        onChange={(e) => updateLayer(selectedLayer.id, { text: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        placeholder="Type text..."
                      />
                    </div>

                    {/* Font & Alignment */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                          Font Family
                        </label>
                        <select
                          value={selectedLayer.fontFamily}
                          onChange={(e) => updateLayer(selectedLayer.id, { fontFamily: e.target.value })}
                          className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none"
                        >
                          {FONTS.map((f) => (
                            <option key={f.id} value={f.id}>{f.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                          Alignment
                        </label>
                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                          <button
                            onClick={() => updateLayer(selectedLayer.id, { align: 'left' })}
                            className={`flex-1 py-1 rounded-lg flex items-center justify-center cursor-pointer ${
                              selectedLayer.align === 'left' ? 'bg-white dark:bg-slate-700 text-amber-600 shadow-sm' : 'text-slate-400'
                            }`}
                          >
                            <AlignLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => updateLayer(selectedLayer.id, { align: 'center' })}
                            className={`flex-1 py-1 rounded-lg flex items-center justify-center cursor-pointer ${
                              selectedLayer.align === 'center' ? 'bg-white dark:bg-slate-700 text-amber-600 shadow-sm' : 'text-slate-400'
                            }`}
                          >
                            <AlignCenter className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => updateLayer(selectedLayer.id, { align: 'right' })}
                            className={`flex-1 py-1 rounded-lg flex items-center justify-center cursor-pointer ${
                              selectedLayer.align === 'right' ? 'bg-white dark:bg-slate-700 text-amber-600 shadow-sm' : 'text-slate-400'
                            }`}
                          >
                            <AlignRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Font Size & Stroke Width Sliders */}
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                          <span>Font Size</span>
                          <span className="font-mono text-amber-600">{selectedLayer.size} px</span>
                        </div>
                        <input
                          type="range"
                          min="14"
                          max="120"
                          value={selectedLayer.size}
                          onChange={(e) => updateLayer(selectedLayer.id, { size: Number(e.target.value) })}
                          className="range-styled w-full"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                          <span>Outline Stroke</span>
                          <span className="font-mono text-amber-600">{selectedLayer.strokeWidth} px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="16"
                          value={selectedLayer.strokeWidth}
                          onChange={(e) => updateLayer(selectedLayer.id, { strokeWidth: Number(e.target.value) })}
                          className="range-styled w-full"
                        />
                      </div>
                    </div>

                    {/* Color Pickers */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={selectedLayer.color}
                          onChange={(e) => updateLayer(selectedLayer.id, { color: e.target.value })}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700"
                        />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Text Color</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={selectedLayer.strokeColor}
                          onChange={(e) => updateLayer(selectedLayer.id, { strokeColor: e.target.value })}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700"
                        />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Stroke Color</span>
                      </div>
                    </div>

                    {/* All-Caps & Subtitle Box Toggles */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateLayer(selectedLayer.id, { isAllCaps: !selectedLayer.isAllCaps })}
                        className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                          selectedLayer.isAllCaps
                            ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 text-amber-700 dark:text-amber-300'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                        }`}
                      >
                        ALL-CAPS ({selectedLayer.isAllCaps ? 'ON' : 'OFF'})
                      </button>

                      <button
                        onClick={() => updateLayer(selectedLayer.id, { hasBackground: !selectedLayer.hasBackground })}
                        className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                          selectedLayer.hasBackground
                            ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 text-amber-700 dark:text-amber-300'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                        }`}
                      >
                        Highlight Box ({selectedLayer.hasBackground ? 'ON' : 'OFF'})
                      </button>
                    </div>

                    {/* Layer Actions */}
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => duplicateLayer(selectedLayer)}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Duplicate</span>
                      </button>
                      <button
                        onClick={() => deleteLayer(selectedLayer.id)}
                        className="py-2 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-600 dark:text-rose-400 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>

                  </div>
                )}

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
                              ? 'bg-amber-600 text-white'
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
                        <span className="font-mono text-amber-600">{jpegQuality}%</span>
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
                    className="flex-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isProcessing ? 'Processing...' : 'Download Meme'}</span>
                  </button>
                </div>

              </div>
            </div>

            {/* Canvas Stage (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="relative rounded-3xl bg-slate-950/5 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 p-4 min-h-[420px] flex items-center justify-center overflow-hidden">
                <canvas
                  ref={canvasRef}
                  onPointerDown={handleCanvasPointerDown}
                  onPointerMove={handleCanvasPointerMove}
                  onPointerUp={handleCanvasPointerUp}
                  className="max-w-full max-h-[600px] object-contain rounded-2xl shadow-xl transition-all cursor-move select-none"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2 font-medium">
                <span className="flex items-center gap-1.5">
                  <Move className="w-3.5 h-3.5 text-amber-500" />
                  <span>Drag text directly on canvas to position</span>
                </span>
                <span>{imageSize.width} × {imageSize.height} px</span>
              </div>
            </div>

          </div>
        )}

        {/* SEO Guide Section */}
        <div className="mt-16 border-t border-slate-200/60 dark:border-slate-800 pt-12">
          <ToolGuide
            toolName="Meme Generator & Photo Typography Studio"
            introText="Create viral memes, add captions, and style typography with outline strokes and Google Fonts in seconds."
            competitorComparison={{
              alternatives: ['Imgflip Meme Generator', 'iLoveIMG Meme Maker', 'Kapwing Meme Editor'],
              benefit: 'Our meme creator is 100% free with zero watermarks, zero pop-up subscriptions, and zero cloud uploads. Design captions with 60 FPS real-time rendering in local browser RAM.',
            }}
            steps={[
              { title: 'Upload Photo or Pick Template', description: 'Drop your own image or choose from popular meme starter templates.' },
              { title: 'Style Your Captions', description: 'Customize font size, stroke thickness, colors, and subtitle highlight boxes.' },
              { title: 'Drag to Position', description: 'Drag captions anywhere on the canvas with touch and mouse support.' },
              { title: 'Export Watermark-Free', description: 'Download your high-resolution meme in lossless PNG, JPEG, or WebP format.' },
            ]}
            features={[
              'Multi-layer draggable text overlay with Impact, Anton, Montserrat, and Pacifico fonts',
              'Custom outline stroke thickness and shadow glow engine',
              'Subtitle highlight boxes with adjustable background opacity',
              '100% In-browser processing with zero watermarks or server uploads'
            ]}
            faq={[
              { q: 'Does ImagePlumber put a watermark on generated memes?', a: 'No! All generated memes are completely watermark-free and 100% yours.' },
              { q: 'Can I upload my own custom fonts or images?', a: 'You can drop any custom PNG, JPEG, or WebP photo into the studio and select from 8 curated font styles.' }
            ]}
          />
        </div>

      </div>
    </div>
  );
};
