import React, { useState, useEffect, useRef } from 'react';
import { Download, RefreshCw, Settings, Info } from 'lucide-react';
import aspectResizerGif from '../assets/aspect_resizer_feature.gif';
import { DropZone } from '../components/DropZone';
import { SEO } from '../components/SEO';

interface Preset {
  id: string;
  name: string;
  width: number;
  height: number;
  ratioText: string;
}

export const AspectResizer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  
  // Settings
  const [presetId, setPresetId] = useState<string>('youtube-thumb');
  const [fitStyle, setFitStyle] = useState<'cover' | 'contain'>('contain');
  const [blurRadius, setBlurRadius] = useState<number>(20); // 0-40px
  
  const [isAssembling, setIsAssembling] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const presets: Preset[] = [
    { id: 'youtube-thumb', name: 'YouTube Thumbnail', width: 1280, height: 720, ratioText: '16:9' },
    { id: 'insta-square', name: 'Instagram Square', width: 1080, height: 1080, ratioText: '1:1' },
    { id: 'insta-story', name: 'Instagram Story/Reel', width: 1080, height: 1920, ratioText: '9:16' },
    { id: 'twitter-header', name: 'Twitter Header', width: 1500, height: 500, ratioText: '3:1' },
    { id: 'facebook-cover', name: 'Facebook Cover', width: 820, height: 312, ratioText: '820x312' },
    { id: 'linkedin-banner', name: 'LinkedIn Banner', width: 1584, height: 396, ratioText: '4:1' },
  ];

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      const f = files[0];
      setFile(f);
      setImageUrl(URL.createObjectURL(f));
    }
  };

  const activePreset = presets.find((p) => p.id === presetId) || presets[0];

  // Canvas drawing & scaling mathematical logic
  useEffect(() => {
    if (!imageUrl) return;

    const resizeImage = () => {
      setIsAssembling(true);
      const img = new Image();
      img.src = imageUrl;
      
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement('canvas');
        const targetW = activePreset.width;
        const targetH = activePreset.height;
        canvas.width = targetW;
        canvas.height = targetH;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setIsAssembling(false);
          return;
        }

        const imgW = img.naturalWidth;
        const imgH = img.naturalHeight;
        
        const targetRatio = targetW / targetH;
        const imgRatio = imgW / imgH;

        if (fitStyle === 'cover') {
          // COVER / ASPECT FILL: Scale up to cover canvas, crop edges
          let sx = 0;
          let sy = 0;
          let sw = imgW;
          let sh = imgH;

          if (imgRatio > targetRatio) {
            // image is wider: crop horizontal edges
            sw = imgH * targetRatio;
            sx = (imgW - sw) / 2;
          } else {
            // image is taller: crop vertical edges
            sh = imgW / targetRatio;
            sy = (imgH - sh) / 2;
          }

          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);
        } else {
          // CONTAIN / ASPECT FIT: Scale down to fit, add blurred padding background
          
          // Draw blurred background stretch-fill
          ctx.save();
          // Draw image stretched to cover background
          let bgSx = 0;
          let bgSy = 0;
          let bgSw = imgW;
          let bgSh = imgH;

          if (imgRatio > targetRatio) {
            bgSh = imgW / targetRatio;
            bgSy = (imgH - bgSh) / 2;
          } else {
            bgSw = imgH * targetRatio;
            bgSx = (imgW - bgSw) / 2;
          }

          ctx.drawImage(img, bgSx, bgSy, bgSw, bgSh, 0, 0, targetW, targetH);
          
          // Apply blur overlay
          if (blurRadius > 0) {
            ctx.filter = `blur(${blurRadius}px)`;
            ctx.drawImage(canvas, 0, 0);
          }
          ctx.restore();

          // Calculate correct contain scaling coordinates
          let dw = targetW;
          let dh = targetH;
          let dx = 0;
          let dy = 0;

          if (imgRatio > targetRatio) {
            // image is wider: fit width, vertical margins
            dh = targetW / imgRatio;
            dy = (targetH - dh) / 2;
          } else {
            // image is taller: fit height, horizontal margins
            dw = targetH * imgRatio;
            dx = (targetW - dw) / 2;
          }

          // Draw sharp image on top
          ctx.drawImage(img, dx, dy, dw, dh);
        }

        // Export preview blob
        canvas.toBlob((blob) => {
          if (blob) {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(URL.createObjectURL(blob));
          }
          setIsAssembling(false);
        }, 'image/png');
      };
    };

    const timer = setTimeout(resizeImage, 250); // debounce canvas render
    return () => clearTimeout(timer);
  }, [imageUrl, presetId, fitStyle, blurRadius]);

  const handleDownload = () => {
    if (!previewUrl || !file) return;
    const ext = file.name.substring(file.name.lastIndexOf('.'));
    const origName = file.name.substring(0, file.name.lastIndexOf('.'));
    
    const link = document.createElement('a');
    link.href = previewUrl;
    link.download = `${origName}_resized_${presetId}${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setImageUrl('');
    setPreviewUrl('');
    setPresetId('youtube-thumb');
    setFitStyle('contain');
    setBlurRadius(20);
  };

  const imageUrlRef = useRef(imageUrl);
  imageUrlRef.current = imageUrl;
  const previewUrlRef = useRef(previewUrl);
  previewUrlRef.current = previewUrl;

  useEffect(() => {
    return () => {
      if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current);
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  return (
    <div className="w-full">
      <SEO 
        title="Offline Preset Aspect Ratio & Social Banner Resizer" 
        description="Fit and resize photos to Twitter headers, YouTube thumbnails, or Instagram stories locally. Custom aspect fill or blur padding fit modes." 
      />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-amber-650 uppercase tracking-widest px-2.5 py-1 bg-amber-50 border border-amber-100 rounded-full shadow-sm">
            Scale Utility
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-3 mb-2">Aspect Ratio Resizer</h1>
          <p className="text-sm text-slate-500">Refit photos to target crop grids and social templates with beautiful local canvas blur-fit overrides.</p>
        </div>

        {!file ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
            <div className="md:col-span-7 flex flex-col justify-center">
              <DropZone 
                onFilesSelected={handleFilesSelected}
                title="Drop image to fit and resize"
                subtitle="Supports JPG, PNG, WebP up to 40MB"
              />
            </div>
            <div className="md:col-span-5 flex">
              <div className="premium-bento rounded-3xl p-6 bg-white border border-slate-200/50 flex flex-col justify-between w-full shadow-sm hover:border-amber-300 transition-all duration-300">
                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-amber-650 bg-amber-50/50 border border-amber-100/60 px-2 py-0.5 rounded uppercase tracking-wider inline-block">Demo Preview</div>
                  <h3 className="text-base font-extrabold text-slate-900">How Aspect Resizer Works</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Select a social preset (YouTube, Instagram, Twitter) and choose between aspect fill or blur-padding fit. The canvas resizes your image client-side in milliseconds.
                  </p>
                </div>
                <div className="my-5 rounded-2xl overflow-hidden aspect-[4/3] border border-slate-150 shadow-xs relative pointer-events-none select-none">
                  <img src={aspectResizerGif} alt="Aspect Resizer Demo" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
            
            {/* Left Options card */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="premium-bento p-6 rounded-3xl bg-white space-y-6 shadow-xs">
                <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Settings className="w-4.5 h-4.5 text-indigo-500" />
                  Format Options
                </h3>

                {/* Preset Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-455 uppercase tracking-widest block">
                    Target Social Preset
                  </label>
                  <select
                    value={presetId}
                    onChange={(e) => setPresetId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                  >
                    {presets.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.ratioText})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fit Mode */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">
                    Fit Layout Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setFitStyle('contain')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        fitStyle === 'contain'
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                          : 'bg-slate-50 border-slate-200/70 text-slate-655 hover:text-slate-900'
                      }`}
                    >
                      Blur Padding Fit
                    </button>
                    <button
                      onClick={() => setFitStyle('cover')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        fitStyle === 'cover'
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                          : 'bg-slate-50 border-slate-200/70 text-slate-655 hover:text-slate-900'
                      }`}
                    >
                      Aspect Fill Crop
                    </button>
                  </div>
                </div>

                {/* Blur Radius Slider (only for contain) */}
                {fitStyle === 'contain' && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-slate-455 uppercase tracking-widest">
                        Padding Blur Radius
                      </label>
                      <span className="text-[10px] font-bold text-indigo-650 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded shadow-xs">
                        {blurRadius}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      value={blurRadius}
                      onChange={(e) => setBlurRadius(Number(e.target.value))}
                      className="w-full h-1 bg-slate-200 rounded accent-indigo-600 cursor-pointer"
                    />
                  </div>
                )}

                {/* Presets Details Info Card */}
                <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4.5 space-y-3.5 shadow-xs">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-455">Target Size:</span>
                    <span className="font-mono text-slate-800 font-bold">{activePreset.width} × {activePreset.height} px</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-455">Aspect Ratio:</span>
                    <span className="font-mono text-indigo-655 font-bold">{activePreset.ratioText}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2.5 pt-2">
                  <button
                    onClick={handleDownload}
                    disabled={isAssembling || !previewUrl}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-655 hover:from-indigo-550 hover:to-purple-550 disabled:opacity-50 text-[11px] font-bold uppercase tracking-wider text-white rounded-xl shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Download Resized Image
                  </button>

                  <button
                    onClick={handleReset}
                    className="w-full py-3 bg-white hover:bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-655 hover:text-slate-900 border border-slate-200/60 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reset Editor
                  </button>
                </div>

              </div>
            </div>

            {/* Right Canvas preview column */}
            <div className="lg:col-span-8 space-y-4">
              
              <div className="flex justify-between items-center bg-white border border-slate-200/50 rounded-2xl px-4 py-3 shadow-xs">
                <span className="text-xs font-bold text-slate-800">
                  Resized Canvas Frame Output
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  WASM rescalings compiled in-memory
                </span>
              </div>

              {/* Viewport */}
              <div className="w-full border border-slate-200 rounded-3xl bg-slate-50 flex items-center justify-center min-h-[400px] shadow-inner p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-dot-grid opacity-30" />

                {isAssembling ? (
                  <div className="flex flex-col items-center gap-2.5 relative z-10">
                    <RefreshCw className="w-8 h-8 text-indigo-650 animate-spin" />
                    <span className="text-xs font-bold text-slate-600 animate-pulse">Rescaling images...</span>
                  </div>
                ) : (
                  previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Resized Preview"
                      className="max-w-full max-h-[600px] object-contain rounded-2xl shadow-2xl border border-slate-200/60 relative z-10 animate-float"
                    />
                  )
                )}
              </div>

              <div className="p-3.5 bg-indigo-50/50 border border-indigo-100/60 rounded-2xl flex items-start gap-2.5 text-[10px] text-slate-550 leading-normal font-medium">
                <Info className="w-4 h-4 text-indigo-650 shrink-0 mt-0.5 animate-pulse" />
                <span>
                  The blur background contain option automatically uses standard box filters to blur background sides seamlessly when fitting portrait images into wide banners.
                </span>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
