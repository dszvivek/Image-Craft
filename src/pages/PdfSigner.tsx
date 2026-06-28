import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  RefreshCw, 
  Type, 
  PenTool, 
  Upload, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2,
  Lock
} from 'lucide-react';
import { SEO } from '../components/SEO';
import { ToolGuide } from '../components/ToolGuide';
import { DropZone } from '../components/DropZone';
import { ProgressBar } from '../components/ProgressBar';

// Script loaders
const loadPdfJS = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if ((window as any).pdfjsLib) {
      resolve((window as any).pdfjsLib);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      const pdfjsLib = (window as any).pdfjsLib;
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve(pdfjsLib);
    };
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
  });
};

const loadPdfLib = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if ((window as any).PDFLib) {
      resolve((window as any).PDFLib);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
    script.onload = () => {
      resolve((window as any).PDFLib);
    };
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
  });
};

interface SignaturePlacement {
  id: string;
  x: number; // percentage from left
  y: number; // percentage from top
  width: number; // px width
  height: number; // px height
  page: number; // 1-indexed page number
  imageSrc: string; // base64 PNG data
}

export const PdfSigner: React.FC = () => {
  // PDF state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Signature creation state
  const [signatureMode, setSignatureMode] = useState<'draw' | 'type' | 'upload'>('draw');
  const [drawColor, setDrawColor] = useState<string>('#000000');
  const [typedName, setTypedName] = useState<string>('');
  const [typedFont, setTypedFont] = useState<string>('font-handwritten-1');
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string>('');
  const [activeSignature, setActiveSignature] = useState<string>(''); // base64 PNG representation
  
  // Signature placement on PDF state
  const [placements, setPlacements] = useState<SignaturePlacement[]>([]);
  const [selectedPlacementId, setSelectedPlacementId] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState<boolean>(false);

  // References
  const drawCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const canvasSizeRef = useRef<{ width: number; height: number }>({ width: 600, height: 800 });

  // Load Google Fonts for typing signatures
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Cedarville+Cursive&family=Great+Vibes&family=Satisfy&family=Alex+Brush&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Set up drawing canvas events
  useEffect(() => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = drawColor;
  }, [drawColor, signatureMode]);

  // Render PDF page when currentPage or pdfBytes change
  useEffect(() => {
    if (!pdfBytes) return;
    renderPage(currentPage);
  }, [pdfBytes, currentPage]);

  const renderPage = async (pageNumber: number) => {
    if (!pdfBytes) return;
    try {
      const pdfjsLib = await loadPdfJS();
      const pdf = await pdfjsLib.getDocument({ data: pdfBytes.slice(0) }).promise;
      const page = await pdf.getPage(pageNumber);
      
      const canvas = pdfCanvasRef.current;
      if (!canvas) return;
      
      const context = canvas.getContext('2d');
      if (!context) return;

      // Fit container viewport width (maximum width of 600px for responsiveness)
      const containerWidth = Math.min(workspaceRef.current?.clientWidth || 600, 600);
      const tempViewport = page.getViewport({ scale: 1 });
      const scale = containerWidth / tempViewport.width;
      const viewport = page.getViewport({ scale });

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvasSizeRef.current = { width: viewport.width, height: viewport.height };

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      await page.render(renderContext).promise;
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Failed to render PDF page: ' + err.message);
    }
  };

  // Drawing Pad Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    e.preventDefault();
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    if ('touches' in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    lastPointRef.current = { x, y };

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = drawColor;
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    const canvas = drawCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    const lastPoint = lastPointRef.current;
    if (!canvas || !ctx || !lastPoint) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    if ('touches' in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = drawColor;
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(x, y);
    ctx.stroke();

    lastPointRef.current = { x, y };
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
    generateBase64FromDrawing();
  };

  const clearDrawing = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setActiveSignature('');
  };

  const generateBase64FromDrawing = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    
    // Check if canvas is blank
    const blank = document.createElement('canvas');
    blank.width = canvas.width;
    blank.height = canvas.height;
    if (canvas.toDataURL() === blank.toDataURL()) {
      setActiveSignature('');
      return;
    }
    
    setActiveSignature(canvas.toDataURL());
  };

  // Typographic signature handlers
  useEffect(() => {
    if (signatureMode !== 'type') return;
    generateBase64FromType();
  }, [typedName, typedFont, drawColor, signatureMode]);

  const generateBase64FromType = () => {
    if (!typedName.trim()) {
      setActiveSignature('');
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let fontStyle = 'cursive';
    if (typedFont === 'font-handwritten-1') fontStyle = 'Cedarville Cursive';
    else if (typedFont === 'font-handwritten-2') fontStyle = 'Great Vibes';
    else if (typedFont === 'font-handwritten-3') fontStyle = 'Satisfy';
    else if (typedFont === 'font-handwritten-4') fontStyle = 'Alex Brush';

    ctx.font = `36px "${fontStyle}", cursive`;
    ctx.fillStyle = drawColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(typedName, canvas.width / 2, canvas.height / 2);

    setActiveSignature(canvas.toDataURL());
  };

  // Upload signature handlers
  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const pngDataUrl = canvas.toDataURL('image/png');
          setUploadedImageSrc(pngDataUrl);
          setActiveSignature(pngDataUrl);
        }
      };
      img.onerror = () => {
        setErrorMessage('Invalid image file for signature.');
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  // DropZone PDF Loader
  const handleFilesSelected = async (files: File[]) => {
    const file = files[0];
    if (!file || file.type !== 'application/pdf') {
      setErrorMessage('Please select a valid PDF document.');
      return;
    }
    setErrorMessage('');
    setIsProcessing(true);
    setProgress(30);
    setStatusMessage('Loading PDF document...');
    
    try {
      const pdfjsLib = await loadPdfJS();
      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer.slice(0) }).promise;
      
      setPdfFile(file);
      setPdfBytes(buffer);
      setNumPages(pdf.numPages);
      setCurrentPage(1);
      setPlacements([]);
      setSelectedPlacementId(null);
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Failed to load PDF: ' + err.message);
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  // Signature placement controls
  const placeSignatureOnDocument = () => {
    if (!activeSignature) return;
    const newPlacement: SignaturePlacement = {
      id: `sig-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      x: 35, // default centered
      y: 40,
      width: 150,
      height: 60,
      page: currentPage,
      imageSrc: activeSignature
    };
    setPlacements([...placements, newPlacement]);
    setSelectedPlacementId(newPlacement.id);
  };

  const removePlacement = (id: string) => {
    setPlacements(placements.filter(p => p.id !== id));
    if (selectedPlacementId === id) setSelectedPlacementId(null);
  };

  // Drag and resize handlers inside PDF Canvas viewport
  const handlePlacementMouseDown = (e: React.MouseEvent<HTMLDivElement>, placement: SignaturePlacement) => {
    e.stopPropagation();
    setSelectedPlacementId(placement.id);
    const canvas = pdfCanvasRef.current;
    if (!canvas) return;
    
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY
    };
  };

  const handleContainerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragStartRef.current || !selectedPlacementId) return;
    
    const placement = placements.find(p => p.id === selectedPlacementId);
    const canvas = pdfCanvasRef.current;
    if (!placement || !canvas || placement.page !== currentPage) return;

    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    // Convert pixel movements into canvas percentage limits
    const xChangePercent = (deltaX / canvas.width) * 100;
    const yChangePercent = (deltaY / canvas.height) * 100;

    let newX = Math.max(0, Math.min(100 - (placement.width / canvas.width) * 100, placement.x + xChangePercent));
    let newY = Math.max(0, Math.min(100 - (placement.height / canvas.height) * 100, placement.y + yChangePercent));

    setPlacements(placements.map(p => {
      if (p.id === selectedPlacementId) {
        return { ...p, x: newX, y: newY };
      }
      return p;
    }));

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY
    };
  };

  const handleContainerMouseUp = () => {
    dragStartRef.current = null;
  };

  const handleResizeWidthChange = (val: number) => {
    if (!selectedPlacementId) return;
    const canvas = pdfCanvasRef.current;
    if (!canvas) return;

    setPlacements(placements.map(p => {
      if (p.id === selectedPlacementId) {
        const aspect = p.height / p.width;
        const newWidth = Math.max(50, Math.min(canvas.width * 0.8, val));
        const newHeight = newWidth * aspect;
        
        // Boundaries adjustments
        const limitX = 100 - (newWidth / canvas.width) * 100;
        const limitY = 100 - (newHeight / canvas.height) * 100;
        
        return {
          ...p,
          width: newWidth,
          height: newHeight,
          x: Math.min(p.x, limitX),
          y: Math.min(p.y, limitY)
        };
      }
      return p;
    }));
  };

  // Native pdf-lib compilation & save download flow
  const compileAndDownloadSignedPdf = async () => {
    if (!pdfBytes || !pdfFile) return;
    
    const fileName = pdfFile.name;
    setIsProcessing(true);
    setProgress(20);
    setStatusMessage('Loading PDF editor components...');
    
    try {
      const PDFLib = await loadPdfLib();
      setProgress(40);
      setStatusMessage('Parsing source PDF elements...');
      
      const doc = await PDFLib.PDFDocument.load(pdfBytes.slice(0));
      const pages = doc.getPages();
      
      setProgress(60);
      setStatusMessage('Injecting electronic signatures...');
      
      const canvasWidth = canvasSizeRef.current.width;
      const canvasHeight = canvasSizeRef.current.height;
      
      for (let i = 0; i < placements.length; i++) {
        const item = placements[i];
        const pageIdx = item.page - 1;
        if (pageIdx >= pages.length) continue;
        
        const page = pages[pageIdx];
        const pdfWidth = page.getWidth();
        const pdfHeight = page.getHeight();
        
        // Calculate coordinate ratios between render-canvas and native PDF space
        const scaleX = pdfWidth / canvasWidth;
        const scaleY = pdfHeight / canvasHeight;
        
        // Decode base64 image data synchronously instead of using fetch on data URIs
        const base64Data = item.imageSrc.split(',')[1] || item.imageSrc;
        const binaryString = atob(base64Data);
        const len = binaryString.length;
        const signatureBytes = new Uint8Array(len);
        for (let j = 0; j < len; j++) {
          signatureBytes[j] = binaryString.charCodeAt(j);
        }
        
        const signatureImage = await doc.embedPng(signatureBytes);
        
        // Position conversions (PDF coordinates start at bottom-left)
        const finalW = item.width * scaleX;
        const finalH = item.height * scaleY;
        const finalX = (item.x / 100) * canvasWidth * scaleX;
        const finalY = pdfHeight - ((item.y / 100) * canvasHeight * scaleY) - finalH;
        
        page.drawImage(signatureImage, {
          x: finalX,
          y: finalY,
          width: finalW,
          height: finalH
        });
      }
      
      setProgress(85);
      setStatusMessage('Generating signed binary array output...');
      
      const savedBytes = await doc.save();
      const signedBlob = new Blob([savedBytes], { type: 'application/pdf' });
      
      setProgress(100);
      setStatusMessage('Downloading signed PDF document...');
      
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(signedBlob);
      downloadLink.download = `${fileName.substring(0, fileName.lastIndexOf('.'))}_signed.pdf`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Failed to sign and export PDF: ' + (err?.message || String(err)));
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleReset = () => {
    setPdfFile(null);
    setPdfBytes(null);
    setNumPages(0);
    setCurrentPage(1);
    setPlacements([]);
    setSelectedPlacementId(null);
    setErrorMessage('');
    clearDrawing();
    setTypedName('');
    setUploadedImageSrc('');
  };

  const selectedPlacement = useMemo(() => {
    return placements.find(p => p.id === selectedPlacementId) || null;
  }, [placements, selectedPlacementId]);

  return (
    <div className="w-full">
      <SEO 
        title="Free PDF Signer - Sign PDF Documents Online Offline"
        description="Sign PDF documents locally in your browser. Draw, type, or upload your signature. 100% private and offline client-side signing."
        keywords="pdf signer, sign pdf, digital signature pdf, online pdf signature, electronic signature free, draw signature pdf, type signature on pdf, offline pdf sign, no upload pdf signer"
        canonicalUrl="https://imagegiri.com/sign-pdf"
      />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-indigo-650 uppercase tracking-widest px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-full shadow-sm">
            PDF Tool
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-3 mb-2">Electronic PDF Signer</h1>
          <p className="text-sm text-slate-500">Electronically sign PDFs offline in your browser. Draw, type, or upload custom signatures.</p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center justify-between">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage('')} className="text-red-900 font-bold hover:scale-105 transition">Clear</button>
          </div>
        )}

        {/* Loading overlay */}
        {isProcessing && (
          <div className="mb-6 premium-bento p-8 rounded-3xl bg-white flex flex-col items-center justify-center gap-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center animate-spin text-indigo-650">
              <RefreshCw className="w-6 h-6" />
            </div>
            <ProgressBar 
              progress={progress}
              label="PDF Signature Engine"
              subLabel={statusMessage}
            />
          </div>
        )}

        {/* Main Work Area */}
        {!pdfBytes && !isProcessing && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
            <div className="md:col-span-7 flex flex-col justify-center">
              <DropZone 
                onFilesSelected={handleFilesSelected}
                accept="application/pdf"
                title="Drop PDF here to sign"
                subtitle="Supports standard document PDFs up to 50MB"
                icon={FileText}
              />
            </div>
            <div className="md:col-span-5 flex">
              <div className="premium-bento rounded-3xl p-6 bg-white border border-slate-200/50 flex flex-col justify-between w-full shadow-sm hover:border-indigo-300 transition-all duration-300">
                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-indigo-650 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded uppercase tracking-wider inline-block">Security Check</div>
                  <h3 className="text-base font-extrabold text-slate-900">100% Local & Encrypted</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Most PDF signers upload your sensitive documents to remote servers. ImageGiri processes all PDF modifications on-device. Your signature and PDF pages never leave your computer.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1.5 w-fit mt-4">
                  <Lock className="w-4 h-4" />
                  No Upload Sandbox
                </div>
              </div>
            </div>
          </div>
        )}

        {pdfBytes && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Signature Creation Panel (Left Column) */}
            <div className="lg:col-span-4 space-y-6">
              
              <div className="glass-card p-5 rounded-3xl space-y-5">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <span className="w-1.5 h-3.5 bg-indigo-600 rounded-full" />
                    1. Create Signature
                  </h3>
                </div>

                {/* Mode Selectors */}
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-50 border border-slate-200/60 rounded-xl">
                  {(['draw', 'type', 'upload'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setSignatureMode(mode)}
                      className={`py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all capitalize flex items-center justify-center gap-1 cursor-pointer ${
                        signatureMode === mode 
                          ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' 
                          : 'text-slate-450 hover:text-slate-700'
                      }`}
                    >
                      {mode === 'draw' && <PenTool className="w-3.5 h-3.5" />}
                      {mode === 'type' && <Type className="w-3.5 h-3.5" />}
                      {mode === 'upload' && <Upload className="w-3.5 h-3.5" />}
                      {mode}
                    </button>
                  ))}
                </div>

                {/* Controls: Color swatch */}
                {signatureMode !== 'upload' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block">Stroke Color</label>
                    <div className="flex gap-2">
                      {['#000000', '#0f172a', '#1e3a8a', '#b91c1c'].map(col => (
                        <button
                          key={col}
                          onClick={() => setDrawColor(col)}
                          className={`w-6 h-6 rounded-full border transition cursor-pointer flex items-center justify-center ${
                            drawColor === col ? 'border-indigo-600 scale-110 shadow-sm' : 'border-slate-200'
                          }`}
                          style={{ backgroundColor: col }}
                        >
                          {drawColor === col && <Check className="w-3 h-3 text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* DRAW Mode Canvas */}
                {signatureMode === 'draw' && (
                  <div className="space-y-3">
                    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50 relative shadow-inner">
                      <canvas
                        ref={drawCanvasRef}
                        width={320}
                        height={160}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        onTouchCancel={stopDrawing}
                        className="w-full touch-none cursor-crosshair"
                      />
                      <button
                        onClick={clearDrawing}
                        className="absolute bottom-2.5 right-2.5 px-3 py-1.5 bg-white/90 hover:bg-white border border-slate-200 hover:border-slate-350 text-[10px] font-bold uppercase text-slate-655 hover:text-slate-800 rounded-lg shadow-sm transition cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}

                {/* TYPE Mode Input */}
                {signatureMode === 'type' && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block">Your Name</label>
                      <input
                        type="text"
                        placeholder="Type signature..."
                        value={typedName}
                        onChange={(e) => setTypedName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 focus:outline-indigo-600 focus:border-indigo-600 rounded-xl text-xs font-semibold"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block">Select Script Font</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'font-handwritten-1', name: 'Signature 1', style: { fontFamily: 'Cedarville Cursive' } },
                          { id: 'font-handwritten-2', name: 'Signature 2', style: { fontFamily: 'Great Vibes' } },
                          { id: 'font-handwritten-3', name: 'Signature 3', style: { fontFamily: 'Satisfy' } },
                          { id: 'font-handwritten-4', name: 'Signature 4', style: { fontFamily: 'Alex Brush' } }
                        ].map(font => (
                          <button
                            key={font.id}
                            onClick={() => setTypedFont(font.id)}
                            className={`p-3 rounded-xl border text-center transition cursor-pointer flex flex-col justify-center items-center shadow-xs ${
                              typedFont === font.id ? 'border-indigo-600 bg-indigo-50/20' : 'border-slate-200 bg-white hover:bg-slate-50'
                            }`}
                          >
                            <span className="text-[11px] font-bold text-slate-400 block mb-1">{font.name}</span>
                            <span className="text-base truncate max-w-full" style={{ ...font.style, color: drawColor }}>
                              {typedName || 'Signature'}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* UPLOAD Mode Dropzone */}
                {signatureMode === 'upload' && (
                  <div className="space-y-3">
                    <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-6 text-center cursor-pointer relative bg-slate-50/30 transition-all flex flex-col items-center justify-center">
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        onChange={handleSignatureUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <Upload className="w-7.5 h-7.5 text-slate-400 mb-2" />
                      <span className="text-xs font-bold text-slate-700 block">Choose Signature Image</span>
                      <span className="text-[10px] text-slate-450 mt-1 font-medium">Supports PNG, JPEG, or WebP formats</span>
                    </div>

                    {uploadedImageSrc && (
                      <div className="p-3 border border-slate-200 rounded-2xl flex items-center justify-center bg-slate-50/50">
                        <img src={uploadedImageSrc} alt="Uploaded signature" className="max-h-16 object-contain" />
                      </div>
                    )}
                  </div>
                )}

                {/* Place Trigger Button */}
                <button
                  onClick={placeSignatureOnDocument}
                  disabled={!activeSignature}
                  className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white shadow-md transition flex items-center justify-center gap-2 cursor-pointer ${
                    activeSignature 
                      ? 'bg-indigo-600 hover:bg-indigo-550 shadow-indigo-500/20 active:scale-98' 
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  <Plus className="w-4 h-4" /> Place Signature
                </button>

              </div>

              {/* Signature resizing controls (if active signature overlay is selected) */}
              {selectedPlacement && selectedPlacement.page === currentPage && (
                <div className="glass-card p-5 rounded-3xl space-y-4 animate-fade-in">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <span className="w-1.5 h-3.5 bg-indigo-650 rounded-full" />
                    2. Adjust Placed Signature
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-450">
                      <span>Width: {Math.round(selectedPlacement.width)}px</span>
                      <span>Resize Box</span>
                    </div>
                    <input
                      type="range"
                      min={50}
                      max={400}
                      value={selectedPlacement.width}
                      onChange={(e) => handleResizeWidthChange(Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-ew-resize h-1.5 bg-slate-200 rounded-lg appearance-none"
                    />
                  </div>
                  <button
                    onClick={() => removePlacement(selectedPlacement.id)}
                    className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 cursor-pointer border border-red-200/50"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove from Page
                  </button>
                </div>
              )}

            </div>

            {/* Document Workspace (Center/Right Column) */}
            <div className="lg:col-span-8 space-y-6">
              
              <div className="glass-card p-4 sm:p-6 rounded-3xl flex flex-col items-center">
                
                {/* Page Navigation header */}
                <div className="w-full flex items-center justify-between border-b border-slate-200/60 pb-4 mb-5">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-indigo-655 uppercase tracking-widest block">PDF document preview</span>
                    <h3 className="font-extrabold text-sm text-slate-900 truncate max-w-[200px] sm:max-w-xs">{pdfFile?.name}</h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 border border-slate-200/80 rounded-xl p-1 bg-slate-50">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          currentPage === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-white hover:shadow-xs'
                        }`}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-bold px-2 text-slate-750">
                        {currentPage} / {numPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}
                        disabled={currentPage === numPages}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          currentPage === numPages ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-white hover:shadow-xs'
                        }`}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* PDF Canvas Workspace Overlay wrapper */}
                <div 
                  ref={workspaceRef}
                  className="relative select-none border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm bg-slate-200/20 max-w-full flex items-center justify-center p-2.5"
                  onMouseMove={handleContainerMouseMove}
                  onMouseUp={handleContainerMouseUp}
                  onMouseLeave={handleContainerMouseUp}
                >
                  {/* Native PDF page canvas */}
                  <canvas 
                    ref={pdfCanvasRef} 
                    className="shadow-md rounded-lg max-w-full"
                  />

                  {/* Absolute Signature Placement Overlays */}
                  {placements
                    .filter(p => p.page === currentPage)
                    .map(placement => (
                      <div
                        key={placement.id}
                        onMouseDown={(e) => handlePlacementMouseDown(e, placement)}
                        className={`absolute cursor-move group select-none flex items-center justify-center p-1 rounded transition-all border ${
                          selectedPlacementId === placement.id
                            ? 'border-indigo-600 ring-2 ring-indigo-500/10 bg-indigo-500/5'
                            : 'border-dashed border-slate-400 bg-transparent hover:border-indigo-500 hover:bg-indigo-500/5'
                        }`}
                        style={{
                          left: `calc(${placement.x}% + 10px)`, // pad offset
                          top: `calc(${placement.y}% + 10px)`,
                          width: `${placement.width}px`,
                          height: `${placement.height}px`
                        }}
                      >
                        <img 
                          src={placement.imageSrc} 
                          alt="Signature signature" 
                          className="w-full h-full object-contain pointer-events-none"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removePlacement(placement.id);
                          }}
                          className="absolute -top-3.5 -right-3.5 w-6 h-6 rounded-full bg-red-50 hover:bg-red-150 border border-red-200 text-red-500 hover:text-red-700 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition duration-150 cursor-pointer"
                          title="Remove signature"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                </div>

                {/* Final Sign & reset options footer */}
                <div className="w-full flex flex-col sm:flex-row items-center justify-between border-t border-slate-200/60 pt-5 mt-6 gap-3">
                  <button
                    onClick={handleReset}
                    className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-655 hover:text-slate-800 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <RefreshCw className="w-4 h-4" /> Start Over
                  </button>

                  <button
                    onClick={compileAndDownloadSignedPdf}
                    disabled={placements.length === 0}
                    className={`w-full sm:w-auto px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
                      placements.length === 0
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                        : downloaded
                          ? 'bg-emerald-500 shadow-emerald-500/20'
                          : 'bg-gradient-to-r from-indigo-600 to-purple-650 hover:from-indigo-550 hover:to-purple-550 shadow-indigo-500/20'
                    }`}
                  >
                    {downloaded ? (
                      <><Check className="w-4 h-4 animate-check-pop" /> PDF Signed & Saved!</>
                    ) : (
                      <><Download className="w-4.5 h-4.5" /> Sign & Save PDF</>
                    )}
                  </button>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* User Guide and Alternatives Details */}
        <ToolGuide
          toolName="PDF Signer"
          introText="Create cryptographic and handwritten electronic signatures on your PDF documents client-side. Your files remain on your disk throughout the entire signing process."
          competitorComparison={{
            alternatives: ['DocuSign', 'Adobe Sign', 'HelloSign', 'SmallPDF'],
            benefit: 'Commercial PDF signing suites route your documents through cloud servers and cap monthly document exports on free tiers. ImageGiri PDF Signer embeds signatures entirely inside your local browser memory. It is 100% free, imposes no document count limits, and operates with zero cloud transmission.'
          }}
          steps={[
            {
              title: 'Upload Document',
              description: 'Select your PDF document by dropping it into the upload field or searching your folder directory.'
            },
            {
              title: 'Create Your Signature',
              description: 'Choose your signature type: draw with your pointer, type in cursives, or upload a pre-made graphic.'
            },
            {
              title: 'Position and Scale',
              description: 'Click "Place Signature", drag the overlay on the canvas page viewer, and adjust its width.'
            },
            {
              title: 'Sign & Export',
              description: 'Verify the overlays and click "Sign & Save PDF" to trigger the local binary export and save.'
            }
          ]}
          features={[
            'Client-side electronic signature placement using standard pdf-lib processing.',
            'Multiple signature creation templates: hand-drawing pad, typographic script cursives, and image uploads.',
            'Precision canvas viewport positioning with responsive coordinate mappings.',
            'Preserves original vector layouts, selectable text lines, and image details without rasterization.',
            'Runs 100% offline in client browser memory with zero cloud file storage.'
          ]}
          faq={[
            {
              q: 'Is my signed PDF legally valid?',
              a: 'Yes, client-side electronic signatures are recognized under major international frameworks like the ESIGN Act (US) and eIDAS (EU) for standard agreements, invoices, and consent sheets. For complex contracts requiring advanced cryptographic certificates, verified portals are recommended.'
            },
            {
              q: 'Does it flatten or rasterize my PDF pages?',
              a: 'No. Unlike basic editors that convert PDF pages into flat images (which removes text search capability and increases file size), our signer embeds the signature image natively as a new layer. Your text stays selectable and high quality.'
            },
            {
              q: 'Are my private documents sent to any servers?',
              a: 'Never. The file processing, signature mapping, and PDF compile are executed locally in the browser sandbox. No networks are used to process your documents.'
            }
          ]}
        />

      </div>
    </div>
  );
};
