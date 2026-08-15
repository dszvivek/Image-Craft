import React, { useState, useEffect } from 'react';
import { RefreshCw, FolderArchive, ChevronLeft, ChevronRight, Eye, Maximize2 } from 'lucide-react';
import { DropZone } from '../components/DropZone';
import { SEO } from '../components/SEO';
import { ToolGuide } from '../components/ToolGuide';
import { DemoPreview } from '../components/DemoPreview';
import JSZip from 'jszip';

interface AspectOption {
  id: string;
  name: string;
  w: number;
  h: number;
  ratio: number;
  description: string;
}

const ASPECT_OPTIONS: AspectOption[] = [
  {
    id: 'portrait',
    name: 'Instagram Portrait (4:5)',
    w: 1080,
    h: 1350,
    ratio: 4 / 5,
    description: '1080×1350px • Maximum screen real estate on Instagram feed'
  },
  {
    id: 'square',
    name: 'Instagram Square (1:1)',
    w: 1080,
    h: 1080,
    ratio: 1,
    description: '1080×1080px • Classic symmetrical social square'
  },
  {
    id: 'story',
    name: 'Story / Reel / TikTok (9:16)',
    w: 1080,
    h: 1920,
    ratio: 9 / 16,
    description: '1080×1920px • Full vertical mobile stories'
  }
];

interface InstagramPanoramaSplitterProps {
  pageTitle?: string;
  pageSubtitle?: string;
}

export const InstagramPanoramaSplitter: React.FC<InstagramPanoramaSplitterProps> = ({
  pageTitle,
  pageSubtitle,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Settings
  const [slideCount, setSlideCount] = useState<number>(3); // 2 to 10
  const [aspectId, setAspectId] = useState<string>('portrait');
  const [verticalOffset, setVerticalOffset] = useState<number>(50); // 0 (top) to 100 (bottom)
  const [jpegQuality, setJpegQuality] = useState<number>(95);

  const [slideThumbnails, setSlideThumbnails] = useState<string[]>([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
      const f = files[0];
      setFile(f);
      const url = URL.createObjectURL(f);
      setImageUrl(url);

      const img = new Image();
      img.src = url;
      img.onload = () => {
        setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
        // Recommend slide count based on natural aspect ratio
        const naturalRatio = img.naturalWidth / img.naturalHeight;
        const recommendedSlides = Math.max(2, Math.min(6, Math.round(naturalRatio / 0.8)));
        setSlideCount(recommendedSlides);
      };
    }
  };

  // Slice Panorama into Slides
  useEffect(() => {
    if (!imageUrl || imageSize.width === 0 || imageSize.height === 0) return;

    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      const activeAspect = ASPECT_OPTIONS.find((a) => a.id === aspectId) || ASPECT_OPTIONS[0];
      const targetSlideW = activeAspect.w;
      const targetSlideH = activeAspect.h;

      // Calculate total panorama crop geometry
      // The total crop width = targetSlideW * slideCount in target space
      // Total aspect ratio = (targetSlideW * slideCount) / targetSlideH
      const totalTargetRatio = (targetSlideW * slideCount) / targetSlideH;
      const imgRatio = imageSize.width / imageSize.height;

      let cropW = imageSize.width;
      let cropH = imageSize.height;
      let cropX = 0;
      let cropY = 0;

      if (imgRatio > totalTargetRatio) {
        // Image is wider than total panorama: crop left/right or fit height
        cropH = imageSize.height;
        cropW = cropH * totalTargetRatio;
        cropX = (imageSize.width - cropW) / 2;
        cropY = 0;
      } else {
        // Image is taller: crop top/bottom based on verticalOffset
        cropW = imageSize.width;
        cropH = cropW / totalTargetRatio;
        cropX = 0;
        const maxOffsetY = imageSize.height - cropH;
        cropY = maxOffsetY * (verticalOffset / 100);
      }

      const singleSliceSrcW = cropW / slideCount;
      const newThumbs: string[] = [];

      for (let i = 0; i < slideCount; i++) {
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = targetSlideW;
        sliceCanvas.height = targetSlideH;
        const ctx = sliceCanvas.getContext('2d');
        if (ctx) {
          const sliceSrcX = cropX + i * singleSliceSrcW;
          ctx.drawImage(
            img,
            sliceSrcX,
            cropY,
            singleSliceSrcW,
            cropH,
            0,
            0,
            targetSlideW,
            targetSlideH
          );
          newThumbs.push(sliceCanvas.toDataURL('image/jpeg', 0.85));
        }
      }

      setSlideThumbnails(newThumbs);
      if (activeSlideIndex >= slideCount) {
        setActiveSlideIndex(0);
      }
    };
  }, [imageUrl, imageSize, slideCount, aspectId, verticalOffset]);

  // Export ZIP Package
  const handleDownloadZip = async () => {
    if (!imageUrl || imageSize.width === 0 || imageSize.height === 0) return;
    setIsProcessing(true);

    const img = new Image();
    img.src = imageUrl;
    await new Promise((resolve) => {
      img.onload = resolve;
    });

    const activeAspect = ASPECT_OPTIONS.find((a) => a.id === aspectId) || ASPECT_OPTIONS[0];
    const targetSlideW = activeAspect.w;
    const targetSlideH = activeAspect.h;

    const totalTargetRatio = (targetSlideW * slideCount) / targetSlideH;
    const imgRatio = imageSize.width / imageSize.height;

    let cropW = imageSize.width;
    let cropH = imageSize.height;
    let cropX = 0;
    let cropY = 0;

    if (imgRatio > totalTargetRatio) {
      cropH = imageSize.height;
      cropW = cropH * totalTargetRatio;
      cropX = (imageSize.width - cropW) / 2;
      cropY = 0;
    } else {
      cropW = imageSize.width;
      cropH = cropW / totalTargetRatio;
      cropX = 0;
      const maxOffsetY = imageSize.height - cropH;
      cropY = maxOffsetY * (verticalOffset / 100);
    }

    const singleSliceSrcW = cropW / slideCount;
    const zip = new JSZip();
    const baseName = file?.name.replace(/\.[^/.]+$/, '') || 'instagram-panorama';

    for (let i = 0; i < slideCount; i++) {
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = targetSlideW;
      sliceCanvas.height = targetSlideH;
      const ctx = sliceCanvas.getContext('2d');
      if (ctx) {
        const sliceSrcX = cropX + i * singleSliceSrcW;
        ctx.drawImage(
          img,
          sliceSrcX,
          cropY,
          singleSliceSrcW,
          cropH,
          0,
          0,
          targetSlideW,
          targetSlideH
        );

        const blob = await new Promise<Blob | null>((res) =>
          sliceCanvas.toBlob(res, 'image/jpeg', jpegQuality / 100)
        );

        if (blob) {
          const slideNum = String(i + 1).padStart(2, '0');
          zip.file(`${slideNum}_${baseName}_${targetSlideW}x${targetSlideH}.jpg`, blob);
        }
      }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const zipUrl = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = zipUrl;
    a.download = `${baseName}-carousel-${slideCount}-slides.zip`;
    a.click();
    URL.revokeObjectURL(zipUrl);

    setIsProcessing(false);
  };

  const handleReset = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setFile(null);
    setImageUrl('');
    setImageSize({ width: 0, height: 0 });
    setSlideThumbnails([]);
    setActiveSlideIndex(0);
    setSlideCount(3);
  };

  const panoramaSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Instagram Panorama & Swipe Carousel Splitter - ImagePlumber',
    'applicationCategory': 'MultimediaApplication',
    'operatingSystem': 'Web Browser',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD',
    },
    'description': 'Split wide landscape panoramas into seamless multi-slide carousels for Instagram and TikTok. 100% private in-browser tool with 1-click ZIP export.',
    'featureList': [
      'Split panoramas into 2 to 10 continuous seamless slides',
      'Instagram 4:5 Portrait (1080x1350), 1:1 Square, and 9:16 Story presets',
      'Interactive in-browser Instagram swipe simulator',
      '1-Click ZIP Archive export with sequential file naming'
    ]
  };

  return (
    <div className="py-8 md:py-12 max-w-7xl mx-auto px-4 sm:px-6">
      <SEO
        title={pageTitle || "Instagram Panorama Splitter & Seamless Carousel Maker Free | ImagePlumber"}
        description={pageSubtitle || "Split panoramic photos into seamless swipeable carousels for Instagram (4:5 Portrait & 1:1 Square). 100% free with batch ZIP export."}
        canonicalUrl="https://imageplumber.com/instagram-panorama-splitter"
        schema={panoramaSchema}
      />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 border border-pink-200 dark:border-pink-800 text-pink-650 dark:text-pink-300 text-xs font-semibold uppercase tracking-wider mb-4">
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Seamless Social Swipe Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-tight mb-4">
          {pageTitle || "Instagram Panorama Splitter"}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
          {pageSubtitle || "Transform wide panoramic photos into seamless swipeable multi-slide carousels for Instagram (4:5 Portrait & 1:1 Square) with zero line breaks."}
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        {!imageUrl ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
            <div className="md:col-span-7 flex flex-col justify-center">
              <DropZone
                onFilesSelected={handleFilesSelected}
                title="Drop wide panorama or landscape photo"
                subtitle="Supports JPG, PNG, WebP, HEIC up to 50MB"
              />
            </div>
            <div className="md:col-span-5 flex">
              <div className="premium-bento rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between w-full shadow-sm">
                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-pink-650 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/50 border border-pink-100 dark:border-pink-900 px-2 py-0.5 rounded uppercase tracking-wider inline-block">
                    Swipeable Feed Magic
                  </div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Zero-Gap Continuous Panoramic Swipes</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    Slice your panoramic landscapes into 1080×1350px slides that flow seamlessly into each other as followers swipe on Instagram.
                  </p>
                </div>
                <DemoPreview toolId="panorama" alt="Instagram Panorama Splitter Preview" />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Control Sidebar (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="premium-bento p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-5 shadow-xl shadow-slate-200/20 dark:shadow-none">
                
                {/* Number of Slides */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                    <span>Number of Swipe Slides</span>
                    <span className="font-mono text-pink-600">{slideCount} Slides</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <button
                        key={num}
                        onClick={() => setSlideCount(num)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                          slideCount === num
                            ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aspect Ratio Presets */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Post Aspect Ratio
                  </label>
                  <div className="space-y-1.5">
                    {ASPECT_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setAspectId(opt.id)}
                        className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          aspectId === opt.id
                            ? 'bg-pink-50 dark:bg-pink-950/40 border-pink-300 dark:border-pink-700 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                            {opt.name}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate max-w-[240px]">
                            {opt.description}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vertical Horizon Alignment Slider */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                    <span>Vertical Horizon Position</span>
                    <span className="font-mono text-pink-600">{verticalOffset}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={verticalOffset}
                    onChange={(e) => setVerticalOffset(Number(e.target.value))}
                    className="range-styled w-full"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    <span>Top Horizon (0%)</span>
                    <span>Center (50%)</span>
                    <span>Bottom Horizon (100%)</span>
                  </div>
                </div>

                {/* JPEG Quality */}
                <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                    <span>JPEG Compression Quality</span>
                    <span className="font-mono text-pink-600">{jpegQuality}%</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="100"
                    value={jpegQuality}
                    onChange={(e) => setJpegQuality(Number(e.target.value))}
                    className="range-styled w-full"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleReset}
                    className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Reset</span>
                  </button>
                  <button
                    onClick={handleDownloadZip}
                    disabled={isProcessing}
                    className="flex-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-pink-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <FolderArchive className="w-4 h-4" />
                    <span>{isProcessing ? 'Generating ZIP...' : `Download ${slideCount} Slides (ZIP)`}</span>
                  </button>
                </div>

              </div>
            </div>

            {/* Stage Preview (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Instagram Feed Swipe Simulator */}
              <div className="relative rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col items-center justify-center shadow-2xl overflow-hidden">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-pink-500" />
                  <span>Instagram Live Swipe Simulator (Slide {activeSlideIndex + 1} of {slideCount})</span>
                </div>

                {slideThumbnails.length > 0 && (
                  <div className="relative max-w-[320px] w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-black aspect-[4/5] flex items-center justify-center">
                    <img
                      src={slideThumbnails[activeSlideIndex]}
                      alt={`Slide ${activeSlideIndex + 1}`}
                      className="w-full h-full object-cover select-none"
                    />

                    {/* Left / Right Nav Arrows */}
                    {activeSlideIndex > 0 && (
                      <button
                        onClick={() => setActiveSlideIndex((prev) => prev - 1)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    )}

                    {activeSlideIndex < slideCount - 1 && (
                      <button
                        onClick={() => setActiveSlideIndex((prev) => prev + 1)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}

                    {/* Pagination Dots */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/50 px-2.5 py-1 rounded-full backdrop-blur-md">
                      {slideThumbnails.map((_, i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full transition-all ${
                            activeSlideIndex === i ? 'bg-white scale-125' : 'bg-white/40'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Strip of all slides */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Continuous Strip Overview ({slideCount} Slices)
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {slideThumbnails.map((thumb, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveSlideIndex(idx)}
                      className={`relative shrink-0 w-24 sm:w-28 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                        activeSlideIndex === idx
                          ? 'border-pink-500 shadow-md scale-105'
                          : 'border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={thumb} alt={`Slice ${idx + 1}`} className="w-full object-cover" />
                      <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        #{idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2 font-medium">
                <span>Source: {imageSize.width} × {imageSize.height} px</span>
                <span>Pre-sliced in Local RAM</span>
              </div>
            </div>

          </div>
        )}

        {/* SEO Guide Section */}
        <div className="mt-16 border-t border-slate-200/60 dark:border-slate-800 pt-12">
          <ToolGuide
            toolName="Instagram Panorama & Seamless Swipe Carousel Splitter"
            introText="Turn any panoramic photo into a seamless, continuous swipeable carousel for Instagram and TikTok feeds with zero gap lines."
            competitorComparison={{
              alternatives: ['PanoraSplit', 'Unsquared', 'Swipeable App'],
              benefit: 'Our panorama splitter processes high-resolution panoramas directly in your browser memory with full 1080x1350px portrait support and downloads all slides in a clean ZIP archive with zero watermarks or app store subscriptions.',
            }}
            steps={[
              { title: 'Upload Panorama', description: 'Drop your landscape or wide panoramic photo.' },
              { title: 'Choose Slide Count & Ratio', description: 'Select 2 to 10 slides and choose Instagram Portrait (4:5) for maximum screen presence.' },
              { title: 'Test in Swipe Simulator', description: 'Interact with the live simulator to preview how followers will experience the swipe in their feeds.' },
              { title: 'Download ZIP', description: 'Click Download ZIP to receive all sequentially numbered slides ready for instant multi-photo posting.' },
            ]}
            features={[
              'Split wide photos into 2 to 10 seamless carousel slides',
              'Instagram Portrait (4:5 • 1080x1350px) and Square (1:1) presets',
              'Live in-browser swipeable carousel simulator',
              '1-Click ZIP Archive export with sequential file names'
            ]}
            faq={[
              { q: 'Why is 4:5 Portrait recommended for Instagram carousels?', a: 'The 4:5 aspect ratio (1080x1350px) occupies the maximum vertical screen space on mobile feeds, driving higher engagement and swipe-through rates.' },
              { q: 'How do I upload the split slides to Instagram?', a: 'Unzip the downloaded archive, open Instagram, select "Select Multiple", and tap slides 01, 02, 03 in sequential order.' }
            ]}
          />
        </div>

      </div>
    </div>
  );
};
