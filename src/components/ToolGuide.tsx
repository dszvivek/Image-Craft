import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, CheckCircle, BookOpen, Shuffle } from 'lucide-react';

export interface GuideStepItem {
  title: string;
  description: string;
}

export interface GuideFaqItem {
  q: string;
  a: string;
}

interface ToolGuideProps {
  toolName: string;
  introText: string;
  steps: GuideStepItem[];
  features: string[];
  faq: GuideFaqItem[];
  competitorComparison: {
    alternatives: string[];
    benefit: string;
  };
}

export const ToolGuide: React.FC<ToolGuideProps> = ({
  toolName,
  introText,
  steps,
  features,
  faq,
  competitorComparison
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  return (
    <div className="mt-16 border-t border-slate-200/60 pt-12 max-w-4xl mx-auto space-y-12 text-left">
      {/* Intro Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100/80 rounded-full text-[10px] font-bold text-indigo-650 uppercase tracking-widest">
          <BookOpen className="w-3.5 h-3.5" />
          <span>User Guide & FAQs</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
          How to Use {toolName} & FAQs
        </h2>
        <p className="text-xs md:text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
          {introText}
        </p>
      </div>

      {/* Alternative Competitor Banner */}
      <div className="premium-bento p-5 rounded-2xl bg-gradient-to-r from-indigo-50/30 to-purple-50/30 border border-indigo-100/50 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-purple-650 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
            <Shuffle className="w-3 h-3" /> Alternatives Comparison
          </span>
          <h3 className="font-extrabold text-sm text-slate-900">
            Looking for a private alternative to {competitorComparison.alternatives.join(', ')}?
          </h3>
          <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
            {competitorComparison.benefit}
          </p>
        </div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1 shrink-0">
          100% On-Device & Free
        </div>
      </div>

      {/* Steps & Features Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Step-by-Step */}
        <div className="premium-bento p-6 rounded-2xl bg-white border border-slate-200/50 space-y-4 shadow-xs">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-indigo-600 rounded-full" />
            Quick Instructions
          </h3>
          <ol className="relative border-l border-indigo-100/60 ml-3.5 pl-6 space-y-5">
            {steps.map((step, idx) => (
              <li key={idx} className="relative">
                <span className="absolute -left-10 top-0.5 flex items-center justify-center w-6.5 h-6.5 bg-indigo-50 border border-indigo-150 text-indigo-650 rounded-full text-[10px] font-bold font-mono">
                  {idx + 1}
                </span>
                <h4 className="text-xs font-bold text-slate-850">{step.title}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium mt-0.5">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>

        {/* Core Capabilities */}
        <div className="premium-bento p-6 rounded-2xl bg-white border border-slate-200/50 space-y-4 shadow-xs">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-indigo-600 rounded-full" />
            Core Features & Advantages
          </h3>
          <ul className="space-y-3.5">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-550 shrink-0 mt-0.5" />
                <span className="text-[11px] md:text-xs font-medium text-slate-650 leading-relaxed">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Accordion FAQs */}
      {faq.length > 0 && (
        <div className="premium-bento p-6 rounded-2xl bg-white border border-slate-200/50 space-y-4 shadow-xs">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-2">
            <HelpCircle className="w-4 h-4 text-indigo-600" />
            Frequently Asked Questions
          </h3>
          <div className="divide-y divide-slate-100">
            {faq.map((item, index) => (
              <div key={index} className="py-3.5 first:pt-0 last:pb-0">
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full flex items-center justify-between text-left text-xs font-bold text-slate-750 hover:text-indigo-650 cursor-pointer transition-colors duration-150 py-1"
                >
                  <span className="pr-4">{item.q}</span>
                  {openFaqIndex === index ? (
                    <ChevronUp className="w-4 h-4 text-indigo-650 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                <div
                  className={`transition-all duration-200 ease-in-out overflow-hidden ${
                    openFaqIndex === index ? 'max-h-48 opacity-100 pt-2 pb-1' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                    {item.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
