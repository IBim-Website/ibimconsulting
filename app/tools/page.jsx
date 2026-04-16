"use client";

import React, { useState, useEffect } from 'react';
import Hero from './Hero';
import ToolsGrid from './ToolsGrid';
import FAQ from './FAQ';
import LicensingOptions from '../../components/LicensingOptions';

export default function ToolsPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <main className="min-h-screen text-white font-sans selection:bg-amber-500/30 selection:text-amber-100 pb-24 overflow-hidden relative">
      
      {/* Blueprint Grid Pattern - Shared globally */}
      <div 
        className="fixed inset-0 z-0 opacity-[0.15] pointer-events-none blend-overlay" 
        style={{ 
          backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.2) 1px, transparent 1px)', 
          backgroundSize: '50px 50px' 
        }}
      />

      {/* AMBIENT GLOWS - Shared globally */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none transition-opacity duration-1000" style={{ opacity: isMounted ? 1 : 0 }}>
        <div className="absolute -top-[30%] -left-[20%] w-[70%] h-[70%] rounded-full bg-blue-900/20 blur-[150px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[20%] -right-[20%] w-[60%] h-[60%] rounded-full bg-indigo-800/20 blur-[150px] mix-blend-screen" />
        <div className="absolute bottom-[-40%] left-[20%] w-[60%] h-[60%] rounded-full bg-amber-700/10 blur-[180px] mix-blend-screen" />
      </div>

      {/* Render the extracted components */}
    <Hero isMounted={isMounted} />
      {/* <div ></div> */}
      <ToolsGrid isMounted={isMounted} />
      <LicensingOptions exclude="Floating License" />
      <FAQ />

    </main>
  );
}