import React, { useState, useEffect, useRef } from 'react';
import { Palette, Copy, RefreshCw, Check, FileCode, ImageIcon, ShieldCheck } from 'lucide-react';
import { DropZone } from '../components/DropZone';
import { extractDominantColors } from '../utils/colorExtractor';
import type { ColorSwatch } from '../types';
import { SEO } from '../components/SEO';
import paletteExtractorGif from '../assets/palette_extractor_feature.gif';

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
      ctx.fillStyle = '#f8fafc'; // slate-50 background
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

  return (
    <div className="w-full">
      <SEO 
        title="Free Color Palette Extractor" 
        description="Extract dominant colors from any image directly in your browser. Get Hex codes, RGB values, and color coverage percentages instantly. Download palettes as PNG swatches, CSS variables, or JSON. No uploads, 100% private." 
        keywords="color palette extractor, extract colors from image, color picker from image, image color palette, dominant color extractor, color scheme extractor, HEX color extractor, RGB color picker, color swatch generator, palette generator, CSS color variables"
        canonicalUrl="https://imagegiri.com/color-palette-extractor"
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
              <div className="premium-bento rounded-3xl p-6 bg-white border border-slate-200/50 flex flex-col justify-between w-full shadow-sm hover:border-indigo-300 transition-all duration-300">
                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-indigo-650 bg-indigo-50/50 border border-indigo-100/60 px-2 py-0.5 rounded uppercase tracking-wider inline-block">Demo Preview</div>
                  <h3 className="text-base font-extrabold text-slate-900">How Palette Extractor Works</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Analyze design colors and generate harmonized swatches locally. Copy hex/rgb codes, download custom JSON files, CSS variables, or visual swatch sheets instantly.
                  </p>
                </div>
                <div className="my-5 rounded-2xl overflow-hidden aspect-[4/3] border border-slate-150 shadow-xs relative pointer-events-none select-none">
                  <img src={paletteExtractorGif} alt="Color Palette Extractor Demo" className="w-full h-full object-cover" />
                </div>
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
              <div className="w-full h-[320px] bg-slate-100/50 border border-slate-200 rounded-2xl overflow-hidden flex items-center justify-center p-2">
                <img src={originalUrl} alt="Source" className="max-w-full max-h-full object-contain rounded-lg shadow-md" />
              </div>

              {/* Palette Size Slider */}
              <div className="premium-bento p-4.5 rounded-3xl bg-white border border-slate-200/50 space-y-3 shadow-xs">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-455 font-bold">Swatches to Extract</span>
                  <span className="font-bold text-indigo-650 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded shadow-xs">
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
              
              <div className="flex justify-between items-center bg-white border border-slate-200/50 rounded-2xl px-4 py-3 shadow-xs">
                <span className="text-xs font-bold text-slate-800">
                  Extracted Swatches
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Secure local analysis
                </span>
              </div>

              {isProcessing ? (
                <div className="w-full h-[250px] border border-slate-200 rounded-2xl bg-slate-50 flex items-center justify-center">
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
                      className="premium-bento p-3.5 rounded-3xl bg-white flex items-center justify-between gap-4 hover:border-indigo-500/20 transition-all shadow-xs"
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
                              className="p-1 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-indigo-600 transition cursor-pointer"
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
                              className="p-1 hover:bg-slate-55 rounded-lg text-slate-500 hover:text-indigo-600 transition cursor-pointer"
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
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600">
                          {color.percentage}% coverage
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Downloads & Reset controls */}
              {palette.length > 0 && (
                <div className="premium-bento p-5 rounded-3xl bg-white space-y-4 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-455 uppercase tracking-widest block">
                    Export Palette
                  </span>
                  
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      onClick={downloadPNGSwatch}
                      className="py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-200/60 hover:border-slate-350 text-[10px] font-bold uppercase tracking-wider text-slate-655 hover:text-slate-900 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                      PNG Swatch
                    </button>

                    <button
                      onClick={downloadCSS}
                      className="py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-200/60 hover:border-slate-350 text-[10px] font-bold uppercase tracking-wider text-slate-655 hover:text-slate-900 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <FileCode className="w-3.5 h-3.5 text-slate-500" />
                      CSS Root
                    </button>

                    <button
                      onClick={downloadJSON}
                      className="py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-200/60 hover:border-slate-350 text-[10px] font-bold uppercase tracking-wider text-slate-655 hover:text-slate-900 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Palette className="w-3.5 h-3.5 text-slate-500" />
                      JSON file
                    </button>
                  </div>

                  <div className="border-t border-slate-200/60 pt-3.5 flex justify-end">
                    <button
                      onClick={handleReset}
                      className="py-2.5 px-5 bg-white hover:bg-slate-50 border border-slate-200/60 hover:border-slate-350 text-[11px] font-bold uppercase tracking-wider text-slate-655 hover:text-slate-900 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-xs"
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

      </div>
    </div>
  );
};
