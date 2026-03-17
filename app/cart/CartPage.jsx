"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Trash2, ArrowLeft, ArrowRight, ShoppingCart, ShieldCheck, Zap, Loader2, ExternalLink } from 'lucide-react';
import { useCart } from '@/app/CartContext'; 

export default function CartPage() {
  const { cart, removeFromCart, isMounted } = useCart();
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  
  const [activeItemId, setActiveItemId] = useState(null);

  if (!isMounted) return null;

  const subtotal = cart.reduce((total, item) => total + (item.price || 0), 0);

  const handleCheckout = async () => {
    setIsCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart }),
      });
      const data = await response.json();
      if (data.url) window.location.href = data.url;
    } catch (error) {
      setCheckoutError(error.message);
      setIsCheckoutLoading(false);
    }
  };

  return (
    <div className="relative z-10 mx-auto max-w-[1200px] px-6 pt-32 pb-24 min-h-screen">
      
      <div className="flex items-center gap-4 mb-10 animate-in fade-in slide-in-from-left-4 duration-500">
        <div className="h-10 w-2 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-full"></div>
        <h1 className="text-4xl font-black tracking-tight text-white drop-shadow-md">
          YOUR <span className="text-cyan-400 font-light">CART</span>
        </h1>
      </div>

      {cart.length === 0 ? (
        <div className="bg-[#0A1025]/60 border border-blue-900/30 rounded-3xl p-16 flex flex-col items-center justify-center backdrop-blur-xl">
          <ShoppingCart size={40} className="text-cyan-400/50 mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2">Your cart is empty</h2>
          <Link href="/tools">
            <button className="flex items-center gap-2 rounded-xl bg-blue-600 text-white px-8 py-3 font-bold mt-4 shadow-[0_0_20px_rgba(37,99,235,0.2)]">
              <ArrowLeft size={18} /> Browse Tools
            </button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          <div className="w-full lg:flex-1 space-y-4">
            {cart.map((item, index) => {
              const uniqueKey = `${item.id}-${index}`;
              const isActive = activeItemId === uniqueKey;
              
              return (
                <div 
                  key={uniqueKey}
                  onClick={() => setActiveItemId(isActive ? null : uniqueKey)}
                  className={`group relative flex flex-col bg-[#0A1025]/60 border rounded-3xl p-6 cursor-pointer transition-all duration-300 ${
                    isActive ? 'border-cyan-500/50 bg-[#0c1328] shadow-[0_0_40px_rgba(34,211,238,0.1)]' : 'border-blue-900/40 hover:border-blue-700/50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="w-full sm:w-32 aspect-square shrink-0 rounded-2xl bg-[#020617] overflow-hidden border border-blue-800/30">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-90" />
                    </div>

                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 bg-cyan-400/10 px-2.5 py-1 rounded border border-cyan-400/20">
                            {Array.isArray(item.category) ? item.category[0] : item.category}
                          </span>
                          {/* FIXED: Dynamic plan tag */}
                          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded border border-amber-400/20">
                            {item.package || item.package || "One-Time"}
                          </span>
                        </div>
                        <p className="text-2xl font-black text-white">${item.price.toFixed(2)}</p>
                      </div>

                      <div className="mt-3">
                        <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {item.name}
                        </h3>
                      </div>

                      <div className={`mt-4 pt-4 border-t border-blue-900/30 flex items-center justify-between transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                        <Link href={`/tools/${item.slug}`} className="flex items-center gap-2 text-sm font-bold text-blue-400 hover:text-cyan-400 transition-colors">
                          <ExternalLink size={16} />
                          View Product Details
                        </Link>

                        {/* MINIMAL: Icon-only remove button */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromCart(item.id);
                          }}
                          className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/20"
                          title="Remove from cart"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="pt-4">
              <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-bold text-cyan-400/70 hover:text-cyan-400 transition-all group">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Continue Shopping
              </Link>
            </div>
          </div>

          <div className="w-full lg:w-[400px] shrink-0 lg:sticky lg:top-32">
            <div className="bg-[#0A1025]/80 border border-blue-800/40 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                <Zap className="text-cyan-400" size={20} /> Order Summary
              </h2>

              <div className="space-y-4 mb-8 border-b border-blue-900/50 pb-8 text-sm text-blue-200/60">
                <div className="flex justify-between items-center">
                  <span>Subtotal ({cart.length} items)</span>
                  <span className="text-white font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Taxes</span>
                  <span className="text-white font-medium">Calculated at checkout</span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-10">
                <span className="text-lg font-bold text-blue-100">Total</span>
                <span className="text-4xl font-black text-white drop-shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={isCheckoutLoading}
                className="w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-8 py-5 text-sm font-black uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(34,211,238,0.2)] disabled:opacity-50"
              >
                {isCheckoutLoading ? <Loader2 size={20} className="animate-spin" /> : <>Proceed to Checkout <ArrowRight size={20} /></>}
              </button>

              <div className="mt-8 flex items-start gap-3 text-[11px] text-blue-300/30 bg-blue-950/20 p-5 rounded-2xl border border-blue-900/30 leading-relaxed">
                <ShieldCheck size={20} className="text-cyan-400/50 shrink-0" />
                <p>Secure checkout processed by Stripe. Digital assets will be delivered instantly after purchase.</p>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}