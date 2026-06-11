"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "@/components/CheckoutForm";
import { useCart } from "@/app/CartContext";
import {
  ShieldCheck,
  Lock,
  ChevronLeft,
  Package,
  Zap,
  Tag,
  Loader2,
} from "lucide-react";

// Initialize Stripe outside of the component render cycle
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
);

export default function CheckoutPage() {
  const { cart, isMounted } = useCart();
  const [clientSecret, setClientSecret] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Promo Code State
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [activePromo, setActivePromo] = useState(null);
  const [promoMessage, setPromoMessage] = useState({ type: "", text: "" });
  const [isPromoLoading, setIsPromoLoading] = useState(false);

  // 1. Calculate Base Subtotal
  const subtotal = cart.reduce(
    (total, item) => total + (item.price || 0) * (item.quantity || 1),
    0,
  );

  // 2. Calculate Final Total (BULLETPROOF MATH)
  let finalTotal = subtotal;

  if (activePromo) {
    const percentOff = Number(activePromo.percent_off);
    const amountOff = Number(activePromo.amount_off);

    if (!isNaN(percentOff) && percentOff > 0) {
      finalTotal = subtotal * (1 - percentOff / 100);
    } else if (!isNaN(amountOff) && amountOff > 0) {
      finalTotal = Math.max(0, subtotal - amountOff / 100);
    }
  }

  // 3. Convert to Cents for Stripe
  const amountInCents = Math.round(finalTotal * 100);

  // 4. Fetch Payment Intent when amount changes
  // 4. Fetch Payment Intent when amount changes
  useEffect(() => {
    if (amountInCents > 0) {
      // Clear old secret to show skeleton while fetching new price
      setClientSecret("");

      fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountInCents, cart: cart }), // <-- Cart added here!
      })
        .then((res) => res.json())
        .then((data) => setClientSecret(data.clientSecret))
        .catch((err) => console.error("Failed to initialize checkout:", err));
    }
  }, [amountInCents, cart]); // <-- Added cart to dependency array to prevent stale data

  const handleApplyPromo = async () => {
    const code = promoCodeInput.trim().toUpperCase();
    if (!code) return;

    setIsPromoLoading(true);
    setPromoMessage({ type: "", text: "" });

    try {
      const response = await fetch("/api/validate-promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      // DEBUG LOG: Remove this in production once you confirm it works!
      console.log("Stripe Promo Data Received:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to validate code");
      }

      // Apply valid code
      setActivePromo(data);
      setPromoMessage({
        type: "success",
        text: "Discount applied successfully!",
      });
      setPromoCodeInput("");
    } catch (error) {
      setActivePromo(null);
      setPromoMessage({ type: "error", text: error.message });
    } finally {
      setIsPromoLoading(false);
    }
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
        <h2 className="text-2xl font-bold text-white mb-4">
          Your cart is empty
        </h2>
        <Link
          href="/cart"
          className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2 transition-colors"
        >
          <ChevronLeft size={20} /> Return to Cart
        </Link>
      </div>
    );
  }

  return (
    <div className="relative z-10 mx-auto max-w-[1200px] px-6 pt-32 pb-24 min-h-screen">
      <div className="flex flex-col mb-10 animate-in fade-in slide-in-from-left-4 duration-500">
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-sm font-bold text-blue-400/70 hover:text-cyan-400 transition-colors mb-6 w-fit"
        >
          <ChevronLeft size={16} /> Return to Cart
        </Link>
        <div className="flex items-center gap-4">
          <div className="h-10 w-2 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-full"></div>
          <h1 className="text-4xl font-black tracking-tight text-white drop-shadow-md">
            SECURE <span className="text-cyan-400 font-light">CHECKOUT</span>
          </h1>
        </div>
      </div>

      <div className="flex flex-col-reverse lg:flex-row gap-12 items-start">
        {/* Left Column: Payment Form */}
        <div className="w-full lg:flex-1">
          <div className="bg-[#0A1025]/80 border border-blue-900/40 rounded-3xl p-8 backdrop-blur-xl shadow-[0_0_40px_rgba(34,211,238,0.05)]">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <Lock className="text-cyan-400" size={20} /> Payment Details
            </h2>

            {amountInCents === 0 ? (
              // STRIPE BYPASS: 100% Off Scenario
              <div>
                <div className="space-y-4 mb-8">
                  <div>
                    <label className="block text-xs font-bold text-blue-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="IBim Consulting"
                      className="w-full bg-[#020617] border border-blue-900/50 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-blue-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="info@ibimconsulting.com"
                      className="w-full bg-[#020617] border border-blue-900/50 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                  </div>
                </div>
                <div className="text-center py-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl animate-in fade-in zoom-in-95">
                  <h3 className="text-emerald-400 font-bold text-xl mb-2">
                    Your order is free!
                  </h3>
                  <p className="text-blue-200/60 mb-6 text-sm">
                    No credit card required.
                  </p>

                  <button
                    onClick={async () => {
                      const payload = {
                        cart: cart,
                        customer: { name, email },
                      };
                      const response = await fetch("/api/email", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                      });
                      const data = await response.json();
                      if (data.success) {
                        window.location.href = "/checkout/success";
                      } else {
                        alert("Something went wrong. Please try again.");
                      }
                    }}
                    className="bg-emerald-500 hover:bg-emerald-400 text-white font-black uppercase tracking-widest py-4 px-8 rounded-2xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                  >
                    Complete Free Order
                  </button>
                </div>
              </div>
            ) : clientSecret ? (
              // STANDARD STRIPE CHECKOUT
              <Elements
                key={clientSecret}
                options={{ clientSecret, appearance }}
                stripe={stripePromise}
              >
                <CheckoutForm amount={amountInCents} />
              </Elements>
            ) : (
              // LOADING SKELETON
              <div className="animate-pulse space-y-6 py-4">
                <div className="h-12 bg-blue-900/20 rounded-xl w-full border border-blue-800/30"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-blue-900/20 rounded w-1/4"></div>
                  <div className="h-12 bg-blue-900/20 rounded-xl w-full border border-blue-800/30"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-12 bg-blue-900/20 rounded-xl border border-blue-800/30"></div>
                    <div className="h-12 bg-blue-900/20 rounded-xl border border-blue-800/30"></div>
                  </div>
                </div>
                <div className="h-14 bg-blue-600/20 rounded-2xl w-full mt-6"></div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-blue-900/30 flex flex-col sm:flex-row items-center gap-4 text-xs text-blue-300/50 justify-center text-center">
              <span className="flex items-center gap-1.5">
                <Lock size={14} /> 256-bit SSL Encryption
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} /> Guaranteed Safe & Secure Checkout
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary Details */}
        <div className="w-full lg:w-[450px] shrink-0 lg:sticky lg:top-32">
          <div className="bg-[#0A1025]/60 border border-blue-900/30 rounded-3xl p-8 backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <Zap className="text-cyan-400" size={20} /> Order Summary
            </h2>

            {/* Scrollable Item List */}
            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-800 scrollbar-track-transparent">
              {cart.map((item, index) => {
                const itemQuantity = item.quantity || 1;
                return (
                  <div
                    key={`${item.id}-${index}`}
                    className="flex gap-4 p-3 rounded-2xl bg-[#020617]/50 border border-blue-900/20"
                  >
                    <div className="w-16 h-16 rounded-xl bg-[#020617] overflow-hidden border border-blue-800/30 shrink-0 flex items-center justify-center">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover opacity-90"
                        />
                      ) : (
                        <Package className="text-blue-500/40" size={24} />
                      )}
                    </div>
                    <div className="flex-1 py-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-sm font-bold text-white leading-tight line-clamp-2">
                          {item.name}
                        </h4>
                        <span className="text-sm font-bold text-cyan-400">
                          AU${(item.price * itemQuantity).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-blue-300/60 uppercase tracking-wider font-bold text-[10px]">
                          {item.package || "One-Time"}
                        </span>
                        <span className="text-blue-400/50">
                          Qty: {itemQuantity}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
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
                    onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                    className="w-full bg-[#020617] border border-blue-900/50 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-blue-400/30 focus:outline-none focus:border-cyan-400 transition-colors uppercase"
                  />
                </div>
                <button
                  onClick={handleApplyPromo}
                  disabled={
                    !promoCodeInput.trim() ||
                    isPromoLoading ||
                    (!clientSecret && amountInCents > 0)
                  }
                  className="px-5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center min-w-[80px]"
                >
                  {isPromoLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    "Apply"
                  )}
                </button>
              </div>

              {promoMessage.text && (
                <p
                  className={`text-xs mt-3 font-medium ${promoMessage.type === "error" ? "text-red-400" : "text-emerald-400"}`}
                >
                  {promoMessage.text}
                </p>
              )}
            </div>

            {/* Totals */}
            <div className="space-y-4 pt-6 border-t border-blue-900/50 text-sm">
              <div className="flex justify-between items-center text-blue-200/60">
                <span>Subtotal</span>
                <span className="text-white font-medium">
                  AU${subtotal.toFixed(2)}
                </span>
              </div>

              {activePromo && (
                <div className="flex justify-between items-center text-emerald-400 bg-emerald-400/5 p-3 rounded-xl border border-emerald-400/10 animate-in fade-in zoom-in-95">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">
                      Discount ({activePromo.code})
                    </span>
                    <button
                      onClick={removePromo}
                      className="text-emerald-400/50 hover:text-red-400 text-xs underline transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                  <span className="font-bold">
                    -AU${(subtotal - finalTotal).toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center text-blue-200/60">
                <span>Taxes</span>
                <span className="text-white font-medium">
                  Calculated at next step
                </span>
              </div>
            </div>

            <div className="flex justify-between items-end mt-6 pt-6 border-t border-blue-900/50">
              <span className="text-lg font-bold text-blue-100">Total</span>
              <div className="text-right">
                <span className="text-xs text-blue-400/50 block mb-1">AUD</span>
                <span className="text-3xl font-black text-white drop-shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                  AU${finalTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
