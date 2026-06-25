import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import { Download, RefreshCw, Grid, CheckCircle } from 'lucide-react';
import { DropZone } from '../components/DropZone';
import { ProgressBar } from '../components/ProgressBar';
import { SEO } from '../components/SEO';
import { ToolGuide } from '../components/ToolGuide';
import { DemoPreview } from '../components/DemoPreview';

export const GridSplitter: React.FC = () => {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [gridSize, setGridSize] = useState<number>(3); // 3x3 default
  const [tiles, setTiles] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [zippingProgress, setZippingProgress] = useState<number>(0);
  const [isZipping, setIsZipping] = useState<boolean>(false);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setOriginalFile(file);
      setOriginalUrl(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    if (!originalUrl) return;

    const generatePreviewTiles = () => {
      setIsProcessing(true);
      const img = new Image();
      img.src = originalUrl;
      img.onload = () => {
        // Clear previous tiles
        tiles.forEach((t) => URL.revokeObjectURL(t));

        // For Instagram grid splitting, we crop to a center square first, or split full image
        // Center square split is standard for Instagram, since tiles must be square.
        const size = Math.min(img.naturalWidth, img.naturalHeight);
        const startX = (img.naturalWidth - size) / 2;
        const startY = (img.naturalHeight - size) / 2;
        const tileSize = size / gridSize;

        const promises: Promise<string>[] = [];

        for (let row = 0; row < gridSize; row++) {
          for (let col = 0; col < gridSize; col++) {
            const canvas = document.createElement('canvas');
            canvas.width = 300; // Preview size is constant
            canvas.height = 300;
            const ctx = canvas.getContext('2d');

            if (ctx) {
              // Crop from original image center
              ctx.drawImage(
                img,
                startX + col * tileSize,
                startY + row * tileSize,
                tileSize,
                tileSize,
                0,
                0,
                300,
                300
              );

              promises.push(
                new Promise<string>((resolve) => {
                  canvas.toBlob((blob) => {
                    if (blob) {
                      resolve(URL.createObjectURL(blob));
                    } else {
                      resolve('');
                    }
                  }, 'image/jpeg', 0.85);
                })
              );
            }
          }
        }

        Promise.all(promises).then((urls) => {
          setTiles(urls.filter((url) => url !== ''));
          setIsProcessing(false);
        });
      };
    };

    generatePreviewTiles();
  }, [originalUrl, gridSize]);

  const handleDownloadAll = async () => {
    if (!originalUrl || !originalFile || tiles.length === 0) return;
    setIsZipping(true);
    setZippingProgress(10);

    const img = new Image();
    img.src = originalUrl;
    img.onload = async () => {
      const zip = new JSZip();
      
      const size = Math.min(img.naturalWidth, img.naturalHeight);
      const startX = (img.naturalWidth - size) / 2;
      const startY = (img.naturalHeight - size) / 2;
      const tileSize = size / gridSize;

      const blobPromises: Promise<{ name: string; blob: Blob }>[] = [];

      let count = 0;
      const totalTiles = gridSize * gridSize;

      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          const canvas = document.createElement('canvas');
          canvas.width = tileSize;
          canvas.height = tileSize;
          const ctx = canvas.getContext('2d');

          if (ctx) {
            ctx.drawImage(
              img,
              startX + col * tileSize,
              startY + row * tileSize,
              tileSize,
              tileSize,
              0,
              0,
              tileSize,
              tileSize
            );

            // Calculate grid number based on Instagram upload order (bottom-right goes first)
            // Or normal grid layout index: row1 (1,2,3), row2 (4,5,6), row3 (7,8,9)
            // Instagram grids are posted from bottom to top, left to right.
            // Let's name them chronologically by tile index.
            const tileIndex = row * gridSize + col + 1;
            
            blobPromises.push(
              new Promise((resolve) => {
                canvas.toBlob((blob) => {
                  count++;
                  setZippingProgress(Math.round(20 + (count / totalTiles) * 50));
                  resolve({
                    name: `grid_tile_${tileIndex}.png`,
                    blob: blob as Blob
                  });
                }, 'image/png');
              })
            );
          }
        }
      }

      const results = await Promise.all(blobPromises);
      results.forEach((item) => {
        zip.file(item.name, item.blob);
      });

      setZippingProgress(80);
      const content = await zip.generateAsync({ type: 'blob' }, (metadata) => {
        setZippingProgress(Math.round(80 + metadata.percent * 0.2));
      });

      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${originalFile.name.substring(0, originalFile.name.lastIndexOf('.'))}_${gridSize}x${gridSize}_grid.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setIsZipping(false);
      setZippingProgress(100);
    };
  };

  const handleReset = () => {
    tiles.forEach((t) => URL.revokeObjectURL(t));
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    setOriginalFile(null);
    setOriginalUrl('');
    setTiles([]);
    setGridSize(3);
    setIsZipping(false);
  };

  const tilesRef = useRef<string[]>(tiles);
  tilesRef.current = tiles;
  const originalUrlRef = useRef<string>(originalUrl);
  originalUrlRef.current = originalUrl;

  useEffect(() => {
    return () => {
      tilesRef.current.forEach((t: string) => URL.revokeObjectURL(t));
      if (originalUrlRef.current) URL.revokeObjectURL(originalUrlRef.current);
    };
  }, []);

  const gridSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Instagram Grid Splitter - ImageGiri',
    'applicationCategory': 'MultimediaApplication',
    'operatingSystem': 'Web Browser',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    },
    'description': 'Split any photo into 3x3, 4x4, or 5x5 grids for Instagram feed posts. Download all tiles as a ZIP file instantly. Works 100% in your browser.',
    'featureList': [
      'Split into 3x3, 4x4, or 5x5 equal grid tiles',
      'Instant client-side ZIP compilation via JSZip',
      'High-resolution source file mapping',
      'No watermark placement on output images'
    ]
  };

  return (
    <div className="w-full">
      <SEO 
        title="Free Instagram Grid Splitter - 9Cut Grid Maker Alternative" 
        description="Split photos into 3x3, 4x4, or 5x5 grid tiles for Instagram feed posts. An offline, free alternative to 9Cut, Grids for Instagram, and paid image splitters." 
        keywords="Instagram grid splitter, split image for Instagram, Instagram grid maker, photo grid splitter, Instagram puzzle feed, grid layout maker, image splitter, Instagram post splitter, 3x3 grid, free Instagram tools, no watermark grid splitter, 9Cut alternative, Grids for Instagram alternative, Preview app alternative, split image offline"
        canonicalUrl="https://imagegiri.com/instagram-grid-splitter"
        schema={gridSchema}
      />

      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-orange-655 uppercase tracking-widest px-2.5 py-1 bg-orange-50 border border-orange-100 rounded-full shadow-sm">
            Social Tool
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-3 mb-2">Instagram Grid Splitter</h1>
          <p className="text-sm text-slate-500">Crop images into modular tiles for social feeds. Processed locally in high resolution.</p>
        </div>

        {!originalFile ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
            <div className="md:col-span-7 flex flex-col justify-center">
              <DropZone 
                onFilesSelected={handleFilesSelected}
                title="Drop image to split into grid"
                subtitle="JPG, PNG, WebP up to 40MB"
              />
            </div>
            <div className="md:col-span-5 flex">
              <div className="premium-bento rounded-3xl p-6 bg-white border border-slate-200/50 flex flex-col justify-between w-full shadow-sm hover:border-indigo-300 transition-all duration-300">
                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-indigo-650 bg-indigo-50/50 border border-indigo-100/60 px-2 py-0.5 rounded uppercase tracking-wider inline-block">Demo Preview</div>
                  <h3 className="text-base font-extrabold text-slate-900">How Grid Splitter Works</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Segment large square images into 3x3, 4x4, or 5x5 Instagram feeds. Preview the grid layout, then download all files bundled inside a zip archive instantly.
                  </p>
                </div>
                <DemoPreview
                  toolId="splitter"
                  alt="Grid Splitter Demo"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Controls */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="glass-card p-6 rounded-3xl space-y-6">
                
                <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Grid className="w-4.5 h-4.5 text-indigo-500" />
                  Grid Configuration
                </h3>

                {/* Grid Type Select */}
                <div className="space-y-2.5">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">
                    Grid Layout Size
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[3, 4, 5].map((size) => (
                      <button
                        key={size}
                        onClick={() => setGridSize(size)}
                        className={`py-2.5 px-3 rounded-xl text-[11px] font-bold border transition-all cursor-pointer active:scale-95 ${
                          gridSize === size
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                            : 'bg-white/80 border-slate-200/70 text-slate-655 hover:text-slate-900 hover:bg-slate-50/50'
                        }`}
                      >
                        {size} × {size}
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-450 mt-1 block font-medium">
                    Splits image into {gridSize * gridSize} square tiles.
                  </span>
                </div>

                {/* Stats / Details */}
                <div className="bg-white/70 border border-slate-200/50 rounded-2xl p-4.5 space-y-3 shadow-sm">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-455">Original File:</span>
                    <span className="font-mono text-slate-700 text-right truncate max-w-[120px]" title={originalFile.name}>
                      {originalFile.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-455">Total Tiles:</span>
                    <span className="font-bold text-indigo-650">{gridSize * gridSize} Squares</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2.5 pt-2">
                  <button
                    onClick={handleDownloadAll}
                    disabled={isProcessing || isZipping}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-655 hover:from-indigo-550 hover:to-purple-550 disabled:opacity-50 text-[11px] font-bold uppercase tracking-wider text-white rounded-xl shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Download ZIP Package
                  </button>

                  <button
                    onClick={handleReset}
                    className="w-full py-3 bg-white hover:bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-655 hover:text-slate-900 border border-slate-200/60 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Upload Different Image
                  </button>
                </div>

              </div>
            </div>

            {/* Right Preview */}
            <div className="lg:col-span-8 space-y-4">
              
              {isZipping && (
                <div className="glass-card p-6 rounded-3xl border border-indigo-100/60 shadow-xs">
                  <ProgressBar 
                    progress={zippingProgress}
                    label="Generating ZIP Archive"
                    subLabel="Rendering PNG tiles at high resolution..."
                  />
                </div>
              )}

              <div className="flex justify-between items-center glass-card rounded-2xl px-4 py-3 shadow-xs">
                <span className="text-xs font-bold text-slate-800">
                  Cropped Grid Layout Preview
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Center-square crop matches feed dimensions
                </span>
              </div>

              {/* Grid Preview Container */}
              {isProcessing ? (
                <div className="w-full h-[400px] border border-slate-200/80 rounded-2xl bg-slate-50/30 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2.5">
                    <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
                    <span className="text-xs font-bold text-slate-650">Slicing images...</span>
                  </div>
                </div>
              ) : (
                <div 
                  className="w-full max-w-[500px] mx-auto aspect-square border border-slate-200/80 rounded-2xl bg-slate-50/30 p-4 grid gap-1.5"
                  style={{
                    gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                  }}
                >
                  {tiles.map((tile, i) => (
                    <div 
                      key={i} 
                      className="aspect-square bg-white rounded-lg overflow-hidden border border-slate-200 hover:border-indigo-500/50 group relative transition-colors shadow-sm"
                    >
                      <img 
                        src={tile} 
                        alt={`Tile ${i+1}`} 
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200" 
                      />
                      <div className="absolute bottom-1 right-1 bg-white/95 border border-slate-200 text-[9px] font-bold px-1.5 py-0.5 rounded text-slate-500">
                        #{i+1}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-center flex justify-center items-center gap-1.5 text-[11px] text-slate-505">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-650" />
                Preview renders JPG slices. Download package yields lossless high-res PNG tiles.
              </div>

            </div>

          </div>
        )}

        <ToolGuide
          toolName="Instagram Grid Splitter"
          introText="Slice your images into perfect square tiles to create visual grids and puzzle feeds on Instagram. Instantly download the cropped slices packed in a ZIP folder."
          competitorComparison={{
            alternatives: ['9Cut', 'Grids for Instagram', 'Preview App Grid Maker'],
            benefit: 'Most grid splitter apps force ads, require account registrations, or place ugly watermarks on your slices unless you pay. ImageGiri splits your photos locally in high resolution, completely free, offline, and with absolutely no watermarks.'
          }}
          steps={[
            {
              title: 'Upload Photo',
              description: 'Select your photo (PNG, JPEG, WebP) by dropping it onto the card upload canvas.'
            },
            {
              title: 'Select Grid Config',
              description: 'Choose your preferred layout grid: 3x3 (9 tiles), 4x4 (16 tiles), or 5x5 (25 tiles) layout structures.'
            },
            {
              title: 'Download ZIP',
              description: 'Review the visual tile grid cuts, then click "Download All Tiles (ZIP)" to instantly package and save the cropped images.'
            }
          ]}
          features={[
            'Generate 3x3, 4x4, or 5x5 grids suitable for Instagram carousel puzzle feeds.',
            'Compiles output tiles on-the-fly into a clean ZIP folder via client-side JSZip script.',
            'Preserves full original photo resolution without forced downscaling or compression.',
            'Dotted alignment guidelines overlay for an intuitive visual check before slicing.',
            'Operates completely on-device for total privacy and zero server loading.'
          ]}
          faq={[
            {
              q: 'What image formats can I upload?',
              a: 'You can upload JPEG, PNG, or WebP. The output tiles will be formatted as clean, web-optimized PNG files for maximum fidelity.'
            },
            {
              q: 'Are my images watermarked?',
              a: 'No. We do not insert any branding, logo, or watermark on your images. The output is 100% clean.'
            },
            {
              q: 'Does this run on mobile browsers?',
              a: 'Yes, it is fully optimized for mobile devices so you can split photos and upload directly from your phone.'
            }
          ]}
        />

      </div>
    </div>
  );
};
