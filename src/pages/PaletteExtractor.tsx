import React, { useState, useEffect, useRef } from 'react';
import { Palette, Copy, RefreshCw, Check, FileCode, ImageIcon, ShieldCheck } from 'lucide-react';
import { DropZone } from '../components/DropZone';
import { extractDominantColors } from '../utils/colorExtractor';
import type { ColorSwatch } from '../types';
import { SEO } from '../components/SEO';
import { ToolGuide } from '../components/ToolGuide';
import { DemoPreview } from '../components/DemoPreview';

export const PaletteExtractor: React.FC = () => {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [palette, setPalette] = useState<ColorSwatch[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedType, setCopiedType] = useState<'hex' | 'rgb' | null>(null);
  const [paletteCount, setPaletteCount] = useState<number>(6);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setOriginalFile(file);
      setOriginalUrl(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    if (!originalUrl) return;

    setIsProcessing(true);
    const img = new Image();
    img.src = originalUrl;
    img.onload = () => {
      const colors = extractDominantColors(img, paletteCount);
      setPalette(colors);
      setIsProcessing(false);
    };
    img.onerror = () => {
      setIsProcessing(false);
    };
  }, [originalUrl, paletteCount]);

  const handleCopyText = (text: string, index: number, type: 'hex' | 'rgb') => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setCopiedType(type);
    setTimeout(() => {
      setCopiedIndex(null);
      setCopiedType(null);
    }, 1500);
  };

  const downloadJSON = () => {
    if (palette.length === 0 || !originalFile) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(palette, null, 2));
    const link = document.createElement('a');
    link.href = dataStr;
    link.download = `${originalFile.name.substring(0, originalFile.name.lastIndexOf('.'))}_palette.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadCSS = () => {
    if (palette.length === 0 || !originalFile) return;
    let cssContent = `/* Color Palette Extracted from ${originalFile.name} */\n:root {\n`;
    palette.forEach((color, i) => {
      cssContent += `  --color-dominant-${i + 1}: ${color.hex};\n`;
    });
    cssContent += `}\n`;

    const blob = new Blob([cssContent], { type: 'text/css;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${originalFile.name.substring(0, originalFile.name.lastIndexOf('.'))}_palette.css`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadPNGSwatch = () => {
    if (palette.length === 0 || !originalFile) return;

    const canvas = document.createElement('canvas');
    const swatchWidth = 200;
    const swatchHeight = 350;
    canvas.width = swatchWidth * palette.length;
    canvas.height = swatchHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    palette.forEach((color, index) => {
      const x = index * swatchWidth;

      // Draw color block
      ctx.fillStyle = color.hex;
      ctx.fillRect(x, 0, swatchWidth, swatchHeight * 0.7);

      // Draw bottom text label backdrop
      ctx.fillStyle = '#F4F1EA'; // slate-50 background
      ctx.fillRect(x, swatchHeight * 0.7, swatchWidth, swatchHeight * 0.3);

      // Draw Hex Text
      ctx.fillStyle = '#0f172a'; // slate-900 text
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(color.hex.toUpperCase(), x + swatchWidth / 2, swatchHeight * 0.82);

      // Draw RGB Text
      ctx.fillStyle = '#64748b'; // slate-500 text
      ctx.font = '12px monospace';
      ctx.fillText(color.rgb, x + swatchWidth / 2, swatchHeight * 0.92);
    });

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${originalFile.name.substring(0, originalFile.name.lastIndexOf('.'))}_palette.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    }, 'image/png');
  };

  const handleReset = () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    setOriginalFile(null);
    setOriginalUrl('');
    setPalette([]);
  };

  const originalUrlRef = useRef<string>(originalUrl);
  originalUrlRef.current = originalUrl;

  useEffect(() => {
    return () => {
      if (originalUrlRef.current) URL.revokeObjectURL(originalUrlRef.current);
    };
  }, []);

  const paletteSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Color Palette Extractor - ImageGiri',
    'applicationCategory': 'MultimediaApplication',
    'operatingSystem': 'Web Browser',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    },
    'description': 'Extract dominant color schemes and hex color codes from design mockups, images, and photos. Online color palette generator that runs 100% offline in your browser.',
    'featureList': [
      'Extract 6 dominant color swatches',
      'K-Means color quantization analysis',
      'Copy HEX/RGB/HSL values',
      'Export to CSS root variables and JSON'
    ]
  };

  return (
    <div className="w-full">
      <SEO 
        title="Free Color Palette Extractor - Coolors Alternative" 
        description="Extract dominant color schemes and HEX/RGB codes from images locally in your browser. A free, offline alternative to Coolors and Adobe Color." 
        keywords="color palette extractor, extract colors from image, color scheme generator, HEX code finder, image color picker, RGB values, color swatches, design asset colors, online palette maker, free color extraction, offline palette generator, Coolors alternative, Adobe Color alternative, extract colors offline"
        canonicalUrl="https://imagegiri.com/color-palette-extractor"
        schema={paletteSchema}
      />

      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-cyan-650 uppercase tracking-widest px-2.5 py-1 bg-cyan-50 border border-cyan-100 rounded-full shadow-sm">
            Design Tool
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-3 mb-2">Color Palette Extractor</h1>
          <p className="text-sm text-slate-500">Generate harmonized swatches from uploads. Executed 100% on-device inside memory.</p>
        </div>

        {!originalFile ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
            <div className="md:col-span-7 flex flex-col justify-center">
              <DropZone 
                onFilesSelected={handleFilesSelected}
                title="Drop image to extract palette"
                subtitle="Supports JPEG, PNG, WebP, SVG"
              />
            </div>
            <div className="md:col-span-5 flex">
              <div className="premium-bento rounded-3xl p-6 flex flex-col justify-between w-full shadow-sm hover:border-indigo-350 transition-all duration-300">
                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-indigo-650 bg-indigo-50/30 border border-indigo-100/60 px-2 py-0.5 rounded uppercase tracking-wider inline-block">Demo Preview</div>
                  <h3 className="text-base font-extrabold text-slate-900">How Palette Extractor Works</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Analyze design colors and generate harmonized swatches locally. Copy hex/rgb codes, download custom JSON files, CSS variables, or visual swatch sheets instantly.
                  </p>
                </div>
                <DemoPreview
                  toolId="palette"
                  alt="Color Palette Extractor Demo"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Image View */}
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold text-slate-550 uppercase tracking-wider block">
                Source Design File
              </span>
              <div className="w-full h-[320px] bg-slate-50/30 border border-slate-200/80 rounded-2xl overflow-hidden flex items-center justify-center p-2">
                <img src={originalUrl} alt="Source" className="max-w-full max-h-full object-contain rounded-lg shadow-md" />
              </div>

              {/* Palette Size Slider */}
              <div className="glass-card p-4.5 rounded-3xl space-y-3">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-455 font-bold">Swatches to Extract</span>
                  <span className="font-bold text-indigo-650 bg-indigo-50/50 border border-indigo-100 px-2 py-0.5 rounded shadow-xs">
                    {paletteCount} Colors
                  </span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="10"
                  value={paletteCount}
                  onChange={(e) => setPaletteCount(Number(e.target.value))}
                  className="range-styled w-full cursor-pointer"
                />
              </div>
            </div>

            {/* Right Color Swatches Result */}
            <div className="lg:col-span-7 space-y-5">
              
              <div className="flex justify-between items-center glass-card rounded-2xl px-4 py-3 shadow-xs">
                <span className="text-xs font-bold text-slate-800">
                  Extracted Swatches
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Secure local analysis
                </span>
              </div>

              {isProcessing ? (
                <div className="w-full h-[250px] border border-slate-200/70 rounded-2xl bg-slate-50/30 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2.5">
                    <RefreshCw className="w-8 h-8 text-indigo-650 animate-spin" />
                    <span className="text-xs font-bold text-slate-600">Analyzing pixels...</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {palette.map((color, index) => (
                    <div 
                      key={index} 
                      className="glass-card p-3.5 rounded-3xl flex items-center justify-between gap-4 hover:border-indigo-500/30 transition-all"
                    >
                      {/* Swatch block */}
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-12 h-12 rounded-xl shadow-inner border border-slate-200/60"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-slate-850 uppercase">
                              {color.hex}
                            </span>
                            <button
                              onClick={() => handleCopyText(color.hex, index, 'hex')}
                              className="p-1 hover:bg-indigo-50/20 rounded-lg text-slate-500 hover:text-indigo-600 transition cursor-pointer"
                              title="Copy HEX"
                            >
                              {copiedIndex === index && copiedType === 'hex' ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5 text-slate-400" />
                              )}
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[10px] text-slate-455">
                              {color.rgb}
                            </span>
                            <button
                              onClick={() => handleCopyText(color.rgb, index, 'rgb')}
                              className="p-1 hover:bg-indigo-50/20 rounded-lg text-slate-500 hover:text-indigo-600 transition cursor-pointer"
                              title="Copy RGB"
                            >
                              {copiedIndex === index && copiedType === 'rgb' ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3 text-slate-400" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Percentage match */}
                      {color.percentage !== undefined && (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-slate-50/40 border border-slate-200 text-slate-600">
                          {color.percentage}% coverage
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Downloads & Reset controls */}
              {palette.length > 0 && (
                <div className="glass-card p-5 rounded-3xl space-y-4">
                  <span className="text-[10px] font-bold text-slate-455 uppercase tracking-widest block">
                    Export Palette
                  </span>
                  
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      onClick={downloadPNGSwatch}
                      className="py-2.5 px-3 bg-white/95 hover:bg-slate-50/50 border border-slate-200/50 hover:border-slate-350 text-[10px] font-bold uppercase tracking-wider text-slate-655 hover:text-slate-900 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                      PNG Swatch
                    </button>

                    <button
                      onClick={downloadCSS}
                      className="py-2.5 px-3 bg-white/95 hover:bg-slate-50/50 border border-slate-200/50 hover:border-slate-350 text-[10px] font-bold uppercase tracking-wider text-slate-655 hover:text-slate-900 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <FileCode className="w-3.5 h-3.5 text-slate-500" />
                      CSS Root
                    </button>

                    <button
                      onClick={downloadJSON}
                      className="py-2.5 px-3 bg-white/95 hover:bg-slate-50/50 border border-slate-200/50 hover:border-slate-350 text-[10px] font-bold uppercase tracking-wider text-slate-655 hover:text-slate-900 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Palette className="w-3.5 h-3.5 text-slate-500" />
                      JSON file
                    </button>
                  </div>

                  <div className="border-t border-slate-200/60 pt-3.5 flex justify-end">
                    <button
                      onClick={handleReset}
                      className="py-2.5 px-5 bg-white/95 hover:bg-slate-50/50 border border-slate-200/50 hover:border-slate-350 text-[11px] font-bold uppercase tracking-wider text-slate-655 hover:text-slate-900 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Reset Extractor
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

        <ToolGuide
          toolName="Color Palette Extractor"
          introText="Extract perfect color schemes from design mockups, branding assets, or landscape photography using mathematical K-Means quantization computed on-device."
          competitorComparison={{
            alternatives: ['Coolors', 'Adobe Color Palette', 'Colormind'],
            benefit: 'Most cloud-based palette generators limit export formats behind premium memberships or process uploads on remote databases. ImageGiri extracts color swatches inside your browser window. Copy HEX, RGB, or HSL codes instantly, and export structured color tokens with zero logins.'
          }}
          steps={[
            {
              title: 'Upload Image',
              description: 'Select a photo, design asset, screenshot, or brand file to read colors.'
            },
            {
              title: 'Extract Palette',
              description: 'The canvas sweeps pixel clusters using K-Means grouping to identify the top dominant colors along with their percentage weights.'
            },
            {
              title: 'Export Swatches',
              description: 'Click any individual color to copy its HEX/RGB format, or click the code/image buttons to download CSS Root Variables, JSON array, or a visual PNG swatch card.'
            }
          ]}
          features={[
            'Precision color clustering engine with weight coverage percentage.',
            'Copy HEX and RGB color formats to clipboard with a single click.',
            'Download formatted code packages (JSON and CSS root declarations).',
            'Download visual swatch cards (PNG) for direct Photoshop/Figma imports.',
            'Runs completely client-side to ensure intellectual design assets are safe.'
          ]}
          faq={[
            {
              q: 'How does it find the dominant colors?',
              a: 'It scans the pixel array of the uploaded image and applies color quantization (K-Means) to group adjacent color hues, picking the centroids of the most common clusters.'
            },
            {
              q: 'Can I extract colors from SVGs?',
              a: 'Yes, any raster representation rendered on a canvas can be parsed to extract dominant color profiles.'
            },
            {
              q: 'Is my design asset secure?',
              a: 'Absolutely. All pixel scanning runs inside the browser’s canvas sandbox. No external APIs or servers are involved.'
            }
          ]}
        />

      </div>
    </div>
  );
};
