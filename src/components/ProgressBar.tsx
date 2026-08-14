import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  label?: string;
  subLabel?: string;
  onCancel?: () => void;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  subLabel,
  onCancel,
  className = '',
}) => {
  const clampedProgress = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <div className={`w-full max-w-md mx-auto ${className} animate-fade-in`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-slate-700">
          {label || 'Processing...'}
        </span>
        <span className="text-sm font-bold text-indigo-600">
          {clampedProgress}%
        </span>
      </div>

      <div className="w-full bg-slate-100 border border-slate-200/80 rounded-full h-3 overflow-hidden p-0.5">
        <div
          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>

      {subLabel && (
        <p className="text-xs text-slate-500 mt-1.5 text-center italic">
          {subLabel}
        </p>
      )}

      {onCancel && (
        <div className="flex justify-center mt-4">
          <button
            onClick={onCancel}
            className="px-4 py-1.5 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-600 hover:text-red-600 text-xs font-semibold rounded-full transition-all shadow-sm cursor-pointer"
          >
            Cancel Process
          </button>
        </div>
      )}
    </div>
  );
};
