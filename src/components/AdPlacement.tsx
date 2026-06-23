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
  const [isExpanded, setIsExpanded] = useState(false);

  const adDimensions = {
    header: { label: 'Leaderboard (728×90)', dimensions: 'w-full max-w-[728px] h-[90px]' },
    sidebar: { label: 'Skyscraper (300×600)', dimensions: 'w-[260px] h-[600px]' },
    'in-content': { label: 'In-Content (336×280)', dimensions: 'w-full max-w-[336px] h-[280px] mx-auto' },
    mobile: { label: 'Mobile Banner (320×50)', dimensions: 'w-[320px] h-[50px] mx-auto' },
  };

  const ad = adDimensions[type];

  // Initialize adsbygoogle push for production tags
  useEffect(() => {
    if (!import.meta.env.DEV) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        // AdSense script block / pending load
      }
    }
  }, []);

  // In development — show a non-intrusive collapsed pill
  if (import.meta.env.DEV) {
    if (type === 'header') {
      // Minimal subtle strip instead of a dark bar — collapsed by default
      return (
        <div className={`flex justify-center ${className}`}>
          {isExpanded ? (
            <div className="my-2 w-full max-w-[728px] h-[90px] border border-dashed border-slate-200 bg-slate-50/60 rounded-xl flex items-center justify-center gap-3 relative">
              <span className="text-[10px] text-slate-400 font-medium">{ad.label} · AdSense Slot</span>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-[10px] text-slate-400 hover:text-slate-600 underline cursor-pointer"
              >
                Collapse
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsExpanded(true)}
              className="my-1 px-3 py-0.5 text-[9px] uppercase tracking-widest font-bold text-slate-350 hover:text-slate-500 border border-dashed border-slate-200 rounded-full transition-colors cursor-pointer"
            >
              Ad Slot
            </button>
          )}
        </div>
      );
    }

    if (type === 'sidebar') {
      return (
        <div className={`flex flex-col items-center ${className}`}>
          {isExpanded ? (
            <div className={`${ad.dimensions} border border-dashed border-slate-200 bg-slate-50/60 rounded-xl flex flex-col items-center justify-center gap-2`}>
              <span className="text-[10px] text-slate-400 font-medium text-center px-4">{ad.label}</span>
              <button onClick={() => setIsExpanded(false)} className="text-[9px] text-slate-400 hover:text-slate-600 underline cursor-pointer">Collapse</button>
            </div>
          ) : (
            <button
              onClick={() => setIsExpanded(true)}
              className="w-full px-3 py-2 text-[9px] uppercase tracking-widest font-bold text-slate-350 hover:text-slate-500 border border-dashed border-slate-200 rounded-xl transition-colors cursor-pointer text-center"
            >
              Ad Slot · {ad.label}
            </button>
          )}
        </div>
      );
    }

    // Mobile / in-content — very minimal
    return (
      <div className={`flex justify-center ${className}`}>
        <div className="px-3 py-0.5 text-[9px] text-slate-350 border border-dashed border-slate-200 rounded-full">
          {ad.label}
        </div>
      </div>
    );
  }

  // Production — real AdSense tags
  return (
    <div className={`my-6 flex flex-col items-center justify-center ${className}`}>
      <div className="w-full flex flex-col items-center">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={ADSENSE_CONFIG.publisherId}
          data-ad-slot={ADSENSE_CONFIG.slots[type]}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
};
