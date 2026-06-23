import React, { useState, useEffect, useRef } from 'react';
import { Download, RefreshCw, Settings, Info, Play, Trash2 } from 'lucide-react';
import { DropZone } from '../components/DropZone';
import { SEO } from '../components/SEO';
import { ToolGuide } from '../components/ToolGuide';
import mosaicImg from '../assets/mosaic_feature.gif';

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
  const [gridCols, setGridCols] = useState<number>(40);
  const [cellRatio, setCellRatio] = useState<number>(1); // 1 = 1:1, 1.33 = 4:3, 0.75 = 3:4
  const [overlayOpacity, setOverlayOpacity] = useState<number>(30); // 0-100% original overlay
  const [tileTint, setTileTint] = useState<number>(40); // 0-100% average color tinting
  const [useDummyTiles, setUseDummyTiles] = useState<boolean>(true); // Use solid fallback colors if no tiles uploaded
  const [tileRenderSize, setTileRenderSize] = useState<number>(60); // 30, 60, or 120 px
  
  // Processing states
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [tileLoadingProgress, setTileLoadingProgress] = useState<number>(0);
  const [renderingProgress, setRenderingProgress] = useState<number>(0);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  
  const minTilesRequired = 5;
  const tilePoolSize = tiles.length > 0 ? tiles.length : (useDummyTiles ? 16 : 0);
  const isGenerateDisabled = isProcessing || tilePoolSize < minTilesRequired;
  
  const targetImageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const targetUrlRef = useRef(targetUrl);
  targetUrlRef.current = targetUrl;
  const previewUrlRef = useRef(previewUrl);
  previewUrlRef.current = previewUrl;
  const tilesRef = useRef(tiles);
  tilesRef.current = tiles;

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

  // Helper to load HTMLImageElement from URL
  const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Image failed to load'));
      img.src = url;
    });
  };

  // Extract average color using offscreen 1x1 canvas
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

  // Asynchronously process uploaded tile files in batches to prevent UI freeze
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
        } catch (e) {
          URL.revokeObjectURL(url);
          return null;
        }
      });

      const results = await Promise.all(promises);
      results.forEach((t) => {
        if (t) newTiles.push(t);
      });

      setTileLoadingProgress(Math.round(((i + batch.length) / files.length) * 100));
      // Small pause to yield main thread and update progress bar
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

  // Helper to generate solid color fallback tiles (used if no custom tiles uploaded)
  const generateSolidColorTiles = (): TileImage[] => {
    const dummyTiles: TileImage[] = [];
    const colors = [
      { r: 239, g: 68, b: 68 }, // red-500
      { r: 249, g: 115, b: 22 }, // orange-500
      { r: 245, g: 158, b: 11 }, // amber-500
      { r: 132, g: 204, b: 22 }, // lime-500
      { r: 34, g: 197, b: 94 }, // green-500
      { r: 16, g: 185, b: 129 }, // emerald-500
      { r: 20, g: 184, b: 166 }, // teal-500
      { r: 6, g: 182, b: 212 }, // cyan-500
      { r: 59, g: 130, b: 246 }, // blue-500
      { r: 99, g: 102, b: 241 }, // indigo-500
      { r: 139, g: 92, b: 246 }, // violet-500
      { r: 168, g: 85, b: 247 }, // purple-500
      { r: 236, g: 72, b: 153 }, // pink-500
      { r: 244, g: 63, b: 94 }, // rose-500
      { r: 30, g: 41, b: 59 }, // slate-800
      { r: 248, g: 250, b: 252 }, // slate-50
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

  // Color distance matching
  const findClosestTile = (cellColor: { r: number; g: number; b: number }, pool: TileImage[]): TileImage => {
    let minDistance = Infinity;
    let closest = pool[0];

    for (let i = 0; i < pool.length; i++) {
      const tile = pool[i];
      const distance = 
        Math.pow(tile.avgColor.r - cellColor.r, 2) +
        Math.pow(tile.avgColor.g - cellColor.g, 2) +
        Math.pow(tile.avgColor.b - cellColor.b, 2);
      
      if (distance < minDistance) {
        minDistance = distance;
        closest = tile;
      }
    }
    return closest;
  };

  // Main generation loop
  const generateMosaic = async () => {
    if (!targetUrl || !targetSize || !targetImageRef.current) return;
    
    const tilePool = tiles.length > 0 ? tiles : (useDummyTiles ? generateSolidColorTiles() : []);
    if (tilePool.length < minTilesRequired) {
      alert(`Please upload at least ${minTilesRequired} tile images to construct a recognizable mosaic (or enable solid color fallbacks).`);
      return;
    }

    setIsProcessing(true);
    setRenderingProgress(0);

    const targetW = targetSize.width;
    const targetH = targetSize.height;

    // Calculate grid dimensions
    const cols = gridCols;
    const cellW = targetW / cols;
    const cellH = cellW / cellRatio;
    const rows = Math.round(targetH / cellH);

    // Downscale target image to get cell averages
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

    // Setup output canvas dimensions
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

    // Process rendering in chunks to keep browser responsive
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

          const matchedTile = findClosestTile(cellColor, tilePool);
          const dx = x * outputTileW;
          const dy = y * outputTileH;

          // Draw tile
          outputCtx.drawImage(matchedTile.imgElement, dx, dy, outputTileW, outputTileH);

          // Apply average color tinting
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
      // Yield thread to update layout
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }

    // Draw original target overlay
    if (overlayOpacity > 0) {
      outputCtx.save();
      outputCtx.globalAlpha = overlayOpacity / 100;
      outputCtx.drawImage(targetImageRef.current, 0, 0, outputW, outputH);
      outputCtx.restore();
    }

    // Export to preview
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
    const origName = targetFile.name.substring(0, targetFile.name.lastIndexOf('.'));
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
    setGridCols(40);
    setCellRatio(1);
    setOverlayOpacity(30);
    setTileTint(40);
    setUseDummyTiles(true);
    setIsProcessing(false);
  };

  const mosaicSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Photo Mosaic Generator - ImageGiri',
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
        canonicalUrl="https://imagegiri.com/photo-mosaic-generator"
        schema={mosaicSchema}
      />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-indigo-650 uppercase tracking-widest px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-full shadow-sm">
            Mosaic Engine
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-3 mb-2">Photo Mosaic Generator</h1>
          <p className="text-sm text-slate-500">Rebuild any image out of hundreds of small photos using rapid downscaling matching math.</p>
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
              <div className="premium-bento rounded-3xl p-6 bg-white border border-slate-200/50 flex flex-col justify-between w-full shadow-sm hover:border-indigo-300 transition-all duration-300">
                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-indigo-650 bg-indigo-50/50 border border-indigo-100/60 px-2 py-0.5 rounded uppercase tracking-wider inline-block">Local Processing</div>
                  <h3 className="text-base font-extrabold text-slate-900">How Photo Mosaics Work</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Upload a main template image and a batch of source tile photos. The system slices the template into a micro-grid, maps each grid cell to the closest matching tile by color distance, and creates a high-fidelity mosaic image locally.
                  </p>
                </div>

                {/* Visual Showcase Preview GIF */}
                <div className="my-4 rounded-2xl overflow-hidden border border-slate-200/60 aspect-[4/3] relative select-none shadow-sm bg-slate-50">
                  <img src={mosaicImg} alt="Photo Mosaic Preview" className="w-full h-full object-cover" />
                </div>

                <div className="bg-slate-50 border border-slate-100/70 rounded-2xl p-4 space-y-3 shadow-inner">
                  <div className="flex items-start gap-2.5 text-[10px] text-slate-500 font-medium">
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
            {/* Left Controls Card — sticky on desktop */}
            <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
              <div className="premium-bento p-6 rounded-3xl bg-white space-y-6 shadow-xs">
                <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Settings className="w-4.5 h-4.5 text-indigo-500" />
                  Generator Settings
                </h3>

                {/* Grid Density */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-455 uppercase tracking-widest block">
                      Grid Density (Cols)
                    </label>
                    <span className="text-[10px] font-bold text-indigo-650 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                      {gridCols} columns
                    </span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="100"
                    value={gridCols}
                    onChange={(e) => setGridCols(Number(e.target.value))}
                    className="range-styled w-full"
                    style={{ '--slider-pct': `${((gridCols - 15) / 85) * 100}%` } as React.CSSProperties}
                  />
                  <span className="text-[9px] text-slate-400 font-medium block">
                    Higher values produce detailed mosaics but require more source tile matches.
                  </span>
                </div>

                {/* Aspect Ratio */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-455 uppercase tracking-widest block">
                    Tile Shape (Aspect Ratio)
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => setCellRatio(1)}
                      className={`py-2 px-1 text-[10px] font-bold border rounded-xl transition-all cursor-pointer ${
                        cellRatio === 1
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                          : 'bg-slate-50 border-slate-200 text-slate-655 hover:text-slate-900'
                      }`}
                    >
                      Square 1:1
                    </button>
                    <button
                      onClick={() => setCellRatio(1.33)}
                      className={`py-2 px-1 text-[10px] font-bold border rounded-xl transition-all cursor-pointer ${
                        cellRatio === 1.33
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                          : 'bg-slate-50 border-slate-200 text-slate-655 hover:text-slate-900'
                      }`}
                    >
                      Landscape 4:3
                    </button>
                    <button
                      onClick={() => setCellRatio(0.75)}
                      className={`py-2 px-1 text-[10px] font-bold border rounded-xl transition-all cursor-pointer ${
                        cellRatio === 0.75
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                          : 'bg-slate-50 border-slate-200 text-slate-655 hover:text-slate-900'
                      }`}
                    >
                      Portrait 3:4
                    </button>
                  </div>
                </div>

                {/* Color Tinting Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-455 uppercase tracking-widest block">
                      Tile Color Tinting
                    </label>
                    <span className="text-[10px] font-bold text-indigo-650 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                      {tileTint}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={tileTint}
                    onChange={(e) => setTileTint(Number(e.target.value))}
                    className="range-styled w-full"
                    style={{ '--slider-pct': `${tileTint}%` } as React.CSSProperties}
                  />
                  <span className="text-[9px] text-slate-400 font-medium block">
                    Tint tiles toward the cell's target color to blend the composite smoothly.
                  </span>
                </div>

                {/* Overlay Blend Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-455 uppercase tracking-widest block">
                      Original Image Overlay
                    </label>
                    <span className="text-[10px] font-bold text-indigo-650 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                      {overlayOpacity}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={overlayOpacity}
                    onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                    className="range-styled w-full"
                    style={{ '--slider-pct': `${overlayOpacity}%` } as React.CSSProperties}
                  />
                  <span className="text-[9px] text-slate-400 font-medium block">
                    Superimpose the original image transparently on top to preserve facial details/text.
                  </span>
                </div>

                {/* Tile Settings */}
                <div className="space-y-3 bg-slate-50 border border-slate-200/60 rounded-2xl p-4 shadow-inner">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
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

                {/* Print Quality / Output Tile Size */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-455 uppercase tracking-widest block">
                    Export Print Quality
                  </label>
                  <select
                    value={tileRenderSize}
                    onChange={(e) => setTileRenderSize(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                  >
                    <option value={30}>Web Standard (~1500px wide, fast)</option>
                    <option value={60}>High Definition HD (~3000px wide, sharp)</option>
                    <option value={120}>Ultra Print-Ready 4K+ (~6000px wide, professional printing)</option>
                  </select>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2.5 pt-2">
                  {tilePoolSize < minTilesRequired && (
                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-[10px] text-amber-700 leading-normal font-semibold text-center">
                      ⚠️ Please upload at least {minTilesRequired} tile images to construct a recognizable mosaic (or enable Fallback Solid Colors). Currently: {tilePoolSize}
                    </div>
                  )}

                  <button
                    onClick={generateMosaic}
                    disabled={isGenerateDisabled}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-655 hover:from-indigo-550 hover:to-purple-550 disabled:opacity-50 text-[11px] font-bold uppercase tracking-wider text-white rounded-xl shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4" />
                    {isProcessing ? 'Processing Mosaic...' : 'Generate Mosaic'}
                  </button>

                  {previewUrl && (
                    <button
                      onClick={handleDownload}
                      className="w-full py-3 bg-indigo-50 hover:bg-indigo-100/80 text-[11px] font-bold uppercase tracking-wider text-indigo-650 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer border border-indigo-100"
                    >
                      <Download className="w-4 h-4" />
                      Download High-Res Mosaic
                    </button>
                  )}

                  <button
                    onClick={handleReset}
                    className="w-full py-3 bg-white hover:bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-655 hover:text-slate-900 border border-slate-200/60 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reset Generator
                  </button>
                </div>
              </div>

              {/* Best Results Tips Card */}
              <div className="premium-bento p-5 rounded-3xl bg-slate-50 border border-slate-200/60 space-y-3.5 shadow-sm">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-indigo-650" />
                  Tips for Best Mosaic Results
                </h4>
                <ul className="space-y-2.5 text-[10px] text-slate-550 leading-relaxed font-medium">
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
            <div className="lg:col-span-8 space-y-6">
              {/* Target Image preview */}
              <div className="premium-bento p-5 rounded-3xl bg-white border border-slate-200/50 shadow-xs flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Target Template Image</h4>
                    <span className="text-[9px] text-slate-400 font-semibold font-mono uppercase">
                      {targetFile.name} ({targetSize ? `${targetSize.width}x${targetSize.height} px` : 'Loading...'})
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-455 bg-slate-50 border border-slate-150 px-2 py-0.5 rounded">
                    Main Photo
                  </span>
                </div>

                <div className="w-full flex items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-4 max-h-[300px] overflow-hidden">
                  <img
                    ref={targetImageRef}
                    src={targetUrl}
                    alt="Target Template"
                    onLoad={handleTargetLoad}
                    className="max-w-full max-h-[268px] object-contain rounded-xl select-none"
                  />
                </div>
              </div>

              {/* Custom Tile Pool Upload */}
              <div className="premium-bento p-5 rounded-3xl bg-white border border-slate-200/50 shadow-xs flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Source Tile Images Pool</h4>
                    <p className="text-[9px] text-slate-400 font-semibold uppercase leading-tight">
                      {tiles.length} custom tiles loaded
                    </p>
                  </div>
                  {tiles.length > 0 && (
                    <button
                      onClick={clearAllTiles}
                      className="px-2 py-1 text-[10px] font-bold text-red-650 bg-red-50 hover:bg-red-100/70 border border-red-100 rounded flex items-center gap-1 cursor-pointer transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Clear Pool
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
                    <span className="text-[9px] font-bold text-slate-455 uppercase tracking-widest block">
                      Tile Collection (Previews)
                    </span>
                    <div className="grid grid-cols-6 sm:grid-cols-10 gap-2 max-h-[148px] overflow-y-auto p-2 bg-slate-50 border border-slate-200/60 rounded-2xl shadow-inner scrollbar-thin">
                      {tiles.map((t, idx) => (
                        <div key={t.id} className="aspect-square rounded-lg border border-slate-200 relative group overflow-hidden bg-white shadow-xs">
                          <img src={t.url} alt={t.name} className="w-full h-full object-cover" />
                          <button
                            onClick={() => removeTile(idx)}
                            className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold"
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
                <div className="premium-bento p-6 rounded-3xl bg-white border border-slate-200/50 shadow-xs flex flex-col items-center gap-4 text-center">
                  <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                  <div className="space-y-1.5 w-full max-w-xs">
                    {tileLoadingProgress > 0 ? (
                      <>
                        <h4 className="text-xs font-bold text-slate-800">Processing source tile images...</h4>
                        <div className="w-full bg-slate-100 rounded-full h-2 shadow-inner overflow-hidden border border-slate-200">
                          <div 
                            className="bg-indigo-650 h-full transition-all duration-300 rounded-full" 
                            style={{ width: `${tileLoadingProgress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-indigo-650">{tileLoadingProgress}%</span>
                      </>
                    ) : (
                      <>
                        <h4 className="text-xs font-bold text-slate-800">Assembling photo mosaic...</h4>
                        <div className="w-full bg-slate-100 rounded-full h-2 shadow-inner overflow-hidden border border-slate-200">
                          <div 
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 h-full transition-all duration-300 rounded-full" 
                            style={{ width: `${renderingProgress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-purple-650">{renderingProgress}%</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {previewUrl && !isProcessing && (
                <div className="premium-bento p-5 rounded-3xl bg-white border border-slate-200/50 shadow-xs flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Mosaic Canvas Frame Output</h4>
                      <span className="text-[9px] text-slate-400 font-semibold font-mono uppercase">
                        PNG Generated locally in-memory
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-655 bg-emerald-50 border border-emerald-150 px-2 py-0.5 rounded animate-pulse">
                      Completed
                    </span>
                  </div>

                  <div className="w-full flex items-center justify-center bg-slate-50 border border-slate-200 rounded-2xl p-4 overflow-hidden relative">
                    <div className="absolute inset-0 bg-dot-grid opacity-30 pointer-events-none" />
                    <img
                      src={previewUrl}
                      alt="Mosaic Output Preview"
                      className="max-w-full max-h-[500px] object-contain rounded-xl shadow-2xl border border-slate-200/60 relative z-10 animate-float"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        <ToolGuide
          toolName="Photo Mosaic Generator"
          introText="Construct intricate mosaics matching a single master image using thousands of small photography tiles. Upload custom collections or use our solid color fallback pool."
          competitorComparison={{
            alternatives: ['Easymoza', 'Picture Mosaics', 'Mosaically'],
            benefit: 'Traditional mosaic creators require you to upload hundreds of personal photographs to their servers, and limit high-res downloads behind expensive paywalls. ImageGiri runs image segment averaging locally in JS memory. Save high-resolution mosaics without any cloud uploads.'
          }}
          steps={[
            {
              title: 'Upload Main Image',
              description: 'Select the high-contrast target image you want to reconstruct.'
            },
            {
              title: 'Select Tiles Source',
              description: 'Toggle "Use Solid Colors" for a fast fallback pool, or deselect it and upload a directory of your own custom photographs.'
            },
            {
              title: 'Render & Download',
              description: 'Adjust grid column sizes, color tint strength, and source opacity layers. Click "Generate Mosaic" and download the completed canvas.'
            }
          ]}
          features={[
            'On-device color-matching sorting algorithms that run in-browser.',
            'Custom tile loader support: upload folder paths of user photos in bulk.',
            'Solid-color cell fill fallback option for quick mockups and placeholders.',
            'Adjustable blend controls: customize original image overlay and tint levels.',
            'Generates high-resolution layouts without bandwidth consumption.'
          ]}
          faq={[
            {
              q: 'How many tile images should I upload?',
              a: 'For best results with custom tiles, upload a directory containing 50 to 500 different photos so the matching algorithm has a wide color palette to select from.'
            },
            {
              q: 'Does it support folder uploads?',
              a: 'Yes, you can click to select and upload multiple images from a folder at once. They are processed entirely in local browser memory.'
            },
            {
              q: 'Why does generation take a few seconds?',
              a: 'The algorithm must read the average color coordinates of the target image segments and compare them against the color profiles of each uploaded tile to select the best match.'
            }
          ]}
        />

      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
