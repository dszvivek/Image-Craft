import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Download, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { DropZone } from '../components/DropZone';
import { ProgressBar } from '../components/ProgressBar';
import { SEO } from '../components/SEO';
import bgRemoverGif from '../assets/bg_remover_feature.gif';

interface WorkerProgress {
  status: 'progress' | 'processing' | 'complete' | 'error';
  progress?: number;
  file?: string;
  mask?: {
    width: number;
    height: number;
    data: number[];
  };
  error?: string;
}

export const BackgroundRemover: React.FC = () => {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [processedUrl, setProcessedUrl] = useState<string>('');
  const [loadingState, setLoadingState] = useState<'idle' | 'loading-model' | 'processing-image' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const workerRef = useRef<Worker | null>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setOriginalFile(file);
      const url = URL.createObjectURL(file);
      setOriginalUrl(url);
      processImage(file);
    }
  };

  const processImage = (file: File) => {
    setLoadingState('loading-model');
    setProgress(0);
    setStatusMessage('Initializing Local AI model...');

    // Initialize Web Worker
    if (workerRef.current) {
      workerRef.current.terminate();
    }

    // Spawn native ESM worker via Vite URL resolver
    workerRef.current = new Worker(
      new URL('../workers/background-remover.worker.ts', import.meta.url),
      { type: 'module' }
    );

    workerRef.current.onmessage = (event: MessageEvent<WorkerProgress>) => {
      const data = event.data;

      if (data.status === 'progress') {
        // Model downloading progress
        const percent = data.progress ? Math.round(data.progress) : 0;
        setProgress(percent);
        setLoadingState('loading-model');
        setStatusMessage(`Downloading AI weights: ${percent}%`);
      } else if (data.status === 'processing') {
        // Model processing pixels
        setLoadingState('processing-image');
        setProgress(50);
        setStatusMessage('AI is segmenting foreground pixels...');
      } else if (data.status === 'complete' && data.mask) {
        setStatusMessage('Applying transparent overlay...');
        setProgress(90);
        applyMask(file, data.mask);
      } else if (data.status === 'error') {
        setLoadingState('error');
        setErrorMsg(data.error || 'Failed to remove background.');
      }
    };

    // Load file as base64 and send to worker
    const reader = new FileReader();
    reader.onerror = () => {
      setLoadingState('error');
      setErrorMsg('Failed to read image file.');
    };
    reader.onload = () => {
      if (workerRef.current) {
        workerRef.current.postMessage({ image: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const applyMask = (file: File, mask: { width: number; height: number; data: number[] }) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = mask.width;
      canvas.height = mask.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setLoadingState('error');
        setErrorMsg('Failed to create canvas context.');
        return;
      }

      // Draw original image resized to fit mask
      ctx.drawImage(img, 0, 0, mask.width, mask.height);

      const imgData = ctx.getImageData(0, 0, mask.width, mask.height);
      const originalPixels = imgData.data;

      // Apply grayscale alpha mask values directly to the image data channels
      for (let i = 0; i < mask.data.length; i++) {
        // index i * 4 + 3 is the alpha channel
        originalPixels[i * 4 + 3] = mask.data[i];
      }

      ctx.putImageData(imgData, 0, 0);

      // Create object URL from processed canvas blob
      canvas.toBlob((blob) => {
        if (blob) {
          if (processedUrl) URL.revokeObjectURL(processedUrl);
          setProcessedUrl(URL.createObjectURL(blob));
          setLoadingState('completed');
          setProgress(100);
          setStatusMessage('Background removed successfully.');
        } else {
          setLoadingState('error');
          setErrorMsg('Failed to generate output image.');
        }
        URL.revokeObjectURL(img.src);
      }, 'image/png');
    };

    img.onerror = () => {
      setLoadingState('error');
      setErrorMsg('Failed to load image element.');
    };
  };

  const handleDownload = () => {
    if (!processedUrl || !originalFile) return;
    const link = document.createElement('a');
    link.href = processedUrl;
    link.download = `${originalFile.name.substring(0, originalFile.name.lastIndexOf('.'))}_no_bg.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (processedUrl) URL.revokeObjectURL(processedUrl);
    setOriginalFile(null);
    setOriginalUrl('');
    setProcessedUrl('');
    setLoadingState('idle');
    setProgress(0);
    setStatusMessage('');
  };

  const handleCancel = () => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    setLoadingState('idle');
    setProgress(0);
  };

  useEffect(() => {
    return () => {
      if (workerRef.current) workerRef.current.terminate();
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (processedUrl) URL.revokeObjectURL(processedUrl);
    };
  }, []);

  return (
    <div className="w-full">
      <SEO 
        title="Local AI Background Remover" 
        description="Remove background from images in seconds. 100% offline, privacy-first AI background cutout tool running inside your browser." 
      />

      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-purple-655 uppercase tracking-widest px-2.5 py-1 bg-purple-50 border border-purple-100 rounded-full shadow-sm">
            AI Tool
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-3 mb-2">AI Background Remover</h1>
          <p className="text-sm text-slate-500">Isolate portraits and objects using standard on-device neural networks. No server uploads.</p>
        </div>

        {loadingState === 'idle' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
            <div className="md:col-span-7 flex flex-col justify-center">
              <DropZone 
                onFilesSelected={handleFilesSelected}
                title="Drop image to remove background"
                subtitle="Supports JPG, PNG, WebP up to 15MB"
              />
            </div>
            <div className="md:col-span-5 flex">
              <div className="premium-bento rounded-3xl p-6 bg-white border border-slate-200/50 flex flex-col justify-between w-full shadow-sm hover:border-indigo-300 transition-all duration-300">
                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-indigo-650 bg-indigo-50/50 border border-indigo-100/60 px-2 py-0.5 rounded uppercase tracking-wider inline-block">Demo Preview</div>
                  <h3 className="text-base font-extrabold text-slate-900">How AI Background Remover Works</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Our local AI segments your images in seconds directly on your device. Easily extract people, animals, and objects without sending files to any server.
                  </p>
                </div>
                <div className="my-5 rounded-2xl overflow-hidden aspect-[4/3] border border-slate-150 shadow-xs relative pointer-events-none select-none">
                  <img src={bgRemoverGif} alt="Background Remover Demo" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        )}

        {(loadingState === 'loading-model' || loadingState === 'processing-image') && (
          <div className="premium-bento p-10 rounded-3xl bg-white flex flex-col items-center justify-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-150/80 flex items-center justify-center animate-pulse text-indigo-650 shadow-xs">
              <Cpu className="w-7 h-7" />
            </div>
            
            <ProgressBar 
              progress={progress}
              label={loadingState === 'loading-model' ? 'Loading AI Model' : 'Processing Image'}
              subLabel={statusMessage}
              onCancel={handleCancel}
            />

            <div className="p-3.5 bg-slate-50 border border-slate-200/60 rounded-2xl max-w-sm flex items-start gap-2.5 text-[11px] text-slate-500 mt-2 font-medium">
              <AlertTriangle className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <span>
                First-time execution downloads a 13MB AI weights file into your local browser storage. Subsequent uses are instantaneous and work fully offline.
              </span>
            </div>
          </div>
        )}

        {loadingState === 'error' && (
          <div className="premium-bento p-8 rounded-3xl bg-white border-red-150 text-center flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-red-50 border border-red-200 text-red-650 rounded-2xl flex items-center justify-center font-bold">
              !
            </div>
            <h3 className="text-lg font-bold text-slate-850">An Error Occurred</h3>
            <p className="text-xs md:text-sm text-slate-550 max-w-md">{errorMsg}</p>
            <button
              onClick={handleReset}
              className="px-6 py-2.5 bg-white hover:bg-slate-50 border border-slate-200/60 text-xs font-bold text-slate-655 rounded-xl transition cursor-pointer shadow-xs"
            >
              Try Again
            </button>
          </div>
        )}

        {loadingState === 'completed' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* Visual preview and checks */}
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">
                Original Image
              </span>
              <div className="w-full h-[320px] bg-slate-50 border border-slate-200/60 rounded-2xl overflow-hidden flex items-center justify-center p-2">
                <img src={originalUrl} alt="Original" className="max-w-full max-h-full object-contain rounded-lg shadow-sm" />
              </div>
            </div>

            <div className="space-y-4">
              <span className="text-[10px] font-bold text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 uppercase tracking-widest inline-block">
                Cutout Preview (Transparent)
              </span>
              
              {/* Checkerboard transparent background wrapper */}
              <div 
                className="w-full h-[320px] border-2 border-indigo-500/20 rounded-2xl overflow-hidden flex items-center justify-center p-2 relative"
                style={{ 
                  backgroundImage: 'radial-gradient(#cbd5e1 20%, transparent 20%), radial-gradient(#cbd5e1 20%, transparent 20%)',
                  backgroundPosition: '0 0, 8px 8px',
                  backgroundSize: '16px 16px',
                  backgroundColor: '#f8fafc'
                }}
              >
                <img src={processedUrl} alt="No background" className="max-w-full max-h-full object-contain rounded-lg drop-shadow-xl animate-float" />
              </div>

              {/* Action buttons */}
              <div className="premium-bento p-5 rounded-3xl bg-white flex flex-col gap-3 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-650 bg-slate-55 p-2.5 rounded-xl border border-slate-200/60 shadow-xs">
                  <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
                  Your file processed 100% locally.
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleDownload}
                    className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-650 hover:from-indigo-550 hover:to-purple-550 text-[11px] font-bold uppercase tracking-wider text-white rounded-xl shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Download PNG
                  </button>

                  <button
                    onClick={handleReset}
                    className="py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200/60 hover:border-slate-350 text-[11px] font-bold uppercase tracking-wider text-slate-650 hover:text-slate-900 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    title="Process another image"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reset
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
