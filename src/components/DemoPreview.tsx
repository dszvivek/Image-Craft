import React, { useState } from 'react';
import { DemoAnimation } from './DemoAnimations';

interface DemoPreviewProps {
  toolId?: string;
  gifSrc?: string;
  staticSrc?: string;
  alt: string;
}

export const DemoPreview: React.FC<DemoPreviewProps> = ({ toolId, gifSrc, staticSrc, alt }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="my-5 rounded-2xl overflow-hidden aspect-[4/3] border border-slate-200/60 shadow-xs relative select-none cursor-pointer bg-[#0c0c0e]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {toolId ? (
        <div className={`w-full h-full transition-all duration-500 ${isHovered ? 'scale-102 brightness-105' : ''}`}>
          <DemoAnimation toolId={toolId} />
        </div>
      ) : (
        <img 
          src={isHovered ? gifSrc : staticSrc} 
          alt={alt} 
          className="w-full h-full object-cover transition-all duration-300" 
          loading="lazy" 
        />
      )}
    </div>
  );
};

