import React, { useState, useEffect, useRef } from 'react';
import Tesseract from 'tesseract.js';
import { FileText, Copy, Download, RefreshCw, Check, Globe, ShieldAlert } from 'lucide-react';
import { DropZone } from '../components/DropZone';
import { ProgressBar } from '../components/ProgressBar';
import { SEO } from '../components/SEO';
import { ToolGuide } from '../components/ToolGuide';
import { DemoPreview } from '../components/DemoPreview';

interface LangOption {
  code: string;
  name: string;
}

const mapScriptToLanguage = (script: string): { code: string; name: string } => {
  switch (script) {
    case 'Devanagari':
      return { code: 'hin+eng', name: 'Hindi + English' };
    case 'Latin':
      return { code: 'eng', name: 'English' };
    case 'Han':
      return { code: 'chi_sim+eng', name: 'Chinese + English' };
    case 'Japanese':
      return { code: 'jpn+eng', name: 'Japanese + English' };
    case 'Korean':
      return { code: 'kor+eng', name: 'Korean + English' };
    case 'Cyrillic':
      return { code: 'rus+eng', name: 'Russian + English' };
    case 'Arabic':
      return { code: 'ara+eng', name: 'Arabic + English' };
    case 'Kannada':
      return { code: 'kan+eng', name: 'Kannada + English' };
    case 'Tamil':
      return { code: 'tam+eng', name: 'Tamil + English' };
    case 'Telugu':
      return { code: 'tel+eng', name: 'Telugu + English' };
    case 'Bengali':
      return { code: 'ben+eng', name: 'Bengali + English' };
    case 'Gujarati':
      return { code: 'guj+eng', name: 'Gujarati + English' };
    case 'Malayalam':
      return { code: 'mal+eng', name: 'Malayalam + English' };
    case 'Gurmukhi':
      return { code: 'pan+eng', name: 'Punjabi + English' };
    case 'Thai':
      return { code: 'tha+eng', name: 'Thai + English' };
    case 'Hebrew':
      return { code: 'heb+eng', name: 'Hebrew + English' };
    case 'Greek':
      return { code: 'ell+eng', name: 'Greek + English' };
    default:
      return { code: 'eng', name: 'English' };
  }
};

const mapScriptToLanguageSingle = (script: string): { code: string; name: string } | null => {
  switch (script) {
    case 'Devanagari':
      return { code: 'hin', name: 'Hindi' };
    case 'Latin':
      return { code: 'eng', name: 'English' };
    case 'Han':
      return { code: 'chi_sim', name: 'Chinese Simplified' };
    case 'Japanese':
      return { code: 'jpn', name: 'Japanese' };
    case 'Korean':
      return { code: 'kor', name: 'Korean' };
    case 'Cyrillic':
      return { code: 'rus', name: 'Russian' };
    case 'Arabic':
      return { code: 'ara', name: 'Arabic' };
    case 'Kannada':
      return { code: 'kan', name: 'Kannada' };
    case 'Tamil':
      return { code: 'tam', name: 'Tamil' };
    case 'Telugu':
      return { code: 'tel', name: 'Telugu' };
    case 'Bengali':
      return { code: 'ben', name: 'Bengali' };
    case 'Gujarati':
      return { code: 'guj', name: 'Gujarati' };
    case 'Malayalam':
      return { code: 'mal', name: 'Malayalam' };
    case 'Gurmukhi':
      return { code: 'pan', name: 'Punjabi' };
    case 'Thai':
      return { code: 'tha', name: 'Thai' };
    case 'Hebrew':
      return { code: 'heb', name: 'Hebrew' };
    case 'Greek':
      return { code: 'ell', name: 'Greek' };
    default:
      return null;
  }
};

const sliceImage = (file: File, numSlices: number = 3): Promise<Blob[]> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      if (img.height < numSlices * 20 || img.width < 20) {
        URL.revokeObjectURL(img.src);
        resolve([]);
        return;
      }

      const slices: Blob[] = [];
      const sliceHeight = Math.floor(img.height / numSlices);
      let completed = 0;

      for (let i = 0; i < numSlices; i++) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          completed++;
          if (completed === numSlices) {
            URL.revokeObjectURL(img.src);
            resolve(slices.filter(Boolean));
          }
          continue;
        }

        canvas.width = img.width;
        canvas.height = sliceHeight;

        ctx.drawImage(
          img,
          0, i * sliceHeight, img.width, sliceHeight, // src coordinates
          0, 0, img.width, sliceHeight // dest coordinates
        );
        
        canvas.toBlob((blob) => {
          if (blob) {
            slices[i] = blob;
          }
          completed++;
          if (completed === numSlices) {
            URL.revokeObjectURL(img.src);
            resolve(slices.filter(Boolean));
          }
        }, 'image/jpeg', 0.95);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      resolve([]);
    };
    img.src = URL.createObjectURL(file);
  });
};

export const OcrExtractor: React.FC = () => {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [ocrText, setOcrText] = useState<string>('');
  const [language, setLanguage] = useState<string>('auto');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [detectedLangInfo, setDetectedLangInfo] = useState<{ script: string; confidence: number; langName: string } | null>(null);

  const languages: LangOption[] = [
    { code: 'auto', name: 'Auto-Detect Language' },
    { code: 'eng', name: 'English' },
    { code: 'hin', name: 'Hindi (हिन्दी)' },
    { code: 'eng+hin', name: 'English + Hindi (Mixed)' },
    { code: 'kan', name: 'Kannada (ಕನ್ನಡ)' },
    { code: 'tam', name: 'Tamil (தமிழ்)' },
    { code: 'tel', name: 'Telugu (తెలుగు)' },
    { code: 'ben', name: 'Bengali (বাংলা)' },
    { code: 'guj', name: 'Gujarati (ગુજરાતી)' },
    { code: 'mal', name: 'Malayalam (മലയാളം)' },
    { code: 'pan', name: 'Punjabi (ਪੰਜਾਬੀ)' },
    { code: 'spa', name: 'Spanish (Español)' },
    { code: 'fra', name: 'French (Français)' },
    { code: 'deu', name: 'German (Deutsch)' },
    { code: 'chi_sim', name: 'Chinese Simplified (简体中文)' },
    { code: 'chi_tra', name: 'Chinese Traditional (繁體中文)' },
    { code: 'jpn', name: 'Japanese (日本語)' },
    { code: 'kor', name: 'Korean (한국어)' },
    { code: 'rus', name: 'Russian (Русский)' },
    { code: 'ara', name: 'Arabic (العربية)' },
    { code: 'heb', name: 'Hebrew (עברית)' },
    { code: 'ell', name: 'Greek (Ελληνικά)' },
    { code: 'tha', name: 'Thai (ไทย)' },
  ];

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setOriginalFile(file);
      setOriginalUrl(URL.createObjectURL(file));
      performOcr(file, language);
    }
  };

  const performOcr = (file: File, langCode: string) => {
    setIsProcessing(true);
    setProgress(0);
    setDetectedLangInfo(null);

    if (langCode === 'auto') {
      setStatusMessage('Analyzing document script (Auto-Detect)...');
      
      sliceImage(file, 3)
        .then(async (slices) => {
          // Perform detection on full image + slices
          const detectionPromises = [
            Tesseract.detect(file).catch(() => null),
            ...slices.map(slice => Tesseract.detect(slice).catch(() => null))
          ];
          
          const results = await Promise.all(detectionPromises);
          const scriptMap: { [scriptName: string]: number } = {};
          
          results.forEach((res) => {
            if (res && res.data) {
              const script = res.data.script;
              const confidence = res.data.script_confidence || 0;
              if (script) {
                scriptMap[script] = Math.max(scriptMap[script] || 0, confidence);
              }
            }
          });
          
          // Filter to keep scripts that are either the highest confidence or have confidence >= 4
          const scripts = Object.entries(scriptMap)
            .filter(([_, conf]) => {
              const isHighest = Object.values(scriptMap).every(v => conf >= v);
              return isHighest || conf >= 4;
            })
            .sort((a, b) => b[1] - a[1]);
            
          if (scripts.length === 0) {
            setStatusMessage('No scripts detected. Running OCR in English...');
            runTesseractRecognize(file, 'eng');
            return;
          }
          
          const detectedScripts: string[] = [];
          const langCodes: string[] = [];
          const displayNames: string[] = [];
          
          scripts.forEach(([scriptName, confidence]) => {
            const mapped = mapScriptToLanguageSingle(scriptName);
            if (mapped && !langCodes.includes(mapped.code)) {
              detectedScripts.push(`${scriptName} (${Math.round(confidence)}%)`);
              langCodes.push(mapped.code);
              displayNames.push(mapped.name);
            }
          });
          
          // Always support English fallback/alphanumerics in mixed mode
          if (!langCodes.includes('eng')) {
            langCodes.push('eng');
            displayNames.push('English');
          }
          
          const combinedCode = langCodes.join('+');
          const combinedName = displayNames.join(' + ');
          
          setDetectedLangInfo({
            script: detectedScripts.join(', '),
            confidence: Math.round(scripts[0][1]),
            langName: combinedName
          });
          
          setStatusMessage(`Detected scripts: ${detectedScripts.join(', ')}. Starting ${combinedName} OCR...`);
          runTesseractRecognize(file, combinedCode);
        })
        .catch((err) => {
          console.error('Slicing or parallel detection failed, fallback to full image:', err);
          Tesseract.detect(file)
            .then((result: Tesseract.DetectResult) => {
              const script = result.data.script || 'Latin';
              const confidence = result.data.script_confidence || 0;
              const mapped = mapScriptToLanguage(script);
              
              setDetectedLangInfo({
                script,
                confidence: Math.round(confidence),
                langName: mapped.name
              });
              
              setStatusMessage(`Detected ${script} script. Starting ${mapped.name} OCR...`);
              runTesseractRecognize(file, mapped.code);
            })
            .catch((innerErr: unknown) => {
              console.error(innerErr);
              setStatusMessage('Auto-detect failed. Falling back to English...');
              runTesseractRecognize(file, 'eng');
            });
        });
    } else {
      runTesseractRecognize(file, langCode);
    }
  };

  const runTesseractRecognize = (file: File, langCode: string) => {
    Tesseract.recognize(
      file,
      langCode,
      {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            const percent = Math.round(m.progress * 100);
            setProgress(percent);
            setStatusMessage(`Extracting words: ${percent}%`);
          } else {
            const cleanedStatus = m.status.replace(/_/g, ' ');
            setStatusMessage(`${cleanedStatus.charAt(0).toUpperCase() + cleanedStatus.slice(1)}...`);
            setProgress(Math.round(m.progress * 50));
          }
        },
      }
    )
      .then(({ data: { text } }) => {
        setOcrText(text || 'No text could be extracted from this image.');
        setIsProcessing(false);
        setProgress(100);
      })
      .catch((err) => {
        console.error(err);
        setOcrText('Error running OCR engine. Please verify the image formatting.');
        setIsProcessing(false);
      });
  };

  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    if (originalFile) {
      performOcr(originalFile, newLang);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(ocrText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadText = () => {
    if (!ocrText || !originalFile) return;
    const blob = new Blob([ocrText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${originalFile.name.substring(0, originalFile.name.lastIndexOf('.'))}_extracted.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    setOriginalFile(null);
    setOriginalUrl('');
    setOcrText('');
    setProgress(0);
    setIsProcessing(false);
  };

  const originalUrlRef = useRef<string>(originalUrl);
  originalUrlRef.current = originalUrl;

  useEffect(() => {
    return () => {
      if (originalUrlRef.current) URL.revokeObjectURL(originalUrlRef.current);
    };
  }, []);

  const ocrSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'OCR Text Extractor - ImageGiri',
    'applicationCategory': 'MultimediaApplication',
    'operatingSystem': 'Web Browser',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    },
    'description': 'Extract text from images, screenshots, PDFs, and documents directly in your browser. Free OCR tool supporting English, Spanish, French, German, Chinese, Hindi, Arabic, and 50+ languages.',
    'featureList': [
      'Multi-language optical character recognition',
      'Local OCR engine running via Tesseract.js',
      'One-click text copy to clipboard',
      'On-device image-to-text conversion'
    ]
  };

  return (
    <div className="w-full">
      <SEO 
        title="Free OCR Text Extractor - Online OCR Alternative" 
        description="Extract text from images, screenshots, and scanned documents locally in your browser. A private alternative to OnlineOCR, Adobe Acrobat, and cloud text scanners." 
        keywords="OCR, image to text, extract text from image, scan text, optical character recognition, text extractor, screenshot to text, photo to text, document scanner, free OCR tool, online OCR, multi-language OCR, Tesseract OCR, offline OCR, browser OCR, PDF text extractor, OnlineOCR alternative, FreeOCR alternative, Adobe Acrobat OCR alternative, scan text offline"
        canonicalUrl="https://imagegiri.com/ocr-text-extractor"
        schema={ocrSchema}
      />

      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-emerald-650 uppercase tracking-widest px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-full shadow-sm">
            Utility Tool
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-3 mb-2">OCR Text Extractor</h1>
          <p className="text-sm text-slate-500 font-medium">Perform optical character recognition directly inside your browser cache. Secure & offline.</p>
        </div>

        {/* Setup configuration language selector (Always visible to guide user) */}
        <div className="glass-card p-4 rounded-3xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-50/60 border border-emerald-100 rounded-xl text-emerald-600 shadow-xs">
              <Globe className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] text-slate-455 font-bold uppercase tracking-wider block">Recognition Language</span>
              <p className="text-xs text-slate-800 font-bold">Select the script matching your image</p>
            </div>
          </div>
          <select
            value={language}
            onChange={handleLangChange}
            className="w-full sm:w-60 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 transition-all cursor-pointer shadow-xs"
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        {!originalFile && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
            <div className="md:col-span-7 flex flex-col justify-center">
              <DropZone 
                onFilesSelected={handleFilesSelected}
                title="Drop image containing text"
                subtitle="Supports scanned PDFs, screenshots, JPEG, PNG"
              />
            </div>
            <div className="md:col-span-5 flex">
              <div className="premium-bento rounded-3xl p-6 flex flex-col justify-between w-full shadow-sm hover:border-indigo-350 transition-all duration-300">
                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-indigo-650 bg-indigo-50/30 border border-indigo-100/60 px-2 py-0.5 rounded uppercase tracking-wider inline-block">Demo Preview</div>
                  <h3 className="text-base font-extrabold text-slate-900">How OCR Text Extractor Works</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Run highly accurate optical character recognition locally. Isolate multi-language scripts, scanned books, and document images without third-party network uploads.
                  </p>
                </div>
                <DemoPreview
                  toolId="ocr"
                  alt="OCR Extractor Demo"
                />
              </div>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="glass-card p-10 rounded-3xl flex flex-col items-center justify-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-150/80 flex items-center justify-center animate-pulse text-emerald-650 shadow-xs">
              <FileText className="w-7 h-7" />
            </div>
            
            <ProgressBar 
              progress={progress}
              label="OCR Engine Processing"
              subLabel={statusMessage}
            />

            <div className="p-3.5 bg-white/80 border border-slate-200/50 rounded-2xl max-w-sm flex items-start gap-2.5 text-[11px] text-slate-500 font-medium shadow-xs">
              <ShieldAlert className="w-4 h-4 text-emerald-650 shrink-0 mt-0.5" />
              <span>
                Initial run loads language parameters (1-5MB) into memory. Subsequent runs extract text instantaneously and locally.
              </span>
            </div>
          </div>
        )}

        {!isProcessing && originalFile && ocrText && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Scanned Image Preview */}
            <div className="lg:col-span-5 space-y-4">
              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">
                Source Document
              </span>
              <div className="w-full h-[360px] bg-slate-50/30 border border-slate-200/80 rounded-2xl overflow-hidden flex items-center justify-center p-2">
                <img src={originalUrl} alt="Source" className="max-w-full max-h-full object-contain rounded-lg shadow-sm" />
              </div>
            </div>

            {/* Extracted Text Result */}
            <div className="lg:col-span-7 space-y-4">
              <span className="text-[10px] font-bold text-emerald-650 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-100 uppercase tracking-widest inline-block font-semibold">
                Extracted Text Output
              </span>

              {detectedLangInfo && (
                <div className="bg-emerald-50 border border-emerald-100/65 px-4 py-2.5 text-xs text-emerald-700 rounded-xl flex items-center justify-between shadow-xs font-semibold">
                  <span>
                    Detected Script: <span className="font-extrabold text-emerald-800">{detectedLangInfo.script}</span> (Mapped to <span className="font-extrabold text-emerald-800">{detectedLangInfo.langName}</span>)
                  </span>
                  <span className="opacity-80 text-[10px] font-mono">
                    Confidence: {detectedLangInfo.confidence}%
                  </span>
                </div>
              )}

              <div className="glass-card rounded-3xl overflow-hidden flex flex-col h-[360px]">
                
                {/* Result Control Bar */}
                <div className="bg-slate-50/40 border-b border-slate-200/50 px-4 py-3 flex justify-between items-center">
                  <span className="text-[10px] text-slate-455 font-bold uppercase tracking-wider">
                    Copy or Edit Raw Output
                  </span>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="px-3 py-1.5 bg-white hover:bg-slate-50/50 border border-slate-200/60 hover:border-slate-350 text-[10px] font-bold text-slate-655 hover:text-slate-900 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 font-extrabold" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>

                    <button
                      onClick={handleDownloadText}
                      className="px-3 py-1.5 bg-white hover:bg-slate-50/50 border border-slate-200/60 hover:border-slate-350 text-[10px] font-bold text-slate-655 hover:text-slate-900 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      Download TXT
                    </button>
                  </div>
                </div>

                {/* Text Area */}
                <textarea
                  value={ocrText}
                  onChange={(e) => setOcrText(e.target.value)}
                  className="flex-1 w-full bg-slate-50/20 p-5 text-xs md:text-sm font-mono text-slate-800 border-none outline-none focus:ring-0 resize-none overflow-y-auto"
                />

              </div>

              {/* Reset Control */}
              <div className="flex justify-end">
                <button
                  onClick={handleReset}
                  className="py-2.5 px-5 bg-white hover:bg-slate-50/50 border border-slate-200/60 hover:border-slate-350 text-[11px] font-bold uppercase tracking-wider text-slate-655 hover:text-slate-900 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset OCR Scanner
                </button>
              </div>

            </div>

          </div>
        )}

        <ToolGuide
          toolName="OCR Text Extractor"
          introText="Convert printed or handwritten image documents into editable text using client-side Optical Character Recognition. All scanning performs securely in your browser cache."
          competitorComparison={{
            alternatives: ['OnlineOCR', 'FreeOCR', 'Adobe Acrobat OCR'],
            benefit: 'Standard online OCR services upload your sensitive scanned documents, receipts, or personal screenshots directly to cloud databases. ImageGiri utilizes Tesseract.js client-side scripts. Everything executes on your CPU locally, meaning your data never leaves your computer.'
          }}
          steps={[
            {
              title: 'Select Language',
              description: 'Choose your document language. Our scanner supports over 50 languages including English, Spanish, French, German, Chinese, and Hindi.'
            },
            {
              title: 'Upload Image',
              description: 'Select or drag and drop a screenshot, photo, or scanned document (PNG, JPEG, WebP).'
            },
            {
              title: 'Copy & Save',
              description: 'Monitor the local OCR process. Once finished, inspect the extracted text, modify it on canvas, and click copy to clipboard.'
            }
          ]}
          features={[
            'Optical Character Recognition powered by client-side Tesseract.js WebAssembly.',
            'Broad script support: reads Latin, Arabic, Devanagari, Cyrillic, and Asian fonts.',
            'Automatic text boundary highlights and progress feedback indicator.',
            'Instantly copy extracted text or export as a clean plain text file (.txt).',
            'Fully private execution ensures business files remain entirely confidential.'
          ]}
          faq={[
            {
              q: 'Can it read handwriting?',
              a: 'Accuracy varies for handwriting. It works exceptionally well on printed documents, high-contrast screenshots, and digitized book pages.'
            },
            {
              q: 'Why does OCR processing take some time?',
              a: 'The OCR scripts run local neural network layers to analyze character matrices. Speed depends on image complexity and your computer’s CPU processing speed.'
            },
            {
              q: 'Are scanned documents uploaded to the cloud?',
              a: 'No. The image file is processed via canvas pixel parsing in your browser memory. We have no servers to receive, inspect, or log your documents.'
            }
          ]}
        />

      </div>
    </div>
  );
};
