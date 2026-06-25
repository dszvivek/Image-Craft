import React, { useState, useEffect, useRef } from 'react';
import { Download, RefreshCw, Sparkles, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { DropZone } from '../components/DropZone';
import { SEO } from '../components/SEO';
import { ToolGuide } from '../components/ToolGuide';
import { DemoPreview } from '../components/DemoPreview';

export const Compressor: React.FC = () => {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [compressedUrl, setCompressedUrl] = useState<string>('');
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [quality, setQuality] = useState<number>(80);
  const [format, setFormat] = useState<string>('image/jpeg');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  const formatLabels: Record<string, string> = {
    'image/jpeg': 'JPEG',
    'image/png': 'PNG',
    'image/webp': 'WebP',
  };

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (compressedUrl) URL.revokeObjectURL(compressedUrl);
      const file = files[0];
      setOriginalFile(file);
      const url = URL.createObjectURL(file);
      setOriginalUrl(url);
      setCompressedUrl('');
    }
  };

  // Run compression when quality, format, or originalUrl change
  useEffect(() => {
    if (!originalUrl || !originalFile) return;

    const compressImage = async () => {
      setIsProcessing(true);
      const img = new Image();
      img.src = originalUrl;
      img.onload = () => {
        setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setIsProcessing(false);
          return;
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0);

        // Perform compression
        // PNG doesn't support quality compression via toBlob normally, so we convert it to JPEG/WebP or use quality reduction if outputting WebP
        const targetFormat = format;
        const targetQuality = quality / 100;

        canvas.toBlob(
          (blob) => {
            if (blob) {
              if (compressedUrl) {
                URL.revokeObjectURL(compressedUrl);
              }
              setCompressedUrl(URL.createObjectURL(blob));
              setCompressedSize(blob.size);
            }
            setIsProcessing(false);
          },
          targetFormat,
          targetQuality
        );
      };
      
      img.onerror = () => {
        setIsProcessing(false);
      };
    };

    const timer = setTimeout(compressImage, 300); // Debounce compression to prevent lag while sliding quality
    return () => clearTimeout(timer);
  }, [originalUrl, quality, format]);

  const originalUrlRef = useRef(originalUrl);
  originalUrlRef.current = originalUrl;
  const compressedUrlRef = useRef(compressedUrl);
  compressedUrlRef.current = compressedUrl;

  // Clean up Object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (originalUrlRef.current) URL.revokeObjectURL(originalUrlRef.current);
      if (compressedUrlRef.current) URL.revokeObjectURL(compressedUrlRef.current);
    };
  }, []);

  const handleSliderMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let clientX = 0;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }
    const relativeX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (relativeX / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleDownload = () => {
    if (!compressedUrl || !originalFile) return;
    const ext = format.split('/')[1];
    const link = document.createElement('a');
    link.href = compressedUrl;
    link.download = `compressed_${originalFile.name.substring(0, originalFile.name.lastIndexOf('.'))}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    setOriginalFile(null);
    setOriginalUrl('');
    setCompressedUrl('');
    setCompressedSize(null);
    setQuality(80);
    setFormat('image/jpeg');
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const compressionSavings = originalFile && compressedSize
    ? Math.max(0, Math.round(((originalFile.size - compressedSize) / originalFile.size) * 100))
    : 0;

  const compressorSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Image Compressor - ImageGiri',
    'applicationCategory': 'MultimediaApplication',
    'operatingSystem': 'Web Browser',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    },
    'description': 'Compress JPEG, PNG, and WebP images locally in your browser. Reduce image file sizes by up to 90% without losing quality. No uploads, 100% private.',
    'featureList': [
      'Lossy and lossless file size reduction',
      'Interactive visual comparison slider',
      'Local offline processing in browser',
      'Custom quality level adjustment'
    ]
  };

  return (
    <div className="w-full">
      <SEO 
        title="Free Online Image Compressor - TinyPNG Alternative" 
        description="Compress JPEG, PNG, and WebP images locally in your browser. Reduce image file sizes by up to 90% without losing quality. A 100% private alternative to TinyPNG and Optimizilla." 
        keywords="image compressor, compress image online, reduce image size, JPEG compressor, PNG compressor, WebP compressor, image optimizer, reduce photo size, free image compression, offline image compressor, browser image compressor, lossless compression, lossy compression, file size reducer, TinyPNG alternative, Optimizilla alternative, Compressjpeg replacement, free offline tinypng, compress image without upload"
        canonicalUrl="https://imagegiri.com/image-compressor"
        schema={compressorSchema}
      />

      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-indigo-650 uppercase tracking-widest px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-full shadow-sm">
            Compression Tool
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-3 mb-2">Image Compressor</h1>
          <p className="text-sm text-slate-500">Reduce file size using modern browser compression algorithms. No files leave your device.</p>
        </div>

        {!originalFile ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
            <div className="md:col-span-7 flex flex-col justify-center">
              <DropZone 
                onFilesSelected={handleFilesSelected}
                title="Drop image to compress"
                subtitle="Supports JPG, PNG, WebP up to 50MB"
              />
            </div>
            <div className="md:col-span-5 flex">
              <div className="premium-bento rounded-3xl p-6 bg-white border border-slate-200/50 flex flex-col justify-between w-full shadow-sm hover:border-indigo-300 transition-all duration-300">
                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-indigo-650 bg-indigo-50/50 border border-indigo-100/60 px-2 py-0.5 rounded uppercase tracking-wider inline-block">Demo Preview</div>
                  <h3 className="text-base font-extrabold text-slate-900">How Compressor Works</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Run local, sandboxed file compression inside your browser cache. Adjust quality dynamically and compare originals side-by-side without cloud transmission.
                  </p>
                </div>
                <DemoPreview
                  toolId="compressor"
                  alt="Compressor Demo"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left controls column — sticky on desktop */}
            <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
              <div className="glass-card p-6 rounded-3xl space-y-6">
                
                <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Sparkles className="w-4.5 h-4.5 text-indigo-500" />
                  Compression Options
                </h3>

                {/* Output Format */}
                <div className="space-y-2.5">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">
                    Output Format
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['image/jpeg', 'image/png', 'image/webp'].map((f) => (
                      <button
                        key={f}
                        onClick={() => setFormat(f)}
                        className={`py-2.5 px-3 rounded-xl text-[11px] font-bold border transition-all cursor-pointer active:scale-95 ${
                          format === f
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                            : 'bg-white/80 border-slate-200/70 text-slate-655 hover:text-slate-900 hover:bg-slate-50/50'
                        }`}
                      >
                        {formatLabels[f]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quality Slider (only useful for JPEG/WebP) */}
                {format !== 'image/png' ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">
                        Quality
                      </label>
                      <span className="text-[10px] font-bold text-indigo-650 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded shadow-xs">
                        {quality}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))}
                      className="range-styled w-full"
                      style={{ '--slider-pct': `${((quality - 5) / 95) * 100}%` } as React.CSSProperties}
                    />
                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      <span>Size Saver</span>
                      <span>High Fidelity</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-indigo-50/50 border border-indigo-100/60 rounded-2xl flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-slate-600 leading-normal font-medium">
                      PNG compression uses lossless packing. To reduce PNG file size substantially, consider converting output format to <span className="font-semibold text-slate-900">WebP</span>.
                    </p>
                  </div>
                )}

                {/* Stats */}
                <div className="bg-white/70 border border-slate-200/50 rounded-2xl p-4.5 space-y-3.5 shadow-sm">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-450">Original Size:</span>
                    <span className="font-mono text-slate-700">{formatSize(originalFile.size)}</span>
                  </div>
                  
                  {compressedSize && (
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-450">Compressed:</span>
                      <span className="font-mono text-indigo-600 font-bold">{formatSize(compressedSize)}</span>
                    </div>
                  )}

                  {dimensions.width > 0 && (
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-450">Dimensions:</span>
                      <span className="font-mono text-slate-600">
                        {dimensions.width} × {dimensions.height}
                      </span>
                    </div>
                  )}

                  {compressionSavings > 0 && (
                    <div className="border-t border-slate-200/60 pt-3 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-750 flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-600" /> Saved:
                      </span>
                      <span className="text-sm font-black text-emerald-600">
                        -{compressionSavings}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Main CTA Action buttons */}
                <div className="flex flex-col gap-2.5 pt-2">
                  <button
                    onClick={handleDownload}
                    disabled={isProcessing || !compressedUrl}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-650 hover:from-indigo-550 hover:to-purple-550 disabled:opacity-50 text-[11px] font-bold uppercase tracking-wider text-white rounded-xl shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isProcessing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    Download Compressed Image
                  </button>

                  <button
                    onClick={handleReset}
                    className="w-full py-3 bg-white hover:bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-650 hover:text-slate-900 border border-slate-200/60 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Upload New Image
                  </button>
                </div>

              </div>
            </div>

            {/* Right preview column */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Header inside preview */}
              <div className="flex justify-between items-center glass-card rounded-2xl px-4 py-3 shadow-xs">
                <span className="text-xs font-bold text-slate-800">
                  Interactive Preview Slider (Before / After)
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  Drag divider to compare
                </span>
              </div>

              {/* Before/After Comparison Container */}
              <div 
                ref={containerRef}
                onMouseMove={handleSliderMove}
                onTouchMove={handleSliderMove}
                className="compare-container w-full h-[400px] md:h-[500px] border border-slate-200 rounded-2xl bg-slate-50/30 flex items-center justify-center relative cursor-ew-resize select-none overflow-hidden"
              >
                {/* Loader status */}
                {isProcessing && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-xs flex items-center justify-center z-20">
                    <div className="flex flex-col items-center gap-2.5">
                      <RefreshCw className="w-8 h-8 text-indigo-650 animate-spin" />
                      <span className="text-xs font-bold text-slate-750">Compressing...</span>
                    </div>
                  </div>
                )}

                {originalUrl && (
                  <div className="w-full h-full relative">
                    
                    {/* Before Image (Left/Bottom layer) */}
                    <img 
                      src={originalUrl} 
                      alt="Before compression" 
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none" 
                    />
                    <div className="absolute top-4 left-4 bg-white/95 border border-slate-200 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded text-slate-600 shadow-md">
                      Original
                    </div>

                    {/* After Image (Right/Top clipped layer) */}
                    {compressedUrl && (
                      <div 
                        className="compare-overlay absolute inset-0 w-full h-full pointer-events-none"
                        style={{ clipPath: `polygon(${sliderPosition}% 0, 100% 0, 100% 100%, ${sliderPosition}% 100%)` }}
                      >
                        <img 
                          src={compressedUrl} 
                          alt="After compression" 
                          className="absolute inset-0 w-full h-full object-contain pointer-events-none" 
                        />
                        <div className="absolute top-4 right-4 bg-indigo-50/95 border border-indigo-200 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded text-indigo-700 shadow-md">
                          Compressed
                        </div>
                      </div>
                    )}

                    {/* Slider Line */}
                    <div 
                      className="compare-slider"
                      style={{ left: `${sliderPosition}%` }}
                    >
                      <div className="compare-handle">
                        <ArrowRight className="w-4 h-4 scale-x-110" />
                      </div>
                    </div>

                  </div>
                )}
              </div>

              <div className="text-center">
                <span className="text-[11px] text-slate-500">
                  Double check quality: Left of divider is the original. Right of divider is compressed.
                </span>
              </div>

            </div>

          </div>
        )}

        <ToolGuide
          toolName="Image Compressor"
          introText="Optimize your images in seconds with our privacy-first local compressor. Adjust compression strength and compare results side-by-side without sending data to any servers."
          competitorComparison={{
            alternatives: ['TinyPNG', 'Optimizilla', 'Compressjpeg'],
            benefit: 'Unlike online services that upload your files to external cloud servers, ImageGiri compresses all images directly inside your browser cache. Zero kilobytes are uploaded, and files are processed instantly with zero cost and no subscription barriers.'
          }}
          steps={[
            {
              title: 'Upload Image',
              description: 'Drag and drop or browse to select a JPEG, PNG, or WebP file from your computer or mobile device.'
            },
            {
              title: 'Adjust Settings',
              description: 'Move the quality slider (5% to 100%) to configure the compression strength. Choose to convert the file to PNG, JPEG, or WebP format.'
            },
            {
              title: 'Compare & Download',
              description: 'Use the interactive preview slider to verify visual quality. Once satisfied, click "Download Compressed Image" to save.'
            }
          ]}
          features={[
            'Advanced local lossy & lossless image compression algorithms.',
            'Side-by-side interactive comparison slider (Before / After).',
            'Full support for popular image formats: JPEG, PNG, and WebP.',
            'Instant client-side file size reduction, ideal for optimizing web assets.',
            'Completely offline capable once loaded; works without internet access.'
          ]}
          faq={[
            {
              q: 'How much can I reduce my file size?',
              a: 'Usually between 50% to 90% depending on the format and detail of the image. Standard photos can be heavily optimized without noticeable quality loss.'
            },
            {
              q: 'Does it support batch image compression?',
              a: 'Yes, if you need to convert, merge, or compile multiple images into a single PDF or other formats at once, check out our Batch Image to PDF & Format Converter tool.'
            },
            {
              q: 'Are my private photos sent to any servers?',
              a: 'Never. The compression is computed entirely in your browser memory via JavaScript and local canvas contexts. No data leaves your machine.'
            }
          ]}
        />

      </div>
    </div>
  );
};
