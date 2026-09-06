import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Upload, 
  Cpu, 
  Crop, 
  ShieldAlert, 
  Files, 
  Wand2, 
  X, 
  ArrowRight, 
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';
import { setPendingTransferFile } from '../utils/sharedImageTransfer';
import { getLocaleFromPath, getLocalizedToolPath } from '../utils/i18n';

interface QuickAction {
  id: string;
  name: string;
  subtitle: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  gradient: string;
  badge: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'bg-remover',
    name: 'AI Background Remover',
    subtitle: 'Neural subject cutout',
    path: '/background-remover',
    icon: Cpu,
    color: 'text-purple-600 dark:text-purple-400',
    gradient: 'from-purple-500/15 via-indigo-500/10 to-transparent border-purple-200/80 dark:border-purple-800/60 hover:border-purple-400 dark:hover:border-purple-500',
    badge: 'Local AI'
  },
  {
    id: 'compressor',
    name: 'Smart Compressor',
    subtitle: 'Reduce up to 90% size',
    path: '/image-compressor',
    icon: ImageIcon,
    color: 'text-indigo-600 dark:text-indigo-400',
    gradient: 'from-indigo-500/15 via-blue-500/10 to-transparent border-indigo-200/80 dark:border-indigo-800/60 hover:border-indigo-400 dark:hover:border-indigo-500',
    badge: '-90% WebP'
  },
  {
    id: 'cropper',
    name: 'Interactive Cropper',
    subtitle: '1:1, 4:5, Passport 2x2"',
    path: '/crop-image',
    icon: Crop,
    color: 'text-blue-600 dark:text-blue-400',
    gradient: 'from-blue-500/15 via-cyan-500/10 to-transparent border-blue-200/80 dark:border-blue-800/60 hover:border-blue-400 dark:hover:border-blue-500',
    badge: 'Aspects'
  },
  {
    id: 'redactor',
    name: 'Photo Redactor',
    subtitle: 'Permanently blur faces & IDs',
    path: '/redact-image',
    icon: ShieldAlert,
    color: 'text-rose-600 dark:text-rose-400',
    gradient: 'from-rose-500/15 via-red-500/10 to-transparent border-rose-200/80 dark:border-rose-800/60 hover:border-rose-400 dark:hover:border-rose-500',
    badge: 'Zero Leak'
  },
  {
    id: 'converter',
    name: 'Format & PDF Converter',
    subtitle: 'WebP, PNG, JPEG, PDF',
    path: '/batch-converter',
    icon: Files,
    color: 'text-amber-600 dark:text-amber-400',
    gradient: 'from-amber-500/15 via-orange-500/10 to-transparent border-amber-200/80 dark:border-amber-800/60 hover:border-amber-400 dark:hover:border-amber-500',
    badge: 'Batch Ready'
  },
  {
    id: 'filters',
    name: 'Photo Filters & Duotone',
    subtitle: '12 aesthetic color gradings',
    path: '/photo-filters',
    icon: Wand2,
    color: 'text-fuchsia-600 dark:text-fuchsia-400',
    gradient: 'from-fuchsia-500/15 via-pink-500/10 to-transparent border-fuchsia-200/80 dark:border-fuchsia-800/60 hover:border-fuchsia-400 dark:hover:border-fuchsia-500',
    badge: 'Presets'
  },
];

export const HeroDropZone: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locale = getLocaleFromPath(location.pathname);

  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageDims, setImageDims] = useState<{ width: number; height: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleProcessFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WebP, SVG, etc.).');
      return;
    }

    setSelectedFile(file);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Measure dimensions
    const img = new Image();
    img.onload = () => {
      setImageDims({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = url;
  }, [previewUrl]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFile(e.target.files[0]);
    }
  };

  // Clipboard paste listener
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            handleProcessFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handleProcessFile]);

  // Clean up object URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleLaunchTool = (toolPath: string) => {
    if (selectedFile) {
      setPendingTransferFile(selectedFile);
    }
    const targetUrl = getLocalizedToolPath(toolPath, locale);
    navigate(targetUrl);
  };

  const handleReset = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setImageDims(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Create a high-quality sample canvas image for instant testing
  const handleLoadSampleImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Studio backdrop gradient
    const grad = ctx.createLinearGradient(0, 0, 1200, 800);
    grad.addColorStop(0, '#4f46e5');
    grad.addColorStop(0.5, '#7c3aed');
    grad.addColorStop(1, '#db2777');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1200, 800);

    // Decorative geometric rings
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(600, 400, 220, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(600, 400, 310, 0, Math.PI * 2);
    ctx.stroke();

    // Studio subject card
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(420, 240, 360, 320, 24);
    ctx.fill();

    // Text details
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ImagePlumber', 600, 370);

    ctx.fillStyle = '#64748b';
    ctx.font = '500 20px sans-serif';
    ctx.fillText('Sample Test Photo', 600, 420);

    ctx.fillStyle = '#4f46e5';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('100% PRIVATE • LOCAL RAM', 600, 480);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'sample_portrait_photo.jpg', { type: 'image/jpeg' });
        handleProcessFile(file);
      }
    }, 'image/jpeg', 0.95);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 my-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        id="hero-file-upload"
      />

      {!selectedFile ? (
        // IDLE STATE: Sleek, Tactile "Craft Dock" Drop Surface
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`craft-dock relative group p-4 sm:p-5 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4 ${
            isDragActive ? 'is-dragover scale-[1.01]' : ''
          }`}
        >
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <Upload className="w-5 h-5" />
            </div>

            <div>
              <div className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 tracking-tight">
                Select or drop photos anywhere to begin
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2 justify-center sm:justify-start mt-0.5">
                <span>Auto format detection</span>
                <span>•</span>
                <span>Batch up to 100 files</span>
                <span>•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% In-RAM</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleLoadSampleImage();
              }}
              className="hidden lg:inline-flex text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Sample
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
            >
              <Upload className="w-4 h-4" />
              <span>Select Images</span>
            </button>
          </div>
        </div>
      ) : (
        // ACTIVE PHOTO LOADED STATE: Studio Launcher Dashboard
        <div className="rounded-3xl p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl shadow-indigo-500/10 animate-fade-in relative overflow-hidden">
          
          {/* Top File Summary Bar */}
          <div className="flex items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 min-w-0">
              {previewUrl && (
                <div className="w-14 h-14 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 shadow-xs relative">
                  <img
                    src={previewUrl}
                    alt="Uploaded thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100 truncate max-w-[200px] sm:max-w-xs">
                    {selectedFile.name}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800 px-2 py-0.2 rounded-md">
                    Ready
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5 font-medium">
                  <span>{formatFileSize(selectedFile.size)}</span>
                  {imageDims && (
                    <>
                      <span>•</span>
                      <span>{imageDims.width} × {imageDims.height} px</span>
                    </>
                  )}
                  <span>•</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% In-RAM</span>
                </div>
              </div>
            </div>

            {/* Change Photo Button */}
            <button
              type="button"
              onClick={handleReset}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              title="Change image"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Tool Selector Grid */}
          <div className="mb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 text-left">
              Choose an action for this image:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-left">
              {QUICK_ACTIONS.map((action) => {
                const ActionIcon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => handleLaunchTool(action.path)}
                    className={`p-3.5 rounded-2xl border bg-gradient-to-br ${action.gradient} transition-all duration-200 group flex items-start gap-3 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.985] cursor-pointer text-left relative overflow-hidden`}
                  >
                    <div className={`w-8 h-8 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-slate-200/60 dark:border-slate-700 flex items-center justify-center shrink-0 ${action.color} group-hover:scale-110 transition-transform`}>
                      <ActionIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                          {action.name}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all shrink-0" />
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium mt-0.5">
                        {action.subtitle}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
