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
  const [fitStyle, setFitStyle] = useState<'cover' | 'contain' | 'crop'>('contain');
  const [blurRadius, setBlurRadius] = useState<number>(20); // 0-40px
  
  const [isAssembling, setIsAssembling] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Smart Crop settings
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);
  const [crop, setCrop] = useState<{ x: number; y: number; w: number; h: number }>({ x: 0, y: 0, w: 1, h: 1 });
  const [imgDisplayRect, setImgDisplayRect] = useState<{ width: number; height: number; left: number; top: number }>({
    width: 0, height: 0, left: 0, top: 0
  });
  const [dragState, setDragState] = useState<{
    startX: number;
    startY: number;
    startCrop: { x: number; y: number; w: number; h: number };
    action: 'move' | 'resize-tl' | 'resize-tr' | 'resize-bl' | 'resize-br';
  } | null>(null);

  const imageRef = useRef<HTMLImageElement>(null);
  const cropContainerRef = useRef<HTMLDivElement>(null);

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

  const initCropBox = (imgW: number, imgH: number, targetW: number, targetH: number) => {
    const imgRatio = imgW / imgH;
    const targetRatio = targetW / targetH;
    
    let w = 1.0;
    let h = 1.0;
    let x = 0.0;
    let y = 0.0;
    
    if (imgRatio > targetRatio) {
      w = (targetRatio * imgH) / imgW;
      h = 1.0;
      x = (1.0 - w) / 2;
    } else {
      w = 1.0;
      h = (imgW / targetRatio) / imgH;
      y = (1.0 - h) / 2;
    }
    
    setCrop({ x, y, w, h });
  };

  useEffect(() => {
    if (naturalSize) {
      initCropBox(naturalSize.width, naturalSize.height, activePreset.width, activePreset.height);
    }
  }, [presetId, naturalSize?.width, naturalSize?.height]);

  const updateDisplayRect = (imgElement: HTMLImageElement) => {
    setImgDisplayRect({
      width: imgElement.clientWidth,
      height: imgElement.clientHeight,
      left: imgElement.offsetLeft,
      top: imgElement.offsetTop,
    });
  };

  useEffect(() => {
    const handleResize = () => {
      const img = imageRef.current;
      if (img) {
        updateDisplayRect(img);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (fitStyle === 'crop') {
      const timer = setTimeout(() => {
        const img = imageRef.current;
        if (img) {
          updateDisplayRect(img);
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [fitStyle, imageUrl]);

  const handleStart = (clientX: number, clientY: number, action: 'move' | 'resize-tl' | 'resize-tr' | 'resize-bl' | 'resize-br') => {
    setDragState({
      startX: clientX,
      startY: clientY,
      startCrop: { ...crop },
      action,
    });
  };

  const handleMouseDown = (e: React.MouseEvent, action: 'move' | 'resize-tl' | 'resize-tr' | 'resize-bl' | 'resize-br') => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY, action);
  };

  const handleTouchStart = (e: React.TouchEvent, action: 'move' | 'resize-tl' | 'resize-tr' | 'resize-bl' | 'resize-br') => {
    if (e.touches.length > 0) {
      handleStart(e.touches[0].clientX, e.touches[0].clientY, action);
    }
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    updateDisplayRect(img);
  };

  // Smooth dragging via window level listeners
  useEffect(() => {
    if (!dragState || !naturalSize || !imgDisplayRect.width || !imgDisplayRect.height) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragState.startX;
      const dy = e.clientY - dragState.startY;
      
      const rDx = dx / imgDisplayRect.width;
      const rDy = dy / imgDisplayRect.height;
      
      const { startCrop, action } = dragState;
      
      const imgRatio = naturalSize.width / naturalSize.height;
      const targetRatio = activePreset.width / activePreset.height;
      const k = targetRatio / imgRatio;
      
      let newCrop = { ...crop };
      
      if (action === 'move') {
        let newX = startCrop.x + rDx;
        let newY = startCrop.y + rDy;
        
        if (newX < 0) newX = 0;
        if (newY < 0) newY = 0;
        if (newX + startCrop.w > 1) newX = 1 - startCrop.w;
        if (newY + startCrop.h > 1) newY = 1 - startCrop.h;
        
        newCrop = { ...startCrop, x: newX, y: newY };
      } else {
        if (action === 'resize-br') {
          let newW = startCrop.w + rDx;
          if (newW < 0.1) newW = 0.1;
          if (startCrop.x + newW > 1) newW = 1 - startCrop.x;
          
          let newH = newW / k;
          if (startCrop.y + newH > 1) {
            newH = 1 - startCrop.y;
            newW = newH * k;
          }
          newCrop = { ...startCrop, w: newW, h: newH };
        }
        else if (action === 'resize-bl') {
          let newX = startCrop.x + rDx;
          if (newX < 0) newX = 0;
          let newW = startCrop.w + (startCrop.x - newX);
          if (newW < 0.1) {
            newW = 0.1;
            newX = startCrop.x + startCrop.w - 0.1;
          }
          
          let newH = newW / k;
          if (startCrop.y + newH > 1) {
            newH = 1 - startCrop.y;
            newW = newH * k;
            newX = startCrop.x + startCrop.w - newW;
          }
          newCrop = { ...startCrop, x: newX, w: newW, h: newH };
        }
        else if (action === 'resize-tr') {
          let newW = startCrop.w + rDx;
          if (newW < 0.1) newW = 0.1;
          if (startCrop.x + newW > 1) newW = 1 - startCrop.x;
          
          let newH = newW / k;
          let newY = startCrop.y + startCrop.h - newH;
          if (newY < 0) {
            newY = 0;
            newH = startCrop.y + startCrop.h;
            newW = newH * k;
            if (startCrop.x + newW > 1) {
              newW = 1 - startCrop.x;
              newH = newW / k;
              newY = startCrop.y + startCrop.h - newH;
            }
          }
          newCrop = { ...startCrop, y: newY, w: newW, h: newH };
        }
        else if (action === 'resize-tl') {
          let newX = startCrop.x + rDx;
          if (newX < 0) newX = 0;
          let newW = startCrop.w + (startCrop.x - newX);
          if (newW < 0.1) {
            newW = 0.1;
            newX = startCrop.x + startCrop.w - 0.1;
          }
          
          let newH = newW / k;
          let newY = startCrop.y + startCrop.h - newH;
          if (newY < 0) {
            newY = 0;
            newH = startCrop.y + startCrop.h;
            newW = newH * k;
            newX = startCrop.x + startCrop.w - newW;
            if (newX < 0) {
              newX = 0;
              newW = startCrop.x + startCrop.w;
              newH = newW / k;
              newY = startCrop.y + startCrop.h - newH;
            }
          }
          newCrop = { x: newX, y: newY, w: newW, h: newH };
        }
      }
      setCrop(newCrop);
    };

    const handleWindowTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const dx = e.touches[0].clientX - dragState.startX;
        const dy = e.touches[0].clientY - dragState.startY;
        
        const rDx = dx / imgDisplayRect.width;
        const rDy = dy / imgDisplayRect.height;
        
        const { startCrop, action } = dragState;
        
        const imgRatio = naturalSize.width / naturalSize.height;
        const targetRatio = activePreset.width / activePreset.height;
        const k = targetRatio / imgRatio;
        
        let newCrop = { ...crop };
        
        if (action === 'move') {
          let newX = startCrop.x + rDx;
          let newY = startCrop.y + rDy;
          
          if (newX < 0) newX = 0;
          if (newY < 0) newY = 0;
          if (newX + startCrop.w > 1) newX = 1 - startCrop.w;
          if (newY + startCrop.h > 1) newY = 1 - startCrop.h;
          
          newCrop = { ...startCrop, x: newX, y: newY };
        } else {
          if (action === 'resize-br') {
            let newW = startCrop.w + rDx;
            if (newW < 0.1) newW = 0.1;
            if (startCrop.x + newW > 1) newW = 1 - startCrop.x;
            
            let newH = newW / k;
            if (startCrop.y + newH > 1) {
              newH = 1 - startCrop.y;
              newW = newH * k;
            }
            newCrop = { ...startCrop, w: newW, h: newH };
          }
          else if (action === 'resize-bl') {
            let newX = startCrop.x + rDx;
            if (newX < 0) newX = 0;
            let newW = startCrop.w + (startCrop.x - newX);
            if (newW < 0.1) {
              newW = 0.1;
              newX = startCrop.x + startCrop.w - 0.1;
            }
            
            let newH = newW / k;
            if (startCrop.y + newH > 1) {
              newH = 1 - startCrop.y;
              newW = newH * k;
              newX = startCrop.x + startCrop.w - newW;
            }
            newCrop = { ...startCrop, x: newX, w: newW, h: newH };
          }
          else if (action === 'resize-tr') {
            let newW = startCrop.w + rDx;
            if (newW < 0.1) newW = 0.1;
            if (startCrop.x + newW > 1) newW = 1 - startCrop.x;
            
            let newH = newW / k;
            let newY = startCrop.y + startCrop.h - newH;
            if (newY < 0) {
              newY = 0;
              newH = startCrop.y + startCrop.h;
              newW = newH * k;
              if (startCrop.x + newW > 1) {
                newW = 1 - startCrop.x;
                newH = newW / k;
                newY = startCrop.y + startCrop.h - newH;
              }
            }
            newCrop = { ...startCrop, y: newY, w: newW, h: newH };
          }
          else if (action === 'resize-tl') {
            let newX = startCrop.x + rDx;
            if (newX < 0) newX = 0;
            let newW = startCrop.w + (startCrop.x - newX);
            if (newW < 0.1) {
              newW = 0.1;
              newX = startCrop.x + startCrop.w - 0.1;
            }
            
            let newH = newW / k;
            let newY = startCrop.y + startCrop.h - newH;
            if (newY < 0) {
              newY = 0;
              newH = startCrop.y + startCrop.h;
              newW = newH * k;
              newX = startCrop.x + startCrop.w - newW;
              if (newX < 0) {
                newX = 0;
                newW = startCrop.x + startCrop.w;
                newH = newW / k;
                newY = startCrop.y + startCrop.h - newH;
              }
            }
            newCrop = { x: newX, y: newY, w: newW, h: newH };
          }
        }
        setCrop(newCrop);
      }
    };

    const handleWindowMouseUp = () => {
      setDragState(null);
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    window.addEventListener('touchmove', handleWindowTouchMove);
    window.addEventListener('touchend', handleWindowMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
      window.removeEventListener('touchmove', handleWindowTouchMove);
      window.removeEventListener('touchend', handleWindowMouseUp);
    };
  }, [dragState, naturalSize, imgDisplayRect, crop, activePreset]);

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
        
        // Update natural size for crop tracking
        if (!naturalSize || naturalSize.width !== imgW || naturalSize.height !== imgH) {
          setNaturalSize({ width: imgW, height: imgH });
        }
        
        const targetRatio = targetW / targetH;
        const imgRatio = imgW / imgH;

        if (fitStyle === 'cover') {
          // COVER / ASPECT FILL: Scale up to cover canvas, crop edges
          let sx = 0;
          let sy = 0;
          let sw = imgW;
          let sh = imgH;

          if (imgRatio > targetRatio) {
            sw = imgH * targetRatio;
            sx = (imgW - sw) / 2;
          } else {
            sh = imgW / targetRatio;
            sy = (imgH - sh) / 2;
          }

          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);
        } else if (fitStyle === 'crop') {
          // INTERACTIVE SMART CROP: Cut out the defined crop bounding box
          const sx = crop.x * imgW;
          const sy = crop.y * imgH;
          const sw = crop.w * imgW;
          const sh = crop.h * imgH;
          
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);
        } else {
          // CONTAIN / ASPECT FIT: Scale down to fit, add blurred padding background
          
          ctx.save();
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
          
          if (blurRadius > 0) {
            ctx.filter = `blur(${blurRadius}px)`;
            ctx.drawImage(canvas, 0, 0);
          }
          ctx.restore();

          let dw = targetW;
          let dh = targetH;
          let dx = 0;
          let dy = 0;

          if (imgRatio > targetRatio) {
            dh = targetW / imgRatio;
            dy = (targetH - dh) / 2;
          } else {
            dw = targetH * imgRatio;
            dx = (targetW - dw) / 2;
          }

          ctx.drawImage(img, dx, dy, dw, dh);
        }

        canvas.toBlob((blob) => {
          if (blob) {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(URL.createObjectURL(blob));
          }
          setIsAssembling(false);
        }, 'image/png');
      };
    };

    const timer = setTimeout(resizeImage, 100); // 100ms debounce for smoother crops
    return () => clearTimeout(timer);
  }, [imageUrl, presetId, fitStyle, blurRadius, crop.x, crop.y, crop.w, crop.h]);

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
    setNaturalSize(null);
    setCrop({ x: 0, y: 0, w: 1, h: 1 });
    setDragState(null);
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
                  <label className="text-[10px] font-bold text-slate-455 uppercase tracking-widest block">
                    Fit Layout Mode
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => setFitStyle('contain')}
                      className={`py-2 px-1 text-[10px] font-bold border rounded-xl transition-all cursor-pointer ${
                        fitStyle === 'contain'
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                          : 'bg-slate-50 border-slate-200/70 text-slate-655 hover:text-slate-900'
                      }`}
                    >
                      Blur Fit
                    </button>
                    <button
                      onClick={() => setFitStyle('cover')}
                      className={`py-2 px-1 text-[10px] font-bold border rounded-xl transition-all cursor-pointer ${
                        fitStyle === 'cover'
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                          : 'bg-slate-50 border-slate-200/70 text-slate-655 hover:text-slate-900'
                      }`}
                    >
                      Auto Crop
                    </button>
                    <button
                      onClick={() => setFitStyle('crop')}
                      className={`py-2 px-1 text-[10px] font-bold border rounded-xl transition-all cursor-pointer ${
                        fitStyle === 'crop'
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                          : 'bg-slate-50 border-slate-200/70 text-slate-655 hover:text-slate-900'
                      }`}
                    >
                      Smart Crop
                    </button>
                  </div>
                </div>

                {/* Live Crop Preview (only for crop style) */}
                {fitStyle === 'crop' && previewUrl && (
                  <div className="space-y-2 bg-slate-50 border border-slate-200/60 rounded-2xl p-3 shadow-xs">
                    <label className="text-[9px] font-bold text-slate-455 uppercase tracking-widest block">
                      Live Cropped Result Preview
                    </label>
                    <div className="w-full aspect-[16/9] rounded-xl overflow-hidden border border-slate-200/80 bg-slate-100 flex items-center justify-center relative">
                      <img src={previewUrl} alt="Live Crop Preview" className="w-full h-full object-contain" />
                    </div>
                  </div>
                )}

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
                  {fitStyle === 'crop' ? 'Smart Crop Selection Area' : 'Resized Canvas Frame Output'}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {fitStyle === 'crop' ? 'Drag handles to adjust crop zone' : 'WASM rescalings compiled in-memory'}
                </span>
              </div>

              {/* Viewport */}
              <div className="w-full border border-slate-200 rounded-3xl bg-slate-50 flex items-center justify-center min-h-[400px] shadow-inner p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-dot-grid opacity-30" />

                {isAssembling && fitStyle !== 'crop' ? (
                  <div className="flex flex-col items-center gap-2.5 relative z-10">
                    <RefreshCw className="w-8 h-8 text-indigo-650 animate-spin" />
                    <span className="text-xs font-bold text-slate-600 animate-pulse">Rescaling images...</span>
                  </div>
                ) : fitStyle === 'crop' ? (
                  <div className="w-full h-full flex flex-col items-center justify-center relative min-h-[400px]">
                    <div className="relative inline-block max-w-full">
                      <img
                        ref={imageRef}
                        src={imageUrl}
                        alt="Crop Workarea"
                        onLoad={handleImageLoad}
                        className="max-w-full max-h-[550px] object-contain rounded-2xl shadow-md select-none pointer-events-none"
                      />
                      
                      {naturalSize && (
                        <div
                          ref={cropContainerRef}
                          style={{
                            position: 'absolute',
                            left: `${imgDisplayRect.left}px`,
                            top: `${imgDisplayRect.top}px`,
                            width: `${imgDisplayRect.width}px`,
                            height: `${imgDisplayRect.height}px`,
                          }}
                          className="overflow-hidden rounded-2xl touch-none select-none"
                        >
                          <div
                            style={{
                              position: 'absolute',
                              left: `${crop.x * 100}%`,
                              top: `${crop.y * 100}%`,
                              width: `${crop.w * 100}%`,
                              height: `${crop.h * 100}%`,
                            }}
                            className="border-2 border-amber-500 shadow-[0_0_0_9999px_rgba(15,23,42,0.65)] cursor-move flex flex-col justify-between"
                            onMouseDown={(e) => handleMouseDown(e, 'move')}
                            onTouchStart={(e) => handleTouchStart(e, 'move')}
                          >
                            {/* 3x3 Grid Lines */}
                            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                              <div className="border-r border-dashed border-white/40 border-b border-white/40" />
                              <div className="border-r border-dashed border-white/40 border-b border-white/40" />
                              <div className="border-b border-dashed border-white/40" />
                              <div className="border-r border-dashed border-white/40 border-b border-white/40" />
                              <div className="border-r border-dashed border-white/40 border-b border-white/40" />
                              <div className="border-b border-dashed border-white/40" />
                              <div className="border-r border-dashed border-white/40" />
                              <div className="border-r border-dashed border-white/40" />
                              <div />
                            </div>

                            {/* Handles */}
                            <div
                              className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-amber-500 rounded-full border border-white cursor-nwse-resize z-20"
                              onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'resize-tl'); }}
                              onTouchStart={(e) => { e.stopPropagation(); handleTouchStart(e, 'resize-tl'); }}
                            />
                            <div
                              className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-amber-500 rounded-full border border-white cursor-nesw-resize z-20"
                              onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'resize-tr'); }}
                              onTouchStart={(e) => { e.stopPropagation(); handleTouchStart(e, 'resize-tr'); }}
                            />
                            <div
                              className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-amber-500 rounded-full border border-white cursor-nesw-resize z-20"
                              onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'resize-bl'); }}
                              onTouchStart={(e) => { e.stopPropagation(); handleTouchStart(e, 'resize-bl'); }}
                            />
                            <div
                              className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-amber-500 rounded-full border border-white cursor-nwse-resize z-20"
                              onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'resize-br'); }}
                              onTouchStart={(e) => { e.stopPropagation(); handleTouchStart(e, 'resize-br'); }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
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
