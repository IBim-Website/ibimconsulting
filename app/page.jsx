"use client";

import React from 'react';

export default function ShopLandingPage() {
  // Brand Colors:
  // Primary: #004761 (Deep Teal)
  // Accent: #D4AF37 (Gold)

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#004761] px-6 py-12 text-white font-sans">
      
      {/* Structural Engineering Grid Overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-10" 
        style={{ 
          backgroundImage: 'linear-gradient(rgba(212, 175, 55, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(212, 175, 55, 0.2) 1px, transparent 1px)', 
          backgroundSize: '50px 50px' 
        }}
      ></div>

      {/* Subtle Gold Glow */}
      <div className="absolute top-0 -z-10 h-full w-full">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D4AF37]/10 blur-[120px]" />
      </div>

      <div className="z-10 w-full max-w-4xl text-center">
        {/* Brand Header */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-xl bg-[#D4AF37] font-black text-[#004761] text-3xl tracking-tighter shadow-2xl shadow-black/20">
            iBIM
          </div>
          <h2 className="text-sm font-bold uppercase tracking-[0.4em] text-[#D4AF37]">
            Official Shop Launching Soon
          </h2>
        </div>
        
        <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
          Automate Your <br /> 
          <span className="text-[#D4AF37] drop-shadow-md">
            Tekla Workflow.
          </span>
        </h1>

        <p className="mx-auto mb-12 max-w-2xl text-lg text-slate-200/80 leading-relaxed">
          The premier destination for specialized Tekla Structures plugins, 
          residential detailing tools, and expert-led BIM training modules is coming soon.
        </p>

        {/* Services Grid */}
        <div className="mb-16 grid grid-cols-1 gap-6 text-left sm:grid-cols-3">
          <div className="group rounded-xl border border-[#D4AF37]/30 bg-white/5 p-6 backdrop-blur-md transition-all hover:border-[#D4AF37]">
            <h3 className="mb-2 font-bold text-[#D4AF37]">Custom Plugins</h3>
            <p className="text-sm text-slate-200/70">Powerful API tools built to slash manual detailing time for Steel and Precast projects.</p>
          </div>
          <div className="group rounded-xl border border-[#D4AF37]/30 bg-white/5 p-6 backdrop-blur-md transition-all hover:border-[#D4AF37]">
            <h3 className="mb-2 font-bold text-[#D4AF37]">BIM Training</h3>
            <p className="text-sm text-slate-200/70">Comprehensive courses focusing on real-world application and structural automation.</p>
          </div>
          <div className="group rounded-xl border border-[#D4AF37]/30 bg-white/5 p-6 backdrop-blur-md transition-all hover:border-[#D4AF37]">
            <h3 className="mb-2 font-bold text-[#D4AF37]">Detailing Kits</h3>
            <p className="text-sm text-slate-200/70">Pre-configured templates and components for residential and commercial detailing.</p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="flex flex-col items-center gap-6">
          <a 
            href="https://ibimconsulting.com.au" 
            className="group relative flex items-center gap-3 rounded-md bg-[#D4AF37] px-10 py-4 font-bold text-[#004761] transition-all hover:scale-105 hover:bg-[#e5c158] active:scale-95 shadow-xl"
          >
            Explore iBIM Consulting
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </a>
          <p className="text-xs font-medium uppercase tracking-widest text-[#D4AF37]/60">
            Precision • Innovation • Automation
          </p>
        </div>

        {/* Technical Footer */}
        <footer className="mt-24 border-t border-[#D4AF37]/10 pt-8 text-[10px] uppercase tracking-[0.2em] text-slate-400">
          © 2026 iBIM Consulting Pty Ltd | shop.ibimconsulting.com.au
        </footer>
      </div>
    </main>
  );
}