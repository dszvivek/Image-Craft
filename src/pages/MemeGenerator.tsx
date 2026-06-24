import React, { useState, useEffect, useRef } from 'react';
import { Download, RefreshCw, Type, Plus, Trash2, Info } from 'lucide-react';
import memeGeneratorGif from '../assets/meme_generator_feature.gif';
import memeGeneratorStaticImg from '../assets/meme_generator_feature_static.webp';
import { DemoPreview } from '../components/DemoPreview';
import { DropZone } from '../components/DropZone';
import { SEO } from '../components/SEO';
import { ToolGuide } from '../components/ToolGuide';

interface MemeText {
  id: string;
  text: string;
  x: number; // percentage of width (0-100)
  y: number; // percentage of height (0-100)
  size: number; // font size (px)
  color: string;
}

export const MemeGenerator: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  
  // Settings
  const [textBlocks, setTextBlocks] = useState<MemeText[]>([]);
  const [fontFamily, setFontFamily] = useState<string>('Impact');
  const [allCaps, setAllCaps] = useState<boolean>(true);
  
  const [isAssembling, setIsAssembling] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      const f = files[0];
      setFile(f);
      setImageUrl(URL.createObjectURL(f));
      
      // Initialize with standard top and bottom text blocks
      setTextBlocks([
        { id: 'top', text: 'WRITE TOP TEXT', x: 50, y: 15, size: 40, color: '#ffffff' },
        { id: 'bottom', text: 'WRITE BOTTOM TEXT', x: 50, y: 85, size: 40, color: '#ffffff' }
      ]);
    }
  };

  const addTextBlock = () => {
    const newBlock: MemeText = {
      id: Math.random().toString(36).substring(7),
      text: 'NEW CAPTION',
      x: 50,
      y: 50,
      size: 35,
      color: '#ffffff'
    };
    setTextBlocks((prev) => [...prev, newBlock]);
  };

  const deleteTextBlock = (id: string) => {
    setTextBlocks((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTextBlock = (id: string, field: keyof MemeText, value: any) => {
    setTextBlocks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  // Compile and draw meme canvas
  useEffect(() => {
    if (!imageUrl) return;

    const drawMeme = () => {
      setIsAssembling(true);
      const img = new Image();
      img.src = imageUrl;
      
      img.onload = () => {
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

        // Draw text blocks
        textBlocks.forEach((tb) => {
          ctx.save();
          
          const rawText = allCaps ? tb.text.toUpperCase() : tb.text;
          const px = (tb.x / 100) * canvas.width;
          const py = (tb.y / 100) * canvas.height;
          
          // Responsive font size adjustment based on canvas size
          const scaleFactor = canvas.width / 500;
          const fontSize = Math.max(12, Math.round(tb.size * scaleFactor));
          
          ctx.font = `bold ${fontSize}px ${fontFamily}`;
          ctx.fillStyle = tb.color;
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = Math.max(2, Math.round(fontSize / 6));
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          ctx.strokeText(rawText, px, py);
          ctx.fillText(rawText, px, py);
          ctx.restore();
        });

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

    const timer = setTimeout(drawMeme, 250); // debounce canvas render
    return () => clearTimeout(timer);
  }, [imageUrl, textBlocks, fontFamily, allCaps]);

  // Draggable text positioning mathematics
  const handleDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current || textBlocks.length === 0) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    
    // Get client position
    let clientX = 0;
    let clientY = 0;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const clickedPctX = ((clientX - rect.left) / rect.width) * 100;
    const clickedPctY = ((clientY - rect.top) / rect.height) * 100;

    // Find closest text block within threshold distance
    let closestId: string | null = null;
    let minDist = 15; // threshold distance (percent)

    textBlocks.forEach((tb) => {
      const dist = Math.sqrt((tb.x - clickedPctX) ** 2 + (tb.y - clickedPctY) ** 2);
      if (dist < minDist) {
        minDist = dist;
        closestId = tb.id;
      }
    });

    if (closestId) {
      e.preventDefault();
      setActiveDragId(closestId);
    }
  };

  const handleDragMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!activeDragId || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    
    let clientX = 0;
    let clientY = 0;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const newPctX = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const newPctY = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));

    updateTextBlock(activeDragId, 'x', newPctX);
    updateTextBlock(activeDragId, 'y', newPctY);
  };

  const handleDragEnd = () => {
    setActiveDragId(null);
  };

  const handleDownload = () => {
    if (!previewUrl || !file) return;
    const link = document.createElement('a');
    link.href = previewUrl;
    link.download = `meme_${file.name}`;
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
    setTextBlocks([]);
    setFontFamily('Impact');
    setAllCaps(true);
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

  const memeSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Meme Generator - ImageGiri',
    'applicationCategory': 'MultimediaApplication',
    'operatingSystem': 'Web Browser',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    },
    'description': 'Create custom memes and captioned social cards directly in your browser. Drag-and-drop movable text layers, Impact font, custom colors, and black text outlines.',
    'featureList': [
      'Interactive drag-and-drop text positioning',
      'Impact font rendering with custom outlines',
      'Add unlimited custom text caption blocks',
      'Local canvas compilation for instant downloads'
    ]
  };

  return (
    <div className="w-full">
      <SEO 
        title="Free Online Meme Generator - Imgflip Alternative" 
        description="Create custom memes with draggable text layers offline in your browser. A free alternative to Imgflip and Meme Generator Pro with no watermarks." 
        keywords="meme generator, meme maker, create meme online, free meme maker, meme creator, funny meme maker, caption generator, social card maker, meme text editor, Impact font meme, custom meme creator, meme without watermark, Imgflip alternative, Meme Generator Pro alternative, make memes offline"
        canonicalUrl="https://imagegiri.com/meme-generator"
        schema={memeSchema}
      />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-green-650 uppercase tracking-widest px-2.5 py-1 bg-green-50 border border-green-100 rounded-full shadow-sm">
            Creator Studio
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-3 mb-2">Meme Generator</h1>
          <p className="text-sm text-slate-500">Design viral templates locally. Drag captions freely on the preview canvas to position text.</p>
        </div>

        {!file ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
            <div className="md:col-span-7 flex flex-col justify-center">
              <DropZone 
                onFilesSelected={handleFilesSelected}
                title="Drop photo template to load generator"
                subtitle="Supports JPG, PNG, WebP up to 30MB"
              />
            </div>
            <div className="md:col-span-5 flex">
              <div className="premium-bento rounded-3xl p-6 flex flex-col justify-between w-full shadow-sm hover:border-green-350 transition-all duration-300">
                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-green-650 bg-green-50/30 border border-green-100/60 px-2 py-0.5 rounded uppercase tracking-wider inline-block">Demo Preview</div>
                  <h3 className="text-base font-extrabold text-slate-900">How Meme Generator Works</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Load any image, add draggable text layers with Impact-style fonts and black outlines, position them freely by dragging on the canvas, then download your meme.
                  </p>
                </div>
                <DemoPreview
                  gifSrc={ memeGeneratorGif }
                  staticSrc={ memeGeneratorStaticImg }
                  alt="Meme Generator Demo"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
            
            {/* Left Controls column */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Global Typography Settings */}
              <div className="glass-card p-5 rounded-3xl space-y-4">
                <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2 text-sm">
                  <Type className="w-4.5 h-4.5 text-indigo-505" />
                  Meme Typography
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  {/* Font Family */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-455 uppercase tracking-wider block">Font Family</label>
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                      className="w-full bg-white/95 border border-slate-200/80 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-xs"
                    >
                      <option value="Impact">Impact</option>
                      <option value="Arial">Arial</option>
                      <option value="sans-serif">Sans-serif</option>
                      <option value="monospace">Monospace</option>
                    </select>
                  </div>

                  {/* Caps Lock Toggle */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block">Text Case</label>
                    <button
                      onClick={() => setAllCaps(!allCaps)}
                      className={`w-full py-1.5 px-2 rounded-lg text-xs font-bold border transition cursor-pointer ${
                        allCaps 
                          ? 'bg-indigo-650 border-indigo-500 text-white shadow-sm'
                          : 'bg-white/80 border-slate-200 text-slate-655 hover:text-slate-900 hover:bg-slate-50/50'
                      }`}
                    >
                      {allCaps ? 'ALL CAPS' : 'Normal Case'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Text Blocks list */}
              <div className="glass-card p-5 rounded-3xl space-y-4 max-h-[350px] overflow-y-auto">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h3 className="font-bold text-slate-800 text-sm">Captions List</h3>
                  <button 
                    onClick={addTextBlock}
                    className="px-2.5 py-1 bg-indigo-50/70 hover:bg-indigo-100 border border-indigo-150 text-[10px] font-bold text-indigo-650 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>

                <div className="space-y-3.5">
                  {textBlocks.map((tb, idx) => (
                    <div key={tb.id} className="p-3 bg-white/80 border border-slate-200/50 rounded-2xl space-y-3 relative">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider">#Caption {idx + 1}</span>
                        <button
                          onClick={() => deleteTextBlock(tb.id)}
                          className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-650 rounded transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <input
                        type="text"
                        value={tb.text}
                        onChange={(e) => updateTextBlock(tb.id, 'text', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 transition-all"
                        placeholder="Caption text..."
                      />

                      <div className="flex justify-between items-center gap-3">
                        {/* Size slider */}
                        <div className="flex-1 space-y-1">
                          <span className="text-[8px] font-bold text-slate-450 uppercase tracking-wider block">Size: {tb.size}px</span>
                          <input
                            type="range"
                            min="15"
                            max="80"
                            value={tb.size}
                            onChange={(e) => updateTextBlock(tb.id, 'size', Number(e.target.value))}
                            className="range-styled w-full"
                          />
                        </div>
                        {/* Color Picker */}
                        <input
                          type="color"
                          value={tb.color}
                          onChange={(e) => updateTextBlock(tb.id, 'color', e.target.value)}
                          className="w-6 h-6 border-none bg-transparent cursor-pointer rounded-full shrink-0"
                          title="Color"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTAs */}
              <div className="glass-card p-5 rounded-3xl space-y-3">
                <button
                  onClick={handleDownload}
                  disabled={isAssembling || !previewUrl}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-655 hover:from-indigo-550 hover:to-purple-550 disabled:opacity-50 text-[11px] font-bold uppercase tracking-wider text-white rounded-xl shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download Meme Image
                </button>

                <button
                  onClick={handleReset}
                  className="w-full py-3 bg-white hover:bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-655 hover:text-slate-900 border border-slate-200/60 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset Template
                </button>
              </div>

            </div>

            {/* Right Interactive Drag Viewport column */}
            <div className="lg:col-span-8 space-y-4">
              
              <div className="flex justify-between items-center glass-card rounded-2xl px-4 py-3 shadow-xs">
                <span className="text-xs font-bold text-slate-800">
                  Interactive Drag-and-Drop Workspace
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Drag text directly on the image to position
                </span>
              </div>

              {/* Viewport container */}
              <div 
                ref={containerRef}
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={handleDragStart}
                onTouchMove={handleDragMove}
                onTouchEnd={handleDragEnd}
                className="w-full border border-slate-200/80 rounded-3xl bg-slate-50/30 flex items-center justify-center min-h-[400px] shadow-inner p-4 relative overflow-hidden select-none cursor-move"
              >
                <div className="absolute inset-0 bg-dot-grid opacity-30 pointer-events-none" />

                {isAssembling ? (
                  <div className="flex flex-col items-center gap-2.5 relative z-10 pointer-events-none">
                    <RefreshCw className="w-8 h-8 text-indigo-650 animate-spin" />
                    <span className="text-xs font-bold text-slate-600 animate-pulse">Rendering meme...</span>
                  </div>
                ) : (
                  previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Meme Preview"
                      draggable={false}
                      className="max-w-full max-h-[600px] object-contain rounded-2xl shadow-2xl border border-slate-200 relative z-10 pointer-events-none select-none animate-float-subtle"
                    />
                  )
                )}
              </div>

              <div className="p-3.5 bg-indigo-50/50 border border-indigo-100/60 rounded-2xl flex items-start gap-2.5 text-[10px] text-slate-555 leading-normal font-medium">
                <Info className="w-4 h-4 text-indigo-650 shrink-0 mt-0.5 animate-pulse" />
                <div className="space-y-1">
                  <span>
                    **Tips on Positioning**:
                  </span>
                  <ul className="list-disc pl-3.5 space-y-0.5 text-slate-500">
                    <li>Simply click and hold any caption on the preview image, drag to change location, and release.</li>
                    <li>Add new caption blocks above using the "+ Add" control on the captions sidebar.</li>
                  </ul>
                </div>
              </div>

            </div>

          </div>
        )}

        <ToolGuide
          toolName="Meme Generator"
          introText="Caption popular meme formats or custom templates on-device. Position text boxes via simple drag-and-drop coordinates and export clean memes without watermark overlays."
          competitorComparison={{
            alternatives: ['Imgflip', 'Meme Generator Pro', 'Kapwing'],
            benefit: 'Most cloud meme generators force watermarks on free exports or charge subscriptions to unlock basic text formatting. ImageGiri generates high-res memes on your browser Canvas. No watermark is ever stamped, and your content remains completely local and private.'
          }}
          steps={[
            {
              title: 'Upload Meme Template',
              description: 'Select a clean template image (PNG, JPEG, WebP) by dragging it into the active upload zone.'
            },
            {
              title: 'Add Caption Blocks',
              description: 'Type caption texts, adjust font sizes, color fills, and outline weights. Click "+ Add Caption" to create more movable tags.'
            },
            {
              title: 'Position & Save',
              description: 'Drag text blocks around the preview canvas to align them perfectly. Once complete, click "Download Meme".'
            }
          ]}
          features={[
            'Interactive drag-and-drop positioning to align text boxes anywhere on the template.',
            'Classic Impact typography rendering with robust black outline borders for legibility.',
            'Customizable color fills, outline widths, and dynamic font sizes.',
            'Add unlimited text layers to create complex dialogues and layout cards.',
            'Offline-first execution ensures memes compile instantly without network lag.'
          ]}
          faq={[
            {
              q: 'Can I change the font style?',
              a: 'The tool uses the iconic sans-serif Impact font to maintain classic meme styling, but you can fully configure size, fill color, and stroke outline width.'
            },
            {
              q: 'How do I position the text?',
              a: 'Simply hover over the text in the preview box, click and drag it to your target coordinates, and let go.'
            },
            {
              q: 'Does it support animated GIFs?',
              a: 'Currently, the local Canvas context handles static raster image templates (PNG, JPEG, WebP).'
            }
          ]}
        />

      </div>
    </div>
  );
};
