import React, { useState, useEffect, useRef } from 'react';
import { Download, RefreshCw, Trash2, Settings, Type, Image as ImageIcon } from 'lucide-react';
import watermarkOverlayGif from '../assets/watermark_overlay_feature.gif';
import watermarkOverlayStaticImg from '../assets/watermark_overlay_feature_static.webp';
import { DemoPreview } from '../components/DemoPreview';
import { DropZone } from '../components/DropZone';
import { SEO } from '../components/SEO';
import { ToolGuide } from '../components/ToolGuide';

export const WatermarkOverlay: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  
  // Watermark Settings
  const [watermarkType, setWatermarkType] = useState<'text' | 'logo'>('text');
  const [watermarkText, setWatermarkText] = useState<string>('ImageGiri');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string>('');
  
  const [opacity, setOpacity] = useState<number>(50); // 0-100
  const [scale, setScale] = useState<number>(20); // 5-100 (percentage of main image size)
  const [rotation, setRotation] = useState<number>(0); // -180 to 180 degrees
  const [position, setPosition] = useState<string>('bottom-right');
  const [margin, setMargin] = useState<number>(20); // padding from corners
  const [textColor, setTextColor] = useState<string>('#ffffff');
  
  const [isAssembling, setIsAssembling] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      const f = files[0];
      setFile(f);
      setImageUrl(URL.createObjectURL(f));
    }
  };

  const handleLogoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const f = e.target.files[0];
      setLogoFile(f);
      if (logoUrl) URL.revokeObjectURL(logoUrl);
      setLogoUrl(URL.createObjectURL(f));
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    if (logoUrl) URL.revokeObjectURL(logoUrl);
    setLogoUrl('');
  };

  // Compile and draw watermark
  useEffect(() => {
    if (!imageUrl) return;

    const renderWatermark = async () => {
      setIsAssembling(true);
      const img = new Image();
      img.src = imageUrl;
      
      img.onload = async () => {
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setIsAssembling(false);
          return;
        }

        // Draw original background image
        ctx.drawImage(img, 0, 0);

        // Configure transparency
        ctx.save();
        ctx.globalAlpha = opacity / 100;

        const maxDim = Math.max(canvas.width, canvas.height);
        const wSize = Math.max(20, Math.round(maxDim * (scale / 100)));

        const drawWatermarkItem = (cx: number, cy: number, w: number, h: number, drawFn: () => void) => {
          ctx.save();
          // Translate to center of item to rotate
          ctx.translate(cx, cy);
          ctx.rotate((rotation * Math.PI) / 180);
          // Translate back to draw
          ctx.translate(-w / 2, -h / 2);
          drawFn();
          ctx.restore();
        };

        const drawContent = (w: number, h: number) => {
          if (watermarkType === 'text') {
            const fontSize = Math.max(12, Math.round(wSize / 4));
            ctx.font = `bold ${fontSize}px sans-serif`;
            ctx.fillStyle = textColor;
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = Math.max(1, Math.round(fontSize / 6));
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            
            // Stroke outline + Fill text
            ctx.strokeText(watermarkText, 0, h / 2);
            ctx.fillText(watermarkText, 0, h / 2);
          } else if (watermarkType === 'logo' && logoUrl) {
            // Wait for logo image to load
            return new Promise<void>((resolve) => {
              const lImg = new Image();
              lImg.onload = () => {
                ctx.drawImage(lImg, 0, 0, w, h);
                resolve();
              };
              lImg.src = logoUrl;
            });
          }
          return Promise.resolve();
        };

        // Determine size of watermark bounding box
        let itemW = wSize;
        let itemH = wSize;

        if (watermarkType === 'text') {
          const tempFontSize = Math.max(12, Math.round(wSize / 4));
          ctx.font = `bold ${tempFontSize}px sans-serif`;
          const metrics = ctx.measureText(watermarkText);
          itemW = metrics.width;
          itemH = tempFontSize;
        }

        // Determine drawing coordinates list based on position preset
        const coordinates: { x: number; y: number }[] = [];
        const marginPx = Math.max(0, Math.round(maxDim * (margin / 500)));

        if (position === 'center') {
          coordinates.push({ x: canvas.width / 2, y: canvas.height / 2 });
        } else if (position === 'top-left') {
          coordinates.push({ x: marginPx + itemW / 2, y: marginPx + itemH / 2 });
        } else if (position === 'top-right') {
          coordinates.push({ x: canvas.width - marginPx - itemW / 2, y: marginPx + itemH / 2 });
        } else if (position === 'bottom-left') {
          coordinates.push({ x: marginPx + itemW / 2, y: canvas.height - marginPx - itemH / 2 });
        } else if (position === 'bottom-right') {
          coordinates.push({ x: canvas.width - marginPx - itemW / 2, y: canvas.height - marginPx - itemH / 2 });
        } else if (position === 'tile') {
          const stepX = itemW * 2.5;
          const stepY = itemH * 4;
          for (let tx = stepX / 2; tx < canvas.width; tx += stepX) {
            for (let ty = stepY / 2; ty < canvas.height; ty += stepY) {
              coordinates.push({ x: tx, y: ty });
            }
          }
        }

        // Draw watermark items
        for (const coord of coordinates) {
          await new Promise<void>((resolve) => {
            drawWatermarkItem(coord.x, coord.y, itemW, itemH, () => {
              drawContent(itemW, itemH).then(resolve);
            });
          });
        }

        ctx.restore();

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

    const timer = setTimeout(renderWatermark, 250); // debounce canvas render
    return () => clearTimeout(timer);
  }, [imageUrl, watermarkType, watermarkText, logoUrl, opacity, scale, rotation, position, margin, textColor]);

  const handleDownload = () => {
    if (!previewUrl || !file) return;
    const link = document.createElement('a');
    link.href = previewUrl;
    link.download = `watermarked_${file.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (logoUrl) URL.revokeObjectURL(logoUrl);
    setFile(null);
    setImageUrl('');
    setPreviewUrl('');
    setLogoFile(null);
    setLogoUrl('');
    setWatermarkType('text');
    setWatermarkText('ImageGiri');
    setOpacity(50);
    setScale(20);
    setRotation(0);
    setPosition('bottom-right');
    setMargin(20);
    setTextColor('#ffffff');
  };

  const imageUrlRef = useRef(imageUrl);
  imageUrlRef.current = imageUrl;
  const previewUrlRef = useRef(previewUrl);
  previewUrlRef.current = previewUrl;
  const logoUrlRef = useRef(logoUrl);
  logoUrlRef.current = logoUrl;

  useEffect(() => {
    return () => {
      if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current);
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      if (logoUrlRef.current) URL.revokeObjectURL(logoUrlRef.current);
    };
  }, []);

  const watermarkSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Watermark Overlay - ImageGiri',
    'applicationCategory': 'MultimediaApplication',
    'operatingSystem': 'Web Browser',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    },
    'description': 'Add watermarks to images directly in your browser. Overlay custom text or logo PNG watermarks with adjustable opacity, size, rotation, and position.',
    'featureList': [
      'Text overlay and image logo overlays',
      'Custom opacity, size, and rotation controls',
      'Tile repeat grid watermark mapping',
      'Precise corner and center alignment presets'
    ]
  };

  return (
    <div className="w-full">
      <SEO 
        title="Free Watermark Overlay Tool - Watermarkly Alternative" 
        description="Overlay custom text or brand logos onto images locally in your browser. A free, offline alternative to Watermarkly and Visual Watermark." 
        keywords="watermark image, add watermark to photo, watermark tool online, text watermark, logo watermark, image watermark maker, free watermark tool, watermark photo online, copyright watermark, watermark overlay, watermark without upload, Watermarkly alternative, Visual Watermark alternative, watermark photo offline"
        canonicalUrl="https://imagegiri.com/watermark-overlay"
        schema={watermarkSchema}
      />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-rose-650 uppercase tracking-widest px-2.5 py-1 bg-rose-50 border border-rose-100 rounded-full shadow-sm">
            Branding Tool
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-3 mb-2">Watermark Overlay</h1>
          <p className="text-sm text-slate-500">Stamp copyright text or PNG logos onto photos locally without uploading them to cloud hosts.</p>
        </div>

        {!file ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
            <div className="md:col-span-7 flex flex-col justify-center">
              <DropZone 
                onFilesSelected={handleFilesSelected}
                title="Drop image to watermark"
                subtitle="Supports JPG, PNG, WebP up to 40MB"
              />
            </div>
            <div className="md:col-span-5 flex">
              <div className="premium-bento rounded-3xl p-6 flex flex-col justify-between w-full shadow-sm hover:border-rose-350 transition-all duration-300">
                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-rose-650 bg-rose-50/30 border border-rose-100/60 px-2 py-0.5 rounded uppercase tracking-wider inline-block">Demo Preview</div>
                  <h3 className="text-base font-extrabold text-slate-900">How Watermark Overlay Works</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Stamp custom text or transparent PNG logos onto your photos. Adjust opacity, scale, rotation and tiling — all rendered locally on canvas without any uploads.
                  </p>
                </div>
                <DemoPreview
                  gifSrc={ watermarkOverlayGif }
                  staticSrc={ watermarkOverlayStaticImg }
                  alt="Watermark Overlay Demo"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
            
            {/* Left Controls column */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="glass-card p-6 rounded-3xl space-y-6">
                <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Settings className="w-4.5 h-4.5 text-indigo-500" />
                  Watermark Settings
                </h3>

                {/* Watermark Type Selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">
                    Watermark Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setWatermarkType('text')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        watermarkType === 'text'
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                          : 'bg-white/80 border-slate-200/70 text-slate-655 hover:text-slate-900 hover:bg-slate-50/50'
                      }`}
                    >
                      <Type className="w-3.5 h-3.5" /> Text
                    </button>
                    <button
                      onClick={() => setWatermarkType('logo')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        watermarkType === 'logo'
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                          : 'bg-white/80 border-slate-200/70 text-slate-655 hover:text-slate-900 hover:bg-slate-50/50'
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" /> Logo
                    </button>
                  </div>
                </div>

                {/* Text Configs */}
                {watermarkType === 'text' ? (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-455 uppercase tracking-widest block">
                        Watermark Text
                      </label>
                      <input
                        type="text"
                        value={watermarkText}
                        onChange={(e) => setWatermarkText(e.target.value)}
                        className="w-full bg-white/90 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-750 focus:outline-none focus:border-indigo-500 transition-all shadow-xs focus:bg-white"
                        placeholder="Type watermark..."
                      />
                    </div>

                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-455">Text Color</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="w-7 h-7 rounded-lg border border-slate-200 bg-transparent cursor-pointer"
                        />
                        <span className="font-mono text-slate-700 text-[10px] font-bold">{textColor.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-slate-455 uppercase tracking-widest block">
                      Upload Logo (PNG / transparent recommended)
                    </label>
                    
                    {!logoFile ? (
                      <label className="border border-dashed border-slate-250 hover:border-indigo-550/50 hover:bg-indigo-50/15 py-4 px-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center transition-all">
                        <ImageIcon className="w-6 h-6 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-600">Select PNG Logo</span>
                        <input type="file" accept="image/png,image/jpeg" onChange={handleLogoSelected} className="hidden" />
                      </label>
                    ) : (
                      <div className="flex items-center justify-between p-3.5 bg-white/80 border border-slate-200 rounded-2xl shadow-xs">
                        <span className="text-xs font-bold text-slate-700 truncate max-w-[150px]" title={logoFile.name}>
                          {logoFile.name}
                        </span>
                        <button onClick={removeLogo} className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition cursor-pointer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Placements Presets */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-455 uppercase tracking-widest block">
                    Placement Position
                  </label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full bg-white/90 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 transition cursor-pointer shadow-xs"
                  >
                    <option value="center">Center Center</option>
                    <option value="top-left">Top Left</option>
                    <option value="top-right">Top Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="bottom-right">Bottom Right</option>
                    <option value="tile">Repeat Tile Grid</option>
                  </select>
                </div>

                {/* Common Sliders */}
                <div className="space-y-4 pt-1">
                  {/* Opacity */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-455">Watermark Opacity</span>
                      <span className="font-mono text-indigo-650 font-bold bg-indigo-50 px-1.5 py-0.5 rounded shadow-xs">{opacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      value={opacity}
                      onChange={(e) => setOpacity(Number(e.target.value))}
                      className="range-styled w-full"
                    />
                  </div>

                  {/* Size Scale */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-455">Watermark Size / Scale</span>
                      <span className="font-mono text-indigo-650 font-bold bg-indigo-50 px-1.5 py-0.5 rounded shadow-xs">{scale}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="80"
                      value={scale}
                      onChange={(e) => setScale(Number(e.target.value))}
                      className="range-styled w-full"
                    />
                  </div>

                  {/* Rotation Angle */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-455">Rotation Angle</span>
                      <span className="font-mono text-indigo-650 font-bold bg-indigo-50 px-1.5 py-0.5 rounded shadow-xs">{rotation}°</span>
                    </div>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={rotation}
                      onChange={(e) => setRotation(Number(e.target.value))}
                      className="range-styled w-full"
                    />
                  </div>

                  {/* Corner Padding Margin */}
                  {position !== 'center' && position !== 'tile' && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-455">Corner Margin</span>
                        <span className="font-mono text-indigo-650 font-bold bg-indigo-50 px-1.5 py-0.5 rounded shadow-xs">{margin}px</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="80"
                        value={margin}
                        onChange={(e) => setMargin(Number(e.target.value))}
                        className="range-styled w-full"
                      />
                    </div>
                  )}
                </div>

                {/* CTAs */}
                <div className="flex flex-col gap-2.5 pt-2">
                  <button
                    onClick={handleDownload}
                    disabled={isAssembling || !previewUrl}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-655 hover:from-indigo-550 hover:to-purple-550 disabled:opacity-50 text-[11px] font-bold uppercase tracking-wider text-white rounded-xl shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Download Watermarked Image
                  </button>

                  <button
                    onClick={handleReset}
                    className="w-full py-3 bg-white hover:bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-655 hover:text-slate-900 border border-slate-200/60 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reset Image
                  </button>
                </div>

              </div>
            </div>

            {/* Right Canvas preview column */}
            <div className="lg:col-span-8 space-y-4">
              
              <div className="flex justify-between items-center glass-card rounded-2xl px-4 py-3 shadow-xs">
                <span className="text-xs font-bold text-slate-800">
                  Watermarked Live Canvas Preview
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Dual-border rendering runs locally
                </span>
              </div>

              {/* Canvas viewport */}
              <div className="w-full border border-slate-200/80 rounded-3xl bg-slate-50/30 flex items-center justify-center min-h-[400px] shadow-inner p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-dot-grid opacity-30" />
                
                {isAssembling ? (
                  <div className="flex flex-col items-center gap-2.5 relative z-10">
                    <RefreshCw className="w-8 h-8 text-indigo-650 animate-spin" />
                    <span className="text-xs font-bold text-slate-600 animate-pulse">Rendering canvas...</span>
                  </div>
                ) : (
                  previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Watermark Preview"
                      className="max-w-full max-h-[600px] object-contain rounded-2xl shadow-2xl border border-slate-200 relative z-10 animate-float"
                    />
                  )
                )}
              </div>

            </div>

          </div>
        )}

        <ToolGuide
          toolName="Watermark Overlay"
          introText="Protect your photography and brand your design portfolios offline. Stamp logo PNGs or copyright text, adjusting scales and tiling details dynamically."
          competitorComparison={{
            alternatives: ['Watermarkly', 'Visual Watermark', 'Watermark.ws'],
            benefit: 'Most cloud watermark tools limit photo exports, add their own forced logo watermarks, or charge fees for batch sizes. ImageGiri runs watermark overlays inside your browser Canvas runtime memory. Your pictures are signed locally without any external data uploads.'
          }}
          steps={[
            {
              title: 'Upload Base Photo',
              description: 'Select your photo (PNG, JPEG, WebP) by dragging and dropping it into the main file zone.'
            },
            {
              title: 'Configure Watermark',
              description: 'Choose "Text" and enter copyright terms, or select "Logo" and upload a transparent PNG logo file.'
            },
            {
              title: 'Adjust Settings & Save',
              description: 'Configure position presets, margin sliders, scaling, rotation, opacity, or enable full page tile grids. Once satisfied, click "Download Watermarked Image".'
            }
          ]}
          features={[
            'Dual watermark formats: customizable typography text or transparent brand logo PNGs.',
            'Watermark repeat grid (Tiling pattern) to cover the entire layout space.',
            'Comprehensive slider parameters for size, spacing, rotation angles, and transparency levels.',
            'Precise alignment anchors (Top-Left, Top-Right, Center, Bottom-Left, Bottom-Right).',
            'Saves branding overlays locally in RAM without cloud databases.'
          ]}
          faq={[
            {
              q: 'Does it support transparent logo files?',
              a: 'Yes! Transparent PNG files are highly recommended for logo overlays to blend seamlessly.'
            },
            {
              q: 'Does ImageGiri add its own watermark?',
              a: 'Never. The final saved image only contains the watermark overlays you explicitly configured.'
            },
            {
              q: 'Can I add multiple watermarks?',
              a: 'Currently, you can add either a custom text block or a single logo file with scaling/rotation controls.'
            }
          ]}
        />

      </div>
    </div>
  );
};
