"use client";

import React from 'react';

export default function ShopLandingPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 px-6 py-12 text-slate-100 font-sans">
      {/* Structural Grid Overlay for Engineering Aesthetic */}
      <div className="absolute inset-0 z-0 opacity-20" 
           style={{ backgroundImage: 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      {/* Background Gradient Glow */}
      <div className="absolute top-0 -z-10 h-full w-full">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      <div className="z-10 w-full max-w-4xl text-center">
        {/* Logo/Brand Header */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-blue-600 font-bold text-2xl tracking-tighter shadow-lg shadow-blue-500/20">
            iBIM
          </div>
          <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-blue-400">
            Official Shop Launching Soon
          </h2>
        </div>
        
        <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
          Automate Your <br /> 
          <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Tekla Workflow.
          </span>
        </h1>

        <p className="mx-auto mb-12 max-w-2xl text-lg text-slate-400 leading-relaxed">
          Our specialized store for Tekla Structures automation tools, residential detailing plugins, 
          and professional BIM training modules is currently undergoing a structural update.
        </p>

        {/* Services/Products Preview Grid */}
        <div className="mb-16 grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
            <h3 className="mb-2 font-bold text-blue-400">Custom Tools</h3>
            <p className="text-sm text-slate-400 text-pretty">Advanced API tools for Steel, Precast, and Residential detailing to save up to 40 hours monthly.</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
            <h3 className="mb-2 font-bold text-blue-400">Expert Training</h3>
            <p className="text-sm text-slate-400 text-pretty">Step-by-step Tekla Structures courses designed for all skill levels from basic to experienced.</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
            <h3 className="mb-2 font-bold text-blue-400">BIM Services</h3>
            <p className="text-sm text-slate-400 text-pretty">Precision 2D drafting, 3D modeling, and Material Take-Off (MTO) solutions for your projects.</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col items-center gap-4">
          <a 
            href="https://ibimconsulting.com.au" 
            className="group relative flex items-center gap-2 rounded-full bg-blue-600 px-8 py-4 font-bold text-white transition-all hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] active:scale-95"
          >
            Visit Main Website
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </a>
          <p className="text-sm text-slate-500">For support, contact info@ibimconsulting.com.au</p>
        </div>

        {/* Footer */}
        <footer className="mt-20 flex flex-wrap justify-center gap-x-8 gap-y-4 text-xs font-medium uppercase tracking-widest text-slate-600">
          <span>Tekla Structures Experts</span>
          <span>•</span>
          <span>Automation Plugins</span>
          <span>•</span>
          <span>BIM Consultation</span>
        </footer>
      </div>
    </main>
  );
}