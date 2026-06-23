import React, { useState, useEffect } from 'react';

interface AdPlacementProps {
  type: 'header' | 'sidebar' | 'in-content' | 'mobile';
  className?: string;
}

// Google AdSense Configuration
// Replace these placeholders with your actual publisher and slot IDs from your AdSense Console.
const ADSENSE_CONFIG = {
  publisherId: 'ca-pub-XXXXXXXXXXXXXXXX', // e.g. ca-pub-1234567890123456
  slots: {
    header: 'XXXXXXXXXX',        // Leaderboard slot (728x90)
    sidebar: 'XXXXXXXXXX',       // Skyscraper slot (300x600)
    'in-content': 'XXXXXXXXXX',  // In-content slot (336x280)
    mobile: 'XXXXXXXXXX',        // Mobile banner slot (320x50)
  }
};

export const AdPlacement: React.FC<AdPlacementProps> = ({ type, className = '' }) => {
  // Automatically show mock simulator in local dev, show real ads in production
  const [showSimulator, setShowSimulator] = useState(import.meta.env.DEV);

  const adDimensions = {
    header: { label: 'Leaderboard Ad (728x90)', dimensions: 'w-full max-w-[728px] h-[90px]' },
    sidebar: { label: 'Skyscraper Ad (300x600)', dimensions: 'w-[300px] h-[600px]' },
    'in-content': { label: 'In-Content Banner (336x280)', dimensions: 'w-full max-w-[336px] h-[280px] mx-auto' },
    mobile: { label: 'Mobile Banner (320x50)', dimensions: 'w-[320px] h-[50px] mx-auto' },
  };

  const ad = adDimensions[type];

  // Initialize adsbygoogle push for production tags
  useEffect(() => {
    if (!showSimulator) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        // AdSense script block / pending load
      }
    }
  }, [showSimulator]);

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
              className="text-[10px] text-slate-500 hover:text-slate-300 font-bold px-1 rounded hover:bg-slate-800 transition cursor-pointer"
              title="Show Real Ad Slot"
            >
              ×
            </button>
          </div>
          <span className="text-xs font-semibold text-slate-400 group-hover:text-indigo-400 transition-colors">
            {ad.label}
          </span>
          <span className="text-[10px] text-slate-500 mt-1">
            Google AdSense Integration Point (Active in Production)
          </span>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center">
          {import.meta.env.DEV && (
            <span className="text-[9px] text-slate-500 mb-1 cursor-pointer hover:text-slate-300" onClick={() => setShowSimulator(true)}>
              [Return to Simulator]
            </span>
          )}
          <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client={ADSENSE_CONFIG.publisherId}
            data-ad-slot={ADSENSE_CONFIG.slots[type]}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      )}
    </div>
  );
};
