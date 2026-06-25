import React, { useState, useEffect, useRef } from 'react';
import { Download, RefreshCw, Files, FileText, CheckCircle, Trash2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { DropZone } from '../components/DropZone';
import { SEO } from '../components/SEO';
import { ToolGuide } from '../components/ToolGuide';
import { ProgressBar } from '../components/ProgressBar';
import { DemoPreview } from '../components/DemoPreview';
import JSZip from 'jszip';
import { jsPDF } from 'jspdf';

interface BatchFile {
  id: string;
  file: File;
  status: 'pending' | 'processing' | 'completed' | 'error';
  originalSize: number;
  convertedSize: number | null;
  convertedUrl: string | null;
  convertedName: string | null;
}

export const BatchConverter: React.FC = () => {
  const [files, setFiles] = useState<BatchFile[]>([]);
  const [format, setFormat] = useState<string>('image/webp');
  const [quality, setQuality] = useState<number>(80);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isPackaging, setIsPackaging] = useState<boolean>(false);
  const [packageType, setPackageType] = useState<'zip' | 'pdf' | null>(null);
  const [pdfMergeMode, setPdfMergeMode] = useState<boolean>(true);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);

  const formatLabels: Record<string, string> = {
    'image/jpeg': 'JPEG',
    'image/png': 'PNG',
    'image/webp': 'WebP',
    'application/pdf': 'PDF',
  };

  const handleFilesSelected = (selectedFiles: File[]) => {
    const newFiles = selectedFiles.map((f) => ({
      id: Math.random().toString(36).substring(7),
      file: f,
      status: 'pending' as const,
      originalSize: f.size,
      convertedSize: null,
      convertedUrl: null,
      convertedName: null,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target && target.convertedUrl) {
        URL.revokeObjectURL(target.convertedUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const convertSingleFile = (batchFile: BatchFile): Promise<BatchFile> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          if (format === 'application/pdf') {
            try {
              const w = img.naturalWidth;
              const h = img.naturalHeight;
              const orientation = w > h ? 'l' : 'p';
              const pdf = new jsPDF({
                orientation,
                unit: 'px',
                format: [w, h]
              });
              pdf.addImage(img, 'JPEG', 0, 0, w, h);
              const blob = pdf.output('blob');
              const url = URL.createObjectURL(blob);
              const origName = batchFile.file.name.substring(0, batchFile.file.name.lastIndexOf('.'));
              const newName = `${origName}.pdf`;
              resolve({
                ...batchFile,
                status: 'completed',
                convertedSize: blob.size,
                convertedUrl: url,
                convertedName: newName,
              });
            } catch (err) {
              resolve({ ...batchFile, status: 'error' });
            }
            return;
          }

          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            resolve({ ...batchFile, status: 'error' });
            return;
          }

          ctx.drawImage(img, 0, 0);

          const ext = format.split('/')[1];
          const origName = batchFile.file.name.substring(0, batchFile.file.name.lastIndexOf('.'));
          const newName = `${origName}.${ext}`;

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                resolve({
                  ...batchFile,
                  status: 'completed',
                  convertedSize: blob.size,
                  convertedUrl: url,
                  convertedName: newName,
                });
              } else {
                resolve({ ...batchFile, status: 'error' });
              }
            },
            format,
            format === 'image/png' ? undefined : quality / 100
          );
        };
        img.onerror = () => resolve({ ...batchFile, status: 'error' });
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve({ ...batchFile, status: 'error' });
      reader.readAsDataURL(batchFile.file);
    });
  };

  const handleConvertAll = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setProgress(5);
    setStatusMessage('Starting conversion pipeline...');

    // Clear old converted urls
    files.forEach((f) => {
      if (f.convertedUrl) URL.revokeObjectURL(f.convertedUrl);
    });
    if (mergedPdfUrl) {
      URL.revokeObjectURL(mergedPdfUrl);
      setMergedPdfUrl(null);
    }

    const updatedFiles = [...files];
    const total = files.length;

    if (format === 'application/pdf' && pdfMergeMode) {
      // Merge into a single PDF
      setStatusMessage('Loading images for PDF...');
      const loadImg = (file: File): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = e.target?.result as string;
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      };

      try {
        let pdf: jsPDF | null = null;
        for (let i = 0; i < total; i++) {
          const batchFile = updatedFiles[i];
          updatedFiles[i] = { ...batchFile, status: 'processing' };
          setFiles([...updatedFiles]);
          setStatusMessage(`Adding page ${i + 1} of ${total}: ${batchFile.file.name}`);

          const img = await loadImg(batchFile.file);
          const w = img.naturalWidth;
          const h = img.naturalHeight;
          const orientation = w > h ? 'l' : 'p';

          if (i === 0) {
            pdf = new jsPDF({
              orientation,
              unit: 'px',
              format: [w, h]
            });
          } else if (pdf) {
            pdf.addPage([w, h], orientation);
          }

          if (pdf) {
            pdf.addImage(img, 'JPEG', 0, 0, w, h);
          }

          updatedFiles[i] = {
            ...batchFile,
            status: 'completed',
            convertedSize: batchFile.file.size,
            convertedUrl: null,
            convertedName: null,
          };
          setFiles([...updatedFiles]);
          setProgress(Math.round(5 + ((i + 1) / total) * 80));
        }

        if (pdf) {
          setStatusMessage('Generating combined PDF document...');
          setProgress(90);
          const pdfBlob = pdf.output('blob');
          const pdfUrl = URL.createObjectURL(pdfBlob);

          setMergedPdfUrl(pdfUrl);

          // Download immediately
          const link = document.createElement('a');
          link.href = pdfUrl;
          link.download = `combined_document_${Date.now()}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          setStatusMessage('Combined PDF generated and downloaded successfully.');
          setProgress(100);
        }
      } catch (e) {
        console.error(e);
        setStatusMessage('Error compiling combined PDF.');
        updatedFiles.forEach(f => {
          if (f.status === 'processing') f.status = 'error';
        });
        setFiles([...updatedFiles]);
      }
      setIsProcessing(false);
      return;
    }

    for (let i = 0; i < total; i++) {
      const batchFile = updatedFiles[i];
      updatedFiles[i] = { ...batchFile, status: 'processing' };
      setFiles([...updatedFiles]);
      setStatusMessage(`Converting image ${i + 1} of ${total}: ${batchFile.file.name}`);

      const result = await convertSingleFile(batchFile);
      updatedFiles[i] = result;
      setFiles([...updatedFiles]);
      setProgress(Math.round(5 + ((i + 1) / total) * 95));
    }

    setIsProcessing(false);
    setProgress(100);
    setStatusMessage('Conversion completed successfully.');
  };

  const handleDownloadZip = async () => {
    const completedFiles = files.filter((f) => f.status === 'completed' && f.convertedUrl && f.convertedName);
    if (completedFiles.length === 0) return;

    setIsPackaging(true);
    setPackageType('zip');
    setProgress(10);
    setStatusMessage('Bundling files into ZIP archive...');

    const zip = new JSZip();
    const fetchPromises = completedFiles.map(async (f, idx) => {
      const res = await fetch(f.convertedUrl!);
      const blob = await res.blob();
      zip.file(f.convertedName!, blob);
      setProgress(Math.round(10 + ((idx + 1) / completedFiles.length) * 60));
    });

    await Promise.all(fetchPromises);

    setStatusMessage('Generating ZIP package...');
    setProgress(80);
    const content = await zip.generateAsync({ type: 'blob' });
    
    setProgress(95);
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `converted_images_${Date.now()}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setIsPackaging(false);
    setPackageType(null);
    setProgress(100);
    setStatusMessage('ZIP downloaded successfully.');
  };

  const handleDownloadPDF = async () => {
    const completedFiles = files.filter((f) => f.status === 'completed' && f.convertedUrl);
    if (completedFiles.length === 0) return;

    setIsPackaging(true);
    setPackageType('pdf');
    setProgress(10);
    setStatusMessage('Packaging images into PDF page list...');

    // Load images and build PDF
    const loadImg = (url: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject();
        img.src = url;
      });
    };

    try {
      let pdf: jsPDF | null = null;

      for (let i = 0; i < completedFiles.length; i++) {
        const f = completedFiles[i];
        setStatusMessage(`Adding page ${i + 1} of ${completedFiles.length}...`);
        const img = await loadImg(f.convertedUrl!);
        
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const orientation = w > h ? 'l' : 'p';

        if (i === 0) {
          // Initialize PDF with first page dimensions to avoid empty pages
          pdf = new jsPDF({
            orientation,
            unit: 'px',
            format: [w, h]
          });
        } else if (pdf) {
          pdf.addPage([w, h], orientation);
        }

        if (pdf) {
          pdf.addImage(img, 'JPEG', 0, 0, w, h);
        }
        
        setProgress(Math.round(10 + ((i + 1) / completedFiles.length) * 80));
      }

      if (pdf) {
        setStatusMessage('Compressing and exporting PDF document...');
        setProgress(95);
        pdf.save(`image_package_${Date.now()}.pdf`);
      }
    } catch (e) {
      console.error(e);
      setStatusMessage('Error compiling PDF file.');
    }

    setIsPackaging(false);
    setPackageType(null);
    setProgress(100);
    setStatusMessage('PDF package downloaded successfully.');
  };

  const handleReset = () => {
    files.forEach((f) => {
      if (f.convertedUrl) URL.revokeObjectURL(f.convertedUrl);
    });
    if (mergedPdfUrl) {
      URL.revokeObjectURL(mergedPdfUrl);
      setMergedPdfUrl(null);
    }
    setFiles([]);
    setProgress(0);
    setIsProcessing(false);
    setIsPackaging(false);
    setPackageType(null);
  };

  const moveFile = (index: number, direction: 1 | -1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= files.length) return;

    setFiles((prev) => {
      const list = [...prev];
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;
      return list;
    });
  };

  const filesRef = useRef<BatchFile[]>(files);
  filesRef.current = files;

  const mergedPdfUrlRef = useRef<string | null>(mergedPdfUrl);
  mergedPdfUrlRef.current = mergedPdfUrl;

  useEffect(() => {
    return () => {
      filesRef.current.forEach((f: BatchFile) => {
        if (f.convertedUrl) URL.revokeObjectURL(f.convertedUrl);
      });
      if (mergedPdfUrlRef.current) {
        URL.revokeObjectURL(mergedPdfUrlRef.current);
      }
    };
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const hasCompleted = files.some((f) => f.status === 'completed');

  const batchSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Batch Image Converter - ImageGiri',
    'applicationCategory': 'MultimediaApplication',
    'operatingSystem': 'Web Browser',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    },
    'description': 'Convert multiple images to WebP, PNG, JPEG, or PDF format in bulk. Compile multiple photos into a single PDF document. All processing happens locally in your browser.',
    'featureList': [
      'Bulk conversion of multiple files',
      'Export formatted files as single ZIP package',
      'Compile multiple photos into a single PDF document with page reordering',
      'Support JPEG, PNG, WebP, and PDF formats'
    ]
  };

  return (
    <div className="w-full">
      <SEO 
        title="Free Batch Image to PDF & Format Converter | ImageGiri" 
        description="Convert JPG, PNG, and WebP images to PDF or other formats in bulk locally. Merge multiple images into a single PDF document with page reordering, completely offline." 
        keywords="batch image converter, images to pdf, convert jpg to pdf, convert png to pdf, merge images to pdf, combine photos to pdf, bulk image to pdf, free offline image to pdf converter, multiple images to one pdf, webp to pdf, convert images in bulk, batch photo converter, reorder pdf pages, image format converter, CloudConvert alternative, EZGIF alternative"
        canonicalUrl="https://imagegiri.com/batch-converter"
        schema={batchSchema}
      />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-indigo-650 uppercase tracking-widest px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-full shadow-sm">
            Batch Utility
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-3 mb-2">Batch Image Converter</h1>
          <p className="text-sm text-slate-500">Convert image directories in bulk or package photos into multi-page PDFs locally in RAM.</p>
        </div>

        {files.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
            <div className="md:col-span-7 flex flex-col justify-center">
              <DropZone 
                onFilesSelected={handleFilesSelected}
                multiple={true}
                title="Select or drop images to convert"
                subtitle="Upload files in bulk. JPEG, PNG, WebP supported."
              />
            </div>
            <div className="md:col-span-5 flex">
              <div className="premium-bento rounded-3xl p-6 bg-white border border-slate-200/50 flex flex-col justify-between w-full shadow-sm hover:border-indigo-300 transition-all duration-300">
                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-indigo-650 bg-indigo-50/50 border border-indigo-100/60 px-2 py-0.5 rounded uppercase tracking-wider inline-block">Demo Preview</div>
                  <h3 className="text-base font-extrabold text-slate-900">How Batch Converter Works</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Drop multiple images, choose output format and quality, then package everything into a ZIP archive or multi-page PDF — all processed locally in your browser.
                  </p>
                </div>
                <DemoPreview
                  toolId="converter"
                  alt="Batch Converter Demo"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Controls column */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="premium-bento p-6 rounded-3xl bg-white space-y-6 shadow-sm">
                <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Files className="w-4.5 h-4.5 text-indigo-500" />
                  Conversion Preset
                </h3>

                {/* Target Format */}
                <div className="space-y-2.5">
                  <label className="text-[10px] font-bold text-slate-455 uppercase tracking-widest block">
                    Output Format
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {['image/webp', 'image/jpeg', 'image/png', 'application/pdf'].map((f) => (
                      <button
                        key={f}
                        onClick={() => setFormat(f)}
                        disabled={isProcessing || isPackaging}
                        className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer disabled:opacity-50 text-center ${
                          format === f
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                            : 'bg-white/80 border-slate-200/70 text-slate-655 hover:text-slate-900 hover:bg-slate-50/50'
                        }`}
                      >
                        {formatLabels[f]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quality Slider (JPEG/WebP only) */}
                {format !== 'image/png' && format !== 'application/pdf' && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-slate-455 uppercase tracking-widest">
                        Compression Quality
                      </label>
                      <span className="text-[10px] font-bold text-indigo-650 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded shadow-xs">
                        {quality}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={quality}
                      disabled={isProcessing || isPackaging}
                      onChange={(e) => setQuality(Number(e.target.value))}
                      className="range-styled w-full"
                    />
                  </div>
                )}

                {/* PDF Export Options */}
                {format === 'application/pdf' && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-455 uppercase tracking-widest block">
                      PDF Export Option
                    </label>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 text-xs text-slate-655 font-semibold cursor-pointer">
                        <input
                          type="radio"
                          name="pdfMergeMode"
                          checked={pdfMergeMode}
                          onChange={() => setPdfMergeMode(true)}
                          disabled={isProcessing || isPackaging}
                          className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-550"
                        />
                        <span>Merge into single PDF ({files.length} {files.length === 1 ? 'page' : 'pages'})</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs text-slate-655 font-semibold cursor-pointer">
                        <input
                          type="radio"
                          name="pdfMergeMode"
                          checked={!pdfMergeMode}
                          onChange={() => setPdfMergeMode(false)}
                          disabled={isProcessing || isPackaging}
                          className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-550"
                        />
                        <span>Separate PDF for each image</span>
                      </label>
                    </div>
                    {pdfMergeMode && files.length > 1 && (
                      <p className="text-[10px] text-indigo-600 font-medium italic">
                        Tip: You can reorder pages by clicking the arrow buttons next to the images in the queue.
                      </p>
                    )}
                  </div>
                )}

                {/* Info Card */}
                <div className="bg-slate-50/40 border border-slate-200/60 rounded-2xl p-4.5 space-y-3.5 shadow-xs">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-455">Total Images:</span>
                    <span className="font-bold text-slate-805">{files.length} Files</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-455">Batch Action:</span>
                    <span className="text-indigo-655 font-bold">
                      {format === 'application/pdf'
                        ? pdfMergeMode
                          ? 'Combine to Single PDF'
                          : 'Convert to separate PDFs'
                        : `Convert to ${formatLabels[format]}`}
                    </span>
                  </div>
                </div>

                {/* CTA Action list */}
                <div className="flex flex-col gap-2.5 pt-2">
                  <button
                    onClick={handleConvertAll}
                    disabled={isProcessing || isPackaging || files.length === 0}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-550 disabled:opacity-50 text-[11px] font-bold uppercase tracking-wider text-white rounded-xl shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                    {format === 'application/pdf'
                      ? pdfMergeMode
                        ? 'Compile Combined PDF'
                        : 'Convert Batch to PDFs'
                      : 'Convert Batch'}
                  </button>

                  {hasCompleted && (
                    <>
                      <div className="border-t border-slate-100 my-2 pt-2">
                        <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mb-2 text-center">
                          Batch Downloads
                        </label>
                        {format === 'application/pdf' && pdfMergeMode ? (
                          <button
                            onClick={() => {
                              if (mergedPdfUrl) {
                                const link = document.createElement('a');
                                link.href = mergedPdfUrl;
                                link.download = `combined_document_${Date.now()}.pdf`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }
                            }}
                            className="w-full py-2.5 px-2 bg-gradient-to-r from-indigo-600 to-purple-650 hover:from-indigo-550 hover:to-purple-550 text-[10px] font-bold uppercase tracking-wider text-white rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download Combined PDF
                          </button>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={handleDownloadZip}
                              disabled={isProcessing || isPackaging}
                              className="py-2.5 px-2 bg-gradient-to-r from-indigo-600 to-purple-650 hover:from-indigo-550 hover:to-purple-550 text-[10px] font-bold uppercase tracking-wider text-white rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <Download className="w-3.5 h-3.5" />
                              ZIP package
                            </button>

                            <button
                              onClick={handleDownloadPDF}
                              disabled={isProcessing || isPackaging}
                              className="py-2.5 px-2 bg-white/80 hover:bg-slate-50/50 border border-slate-200/60 hover:border-slate-350 text-[10px] font-bold uppercase tracking-wider text-slate-655 hover:text-slate-900 rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <FileText className="w-3.5 h-3.5 text-indigo-500" />
                              PDF Document
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  <button
                    onClick={handleReset}
                    disabled={isProcessing || isPackaging}
                    className="w-full py-3 bg-white/80 hover:bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-655 hover:text-slate-900 border border-slate-200/60 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    Clear All
                  </button>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-505 bg-slate-50/30 p-2.5 rounded-xl border border-slate-200/60 shadow-xs font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Your photos convert 100% locally in browser.
                </div>
              </div>
            </div>

            {/* Right List Column */}
            <div className="lg:col-span-8 space-y-4 w-full">
              {/* Progress Panel */}
              {(isProcessing || isPackaging) && (
                <div className="premium-bento p-5 rounded-3xl bg-white border border-slate-200/50 shadow-sm">
                  <ProgressBar 
                    progress={progress} 
                    label={isProcessing ? 'Converting Images...' : `Compiling ${packageType?.toUpperCase()} package...`} 
                    subLabel={statusMessage} 
                  />
                </div>
              )}

              {/* Title bar */}
              <div className="flex justify-between items-center bg-white border border-slate-200/50 rounded-2xl px-4 py-3 shadow-xs">
                <span className="text-xs font-bold text-slate-800">
                  Batch Images Queue ({files.length})
                </span>
                <label className="text-[10px] text-indigo-650 hover:text-indigo-755 font-bold flex items-center gap-1 cursor-pointer">
                  <span>+ Add More Images</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    disabled={isProcessing || isPackaging}
                    onChange={(e) => {
                      if (e.target.files) handleFilesSelected(Array.from(e.target.files));
                    }}
                  />
                </label>
              </div>

              {/* File List cards */}
              <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
                {files.map((f, index) => (
                  <div 
                    key={f.id}
                    className="premium-bento p-3.5 rounded-2xl bg-white border border-slate-200/40 flex items-center justify-between gap-4 hover:border-slate-300 transition-all shadow-xs"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 bg-white/80 border border-slate-150 rounded-xl flex items-center justify-center shrink-0 text-slate-400">
                        <Files className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-850 truncate max-w-[180px] md:max-w-[280px]" title={f.file.name}>
                          {f.file.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-450 font-medium">
                          <span>Original: {formatSize(f.originalSize)}</span>
                          {f.convertedSize && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="text-indigo-600 font-bold">Converted: {formatSize(f.convertedSize)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Reordering Buttons */}
                      {!isProcessing && !isPackaging && files.length > 1 && (
                        <div className="flex items-center gap-0.5 shrink-0 bg-slate-50/40 border border-slate-200/60 rounded-lg p-0.5 shadow-xs">
                          <button
                            onClick={() => moveFile(index, -1)}
                            disabled={index === 0}
                            className="p-1 hover:bg-slate-200/80 rounded text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
                            title="Move Page Up"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                            </svg>
                          </button>
                          <button
                            onClick={() => moveFile(index, 1)}
                            disabled={index === files.length - 1}
                            className="p-1 hover:bg-slate-200/80 rounded text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
                            title="Move Page Down"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                          </button>
                        </div>
                      )}

                      {f.status === 'pending' && (
                        <span className="text-[10px] font-bold text-slate-400 bg-white/80 border border-slate-200/80 px-2 py-0.5 rounded">
                          Pending
                        </span>
                      )}
                      {f.status === 'processing' && (
                        <span className="text-[10px] font-bold text-indigo-650 bg-indigo-50 border border-indigo-150 animate-pulse px-2 py-0.5 rounded">
                          Processing...
                        </span>
                      )}
                      {f.status === 'completed' && (
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold text-emerald-650 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-600" /> Finished
                          </span>
                          {f.convertedUrl && (
                            <a
                              href={f.convertedUrl}
                              download={f.convertedName!}
                              className="p-1.5 bg-white/80 hover:bg-slate-50/50 border border-slate-200 rounded-lg text-slate-550 hover:text-slate-900 transition-colors shadow-xs"
                              title="Download single file"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      )}
                      {f.status === 'error' && (
                        <span className="text-[10px] font-bold text-red-655 bg-red-50 border border-red-100 px-2 py-0.5 rounded flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-red-600" /> Error
                        </span>
                      )}

                      <button
                        onClick={() => removeFile(f.id)}
                        disabled={isProcessing || isPackaging}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-650 transition cursor-pointer disabled:opacity-50"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
        <ToolGuide
          toolName="Batch Image to PDF & Format Converter"
          introText="Convert multiple images to PDF, WebP, PNG, or JPEG formats in bulk. Drag-and-drop your files and compile them into a single, beautifully ordered PDF booklet or convert each into individual PDFs entirely offline."
          competitorComparison={{
            alternatives: ['CloudConvert', 'Zamzar', 'ILovePDF', 'Adobe JPG to PDF Converter'],
            benefit: 'Unlike traditional online PDF compilers and converters that upload your private photos to external servers, ImageGiri executes all conversions directly inside your browser memory. This guarantees 100% data privacy, zero file size limits, and instant local compilation.'
          }}
          steps={[
            {
              title: 'Upload Your Images',
              description: 'Select or drop single or multiple files (JPG, PNG, WebP) to load them into the secure local batch list.'
            },
            {
              title: 'Choose PDF or Format Options',
              description: 'Select PDF, WebP, JPEG, or PNG. For PDF exports, choose between merging all images into a single combined document or converting each file into a separate PDF.'
            },
            {
              title: 'Reorder Pages & Process',
              description: 'If compiling a single PDF, use the Up/Down arrow buttons next to the images in the queue to arrange your page order. Click "Compile Combined PDF" to download it immediately.'
            }
          ]}
          features={[
            'Generate a single combined PDF from multiple photos with custom page order control.',
            'Convert images in bulk to individual PDFs or popular web image formats (WebP, PNG, JPEG).',
            'Full support for mixed-format source lists (convert JPEGs and PNGs in the same batch).',
            'Reorder images in the processing queue to establish the perfect sequence of PDF pages.',
            'Superfast client-side compilation leveraging high-performance browser rendering APIs.'
          ]}
          faq={[
            {
              q: 'How does merging multiple images into a single PDF work?',
              a: 'When you select PDF as the output format and check "Merge into single PDF", the tool reads the dimensions of each image and creates a custom-fit multi-page PDF document. You can adjust the order of pages using the sorting buttons in the queue before compiling.'
            },
            {
              q: 'Is there a limit on how many images I can convert to PDF at once?',
              a: 'There is no preset software limitation on the file count or size. The compiler operates entirely in your system RAM, meaning you can process as many images as your computer’s browser can handle.'
            },
            {
              q: 'Are my images secure when converting to PDF?',
              a: 'Yes, absolutely. ImageGiri compiles and converts all files locally using JavaScript (jsPDF and HTML5 Canvas). No files are uploaded, stored, or processed on any backend server, keeping your private documents completely secure.'
            }
          ]}
        />

      </div>
    </div>
  );
};
