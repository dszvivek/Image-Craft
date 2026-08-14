import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onFilesSelected,
  accept = 'image/*',
  multiple = false,
  maxSizeMB = 100,
  title = 'Drag & drop image here',
  subtitle = 'Supports PNG, JPEG, WebP, GIF',
  icon: CustomIcon,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [justDropped, setJustDropped] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const validateFiles = useCallback((files: File[]): File[] => {
    const validFiles: File[] = [];
    const maxBytes = maxSizeMB * 1024 * 1024;

    for (const file of files) {
      if (accept && !file.type.match(accept.replace('*', '.*'))) {
        setError(`Invalid file type: ${file.name}. Only ${accept} files are allowed.`);
        return [];
      }
      if (file.size > maxBytes) {
        setError(`File too large: ${file.name}. Max size is ${maxSizeMB}MB.`);
        return [];
      }
      validFiles.push(file);
    }
    setError(null);
    return validFiles;
  }, [accept, maxSizeMB]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      const filteredFiles = multiple ? droppedFiles : [droppedFiles[0]];
      const validFiles = validateFiles(filteredFiles);
      if (validFiles.length > 0) {
        setJustDropped(true);
        setTimeout(() => setJustDropped(false), 400);
        onFilesSelected(validFiles);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles = validateFiles(selectedFiles);
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    }
  };

  // Clipboard paste listener (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const items = Array.from(e.clipboardData.items);
      const pastedFiles: File[] = [];

      for (const item of items) {
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) {
            pastedFiles.push(file);
          }
        }
      }

      if (pastedFiles.length > 0) {
        const filteredFiles = multiple ? pastedFiles : [pastedFiles[0]];
        const validFiles = validateFiles(filteredFiles);
        if (validFiles.length > 0) {
          setJustDropped(true);
          setTimeout(() => setJustDropped(false), 400);
          onFilesSelected(validFiles);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [multiple, validateFiles, onFilesSelected]);

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Determine icon to show
  const IconComponent = CustomIcon ?? (multiple ? ImageIcon : Upload);

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onButtonClick()}
        aria-label={title}
        className={`glass-card relative border-2 border-dashed rounded-2xl p-8 md:p-12 text-center cursor-pointer flex flex-col items-center justify-center gap-4 transition-all duration-300 select-none ${
          isDragActive
            ? 'border-indigo-500 bg-indigo-50/60 glow-indigo scale-[1.01] dark:border-indigo-400 dark:bg-indigo-950/40'
            : 'border-slate-200 hover:border-indigo-400/60 hover:bg-indigo-50/15 hover:shadow-sm dark:border-slate-800 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-950/20'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInputChange}
        />

        {/* Icon */}
        <div className={`p-4 rounded-2xl border transition-all duration-300 ${
          isDragActive
            ? 'text-indigo-500 border-indigo-300/60 bg-indigo-50 scale-110 animate-drop-bounce dark:text-indigo-400 dark:border-indigo-500/40 dark:bg-indigo-950/40'
            : justDropped
            ? 'text-indigo-500 border-indigo-300/60 bg-indigo-50 animate-drop-bounce dark:text-indigo-400 dark:border-indigo-500/40 dark:bg-indigo-950/40'
            : 'text-slate-400 border-slate-200 bg-white/70 shadow-xs dark:text-slate-400 dark:border-slate-800 dark:bg-slate-900/60'
        }`}>
          <IconComponent className={`w-8 h-8 md:w-10 md:h-10 transition-all ${isDragActive ? 'animate-pulse' : ''}`} />
        </div>

        {/* Text */}
        <div className="flex flex-col gap-1">
          <span className={`font-semibold text-base md:text-lg transition-colors ${isDragActive ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'}`}>
            {isDragActive ? 'Release to upload' : title}
          </span>
          <span className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
            or <span className="text-indigo-600 dark:text-indigo-400 underline decoration-indigo-500/30 underline-offset-2 font-medium">browse local files</span>
          </span>
        </div>

        {/* Subtitle Pill */}
        <span className="text-[11px] md:text-xs text-slate-500 bg-white/80 px-3 py-1 rounded-full border border-slate-200/50 dark:text-slate-400 dark:bg-slate-900/80 dark:border-slate-800/80">
          {subtitle}
        </span>

        {/* Paste hint */}
        <span className="text-[10px] text-slate-400 font-medium dark:text-slate-500">
          or paste from clipboard (Ctrl+V)
        </span>

        {/* Drag overlay hint */}
        {isDragActive && (
          <div className="absolute inset-0 rounded-2xl border-2 border-indigo-500 pointer-events-none animate-pulse opacity-30 dark:border-indigo-400" />
        )}
      </div>

      {error && (
        <div className="mt-3 p-3 rounded-xl text-xs md:text-sm text-center animate-fade-in flex items-center justify-center gap-2 bg-[#fff0f0] border border-[#fca5a5] text-[#dc2626] dark:bg-red-950/40 dark:border-red-900/50 dark:text-red-400">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
};
