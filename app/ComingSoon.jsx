"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Wrench, GraduationCap, Blocks, ArrowRight, Timer } from 'lucide-react';

export default function ShopLandingPage() {
  // Brand Colors:
  // Primary Background: #004761 (Deep Teal)
  // Accent Color: #D4AF37 (Gold)

  const features = [
    { 
      icon: Wrench, 
      title: "Custom Plugins", 
      desc: "Powerful API tools built to slash manual detailing time for Steel and Precast projects.",
      href: "/tools"
    },
    { 
      icon: GraduationCap, 
      title: "BIM Training", 
      desc: "Comprehensive courses focusing on real-world application and structural automation.",
      href: "https://learn.ibimconsulting.com.au/"
    },
    { 
      icon: Blocks, 
      title: "Detailing Kits", 
      desc: "Pre-configured templates and components for residential and commercial detailing." 
    }
  ];

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-12 text-white font-sans selection:bg-[#D4AF37] selection:text-[#004761]">
      
      {/* Structural Engineering Grid Overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-15 mix-blend-overlay" 
        style={{ 
          backgroundImage: 'linear-gradient(rgba(212, 175, 55, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212, 175, 55, 0.3) 1px, transparent 1px)', 
          backgroundSize: '40px 40px' 
        }}
      ></div>

      {/* Subtle Gold Ambient Glow */}
      <div className="absolute top-0 -z-10 h-full w-full overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D4AF37]/15 blur-[150px]" />
      </div>

      <div className="z-10 w-full max-w-5xl text-center">
        
        {/* Brand Header */}
        <div className="mb-12 flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="mb-10 relative h-20 w-56 sm:h-24 sm:w-64 transition-transform hover:scale-105 duration-500">
            <Image 
              src="/logo.svg" 
              alt="IBim Consulting Logo" 
              fill
              priority
              className="object-contain brightness-0 invert filter drop-shadow-lg"
            />
          </div>
          
          {/* Enhanced Launch Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-5 py-2 backdrop-blur-md shadow-[0_0_20px_rgba(212,175,55,0.15)]">
            <Timer size={16} className="text-[#D4AF37] animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
              Official Shop Launching Soon
            </span>
          </div>
        </div>
        
        {/* Hero Typography */}
        <h1 className="mb-8 text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
          Automate Your <br /> 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#fcebb6] drop-shadow-sm">
            Tekla Workflow.
          </span>
        </h1>

        <p className="mx-auto mb-16 max-w-2xl text-lg text-teal-50/80 leading-relaxed font-light text-pretty animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          The Premier Destination for specialized Tekla Structures Plugins for modelling, connections, drawings, reports and checking. And Training modules from Basic to Advanced level.
        </p>

        {/* Services Grid with Lucide Icons */}
        <div className="mb-20 grid grid-cols-1 gap-6 text-left sm:grid-cols-3 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const cardClasses = `group relative overflow-hidden rounded-2xl border border-[#D4AF37]/20 bg-[#003b52]/60 p-8 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-[#D4AF37]/60 hover:bg-[#003b52]/90 hover:shadow-[0_15px_30px_-10px_rgba(212,175,55,0.2)] ${feature.href ? 'cursor-pointer block' : ''}`;
            
            const CardInnerContent = (
              <>
                {/* Decorative Top Highlight */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
                
                <div className="mb-6 inline-flex rounded-xl bg-[#D4AF37]/10 p-3 text-[#D4AF37] ring-1 ring-[#D4AF37]/20 transition-transform duration-500 group-hover:scale-110 group-hover:bg-[#D4AF37] group-hover:text-[#004761]">
                  <Icon size={28} strokeWidth={1.5} />
                </div>
                <h3 className="mb-3 text-xl font-bold text-white tracking-wide">{feature.title}</h3>
                <p className="text-sm text-teal-100/60 leading-relaxed font-light">{feature.desc}</p>
              </>
            );

            // Handle External Links
            if (feature.href && feature.href.startsWith('http')) {
              return (
                <a 
                  key={index} 
                  href={feature.href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={cardClasses}
                >
                  {CardInnerContent}
                </a>
              );
            }

            // Handle Internal Links with Next.js Link
            if (feature.href) {
              return (
                <Link key={index} href={feature.href} className={cardClasses}>
                  {CardInnerContent}
                </Link>
              );
            }

            // Handle Cards with no link
            return (
              <div key={index} className={cardClasses}>
                {CardInnerContent}
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="flex flex-col items-center gap-8 animate-in fade-in duration-1000 delay-700">
          <a 
            href="https://ibimconsulting.com.au" 
            className="group relative flex items-center gap-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#e6c65c] px-10 py-4 font-bold tracking-wide text-[#004761] transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_10px_40px_-10px_rgba(212,175,55,0.4)]"
          >
            Explore IBim Consulting
            <ArrowRight size={20} strokeWidth={2.5} className="transition-transform duration-300 group-hover:translate-x-1.5" />
          </a>
          
          <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-widest text-[#D4AF37]/60">
            <span>Precision</span>
            <span className="h-1 w-1 rounded-full bg-[#D4AF37]/40"></span>
            <span>Innovation</span>
            <span className="h-1 w-1 rounded-full bg-[#D4AF37]/40"></span>
            <span>Automation</span>
          </div>
        </div>

        {/* Technical Footer */}
        <footer className="mt-24 border-t border-[#D4AF37]/10 pt-8 text-[11px] uppercase tracking-[0.2em] text-teal-100/30 font-medium">
          © 2026 IBim Consulting Pty Ltd | shop.ibimconsulting.com.au
        </footer>
      </div>
    </main>
  );
}