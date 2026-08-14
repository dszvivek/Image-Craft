/**
 * Ambient Smart Desk Clock & Date Overlay Component
 * Turns displays, tablets, and secondary monitors into living smart desk clocks.
 */

import React, { useState, useEffect } from 'react';

interface DeskClockOverlayProps {
  isVisible: boolean;
  isAutoHidden?: boolean;
}

export const DeskClockOverlay: React.FC<DeskClockOverlayProps> = ({
  isVisible,
  isAutoHidden = false,
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );
      setDateStr(
        now.toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-6 right-6 z-20 transition-all duration-500 transform pointer-events-none select-none ${
        isAutoHidden
          ? 'opacity-30 scale-95'
          : 'opacity-100 scale-100'
      }`}
    >
      <div className="flex flex-col items-end text-right px-4 py-2 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10 text-white shadow-xl">
        <span className="text-2xl md:text-3xl font-black tracking-tight font-mono text-white/90">
          {timeStr}
        </span>
        <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-300">
          {dateStr}
        </span>
      </div>
    </div>
  );
};
