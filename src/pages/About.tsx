import React from 'react';
import { Cpu, ShieldCheck, Zap, Lock, Info, Terminal } from 'lucide-react';
import { SEO } from '../components/SEO';

export const About: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto py-6">
      <SEO 
        title="About Us - Privacy First" 
        description="Learn how ImageCraft AI processes all images directly in your browser. Our technology stack, offline processing promise, and security structure." 
      />

      <div className="text-center mb-12">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-semibold text-indigo-650 mb-4 tracking-wide shadow-sm">
          <Info className="w-4 h-4 text-indigo-550" />
          Our Mission
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4">About ImageCraft AI</h1>
        <p className="text-sm md:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
          A collection of fully local, sandboxed image processing and AI tools that respect your privacy.
        </p>
      </div>

      <div className="space-y-12">
        
        {/* Core Philosophy */}
        <section className="premium-bento p-8 rounded-3xl bg-white space-y-4 shadow-xs">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2.5">
            <Lock className="w-5.5 h-5.5 text-indigo-500" />
            Why Client-Side Only?
          </h2>
          <p className="text-xs md:text-sm text-slate-550 leading-relaxed font-medium">
            In the modern web, almost every image utility uploads your files to remote cloud servers. This exposes your receipts, screenshots, documents, and portraits to potential server data leaks, cloud processing logging, and unauthorized AI training.
          </p>
          <p className="text-xs md:text-sm text-slate-550 leading-relaxed font-medium">
            ImageCraft AI was created to challenge this paradigm. By moving 100% of the image compression, AI modeling, OCR scanning, and collage mapping engines directly into your browser's runtime memory, <span className="text-indigo-650 font-bold">your files never leave your device.</span> You receive desktop-class speeds with absolute privacy.
          </p>
        </section>

        {/* Tech Stack */}
        <section className="space-y-6">
          <h2 className="text-xl font-black text-slate-900 text-center">Under the Hood</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="premium-bento p-6 rounded-3xl bg-white space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shadow-xs">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-805 text-sm">Transformers.js</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Compiles PyTorch models into ONNX runtime weights that execute locally in browser Web Workers, utilizing CPU/GPU multi-threading.
              </p>
            </div>

            <div className="premium-bento p-6 rounded-3xl bg-white space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-805 text-sm">WebAssembly (WASM)</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Loads high-performance C++ binaries in the browser to run complex OCR parsing (via Tesseract.js) at close to native speeds.
              </p>
            </div>

            <div className="premium-bento p-6 rounded-3xl bg-white space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-805 text-sm">Offscreen Canvas</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Decouples heavy image transformations and slicing operations from the main DOM thread to guarantee a fluid 60fps UI.
              </p>
            </div>

          </div>
        </section>

        {/* Security checklist */}
        <section className="premium-bento p-8 rounded-3xl bg-white shadow-xs">
          <h2 className="text-xl font-black text-slate-900 mb-5 flex items-center gap-2">
            <ShieldCheck className="w-5.5 h-5.5 text-emerald-600" />
            Security & Trust Audits
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm text-slate-655 font-medium">
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0 animate-pulse" />
              <span><strong>Zero server uploads:</strong> Verify via browser DevTools (Network tab).</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0 animate-pulse" />
              <span><strong>Offline capable:</strong> The site operates offline once models cache.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0 animate-pulse" />
              <span><strong>Cookie-Free:</strong> We do not track user movements or build profiles.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0 animate-pulse" />
              <span><strong>Sandboxed files:</strong> Web Worker isolation protects system memory.</span>
            </li>
          </ul>
        </section>

        {/* Testimonials Section */}
        <section className="space-y-6 pt-6 border-t border-slate-200/60">
          <h2 className="text-xl font-black text-slate-900 text-center">User Testimonials</h2>
          <p className="text-xs text-slate-500 text-center max-w-md mx-auto leading-relaxed">
            See what professionals and creators are saying about ImageCraft AI's sandbox performance.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                quote: "Zero uploads means I can compress confidential brand visuals without worrying about compliance or NDA issues. ImageCraft is an essential daily utility.",
                author: "Jane Doe",
                role: "Lead Brand Designer",
                avatarColor: "bg-indigo-100 text-indigo-700",
                initials: "JD"
              },
              {
                quote: "The background cutout runs completely in-browser! Once the cached model is loaded, it executes instantly. Incredible design.",
                author: "Marcus Chen",
                role: "UX Lead at FlowState",
                avatarColor: "bg-purple-100 text-purple-700",
                initials: "MC"
              },
              {
                quote: "Splitting grid layouts for Instagram is seamless. No ads covering the download button, no payment walls, and original resolution is preserved.",
                author: "Sarah Lund",
                role: "Digital Creator",
                avatarColor: "bg-pink-100 text-pink-700",
                initials: "SL"
              },
              {
                quote: "The OCR text extraction auto-detects English and Hindi flawlessly. Incredible to see such complex tools compile entirely client-side.",
                author: "Alex Rivera",
                role: "Frontend Engineer",
                avatarColor: "bg-emerald-100 text-emerald-700",
                initials: "AR"
              },
              {
                quote: "I love the Color Palette Extractor. I drop an asset, copy the generated Tailwind configuration codes, and apply it directly. Highly recommend!",
                author: "Elena Rostova",
                role: "UI Developer",
                avatarColor: "bg-cyan-100 text-cyan-700",
                initials: "ER"
              }
            ].map((test, index) => (
              <div 
                key={index} 
                className="premium-bento p-6 rounded-3xl bg-white border border-slate-200/50 flex flex-col justify-between gap-5 hover:scale-[1.01] transition-transform shadow-xs"
              >
                <p className="text-xs md:text-sm text-slate-550 leading-relaxed font-medium italic">
                  "{test.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border border-slate-250/50 ${test.avatarColor}`}>
                    {test.initials}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800">{test.author}</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{test.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};
