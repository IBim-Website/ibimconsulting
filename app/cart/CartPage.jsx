"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, ArrowLeft, ArrowRight, ShoppingCart, ShieldCheck, Zap, Loader2, ExternalLink, Package, LayoutGrid, Plus, Minus, AlertTriangle } from 'lucide-react';
import { useCart } from '@/app/CartContext'; 

export default function CartPage() {
  const { cart, removeFromCart, updateCartItem, isMounted } = useCart();
  const router = useRouter();
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [activeItemId, setActiveItemId] = useState(null);

  if (!isMounted) return null;

  // Calculate subtotal considering item quantities
  const subtotal = cart.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 1)), 0);

  // STRIPE CONFLICT DETECTION
  const hasMonthly = cart.some(item => item.package?.toLowerCase() === 'monthly');
  const hasAnnual = cart.some(item => item.package?.toLowerCase() === 'annual');
  const hasMixedSubscriptionConflict = hasMonthly && hasAnnual;

  const handleCheckout = () => {
    // Double check just in case
    if (hasMixedSubscriptionConflict) return; 

    setIsCheckoutLoading(true);
    
    // Redirect to the custom internal checkout page
    // The checkout page will read the subtotal and items directly from useCart()
    router.push('/checkout');
  };

  const handleQuantityChange = (id, delta) => {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    
    const newQuantity = Math.max(1, (item.quantity || 1) + delta);
    updateCartItem(id, { quantity: newQuantity });
  };

  const handlePackageChange = (id, newPackage) => {
    const item = cart.find(i => i.id === id);
    if (!item || !item.pricingOptions) return;

    let newPrice = item.price; 
    
    // Read directly from the pricingOptions we passed during addToCart
    if (newPackage === 'Monthly' && item.pricingOptions.monthly) newPrice = item.pricingOptions.monthly;
    if (newPackage === 'Annual' && item.pricingOptions.annual) newPrice = item.pricingOptions.annual;
    if (newPackage === 'One-Time' && item.pricingOptions.oneTime) newPrice = item.pricingOptions.oneTime;
    if (newPackage === 'Floating' && item.pricingOptions.floating) newPrice = item.pricingOptions.floating;

    updateCartItem(id, { package: newPackage, price: newPrice });
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
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <Link href="/tools">
              <button className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)]">
                <LayoutGrid size={18} /> Shop Tools
              </button>
            </Link>
            <Link href="/packages">
              <button className="flex items-center gap-2 rounded-xl bg-[#1e293b] hover:bg-[#334155] border border-blue-500/30 text-white px-8 py-3 font-bold transition-all">
                <Package size={18} /> Shop Packages
              </button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          <div className="w-full lg:flex-1 space-y-4">
            {cart.map((item, index) => {
              const uniqueKey = `${item.id}-${index}`;
              const isPackage = !!item.products; 
              const isActive = activeItemId === uniqueKey;
              const categoryLabel = isPackage ? (item.groupType || "Bundle") : (Array.isArray(item.category) ? item.category[0] : item.category);
              
              const itemQuantity = item.quantity || 1;
              const prices = item.pricingOptions || {}; 

              // Highlight conflicting items slightly if there is a conflict
              const isConflictingItem = hasMixedSubscriptionConflict && (item.package === 'Monthly' || item.package === 'Annual');

              return (
                <div 
                  key={uniqueKey}
                  onClick={() => setActiveItemId(isActive ? null : uniqueKey)}
                  className={`group relative flex flex-col bg-[#0A1025]/60 border rounded-3xl p-6 cursor-pointer transition-all duration-300 ${
                    isActive 
                    ? 'border-cyan-500/50 bg-[#0c1328] shadow-[0_0_40px_rgba(34,211,238,0.1)]' 
                    : isConflictingItem 
                      ? 'border-amber-500/40 hover:border-amber-500/70 shadow-[0_0_20px_rgba(245,158,11,0.05)]' 
                      : 'border-blue-900/40 hover:border-blue-700/50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="w-full sm:w-32 aspect-square shrink-0 rounded-2xl bg-[#020617] overflow-hidden border border-blue-800/30 flex items-center justify-center">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-90" />
                      ) : (
                        <div className="flex flex-col items-center text-blue-500/40">
                          <Package size={40} />
                          <span className="text-[8px] uppercase font-bold mt-1">Package</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-wrap gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 bg-cyan-400/10 px-2.5 py-1 rounded border border-cyan-400/20">
                            {categoryLabel}
                          </span>
                          {isPackage && (
                            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded border border-emerald-400/20">
                              {item.products.length} Tools Included
                            </span>
                          )}
                          {/* Add a tiny warning badge to the item if it's causing a conflict */}
                          {isConflictingItem && (
                            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded border border-amber-400/20 flex items-center gap-1">
                              <AlertTriangle size={10} /> Conflicting Plan
                            </span>
                          )}
                        </div>
                        <p className="text-2xl font-black text-white">${(item.price * itemQuantity).toFixed(2)}</p>
                      </div>

                      <div className="mt-3 flex justify-between items-end">
                        <div>
                          <h3 className={`text-xl font-bold transition-colors ${isActive ? 'text-cyan-300' : 'text-white'}`}>
                            {item.name}
                          </h3>
                          {isPackage && (
                             <p className="text-xs text-blue-300/50 mt-1 line-clamp-1">
                               Includes: {item.products.map(p => p.name || p).join(', ')}
                             </p>
                          )}
                        </div>

                        {/* Controls: Quantity & Type Selection */}
                        <div className="flex gap-4 items-center" onClick={(e) => e.stopPropagation()}>
                          
                          {/* Package Type Dropdown */}
                          <select 
                            value={item.package || 'One-Time'}
                            onChange={(e) => handlePackageChange(item.id, e.target.value)}
                            className={`bg-[#020617] text-white text-xs border rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500 transition-colors ${
                              isConflictingItem ? 'border-amber-500/50 text-amber-100' : 'border-blue-900/50'
                            }`}
                          >
                            {prices.monthly && <option value="Monthly">Monthly</option>}
                            {prices.annual && <option value="Annual">Annual</option>}
                            {prices.oneTime && <option value="One-Time">One-Time</option>}
                            {prices.floating && <option value="Floating">Floating</option>}
                          </select>

                          {/* Quantity Selector */}
                          <div className="flex items-center gap-2 bg-[#020617] border border-blue-900/50 rounded-lg px-2 py-1">
                            <button onClick={() => handleQuantityChange(item.id, -1)} className="text-blue-400 hover:text-cyan-400 disabled:opacity-50">
                              <Minus size={14} />
                            </button>
                            <span className="text-xs font-bold text-white w-4 text-center">{itemQuantity}</span>
                            <button onClick={() => handleQuantityChange(item.id, 1)} className="text-blue-400 hover:text-cyan-400">
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>

                      </div>

                      <div className={`mt-4 pt-4 border-t border-blue-900/30 flex items-center transition-all duration-300 ${
                        isActive ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0 overflow-hidden pointer-events-none'
                      } ${!isPackage ? 'justify-between' : 'justify-end'}`}>
                        
                        {!isPackage && (
                          <Link 
                            href={`/tools/${item.slug}`} 
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-2 text-sm font-bold text-blue-400 hover:text-cyan-400 transition-colors"
                          >
                            <ExternalLink size={16} />
                            View Details
                          </Link>
                        )}

                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromCart(item.id);
                          }}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/20 text-xs font-bold"
                        >
                          <Trash2 size={16} />
                          Remove Item
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="pt-6 flex flex-wrap gap-6 items-center border-t border-blue-900/20">
              <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-bold text-cyan-400/70 hover:text-cyan-400 transition-all group">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Shop More Tools
              </Link>
              <div className="h-4 w-[1px] bg-blue-900/40 hidden sm:block"></div>
              <Link href="/packages" className="inline-flex items-center gap-2 text-sm font-bold text-blue-400/70 hover:text-blue-400 transition-all group">
                <Package size={16} />
                Explore Packages
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
                  <span>Subtotal ({cart.reduce((total, item) => total + (item.quantity || 1), 0)} items)</span>
                  <span className="text-white font-medium">${subtotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Warning Box for Mixed Subscriptions */}
              {hasMixedSubscriptionConflict && (
                <div className="mb-8 p-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3 animate-in fade-in zoom-in-95 duration-300">
                  <AlertTriangle className="text-amber-400 shrink-0 mt-0.5" size={20} />
                  <div className="text-sm">
                    <p className="text-amber-400 font-bold mb-1">Action Required</p>
                    <p className="text-amber-200/80 leading-relaxed">
                      You cannot mix Monthly and Annual subscriptions in the same order. Please align them to the same billing cycle or purchase them separately to proceed.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-end mb-10">
                <span className="text-lg font-bold text-blue-100">Total</span>
                <span className="text-4xl font-black text-white drop-shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={isCheckoutLoading || hasMixedSubscriptionConflict}
                className={`w-full flex items-center justify-center gap-3 rounded-2xl px-8 py-5 text-sm font-black uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(34,211,238,0.2)] 
                  ${hasMixedSubscriptionConflict 
                    ? 'bg-blue-900/30 text-blue-500/40 cursor-not-allowed shadow-none' 
                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white disabled:opacity-50'
                  }`}
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