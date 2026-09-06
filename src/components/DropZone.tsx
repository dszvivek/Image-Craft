import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { popPendingTransferFile } from '../utils/sharedImageTransfer';

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
}

// Active DropZone tracking for multi-instance paste disambiguation
let activeDropZoneId: string | null = null;
let activeDropZoneCount = 0;

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
  const instanceIdRef = useRef(`dz-${Math.random().toString(36).slice(2, 9)}`);
  const [isDragActive, setIsDragActive] = useState(false);
  const [justDropped, setJustDropped] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    activeDropZoneCount++;
    activeDropZoneId = instanceIdRef.current;
    return () => {
      activeDropZoneCount--;
      if (activeDropZoneId === instanceIdRef.current) {
        activeDropZoneId = null;
      }
    };
  }, []);

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

    const matchesAccept = (file: File, acceptStr: string): boolean => {
      if (!acceptStr || acceptStr === '*') return true;
      const patterns = acceptStr.split(',').map(p => p.trim().toLowerCase());
      const fileName = file.name.toLowerCase();
      const fileType = file.type.toLowerCase();

      return patterns.some(pattern => {
        if (pattern.startsWith('.')) {
          return fileName.endsWith(pattern);
        }
        if (pattern.endsWith('/*')) {
          const baseType = pattern.slice(0, -2);
          return fileType.startsWith(baseType + '/');
        }
        return fileType === pattern;
      });
    };

    for (const file of files) {
      if (accept && !matchesAccept(file, accept)) {
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

  // Automatically pick up pending file passed from hero dropzone
  useEffect(() => {
    const pending = popPendingTransferFile();
    if (pending) {
      const valid = validateFiles([pending]);
      if (valid.length > 0) {
        setJustDropped(true);
        setTimeout(() => setJustDropped(false), 400);
        onFilesSelected(valid);
      }
    }
  }, [validateFiles, onFilesSelected]);

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
      // Disambiguate multi-DropZone paste: only active/hovered instance responds
      if (activeDropZoneCount > 1 && activeDropZoneId !== instanceIdRef.current) {
        return;
      }

      // Do not intercept paste if user is typing in an active text input or textarea
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || (activeEl as HTMLElement).isContentEditable)) {
        if (activeEl !== fileInputRef.current) {
          return;
        }
      }

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
        onMouseEnter={() => { activeDropZoneId = instanceIdRef.current; }}
        onFocus={() => { activeDropZoneId = instanceIdRef.current; }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onButtonClick()}
        aria-label={title}
        className={`craft-dock relative rounded-2xl p-8 md:p-10 text-center cursor-pointer flex flex-col items-center justify-center gap-4 transition-all duration-200 select-none ${
          isDragActive
            ? 'is-dragover scale-[1.01]'
            : ''
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
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-200 ${
          isDragActive
            ? 'text-indigo-600 border-indigo-300 bg-indigo-50 scale-110 shadow-md dark:text-indigo-400 dark:border-indigo-500 dark:bg-indigo-950/60'
            : justDropped
            ? 'text-indigo-600 border-indigo-300 bg-indigo-50 shadow-md dark:text-indigo-400 dark:border-indigo-500 dark:bg-indigo-950/60'
            : 'text-indigo-600 border-indigo-100 bg-indigo-50/60 shadow-xs dark:text-indigo-400 dark:border-indigo-900/60 dark:bg-indigo-950/40'
        }`}>
          <IconComponent className={`w-7 h-7 transition-all ${isDragActive ? 'animate-pulse' : ''}`} />
        </div>

        {/* Text */}
        <div className="flex flex-col gap-1 max-w-sm">
          <span className={`font-extrabold text-base md:text-lg tracking-tight transition-colors ${isDragActive ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-900 dark:text-slate-100'}`}>
            {isDragActive ? 'Release to open in studio' : title}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Drag & drop files here, paste (<kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300">Ctrl+V</kbd>), or click to browse
          </span>
        </div>

        {/* High-Visibility Action CTA Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onButtonClick();
            }}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Select Local Image</span>
          </button>
        </div>

        {/* Subtitle Pill */}
        <span className="text-[10px] md:text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100/80 dark:bg-slate-800/80 px-3 py-1 rounded-full border border-slate-200/60 dark:border-slate-700">
          {subtitle} • 100% In-RAM Local
        </span>
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
