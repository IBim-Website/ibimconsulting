"use client";

import React from 'react';

export default function Hero({ isMounted }) {
  return (
    <div className="relative z-10 mx-auto max-w-[1400px] px-6 pt-20 lg:px-8">
      <div 
        className={`flex flex-col items-center text-center mb-16 transition-all duration-1000 ease-out transform ${
          isMounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}
      >
        {/* SHORTENED BADGE */}
        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-blue-950/40 border border-blue-500/20 text-cyan-300 text-sm font-medium mb-8 backdrop-blur-md shadow-[0_0_30px_rgba(59,130,246,0.15)]">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gradient-to-r from-cyan-500 to-blue-500"></span>
          </span>
          <span>Imperial & Metric Supported • v2020+ Compatible</span>
        </div>
        
        <h1 className="mb-8 text-5xl font-extrabold tracking-tight sm:text-7xl drop-shadow-2xl">
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-amber-400 bg-clip-text text-transparent">
            Tools
          </span>
        </h1>
        
        <p className="max-w-4xl text-lg text-blue-100/70 leading-relaxed text-pretty">
          iBIM Consulting has developed automation tools that can be used in day to day work to enable you speed up the process and automate certain repetitive tasks. To find the right tools for your industry, we have categorized different sections on the right side. We also have a team of experienced developers who can build tools of any specific requirement. If you don't find the right tool, kindly leave your details with a short description on the contact page.
        </p>
      </div>
    </div>
  );
}