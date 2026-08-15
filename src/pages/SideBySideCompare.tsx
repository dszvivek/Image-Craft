import React, { useState, useEffect, useRef } from 'react';
import { Download, RefreshCw, ArrowLeftRight, ArrowUpDown, Tag, Check } from 'lucide-react';
import { DropZone } from '../components/DropZone';
import { SEO } from '../components/SEO';
import { ToolGuide } from '../components/ToolGuide';
import { DemoPreview } from '../components/DemoPreview';

interface SideBySideCompareProps {
  initialOrientation?: 'horizontal' | 'vertical';
  pageTitle?: string;
  pageSubtitle?: string;
}

export const SideBySideCompare: React.FC<SideBySideCompareProps> = ({
  initialOrientation = 'horizontal',
  pageTitle,
  pageSubtitle,
}) => {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [image1Src, setImage1Src] = useState<string>('');
  const [image2Src, setImage2Src] = useState<string>('');

  const [size1, setSize1] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [size2, setSize2] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Settings
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>(initialOrientation);
  const [alignmentMode, setAlignmentMode] = useState<'match' | 'crop-equal'>('match');
  const [dividerWidth, setDividerWidth] = useState<number>(10);
  const [dividerColor, setDividerColor] = useState<string>('#FFFFFF');
  const [outerPadding, setOuterPadding] = useState<number>(0);
  const [bgColor, setBgColor] = useState<string>('#FFFFFF');
  const [borderRadius, setBorderRadius] = useState<number>(0);

  // Badge Options
  const [showBadges, setShowBadges] = useState<boolean>(true);
  const [label1, setLabel1] = useState<string>('BEFORE');
  const [label2, setLabel2] = useState<string>('AFTER');
  const [badgePosition, setBadgePosition] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('top-left');
  const [badgeBgColor, setBadgeBgColor] = useState<string>('#000000');
  const [badgeTextColor, setBadgeTextColor] = useState<string>('#FFFFFF');
  const [badgeOpacity, setBadgeOpacity] = useState<number>(75);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png');
  const [jpegQuality, setJpegQuality] = useState<number>(92);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFilesSelected1 = (files: File[]) => {
    if (files.length > 0) {
      if (image1Src) URL.revokeObjectURL(image1Src);
      const f = files[0];
      setFile1(f);
      const url = URL.createObjectURL(f);
      setImage1Src(url);

      const img = new Image();
      img.src = url;
      img.onload = () => setSize1({ width: img.naturalWidth, height: img.naturalHeight });
    }
  };

  const handleFilesSelected2 = (files: File[]) => {
    if (files.length > 0) {
      if (image2Src) URL.revokeObjectURL(image2Src);
      const f = files[0];
      setFile2(f);
      const url = URL.createObjectURL(f);
      setImage2Src(url);

      const img = new Image();
      img.src = url;
      img.onload = () => setSize2({ width: img.naturalWidth, height: img.naturalHeight });
    }
  };

  const handleSwapImages = () => {
    const tempFile = file1;
    const tempSrc = image1Src;
    const tempSize = size1;
    const tempLabel = label1;

    setFile1(file2);
    setImage1Src(image2Src);
    setSize1(size2);
    setLabel1(label2);

    setFile2(tempFile);
    setImage2Src(tempSrc);
    setSize2(tempSize);
    setLabel2(tempLabel);
  };

  // Draw Combined Canvas
  useEffect(() => {
    if (!image1Src || !image2Src || size1.width === 0 || size2.width === 0) return;

    const img1 = new Image();
    const img2 = new Image();
    img1.src = image1Src;
    img2.src = image2Src;

    let loadedCount = 0;
    const onLoaded = () => {
      loadedCount++;
      if (loadedCount < 2) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let drawW1 = size1.width;
      let drawH1 = size1.height;
      let drawW2 = size2.width;
      let drawH2 = size2.height;

      let totalCanvasW = 0;
      let totalCanvasH = 0;
      let pos1 = { x: 0, y: 0, w: 0, h: 0 };
      let pos2 = { x: 0, y: 0, w: 0, h: 0 };

      const pad = outerPadding;
      const div = dividerWidth;

      if (orientation === 'horizontal') {
        if (alignmentMode === 'match') {
          // Normalize to match heights
          const targetH = Math.max(size1.height, size2.height);
          drawW1 = Math.round(size1.width * (targetH / size1.height));
          drawH1 = targetH;
          drawW2 = Math.round(size2.width * (targetH / size2.height));
          drawH2 = targetH;
        } else {
          // Equal square width & height
          const commonSize = Math.max(size1.height, size2.height, size1.width, size2.width);
          drawW1 = commonSize;
          drawH1 = commonSize;
          drawW2 = commonSize;
          drawH2 = commonSize;
        }

        totalCanvasW = pad * 2 + drawW1 + div + drawW2;
        totalCanvasH = pad * 2 + Math.max(drawH1, drawH2);

        pos1 = { x: pad, y: pad, w: drawW1, h: drawH1 };
        pos2 = { x: pad + drawW1 + div, y: pad, w: drawW2, h: drawH2 };
      } else {
        // Vertical stack
        if (alignmentMode === 'match') {
          // Normalize to match widths
          const targetW = Math.max(size1.width, size2.width);
          drawW1 = targetW;
          drawH1 = Math.round(size1.height * (targetW / size1.width));
          drawW2 = targetW;
          drawH2 = Math.round(size2.height * (targetW / size2.width));
        } else {
          const commonSize = Math.max(size1.height, size2.height, size1.width, size2.width);
          drawW1 = commonSize;
          drawH1 = commonSize;
          drawW2 = commonSize;
          drawH2 = commonSize;
        }

        totalCanvasW = pad * 2 + Math.max(drawW1, drawW2);
        totalCanvasH = pad * 2 + drawH1 + div + drawH2;

        pos1 = { x: pad, y: pad, w: drawW1, h: drawH1 };
        pos2 = { x: pad, y: pad + drawH1 + div, w: drawW2, h: drawH2 };
      }

      canvas.width = totalCanvasW;
      canvas.height = totalCanvasH;

      // 1. Draw Canvas Background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, totalCanvasW, totalCanvasH);

      // 2. Draw Divider Line
      if (div > 0) {
        ctx.fillStyle = dividerColor;
        if (orientation === 'horizontal') {
          ctx.fillRect(pad + drawW1, pad, div, Math.max(drawH1, drawH2));
        } else {
          ctx.fillRect(pad, pad + drawH1, Math.max(drawW1, drawW2), div);
        }
      }

      // Helper function to draw rounded image
      const drawImageRounded = (
        img: HTMLImageElement,
        pos: { x: number; y: number; w: number; h: number },
        radius: number
      ) => {
        ctx.save();
        if (radius > 0) {
          ctx.beginPath();
          const r = Math.min(radius, pos.w / 2, pos.h / 2);
          ctx.moveTo(pos.x + r, pos.y);
          ctx.lineTo(pos.x + pos.w - r, pos.y);
          ctx.quadraticCurveTo(pos.x + pos.w, pos.y, pos.x + pos.w, pos.y + r);
          ctx.lineTo(pos.x + pos.w, pos.y + pos.h - r);
          ctx.quadraticCurveTo(pos.x + pos.w, pos.y + pos.h, pos.x + pos.w - r, pos.y + pos.h);
          ctx.lineTo(pos.x + r, pos.y + pos.h);
          ctx.quadraticCurveTo(pos.x, pos.y + pos.h, pos.x, pos.y + pos.h - r);
          ctx.lineTo(pos.x, pos.y + r);
          ctx.quadraticCurveTo(pos.x, pos.y, pos.x + r, pos.y);
          ctx.closePath();
          ctx.clip();
        }
        ctx.drawImage(img, pos.x, pos.y, pos.w, pos.h);
        ctx.restore();
      };

      drawImageRounded(img1, pos1, borderRadius);
      drawImageRounded(img2, pos2, borderRadius);

      // 3. Draw Badges
      if (showBadges) {
        const drawBadge = (
          text: string,
          pos: { x: number; y: number; w: number; h: number }
        ) => {
          if (!text.trim()) return;
          ctx.save();

          const fontSize = Math.max(16, Math.round(pos.w * 0.045));
          ctx.font = `bold ${fontSize}px sans-serif`;
          ctx.textBaseline = 'middle';

          const textMetrics = ctx.measureText(text);
          const badgePadX = fontSize * 0.75;
          const badgePadY = fontSize * 0.45;
          const badgeW = textMetrics.width + badgePadX * 2;
          const badgeH = fontSize + badgePadY * 2;
          const margin = Math.max(12, Math.round(pos.w * 0.03));

          let bx = pos.x + margin;
          let by = pos.y + margin;

          if (badgePosition === 'top-right') {
            bx = pos.x + pos.w - badgeW - margin;
            by = pos.y + margin;
          } else if (badgePosition === 'bottom-left') {
            bx = pos.x + margin;
            by = pos.y + pos.h - badgeH - margin;
          } else if (badgePosition === 'bottom-right') {
            bx = pos.x + pos.w - badgeW - margin;
            by = pos.y + pos.h - badgeH - margin;
          }

          // Badge Pill Background
          ctx.fillStyle = badgeBgColor;
          ctx.globalAlpha = badgeOpacity / 100;
          ctx.beginPath();
          const pillRadius = badgeH / 2;
          ctx.moveTo(bx + pillRadius, by);
          ctx.lineTo(bx + badgeW - pillRadius, by);
          ctx.quadraticCurveTo(bx + badgeW, by, bx + badgeW, by + pillRadius);
          ctx.lineTo(bx + badgeW, by + badgeH - pillRadius);
          ctx.quadraticCurveTo(bx + badgeW, by + badgeH, bx + badgeW - pillRadius, by + badgeH);
          ctx.lineTo(bx + pillRadius, by + badgeH);
          ctx.quadraticCurveTo(bx, by + badgeH, bx, by + badgeH - pillRadius);
          ctx.lineTo(bx, by + pillRadius);
          ctx.quadraticCurveTo(bx, by, bx + pillRadius, by);
          ctx.closePath();
          ctx.fill();

          // Badge Text
          ctx.globalAlpha = 1;
          ctx.fillStyle = badgeTextColor;
          ctx.fillText(text, bx + badgePadX, by + badgeH / 2);
          ctx.restore();
        };

        drawBadge(label1, pos1);
        drawBadge(label2, pos2);
      }
    };

    img1.onload = onLoaded;
    img2.onload = onLoaded;
  }, [
    image1Src,
    image2Src,
    size1,
    size2,
    orientation,
    alignmentMode,
    dividerWidth,
    dividerColor,
    outerPadding,
    bgColor,
    borderRadius,
    showBadges,
    label1,
    label2,
    badgePosition,
    badgeBgColor,
    badgeTextColor,
    badgeOpacity,
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
        a.href = url;
        const name1 = file1?.name.replace(/\.[^/.]+$/, '') || 'before';
        const name2 = file2?.name.replace(/\.[^/.]+$/, '') || 'after';
        const ext = exportFormat === 'image/png' ? 'png' : exportFormat === 'image/webp' ? 'webp' : 'jpg';
        a.download = `${name1}-vs-${name2}-compare.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
        setIsProcessing(false);
      },
      exportFormat,
      exportFormat === 'image/jpeg' ? jpegQuality / 100 : undefined
    );
  };

  const handleReset = () => {
    if (image1Src) URL.revokeObjectURL(image1Src);
    if (image2Src) URL.revokeObjectURL(image2Src);
    setFile1(null);
    setFile2(null);
    setImage1Src('');
    setImage2Src('');
    setSize1({ width: 0, height: 0 });
    setSize2({ width: 0, height: 0 });
  };

  const compareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Side-by-Side & Before/After Image Comparison - ImagePlumber',
    'applicationCategory': 'MultimediaApplication',
    'operatingSystem': 'Web Browser',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD',
    },
    'description': 'Combine two photos side-by-side or top-and-bottom with Before/After text badges and custom divider borders online for free.',
    'featureList': [
      'Horizontal side-by-side and vertical stack orientations',
      'Automatic height/width normalization and aspect ratio alignment',
      'Customizable BEFORE / AFTER badge pills with position and opacity controls',
      'Lossless PNG, JPEG with quality tuning, and WebP export'
    ]
  };

  return (
    <div className="py-8 md:py-12 max-w-7xl mx-auto px-4 sm:px-6">
      <SEO
        title={pageTitle || "Side by Side Image & Before/After Photo Combiner Free | ImagePlumber"}
        description={pageSubtitle || "Combine two photos side by side or vertically with customizable Before/After badges and divider borders online for free."}
        canonicalUrl="https://imageplumber.com/side-by-side-image"
        schema={compareSchema}
      />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-650 dark:text-blue-300 text-xs font-semibold uppercase tracking-wider mb-4">
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>Before & After Compositor</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-tight mb-4">
          {pageTitle || "Side by Side & Before/After Combiner"}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
          {pageSubtitle || "Combine two photos side-by-side or vertically with custom Before/After badges, divider borders, and aspect ratio normalization."}
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        {!image1Src || !image2Src ? (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Image 1 (Left / Before)</span>
                  {image1Src && <span className="text-xs text-emerald-600 font-bold flex items-center gap-1"><Check className="w-3 h-3" /> Ready</span>}
                </div>
                <DropZone
                  onFilesSelected={handleFilesSelected1}
                  title={image1Src ? "Replace Image 1" : "Upload Image 1 (Before)"}
                  subtitle="Supports JPG, PNG, WebP"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Image 2 (Right / After)</span>
                  {image2Src && <span className="text-xs text-emerald-600 font-bold flex items-center gap-1"><Check className="w-3 h-3" /> Ready</span>}
                </div>
                <DropZone
                  onFilesSelected={handleFilesSelected2}
                  title={image2Src ? "Replace Image 2" : "Upload Image 2 (After)"}
                  subtitle="Supports JPG, PNG, WebP"
                />
              </div>
            </div>

            <div className="premium-bento rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 max-w-md">
                <div className="text-[10px] font-bold text-blue-650 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 px-2 py-0.5 rounded uppercase tracking-wider inline-block">
                  Dual Image Stitcher
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Side-by-Side & Transformation Showcases</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  Perfect for fitness transformations, design mockups, photo editing comparisons, and real estate progress posts.
                </p>
              </div>
              <DemoPreview toolId="compare" alt="Side by Side Preview" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Control Sidebar (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="premium-bento p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-5 shadow-xl shadow-slate-200/20 dark:shadow-none">
                
                {/* Orientation & Swap */}
                <div className="flex gap-2">
                  <div className="grid grid-cols-2 gap-2 flex-1">
                    <button
                      onClick={() => setOrientation('horizontal')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        orientation === 'horizontal'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                      <span>Side by Side</span>
                    </button>
                    <button
                      onClick={() => setOrientation('vertical')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        orientation === 'vertical'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <ArrowUpDown className="w-3.5 h-3.5" />
                      <span>Top & Bottom</span>
                    </button>
                  </div>
                  <button
                    onClick={handleSwapImages}
                    title="Swap Image 1 and Image 2"
                    className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Swap</span>
                  </button>
                </div>

                {/* Alignment Mode */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Height / Width Alignment
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setAlignmentMode('match')}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                        alignmentMode === 'match'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Match Dimension
                    </button>
                    <button
                      onClick={() => setAlignmentMode('crop-equal')}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                        alignmentMode === 'crop-equal'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Equal Square
                    </button>
                  </div>
                </div>

                {/* Badges Toggle & Labels */}
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-blue-500" />
                      <span>Before / After Badges</span>
                    </span>
                    <button
                      onClick={() => setShowBadges(!showBadges)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        showBadges
                          ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-300 text-blue-700'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-400'
                      }`}
                    >
                      {showBadges ? 'Visible' : 'Hidden'}
                    </button>
                  </div>

                  {showBadges && (
                    <div className="space-y-2.5 pt-1">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                            Label 1
                          </label>
                          <input
                            type="text"
                            value={label1}
                            onChange={(e) => setLabel1(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                            Label 2
                          </label>
                          <input
                            type="text"
                            value={label2}
                            onChange={(e) => setLabel2(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                          />
                        </div>
                      </div>

                      {/* Badge Style & Position */}
                      <div className="grid grid-cols-2 gap-2 items-center">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                            Position
                          </label>
                          <select
                            value={badgePosition}
                            onChange={(e) => setBadgePosition(e.target.value as any)}
                            className="w-full px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold cursor-pointer"
                          >
                            <option value="top-left">Top Left</option>
                            <option value="top-right">Top Right</option>
                            <option value="bottom-left">Bottom Left</option>
                            <option value="bottom-right">Bottom Right</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-slate-400">
                            <span>Badge Opacity</span>
                            <span className="font-mono text-blue-600">{badgeOpacity}%</span>
                          </div>
                          <input
                            type="range"
                            min="20"
                            max="100"
                            value={badgeOpacity}
                            onChange={(e) => setBadgeOpacity(Number(e.target.value))}
                            className="range-styled w-full"
                          />
                        </div>
                      </div>
                      {/* Badge Colors */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                            Badge Background
                          </label>
                          <input
                            type="color"
                            value={badgeBgColor}
                            onChange={(e) => setBadgeBgColor(e.target.value)}
                            className="w-full h-7 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                            Badge Text Color
                          </label>
                          <input
                            type="color"
                            value={badgeTextColor}
                            onChange={(e) => setBadgeTextColor(e.target.value)}
                            className="w-full h-7 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Divider & Border Styling */}
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                        <span>Divider</span>
                        <span className="font-mono text-blue-600">{dividerWidth}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="30"
                        value={dividerWidth}
                        onChange={(e) => setDividerWidth(Number(e.target.value))}
                        className="range-styled w-full"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                        <span>Outer Pad</span>
                        <span className="font-mono text-blue-600">{outerPadding}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="40"
                        value={outerPadding}
                        onChange={(e) => setOuterPadding(Number(e.target.value))}
                        className="range-styled w-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                        Divider Color
                      </label>
                      <input
                        type="color"
                        value={dividerColor}
                        onChange={(e) => setDividerColor(e.target.value)}
                        className="w-full h-8 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                        Canvas Background
                      </label>
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-full h-8 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                      <span>Corner Radius</span>
                      <span className="font-mono text-blue-600">{borderRadius} px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={borderRadius}
                      onChange={(e) => setBorderRadius(Number(e.target.value))}
                      className="range-styled w-full"
                    />
                  </div>
                </div>

                {/* Export Options */}
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Export Format
                    </label>
                    <div className="flex gap-1.5">
                      {(['image/png', 'image/jpeg', 'image/webp'] as const).map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => setExportFormat(fmt)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            exportFormat === fmt
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {fmt === 'image/png' ? 'PNG' : fmt === 'image/jpeg' ? 'JPEG' : 'WebP'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {exportFormat === 'image/jpeg' && (
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                        <span>Quality</span>
                        <span className="font-mono text-blue-600">{jpegQuality}%</span>
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
                    className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Reset</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    disabled={isProcessing}
                    className="flex-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Image</span>
                  </button>
                </div>

              </div>
            </div>

            {/* Stage Preview (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="relative rounded-3xl bg-slate-950/5 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 p-4 min-h-[420px] flex items-center justify-center overflow-hidden">
                <canvas
                  ref={canvasRef}
                  className="max-w-full max-h-[600px] object-contain rounded-2xl shadow-xl transition-all select-none"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2 font-medium">
                <span>Combined in Local RAM</span>
                <span>Lossless Quality Export</span>
              </div>
            </div>

          </div>
        )}

        {/* SEO Guide Section */}
        <div className="mt-16 border-t border-slate-200/60 dark:border-slate-800 pt-12">
          <ToolGuide
            toolName="Side-by-Side & Before/After Image Combiner"
            introText="Combine two photos side by side or vertically with customizable Before and After badge pills, adjustable divider borders, and automatic aspect ratio scaling."
            competitorComparison={{
              alternatives: ['PineTools Side by Side', 'Kapwing Before/After', 'Canva Split Image'],
              benefit: 'Our before/after combiner aligns and scales images directly in your local browser with customizable divider colors and badge styles without watermarks, signups, or server compression penalties.',
            }}
            steps={[
              { title: 'Upload Both Images', description: 'Drop your Before (Left/Top) and After (Right/Bottom) photos.' },
              { title: 'Choose Orientation', description: 'Select between horizontal side-by-side or vertical stacked orientation.' },
              { title: 'Customize Badges & Divider', description: 'Add BEFORE/AFTER text pills, choose badge colors, and adjust the divider border gap.' },
              { title: 'Download Lossless Result', description: 'Export your combined graphic in PNG, JPEG, or WebP.' },
            ]}
            features={[
              'Horizontal side-by-side and vertical stacked layouts',
              'Automatic height/width normalization with aspect ratio preservation',
              'Custom BEFORE / AFTER text badges with opacity and position controls',
              'Customizable divider gaps, background colors, and corner rounding'
            ]}
            faq={[
              { q: 'How does the side-by-side combiner handle images with different heights?', a: 'By default, the Match Dimension mode scales both photos to equal heights (or equal widths in vertical mode) while maintaining each image original aspect ratio.' },
              { q: 'Can I customize the badge text?', a: 'Yes! You can replace "BEFORE" and "AFTER" with any custom text such as dates, client names, or product versions.' }
            ]}
          />
        </div>

      </div>
    </div>
  );
};
