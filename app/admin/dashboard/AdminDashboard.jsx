"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, PlusCircle, PenBox, LogOut, ShieldCheck } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();

  const handleLogout = () => {
    // Delete the auth cookie by expiring it immediately
    document.cookie = "adminAuth=; path=/; max-age=0";
    // Redirect back to login
    router.push('/admin');
  };

  return (
    <div className="relative z-10 mx-auto max-w-[1200px] px-6 pt-32 pb-24 min-h-screen">
      
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 animate-in fade-in slide-in-from-left-4 duration-500">
        <div className="flex items-center gap-4">
          <div className="h-10 w-2 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-full"></div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white drop-shadow-md flex items-center gap-3">
              COMMAND <span className="text-cyan-400 font-light">CENTER</span>
            </h1>
            <p className="text-blue-300/60 text-sm mt-1 flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-400" /> Secure Admin Session
            </p>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-950/30 text-red-400 border border-red-900/50 hover:bg-red-900/40 hover:text-red-300 transition-all text-sm font-bold shrink-0"
        >
          <LogOut size={16} /> End Session
        </button>
      </div>

      {/* Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Create Tool Card */}
        <Link href="/admin/tools/create" className="group block">
          <div className="h-full bg-gradient-to-b from-[#0A1025]/80 to-[#020617]/90 border border-blue-900/50 rounded-3xl p-8 backdrop-blur-xl shadow-lg hover:shadow-[0_20px_40px_-10px_rgba(34,211,238,0.2)] hover:border-cyan-500/50 transition-all duration-300 group-hover:-translate-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-colors"></div>
            
            <div className="w-16 h-16 bg-blue-950/50 rounded-2xl flex items-center justify-center border border-blue-800/50 shadow-inner mb-6 group-hover:border-cyan-400/50 transition-colors">
              <PlusCircle className="text-cyan-400" size={32} />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
              Add New Tool
            </h2>
            <p className="text-blue-200/60 leading-relaxed">
              Launch the product creation wizard. Upload images, set pricing tiers, write rich-text descriptions, and generate new GoHighLevel records instantly.
            </p>
          </div>
        </Link>

        {/* Update Tool Card */}
        <Link href="/admin/tools/update" className="group block">
          <div className="h-full bg-gradient-to-b from-[#0A1025]/80 to-[#020617]/90 border border-blue-900/50 rounded-3xl p-8 backdrop-blur-xl shadow-lg hover:shadow-[0_20px_40px_-10px_rgba(34,211,238,0.2)] hover:border-cyan-500/50 transition-all duration-300 group-hover:-translate-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-600/20 transition-colors"></div>
            
            <div className="w-16 h-16 bg-blue-950/50 rounded-2xl flex items-center justify-center border border-blue-800/50 shadow-inner mb-6 group-hover:border-cyan-400/50 transition-colors">
              <PenBox className="text-cyan-400" size={32} />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
              Bulk Editor
            </h2>
            <p className="text-blue-200/60 leading-relaxed">
              Open the spreadsheet-style inventory manager. Quickly adjust prices, rename tools, update categories, and sync all changes back to the database in one click.
            </p>
          </div>
        </Link>

      </div>
    </div>
  );
}