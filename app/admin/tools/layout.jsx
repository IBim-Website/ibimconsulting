import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AdminToolsLayout({ children }) {
  return (
    <>
      {/* Fixed positioned Back Button. 
        It floats in the bottom left corner, completely independent of the page scroll! 
      */}
      <div className="fixed bottom-6 left-6 lg:bottom-8 lg:left-8 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Link 
          href="/admin/dashboard" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-400/80 hover:text-cyan-400 transition-all group bg-[#0A1025]/80 px-5 py-3 rounded-2xl border border-blue-900/50 backdrop-blur-xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.7)] hover:border-cyan-500/50 hover:bg-[#0c1328]/90 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:-translate-y-1"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="hidden sm:inline">Back to Dashboard</span>
          <span className="sm:hidden">Back</span>
        </Link>
      </div>
      
      {/* The child page renders exactly as it normally would */}
      {children}
    </>
  );
}