import React, { useState, useEffect, useRef } from 'react';
import { Download, RefreshCw, RotateCw, RotateCcw, FlipHorizontal, FlipVertical, Grid } from 'lucide-react';
import { DropZone } from '../components/DropZone';
import { SEO } from '../components/SEO';
import { ToolGuide } from '../components/ToolGuide';
import { DemoPreview } from '../components/DemoPreview';

export const ImageRotator: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Transformations
  const [rotationSteps, setRotationSteps] = useState<number>(0); // 0, 90, 180, 270
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [fineAngle, setFineAngle] = useState<number>(0); // -45 to +45 deg
  const [fitMode, setFitMode] = useState<'expand' | 'crop'>('expand');
  const [showGrid, setShowGrid] = useState<boolean>(true);

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
        setRotationSteps(0);
        setFlipH(false);
        setFlipV(false);
        setFineAngle(0);
      };
    }
  };

  const totalAngle = (rotationSteps + fineAngle) % 360;

  // Render canvas transformation
  useEffect(() => {
    if (!imageSrc || imageSize.width === 0 || imageSize.height === 0) return;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rad = (totalAngle * Math.PI) / 180;
      const cos = Math.abs(Math.cos(rad));
      const sin = Math.abs(Math.sin(rad));

      const origW = imageSize.width;
      const origH = imageSize.height;

      let targetW = origW;
      let targetH = origH;

      if (fitMode === 'expand') {
        targetW = Math.round(origW * cos + origH * sin);
        targetH = Math.round(origW * sin + origH * cos);
      } else {
        // Crop mode (calculate inner maximal rectangle)
        targetW = origW;
        targetH = origH;
      }

      canvas.width = targetW;
      canvas.height = targetH;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, targetW, targetH);

      ctx.save();
      ctx.translate(targetW / 2, targetH / 2);
      ctx.rotate(rad);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, -origW / 2, -origH / 2);
      ctx.restore();
    };
  }, [imageSrc, imageSize, totalAngle, flipH, flipV, fitMode]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsProcessing(true);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const originalName = file?.name.replace(/\.[^/.]+$/, '') || 'rotated-image';
        const ext = exportFormat === 'image/jpeg' ? 'jpg' : exportFormat === 'image/webp' ? 'webp' : 'png';
        a.href = url;
        a.download = `${originalName}-rotated.${ext}`;
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
    setRotationSteps(0);
    setFineAngle(0);
    setFlipH(false);
    setFlipV(false);
  };

  const rotatorSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Image Rotator & Straightener - ImagePlumber',
    'applicationCategory': 'MultimediaApplication',
    'operatingSystem': 'Web Browser',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD',
    },
    'description': 'Rotate and flip images online for free with 90° increments, horizontal mirror flip, and a fine -45° to +45° straightener slider. 100% private in browser memory.',
    'featureList': [
      '1-Click 90° Clockwise & Counter-Clockwise Rotation',
      'Horizontal and Vertical Mirror Flipping',
      'Fine Angle Straightening Slider with Horizon Grid Alignment',
      'Lossless PNG, JPEG, and WebP Export',
    ],
  };

  return (
    <div className="w-full">
      <SEO
        title="Rotate & Flip Image Online Free (90°, 180°, Mirror) | ImagePlumber"
        description="Rotate images 90, 180, or 270 degrees online for free. Straighten crooked photos and mirror flip horizontally or vertically with zero cloud uploads."
        keywords="rotate image online, flip image horizontal, mirror image free, straighten photo online, rotate picture 90 degrees, photo orientation changer, image rotator without upload"
        canonicalUrl="https://imageplumber.com/rotate-image"
        schema={rotatorSchema}
      />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-indigo-650 uppercase tracking-widest px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-full shadow-sm">
            Geometry Engine
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-100 mt-3 mb-2">
            Image Rotator & Straightener
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Rotate 90°, flip mirror orientations, or fine-tune angles to straighten crooked horizons in browser RAM.
          </p>
        </div>

        {!imageSrc ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
            <div className="md:col-span-7 flex flex-col justify-center">
              <DropZone
                onFilesSelected={handleFilesSelected}
                title="Drop image to rotate & flip"
                subtitle="Supports JPG, PNG, WebP, HEIC up to 50MB"
              />
            </div>
            <div className="md:col-span-5 flex">
              <div className="premium-bento rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between w-full shadow-sm">
                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-indigo-650 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900 px-2 py-0.5 rounded uppercase tracking-wider inline-block">
                    Demo Preview
                  </div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Horizon Straightening</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    Correct tilted photography using the fine-angle slider with interactive alignment grid overlay.
                  </p>
                </div>
                <DemoPreview toolId="resizer" alt="Rotator Demo Preview" />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Controls Bar */}
            <div className="lg:col-span-4 flex flex-col gap-6 order-2 lg:order-1">
              <div className="premium-bento p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-6 shadow-sm">
                
                <h2 className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2 text-sm">
                  <RotateCw className="w-4 h-4 text-indigo-500" />
                  Orientation Controls
                </h2>

                {/* Quick 90° & Flip Buttons */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Quick Rotation & Flip
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setRotationSteps((prev) => (prev + 90) % 360)}
                      className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400 text-xs font-bold transition-all cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>Rotate +90°</span>
                    </button>

                    <button
                      onClick={() => setRotationSteps((prev) => (prev - 90 + 360) % 360)}
                      className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400 text-xs font-bold transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>Rotate -90°</span>
                    </button>

                    <button
                      onClick={() => setFlipH((prev) => !prev)}
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        flipH
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <FlipHorizontal className="w-3.5 h-3.5" />
                      <span>Flip Horizontal</span>
                    </button>

                    <button
                      onClick={() => setFlipV((prev) => !prev)}
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        flipV
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <FlipVertical className="w-3.5 h-3.5" />
                      <span>Flip Vertical</span>
                    </button>
                  </div>
                </div>

                {/* Fine Angle Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">Angle Straightener</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                      {fineAngle > 0 ? `+${fineAngle.toFixed(1)}°` : `${fineAngle.toFixed(1)}°`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-45"
                    max="45"
                    step="0.5"
                    value={fineAngle}
                    onChange={(e) => setFineAngle(Number(e.target.value))}
                    className="range-styled w-full"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                    <span>-45°</span>
                    <button
                      onClick={() => setFineAngle(0)}
                      className="hover:text-indigo-600 underline cursor-pointer"
                    >
                      Reset 0°
                    </button>
                    <span>+45°</span>
                  </div>
                </div>

                {/* Grid & Canvas Settings */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Alignment & Fill
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setShowGrid((prev) => !prev)}
                      className={`flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        showGrid
                          ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200/60 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Grid className="w-3.5 h-3.5" />
                      <span>{showGrid ? 'Grid On' : 'Grid Off'}</span>
                    </button>

                    <button
                      onClick={() => setFitMode(fitMode === 'expand' ? 'crop' : 'expand')}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer text-center"
                    >
                      {fitMode === 'expand' ? 'Canvas: Expand' : 'Canvas: Crop'}
                    </button>
                  </div>
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
                    <span>{isProcessing ? 'Rendering...' : 'Download Rotated Image'}</span>
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
              <div className="relative rounded-3xl bg-slate-900/90 dark:bg-black/90 p-6 min-h-[460px] flex items-center justify-center overflow-hidden select-none border border-slate-800 shadow-2xl">
                
                {/* Visual Horizon Grid Overlay */}
                {showGrid && (
                  <div className="absolute inset-0 pointer-events-none grid grid-cols-6 grid-rows-6 opacity-20">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div key={i} className="border-r border-b border-white" />
                    ))}
                  </div>
                )}

                <canvas
                  ref={canvasRef}
                  className="max-h-[520px] max-w-full object-contain rounded-lg shadow-xl"
                />
              </div>

              {/* Stage Bottom Bar */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2 font-medium">
                <span>Active Rotation: {totalAngle.toFixed(1)}° | Flip: {flipH ? 'H ' : ''}{flipV ? 'V' : ''}</span>
                <span>100% Client-Side Canvas Engine</span>
              </div>
            </div>

          </div>
        )}

        {/* SEO Guide Section */}
        <div className="mt-16 border-t border-slate-200/60 dark:border-slate-800 pt-12">
          <ToolGuide
            toolName="Image Rotator & Straightener"
            introText="Rotate photos 90°, 180°, or 270°, mirror flip orientations, or fine-tune crooked horizon angles in your browser memory."
            competitorComparison={{
              alternatives: ['iLoveIMG Rotate', 'RotateImage.net', 'PineTools'],
              benefit: 'Our image rotator performs canvas matrix coordinate transformations in client-side WebAssembly without re-compressing lossily or transmitting data to cloud servers.',
            }}
            steps={[
              { title: 'Drop Image File', description: 'Upload any PNG, JPEG, WebP, or HEIC photo directly into the browser canvas.' },
              { title: 'Rotate or Flip', description: 'Click Rotate +90°/-90° or Flip Horizontal to mirror your photo instantly.' },
              { title: 'Straighten Angle', description: 'Use the fine-angle slider to level crooked horizons with the visual grid.' },
              { title: 'Export Lossless', description: 'Download your rotated image in PNG, JPEG, or WebP format with zero server uploads.' },
            ]}
            features={[
              '1-Click 90° Clockwise & Counter-Clockwise rotation',
              'Horizontal and vertical mirror flipping',
              'Fine-tuning angle straightener slider (-45° to +45°)',
              '100% Client-side canvas processing with zero cloud uploads'
            ]}
            faq={[
              { q: 'Does rotating an image reduce its quality?', a: 'No, 90° and 180° rotations in PNG format are completely lossless.' },
              { q: 'How does horizon straightening work?', a: 'The angle slider rotates the canvas matrix and recalculates bounding boundaries to keep your photo centered.' }
            ]}
          />
        </div>

      </div>
    </div>
  );
};
