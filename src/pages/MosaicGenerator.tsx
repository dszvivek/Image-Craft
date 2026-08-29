import React, { useState, useEffect, useRef } from 'react';
import { Download, RefreshCw, Settings, Info, Play, Trash2, Sparkles, Eye, Minus, Plus } from 'lucide-react';
import { DropZone } from '../components/DropZone';
import { SEO } from '../components/SEO';
import { ToolGuide } from '../components/ToolGuide';
import { DemoPreview } from '../components/DemoPreview';

interface TileImage {
  id: string;
  name: string;
  url: string;
  avgColor: { r: number; g: number; b: number };
  imgElement: HTMLImageElement;
}

export const MosaicGenerator: React.FC = () => {
  // Input states
  const [targetFile, setTargetFile] = useState<File | null>(null);
  const [targetUrl, setTargetUrl] = useState<string>('');
  const [targetSize, setTargetSize] = useState<{ width: number; height: number } | null>(null);
  
  const [tiles, setTiles] = useState<TileImage[]>([]);
  
  // Settings states
  const [gridCols, setGridCols] = useState<number>(50);
  const [cellRatio, setCellRatio] = useState<number>(1); // 1 = 1:1, 1.33 = 4:3, 0.75 = 3:4
  const [overlayOpacity, setOverlayOpacity] = useState<number>(25); // 0-100% original overlay
  const [tileTint, setTileTint] = useState<number>(30); // 0-100% average color tinting
  const [varietyLevel, setVarietyLevel] = useState<number>(50); // 0-100% variety level (anti-repetition penalty)
  const [useDummyTiles, setUseDummyTiles] = useState<boolean>(true); // Solid colors fallback
  const [tileRenderSize, setTileRenderSize] = useState<number>(60); // Tile output size in px
  
  // Processing states
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [tileLoadingProgress, setTileLoadingProgress] = useState<number>(0);
  const [renderingProgress, setRenderingProgress] = useState<number>(0);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isComparing, setIsComparing] = useState<boolean>(false);

  // Magnifier glass hover state
  const [magnifier, setMagnifier] = useState<{ x: number; y: number; show: boolean }>({ x: 0, y: 0, show: false });
  const [magnifierDims, setMagnifierDims] = useState({ imgW: 0, imgH: 0, containerW: 0, containerH: 0 });
  const previewContainerRef = useRef<HTMLDivElement>(null);
  
  const minTilesRequired = 5;
  const tilePoolSize = tiles.length > 0 ? tiles.length : (useDummyTiles ? 16 : 0);
  const isGenerateDisabled = isProcessing || tilePoolSize < minTilesRequired;
  
  const targetImageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const targetUrlRef = useRef(targetUrl);
  const previewUrlRef = useRef(previewUrl);
  const tilesRef = useRef(tiles);

  useEffect(() => {
    targetUrlRef.current = targetUrl;
  }, [targetUrl]);

  useEffect(() => {
    previewUrlRef.current = previewUrl;
  }, [previewUrl]);

  useEffect(() => {
    tilesRef.current = tiles;
  }, [tiles]);

  useEffect(() => {
    return () => {
      if (targetUrlRef.current) URL.revokeObjectURL(targetUrlRef.current);
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      tilesRef.current.forEach((t) => URL.revokeObjectURL(t.url));
    };
  }, []);

  const handleTargetSelected = (files: File[]) => {
    if (files.length > 0) {
      if (targetUrl) URL.revokeObjectURL(targetUrl);
      const f = files[0];
      setTargetFile(f);
      setTargetUrl(URL.createObjectURL(f));
      setPreviewUrl('');
    }
  };

  const handleTargetLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setTargetSize({ width: img.naturalWidth, height: img.naturalHeight });
  };

  const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Image failed to load'));
      img.src = url;
    });
  };

  const getAverageColor = (img: HTMLImageElement): { r: number; g: number; b: number } => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (!ctx) return { r: 128, g: 128, b: 128 };
    ctx.drawImage(img, 0, 0, 1, 1);
    const data = ctx.getImageData(0, 0, 1, 1).data;
    return { r: data[0], g: data[1], b: data[2] };
  };

  const handleTilesSelected = async (files: File[]) => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setTileLoadingProgress(0);

    const newTiles: TileImage[] = [];
    const batchSize = 10;
    
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      const promises = batch.map(async (file) => {
        const url = URL.createObjectURL(file);
        try {
          const img = await loadImage(url);
          const avgColor = getAverageColor(img);
          return {
            id: Math.random().toString(36).substring(7),
            name: file.name,
            url,
            avgColor,
            imgElement: img,
          };
        } catch (_e) {
          URL.revokeObjectURL(url);
          return null;
        }
      });

      const results = await Promise.all(promises);
      results.forEach((t) => {
        if (t) newTiles.push(t);
      });

      setTileLoadingProgress(Math.round(((i + batch.length) / files.length) * 100));
      await new Promise((r) => setTimeout(r, 20));
    }

    setTiles((prev) => [...prev, ...newTiles]);
    setIsProcessing(false);
    setTileLoadingProgress(0);
  };

  const removeTile = (index: number) => {
    const target = tiles[index];
    if (target) {
      URL.revokeObjectURL(target.url);
      setTiles((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const clearAllTiles = () => {
    tiles.forEach((t) => URL.revokeObjectURL(t.url));
    setTiles([]);
  };

  const generateSolidColorTiles = (): TileImage[] => {
    const dummyTiles: TileImage[] = [];
    const colors = [
      { r: 239, g: 68, b: 68 },
      { r: 249, g: 115, b: 22 },
      { r: 245, g: 158, b: 11 },
      { r: 132, g: 204, b: 22 },
      { r: 34, g: 197, b: 94 },
      { r: 16, g: 185, b: 129 },
      { r: 20, g: 184, b: 166 },
      { r: 6, g: 182, b: 212 },
      { r: 59, g: 130, b: 246 },
      { r: 99, g: 102, b: 241 },
      { r: 139, g: 92, b: 246 },
      { r: 168, g: 85, b: 247 },
      { r: 236, g: 72, b: 153 },
      { r: 244, g: 63, b: 94 },
      { r: 30, g: 41, b: 59 },
      { r: 248, g: 250, b: 252 },
    ];

    colors.forEach((rgb, index) => {
      const canvas = document.createElement('canvas');
      canvas.width = 40;
      canvas.height = 40;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        ctx.fillRect(0, 0, 40, 40);
        
        const img = new Image();
        img.src = canvas.toDataURL();
        
        dummyTiles.push({
          id: `dummy-${index}`,
          name: `Color-${index}`,
          url: img.src,
          avgColor: rgb,
          imgElement: img,
        });
      }
    });

    return dummyTiles;
  };

  // Perceptual color matching with variety penalty
  const findClosestTile = (
    cellColor: { r: number; g: number; b: number },
    pool: TileImage[],
    usageMap: Record<string, number>
  ): TileImage => {
    let minDistance = Infinity;
    let closest = pool[0];
    
    const penaltyMultiplier = (varietyLevel / 100) * 16000;

    for (let i = 0; i < pool.length; i++) {
      const tile = pool[i];
      const usageCount = usageMap[tile.id] || 0;

      const rMean = (tile.avgColor.r + cellColor.r) / 2;
      const dr = tile.avgColor.r - cellColor.r;
      const dg = tile.avgColor.g - cellColor.g;
      const db = tile.avgColor.b - cellColor.b;
      
      const colorDistance = 
        (2 + rMean / 256) * dr * dr +
        4 * dg * dg +
        (2 + (255 - rMean) / 256) * db * db;

      const distance = colorDistance + usageCount * penaltyMultiplier;

      if (distance < minDistance) {
        minDistance = distance;
        closest = tile;
      }
    }
    return closest;
  };

  const drawTileCenterCrop = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    dx: number,
    dy: number,
    dw: number,
    dh: number
  ) => {
    const imgRatio = img.width / img.height;
    const cellRatio = dw / dh;
    let sx = 0, sy = 0, sw = img.width, sh = img.height;

    if (imgRatio > cellRatio) {
      sw = img.height * cellRatio;
      sx = (img.width - sw) / 2;
    } else {
      sh = img.width / cellRatio;
      sy = (img.height - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
  };

  const generateMosaic = async () => {
    if (!targetUrl || !targetSize || !targetImageRef.current) return;
    
    const tilePool = tiles.length > 0 ? tiles : (useDummyTiles ? generateSolidColorTiles() : []);
    if (tilePool.length < minTilesRequired) {
      alert(`Please upload at least ${minTilesRequired} tile images to construct a recognizable mosaic.`);
      return;
    }

    setIsProcessing(true);
    setRenderingProgress(0);

    const targetW = targetSize.width;
    const targetH = targetSize.height;

    const cols = gridCols;
    const cellW = targetW / cols;
    const cellH = cellW / cellRatio;
    const rows = Math.round(targetH / cellH);

    const downscaleCanvas = document.createElement('canvas');
    downscaleCanvas.width = cols;
    downscaleCanvas.height = rows;
    const downscaleCtx = downscaleCanvas.getContext('2d');
    if (!downscaleCtx) {
      setIsProcessing(false);
      return;
    }
    downscaleCtx.drawImage(targetImageRef.current, 0, 0, cols, rows);
    const targetBuffer = downscaleCtx.getImageData(0, 0, cols, rows).data;

    const outputTileW = tileRenderSize;
    const outputTileH = Math.round(outputTileW / cellRatio);
    const outputW = cols * outputTileW;
    const outputH = rows * outputTileH;

    const outputCanvas = canvasRef.current || document.createElement('canvas');
    outputCanvas.width = outputW;
    outputCanvas.height = outputH;
    const outputCtx = outputCanvas.getContext('2d');
    if (!outputCtx) {
      setIsProcessing(false);
      return;
    }

    const usageMap: Record<string, number> = {};

    const rowsPerChunk = 2;
    for (let r = 0; r < rows; r += rowsPerChunk) {
      const endRow = Math.min(r + rowsPerChunk, rows);

      for (let y = r; y < endRow; y++) {
        for (let x = 0; x < cols; x++) {
          const bufferIndex = (y * cols + x) * 4;
          const cellColor = {
            r: targetBuffer[bufferIndex],
            g: targetBuffer[bufferIndex + 1],
            b: targetBuffer[bufferIndex + 2]
          };

          const matchedTile = findClosestTile(cellColor, tilePool, usageMap);
          usageMap[matchedTile.id] = (usageMap[matchedTile.id] || 0) + 1;

          const dx = x * outputTileW;
          const dy = y * outputTileH;

          drawTileCenterCrop(outputCtx, matchedTile.imgElement, dx, dy, outputTileW, outputTileH);

          if (tileTint > 0) {
            outputCtx.save();
            outputCtx.fillStyle = `rgb(${cellColor.r}, ${cellColor.g}, ${cellColor.b})`;
            outputCtx.globalAlpha = tileTint / 100;
            outputCtx.fillRect(dx, dy, outputTileW, outputTileH);
            outputCtx.restore();
          }
        }
      }

      setRenderingProgress(Math.round((endRow / rows) * 100));
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }

    if (overlayOpacity > 0) {
      outputCtx.save();
      outputCtx.globalAlpha = overlayOpacity / 100;
      outputCtx.drawImage(targetImageRef.current, 0, 0, outputW, outputH);
      outputCtx.restore();
    }

    outputCanvas.toBlob((blob) => {
      if (blob) {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(URL.createObjectURL(blob));
      }
      setIsProcessing(false);
      setRenderingProgress(0);
    }, 'image/png');
  };

  const handleDownload = () => {
    if (!previewUrl || !targetFile) return;
    const lastDot = targetFile.name.lastIndexOf('.');
    const origName = lastDot > 0 ? targetFile.name.substring(0, lastDot) : targetFile.name;
    const link = document.createElement('a');
    link.href = previewUrl;
    link.download = `${origName}_mosaic.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    if (targetUrl) URL.revokeObjectURL(targetUrl);
    tiles.forEach((t) => URL.revokeObjectURL(t.url));
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setTargetFile(null);
    setTargetUrl('');
    setTargetSize(null);
    setTiles([]);
    setPreviewUrl('');
    setGridCols(50);
    setCellRatio(1);
    setOverlayOpacity(25);
    setTileTint(30);
    setVarietyLevel(50);
    setUseDummyTiles(true);
    setIsProcessing(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!previewUrl || !previewContainerRef.current) return;
    const rect = previewContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const imgEl = previewContainerRef.current.querySelector('img') as HTMLImageElement | null;
    setMagnifierDims({
      imgW: imgEl?.clientWidth || 0,
      imgH: imgEl?.clientHeight || 0,
      containerW: previewContainerRef.current.clientWidth,
      containerH: previewContainerRef.current.clientHeight,
    });
    setMagnifier({ x, y, show: true });
  };

  const handleMouseLeave = () => {
    setMagnifier(prev => ({ ...prev, show: false }));
  };

  const mosaicSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Photo Mosaic Generator - ImagePlumber',
    'applicationCategory': 'MultimediaApplication',
    'operatingSystem': 'Web Browser',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    },
    'description': 'Transform any photo into a stunning mosaic made of smaller tile images, entirely in your browser. Upload custom tile photos, adjust grid resolution, color tinting, and overlay transparency.',
    'featureList': [
      'Automatic color-matching grid placement',
      'Support for custom tile folder uploads',
      'Color blending and original overlay settings',
      'High-resolution offline rendering'
    ]
  };

  return (
    <div className="w-full">
      <SEO 
        title="Free Photo Mosaic Generator - Easymoza Alternative" 
        description="Reconstruct target images from thousands of small photo tiles locally. A free alternative to Easymoza and online mosaic generators." 
        keywords="photo mosaic generator, mosaic maker, photo mosaic, image mosaic maker, create photo mosaic online, tile mosaic, picture mosaic, mosaic art maker, photomosaic creator, free mosaic generator, image from images, Easymoza alternative, Picture Mosaics alternative, generate mosaic offline"
        schema={mosaicSchema}
      />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Photomosaic Engine • 🔒 100% Client-Side Private</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mt-3 mb-2 tracking-tight">
            Photo Mosaic Generator
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Rebuild any image out of hundreds of small photos using rapid downscaling matching math.
          </p>
        </div>

        {!targetFile ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
            <div className="md:col-span-7 flex flex-col justify-center">
              <DropZone 
                onFilesSelected={handleTargetSelected}
                title="Drop main target photo"
                subtitle="This image will serve as the mosaic template"
              />
            </div>
            <div className="md:col-span-5 flex">
              <div className="premium-bento rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between w-full shadow-sm hover:border-indigo-350 dark:hover:border-indigo-700 transition-all duration-300">
                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/30 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 px-2 py-0.5 rounded uppercase tracking-wider inline-block">
                    Local Processing
                  </div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                    How Photo Mosaics Work
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    Upload a main template image and a batch of source tile photos. The system slices the template into a micro-grid, maps each grid cell to the closest matching tile by color distance, and creates a high-fidelity mosaic image locally.
                  </p>
                </div>

                <DemoPreview
                  toolId="mosaic"
                  alt="Photo Mosaic Preview"
                />

                <div className="bg-white/70 dark:bg-slate-800/60 border border-slate-100/70 dark:border-slate-700/60 rounded-2xl p-4 space-y-3 shadow-sm">
                  <div className="flex items-start gap-2.5 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <span>
                      Don't have enough images for tiles? We automatically include a 16-color solid fallback palette to build beautiful mock grids right away!
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
            {/* Left Controls Card */}
            <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start order-2 lg:order-1">
              <div className="glass-card p-5 sm:p-6 rounded-3xl space-y-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none">
                <h2 className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2 text-sm">
                  <Settings className="w-4 h-4 text-indigo-500" />
                  Generator Settings
                </h2>

                {/* 1-Tap Quick Style Presets */}
                <div className="space-y-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest block">
                    Mosaic Presets
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { label: '⚡ Fast Preview', cols: 35, overlay: 30, tint: 25, variety: 40 },
                      { label: '✨ Balanced Art', cols: 50, overlay: 25, tint: 35, variety: 50 },
                      { label: '🎨 High Detail', cols: 80, overlay: 15, tint: 45, variety: 65 },
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setGridCols(preset.cols);
                          setOverlayOpacity(preset.overlay);
                          setTileTint(preset.tint);
                          setVarietyLevel(preset.variety);
                        }}
                        className="py-2 px-1 rounded-xl text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 border border-slate-200/60 dark:border-slate-700/60 transition cursor-pointer active:scale-95 text-center truncate"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid Density with Steppers */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest block">
                      Grid Density (Cols)
                    </label>
                    <div className="flex items-center gap-1.5 font-mono">
                      <button 
                        onClick={() => setGridCols(Math.max(15, gridCols - 5))}
                        className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-xs font-black cursor-pointer active:scale-90 transition text-indigo-600"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 px-2 py-0.5 rounded min-w-[50px] text-center">
                        {gridCols} cols
                      </span>
                      <button 
                        onClick={() => setGridCols(Math.min(100, gridCols + 5))}
                        className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-xs font-black cursor-pointer active:scale-90 transition text-indigo-600"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="100"
                    step="5"
                    value={gridCols}
                    onChange={(e) => setGridCols(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <span className="text-[9px] text-slate-400 font-medium block">
                    Higher values produce detailed mosaics but require more source tile matches.
                  </span>
                </div>

                {/* Aspect Ratio */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest block">
                    Tile Shape (Aspect Ratio)
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => setCellRatio(1)}
                      className={`py-2 px-1 text-[10px] font-bold border rounded-xl transition-all cursor-pointer active:scale-95 ${
                        cellRatio === 1
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
                      }`}
                    >
                      Square 1:1
                    </button>
                    <button
                      onClick={() => setCellRatio(1.33)}
                      className={`py-2 px-1 text-[10px] font-bold border rounded-xl transition-all cursor-pointer active:scale-95 ${
                        cellRatio === 1.33
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
                      }`}
                    >
                      Landscape 4:3
                    </button>
                    <button
                      onClick={() => setCellRatio(0.75)}
                      className={`py-2 px-1 text-[10px] font-bold border rounded-xl transition-all cursor-pointer active:scale-95 ${
                        cellRatio === 0.75
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
                      }`}
                    >
                      Portrait 3:4
                    </button>
                  </div>
                </div>

                {/* Repetition variety slider with Steppers */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest block">
                      Tile Variety (De-duplication)
                    </label>
                    <div className="flex items-center gap-1.5 font-mono">
                      <button 
                        onClick={() => setVarietyLevel(Math.max(0, varietyLevel - 5))}
                        className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-xs font-black cursor-pointer active:scale-90 transition text-indigo-600"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 px-2 py-0.5 rounded min-w-[40px] text-center">
                        {varietyLevel}%
                      </span>
                      <button 
                        onClick={() => setVarietyLevel(Math.min(100, varietyLevel + 5))}
                        className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-xs font-black cursor-pointer active:scale-90 transition text-indigo-600"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={varietyLevel}
                    onChange={(e) => setVarietyLevel(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <span className="text-[9px] text-slate-400 font-medium block">
                    Higher values penalize repeating the same photos side-by-side, maximizing tile diversity.
                  </span>
                </div>

                {/* Color Tinting Slider with Steppers */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest block">
                      Tile Color Tinting
                    </label>
                    <div className="flex items-center gap-1.5 font-mono">
                      <button 
                        onClick={() => setTileTint(Math.max(0, tileTint - 5))}
                        className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-xs font-black cursor-pointer active:scale-90 transition text-indigo-600"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 px-2 py-0.5 rounded min-w-[40px] text-center">
                        {tileTint}%
                      </span>
                      <button 
                        onClick={() => setTileTint(Math.min(100, tileTint + 5))}
                        className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-xs font-black cursor-pointer active:scale-90 transition text-indigo-600"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={tileTint}
                    onChange={(e) => setTileTint(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <span className="text-[9px] text-slate-400 font-medium block">
                    Tint tiles toward the cell's target color to blend the composite smoothly.
                  </span>
                </div>

                {/* Overlay Blend Slider with Steppers */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest block">
                      Original Image Overlay
                    </label>
                    <div className="flex items-center gap-1.5 font-mono">
                      <button 
                        onClick={() => setOverlayOpacity(Math.max(0, overlayOpacity - 5))}
                        className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-xs font-black cursor-pointer active:scale-90 transition text-indigo-600"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 px-2 py-0.5 rounded min-w-[40px] text-center">
                        {overlayOpacity}%
                      </span>
                      <button 
                        onClick={() => setOverlayOpacity(Math.min(100, overlayOpacity + 5))}
                        className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-xs font-black cursor-pointer active:scale-90 transition text-indigo-600"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={overlayOpacity}
                    onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <span className="text-[9px] text-slate-400 font-medium block">
                    Superimpose original image transparently to preserve crisp details.
                  </span>
                </div>

                {/* Tile Settings */}
                <div className="space-y-3 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/60 rounded-2xl p-4 shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      Fallback Solid Colors
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={useDummyTiles}
                        onChange={(e) => setUseDummyTiles(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                  <span className="text-[9px] text-slate-400 font-medium block leading-normal">
                    Includes solid color blocks in the tile matching pool (recommended if uploading few custom photos).
                  </span>
                </div>

                {/* Export Quality */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest block">
                    Export Print Quality
                  </label>
                  <select
                    value={tileRenderSize}
                    onChange={(e) => setTileRenderSize(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition cursor-pointer shadow-xs"
                  >
                    <option value={30}>Web Standard (~1500px wide, fast)</option>
                    <option value={60}>High Definition HD (~3000px wide, sharp)</option>
                    <option value={120}>Ultra Print-Ready 4K+ (~6000px wide, professional printing)</option>
                  </select>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2.5 pt-2">
                  {tilePoolSize < minTilesRequired && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-xl text-[10px] text-amber-700 dark:text-amber-300 leading-normal font-semibold text-center animate-pulse">
                      ⚠️ Please upload at least {minTilesRequired} tile images to construct a recognizable mosaic (or enable Fallback Solid Colors). Currently: {tilePoolSize}
                    </div>
                  )}

                  <button
                    onClick={generateMosaic}
                    disabled={isGenerateDisabled}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-550 hover:to-indigo-650 disabled:opacity-50 text-[11px] font-bold uppercase tracking-wider text-white rounded-xl shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer border-0"
                  >
                    <Play className="w-4 h-4" />
                    <span>{isProcessing ? 'Processing Mosaic...' : 'Generate Mosaic'}</span>
                  </button>

                  {previewUrl && (
                    <button
                      onClick={handleDownload}
                      className="w-full py-3 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100/80 text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-300 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer border border-indigo-100 dark:border-indigo-800"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download High-Res Mosaic</span>
                    </button>
                  )}

                  <button
                    onClick={handleReset}
                    className="w-full py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Reset Generator</span>
                  </button>
                </div>
              </div>

              {/* Best Results Tips Card */}
              <div className="glass-card p-5 rounded-3xl space-y-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-indigo-500" />
                  Tips for Best Mosaic Results
                </h2>
                <ul className="space-y-2.5 text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 shrink-0 font-bold">1.</span>
                    <span><strong>Upload More Tiles:</strong> For best results, upload 30 to 100+ different images. The larger your tile collection, the less repetition and the more accurate the color matches.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 shrink-0 font-bold">2.</span>
                    <span><strong>Adjust Overlay Blend:</strong> Use <strong>Original Image Overlay (20% - 40%)</strong> to make details like text, eyes, or faces sharp and recognizable in the final composite.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 shrink-0 font-bold">3.</span>
                    <span><strong>Use Color Tinting:</strong> If your tile pool is small, increase <strong>Tile Color Tinting (30% - 50%)</strong>. This subtly tints tiles to match the template, improving consistency.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 shrink-0 font-bold">4.</span>
                    <span><strong>Select Print-Ready Quality:</strong> When downloading to print physically, choose <strong>Ultra Print-Ready 4K+</strong> under Export Print Quality so each miniature tile stays perfectly sharp.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Canvas and Tiles Area */}
            <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
              {/* Target Image preview */}
              <div className="glass-card p-5 rounded-3xl shadow-xs flex flex-col gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Target Template Image</p>
                    <span className="text-[9px] text-slate-400 font-semibold font-mono uppercase">
                      {targetFile.name} ({targetSize ? `${targetSize.width}x${targetSize.height} px` : 'Loading...'})
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded">
                    Main Photo
                  </span>
                </div>

                <div className="w-full flex items-center justify-center bg-slate-50/30 dark:bg-slate-950/50 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 max-h-[300px] overflow-hidden">
                  <img
                    ref={targetImageRef}
                    src={targetUrl}
                    alt="Target Template"
                    onLoad={handleTargetLoad}
                    className="max-w-full max-h-[268px] object-contain rounded-xl select-none shadow-sm"
                  />
                </div>
              </div>

              {/* Custom Tile Pool Upload */}
              <div className="glass-card p-5 rounded-3xl flex flex-col gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Source Tile Images Pool</p>
                    <p className="text-[9px] text-slate-400 font-semibold uppercase leading-tight">
                      {tiles.length} custom tiles loaded
                    </p>
                  </div>
                  {tiles.length > 0 && (
                    <button
                      onClick={clearAllTiles}
                      className="px-2 py-1 text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100/70 border border-red-200 dark:border-red-900 rounded flex items-center gap-1 cursor-pointer transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear Pool</span>
                    </button>
                  )}
                </div>

                <DropZone
                  onFilesSelected={handleTilesSelected}
                  multiple={true}
                  title="Upload source tile images"
                  subtitle="Select multiple photos to construct the mosaic details"
                />

                {/* Loaded tiles list */}
                {tiles.length > 0 && (
                  <div className="space-y-2 mt-2">
                    <span className="text-[9px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest block">
                      Tile Collection (Previews)
                    </span>
                    <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-[148px] overflow-y-auto p-2 bg-slate-50/30 dark:bg-slate-950/50 border border-slate-200/50 dark:border-slate-800 rounded-2xl shadow-inner scrollbar-thin">
                      {tiles.map((t, idx) => (
                        <div key={t.id} className="aspect-square rounded-lg border border-slate-200 dark:border-slate-700 relative group overflow-hidden bg-white dark:bg-slate-800 shadow-xs">
                          <img src={t.url} alt={t.name} className="w-full h-full object-cover" />
                          <button
                            onClick={() => removeTile(idx)}
                            className="absolute inset-0 bg-red-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold border-0"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Progress and Live Mosaic Result Preview */}
              {isProcessing && (
                <div className="glass-card p-6 rounded-3xl flex flex-col items-center gap-4 text-center bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                  <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                  <div className="space-y-1.5 w-full max-w-xs">
                    {tileLoadingProgress > 0 ? (
                      <>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Processing source tile images...</p>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 shadow-inner overflow-hidden border border-slate-200 dark:border-slate-700">
                          <div 
                            className="bg-indigo-600 h-full transition-all duration-300 rounded-full" 
                            style={{ width: `${tileLoadingProgress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{tileLoadingProgress}%</span>
                      </>
                    ) : (
                      <>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Assembling photo mosaic...</p>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 shadow-inner overflow-hidden border border-slate-200 dark:border-slate-700">
                          <div 
                            className="bg-gradient-to-r from-indigo-600 to-indigo-700 h-full transition-all duration-300 rounded-full" 
                            style={{ width: `${renderingProgress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{renderingProgress}%</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {previewUrl && !isProcessing && (
                <div className="glass-card p-5 rounded-3xl flex flex-col gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Mosaic Canvas Frame Output</p>
                      <span className="text-[9px] text-slate-400 font-semibold font-mono uppercase">
                        Hover over the image below to zoom and inspect individual tiles!
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900 px-2 py-0.5 rounded flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                      Completed
                    </span>
                  </div>

                  {/* Interactive zoom lens preview container */}
                  <div 
                    ref={previewContainerRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    className="w-full flex items-center justify-center bg-slate-50/30 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 overflow-hidden relative select-none cursor-zoom-in"
                  >
                    <div className="absolute inset-0 bg-dot-grid opacity-30 pointer-events-none" />
                    
                    {/* Output Image (kept mounted) */}
                    <img
                      src={previewUrl}
                      alt="Mosaic Output Preview"
                      className={`max-w-full max-h-[500px] object-contain rounded-xl shadow-2xl border border-slate-200/60 dark:border-slate-800 relative z-10 ${
                        isComparing ? 'opacity-0' : 'opacity-100'
                      }`}
                    />

                    {/* Hold to Compare Overlay */}
                    {isComparing && (
                      <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none animate-fade-in z-20">
                        <img
                          src={targetUrl}
                          alt="Original Target"
                          className="max-w-full max-h-[500px] object-contain rounded-xl shadow-2xl"
                        />
                        <span className="absolute top-7 left-7 bg-black/80 backdrop-blur-md text-amber-300 border border-amber-500/40 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg">
                          Original Target Photo
                        </span>
                      </div>
                    )}

                    {/* Hold to Compare Live Button */}
                    <button
                      onMouseDown={(e) => { e.preventDefault(); setIsComparing(true); }}
                      onMouseUp={() => setIsComparing(false)}
                      onMouseLeave={() => setIsComparing(false)}
                      onTouchStart={(e) => { e.preventDefault(); setIsComparing(true); }}
                      onTouchEnd={(e) => { e.preventDefault(); setIsComparing(false); }}
                      onTouchCancel={() => setIsComparing(false)}
                      onContextMenu={(e) => e.preventDefault()}
                      className={`absolute top-4 right-4 px-2.5 py-1 rounded-xl text-[10px] font-bold border transition flex items-center gap-1 cursor-pointer select-none backdrop-blur-md shadow-sm active:scale-95 z-30 ${
                        isComparing 
                          ? 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-400/40' 
                          : 'bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isComparing ? 'Original' : 'Hold to Compare'}</span>
                    </button>

                    {/* Magnifier Lens */}
                    {magnifier.show && !isComparing && (
                      <div
                        className="absolute pointer-events-none w-32 h-32 rounded-full border-2 border-white shadow-2xl overflow-hidden z-30"
                        style={{
                          left: `${magnifier.x - 64}px`,
                          top: `${magnifier.y - 64}px`,
                          backgroundImage: `url(${previewUrl})`,
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: `${
                            magnifierDims.imgW * 3
                          }px ${
                            magnifierDims.imgH * 3
                          }px`,
                          backgroundPosition: `${
                            magnifierDims.imgW
                              ? -(((magnifier.x - (magnifierDims.containerW - magnifierDims.imgW) / 2) * 3) - 64)
                              : 0
                          }px ${
                            magnifierDims.imgH
                              ? -(((magnifier.y - (magnifierDims.containerH - magnifierDims.imgH) / 2) * 3) - 64)
                              : 0
                          }px`,
                          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 0 10px rgba(0,0,0,0.2)'
                        }}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Floating Mobile Bottom Action Dock */}
        {previewUrl && (
          <div className="fixed bottom-4 left-4 right-4 sm:hidden z-30 flex items-center justify-between p-2.5 bg-slate-900/90 dark:bg-slate-850/95 text-white rounded-2xl backdrop-blur-xl shadow-2xl border border-white/10 animate-fade-in">
            <button
              onClick={() => {
                previewContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="py-2 px-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
            >
              <Eye className="w-4 h-4 text-indigo-400" />
              <span>Canvas</span>
            </button>

            <button
              onClick={handleDownload}
              className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
            >
              <Download className="w-4 h-4" />
              <span>Download Mosaic</span>
            </button>
          </div>
        )}

        <div className="mt-16 border-t border-slate-200/60 dark:border-slate-800 pt-12">
          <ToolGuide
            toolName="Photo Mosaic Generator"
            introText="Construct intricate mosaics matching a single master image using thousands of small photography tiles. Upload custom collections or use our solid color fallback pool."
            competitorComparison={{
              alternatives: ['Easymoza', 'Picture Mosaics', 'Mosaically'],
              benefit: 'Traditional mosaic creators require you to upload hundreds of personal photographs to their servers, and limit high-res downloads behind expensive paywalls. ImagePlumber runs image segment averaging locally in JS memory. Save high-resolution mosaics without any cloud uploads.'
            }}
            steps={[
              {
                title: 'Upload Main Image',
                description: 'Select the high-contrast target image you want to reconstruct.'
              },
              {
                title: 'Upload Source Tiles',
                description: 'Select multiple photos to construct the details of your mosaic template.'
              },
              {
                title: 'Adjust Settings & Generate',
                description: 'Customize grid columns, de-duplication variety, color tinting, and download in print quality.'
              }
            ]}
            features={[
              'Perceptual color matching using the redmean algorithm for realistic mosaics.',
              'Tile variety controls (anti-repetition penalty) to prevent identical duplicate grids.',
              'No-distortion center cropping fits portrait and landscape photos automatically.',
              'Interactive zoom lens to inspect individual miniature photos in real-time.',
              'Ultra HD 4K+ print-ready upscaler runs entirely in browser memory.'
            ]}
            faq={[
              {
                q: 'How many tile photos should I upload?',
                a: 'We recommend uploading between 30 and 100+ photos. The larger your tile collection, the less repetition and the more realistic your mosaic will look.'
              },
              {
                q: 'Can I print these generated mosaics?',
                a: 'Absolutely! Choose the Ultra Print-Ready 4K+ setting. This scales each mini tile to 120px wide, resulting in a high-resolution file suitable for physical print shops.'
              },
              {
                q: 'Are my pictures uploaded to any servers?',
                a: 'No. Both the target template and your source tiles are processed entirely locally in your browser memory. Your privacy is 100% guaranteed.'
              }
            ]}
          />
        </div>
      </div>
    </div>
  );
};
