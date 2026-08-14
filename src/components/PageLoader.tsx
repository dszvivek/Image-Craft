import React from 'react';

export const PageLoader: React.FC = () => (
  <div className="w-full animate-pulse">
    {/* Header skeleton */}
    <div className="text-center mb-8 space-y-3">
      <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto" />
      <div className="h-9 w-72 bg-slate-200 dark:bg-slate-800 rounded-xl mx-auto" />
      <div className="h-4 w-56 bg-slate-200 dark:bg-slate-800 rounded-lg mx-auto" />
    </div>
    {/* Content skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
      <div className="md:col-span-7 space-y-3">
        <div className="h-52 bg-slate-100 dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800" />
      </div>
      <div className="md:col-span-5 space-y-3">
        <div className="h-52 bg-slate-100 dark:bg-slate-900 rounded-2xl" />
      </div>
    </div>
  </div>
);
