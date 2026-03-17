"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, ArrowRight, ShieldAlert, Loader2 } from 'lucide-react';

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate a tiny network delay so the button animation plays
    await new Promise(resolve => setTimeout(resolve, 800));

    // Static Credential Check
    if (username === 'admin' && password === 'adminibim') {
      // Set a simple cookie that expires in 1 day (86400 seconds)
      document.cookie = "adminAuth=true; path=/; max-age=86400";
      
      // Redirect to the protected area (e.g., where your Bulk Editor will live)
      router.push('/admin/dashboard'); 
    } else {
      setError('Invalid username or password. Access denied.');
      setIsLoading(false);
    }
  };

  const inputClass = "w-full bg-[#020617]/50 border border-blue-900/50 rounded-xl pl-11 pr-4 py-3.5 text-blue-50 placeholder:text-blue-200/20 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50 transition-all shadow-inner";
  const iconClass = "absolute left-4 top-4 text-blue-400/50 group-focus-within:text-cyan-400 transition-colors z-10";

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative z-10">
      
      {/* Background Ambient Glow specifically for the login card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-600/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#0A1025]/80 border border-blue-800/40 rounded-3xl p-8 sm:p-10 backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-900 to-[#020617] rounded-2xl flex items-center justify-center border border-blue-700/50 shadow-[0_0_20px_rgba(37,99,235,0.2)] mb-6">
            <Lock className="text-cyan-400" size={32} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-md">
            ADMIN <span className="text-cyan-400 font-light">PORTAL</span>
          </h1>
          <p className="text-sm text-blue-300/60 mt-2">
            Restricted access. Please authenticate.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-900/50 flex items-start gap-3 animate-in shake duration-300">
            <ShieldAlert className="text-red-400 shrink-0 mt-0.5" size={18} />
            <p className="text-sm font-medium text-red-300/90">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative group">
            <User className={iconClass} size={20} />
            <input 
              type="text" 
              placeholder="Username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          <div className="relative group">
            <Lock className={iconClass} size={20} />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white px-8 py-4 text-sm font-black uppercase tracking-wider transition-all duration-300 active:scale-95 shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin text-cyan-200" />
                Authenticating...
              </>
            ) : (
              <>
                Secure Login
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
        
      </div>
    </div>
  );
}