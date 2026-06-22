import React from 'react';
import { Lock, ShieldAlert, CheckCircle } from 'lucide-react';
import { SEO } from '../components/SEO';

export const Privacy: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto py-6">
      <SEO 
        title="Privacy Policy - No Data Collection" 
        description="Read our cookie-free privacy policy. Your images and files are processed strictly in your browser RAM and never stored." 
      />

      <div className="text-center mb-12">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-xs font-semibold text-emerald-650 mb-4 tracking-wide shadow-sm">
          <Lock className="w-4 h-4 text-emerald-600" />
          GDPR & CCPA Compliant
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4">Privacy Policy</h1>
        <p className="text-sm md:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
          How we enforce security at the browser level. We collect no cookies, no images, and no user profiles.
        </p>
      </div>

      <div className="premium-bento p-8 rounded-3xl bg-white space-y-8 text-xs md:text-sm text-slate-550 leading-relaxed shadow-xs">
        
        <section className="space-y-3">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-indigo-500" />
            1. Core Data Policy
          </h2>
          <p className="font-medium">
            Our core value proposition is: <strong className="text-slate-900 font-bold">"Your files never leave your device."</strong>
          </p>
          <p className="font-medium">
            When you select or drop a file in any tool (such as the Image Compressor, AI Background Remover, or Collage Maker), the file is read directly into the browser's sandboxed local memory. It is processed inside Web Workers and Javascript scripts running on your CPU or GPU.
          </p>
          <p className="font-medium">
            There is absolutely no network transmission of your images. There are no server uploads, backups, or cloud caching layers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-indigo-500" />
            2. AI Models and Weights
          </h2>
          <p className="font-medium">
            The machine learning models used in our tools (such as the RMBG-1.4 model for background segmentation) are downloaded directly from open-source repositories on Hugging Face CDN.
          </p>
          <p className="font-medium">
            Once downloaded, they are cached in your browser's local Cache storage. The model weights are loaded into your local browser's ONNX Web Assembly runtime. No telemetry or image pixels are ever reported back to Hugging Face or any other third parties.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-indigo-500" />
            3. Analytics & Ad Placements
          </h2>
          <p className="font-medium">
            To keep our tools free, we place non-intrusive Google AdSense scripts on the page. We support cookie-free implementations where possible.
          </p>
          <p className="font-medium">
            We do not share your files, file metadata, or any processed outcomes with advertisers. Advertisers only receive basic analytics profiles according to standard web browsing specifications.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-indigo-500" />
            4. Browser DevTools Verification
          </h2>
          <p className="font-medium">
            You can verify our privacy assertions at any time:
          </p>
          <ol className="list-decimal pl-5 space-y-1.5 text-slate-450 font-mono text-xs">
            <li>Press <strong className="text-slate-800">F12</strong> or right-click and select <strong className="text-slate-800">Inspect</strong> to open Developer Tools.</li>
            <li>Click the <strong className="text-slate-800">Network</strong> tab.</li>
            <li>Drop an image into the Background Remover or OCR tool.</li>
            <li>Observe that no network requests containing your image bytes or binary arrays are generated.</li>
          </ol>
        </section>

        <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-start gap-3 mt-4 shadow-xs">
          <ShieldAlert className="w-5.5 h-5.5 text-amber-600 shrink-0 mt-0.5 animate-bounce" />
          <div>
            <h4 className="text-xs font-bold text-slate-800">Got questions?</h4>
            <p className="text-[11px] text-slate-450 mt-0.5 font-medium">
              If you have any questions or would like to review our local execution code, please visit our Github project page or contact our support team.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
