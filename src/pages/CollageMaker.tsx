import React, { useState, useEffect, useRef } from 'react';
import { Download, RefreshCw, Plus, Trash2, Sliders, Crop, ShieldAlert } from 'lucide-react';
import { DropZone } from '../components/DropZone';
import { SEO } from '../components/SEO';

interface CollageImage {
  id: string;
  file: File;
  url: string;
}

interface SlotRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const CollageMaker: React.FC = () => {
  const [images, setImages] = useState<CollageImage[]>([]);
  const [layoutId, setLayoutId] = useState<string>('2-cols');
  const [aspectRatio, setAspectRatio] = useState<number>(1); // 1 = 1:1, 0.75 = 3:4, 1.33 = 4:3
  const [spacing, setSpacing] = useState<number>(10);
  const [borderWidth, setBorderWidth] = useState<number>(0);
  const [borderColor, setBorderColor] = useState<string>('#ffffff');
  const [borderRadius, setBorderRadius] = useState<number>(0);
  const [canvasUrl, setCanvasUrl] = useState<string>('');
  const [isAssembling, setIsAssembling] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const layouts = [
    { id: '2-cols', name: '2 Columns', maxImages: 2 },
    { id: '2-rows', name: '2 Rows', maxImages: 2 },
    { id: '3-grid-l', name: '3 Grid (Left Focus)', maxImages: 3 },
    { id: '4-grid', name: '4 Grid (2x2)', maxImages: 4 },
  ];

  const aspectRatios = [
    { label: 'Square (1:1)', value: 1 },
    { label: 'Portrait (3:4)', value: 3 / 4 },
    { label: 'Landscape (4:3)', value: 4 / 3 },
  ];

  const handleFilesSelected = (files: File[]) => {
    const newImages = files.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      url: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages].slice(0, 4)); // Cap at 4 for MVP
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((img) => img.id !== id);
    });
  };

  // Helper to draw rounded rectangle on canvas
  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  // Draw collage logic
  const drawCollage = () => {
    if (images.length === 0) return;
    setIsAssembling(true);

    const canvasWidth = 1200;
    const canvasHeight = 1200 / aspectRatio;

    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsAssembling(false);
      return;
    }

    // Background color of collage (matching spacing color)
    ctx.fillStyle = '#ffffff'; // Light backdrop
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Calculate slots based on layout
    const slots: SlotRect[] = [];
    const pad = spacing;

    if (layoutId === '2-cols') {
      const w = (canvasWidth - pad * 3) / 2;
      const h = canvasHeight - pad * 2;
      slots.push({ x: pad, y: pad, w, h });
      slots.push({ x: pad * 2 + w, y: pad, w, h });
    } else if (layoutId === '2-rows') {
      const w = canvasWidth - pad * 2;
      const h = (canvasHeight - pad * 3) / 2;
      slots.push({ x: pad, y: pad, w, h });
      slots.push({ x: pad, y: pad * 2 + h, w, h });
    } else if (layoutId === '3-grid-l') {
      const w1 = (canvasWidth - pad * 3) * 0.6;
      const w2 = (canvasWidth - pad * 3) * 0.4;
      const h1 = canvasHeight - pad * 2;
      const h2 = (canvasHeight - pad * 3) / 2;
      slots.push({ x: pad, y: pad, w: w1, h: h1 });
      slots.push({ x: pad * 2 + w1, y: pad, w: w2, h: h2 });
      slots.push({ x: pad * 2 + w1, y: pad * 2 + h2, w: w2, h: h2 });
    } else {
      // 4 grid (2x2)
      const w = (canvasWidth - pad * 3) / 2;
      const h = (canvasHeight - pad * 3) / 2;
      slots.push({ x: pad, y: pad, w, h });
      slots.push({ x: pad * 2 + w, y: pad, w, h });
      slots.push({ x: pad, y: pad * 2 + h, w, h });
      slots.push({ x: pad * 2 + w, y: pad * 2 + h, w, h });
    }

    // Load and draw images into slots
    const loadPromises = slots.map((slot, index) => {
      return new Promise<void>((resolve) => {
        const collageImg = images[index];
        if (!collageImg) {
          // Draw empty slot
          ctx.fillStyle = '#f1f5f9';
          drawRoundedRect(ctx, slot.x, slot.y, slot.w, slot.h, borderRadius);
          ctx.fill();
          resolve();
          return;
        }

        const img = new Image();
        img.src = collageImg.url;
        img.onload = () => {
          ctx.save();

          // Border offset
          const bWidth = borderWidth;
          const sx = slot.x + bWidth;
          const sy = slot.y + bWidth;
          const sw = slot.w - bWidth * 2;
          const sh = slot.h - bWidth * 2;

          // Draw Border Outline
          if (bWidth > 0) {
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = bWidth;
            drawRoundedRect(ctx, slot.x + bWidth/2, slot.y + bWidth/2, slot.w - bWidth, slot.h - bWidth, borderRadius);
            ctx.stroke();
          }

          // Clip image to rounded rect of slot
          drawRoundedRect(ctx, sx, sy, sw, sh, Math.max(0, borderRadius - bWidth));
          ctx.clip();

          // Calculate aspect cover drawing dimensions
          const imgRatio = img.naturalWidth / img.naturalHeight;
          const slotRatio = sw / sh;

          let dx, dy, dw, dh;
          if (imgRatio > slotRatio) {
            // Image is wider than slot: scale height, clip sides
            dh = sh;
            dw = sh * imgRatio;
            dx = sx - (dw - sw) / 2;
            dy = sy;
          } else {
            // Image is taller than slot: scale width, clip top/bottom
            dw = sw;
            dh = sw / imgRatio;
            dx = sx;
            dy = sy - (dh - sh) / 2;
          }

          ctx.drawImage(img, dx, dy, dw, dh);
          ctx.restore();
          resolve();
        };

        img.onerror = () => {
          resolve();
        };
      });
    });

    Promise.all(loadPromises).then(() => {
      canvas.toBlob((blob) => {
        if (blob) {
          if (canvasUrl) URL.revokeObjectURL(canvasUrl);
          setCanvasUrl(URL.createObjectURL(blob));
        }
        setIsAssembling(false);
      }, 'image/png');
    });
  };

  useEffect(() => {
    drawCollage();
  }, [images, layoutId, aspectRatio, spacing, borderWidth, borderColor, borderRadius]);

  const handleDownload = () => {
    if (!canvasUrl) return;
    const link = document.createElement('a');
    link.href = canvasUrl;
    link.download = `collage_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    images.forEach((img) => URL.revokeObjectURL(img.url));
    if (canvasUrl) URL.revokeObjectURL(canvasUrl);
    setImages([]);
    setCanvasUrl('');
    setLayoutId('2-cols');
    setAspectRatio(1);
    setSpacing(10);
    setBorderWidth(0);
    setBorderColor('#ffffff');
    setBorderRadius(0);
  };

  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.url));
      if (canvasUrl) URL.revokeObjectURL(canvasUrl);
    };
  }, []);

  return (
    <div className="w-full">
      <SEO 
        title="Photo Collage Maker" 
        description="Make stunning photo collages locally in your browser. Custom borders, spacings, ratios, and layouts." 
      />

      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-pink-650 uppercase tracking-widest px-2.5 py-1 bg-pink-50 border border-pink-100 rounded-full shadow-sm">
            Creative Tool
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-3 mb-2">Photo Collage Maker</h1>
          <p className="text-sm text-slate-555">Combine multiple files into tailored grids locally. High-resolution PNG output.</p>
        </div>

        {images.length === 0 ? (
          <div className="max-w-2xl mx-auto">
            <DropZone 
              onFilesSelected={handleFilesSelected}
              multiple={true}
              title="Select photos to combine"
              subtitle="Upload 2 to 4 images. JPG, PNG, WebP supported."
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Options pane */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Photo list */}
              <div className="premium-bento p-5 rounded-3xl bg-white space-y-4 shadow-xs">
                <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest flex justify-between items-center">
                  <span>Selected Photos ({images.length}/4)</span>
                  {images.length < 4 && (
                    <label className="text-[10px] text-indigo-650 hover:text-indigo-755 font-bold flex items-center gap-1 cursor-pointer">
                      <Plus className="w-3.5 h-3.5" /> Add
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          if (e.target.files) handleFilesSelected(Array.from(e.target.files));
                        }}
                      />
                    </label>
                  )}
                </h3>

                <div className="grid grid-cols-4 gap-2.5">
                  {images.map((img) => (
                    <div key={img.id} className="relative aspect-square bg-slate-50 border border-slate-200/60 rounded-xl overflow-hidden group shadow-xs">
                      <img src={img.url} alt="Thumbnail" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(img.id)}
                        className="absolute inset-0 bg-red-50/90 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-650 transition duration-200 cursor-pointer"
                        title="Remove photo"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Layout controls */}
              <div className="premium-bento p-6 rounded-3xl bg-white space-y-6 shadow-xs">
                
                <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Sliders className="w-4.5 h-4.5 text-indigo-500" />
                  Collage Styles
                </h3>

                {/* Templates */}
                <div className="space-y-2.5">
                  <label className="text-[10px] font-bold text-slate-455 uppercase tracking-widest block">
                    Grid Template
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {layouts.map((lay) => (
                      <button
                        key={lay.id}
                        onClick={() => setLayoutId(lay.id)}
                        className={`py-2.5 px-3 rounded-xl text-[11px] font-bold border transition-all text-center cursor-pointer active:scale-95 ${
                          layoutId === lay.id
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                            : 'bg-slate-50 border-slate-200/70 text-slate-655 hover:text-slate-900 hover:bg-slate-100/50'
                        }`}
                      >
                        {lay.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aspect Ratio */}
                <div className="space-y-2.5">
                  <label className="text-[10px] font-bold text-slate-455 uppercase tracking-widest flex items-center gap-1.5">
                    <Crop className="w-3.5 h-3.5 text-slate-450" /> Aspect Ratio
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {aspectRatios.map((ratio) => (
                      <button
                        key={ratio.label}
                        onClick={() => setAspectRatio(ratio.value)}
                        className={`py-2 px-2.5 rounded-xl text-[11px] font-bold border transition-all text-center cursor-pointer active:scale-95 ${
                          aspectRatio === ratio.value
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                            : 'bg-slate-50 border-slate-200/70 text-slate-655 hover:text-slate-900 hover:bg-slate-100/50'
                        }`}
                      >
                        {ratio.label.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Spacing & Border Slider */}
                <div className="space-y-4">
                  
                  {/* Spacing */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-455">Grid Spacing</span>
                      <span className="font-mono text-indigo-650 font-bold bg-indigo-50 px-1.5 py-0.5 rounded shadow-xs">{spacing}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={spacing}
                      onChange={(e) => setSpacing(Number(e.target.value))}
                      className="w-full h-1 bg-slate-200 rounded accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  {/* Border Width */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-455">Border Thickness</span>
                      <span className="font-mono text-indigo-650 font-bold bg-indigo-50 px-1.5 py-0.5 rounded shadow-xs">{borderWidth}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={borderWidth}
                      onChange={(e) => setBorderWidth(Number(e.target.value))}
                      className="w-full h-1 bg-slate-200 rounded accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  {/* Corner Radius */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-455">Corner Roundness</span>
                      <span className="font-mono text-indigo-650 font-bold bg-indigo-50 px-1.5 py-0.5 rounded shadow-xs">{borderRadius}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="60"
                      value={borderRadius}
                      onChange={(e) => setBorderRadius(Number(e.target.value))}
                      className="w-full h-1 bg-slate-200 rounded accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  {/* Border Color */}
                  {borderWidth > 0 && (
                    <div className="flex justify-between items-center text-xs font-semibold border-t border-slate-100 pt-3">
                      <span className="text-slate-455">Border Color</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={borderColor}
                          onChange={(e) => setBorderColor(e.target.value)}
                          className="w-7 h-7 rounded-lg border border-slate-200/80 bg-transparent cursor-pointer"
                        />
                        <span className="font-mono text-slate-700 text-[11px] font-bold">{borderColor.toUpperCase()}</span>
                      </div>
                    </div>
                  )}

                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2.5 pt-2">
                  <button
                    onClick={handleDownload}
                    disabled={isAssembling || !canvasUrl}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-655 hover:from-indigo-550 hover:to-purple-550 disabled:opacity-50 text-[11px] font-bold uppercase tracking-wider text-white rounded-xl shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Download Collage
                  </button>

                  <button
                    onClick={handleReset}
                    className="w-full py-3 bg-white hover:bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-655 hover:text-slate-900 border border-slate-200/60 hover:border-slate-350 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reset Collage
                  </button>
                </div>

              </div>
            </div>

            {/* Right Canvas collage output preview */}
            <div className="lg:col-span-8 space-y-4">
              
              <div className="flex justify-between items-center bg-white border border-slate-200/50 rounded-2xl px-4 py-3 shadow-xs">
                <span className="text-xs font-bold text-slate-800">
                  Collage Compilation Output
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  High-res canvas is compiled client-side
                </span>
              </div>

              <div className="w-full border border-slate-200/60 rounded-3xl bg-slate-50 flex items-center justify-center min-h-[400px] shadow-inner p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-dot-grid opacity-30" />
                {isAssembling ? (
                  <div className="flex flex-col items-center gap-2.5 relative z-10">
                    <RefreshCw className="w-8 h-8 text-indigo-650 animate-spin" />
                    <span className="text-xs font-bold text-slate-600 animate-pulse">Assembling collage...</span>
                  </div>
                ) : (
                  canvasUrl && (
                    <img
                      src={canvasUrl}
                      alt="Collage Preview"
                      className="max-w-full max-h-[600px] object-contain rounded-2xl shadow-2xl border border-slate-200/50 relative z-10 animate-float"
                    />
                  )
                )}
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-505 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 shadow-xs font-medium">
                <ShieldAlert className="w-4 h-4 text-pink-600 shrink-0" />
                <span>
                  Collage compiler runs locally inside your browser sandbox. Images are never uploaded to any remote web server.
                </span>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
