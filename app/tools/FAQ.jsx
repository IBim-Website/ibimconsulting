"use client";

import React from 'react';
import { faqs } from './constants'; 

export default function FAQ() {
  return (
    <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-8">
      <div className="max-w-3xl mx-auto pb-20 border-t border-blue-900/30 pt-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">Frequently Asked Questions</h2>
          <p className="text-base text-blue-200/60 max-w-xl mx-auto">Everything you need to know about our tools, licensing, and support.</p>
        </div>
        
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <details key={index} className="group rounded-2xl border border-blue-900/40 bg-[#0A1025]/60 backdrop-blur-md [&_summary::-webkit-details-marker]:hidden transition-all duration-300 hover:border-cyan-500/30 hover:bg-[#0A1025]/80 open:border-amber-500/30 open:bg-[#0A1025]/90 shadow-lg">
              <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-5 text-base text-blue-100 font-semibold hover:text-cyan-300 transition-colors">
                {faq}
                <span className="shrink-0 transition duration-300 group-open:-rotate-180 bg-blue-950/50 border border-blue-800/50 group-hover:border-cyan-500/50 text-blue-400 group-hover:text-cyan-300 group-open:text-amber-400 group-open:border-amber-500/50 rounded-full p-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
              </summary>
              <div className="px-5 pb-5 text-sm text-blue-200/70 leading-relaxed border-t border-blue-900/30 mt-2 pt-5">
                We are currently updating our documentation. If you need an immediate answer regarding this, please contact us at <a href="mailto:info@ibimconsulting.com.au" className="text-cyan-400 hover:text-amber-400 hover:underline transition-colors font-medium">info@ibimconsulting.com.au</a>.
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}