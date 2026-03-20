"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Youtube, ShoppingCart, Check, 
  BarChart2, DollarSign, TrendingUp, Headset, 
  Download, Globe, Users, Clock, Package
} from 'lucide-react';

// --- Helper for YouTube Embed ---
const getEmbedUrl = (url) => {
  if (!url) return '';
  let videoId = '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    videoId = match[2];
  }
  return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
};

export default function PackageDetailsClient() {
  // Mock data for UI demonstration purposes. 
  // In your real app, you will pass this down from your page.js server component or fetch it based on the slug.
  const pkg = {
    name: "Master Structural Suite",
    groupType: "Premium Bundle",
    price: 249.00,
    youtubeLink: "https://youtu.be/dQw4w9WgXcQ", // Example link
    products: ["Timber Cleat", "Truss Component", "Preset Splice", "Drawing Dimensions", "Fire Tie"],
    packageInfo: ["Lifetime Updates", "Priority Support", "Multi-Seat License"],
    description: `
      <p>This ultimate bundle is designed to handle every structural detailing challenge you face. By combining our top-tier tools into one unified package, you eliminate the need to switch between manual drafting and automated processes.</p>
      <p><strong>Key Benefits:</strong></p>
      <ul>
        <li>Instantly generate complex connections across entire models.</li>
        <li>Ensure 100% compliance with industry standards.</li>
        <li>Reduce drafting time by up to 60% on typical residential and commercial projects.</li>
      </ul>
    `
  };

  const [activeVideo, setActiveVideo] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleAddToCart = () => {
    setIsAddingToCart(true);
    // Simulate cart logic
    setTimeout(() => {
      setIsAddingToCart(false);
      alert("Added to cart!");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#020617] pt-24 pb-20 selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Background Effects */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-600/5 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-teal-600/5 blur-[150px]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 lg:px-8">
        
        {/* Top Navigation */}
        <div className="mb-8">
          <Link href="/packages" className="inline-flex items-center gap-2 text-sm font-medium text-blue-300/60 hover:text-emerald-400 transition-colors">
            <ArrowLeft size={16} /> Back to Packages
          </Link>
        </div>

        {/* --- MAIN PRODUCT SPLIT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Details & Description */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* Header Section */}
            <div className="bg-[#0A1025]/80 border border-emerald-900/30 p-8 rounded-3xl backdrop-blur-xl shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="inline-flex items-center px-3 py-1 rounded-md bg-emerald-950/50 border border-emerald-800/50 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  {pkg.groupType}
                </div>
                
                {pkg.youtubeLink && (
                  <button 
                    onClick={() => setActiveVideo(pkg.youtubeLink)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all font-semibold text-sm"
                  >
                    <Youtube size={18} /> Watch Demo
                  </button>
                )}
              </div>
              
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-8">
                {pkg.name}
              </h1>

              {/* Included Products List (Since there's no image) */}
              <div className="bg-[#020617]/50 rounded-2xl p-6 border border-blue-900/30">
                <h3 className="text-sm font-bold text-blue-200/50 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Package size={16} /> Included in this bundle
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {pkg.products.map((productName, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="mt-0.5 p-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <span className="text-blue-100 font-medium">{productName}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Rich Text Description */}
            {pkg.description && (
              <div className="bg-[#0A1025]/80 border border-blue-900/30 p-8 rounded-3xl backdrop-blur-xl shadow-lg">
                <h2 className="text-xl font-bold text-white mb-6 border-b border-blue-900/30 pb-4">Package Overview</h2>
                <div 
                  className="prose prose-invert prose-emerald max-w-none text-blue-100/80 leading-relaxed marker:text-emerald-400"
                  dangerouslySetContent={{ __html: pkg.description }}
                />
              </div>
            )}
          </div>

          {/* Right Column: Pricing & Cart (Sticky) */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <div className="bg-[#0A1025]/90 border border-emerald-500/20 p-6 rounded-3xl backdrop-blur-xl shadow-[0_20px_40px_-10px_rgba(16,185,129,0.15)] flex flex-col gap-6">
              
              {/* Pricing Box */}
              <div className="bg-[#020617] border-2 border-emerald-500/80 rounded-2xl p-5 relative overflow-hidden shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-2xl rounded-full pointer-events-none"></div>
                
                <div className="flex items-center gap-3 mb-2 relative z-10">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-emerald-500">
                    <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full"></div>
                  </div>
                  <span className="text-emerald-400 font-bold text-sm tracking-widest uppercase">Annual License</span>
                </div>
                
                <div className="flex items-baseline gap-2 mt-2 relative z-10">
                  <span className="text-4xl font-black text-white tracking-tight">${pkg.price.toFixed(2)}</span>
                  <span className="text-blue-200/50 font-medium">/ yr</span>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button 
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-lg py-4 rounded-xl flex justify-center items-center gap-3 transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
              >
                {isAddingToCart ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <ShoppingCart size={20} /> Add to cart
                  </>
                )}
              </button>

              {/* Package Info / Features List */}
              {pkg.packageInfo && pkg.packageInfo.length > 0 && (
                <div className="pt-4 border-t border-blue-900/40 space-y-3">
                  {pkg.packageInfo.map((info, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm text-blue-200">
                      <Check size={16} className="text-emerald-500 shrink-0" />
                      <span>{info}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* --- STATS SECTION --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-16 my-16 border-y border-blue-900/40">
          <div className="flex flex-col items-center text-center gap-2">
            <Download size={28} className="text-emerald-500 mb-2 opacity-50" />
            <h4 className="text-4xl font-black text-white">3200+</h4>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-300/60">Downloads</p>
          </div>
          <div className="flex flex-col items-center text-center gap-2">
            <Globe size={28} className="text-emerald-500 mb-2 opacity-50" />
            <h4 className="text-4xl font-black text-white">25+</h4>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-300/60">Countries</p>
          </div>
          <div className="flex flex-col items-center text-center gap-2">
            <Users size={28} className="text-emerald-500 mb-2 opacity-50" />
            <h4 className="text-4xl font-black text-white">300+</h4>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-300/60">Active Users</p>
          </div>
          <div className="flex flex-col items-center text-center gap-2">
            <Clock size={28} className="text-emerald-500 mb-2 opacity-50" />
            <h4 className="text-4xl font-black text-white">7400+</h4>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-300/60">Saved Hours</p>
          </div>
        </div>

        {/* --- FEATURES SECTION --- */}
        <div className="mb-24">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-4 leading-relaxed">
              Don't miss out on this incredible opportunity to supercharge your team! To take advantage of this offer and sign up for a subscription, simply click add to cart above.
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Feature 1 */}
            <div className="bg-[#0A1025]/60 border border-blue-900/40 p-8 rounded-3xl hover:border-emerald-500/30 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-blue-950/50 border border-blue-800/50 flex items-center justify-center mb-6 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 transition-colors">
                <BarChart2 size={28} className="text-blue-300 group-hover:text-emerald-400 transition-colors" />
              </div>
              <h4 className="text-xl font-bold text-white mb-4">Designed to Excel</h4>
              <p className="text-blue-200/70 leading-relaxed text-sm">
                Our tools are designed with your convenience in mind. We understand that not everyone on your team may be a tekla wizard, so we've ensured that our tools are backed up with video tutorials and help file to make it user-friendly. Whether you're a seasoned pro or a newbie, you can harness the power of automation without a steep learning curve.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#0A1025]/60 border border-blue-900/40 p-8 rounded-3xl hover:border-emerald-500/30 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-blue-950/50 border border-blue-800/50 flex items-center justify-center mb-6 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 transition-colors">
                <DollarSign size={28} className="text-blue-300 group-hover:text-emerald-400 transition-colors" />
              </div>
              <h4 className="text-xl font-bold text-white mb-4">Unbeatable Price</h4>
              <p className="text-blue-200/70 leading-relaxed text-sm">
                We understand the importance of affordability, and that's why we're offering these game-changing tools at an unbeatable low price — just 0.80 cents monthly cost for each tool. Plus, the more licenses you need, the greater your discounts. Save big on your automation journey and watch your productivity soar.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#0A1025]/60 border border-blue-900/40 p-8 rounded-3xl hover:border-emerald-500/30 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-blue-950/50 border border-blue-800/50 flex items-center justify-center mb-6 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 transition-colors">
                <TrendingUp size={28} className="text-blue-300 group-hover:text-emerald-400 transition-colors" />
              </div>
              <h4 className="text-xl font-bold text-white mb-4">Stay Ahead</h4>
              <p className="text-blue-200/70 leading-relaxed text-sm">
                When you sign up for a subscription, you'll gain access to all our future tools and updates at no extra cost. That's right, you'll always have the latest and greatest automation tools in your toolkit, ensuring your business remains competitive and efficient.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#0A1025]/60 border border-blue-900/40 p-8 rounded-3xl hover:border-emerald-500/30 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-blue-950/50 border border-blue-800/50 flex items-center justify-center mb-6 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 transition-colors">
                <Headset size={28} className="text-blue-300 group-hover:text-emerald-400 transition-colors" />
              </div>
              <h4 className="text-xl font-bold text-white mb-4">Support</h4>
              <p className="text-blue-200/70 leading-relaxed text-sm">
                Our dedicated support team is here to assist you whenever you need it. We take pride in providing top-notch customer service, ensuring that you have a smooth and hassle-free experience with our automation tools. Your success is our success, and we're here to help you every step of the way.
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* Video Modal Overlay */}
      {activeVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617]/90 backdrop-blur-md p-4 sm:p-6 transition-opacity duration-300">
          <div className="absolute inset-0" onClick={() => setActiveVideo(null)}></div>
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl shadow-[0_20px_50px_-10px_rgba(16,185,129,0.3)] border border-emerald-500/30 overflow-hidden animate-in zoom-in-95 duration-300 z-10">
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute top-4 right-4 z-20 p-2 bg-[#0A1025]/80 hover:bg-emerald-600 text-white rounded-full transition-colors duration-300 border border-emerald-800/50 hover:border-emerald-400 backdrop-blur-sm group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <iframe
              src={getEmbedUrl(activeVideo)}
              title="YouTube video player"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

    </div>
  );
}