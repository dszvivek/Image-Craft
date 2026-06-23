import React, { useState, useEffect, useRef } from 'react';
import { Download, RefreshCw, Sliders, Sparkles, Layers, Eye, Settings, Info, Copy, Check } from 'lucide-react';
import svgVectorizerGif from '../assets/svg_vectorizer_feature.gif';
import svgVectorizerStaticImg from '../assets/svg_vectorizer_feature_static.webp';
import { DemoPreview } from '../components/DemoPreview';
import { DropZone } from '../components/DropZone';
import { SEO } from '../components/SEO';
import { ToolGuide } from '../components/ToolGuide';

interface VectorizerSettings {
  mode: 'color' | 'monochrome';
  colors: number;
  threshold: number;
  epsilon: number;
  minArea: number;
  removeBackground: boolean;
  scale: number;
  resolution: number;
}

// Direction offsets for Moore-Neighbor tracing (clockwise starting from Top)
const DX = [0, 1, 1, 1, 0, -1, -1, -1];
const DY = [-1, -1, 0, 1, 1, 1, 0, -1];

// Calculate distance between two points to a line segment (Douglas-Peucker helper)
function perpendicularDistance(p: [number, number], lineStart: [number, number], lineEnd: [number, number]): number {
  const x = p[0];
  const y = p[1];
  const x1 = lineStart[0];
  const y1 = lineStart[1];
  const x2 = lineEnd[0];
  const y2 = lineEnd[1];
  
  const dx = x2 - x1;
  const dy = y2 - y1;
  
  if (dx === 0 && dy === 0) {
    return Math.sqrt((x - x1) ** 2 + (y - y1) ** 2);
  }
  
  const num = Math.abs(dy * x - dx * y + x2 * y1 - y2 * x1);
  const den = Math.sqrt(dy * dy + dx * dx);
  return num / den;
}

// Stack-based Douglas-Peucker algorithm to prevent stack overflow
function douglasPeucker(points: [number, number][], epsilon: number): [number, number][] {
  if (points.length <= 2) return points;
  
  const keep = new Array(points.length).fill(true);
  const stack: [number, number][] = [[0, points.length - 1]];
  
  while (stack.length > 0) {
    const [start, end] = stack.pop()!;
    if (end - start <= 1) continue;
    
    let dmax = 0;
    let index = 0;
    
    for (let i = start + 1; i < end; i++) {
      const d = perpendicularDistance(points[i], points[start], points[end]);
      if (d > dmax) {
        index = i;
        dmax = d;
      }
    }
    
    if (dmax > epsilon) {
      stack.push([start, index]);
      stack.push([index, end]);
    } else {
      for (let i = start + 1; i < end; i++) {
        keep[i] = false;
      }
    }
  }
  
  return points.filter((_, idx) => keep[idx]);
}

// Calculate polygon area using the Shoelace formula
function getPolygonArea(points: [number, number][]): number {
  let area = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += points[i][0] * points[j][1];
    area -= points[j][0] * points[i][1];
  }
  return Math.abs(area) / 2;
}

// Moore-Neighbor boundary tracing algorithm
function traceContour(
  startX: number,
  startY: number,
  mask: boolean[][],
  visited: boolean[][]
): [number, number][] {
  const W = mask[0].length;
  const H = mask.length;
  const contour: [number, number][] = [];
  
  let cx = startX;
  let cy = startY;
  
  // Entry point starts at the left neighbor
  let px = startX - 1;
  let py = startY;
  
  const maxSteps = W * H;
  let steps = 0;
  
  contour.push([cx, cy]);
  visited[cy][cx] = true;
  
  while (steps < maxSteps) {
    steps++;
    const dx = px - cx;
    const dy = py - cy;
    
    let entryDir = -1;
    for (let d = 0; d < 8; d++) {
      if (DX[d] === dx && DY[d] === dy) {
        entryDir = d;
        break;
      }
    }
    
    let foundNext = false;
    let nextX = cx;
    let nextY = cy;
    let nextPx = px;
    let nextPy = py;
    
    for (let i = 0; i < 8; i++) {
      const checkDir = (entryDir + i) % 8;
      const tx = cx + DX[checkDir];
      const ty = cy + DY[checkDir];
      
      if (tx >= 0 && tx < W && ty >= 0 && ty < H) {
        if (mask[ty][tx]) {
          nextX = tx;
          nextY = ty;
          const prevDir = (checkDir + 7) % 8;
          nextPx = cx + DX[prevDir];
          nextPy = cy + DY[prevDir];
          foundNext = true;
          break;
        }
      }
    }
    
    if (!foundNext) {
      break;
    }
    
    visited[nextY][nextX] = true;
    
    if (nextX === startX && nextY === startY) {
      break;
    }
    
    cx = nextX;
    cy = nextY;
    px = nextPx;
    py = nextPy;
    contour.push([cx, cy]);
  }
  
  return contour;
}

export const SvgVectorizer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  
  // Settings
  const [settings, setSettings] = useState<VectorizerSettings>({
    mode: 'color',
    colors: 8,
    threshold: 128,
    epsilon: 1.0,
    minArea: 8,
    removeBackground: false,
    scale: 2,
    resolution: 300,
  });

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [vectorUrl, setVectorUrl] = useState<string>('');
  const [svgContent, setSvgContent] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'preview' | 'original' | 'code'>('preview');
  const [copied, setCopied] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      const f = files[0];
      setFile(f);
      setImageUrl(URL.createObjectURL(f));
    }
  };

  const updateSetting = <K extends keyof VectorizerSettings>(key: K, value: VectorizerSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Perform vectorization processing loop
  useEffect(() => {
    if (!imageUrl) return;

    const vectorize = () => {
      setIsProcessing(true);
      const img = new Image();
      img.src = imageUrl;

      img.onload = () => {
        const origW = img.naturalWidth;
        const origH = img.naturalHeight;
        
        // Calculate downscaled trace dimensions to keep JS runtime performant
        const resolution = settings.resolution;
        let traceW = origW;
        let traceH = origH;
        if (origW > resolution || origH > resolution) {
          if (origW > origH) {
            traceW = resolution;
            traceH = Math.round((origH * resolution) / origW);
          } else {
            traceH = resolution;
            traceW = Math.round((origW * resolution) / origH);
          }
        }

        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = traceW;
        canvas.height = traceH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setIsProcessing(false);
          return;
        }

        // Draw image and get binary arrays
        ctx.drawImage(img, 0, 0, traceW, traceH);
        const imageData = ctx.getImageData(0, 0, traceW, traceH);
        const data = imageData.data;

        let svgPaths = '';

        if (settings.mode === 'monochrome') {
          // 1. Create monochrome binary mask
          const mask = Array.from({ length: traceH }, () => new Array(traceW).fill(false));
          for (let y = 0; y < traceH; y++) {
            for (let x = 0; x < traceW; x++) {
              const idx = (y * traceW + x) * 4;
              const r = data[idx];
              const g = data[idx + 1];
              const b = data[idx + 2];
              const alpha = data[idx + 3];
              
              if (alpha < 128) {
                mask[y][x] = false;
              } else {
                const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
                mask[y][x] = brightness < settings.threshold;
              }
            }
          }

          // 2. Pad mask by 1px on all sides for robust border tracing
          const padW = traceW + 2;
          const padH = traceH + 2;
          const paddedMask = Array.from({ length: padH }, () => new Array(padW).fill(false));
          for (let y = 0; y < traceH; y++) {
            for (let x = 0; x < traceW; x++) {
              paddedMask[y + 1][x + 1] = mask[y][x];
            }
          }

          const visited = Array.from({ length: padH }, () => new Array(padW).fill(false));
          const contours: [number, number][][] = [];

          for (let y = 1; y < padH - 1; y++) {
            for (let x = 1; x < padW - 1; x++) {
              if (paddedMask[y][x] && !visited[y][x]) {
                if (!paddedMask[y][x - 1]) {
                  const contour = traceContour(x, y, paddedMask, visited);
                  if (contour.length >= 3) {
                    const mapped = contour.map(([cx, cy]) => [cx - 1, cy - 1] as [number, number]);
                    contours.push(mapped);
                  }
                }
              }
            }
          }

          // 3. Simplify and draw SVG paths
          const simplifiedPaths: string[] = [];
          contours.forEach((c) => {
            const simplified = douglasPeucker(c, settings.epsilon);
            if (simplified.length >= 3 && getPolygonArea(simplified) >= settings.minArea) {
              const pathStr = simplified.map((pt, i) => {
                const sx = (pt[0] * (origW / traceW)).toFixed(1);
                const sy = (pt[1] * (origH / traceH)).toFixed(1);
                return `${i === 0 ? 'M' : 'L'} ${sx} ${sy}`;
              }).join(' ') + ' Z';
              simplifiedPaths.push(pathStr);
            }
          });

          if (simplifiedPaths.length > 0) {
            svgPaths += `  <path d="${simplifiedPaths.join(' ')}" fill="#1e293b" fill-rule="evenodd" />\n`;
          }

        } else {
          // COLOR MODE using K-means++ clustering
          const sampleColors: [number, number, number][] = [];
          const step = Math.max(1, Math.floor((traceW * traceH) / 1500));
          for (let i = 0; i < traceW * traceH; i += step) {
            const idx = i * 4;
            if (data[idx + 3] >= 128) {
              sampleColors.push([data[idx], data[idx + 1], data[idx + 2]]);
            }
          }

          const centroids: [number, number, number][] = [];
          if (sampleColors.length > 0) {
            // First centroid randomly
            centroids.push(sampleColors[Math.floor(Math.random() * sampleColors.length)]);
            
            // K-means++ centroid initialization
            const K = Math.min(settings.colors, sampleColors.length);
            while (centroids.length < K) {
              let maxDist = -1;
              let farColor = sampleColors[0];
              for (const color of sampleColors) {
                let minDist = Infinity;
                for (const c of centroids) {
                  const d = (color[0] - c[0]) ** 2 + (color[1] - c[1]) ** 2 + (color[2] - c[2]) ** 2;
                  if (d < minDist) minDist = d;
                }
                if (minDist > maxDist) {
                  maxDist = minDist;
                  farColor = color;
                }
              }
              centroids.push(farColor);
            }

            // K-means iterations (converge centroids)
            const numCentroids = centroids.length;
            for (let iter = 0; iter < 6; iter++) {
              const sums = Array.from({ length: numCentroids }, () => [0, 0, 0, 0]); // r, g, b, count
              for (const color of sampleColors) {
                let bestIdx = 0;
                let minDist = Infinity;
                for (let c = 0; c < numCentroids; c++) {
                  const d = (color[0] - centroids[c][0]) ** 2 + (color[1] - centroids[c][1]) ** 2 + (color[2] - centroids[c][2]) ** 2;
                  if (d < minDist) {
                    minDist = d;
                    bestIdx = c;
                  }
                }
                sums[bestIdx][0] += color[0];
                sums[bestIdx][1] += color[1];
                sums[bestIdx][2] += color[2];
                sums[bestIdx][3]++;
              }
              for (let c = 0; c < numCentroids; c++) {
                if (sums[c][3] > 0) {
                  centroids[c] = [
                    sums[c][0] / sums[c][3],
                    sums[c][1] / sums[c][3],
                    sums[c][2] / sums[c][3]
                  ];
                }
              }
            }

            // Map image pixels to centroid indices
            const pixelIndices = new Uint8Array(traceW * traceH);
            const colorCounts = new Uint32Array(numCentroids);
            const isOpaque = new Uint8Array(traceW * traceH);

            for (let i = 0; i < traceW * traceH; i++) {
              const idx = i * 4;
              const r = data[idx];
              const g = data[idx + 1];
              const b = data[idx + 2];
              const a = data[idx + 3];

              if (a < 128) {
                isOpaque[i] = 0;
              } else {
                isOpaque[i] = 1;
                let bestIdx = 0;
                let minDist = Infinity;
                for (let c = 0; c < numCentroids; c++) {
                  const d = (r - centroids[c][0]) ** 2 + (g - centroids[c][1]) ** 2 + (b - centroids[c][2]) ** 2;
                  if (d < minDist) {
                    minDist = d;
                    bestIdx = c;
                  }
                }
                pixelIndices[i] = bestIdx;
                colorCounts[bestIdx]++;
              }
            }

            // Find background index (highest frequency index)
            let bgIdx = -1;
            if (settings.removeBackground) {
              let maxCount = 0;
              for (let c = 0; c < numCentroids; c++) {
                if (colorCounts[c] > maxCount) {
                  maxCount = colorCounts[c];
                  bgIdx = c;
                }
              }
            }

            // Sort colors by popularity (most popular first to draw large backdrops first)
            const sortedIndices = Array.from({ length: numCentroids }, (_, i) => i)
              .sort((a, b) => colorCounts[b] - colorCounts[a]);

            // Trace each color layer
            sortedIndices.forEach((c) => {
              if (c === bgIdx) return; // skip if transparency requested for this layer

              const mask = Array.from({ length: traceH }, () => new Array(traceW).fill(false));
              for (let y = 0; y < traceH; y++) {
                for (let x = 0; x < traceW; x++) {
                  const idx = y * traceW + x;
                  mask[y][x] = isOpaque[idx] === 1 && pixelIndices[idx] === c;
                }
              }

              // Pad mask for border tracing
              const padW = traceW + 2;
              const padH = traceH + 2;
              const paddedMask = Array.from({ length: padH }, () => new Array(padW).fill(false));
              for (let y = 0; y < traceH; y++) {
                for (let x = 0; x < traceW; x++) {
                  paddedMask[y + 1][x + 1] = mask[y][x];
                }
              }

              const visited = Array.from({ length: padH }, () => new Array(padW).fill(false));
              const contours: [number, number][][] = [];

              for (let y = 1; y < padH - 1; y++) {
                for (let x = 1; x < padW - 1; x++) {
                  if (paddedMask[y][x] && !visited[y][x]) {
                    if (!paddedMask[y][x - 1]) {
                      const contour = traceContour(x, y, paddedMask, visited);
                      if (contour.length >= 3) {
                        const mapped = contour.map(([cx, cy]) => [cx - 1, cy - 1] as [number, number]);
                        contours.push(mapped);
                      }
                    }
                  }
                }
              }

              // Build color path elements
              const simplifiedPaths: string[] = [];
              contours.forEach((ctr) => {
                const simplified = douglasPeucker(ctr, settings.epsilon);
                if (simplified.length >= 3 && getPolygonArea(simplified) >= settings.minArea) {
                  const pathStr = simplified.map((pt, i) => {
                    const sx = (pt[0] * (origW / traceW)).toFixed(1);
                    const sy = (pt[1] * (origH / traceH)).toFixed(1);
                    return `${i === 0 ? 'M' : 'L'} ${sx} ${sy}`;
                  }).join(' ') + ' Z';
                  simplifiedPaths.push(pathStr);
                }
              });

              if (simplifiedPaths.length > 0) {
                const centroid = centroids[c];
                const r = Math.round(centroid[0]);
                const g = Math.round(centroid[1]);
                const b = Math.round(centroid[2]);
                const hexColor = '#' + [r, g, b].map(x => {
                  const hex = x.toString(16);
                  return hex.length === 1 ? '0' + hex : hex;
                }).join('');
                
                svgPaths += `  <path d="${simplifiedPaths.join(' ')}" fill="${hexColor}" fill-rule="evenodd" />\n`;
              }
            });
          }
        }

        // Construct final clean XML string
        const finalW = Math.round(origW * settings.scale);
        const finalH = Math.round(origH * settings.scale);
        const svgHeader = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${origW} ${origH}" width="${finalW}" height="${finalH}">\n`;
        const svgFooter = '</svg>';
        const fullSvg = `${svgHeader}${svgPaths}${svgFooter}`;

        setSvgContent(fullSvg);

        const svgBlob = new Blob([fullSvg], { type: 'image/svg+xml;charset=utf-8' });
        if (vectorUrl) URL.revokeObjectURL(vectorUrl);
        setVectorUrl(URL.createObjectURL(svgBlob));
        setIsProcessing(false);
      };
    };

    const timer = setTimeout(vectorize, 300); // debounce changes
    return () => clearTimeout(timer);
  }, [imageUrl, settings]);

  const handleDownload = () => {
    if (!vectorUrl || !file) return;
    const origName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const link = document.createElement('a');
    link.href = vectorUrl;
    link.download = `${origName}_vectorized.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyCode = () => {
    if (!svgContent) return;
    navigator.clipboard.writeText(svgContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleReset = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    if (vectorUrl) URL.revokeObjectURL(vectorUrl);
    setFile(null);
    setImageUrl('');
    setVectorUrl('');
    setSvgContent('');
    setSettings({
      mode: 'color',
      colors: 8,
      threshold: 128,
      epsilon: 1.0,
      minArea: 8,
      removeBackground: false,
      scale: 2,
      resolution: 300,
    });
  };

  const imageUrlRef = useRef(imageUrl);
  imageUrlRef.current = imageUrl;
  const vectorUrlRef = useRef(vectorUrl);
  vectorUrlRef.current = vectorUrl;

  useEffect(() => {
    return () => {
      if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current);
      if (vectorUrlRef.current) URL.revokeObjectURL(vectorUrlRef.current);
    };
  }, []);

  const vectorSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'SVG Vectorizer - ImageGiri',
    'applicationCategory': 'MultimediaApplication',
    'operatingSystem': 'Web Browser',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    },
    'description': 'Convert raster images (JPG, PNG) into clean, scalable SVG vector graphics directly in your browser. Adjust color palette, path smoothing, and speckle threshold.',
    'featureList': [
      'Monochrome and color vector tracing',
      'Douglas-Peucker path simplification controls',
      'Speckle noise removal settings',
      'Raw XML SVG viewer code box'
    ]
  };

  return (
    <div className="w-full">
      <SEO 
        title="Free Image to SVG Vectorizer - Vectorizer.ai Alternative" 
        description="Convert raster JPG/PNG images into scalable vector graphics (SVG) offline in your browser. A free alternative to Vectorizer.ai and Vector Magic." 
        keywords="SVG vectorizer, image to SVG, convert PNG to SVG, convert JPG to SVG, vectorize image, raster to vector, vector converter, image tracer, SVG converter online, free SVG converter, image to vector art, auto tracer, Vectorizer.ai alternative, Vector Magic alternative, vectorize photo offline"
        canonicalUrl="https://imagegiri.com/svg-vectorizer"
        schema={vectorSchema}
      />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-indigo-650 uppercase tracking-widest px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-full shadow-sm">
            Vector Studio
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-3 mb-2">SVG Vectorizer</h1>
          <p className="text-sm text-slate-500">Trace outlines and group color layers of logo sketches, illustrations, or portraits into clean vectors locally.</p>
        </div>

        {!file ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
            <div className="md:col-span-7 flex flex-col justify-center">
              <DropZone 
                onFilesSelected={handleFilesSelected}
                title="Drop photo to vectorize to SVG"
                subtitle="Supports JPG, PNG, WebP up to 30MB"
              />
            </div>
            <div className="md:col-span-5 flex">
              <div className="premium-bento rounded-3xl p-6 bg-white border border-slate-200/50 flex flex-col justify-between w-full shadow-sm hover:border-teal-300 transition-all duration-300">
                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-teal-650 bg-teal-50/50 border border-teal-100/60 px-2 py-0.5 rounded uppercase tracking-wider inline-block">Demo Preview</div>
                  <h3 className="text-base font-extrabold text-slate-900">How SVG Vectorizer Works</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Upload a raster image, set color count and smoothing tolerance, then trace paths using K-Means clustering and Moore-Neighbor contour algorithms — all offline.
                  </p>
                </div>
                <DemoPreview
                  gifSrc={ svgVectorizerGif }
                  staticSrc={ svgVectorizerStaticImg }
                  alt="SVG Vectorizer Demo"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
            
            {/* Left Controls column */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Core Vector Settings */}
              <div className="premium-bento p-5 rounded-3xl bg-white space-y-5 shadow-xs">
                <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2 text-sm">
                  <Sliders className="w-4.5 h-4.5 text-indigo-500" />
                  Tracing Configuration
                </h3>

                {/* Mode Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Tracing Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => updateSetting('mode', 'color')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        settings.mode === 'color'
                          ? 'bg-indigo-650 border-indigo-500 text-white shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-655 hover:bg-slate-100'
                      }`}
                    >
                      Color Palette
                    </button>
                    <button
                      onClick={() => updateSetting('mode', 'monochrome')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        settings.mode === 'monochrome'
                          ? 'bg-indigo-650 border-indigo-500 text-white shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-655 hover:bg-slate-100'
                      }`}
                    >
                      B&W Outline
                    </button>
                  </div>
                </div>

                {/* Mode-specific sliders */}
                {settings.mode === 'color' ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Color Layers</label>
                      <span className="text-[10px] font-bold text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        {settings.colors} colors
                      </span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="16"
                      value={settings.colors}
                      onChange={(e) => updateSetting('colors', Number(e.target.value))}
                      className="range-styled w-full"
                    />
                    
                    {/* Remove Background Option */}
                    <label className="flex items-center gap-2.5 pt-1.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={settings.removeBackground}
                        onChange={(e) => updateSetting('removeBackground', e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-slate-600">Remove Dominant Color (Background)</span>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Brightness Threshold</label>
                      <span className="text-[10px] font-bold text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        {settings.threshold} / 255
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="240"
                      value={settings.threshold}
                      onChange={(e) => updateSetting('threshold', Number(e.target.value))}
                      className="range-styled w-full"
                    />
                  </div>
                )}

                {/* Path Smoothing Slider */}
                <div className="space-y-3 border-t border-slate-100 pt-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Path Smoothing (Epsilon)</label>
                    <span className="text-[10px] font-bold text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {settings.epsilon.toFixed(1)}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="4.0"
                    step="0.1"
                    value={settings.epsilon}
                    onChange={(e) => updateSetting('epsilon', Number(e.target.value))}
                    className="range-styled w-full"
                  />
                </div>

                {/* Minimum Speckle Area Noise Filter */}
                <div className="space-y-3 border-t border-slate-100 pt-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Speckle Noise Filter</label>
                    <span className="text-[10px] font-bold text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      Ignore &lt; {settings.minArea} px²
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={settings.minArea}
                    onChange={(e) => updateSetting('minArea', Number(e.target.value))}
                    className="range-styled w-full"
                  />
                </div>
              </div>

              {/* Advanced Settings Panel */}
              <div className="premium-bento p-5 rounded-3xl bg-white space-y-4 shadow-xs">
                <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2 text-sm">
                  <Settings className="w-4.5 h-4.5 text-indigo-500" />
                  Advanced Tracing Specs
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  {/* Processing resolution */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block">Trace Grid Size</label>
                    <select
                      value={settings.resolution}
                      onChange={(e) => updateSetting('resolution', Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="150">Low Detail (150px)</option>
                      <option value="300">Medium Detail (300px)</option>
                      <option value="500">High Detail (500px)</option>
                    </select>
                  </div>

                  {/* Output Scaler */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block">Download Scale</label>
                    <select
                      value={settings.scale}
                      onChange={(e) => updateSetting('scale', Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="1">Original (1x)</option>
                      <option value="2">Retina (2x)</option>
                      <option value="4">Large Vector (4x)</option>
                      <option value="8">Ultra Scale (8x)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="premium-bento p-5 rounded-3xl bg-white space-y-3 shadow-xs">
                <button
                  onClick={handleDownload}
                  disabled={isProcessing || !vectorUrl}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-655 hover:from-indigo-550 hover:to-purple-550 disabled:opacity-50 text-[11px] font-bold uppercase tracking-wider text-white rounded-xl shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download Scalable SVG
                </button>

                <button
                  onClick={handleReset}
                  className="w-full py-3 bg-white hover:bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-655 hover:text-slate-900 border border-slate-200/60 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset Image
                </button>
              </div>

            </div>

            {/* Right Interactive Drag Viewport column */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Workspace Navigation Header Tabs */}
              <div className="flex justify-between items-center bg-white border border-slate-200/50 rounded-2xl px-4 py-2 shadow-xs">
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'preview'
                        ? 'bg-indigo-50 border border-indigo-100 text-indigo-650'
                        : 'text-slate-450 hover:text-slate-600'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Vector Preview
                  </button>
                  <button
                    onClick={() => setActiveTab('original')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'original'
                        ? 'bg-indigo-50 border border-indigo-100 text-indigo-650'
                        : 'text-slate-450 hover:text-slate-600'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" /> Original Photo
                  </button>
                  <button
                    onClick={() => setActiveTab('code')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'code'
                        ? 'bg-indigo-50 border border-indigo-100 text-indigo-650'
                        : 'text-slate-450 hover:text-slate-600'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" /> SVG XML Code
                  </button>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hidden sm:inline">
                  Client-side Image Quantization
                </span>
              </div>

              {/* Viewport container */}
              <div className="w-full border border-slate-200 rounded-3xl bg-slate-100/50 flex items-center justify-center min-h-[420px] shadow-inner p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-dot-grid opacity-30 pointer-events-none" />

                {isProcessing ? (
                  <div className="flex flex-col items-center gap-2.5 relative z-10 pointer-events-none">
                    <RefreshCw className="w-8 h-8 text-indigo-650 animate-spin" />
                    <span className="text-xs font-bold text-slate-600 animate-pulse">Running contour tracing algorithms...</span>
                  </div>
                ) : (
                  <>
                    {activeTab === 'preview' && vectorUrl && (
                      <div className="relative flex flex-col items-center justify-center max-w-full">
                        <img
                          src={vectorUrl}
                          alt="Vectorized SVG"
                          className="max-w-full max-h-[600px] object-contain rounded-2xl shadow-2xl border border-slate-200/50 bg-white relative z-10 animate-float-subtle"
                        />
                        <span className="mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white border border-slate-150 px-2 py-0.5 rounded shadow-xs relative z-15">
                          SVG Vector (Scale Independent)
                        </span>
                      </div>
                    )}

                    {activeTab === 'original' && imageUrl && (
                      <div className="relative flex flex-col items-center justify-center max-w-full">
                        <img
                          src={imageUrl}
                          alt="Original Source"
                          className="max-w-full max-h-[600px] object-contain rounded-2xl shadow-2xl border border-slate-200/50 bg-white relative z-10"
                        />
                        <span className="mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white border border-slate-150 px-2 py-0.5 rounded shadow-xs relative z-15">
                          Source Raster Image
                        </span>
                      </div>
                    )}

                    {activeTab === 'code' && svgContent && (
                      <div className="w-full max-h-[500px] bg-slate-900 border border-slate-800 rounded-2xl p-4 overflow-auto font-mono text-[11px] text-slate-300 relative z-10 select-text">
                        <div className="absolute top-3 right-3 flex gap-2">
                          <button
                            onClick={handleCopyCode}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-350 hover:text-white rounded-lg transition-all border border-slate-700 cursor-pointer flex items-center gap-1 shadow-xs"
                            title="Copy Code"
                          >
                            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span className="text-[9px] font-bold uppercase tracking-wider">{copied ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <pre className="whitespace-pre-wrap break-all leading-normal pt-4 pr-16">{svgContent}</pre>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Information / Guideline Card */}
              <div className="p-3.5 bg-indigo-50/50 border border-indigo-100/60 rounded-2xl flex items-start gap-2.5 text-[10px] text-slate-555 leading-normal font-medium animate-fade-in">
                <Info className="w-4 h-4 text-indigo-650 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span>
                    **Understanding Vector Tracing Controls**:
                  </span>
                  <ul className="list-disc pl-3.5 space-y-0.5 text-slate-500">
                    <li>**Tracing Mode**: Choose *Color Palette* for continuous color designs, or *B&W Outline* for logos and line sketches.</li>
                    <li>**Path Smoothing (Epsilon)**: Higher values reduce vector file size and yield smoother edges. Lower values retain pixel accuracy.</li>
                    <li>**Speckle Noise Filter**: Removes small stray pixel contours. Increase this if you see random dots or specs in your output.</li>
                    <li>**Trace Grid Size**: Defines the pixel grid resolution used for calculations. Higher settings capture finer details but take longer to process.</li>
                  </ul>
                </div>
              </div>

            </div>

          </div>
        )}

        <ToolGuide
          toolName="SVG Vectorizer"
          introText="Trace raster graphics into vector paths locally. Adjust path simplifications and color parameters to export scalable vectors perfect for logos and UI designs."
          competitorComparison={{
            alternatives: ['Vectorizer.ai', 'Vector Magic', 'Adobe Illustrator Image Trace'],
            benefit: 'Online vector tools have recently started charging fees or placing pixel limitations on SVG exports. ImageGiri vectorizes your logo PNGs and JPEGs completely locally. Experience limitless traces and download clean SVGs with zero subscriptions.'
          }}
          steps={[
            {
              title: 'Upload Image',
              description: 'Select a clean logo, icon, or drawing (PNG or JPEG) to vectorize.'
            },
            {
              title: 'Choose settings',
              description: 'Select Color or B&W mode. Adjust color count, path smoothing tolerance (Epsilon), and noise thresholds.'
            },
            {
              title: 'Vectorize & Copy Code',
              description: 'Wait for the tracing engine to execute. Inspect the vector outline, copy the raw XML code, or download the SVG.'
            }
          ]}
          features={[
            'Advanced Moore-Neighbor contour tracing and Douglas-Peucker path simplification.',
            'Color palette quantization (clustering pixels into 2-32 specific hues).',
            'Full control over edge smoothing and small noise filters (speckle thresholds).',
            'Integrated XML viewer to copy raw vector code directly for web projects.',
            'Operates completely on-device for total asset protection.'
          ]}
          faq={[
            {
              q: 'What types of images vectorize best?',
              a: 'Logos, icons, line art, and high-contrast silhouettes yield the cleanest vectors. Complex photographs generate extremely heavy SVGs with millions of tiny paths.'
            },
            {
              q: 'Does it support color exports?',
              a: 'Yes, our engine supports full color vectorizing with custom palette counts (from 2 up to 32 colors).'
            },
            {
              q: 'Can I scale the output indefinitely?',
              a: 'Yes. SVG is a vector format. You can scale the exported files to any dimension in Photoshop, Illustrator, or Figma without pixelation.'
            }
          ]}
        />

      </div>
    </div>
  );
};
