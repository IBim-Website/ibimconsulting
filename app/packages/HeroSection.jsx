import React from 'react';
import { Settings, CheckCircle2, Zap } from 'lucide-react';

export default function PackagesHero() {
  return (
    <section className="relative w-full overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28 px-6">
      
      {/* Background Glowing Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/10 rounded-[100%] blur-[120px] pointer-events-none"></div>
      <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-teal-600/10 rounded-[100%] blur-[100px] pointer-events-none"></div>
      
      {/* Subtle Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-50"></div>

      <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold tracking-wide mb-8 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
          <Zap size={16} className="fill-emerald-500" />
          <span>Ultimate Automation Bundles</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-4xl lg:text-4xl font-black text-white leading-[1.1] mb-8 drop-shadow-lg tracking-tight">
          All The Tools You Need To Build A <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">
            Profitable Detailing Business
          </span> <br className="hidden md:block" />
          In One Place
        </h1>

        {/* Sub-headline Paragraph */}
        <p className="text-base md:text-lg text-blue-200/70 leading-relaxed max-w-3xl mx-auto mb-12 font-medium">
          Are you tired of spending countless hours on repetitive, mundane tasks that could be easily automated? Say goodbye to tedious manual tasks and embrace a more efficient workflow with our automation bundles. By automating your routine processes, you can reclaim a significant <span className="text-emerald-300 font-bold">25 to 40 hours every month</span>, allowing you to focus on more critical tasks that truly matter to your business.
        </p>

        {/* Compatibility Footer Pill */}
        <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-[#0A1025]/80 border border-blue-800/50 backdrop-blur-md shadow-xl text-blue-100/90 text-sm font-medium">
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-emerald-400" />
            <span>Supports both <strong>Imperial</strong> and <strong>Metric</strong> units</span>
          </div>
          <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-blue-800"></div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-400" />
            <span>Compatible with all environments from <strong>Version 2020 onwards</strong></span>
          </div>
        </div>

      </div>
    </section>
  );
}