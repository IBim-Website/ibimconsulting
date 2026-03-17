"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Trash2, ArrowLeft, ArrowRight, ShoppingCart, ShieldCheck, Zap, Loader2 } from 'lucide-react';
import { useCart } from '@/app/CartContext'; // Adjust this import path

export default function CartPage() {
  const { cart, removeFromCart, isMounted } = useCart();
  
  // NEW: State for checkout loading
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);

  if (!isMounted) return null;

  const subtotal = cart.reduce((total, item) => total + (item.price || 0), 0);

  // NEW: Handle the checkout process
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

      if (!response.ok) throw new Error(data.message || 'Failed to initialize checkout');

      // Redirect the user to the Stripe hosted secure checkout page
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
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
        /* --- EMPTY CART STATE --- */
        <div className="bg-[#0A1025]/60 border border-blue-900/30 rounded-3xl p-16 flex flex-col items-center justify-center backdrop-blur-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] animate-in fade-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-blue-950/50 rounded-full flex items-center justify-center mb-6 border border-blue-800/50 shadow-[0_0_30px_rgba(34,211,238,0.1)]">
            <ShoppingCart size={40} className="text-cyan-400/50" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Your cart is empty</h2>
          <p className="text-blue-200/60 mb-8 max-w-md text-center">
            Looks like you haven't added any automation tools or plugins to your cart yet.
          </p>
          <Link href="/tools">
            <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-cyan-600 text-white px-8 py-3.5 font-bold transition-all duration-300 active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] border border-blue-400/20 group">
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Browse Tools
            </button>
          </Link>
        </div>
      ) : (
        /* --- FILLED CART STATE --- */
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          
          <div className="w-full lg:flex-1 space-y-4">
            {cart.map((item, index) => (
              <div 
                key={`${item.id}-${index}`}
                style={{ animationDelay: `${index * 100}ms` }}
                className="group flex flex-col sm:flex-row items-center gap-6 bg-[#0A1025]/80 border border-blue-900/40 rounded-3xl p-4 backdrop-blur-md shadow-lg hover:border-cyan-500/30 hover:bg-[#0c1328]/90 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
              >
                <div className="w-full sm:w-32 aspect-video sm:aspect-square shrink-0 rounded-2xl bg-[#020617] overflow-hidden border border-blue-800/30 relative">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/80 to-transparent sm:hidden"></div>
                </div>

                <div className="flex-1 w-full flex flex-col justify-center">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20">
                          {Array.isArray(item.category) ? item.category[0] : item.category}
                        </span>
                        {item.package !== "None" && (
                          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                            {Array.isArray(item.package) ? item.package[0] : item.package}
                          </span>
                        )}
                      </div>
                      <Link href={`/tools/${item.slug}`}>
                        <h3 className="text-xl font-bold text-white hover:text-cyan-300 transition-colors line-clamp-2">
                          {item.name}
                        </h3>
                      </Link>
                    </div>
                    
                    <div className="hidden sm:block text-right">
                      <p className="text-xl font-black text-white">${item.price.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-blue-900/30">
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      disabled={isCheckoutLoading}
                      className="flex items-center gap-1.5 text-sm font-medium text-red-400/70 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={16} />
                      <span>Remove</span>
                    </button>
                    
                    <div className="sm:hidden text-right">
                      <p className="text-xl font-black text-white">${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-6">
              <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-bold text-cyan-400 hover:text-cyan-300 transition-colors group">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Continue Shopping
              </Link>
            </div>
          </div>

          <div className="w-full lg:w-[400px] shrink-0 lg:sticky lg:top-32 animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="bg-gradient-to-b from-[#0A1025] to-[#020617] border border-blue-800/40 rounded-3xl p-8 backdrop-blur-xl shadow-[0_10px_40px_-10px_rgba(34,211,238,0.1)] relative overflow-hidden">
              
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <Zap className="text-cyan-400" size={20} /> Order Summary
              </h2>

              <div className="space-y-4 mb-6 border-b border-blue-900/50 pb-6 text-sm">
                <div className="flex justify-between items-center text-blue-200/80">
                  <span>Subtotal ({cart.length} items)</span>
                  <span className="font-medium text-white">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-blue-200/80">
                  <span>Taxes</span>
                  <span className="font-medium text-white">Calculated at checkout</span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-8">
                <span className="text-base font-bold text-blue-100">Total</span>
                <span className="text-3xl font-black text-white drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              {checkoutError && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                  {checkoutError}
                </div>
              )}

              {/* UPDATED CHECKOUT BUTTON */}
              <button 
                onClick={handleCheckout}
                disabled={isCheckoutLoading}
                className="w-full relative flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-8 py-4 text-base font-black uppercase tracking-wider transition-all duration-300 active:scale-95 shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] disabled:opacity-80 disabled:cursor-wait disabled:active:scale-100 disabled:hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] group overflow-hidden"
              >
                {/* Optional pulse overlay for loading state */}
                {isCheckoutLoading && (
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                )}
                
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isCheckoutLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Securing payment link...
                    </>
                  ) : (
                    <>
                      Proceed to Checkout
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </button>

              <div className="mt-6 flex items-start gap-3 text-xs text-blue-300/50 bg-blue-950/30 p-4 rounded-xl border border-blue-900/30">
                <ShieldCheck size={20} className="text-cyan-400/70 shrink-0" />
                <p>
                  Secure checkout processed by Stripe. Digital assets and software licenses will be emailed immediately after purchase.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}