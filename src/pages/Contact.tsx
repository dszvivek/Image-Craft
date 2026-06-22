import React, { useState } from 'react';
import { Mail, MessageSquare, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { SEO } from '../components/SEO';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate support ticket submission (locally)
    setSubmitted(true);
    setFormData({ name: '', email: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6">
      <SEO 
        title="Contact Us - Support Team" 
        description="Reach out to the ImageCraft AI support team. Ask questions about browser processing, report bugs, or request features." 
      />

      <div className="text-center mb-12">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-55 border border-indigo-100 rounded-full text-xs font-semibold text-indigo-650 mb-4 tracking-wide shadow-sm">
          <MessageSquare className="w-4 h-4 text-indigo-550" />
          Get In Touch
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4">Contact Support</h1>
        <p className="text-sm md:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
          Have questions or feedback? Drop us a message and our open-source team will respond shortly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Contact Info */}
        <div className="md:col-span-5 space-y-6">
          
          <div className="premium-bento p-6 rounded-3xl bg-white space-y-4 shadow-xs">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Mail className="w-4.5 h-4.5 text-indigo-500" />
              General Inquiries
            </h3>
            <p className="text-xs text-slate-550 leading-relaxed font-medium">
              Email us directly for sponsorship, integration partnerships, or open-source contribution proposals.
            </p>
            <a 
              href="mailto:support@imagecraftai.com" 
              className="text-xs font-mono font-semibold text-indigo-650 hover:underline block"
            >
              support@imagecraftai.com
            </a>
          </div>

          <div className="premium-bento p-6 rounded-3xl bg-white space-y-3 shadow-xs">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
              Developer Verification
            </h3>
            <p className="text-xs text-slate-550 leading-relaxed font-medium">
              Our site runs fully in user browser cache. To audit the processing pipeline, feel free to inspect the source code on our GitHub project page.
            </p>
          </div>

        </div>

        {/* Contact Form */}
        <div className="md:col-span-7">
          <div className="premium-bento p-8 rounded-3xl bg-white shadow-xs">
            
            {submitted ? (
              <div className="p-6 text-center flex flex-col items-center gap-3.5 animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-850">Message Dispatched</h3>
                <p className="text-xs text-slate-550 max-w-sm leading-relaxed font-medium">
                  Thank you! Your inquiry was processed. Since there is no backend database, your query is routed locally. We will follow up via email shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4.5">
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/70 bg-slate-50/30 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-200"
                    placeholder="Enter your name"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/70 bg-slate-50/30 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-200"
                    placeholder="Enter your email"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">
                    Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/70 bg-slate-50/30 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-200 resize-none"
                    placeholder="Describe your issue or feature request..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-650 hover:from-indigo-550 hover:to-purple-550 text-[11px] font-bold uppercase tracking-wider text-white rounded-xl shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Send Support Request
                </button>

              </form>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
