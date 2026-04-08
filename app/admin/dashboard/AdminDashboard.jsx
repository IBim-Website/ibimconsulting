"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  PlusCircle, PenBox, LogOut, ShieldCheck, Link as LinkIcon, 
  Wrench, Package, ChevronRight 
} from 'lucide-react';

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

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* --- COLUMN 1: TOOLS --- */}
        <div className="flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="bg-gradient-to-b from-[#0A1025]/90 to-[#020617]/90 border border-blue-900/50 rounded-3xl p-8 backdrop-blur-xl shadow-lg relative overflow-hidden h-full flex flex-col">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex items-center gap-3 mb-8 relative z-10 border-b border-blue-500/10 pb-6">
              <div className="p-3 bg-blue-950/50 rounded-xl border border-blue-800/50 shadow-inner">
                <Wrench className="text-cyan-400" size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-wide">Tools</h2>
                <p className="text-blue-200/50 text-sm">Manage individual products</p>
              </div>
            </div>
            
            <div className="space-y-4 flex-grow relative z-10 flex flex-col justify-center">
              {/* Add Tool */}
              <Link href="/admin/tools/create" className="group block">
                <div className="flex items-center gap-5 p-5 rounded-2xl bg-blue-950/20 border border-blue-800/30 hover:bg-blue-900/40 hover:border-cyan-500/50 hover:shadow-[0_10px_30px_-10px_rgba(34,211,238,0.15)] transition-all duration-300 group-hover:-translate-y-1">
                  <div className="p-3 rounded-xl bg-black/30 text-blue-400 group-hover:text-cyan-400 group-hover:bg-cyan-950/50 transition-colors">
                    <PlusCircle size={24} />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-bold text-blue-50 group-hover:text-cyan-300 transition-colors">Add New Tool</h3>
                    <p className="text-sm text-blue-200/60">Launch creation wizard</p>
                  </div>
                  <ChevronRight size={20} className="text-blue-500/30 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>

              {/* Edit Tool */}
              <Link href="/admin/tools/update" className="group block">
                <div className="flex items-center gap-5 p-5 rounded-2xl bg-blue-950/20 border border-blue-800/30 hover:bg-blue-900/40 hover:border-cyan-500/50 hover:shadow-[0_10px_30px_-10px_rgba(34,211,238,0.15)] transition-all duration-300 group-hover:-translate-y-1">
                  <div className="p-3 rounded-xl bg-black/30 text-blue-400 group-hover:text-cyan-400 group-hover:bg-cyan-950/50 transition-colors">
                    <PenBox size={24} />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-bold text-blue-50 group-hover:text-cyan-300 transition-colors">Bulk Editor</h3>
                    <p className="text-sm text-blue-200/60">Update existing inventory</p>
                  </div>
                  <ChevronRight size={20} className="text-blue-500/30 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>

              {/* Tool Directory */}
              <Link href="/admin/tools/links" className="group block">
                <div className="flex items-center gap-5 p-5 rounded-2xl bg-blue-950/20 border border-blue-800/30 hover:bg-blue-900/40 hover:border-cyan-500/50 hover:shadow-[0_10px_30px_-10px_rgba(34,211,238,0.15)] transition-all duration-300 group-hover:-translate-y-1">
                  <div className="p-3 rounded-xl bg-black/30 text-blue-400 group-hover:text-cyan-400 group-hover:bg-cyan-950/50 transition-colors">
                    <LinkIcon size={24} />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-bold text-blue-50 group-hover:text-cyan-300 transition-colors">Directory</h3>
                    <p className="text-sm text-blue-200/60">View all tool URLs & IDs</p>
                  </div>
                  <ChevronRight size={20} className="text-blue-500/30 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            </div>
          </div>
        </div>


        {/* --- COLUMN 2: PACKAGES --- */}
        <div className="flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
          <div className="bg-gradient-to-b from-[#0A1025]/90 to-[#020617]/90 border border-blue-900/50 rounded-3xl p-8 backdrop-blur-xl shadow-lg relative overflow-hidden h-full flex flex-col">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex items-center gap-3 mb-8 relative z-10 border-b border-blue-500/10 pb-6">
              <div className="p-3 bg-blue-950/50 rounded-xl border border-blue-800/50 shadow-inner">
                <Package className="text-emerald-400" size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-wide">Packages</h2>
                <p className="text-blue-200/50 text-sm">Manage product bundles</p>
              </div>
            </div>
            
            <div className="space-y-4 flex-grow relative z-10 flex flex-col justify-center">
              {/* Add Package */}
              <Link href="/admin/packages/create" className="group block">
                <div className="flex items-center gap-5 p-5 rounded-2xl bg-blue-950/20 border border-blue-800/30 hover:bg-blue-900/40 hover:border-emerald-500/50 hover:shadow-[0_10px_30px_-10px_rgba(16,185,129,0.15)] transition-all duration-300 group-hover:-translate-y-1">
                  <div className="p-3 rounded-xl bg-black/30 text-emerald-600 group-hover:text-emerald-400 group-hover:bg-emerald-950/50 transition-colors">
                    <PlusCircle size={24} />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-bold text-blue-50 group-hover:text-emerald-300 transition-colors">Add New Package</h3>
                    <p className="text-sm text-blue-200/60">Bundle multiple products</p>
                  </div>
                  <ChevronRight size={20} className="text-blue-500/30 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>

              {/* Edit Package */}
              <Link href="/admin/packages/update" className="group block">
                <div className="flex items-center gap-5 p-5 rounded-2xl bg-blue-950/20 border border-blue-800/30 hover:bg-blue-900/40 hover:border-emerald-500/50 hover:shadow-[0_10px_30px_-10px_rgba(16,185,129,0.15)] transition-all duration-300 group-hover:-translate-y-1">
                  <div className="p-3 rounded-xl bg-black/30 text-emerald-600 group-hover:text-emerald-400 group-hover:bg-emerald-950/50 transition-colors">
                    <PenBox size={24} />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-bold text-blue-50 group-hover:text-emerald-300 transition-colors">Package Editor</h3>
                    <p className="text-sm text-blue-200/60">Modify existing bundles</p>
                  </div>
                  <ChevronRight size={20} className="text-blue-500/30 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>

              {/* Package Directory */}
              {/* <Link href="/admin/packages/links" className="group block">
                <div className="flex items-center gap-5 p-5 rounded-2xl bg-blue-950/20 border border-blue-800/30 hover:bg-blue-900/40 hover:border-purple-500/50 hover:shadow-[0_10px_30px_-10px_rgba(168,85,247,0.15)] transition-all duration-300 group-hover:-translate-y-1">
                  <div className="p-3 rounded-xl bg-black/30 text-emerald-600 group-hover:text-purple-400 group-hover:bg-purple-950/50 transition-colors">
                    <LinkIcon size={24} />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-bold text-blue-50 group-hover:text-purple-300 transition-colors">Directory</h3>
                    <p className="text-sm text-blue-200/60">View all package URLs & IDs</p>
                  </div>
                  <ChevronRight size={20} className="text-blue-500/30 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                </div>
              </Link> */}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}