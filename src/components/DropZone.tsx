import React, { useRef, useState } from 'react';
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

  const validateFiles = (files: File[]): File[] => {
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
  };

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
            ? 'border-indigo-500 bg-indigo-50/60 glow-indigo scale-[1.01]'
            : 'border-slate-200 hover:border-indigo-400/60 hover:bg-indigo-50/15 hover:shadow-sm'
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
            ? 'text-indigo-500 border-indigo-300/60 bg-indigo-50 scale-110 animate-drop-bounce'
            : justDropped
            ? 'text-indigo-500 border-indigo-300/60 bg-indigo-50 animate-drop-bounce'
            : 'text-slate-400 border-slate-200 bg-white/70 shadow-xs'
        }`}>
          <IconComponent className={`w-8 h-8 md:w-10 md:h-10 transition-all ${isDragActive ? 'animate-pulse' : ''}`} />
        </div>

        {/* Text */}
        <div className="flex flex-col gap-1">
          <span className={`font-semibold text-base md:text-lg transition-colors ${isDragActive ? 'text-indigo-700' : 'text-slate-800'}`}>
            {isDragActive ? 'Release to upload' : title}
          </span>
          <span className="text-xs md:text-sm text-slate-500">
            or <span className="text-indigo-600 underline decoration-indigo-500/30 underline-offset-2 font-medium">browse local files</span>
          </span>
        </div>

        {/* Subtitle Pill */}
        <span className="text-[11px] md:text-xs text-slate-500 bg-white/80 px-3 py-1 rounded-full border border-slate-200/50">
          {subtitle}
        </span>

        {/* Paste hint */}
        <span className="text-[10px] text-slate-400 font-medium">
          or paste from clipboard (Ctrl+V)
        </span>

        {/* Drag overlay hint */}
        {isDragActive && (
          <div className="absolute inset-0 rounded-2xl border-2 border-indigo-500 pointer-events-none animate-pulse opacity-30" />
        )}
      </div>

      {error && (
        <div className="mt-3 p-3 rounded-xl text-xs md:text-sm text-center animate-fade-in flex items-center justify-center gap-2" style={{background:'#fff0f0', border:'1px solid #fca5a5', color:'#dc2626'}}>
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
};
