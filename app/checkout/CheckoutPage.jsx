"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "@/components/CheckoutForm";
import { useCart } from "@/app/CartContext";
import { ShieldCheck, Lock, ChevronLeft, Package, Zap, Tag } from "lucide-react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

export default function CheckoutPage() {
  const { cart, isMounted } = useCart();
  const [clientSecret, setClientSecret] = useState("");
  
  // Promo Code State
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [activePromo, setActivePromo] = useState(null);
  const [promoMessage, setPromoMessage] = useState({ type: "", text: "" });

  // 1. Calculate Base Subtotal
  const subtotal = cart.reduce(
    (total, item) => total + (item.price || 0) * (item.quantity || 1),
    0
  );

  // 2. Calculate Final Total based on active promo
  let finalTotal = subtotal;
  if (activePromo) {
    if (activePromo.type === "percentage") {
      finalTotal = subtotal * (1 - activePromo.value);
    } else if (activePromo.type === "fixed") {
      finalTotal = Math.max(0, subtotal - activePromo.value);
    }
  }

  // 3. Convert to Cents for Stripe
  const amountInCents = Math.round(finalTotal * 100);

  // Re-fetch Payment Intent whenever the final amount changes
  useEffect(() => {
    if (amountInCents > 0) {
      // Clear old secret to show skeleton while fetching new price
      setClientSecret(""); 
      
      fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountInCents }),
      })
        .then((res) => res.json())
        .then((data) => setClientSecret(data.clientSecret))
        .catch((err) => console.error("Failed to initialize checkout:", err));
    }
  }, [amountInCents]);

  const handleApplyPromo = () => {
    const code = promoCodeInput.trim().toUpperCase();
    
    // MOCK PROMO LOGIC: In a real app, you would fetch this from your database
    if (code === "SAVE20") {
      setActivePromo({ code: "SAVE20", type: "percentage", value: 0.20 }); // 20% off
      setPromoMessage({ type: "success", text: "20% discount applied!" });
    } else if (code === "MINUS5") {
      setActivePromo({ code: "MINUS5", type: "fixed", value: 5.00 }); // $5 off
      setPromoMessage({ type: "success", text: "$5 discount applied!" });
    } else {
      setActivePromo(null);
      setPromoMessage({ type: "error", text: "Invalid or expired promo code." });
    }
    setPromoCodeInput("");
  };

  const removePromo = () => {
    setActivePromo(null);
    setPromoMessage({ type: "", text: "" });
  };

  if (!isMounted) return null;

  const appearance = {
    theme: "night",
    variables: {
      colorPrimary: "#22d3ee",
      colorBackground: "#020617",
      colorText: "#ffffff",
      colorDanger: "#ef4444",
      fontFamily: "ui-sans-serif, system-ui, sans-serif",
      borderRadius: "12px",
      colorTextPlaceholder: "#475569",
    },
    rules: {
      ".Input": {
        border: "1px solid rgba(30, 58, 138, 0.5)",
        boxShadow: "none",
      },
      ".Input:focus": {
        border: "1px solid #22d3ee",
        boxShadow: "0 0 10px rgba(34, 211, 238, 0.2)",
      },
    },
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Your cart is empty</h2>
        <Link href="/cart" className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2">
          <ChevronLeft size={20} /> Return to Cart
        </Link>
      </div>
    );
  }

  return (
    <div className="relative z-10 mx-auto max-w-[1200px] px-6 pt-32 pb-24 min-h-screen">
      <div className="flex flex-col mb-10">
        <Link href="/cart" className="inline-flex items-center gap-2 text-sm font-bold text-blue-400/70 hover:text-cyan-400 transition-colors mb-6 w-fit">
          <ChevronLeft size={16} /> Return to Cart
        </Link>
        <div className="flex items-center gap-4">
          <div className="h-10 w-2 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-full"></div>
          <h1 className="text-4xl font-black tracking-tight text-white">
            SECURE <span className="text-cyan-400 font-light">CHECKOUT</span>
          </h1>
        </div>
      </div>

      <div className="flex flex-col-reverse lg:flex-row gap-12 items-start">
        {/* Left Column: Payment Form */}
        <div className="w-full lg:flex-1">
          <div className="bg-[#0A1025]/80 border border-blue-900/40 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <Lock className="text-cyan-400" size={20} /> Payment Details
            </h2>

            {clientSecret ? (
              // The `key` prop forces Elements to remount if the price/secret changes
              <Elements key={clientSecret} options={{ clientSecret, appearance }} stripe={stripePromise}>
                <CheckoutForm amount={amountInCents} />
              </Elements>
            ) : (
              <div className="animate-pulse space-y-6 py-4">
                <div className="h-16 bg-blue-900/20 rounded-xl w-full"></div>
                <div className="h-48 bg-blue-900/20 rounded-xl w-full"></div>
                <div className="h-14 bg-blue-600/20 rounded-2xl w-full mt-6"></div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary Details */}
        <div className="w-full lg:w-[450px] shrink-0 lg:sticky lg:top-32">
          <div className="bg-[#0A1025]/60 border border-blue-900/30 rounded-3xl p-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <Zap className="text-cyan-400" size={20} /> Order Summary
            </h2>

            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
              {cart.map((item, index) => (
                <div key={`${item.id}-${index}`} className="flex gap-4 p-3 rounded-2xl bg-[#020617]/50 border border-blue-900/20">
                  <div className="w-16 h-16 rounded-xl bg-[#020617] overflow-hidden border border-blue-800/30 shrink-0 flex items-center justify-center">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="text-blue-500/40" size={24} />
                    )}
                  </div>
                  <div className="flex-1 py-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-sm font-bold text-white">{item.name}</h4>
                      <span className="text-sm font-bold text-cyan-400">${((item.price * (item.quantity || 1))).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-blue-400/50">
                      <span className="uppercase tracking-wider font-bold text-[10px]">{item.package || "One-Time"}</span>
                      <span>Qty: {item.quantity || 1}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Code Input */}
            <div className="py-6 border-t border-blue-900/50">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400/50 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Promo code"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    className="w-full bg-[#020617] border border-blue-900/50 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-blue-400/30 focus:outline-none focus:border-cyan-400 transition-colors uppercase"
                  />
                </div>
                <button 
                  onClick={handleApplyPromo}
                  disabled={!promoCodeInput.trim() || !clientSecret} // Disable while loading new price
                  className="px-5 bg-blue-900/30 text-blue-300 hover:bg-blue-800/50 hover:text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                >
                  Apply
                </button>
              </div>
              
              {promoMessage.text && (
                <p className={`text-xs mt-2 font-medium ${promoMessage.type === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>
                  {promoMessage.text}
                </p>
              )}
            </div>

            {/* Totals */}
            <div className="space-y-3 pt-6 border-t border-blue-900/50 text-sm">
              <div className="flex justify-between items-center text-blue-200/60">
                <span>Subtotal</span>
                <span className="text-white">${subtotal.toFixed(2)}</span>
              </div>
              
              {activePromo && (
                <div className="flex justify-between items-center text-emerald-400 bg-emerald-400/5 p-2 rounded-lg border border-emerald-400/10">
                  <div className="flex items-center gap-2">
                    <span>Discount ({activePromo.code})</span>
                    <button onClick={removePromo} className="text-emerald-400/50 hover:text-red-400 text-[10px] underline">Remove</button>
                  </div>
                  <span>-${(subtotal - finalTotal).toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-blue-200/60">
                <span>Taxes</span>
                <span>Calculated next</span>
              </div>
            </div>

            <div className="flex justify-between items-end mt-6 pt-6 border-t border-blue-900/50">
              <span className="text-lg font-bold text-blue-100">Total</span>
              <div className="text-right">
                <span className="text-xs text-blue-400/50 block mb-1">USD</span>
                <span className="text-3xl font-black text-white drop-shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                  ${finalTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}