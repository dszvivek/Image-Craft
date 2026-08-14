/**
 * Guided Breathing Visualization Overlay Component
 */

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface BreathingOverlayProps {
  isActive: boolean;
  onClose: () => void;
}

export const BreathingOverlay: React.FC<BreathingOverlayProps> = ({ isActive, onClose }) => {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');

  useEffect(() => {
    if (!isActive) return;

    // 4-4-4 breathing cycle (4s inhale, 4s hold, 4s exhale)
    const cycle = () => {
      setPhase('inhale');
      const timer1 = setTimeout(() => {
        setPhase('hold');
      }, 4000);
      const timer2 = setTimeout(() => {
        setPhase('exhale');
      }, 8000);

      return [timer1, timer2];
    };

    let timers = cycle();
    const interval = setInterval(() => {
      timers = cycle();
    }, 12000);

    return () => {
      clearInterval(interval);
      timers.forEach(clearTimeout);
    };
  }, [isActive]);

  if (!isActive) return null;

  const phaseText = {
    inhale: 'Breathe In',
    hold: 'Hold',
    exhale: 'Breathe Out',
  }[phase];

  const scaleClass = {
    inhale: 'scale-125 opacity-90',
    hold: 'scale-125 opacity-100',
    exhale: 'scale-75 opacity-60',
  }[phase];

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-20">
      {/* Outer Breathing Pulsing Ring */}
      <div
        className={`w-64 h-64 md:w-80 md:h-80 rounded-full border-2 border-teal-300/40 bg-teal-400/10 backdrop-blur-md shadow-2xl transition-all duration-[4000ms] ease-in-out flex items-center justify-center ${scaleClass}`}
      >
        <div className="w-40 h-40 md:w-48 md:h-48 rounded-full border border-teal-200/50 bg-teal-300/10 animate-ping-slow" />
      </div>

      {/* Breathing Prompt Label */}
      <div className="absolute mt-56 md:mt-72 text-center pointer-events-auto bg-slate-900/80 backdrop-blur-md border border-white/10 px-5 py-2 rounded-full text-white shadow-xl">
        <p className="text-sm font-black tracking-widest uppercase text-teal-300 transition-all duration-700">
          {phaseText}
        </p>
      </div>

      {/* Close Breathing Overlay Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 pointer-events-auto p-2.5 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white backdrop-blur-md border border-white/10 transition cursor-pointer"
        title="Exit Breathing Mode"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};
