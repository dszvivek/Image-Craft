import React, { useState, useEffect, useRef } from 'react';
import { Download, RefreshCw, Settings, Info, Sparkles } from 'lucide-react';
import { DemoPreview } from '../components/DemoPreview';
import { DropZone } from '../components/DropZone';
import { SEO } from '../components/SEO';
import { ToolGuide } from '../components/ToolGuide';
import { detectSmartCrop, warpPerspective } from '../utils/smartCrop';
import type { SmartCropResult } from '../utils/smartCrop';

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

  const [smartCropInfo, setSmartCropInfo] = useState<SmartCropResult | null>(null);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [customWidth, setCustomWidth] = useState<number>(1200);
  const [customHeight, setCustomHeight] = useState<number>(800);

  const imageRef = useRef<HTMLImageElement>(null);
  const cropContainerRef = useRef<HTMLDivElement>(null);



  const presets: Preset[] = [
    { id: 'free', name: 'Free Crop (Unconstrained)', width: 0, height: 0, ratioText: 'Free' },
    { id: '16-9', name: 'Widescreen (16:9)', width: 1920, height: 1080, ratioText: '16:9' },
    { id: '1-1', name: 'Square (1:1)', width: 1080, height: 1080, ratioText: '1:1' },
    { id: '9-16', name: 'Portrait/Story (9:16)', width: 1080, height: 1920, ratioText: '9:16' },
    { id: '4-5', name: 'Social Feed (4:5)', width: 1080, height: 1350, ratioText: '4:5' },
    { id: 'youtube-thumb', name: 'YouTube Thumbnail', width: 1280, height: 720, ratioText: '16:9' },
    { id: 'twitter-header', name: 'Twitter Header', width: 1500, height: 500, ratioText: '3:1' },
    { id: 'facebook-cover', name: 'Facebook Cover', width: 820, height: 312, ratioText: '820x312' },
    { id: 'linkedin-banner', name: 'LinkedIn Banner', width: 1584, height: 396, ratioText: '4:1' },
    { id: 'custom', name: 'Custom Ratio', width: 1200, height: 800, ratioText: 'Custom' },
  ];

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const f = files[0];
      setFile(f);
      setImageUrl(URL.createObjectURL(f));
      setPreviewUrl('');
    }
  };

  const activePreset = React.useMemo(() => {
    if (presetId === 'custom') {
      return {
        id: 'custom',
        name: 'Custom Ratio',
        width: customWidth,
        height: customHeight,
        ratioText: `${customWidth}:${customHeight}`,
      };
    }
    return presets.find((p) => p.id === presetId) || presets[0];
  }, [presetId, customWidth, customHeight]);

  useEffect(() => {
    if (!imageUrl) {
      setSmartCropInfo(null);
      return;
    }

    setIsDetecting(true);
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      try {
        const targetAspect = activePreset.width && activePreset.height
          ? activePreset.width / activePreset.height
          : img.naturalWidth / img.naturalHeight;
        const result = detectSmartCrop(img, targetAspect);
        setSmartCropInfo(result);
        
        // Initialize or update crop coordinates
        setCrop({
          x: result.x,
          y: result.y,
          w: result.w,
          h: result.h,
        });

        // Set natural size
        setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
      } catch (err) {
        console.error('Failed to run smart crop', err);
        // Fallback to center crop
        const imgW = img.naturalWidth;
        const imgH = img.naturalHeight;
        const targetAspect = activePreset.width && activePreset.height
          ? activePreset.width / activePreset.height
          : imgW / imgH;
        const imgRatio = imgW / imgH;
        let w = 1.0, h = 1.0, x = 0.0, y = 0.0;
        if (imgRatio > targetAspect) {
          w = (targetAspect * imgH) / imgW;
          x = (1.0 - w) / 2;
        } else {
          h = (imgW / targetAspect) / imgH;
          y = (1.0 - h) / 2;
        }
        setCrop({ x, y, w, h });
        setNaturalSize({ width: imgW, height: imgH });
      } finally {
        setIsDetecting(false);
      }
    };
  }, [imageUrl, activePreset.width, activePreset.height, presetId]);

  const handleWarpDocument = () => {
    if (!smartCropInfo || !smartCropInfo.corners || !file || !imageUrl) return;

    const corners = smartCropInfo.corners;
    const tl = corners[0];
    const tr = corners[1];
    const br = corners[2];
    const bl = corners[3];

    // Compute dimensions of the flattened document
    const widthA = Math.sqrt(Math.pow(br.x - bl.x, 2) + Math.pow(br.y - bl.y, 2));
    const widthB = Math.sqrt(Math.pow(tr.x - tl.x, 2) + Math.pow(tr.y - tl.y, 2));
    const destW = Math.round(Math.max(widthA, widthB));

    const heightA = Math.sqrt(Math.pow(tr.x - br.x, 2) + Math.pow(tr.y - br.y, 2));
    const heightB = Math.sqrt(Math.pow(tl.x - bl.x, 2) + Math.pow(tl.y - bl.y, 2));
    const destH = Math.round(Math.max(heightA, heightB));

    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      warpPerspective(img, corners, destW, destH, canvas);

      canvas.toBlob((blob) => {
        if (blob) {
          const warpedFile = new File(
            [blob],
            `${file.name.substring(0, file.name.lastIndexOf('.'))}_scanned.png`,
            { type: 'image/png' }
          );
          
          const newUrl = URL.createObjectURL(warpedFile);
          
          // Revoke old object URL
          URL.revokeObjectURL(imageUrl);
          
          setFile(warpedFile);
          setImageUrl(newUrl);
          setFitStyle('contain');
          setSmartCropInfo(null);
        }
      }, 'image/png');
    };
  };

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

  useEffect(() => {
    if (presetId === 'free') {
      setFitStyle('crop');
    }
  }, [presetId]);

  const handleStart = (clientX: number, clientY: number, action: 'move' | 'resize-tl' | 'resize-tr' | 'resize-bl' | 'resize-br') => {
    const img = imageRef.current;
    if (img) {
      updateDisplayRect(img);
    }
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

  const calculateNewCrop = (
    startX: number,
    startY: number,
    startCrop: { x: number; y: number; w: number; h: number },
    action: string,
    clientX: number,
    clientY: number
  ) => {
    if (!naturalSize || !imgDisplayRect.width || !imgDisplayRect.height) return crop;

    const dx = clientX - startX;
    const dy = clientY - startY;
    
    const rDx = dx / imgDisplayRect.width;
    const rDy = dy / imgDisplayRect.height;
    
    const isFree = presetId === 'free';
    const imgRatio = naturalSize.width / naturalSize.height;
    const targetRatio = isFree ? imgRatio : (activePreset.width && activePreset.height ? activePreset.width / activePreset.height : imgRatio);
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
      if (isFree) {
        // FREE RESIZING
        if (action === 'resize-br') {
          let newW = startCrop.w + rDx;
          let newH = startCrop.h + rDy;
          if (newW < 0.05) newW = 0.05;
          if (newH < 0.05) newH = 0.05;
          if (startCrop.x + newW > 1) newW = 1 - startCrop.x;
          if (startCrop.y + newH > 1) newH = 1 - startCrop.y;
          newCrop = { ...startCrop, w: newW, h: newH };
        }
        else if (action === 'resize-bl') {
          let newX = startCrop.x + rDx;
          if (newX < 0) newX = 0;
          let newW = startCrop.w + (startCrop.x - newX);
          if (newW < 0.05) {
            newW = 0.05;
            newX = startCrop.x + startCrop.w - 0.05;
          }
          let newH = startCrop.h + rDy;
          if (newH < 0.05) newH = 0.05;
          if (startCrop.y + newH > 1) newH = 1 - startCrop.y;
          newCrop = { ...startCrop, x: newX, w: newW, h: newH };
        }
        else if (action === 'resize-tr') {
          let newW = startCrop.w + rDx;
          if (newW < 0.05) newW = 0.05;
          if (startCrop.x + newW > 1) newW = 1 - startCrop.x;
          
          let newY = startCrop.y + rDy;
          if (newY < 0) newY = 0;
          let newH = startCrop.h + (startCrop.y - newY);
          if (newH < 0.05) {
            newH = 0.05;
            newY = startCrop.y + startCrop.h - 0.05;
          }
          newCrop = { ...startCrop, y: newY, w: newW, h: newH };
        }
        else if (action === 'resize-tl') {
          let newX = startCrop.x + rDx;
          if (newX < 0) newX = 0;
          let newW = startCrop.w + (startCrop.x - newX);
          if (newW < 0.05) {
            newW = 0.05;
            newX = startCrop.x + startCrop.w - 0.05;
          }
          
          let newY = startCrop.y + rDy;
          if (newY < 0) newY = 0;
          let newH = startCrop.h + (startCrop.y - newY);
          if (newH < 0.05) {
            newH = 0.05;
            newY = startCrop.y + startCrop.h - 0.05;
          }
          newCrop = { x: newX, y: newY, w: newW, h: newH };
        }
      } else {
        // CONSTRAINED RESIZING
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
    }
    return newCrop;
  };

  // Smooth dragging via window level listeners
  useEffect(() => {
    if (!dragState || !naturalSize || !imgDisplayRect.width || !imgDisplayRect.height) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      const { startX, startY, startCrop, action } = dragState;
      const newCrop = calculateNewCrop(startX, startY, startCrop, action, e.clientX, e.clientY);
      setCrop(newCrop);
    };

    const handleWindowTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const { startX, startY, startCrop, action } = dragState;
        const newCrop = calculateNewCrop(startX, startY, startCrop, action, e.touches[0].clientX, e.touches[0].clientY);
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
  }, [dragState, naturalSize, imgDisplayRect, crop, activePreset, presetId]);

  // Canvas drawing & scaling mathematical logic
  useEffect(() => {
    if (!imageUrl) return;

    const resizeImage = () => {
      setIsAssembling(true);
      const img = new Image();
      img.src = imageUrl;
      
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement('canvas');
        const imgW = img.naturalWidth;
        const imgH = img.naturalHeight;

        // Update natural size for crop tracking
        if (!naturalSize || naturalSize.width !== imgW || naturalSize.height !== imgH) {
          setNaturalSize({ width: imgW, height: imgH });
        }

        const isFree = presetId === 'free';
        const targetW = isFree ? Math.max(10, Math.round(crop.w * imgW)) : activePreset.width;
        const targetH = isFree ? Math.max(10, Math.round(crop.h * imgH)) : activePreset.height;
        canvas.width = targetW;
        canvas.height = targetH;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setIsAssembling(false);
          return;
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
            if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
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

  const aspectSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Smart Crop & Aspect Resizer - ImageGiri',
    'applicationCategory': 'MultimediaApplication',
    'operatingSystem': 'Web Browser',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    },
    'description': 'Resize and crop images to exact social media dimensions in your browser. Presets for YouTube, Instagram, Facebook, and Twitter. Smart crop and perspective warping.',
    'featureList': [
      'Content-aware Smart Crop engine',
      'Homography projection document warping scanner',
      'Blur padding and color fill fitting modes',
      'Presets for major social media aspect sizes'
    ]
  };

  return (
    <div className="w-full">
      <SEO 
        title="Free Smart Crop & Aspect Resizer - Canva Resizer Alternative" 
        description="Resize images to social preset aspect ratios. Features local Face/Saliency Smart Crop and perspective document scanning. A free alternative to Canva Resizer and ImageResizer.com." 
        keywords="aspect ratio resizer, image resizer, crop image online, resize photo online, YouTube thumbnail size, Instagram story size, Twitter header size, social media image resizer, smart crop, photo crop tool, image resize tool free, resize image without losing quality, Canva resizer alternative, ImageResizer.com alternative, resize photo offline"
        canonicalUrl="https://imagegiri.com/aspect-resizer"
        schema={aspectSchema}
      />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-amber-650 uppercase tracking-widest px-2.5 py-1 bg-amber-50 border border-amber-100 rounded-full shadow-sm">
            Scale Utility
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-3 mb-2">Smart Crop & Aspect Resizer</h1>
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
                <DemoPreview
                  toolId="crop"
                  alt="Aspect Resizer Demo"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
            
            {/* Left Options card — sticky on desktop */}
            <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start order-2 lg:order-1">
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
                  {/* Styled select wrapper with custom chevron */}
                  <div className="relative">
                    <select
                      value={presetId}
                      onChange={(e) => setPresetId(e.target.value)}
                      className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 transition cursor-pointer pr-8"
                    >
                      {presets.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.ratioText})
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Custom Ratio Input Fields */}
                {presetId === 'custom' && (
                  <div className="grid grid-cols-2 gap-3 bg-slate-50/40 border border-slate-200/60 p-3 rounded-2xl animate-fade-in shadow-xs">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block">
                        Custom Width (px)
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="8000"
                        value={customWidth}
                        onChange={(e) => setCustomWidth(Math.max(10, parseInt(e.target.value) || 0))}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-slate-700 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-455 uppercase tracking-wider block">
                        Custom Height (px)
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="8000"
                        value={customHeight}
                        onChange={(e) => setCustomHeight(Math.max(10, parseInt(e.target.value) || 0))}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-slate-700 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                )}

                {/* Fit Mode */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-455 uppercase tracking-widest block">
                    Fit Layout Mode
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => setFitStyle('contain')}
                      disabled={presetId === 'free'}
                      className={`py-2 px-1 text-[10px] font-bold border rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                        fitStyle === 'contain'
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                          : 'bg-white/80 border-slate-200/70 text-slate-655 hover:text-slate-900 hover:bg-slate-50/50'
                      }`}
                    >
                      Blur Fit
                    </button>
                    <button
                      onClick={() => setFitStyle('cover')}
                      disabled={presetId === 'free'}
                      className={`py-2 px-1 text-[10px] font-bold border rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                        fitStyle === 'cover'
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                          : 'bg-white/80 border-slate-200/70 text-slate-655 hover:text-slate-900 hover:bg-slate-50/50'
                      }`}
                    >
                      Auto Crop
                    </button>
                    <button
                      onClick={() => setFitStyle('crop')}
                      className={`py-2 px-1 text-[10px] font-bold border rounded-xl transition-all cursor-pointer ${
                        fitStyle === 'crop'
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                          : 'bg-white/80 border-slate-200/70 text-slate-655 hover:text-slate-900 hover:bg-slate-50/50'
                      }`}
                    >
                      Smart Crop
                    </button>
                  </div>
                </div>

                {/* Smart Crop Auto-Detection Status */}
                {smartCropInfo && (
                  <div className="bg-slate-50/40 border border-slate-200/60 rounded-2xl p-3.5 space-y-2.5 animate-fade-in shadow-xs">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                      <span>Smart Crop Assistant</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Detection Focus:</span>
                      {isDetecting ? (
                        <span className="text-[10px] font-bold text-slate-400 animate-pulse uppercase tracking-wider">
                          Analyzing...
                        </span>
                      ) : (
                        <span className="font-bold text-indigo-650 bg-indigo-50/80 border border-indigo-100/60 px-2 py-0.5 rounded shadow-xs uppercase tracking-wider text-[10px]">
                          {smartCropInfo.type === 'document' && '📄 Document Bounding'}
                          {smartCropInfo.type === 'face' && '👤 Human Face(s)'}
                          {smartCropInfo.type === 'saliency' && '✨ Visually Salient Subject'}
                          {smartCropInfo.type === 'center' && '🎯 Center Layout Fallback'}
                        </span>
                      )}
                    </div>

                    {smartCropInfo.type === 'document' && smartCropInfo.corners && (
                      <div className="pt-1.5 border-t border-slate-100 flex flex-col gap-2">
                        <p className="text-[10px] text-slate-500 leading-normal font-medium">
                          A document was detected in the photo. You can flatten the perspective to crop it directly.
                        </p>
                        <button
                          onClick={handleWarpDocument}
                          className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm active:scale-98 transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span>📄</span> Flatten Perspective & Crop
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Live Crop Preview (only for crop style) */}
                {fitStyle === 'crop' && previewUrl && (
                  <div className="space-y-2 bg-slate-50/40 border border-slate-200/60 rounded-2xl p-3 shadow-xs">
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
                      className="range-styled w-full"
                      style={{ '--slider-pct': `${(blurRadius / 40) * 100}%` } as React.CSSProperties}
                    />
                  </div>
                )}

                {/* Presets Details Info Card */}
                <div className="bg-slate-50/40 border border-slate-200/60 rounded-2xl p-4.5 space-y-3.5 shadow-xs">
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
                    className="w-full py-3 bg-white/80 hover:bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-655 hover:text-slate-900 border border-slate-200/60 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reset Editor
                  </button>
                </div>

              </div>
            </div>

            {/* Right Canvas preview column */}
            <div className="lg:col-span-8 space-y-4 order-1 lg:order-2">
              
              <div className="flex justify-between items-center bg-white border border-slate-200/50 rounded-2xl px-4 py-3 shadow-xs">
                <span className="text-xs font-bold text-slate-800">
                  {fitStyle === 'crop' ? 'Smart Crop Selection Area' : 'Resized Canvas Frame Output'}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {fitStyle === 'crop' ? 'Drag handles to adjust crop zone' : 'WASM rescalings compiled in-memory'}
                </span>
              </div>

              {/* Viewport */}
              <div className="w-full border border-slate-200 rounded-3xl bg-slate-50/30 flex items-center justify-center min-h-[400px] shadow-inner p-4 relative overflow-hidden">
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
                        className="max-w-full max-h-[550px] w-auto h-auto block mx-auto rounded-2xl shadow-md select-none pointer-events-none"
                      />
                      
                      {naturalSize && (
                        <div
                          ref={cropContainerRef}
                          className="absolute inset-0 overflow-hidden rounded-2xl touch-none select-none"
                        >
                          {/* Document Corners Polygon Overlay */}
                          {smartCropInfo?.type === 'document' && smartCropInfo.corners && imgDisplayRect.width > 0 && (
                            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                              <polygon
                                points={smartCropInfo.corners
                                  .map((p) => {
                                    const displayX = (p.x / naturalSize.width) * imgDisplayRect.width;
                                    const displayY = (p.y / naturalSize.height) * imgDisplayRect.height;
                                    return `${displayX},${displayY}`;
                                  })
                                  .join(' ')}
                                fill="rgba(59, 130, 246, 0.12)"
                                stroke="#3b82f6"
                                strokeWidth="2"
                                strokeDasharray="4 4"
                              />
                              {smartCropInfo.corners.map((p, idx) => {
                                const displayX = (p.x / naturalSize.width) * imgDisplayRect.width;
                                const displayY = (p.y / naturalSize.height) * imgDisplayRect.height;
                                return (
                                  <circle
                                    key={idx}
                                    cx={displayX}
                                    cy={displayY}
                                    r="5.5"
                                    fill="#2563eb"
                                    stroke="white"
                                    strokeWidth="2"
                                  />
                                );
                              })}
                            </svg>
                          )}

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

        <ToolGuide
          toolName="Smart Crop & Aspect Resizer"
          introText="Optimize image boundaries for social media. Resize files to matching preset dimensions or scan and flatten tilted documents using local homography rendering."
          competitorComparison={{
            alternatives: ['ImageResizer.com', 'Canva Resizer', 'PicResize'],
            benefit: 'Standard resizers upload photos to their backend or restrict custom ratios to premium plans. ImageGiri resizes all images in your browser RAM, featuring on-device face and document boundary detection completely free.'
          }}
          steps={[
            {
              title: 'Upload Photo',
              description: 'Select or drag your image into the drop area.'
            },
            {
              title: 'Configure Presets',
              description: 'Choose presets (YouTube Thumbnail, Instagram Stories) or customize height/width parameters. Select cover fit or blur pad styles.'
            },
            {
              title: 'Smart Crop / Flatten',
              description: 'Toggle Smart Crop to align boundaries on focal subjects. If scanning a document, click "Flatten Perspective & Crop" to correct tilts.'
            },
            {
              title: 'Download Crop',
              description: 'Review the preview alignment and click "Download Resized Image" to save the high-res crop.'
            }
          ]}
          features={[
            'Dozens of built-in templates for YouTube, Instagram, Facebook, and LinkedIn.',
            'On-device computer vision to center crops on faces and salient objects.',
            'Homography perspective projection to digitize, straighten, and scan paper documents.',
            'Seamless canvas padding: choose between solid fills or blurred background bars.',
            'Runs entirely offline; keeps files secure inside browser memory.'
          ]}
          faq={[
            {
              q: 'What is the blur padding contain mode?',
              a: 'When fitting wide landscape images into narrow vertical spaces, containment fits the photo, applying matching blurred background bars to fill empty margins.'
            },
            {
              q: 'How does Document Perspective Flattening work?',
              a: 'It scans document boundaries, maps corner nodes, and computes perspective warping matrices to rectify tilted documents as if scanned from directly above.'
            },
            {
              q: 'Are my document uploads recorded?',
              a: 'No. All scanner calculations and image resizing execute locally in Javascript. No remote servers are contacted.'
            }
          ]}
        />

      </div>
    </div>
  );
};
