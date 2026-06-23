import React, { useState } from 'react';

interface DemoPreviewProps {
  gifSrc: string;
  staticSrc: string;
  alt: string;
}

export const DemoPreview: React.FC<DemoPreviewProps> = ({ gifSrc, staticSrc, alt }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div 
      className="my-5 rounded-2xl overflow-hidden aspect-[4/3] border border-slate-150 shadow-xs relative select-none cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img 
        src={isHovered ? gifSrc : staticSrc} 
        alt={alt} 
        className="w-full h-full object-cover" 
        loading="lazy" 
      />
    </div>
  );
};
