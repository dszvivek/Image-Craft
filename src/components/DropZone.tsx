import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  title?: string;
  subtitle?: string;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onFilesSelected,
  accept = 'image/*',
  multiple = false,
  maxSizeMB = 100,
  title = 'Drag & drop image here',
  subtitle = 'Supports PNG, JPEG, WebP, GIF',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
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
      // Check type
      if (accept && !file.type.match(accept.replace('*', '.*'))) {
        setError(`Invalid file type: ${file.name}. Only ${accept} files are allowed.`);
        return [];
      }
      // Check size
      if (file.size > maxBytes) {
        setError(`File is too large: ${file.name}. Max size is ${maxSizeMB}MB.`);
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

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        className={`glass-card relative border-2 border-dashed rounded-2xl p-8 md:p-12 text-center cursor-pointer flex flex-col items-center justify-center gap-4 transition-all duration-300 ${
          isDragActive
            ? 'border-indigo-500 bg-indigo-50/50 glow-indigo scale-[1.01]'
            : 'border-slate-200 hover:border-indigo-500/50 hover:bg-slate-50'
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

        <div className={`p-4 rounded-full bg-slate-50 border border-slate-200 transition-all duration-300 ${
          isDragActive ? 'text-indigo-500 border-indigo-500/30 scale-110' : 'text-slate-550'
        }`}>
          {multiple ? (
            <ImageIcon className="w-8 h-8 md:w-10 md:h-10 animate-pulse" />
          ) : (
            <Upload className="w-8 h-8 md:w-10 md:h-10 text-slate-400" />
          )}
        </div>

        <div className="flex flex-col gap-1">
          <span className="font-semibold text-base md:text-lg text-slate-800">
            {title}
          </span>
          <span className="text-xs md:text-sm text-slate-500">
            or <span className="text-indigo-600 underline decoration-indigo-500/30 font-medium">browse local files</span>
          </span>
        </div>

        <span className="text-[11px] md:text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/80">
          {subtitle}
        </span>
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-xl text-xs md:text-sm text-red-600 text-center animate-fade-in">
          {error}
        </div>
      )}
    </div>
  );
};
