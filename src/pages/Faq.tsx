import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Lock } from 'lucide-react';
import { SEO } from '../components/SEO';

interface FAQItem {
  q: string;
  a: string;
}

export const Faq: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      q: 'How does client-side local processing work?',
      a: 'Modern browsers are capable of running complex calculations via Web Workers and WebAssembly. We pack compiling scripts and AI weights directly into your browser. Once loaded, everything runs on your physical CPU or GPU, entirely bypassing the cloud.'
    },
    {
      q: 'Are my private files saved or monitored?',
      a: 'Absolutely not. ImageGiri has no databases, telemetry tracking, or backend servers for your files. All transformations, AI cutouts, and OCR script scanning occur locally in your browser memory (RAM).'
    },
    {
      q: 'Why does background removal require an initial download?',
      a: 'The AI tool runs a local neural network (RMBG-1.4) inside your browser. The first time you launch the tool, the weights (approx. 10MB) are downloaded from Hugging Face CDN. They are subsequently cached in your browser\'s IndexedDB, enabling immediate, offline loading next time.'
    },
    {
      q: 'Is ImageGiri truly 100% free?',
      a: 'Yes, completely. There are no registration forms, no usage credits, and no subscriptions. The application is supported by lightweight, non-disruptive ad placements without interrupting your local workflow.'
    },
    {
      q: 'Which browsers are supported?',
      a: 'All modern evergreen browsers are supported including Google Chrome, Mozilla Firefox, Apple Safari, Microsoft Edge, and Opera. WebAssembly and Web Workers must be enabled, which is standard in 99%+ of browsers today.'
    },
    {
      q: 'Does it work offline?',
      a: 'Yes! Once the tools have been initially loaded in your browser session, they are fully cached. You can disconnect your internet and continue compiling collages, compressing images, or extracting text offline.'
    }
  ];

  return (
    <div className="w-full relative py-12">
      <SEO 
        title="Frequently Asked Questions" 
        description="Find answers about client-side processing, file privacy, browser support, and local machine learning models in ImageGiri." 
      />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-[10px] font-bold text-indigo-650 uppercase tracking-widest">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Support & Documentation</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-[1.1]">
            Frequently Asked Questions
          </h1>
          <p className="text-sm md:text-base text-slate-500 max-w-xl mx-auto leading-relaxed">
            Everything you need to know about our privacy-first local processing technology.
          </p>
        </div>

        {/* FAQ Grid */}
        <div className="premium-bento rounded-3xl p-8 bg-white border border-slate-200/50 mb-12 shadow-sm">
          <div className="flex flex-col divider-y">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="border-b last:border-0 border-slate-200/50 py-4 first:pt-0 last:pb-0"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full py-3 flex items-center justify-between text-left text-sm md:text-base font-bold text-slate-800 hover:text-indigo-650 cursor-pointer transition-colors duration-150"
                >
                  <span className="pr-4">{faq.q}</span>
                  {openFaqIndex === index ? (
                    <ChevronUp className="w-4.5 h-4.5 text-indigo-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                  )}
                </button>
                
                <div 
                  className={`transition-all duration-200 ease-in-out overflow-hidden ${
                    openFaqIndex === index ? 'max-h-60 opacity-100 pt-2 pb-3' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-medium">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Promise Bento Card */}
        <div className="premium-bento rounded-3xl p-8 bg-gradient-to-tr from-indigo-50/40 via-white to-purple-50/40 border border-slate-200/50 shadow-xs flex flex-col md:flex-row items-center gap-6 justify-between text-left">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
              <Lock className="w-3 h-3" /> Security
            </div>
            <h3 className="font-extrabold text-lg text-slate-900">Have a privacy question not listed here?</h3>
            <p className="text-xs text-slate-500 max-w-lg leading-relaxed font-medium">
              We take offline security seriously. Check out our Privacy Policy or get in touch with our team directly.
            </p>
          </div>
          <div className="flex gap-3 shrink-0 w-full md:w-auto">
            <a 
              href="/privacy" 
              className="w-full md:w-auto px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold text-center transition-all shadow-xs"
            >
              Privacy Policy
            </a>
            <a 
              href="/contact" 
              className="w-full md:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold text-center transition-all shadow-md shadow-indigo-500/10"
            >
              Contact Support
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
