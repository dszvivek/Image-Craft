import React, { useState, useEffect, useRef } from 'react';
import { Download, RefreshCw, SunMedium, Moon, Sparkles } from 'lucide-react';
import { DropZone } from '../components/DropZone';
import { SEO } from '../components/SEO';
import { ToolGuide } from '../components/ToolGuide';
import { DemoPreview } from '../components/DemoPreview';

interface ColorInverterProps {
  initialMode?: 'invert' | 'bw' | 'solarize';
  pageTitle?: string;
  pageSubtitle?: string;
}

export const ColorInverter: React.FC<ColorInverterProps> = ({
  initialMode = 'invert',
  pageTitle,
  pageSubtitle,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const [mode, setMode] = useState<'invert' | 'bw' | 'solarize'>(initialMode);
  
  // Channel Inversion toggles
  const [invertRed, setInvertRed] = useState<boolean>(true);
  const [invertGreen, setInvertGreen] = useState<boolean>(true);
  const [invertBlue, setInvertBlue] = useState<boolean>(true);

  // B&W / Solarize Thresholds
  const [bwThreshold, setBwThreshold] = useState<number>(128); // 0 to 255
  const [solarizeThreshold, setSolarizeThreshold] = useState<number>(128); // 0 to 255
  const [isGrayscaleMode, setIsGrayscaleMode] = useState<boolean>(false); // Grayscale vs 1-bit binary

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

  // Render & Process Canvas
  useEffect(() => {
    if (!imageSrc || imageSize.width === 0 || imageSize.height === 0) return;

    const img = new Image();
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

      ctx.drawImage(img, 0, 0, w, h);
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const luma = 0.299 * r + 0.587 * g + 0.114 * b;

        if (mode === 'invert') {
          if (invertRed) data[i] = 255 - r;
          if (invertGreen) data[i + 1] = 255 - g;
          if (invertBlue) data[i + 2] = 255 - b;
        } else if (mode === 'bw') {
          if (isGrayscaleMode) {
            // Smooth grayscale
            data[i] = luma;
            data[i + 1] = luma;
            data[i + 2] = luma;
          } else {
            // 1-bit high-contrast black & white binarization
            const val = luma >= bwThreshold ? 255 : 0;
            data[i] = val;
            data[i + 1] = val;
            data[i + 2] = val;
          }
        } else if (mode === 'solarize') {
          // Solarization: Invert values above threshold
          data[i] = r > solarizeThreshold ? 255 - r : r;
          data[i + 1] = g > solarizeThreshold ? 255 - g : g;
          data[i + 2] = b > solarizeThreshold ? 255 - b : b;
        }
      }

      ctx.putImageData(imgData, 0, 0);
    };
  }, [
    imageSrc,
    imageSize,
    mode,
    invertRed,
    invertGreen,
    invertBlue,
    bwThreshold,
    solarizeThreshold,
    isGrayscaleMode,
  ]);

  // Otsu's optimal thresholding calculation
  const applyAutoOtsu = () => {
    if (!imageSrc || imageSize.width === 0 || imageSize.height === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgData = ctx.getImageData(0, 0, imageSize.width, imageSize.height);
    const data = imgData.data;

    // Histogram computation
    const hist = new Array(256).fill(0);
    const total = imageSize.width * imageSize.height;
    for (let i = 0; i < data.length; i += 4) {
      const luma = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      hist[luma]++;
    }

    let sum = 0;
    for (let i = 0; i < 256; i++) sum += i * hist[i];

    let sumB = 0;
    let wB = 0;
    let wF = 0;
    let maxVar = 0;
    let threshold = 128;

    for (let t = 0; t < 256; t++) {
      wB += hist[t];
      if (wB === 0) continue;
      wF = total - wB;
      if (wF === 0) break;

      sumB += t * hist[t];
      const mB = sumB / wB;
      const mF = (sum - sumB) / wF;
      const betweenVar = wB * wF * (mB - mF) * (mB - mF);

      if (betweenVar > maxVar) {
        maxVar = betweenVar;
        threshold = t;
      }
    }

    setBwThreshold(threshold);
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
        const originalName = file?.name.replace(/\.[^/.]+$/, '') || 'inverter-output';
        const ext = exportFormat === 'image/png' ? 'png' : exportFormat === 'image/webp' ? 'webp' : 'jpg';
        a.download = `${originalName}-${mode === 'invert' ? 'inverted' : mode === 'bw' ? 'bw' : 'solarized'}-${Date.now()}.${ext}`;
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
    setInvertRed(true);
    setInvertGreen(true);
    setInvertBlue(true);
    setBwThreshold(128);
    setSolarizeThreshold(128);
    setIsGrayscaleMode(false);
  };

  const inverterSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Color Inverter & Black and White Converter - ImagePlumber',
    'applicationCategory': 'MultimediaApplication',
    'operatingSystem': 'Web Browser',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD',
    },
    'description': 'Invert photo colors to negative, convert images to high-contrast black and white, or apply solarization online for free. 100% private in-browser canvas processing.',
    'featureList': [
      'Full RGB Negative Color Inversion (255 - RGB)',
      'High-contrast B&W Binarization with Otsu Auto-Thresholding',
      'Solarization tone-line effect with adjustable threshold',
      'Lossless PNG, JPEG, and WebP export with zero cloud uploads'
    ]
  };

  return (
    <div className="py-8 md:py-12 max-w-7xl mx-auto px-4 sm:px-6">
      <SEO
        title={pageTitle || "Invert Colors & Black and White Converter Online Free | ImagePlumber"}
        description={pageSubtitle || "Invert image colors to negative or convert photos to high-contrast black and white online for free in your browser. 100% private with zero cloud uploads."}
        canonicalUrl="https://imageplumber.com/invert-colors"
        schema={inverterSchema}
      />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-650 dark:text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-4">
          <Moon className="w-3.5 h-3.5" />
          <span>Negative Color & Monochrome Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-tight mb-4">
          {pageTitle || "Invert Colors & B&W Converter"}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
          {pageSubtitle || "Invert RGB channels to photo negatives, extract pure 1-bit black & white scans, or apply solarization effects directly in your browser."}
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        {!imageSrc ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
            <div className="md:col-span-7 flex flex-col justify-center">
              <DropZone
                onFilesSelected={handleFilesSelected}
                title="Drop photo to invert colors or convert to B&W"
                subtitle="Supports JPG, PNG, WebP, HEIC up to 50MB"
              />
            </div>
            <div className="md:col-span-5 flex">
              <div className="premium-bento rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between w-full shadow-sm">
                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-indigo-650 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900 px-2 py-0.5 rounded uppercase tracking-wider inline-block">
                    Inverter Studio
                  </div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Negative & Otsu Binarization</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    Convert photographs to photographic negatives or extract pure 1-bit high-contrast black & white scans for OCR.
                  </p>
                </div>
                <DemoPreview toolId="invert" alt="Color Inverter Preview" />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Control Sidebar (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="premium-bento p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-6 shadow-xl shadow-slate-200/20 dark:shadow-none">
                
                {/* Mode Selector Tabs */}
                <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                  <button
                    onClick={() => setMode('invert')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      mode === 'invert'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>Invert Negative</span>
                  </button>
                  <button
                    onClick={() => setMode('bw')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      mode === 'bw'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <SunMedium className="w-3.5 h-3.5" />
                    <span>B&W Binarize</span>
                  </button>
                  <button
                    onClick={() => setMode('solarize')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      mode === 'solarize'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Solarize</span>
                  </button>
                </div>

                {/* Mode A: Negative Inversion Channels */}
                {mode === 'invert' && (
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest block">
                      Invert Channels
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setInvertRed(!invertRed)}
                        className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer text-center flex flex-col items-center gap-1.5 ${
                          invertRed
                            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 text-rose-700 dark:text-rose-300 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400'
                        }`}
                      >
                        <span className="w-3 h-3 rounded-full bg-rose-500" />
                        <span>Red ({invertRed ? 'ON' : 'OFF'})</span>
                      </button>

                      <button
                        onClick={() => setInvertGreen(!invertGreen)}
                        className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer text-center flex flex-col items-center gap-1.5 ${
                          invertGreen
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-700 dark:text-emerald-300 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400'
                        }`}
                      >
                        <span className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span>Green ({invertGreen ? 'ON' : 'OFF'})</span>
                      </button>

                      <button
                        onClick={() => setInvertBlue(!invertBlue)}
                        className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer text-center flex flex-col items-center gap-1.5 ${
                          invertBlue
                            ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-400 text-sky-700 dark:text-sky-300 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400'
                        }`}
                      >
                        <span className="w-3 h-3 rounded-full bg-sky-500" />
                        <span>Blue ({invertBlue ? 'ON' : 'OFF'})</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Mode B: Black and White Controls */}
                {mode === 'bw' && (
                  <div className="space-y-4">
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                      <button
                        onClick={() => setIsGrayscaleMode(false)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          !isGrayscaleMode ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-slate-500'
                        }`}
                      >
                        1-Bit Binary B&W
                      </button>
                      <button
                        onClick={() => setIsGrayscaleMode(true)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isGrayscaleMode ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-slate-500'
                        }`}
                      >
                        Smooth Grayscale
                      </button>
                    </div>

                    {!isGrayscaleMode && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-[10px] text-slate-400 uppercase tracking-widest">Binarization Threshold</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                              {bwThreshold} / 255
                            </span>
                            <button
                              onClick={applyAutoOtsu}
                              className="text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 text-indigo-600 dark:text-indigo-300 font-bold px-2 py-1 rounded border border-indigo-200/50 cursor-pointer"
                              title="Calculate Otsu's optimal threshold"
                            >
                              Auto-Otsu
                            </button>
                          </div>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="255"
                          value={bwThreshold}
                          onChange={(e) => setBwThreshold(Number(e.target.value))}
                          className="range-styled w-full"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Mode C: Solarize Threshold Slider */}
                {mode === 'solarize' && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest">Solarization Cutoff</span>
                      <span className="font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                        {solarizeThreshold} / 255
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="255"
                      value={solarizeThreshold}
                      onChange={(e) => setSolarizeThreshold(Number(e.target.value))}
                      className="range-styled w-full"
                    />
                    <p className="text-[11px] text-slate-500">
                      Inverts only color values exceeding this threshold to create the Sabatier tone-line effect.
                    </p>
                  </div>
                )}

                {/* Export Format & Quality */}
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Output Format
                    </label>
                    <div className="flex gap-1.5">
                      {(['image/png', 'image/jpeg', 'image/webp'] as const).map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => setExportFormat(fmt)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            exportFormat === fmt
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {fmt === 'image/png' ? 'PNG' : fmt === 'image/jpeg' ? 'JPEG' : 'WebP'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {exportFormat === 'image/jpeg' && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-500">
                        <span>Quality</span>
                        <span>{jpegQuality}%</span>
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
                    className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Reset</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    disabled={isProcessing}
                    className="flex-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isProcessing ? 'Processing...' : 'Download Image'}</span>
                  </button>
                </div>

              </div>
            </div>

            {/* Preview Stage (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="relative rounded-3xl bg-slate-950/5 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 p-4 min-h-[420px] flex items-center justify-center overflow-hidden">
                <canvas
                  ref={canvasRef}
                  className="max-w-full max-h-[600px] object-contain rounded-2xl shadow-xl transition-all"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2 font-medium">
                <span>Dimensions: {imageSize.width} × {imageSize.height} px</span>
                <span>100% Client-Side Canvas Processing</span>
              </div>
            </div>

          </div>
        )}

        {/* SEO Guide Section */}
        <div className="mt-16 border-t border-slate-200/60 dark:border-slate-800 pt-12">
          <ToolGuide
            toolName="Color Inverter & Black and White Converter"
            introText="Invert photo colors to photo negatives, isolate individual RGB color channels, or convert scans to pure 1-bit high-contrast black and white directly in your browser."
            competitorComparison={{
              alternatives: ['PineTools Invert Colors', 'iLoveIMG Photo Editor', 'Adobe Express Invert'],
              benefit: 'Our color inverter runs locally on your device with zero upload latency or compression artifacts. Perfect for digitizing film negatives, OCR text preprocessing, and high-contrast thresholding.',
            }}
            steps={[
              { title: 'Upload Image', description: 'Drop any PNG, JPEG, WebP, or HEIC photo into the workspace.' },
              { title: 'Select Effect Mode', description: 'Choose between Negative Inversion, 1-Bit Black & White binarization, or Solarization.' },
              { title: 'Fine-Tune Thresholds', description: 'Adjust the binarization cutoff slider or click Auto-Otsu for automatic optimal contrast.' },
              { title: 'Download Negative/B&W File', description: 'Save your transformed image in lossless PNG, JPEG, or WebP format with zero server uploads.' },
            ]}
            features={[
              '1-Click RGB negative color inversion with individual channel toggles',
              '1-Bit Black & White binarization engine with Otsu optimal auto-thresholding',
              'Sabatier solarization tone-line generator',
              '100% Client-side sandbox execution with zero file size limits'
            ]}
            faq={[
              { q: 'How does the negative color inversion work?', a: 'Every pixel value (R, G, B) is subtracted from 255, creating a perfect photographic negative.' },
              { q: 'What is Otsu binarization useful for?', a: 'It calculates the mathematically optimal threshold to separate text and handwriting from document paper backgrounds, ideal for OCR preprocessing.' }
            ]}
          />
        </div>

      </div>
    </div>
  );
};
