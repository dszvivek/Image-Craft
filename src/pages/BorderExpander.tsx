import React, { useState, useEffect, useRef } from 'react';
import { Download, RefreshCw, Square, Check } from 'lucide-react';
import { DropZone } from '../components/DropZone';
import { SEO } from '../components/SEO';
import { ToolGuide } from '../components/ToolGuide';
import { DemoPreview } from '../components/DemoPreview';

const COLOR_PRESETS = [
  { name: 'White', value: '#FFFFFF' },
  { name: 'Black', value: '#000000' },
  { name: 'Slate', value: '#1E293B' },
  { name: 'Indigo', value: '#4F46E5' },
  { name: 'Cream', value: '#FEF3C7' },
  { name: 'Pastel Rose', value: '#FFE4E6' },
  { name: 'Transparent', value: 'transparent' },
];

export const BorderExpander: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Border settings
  const [uniformPadding, setUniformPadding] = useState<number>(30); // px

  const [bgStyle, setBgStyle] = useState<'solid' | 'blur' | 'gradient'>('solid');
  const [borderColor, setBorderColor] = useState<string>('#FFFFFF');
  const [gradientEndColor, setGradientEndColor] = useState<string>('#4F46E5');
  const [borderRadius, setBorderRadius] = useState<number>(16); // Corner rounding
  const [hasShadow, setHasShadow] = useState<boolean>(true);
  const [shadowBlur, setShadowBlur] = useState<number>(25);

  const [exportFormat, setExportFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png');
  const [jpegQuality, setJpegQuality] = useState<number>(92);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

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
      };
    }
  };

  const currentTop = uniformPadding;
  const currentRight = uniformPadding;
  const currentBottom = uniformPadding;
  const currentLeft = uniformPadding;

  // Render Canvas
  useEffect(() => {
    if (!imageSrc || imageSize.width === 0 || imageSize.height === 0) return;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const imgW = imageSize.width;
      const imgH = imageSize.height;
      const totalW = imgW + currentLeft + currentRight;
      const totalH = imgH + currentTop + currentBottom;

      canvas.width = totalW;
      canvas.height = totalH;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, totalW, totalH);

      // 1. Draw Background
      if (bgStyle === 'blur') {
        // Draw blurred background copy of image
        ctx.save();
        ctx.filter = 'blur(40px) brightness(0.9)';
        ctx.drawImage(img, -20, -20, totalW + 40, totalH + 40);
        ctx.restore();
      } else if (bgStyle === 'gradient') {
        const grad = ctx.createLinearGradient(0, 0, totalW, totalH);
        grad.addColorStop(0, borderColor);
        grad.addColorStop(1, gradientEndColor);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, totalW, totalH);
      } else {
        if (borderColor !== 'transparent') {
          ctx.fillStyle = borderColor;
          ctx.fillRect(0, 0, totalW, totalH);
        }
      }

      // 2. Draw Image with optional Corner Radius & Drop Shadow
      ctx.save();
      const imgX = currentLeft;
      const imgY = currentTop;

      if (hasShadow) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
        ctx.shadowBlur = shadowBlur;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = shadowBlur / 3;
      }

      if (borderRadius > 0) {
        // Rounded rectangle clip path
        ctx.beginPath();
        const r = Math.min(borderRadius, imgW / 2, imgH / 2);
        ctx.moveTo(imgX + r, imgY);
        ctx.arcTo(imgX + imgW, imgY, imgX + imgW, imgY + imgH, r);
        ctx.arcTo(imgX + imgW, imgY + imgH, imgX, imgY + imgH, r);
        ctx.arcTo(imgX, imgY + imgH, imgX, imgY, r);
        ctx.arcTo(imgX, imgY, imgX + imgW, imgY, r);
        ctx.closePath();

        // Fill background behind image for clean shadow
        if (hasShadow) {
          ctx.fillStyle = '#000';
          ctx.fill();
        }

        ctx.clip();
      }

      ctx.drawImage(img, imgX, imgY, imgW, imgH);
      ctx.restore();
    };
  }, [
    imageSrc,
    imageSize,
    currentTop,
    currentRight,
    currentBottom,
    currentLeft,
    bgStyle,
    borderColor,
    gradientEndColor,
    borderRadius,
    hasShadow,
    shadowBlur,
  ]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsProcessing(true);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const originalName = file?.name.replace(/\.[^/.]+$/, '') || 'framed-image';
        const ext = exportFormat === 'image/jpeg' ? 'jpg' : exportFormat === 'image/webp' ? 'webp' : 'png';
        a.href = url;
        a.download = `${originalName}-bordered.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsProcessing(false);
      },
      exportFormat,
      exportFormat === 'image/jpeg' ? jpegQuality / 100 : 0.95
    );
  };

  const handleReset = () => {
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    setFile(null);
    setImageSrc('');
    setImageSize({ width: 0, height: 0 });
    setUniformPadding(30);
    setBorderRadius(16);
  };

  const borderSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Canvas Border & Padding Expander - ImagePlumber',
    'applicationCategory': 'MultimediaApplication',
    'operatingSystem': 'Web Browser',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD',
    },
    'description': 'Add custom color borders, letterboxing, frosted glass blurred backgrounds, rounded corners, and soft drop shadows to photos online for free.',
    'featureList': [
      'Uniform and Asymmetrical Padding Controls',
      'Solid Color, Gradient, and Frosted Glass Blur Backgrounds',
      'Adjustable Corner Radius and Soft Drop Shadow Engine',
      'Lossless PNG, JPEG, and WebP Export',
    ],
  };

  return (
    <div className="w-full">
      <SEO
        title="Add Border to Image Online Free (Color, Blur, Padding) | ImagePlumber"
        description="Add colored borders, frame padding, blurred background letterboxing, and rounded corners to photos online. 100% private in-browser canvas processing."
        keywords="add border to image, photo frame online, add white border to photo, instagram photo padding, blur background padding, add shadow to image, rounded corners image"
        canonicalUrl="https://imageplumber.com/add-border-to-image"
        schema={borderSchema}
      />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-indigo-650 uppercase tracking-widest px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-full shadow-sm">
            Geometry Engine
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-100 mt-3 mb-2">
            Canvas Border & Padding Expander
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Add borders, rounded corners, drop shadows, and aesthetic blurred padding for social media mockups in RAM.
          </p>
        </div>

        {!imageSrc ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
            <div className="md:col-span-7 flex flex-col justify-center">
              <DropZone
                onFilesSelected={handleFilesSelected}
                title="Drop image to add border & frame"
                subtitle="Supports JPG, PNG, WebP, HEIC up to 50MB"
              />
            </div>
            <div className="md:col-span-5 flex">
              <div className="premium-bento rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between w-full shadow-sm">
                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-indigo-650 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900 px-2 py-0.5 rounded uppercase tracking-wider inline-block">
                    Demo Preview
                  </div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Social Media Framing</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    Add clean white frames, frosted glass blurred backgrounds, and rounded corners for Instagram and Twitter posts.
                  </p>
                </div>
                <DemoPreview toolId="resizer" alt="Border Expander Preview" />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Controls Bar */}
            <div className="lg:col-span-4 flex flex-col gap-6 order-2 lg:order-1">
              <div className="premium-bento p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-6 shadow-sm">
                
                <h2 className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2 text-sm">
                  <Square className="w-4 h-4 text-indigo-500" />
                  Border Styling
                </h2>

                {/* Border Style Options */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Background Style
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'solid', label: 'Solid Color' },
                      { id: 'blur', label: 'Frosted Blur' },
                      { id: 'gradient', label: 'Gradient' },
                    ].map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setBgStyle(style.id as any)}
                        className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                          bgStyle === style.id
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/10'
                            : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Palette Presets */}
                {bgStyle === 'solid' && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest">Border Color</span>
                      <span className="font-mono text-slate-500">{borderColor}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                      {COLOR_PRESETS.map((c) => (
                        <button
                          key={c.name}
                          onClick={() => setBorderColor(c.value)}
                          className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center ${
                            borderColor === c.value
                              ? 'border-indigo-600 scale-110 shadow-md'
                              : 'border-slate-300 dark:border-slate-600'
                          }`}
                          style={{
                            backgroundColor: c.value === 'transparent' ? '#fff' : c.value,
                            backgroundImage: c.value === 'transparent' ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%)' : 'none',
                            backgroundSize: '8px 8px',
                          }}
                          title={c.name}
                        >
                          {borderColor === c.value && <Check className="w-3 h-3 text-indigo-600" />}
                        </button>
                      ))}
                      <input
                        type="color"
                        value={borderColor === 'transparent' ? '#ffffff' : borderColor}
                        onChange={(e) => setBorderColor(e.target.value)}
                        className="w-7 h-7 rounded-full border-0 cursor-pointer p-0 bg-transparent"
                        title="Custom Color"
                      />
                    </div>
                  </div>
                )}

                {/* Gradient Color Presets */}
                {bgStyle === 'gradient' && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest">Gradient Colors</span>
                      <span className="font-mono text-slate-500">{borderColor} → {gradientEndColor}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Start:</span>
                        <input
                          type="color"
                          value={borderColor}
                          onChange={(e) => setBorderColor(e.target.value)}
                          className="w-7 h-7 rounded-full border-0 cursor-pointer p-0 bg-transparent"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">End:</span>
                        <input
                          type="color"
                          value={gradientEndColor}
                          onChange={(e) => setGradientEndColor(e.target.value)}
                          className="w-7 h-7 rounded-full border-0 cursor-pointer p-0 bg-transparent"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Padding / Border Thickness Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">Border Thickness</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                      {uniformPadding} px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="150"
                    value={uniformPadding}
                    onChange={(e) => setUniformPadding(Number(e.target.value))}
                    className="range-styled w-full"
                  />
                </div>

                {/* Corner Radius Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">Rounded Corners</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                      {borderRadius} px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="80"
                    value={borderRadius}
                    onChange={(e) => setBorderRadius(Number(e.target.value))}
                    className="range-styled w-full"
                  />
                </div>

                {/* Drop Shadow Toggle & Blur */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Soft Drop Shadow
                    </label>
                    <button
                      onClick={() => setHasShadow((prev) => !prev)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                        hasShadow ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600'
                      }`}
                    >
                      {hasShadow ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                  {hasShadow && (
                    <input
                      type="range"
                      min="5"
                      max="60"
                      value={shadowBlur}
                      onChange={(e) => setShadowBlur(Number(e.target.value))}
                      className="range-styled w-full"
                    />
                  )}
                </div>

                {/* Export Format */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Export Format
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'image/png', label: 'PNG (Lossless)' },
                      { id: 'image/jpeg', label: 'JPEG' },
                      { id: 'image/webp', label: 'WebP' },
                    ].map((fmt) => (
                      <button
                        key={fmt.id}
                        onClick={() => setExportFormat(fmt.id as any)}
                        className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer text-center ${
                          exportFormat === fmt.id
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/10'
                            : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {fmt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* JPEG Quality Slider */}
                {exportFormat === 'image/jpeg' && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-500 uppercase tracking-wider text-[10px]">JPEG Quality</span>
                      <span className="text-indigo-600 dark:text-indigo-400">{jpegQuality}%</span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="100"
                      value={jpegQuality}
                      onChange={(e) => setJpegQuality(Number(e.target.value))}
                      className="range-styled w-full"
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2 flex flex-col gap-2.5">
                  <button
                    onClick={handleDownload}
                    disabled={isProcessing}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isProcessing ? 'Rendering...' : 'Download Framed Image'}</span>
                  </button>

                  <button
                    onClick={handleReset}
                    className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Upload New Image</span>
                  </button>
                </div>

              </div>
            </div>

            {/* Right Canvas Stage */}
            <div className="lg:col-span-8 order-1 lg:order-2 flex flex-col gap-4">
              <div className="relative rounded-3xl bg-slate-900/90 dark:bg-black/90 p-8 min-h-[460px] flex items-center justify-center overflow-hidden select-none border border-slate-800 shadow-2xl">
                <canvas
                  ref={canvasRef}
                  className="max-h-[520px] max-w-full object-contain rounded-lg shadow-2xl"
                />
              </div>

              {/* Stage Bottom Bar */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2 font-medium">
                <span>Output Dimensions: {imageSize.width + currentLeft + currentRight} × {imageSize.height + currentTop + currentBottom} px</span>
                <span>100% In-Browser Framing Engine</span>
              </div>
            </div>

          </div>
        )}

        {/* SEO Guide Section */}
        <div className="mt-16 border-t border-slate-200/60 dark:border-slate-800 pt-12">
          <ToolGuide
            toolName="Canvas Border Expander"
            introText="Add aesthetic borders, frame padding, frosted glass background letterboxing, and rounded corners to photos directly in your browser."
            competitorComparison={{
              alternatives: ['Canva Frames', 'PhotoRoom Border', 'PineTools Border'],
              benefit: 'Add padding, shadows, and frosted blurs without watermarks, subscriptions, or remote image uploads. Everything processes safely in your browser canvas.',
            }}
            steps={[
              { title: 'Upload Your Photo', description: 'Drop any PNG, JPEG, WebP, or HEIC image into the browser.' },
              { title: 'Choose Background Style', description: 'Select a solid color, custom HEX palette, or frosted glass blur.' },
              { title: 'Customize Corners & Shadow', description: 'Adjust padding thickness, corner radius rounding, and soft drop shadow blur.' },
              { title: 'Download in High Resolution', description: 'Export your framed graphic in lossless PNG, JPEG, or WebP format instantly.' },
            ]}
            features={[
              'Uniform border padding slider with live preview',
              'Solid color, custom HEX palette, and frosted glass blur backdrops',
              'Smooth corner radius rounding & realistic drop shadow generation',
              '100% Client-side sandbox processing'
            ]}
            faq={[
              { q: 'What is the frosted glass blur effect?', a: 'It scales and heavily blurs your source photo in the background, creating a stylish backdrop effect popular on Instagram and social feeds.' },
              { q: 'Can I create rounded photo cards with shadows?', a: 'Yes! Increase the corner radius and toggle Drop Shadow to generate realistic UI presentation cards.' }
            ]}
          />
        </div>

      </div>
    </div>
  );
};
