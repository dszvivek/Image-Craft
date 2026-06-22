import React, { useState, useEffect } from 'react';

interface AdPlacementProps {
  type: 'header' | 'sidebar' | 'in-content' | 'mobile';
  className?: string;
}

export const AdPlacement: React.FC<AdPlacementProps> = ({ type, className = '' }) => {
  const [showSimulator, setShowSimulator] = useState(true);

  // In production, we'd load the real AdSense tag. Here we render a premium-looking placeholder.
  const adDimensions = {
    header: { label: 'Leaderboard Ad (728x90)', dimensions: 'w-full max-w-[728px] h-[90px]' },
    sidebar: { label: 'Skyscraper Ad (300x600)', dimensions: 'w-[300px] h-[600px]' },
    'in-content': { label: 'In-Content Banner (336x280)', dimensions: 'w-full max-w-[336px] h-[280px] mx-auto' },
    mobile: { label: 'Mobile Banner (320x50)', dimensions: 'w-[320px] h-[50px] mx-auto' },
  };

  const ad = adDimensions[type];

  // Try to load AdSense script in production
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // AdSense script not loaded yet or blocked
    }
  }, []);

  return (
    <div className={`my-6 flex flex-col items-center justify-center ${className}`}>
      {showSimulator ? (
        <div
          className={`${ad.dimensions} border-2 border-dashed border-slate-700 bg-slate-900/60 rounded-lg flex flex-col items-center justify-center p-4 text-center relative overflow-hidden transition-all hover:border-indigo-500/50 group`}
        >
          <div className="absolute top-2 right-2 flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded">
              Ad Simulator
            </span>
            <button
              onClick={() => setShowSimulator(false)}
              className="text-[10px] text-slate-500 hover:text-slate-300 font-bold px-1 rounded hover:bg-slate-800 transition"
              title="Hide Ad Placement Mockup"
            >
              ×
            </button>
          </div>
          <span className="text-xs font-semibold text-slate-400 group-hover:text-indigo-400 transition-colors">
            {ad.label}
          </span>
          <span className="text-[10px] text-slate-500 mt-1">
            Google AdSense Integration Point
          </span>
        </div>
      ) : (
        <div className="text-[10px] text-slate-600 hover:text-slate-400 cursor-pointer" onClick={() => setShowSimulator(true)}>
          [Show Ad Placement]
        </div>
      )}
      
      {/* Real Google AdSense Tag (Hidden in Simulator Mode) */}
      {!showSimulator && (
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Replace with real Publisher ID
          data-ad-slot="XXXXXXXXXX"        // Replace with real Slot ID
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      )}
    </div>
  );
};
